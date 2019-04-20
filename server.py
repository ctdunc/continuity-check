from flask import Flask, render_template, jsonify, request, url_for
import re
import time
from requests import post
from flask_socketio import SocketIO
from redis import Redis
from itertools import groupby
from functools import reduce
from celery import Celery
from logic.sql_client import sqlclient
from logic.continuity import perform_check

# make regex variables for later use 
findint = re.compile('\d')
betweenbrackets = re.compile('\[(.*?)\]')
findhyphen = re.compile('[^-]*')

# initialize database object
with open('.botconfig') as bc:
    botinfo = bc.readlines()
botinfo = [s.replace("\n","") for s in botinfo]
db = sqlclient(host='localhost',
        db=botinfo[2],
        user=botinfo[0],
        pw=botinfo[1],
        history='run_history',
        data='run_data',
        naming='channel_naming',
        expected='expected_values'
        )

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
        post(
                url,json={
                    'key':key, 
                    'value':value, 
                    'complete':checks_complete/number_checks,
                    'tablename':tablename
                    }
                )
        time.sleep(0.05)
    return 0 


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/continuity-history/<run>",methods=['GET'])
def getRun(run):
    data = db.fetch_run(run)
    return jsonify(data)

@app.route("/continuity-history",methods=['GET'])
def getHistory():
    data = db.fetch_run_history()
    return jsonify(data)


@app.route("/startcheck", methods=['POST'])
def startcheck():
    # get data from form
    channels = request.form.getlist('channels[]')
    signals = request.form.getlist('signals[]')
    tests = request.form.getlist('continuity[]')
    
    # metadata has a nested structure, so I need to do some fancy regex 
    # searching to get key-value pairs out of URLEncoded data
    meta_keys = [k for k in request.form.to_dict().keys() if k.startswith('metadata')]
    metadata = {}
    for k in meta_keys:
        sp = betweenbrackets.search(k).span()
        metadata[k[sp[0]+1:sp[1]-1]] = request.form.getlist(k)[0]


    # format Channel Layout
    channelGrouper = lambda c: [c[findint.search(c).span()[0]:],c[:findint.search(c).span()[0]-1]]
    channels = sorted([channelGrouper(c) for c in channels], key=lambda x: x[1])
    channel_tests = []
    for t, num in groupby(channels, lambda x: x[1]):
        channel_tests.append((t, [int(n[0]) for n in num]))
    channels = dict(channel_tests)

    # format Signal Layout
    signals = [(s[:findhyphen.search(s).span()[1]],s[findhyphen.search(s).span()[1]+1:]) for s in signals]
    signal_types = {}
    for t, sig in groupby(signals, lambda x: x[0]):
        for s in sig:
            if s in signals:
                signal_types.setdefault(s[1], []).append(s[0])
    signal_keys = list(filter(lambda k: k in channels.keys(),signal_types.keys()))
    signal_types = dict([(k,signal_types[k]) for k in signal_keys])

    # get expected values, format/execute SQL request for expected values
    cont = ''
    if 'connected' in tests:
        cont += '1'
        if 'disconnected' in tests:
            cont+=',0'
    elif 'disconnected' in tests:
        cont='0'

    continuity_command = ' (Expected_Continuity IN ('+cont+'))'
    test_command = ' ('
    for k in signal_keys:
        c = channels[k]
        c.append(-1)
        cstr = '('+','.join([str(x) for x in c])+')'
        s = signal_types[k]
        for signal in s:
            signal_selector = ('((Signal_1 = \"'+signal+'\" OR Signal_2 = \"'+
                signal+'\") AND (Channel_1 IN '+cstr+' AND Channel_2 IN '
                +cstr+')) OR ')
            matrix_selector = '(Signal_name = \"'+signal+'\" AND Channel IN '+cstr+') OR'
            test_command += signal_selector

    #[:-2] gets rid of the final OR statement on the SQL command)
    test_command = test_command[:-3]+') AND '+continuity_command
    expected_values = db.fetch_expected(expectedname=[metadata['expected_key']],tests=test_command)
    matrix_values = db.fetch_naming(layoutname=[metadata['naming_key']])[metadata['naming_key']]

    run_key = db.commit_run(metadata)
    task = continuity_check.delay(url_for('checkupdate',_external=True),
            expected_values=expected_values,
            channel_naming=matrix_values,
            tablename=run_key)

    return jsonify(0)

@app.route("/checkupdate/",methods=['POST'])
def checkupdate():
    data = request.json

    key  = data.get('key')
    value = data.get('value')
    tablename = data.get('tablename')
    # (tablename==runkey)=true, I just didn't rename things after rewrite
    if isinstance(value[0],list):
        for i in value:
            db.commit_run_row(tablename,i)
    else:
        db.commit_run_row(tablename,value)

    socketio.emit('checkUpdate',data)
    return '0'

@app.route("/channel-layout/<namingkey>", methods=['GET'])
def return_channel_layout(namingkey):
    if namingkey=='all':
        channel_layout=db.fetch_naming()
    else:
        n = db.fetch_naming([namingkey])[namingkey]
         
        n = sorted(n, key=lambda tup: tup[-1])
        channel_layout = {}
        for key, group in groupby(n, lambda x: x[-1]):
            chan_num = -2 
            siglist = []
            for signal in group: 
                channel = signal[4]
                if signal[3] not in siglist:
                    siglist.append(signal[3])
                if channel > chan_num:
                    chan_num = channel 
            channel_layout[key]={'channels':chan_num,'signals':siglist}
    return jsonify(channel_layout)

@app.route("/channel-naming/<namingkey>", methods=['GET'])
def return_channel_naming(namingkey):
    n = db.fetch_naming([namingkey])[namingkey]
        
    return(jsonify(n)) 
        
@app.route("/expected-value",methods=['GET'])
def return_expected_values():
    expected = list(db.fetch_expected())
    expected = groupby(expected, lambda x: x[8])
    result = []
    for name, table in expected:
        result.append(name)
    return(jsonify(result))

@app.route("/expected-value/<ekey>", methods=["GET"])
def return_expectation(ekey):
    expected = db.fetch_expected([ekey])
    return(jsonify(expected))

@app.route("/run-opts", methods=['GET'])
def return_opts():
    opts = db.fetch_run_opts()
    return(jsonify(opts))

if __name__ == "__main__":
    socketio.run(app,debug=True)
