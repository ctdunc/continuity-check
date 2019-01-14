from flask import Flask, render_template, jsonify, request, url_for
import re
import time
from requests import post
from flask_socketio import SocketIO
from redis import Redis
from itertools import groupby
from celery import Celery
from logic.sql_client import sqlclient
from logic.continuity import perform_check

findint = re.compile('\d')
betweenbrackets = re.compile('\[(.*?)\]')
findhyphen = re.compile('[^-]*')
db = sqlclient('localhost',
        'continuity_check',
        'cdms',
        'cdms',
        'continuity_history',
        'channel_naming',
        'slac_expected_values',
        'metadata')

app = Flask(__name__, static_folder="./view/dist", template_folder="./view")

app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@celery.task(bind=True)
def continuity_check(self,url,tablename,expected_values, channel_naming, dmm_ip=''):
    check = perform_check(expected_values, channel_naming, dmm_ip) 
    number_checks = len(expected_values)
    checks_complete = 0
    for row in perform_check(expected_values, channel_naming, dmm_ip):
        key = row.get('key')
        value = row.get('value')
        n = int(row.get('rownum'))
        checks_complete += n 

        # posts to webpage for live update on check
        post(url,json={'key':key, 'value':value, 'complete':checks_complete/number_checks,'tablename':tablename})
        time.sleep(0.05)

    return 0 


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/continuity-history/<run>",methods=['GET'])
def getRun(run):
    data = db.get_run(run)
    return jsonify(data)

@app.route("/continuity-history",methods=['GET'])
def getHistory():
    data = db.get_history()
    return jsonify(data)


@app.route("/startcheck", methods=['POST'])
def startcheck():
    # get data from form
    channels = request.form.getlist('channels[]')
    signals = request.form.getlist('signals[]')
    tests = request.form.getlist('continuity[]')
    signal_g = lambda x,s: s[x[0]:x[1]]
    signals = [signal_g(findhyphen.search(i).span(),i) for i in signals]
    print(signals)
    #metadata has a nested structure, so I need to do some fancy regex searching to get key-value pairs out of URLEncoded data
    meta_keys = [k for k in request.form.to_dict().keys() if k.startswith('metadata')]
    metadata = {}
    for k in meta_keys:
        sp = betweenbrackets.search(k).span()
        metadata[k[sp[0]+1:sp[1]-1]] = request.form.getlist(k)[0]
    # create table in database, return name of table to pass to worker
    tablename = db.create_run_table(institution=metadata['institution'],
            wiring=metadata['wiring'],
            device=metadata['device'],
            validation_table=metadata['expected'])

    # format Channel Layout
    channelGrouper = lambda c: [c[findint.search(c).span()[0]:],c[:findint.search(c).span()[0]-1]]
    channels = sorted([channelGrouper(c) for c in channels], key=lambda x: x[1])
    channel_tests = []
    for t, num in groupby(channels, lambda x: x[1]):
        channel_tests.append((t, [int(n[0]) for n in num]))
    channels = dict(channel_tests)

    # format Signal Layout
    signalGrouper = lambda c: [c[2], c[0]]
    signal_types = sorted([signalGrouper(s) for s in db.get_channel_layout()],
            key=lambda x: x[1])
    signal_types_dummy = {}
    for t, sig in groupby(signal_types, lambda x: x[1]):
        for s in sig:
            print(s[0],s[1])
            if s[0] in signals:
                signal_types_dummy.setdefault(s[1], []).append(s[0])
    signal_keys = list(filter(lambda k: k in channels.keys(),signal_types_dummy.keys()))
    signal_types = dict([(k,signal_types_dummy[k]) for k in signal_keys])
    # get expected values, format/execute SQL request for expected values
    cont = ''
    if 'connected' in tests:
        cont += '1'
        if 'disconnected' in tests:
            cont+=',0'
    elif 'disconnected' in tests:
        cont='0'

    continuity_command = ' (Expected_Continuity IN ('+cont+'))'
    test_command = ' WHERE ('
    for k in signal_keys:
        c = channels[k]
        cstr = '('+','.join([str(x) for x in c])+')'
        s = signal_types[k]
        for signal in s:
            signal_selector = '((Signal_1 = \"'+signal+'\"  OR (Signal_2 = \"'+signal+'\")) AND (Channel_1 IN '+cstr+' AND Channel_2 IN '+cstr+')) OR'
            matrix_selector = '(Signal_name = \"'+signal+'\" AND Channel IN '+cstr+') OR'
            test_command += signal_selector

    #[:-2] gets rid of the final OR statement on the SQL command
    test_command = test_command[:-2]+') AND ('+continuity_command+')'
    print(test_command)
    expected_values = db.get_expected_value(tests=test_command)
    matrix_values = db.get_channel_naming() 

    task = continuity_check.delay(url_for('checkupdate',_external=True),
            expected_values=expected_values,
            channel_naming=matrix_values,
            tablename=tablename)

    return jsonify(0)

@app.route("/checkupdate/",methods=['POST'])
def checkupdate():
    data = request.json

    key  = data.get('key')
    value = data.get('value')
    tablename = data.get('tablename')
    
    if isinstance(value[0],list):
        for i in value:
            db.insert_run_row(tablename,i)
    else:
        db.insert_run_row(tablename,value)

    socketio.emit('checkUpdate',data)
    return '0'

     
@app.route("/channel-layout", methods=['GET'])
def return_channel_layout():
    n = sorted(db.get_channel_layout(), key=lambda tup: tup[0])
    channel_layout = {}
    for key, group in groupby(n, lambda x: x[0]):
        chan_num = -2 
        siglist = []
        for signal in group: 
            if signal[2] not in siglist:
                siglist.append(signal[2])
            if signal[1] > chan_num:
                chan_num = signal[1]
        channel_layout[key]={'channels':chan_num, 'signals':siglist}
    return jsonify(channel_layout)

@app.route("/allowable-metadata",methods=['GET'])
def return_metadata():
    metadata = db.get_allowable_metadata()
    n = sorted(metadata, key=lambda tup:tup[1])
    result = {}
    for key, elements in groupby(n, lambda n: n[1]):
        result[key] = []
        for e in elements:
            result[key].append(e[0])
    print(result)
    return jsonify(result)

if __name__ == "__main__":
    socketio.run(app,debug=True)
