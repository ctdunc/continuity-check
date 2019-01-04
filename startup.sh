redis-server &
celery worker -A server.celery &
python server.py
