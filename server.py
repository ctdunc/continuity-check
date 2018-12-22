from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO
from redis import Redis
from rq import Queue
from itertools import groupby

from logic.sql_client import sqlclient
db = sqlclient('localhost',
        'continuity_check',
        'cdms',
        'cdms',
        'continuity_history',
        'channel_naming',
        'slac_expected_values')

app = Flask(__name__, static_folder="./view/dist", template_folder="./view")

app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


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
    
    return 0

@app.route("/channel-layout", methods=['GET'])
def return_channel_layout():
    n = sorted(db.get_channel_layout(), key=lambda tup: tup[0])
    channel_layout = []
    for key, group in groupby(n, lambda x: x[0]):
        print(key)
        chan_num = -2 
        for signal in group: 
            if signal[1] > chan_num:
                chan_num = signal[1]
        channel_layout.append({'type': key, 'channels': chan_num}) 
    return jsonify(channel_layout)

@app.route("/signal-list", methods=['GET'])
def return_signal_list():
    siglist = sorted(db.get_signal_list(),key=lambda tup: tup[1])
    signal_layout = []
    for key, group in groupby(siglist, lambda x: x[1]):
        print(group)
        chan_sigs = []
        for signal in group:
           chan_sigs.append(signal[0]) 
        signal_layout.append({'type':key, 'signals':chan_sigs})
    return jsonify(signal_layout)
   
    return jsonify(siglist)

@app.route("/checkpost", methods=['POST'])
def checkpost():
    data = request.json
    socketio.emit('checkupdate', data)
    return 0


if __name__ == "__main__":
    socketio.run(app,debug=True)
