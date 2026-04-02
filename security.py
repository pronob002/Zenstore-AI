from datetime import timedelta, datetime
import jwt
from passlib.context import CryptContext

SECRET_KEY=os.getenv("SECRET_KEY", "abc123@#$%^&*()")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def password_hash(password:str)->str:
    return pwd_context.hash(password)
def verify_password(plain_password:str,hashed_password:str)->bool:
    return pwd_context.verify(plain_password, hashed_password)
def create_access_token(data:dict)->str:
    copy=data.copy()
    expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    copy.update({"exp":expire})
    encoded_jwt=jwt.encode(copy, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
    