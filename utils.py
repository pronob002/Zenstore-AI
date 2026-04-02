import time
import logging
from functools import wraps


logging.basicConfig(level=logging.INFO)
logger=logging.getLogger(__name__)

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
    