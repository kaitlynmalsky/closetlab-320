# Start Gunicorn
# gunicorn -b 0.0.0.0:8001 --timeout 120 app:app
gunicorn -c gunicorn_config.py --bind 0.0.0.0:8000 app:app