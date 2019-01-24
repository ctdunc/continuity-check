source env/bin/activate
nohup termite  --exec=redis-server & 
nohup termite --directory=./view/ --exec='npm run watch' &
termite --exec='python server.py' &
termite --exec='celery worker -A server.celery' &
