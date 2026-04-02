from datetime import timedelta, datetime
import jwt
from passlib.context import CryptContext
import os
import bcrypt
from dotenv import load_dotenv
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

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



token_schema=OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token:str=Depends(token_schema),db:Session=Depends(get_db)):
    credential_exception=HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload=jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id=payload.get("sub")
        if user_id is None:
            raise credential_exception
    except jwt.PyJWTError:
        raise credential_exception
    user=db.query(models.User).filter(models.User.id==user_id).first()
    if user is None:
        raise ceredential_exception
    return user
    
    