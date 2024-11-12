from gevent import monkey
monkey.patch_all()

import multiprocessing
import os

log_dir = "/var/log/gunicorn"
os.makedirs(log_dir, exist_ok=True)

timeout = 90
worker_class = "gevent"
worker_connections = 5000
workers = multiprocessing.cpu_count() * 2 + 1
accesslog = os.path.join(log_dir, "gunicorn_access.log")
errorlog = os.path.join(log_dir, "gunicorn_error.log")