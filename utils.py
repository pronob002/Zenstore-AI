import time
import logging
from functools import wraps
import redis
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger=logging.getLogger(__name__)

redis_client = redis.Redis(host='localhost', port=6379, db=1, decode_responses=True)

def log_to_redis(message: str):
    timestamp = datetime.now().strftime("%H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    redis_client.lpush('app_logs', log_entry)
    redis_client.ltrim('app_logs', 0, 49) 
    logger.info(log_entry)

def time_it(func):
    @wraps(func)
    def wrapper(*args,**kwargs):
        start_time=time.time()
        result=func(*args,**kwargs)
        end_time=time.time()
        execution_time=end_time-start_time
        logger.info(f"Executed {func.__name__} in {execution_time:.4f} seconds")
        return result
    return wrapper
    