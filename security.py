from datetime import timedelta, datetime
import jwt
from passlib.context import CryptContext
import os
import bcrypt
from dotenv import load_dotenv

SECRET_KEY=os.getenv("SECRET_KEY", "abc123@#$%^&*()")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

#pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def password_hash(password:str)->str:
    pwd_bytes=password.encode("utf-8")
    salt=bcrypt.gensalt()
    hashed_password=bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode("utf-8")


def verify_password(plain_password:str,hashed_password:str)->bool:
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_bytes)



def create_access_token(data:dict)->str:
    copy=data.copy()
    expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    copy.update({"exp":expire})
    encoded_jwt=jwt.encode(copy, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
    