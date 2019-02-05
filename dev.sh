source env/bin/activate
nohup st --exec=redis-server & 
nohup st --directory=./view/ --exec='npm run watch' &
st --exec='python server.py' &
st --exec='celery worker -A server.celery' &
