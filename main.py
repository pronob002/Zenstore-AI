from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from pydantic import BaseModel
import csv
from io import StringIO
import redis
import json
from fastapi.middleware.cors import CORSMiddleware
from database import get_db, Base, engine
import models
import schemas
from security import create_access_token, password_hash, verify_password, get_current_user
from services import ProductService
from worker import process_product_ai
from utils import log_to_redis

models.Base.metadata.create_all(bind=engine)

redis_client = redis.Redis(host='localhost', port=6379, db=1, decode_responses=True)

app = FastAPI(
    title="ZenStore API",
    description="API for managing products with AI generated descriptions",
    version="1.0.0"
)

#middlewares code
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
















class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


# --- AUTHENTICATION ROUTES ---
@app.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    hashed_pwd = password_hash(user.password)
    new_user = models.User(username=user.username, password_hash=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}


@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
    

# --- PRODUCT ROUTES ---

@app.post("/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    product_service = ProductService(db)
    new_product = product_service.create_product(product, current_user.id)
    process_product_ai.delay(new_product.id, new_product.name)
    cache_key = f"products_user_{current_user.id}"
    redis_client.delete(cache_key)
    
    return new_product


@app.get("/products")
def get_products(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    """Fetches user products, utilizing a Redis Caching Layer."""
    cache_key = f"products_user_{current_user.id}"
    

    cached_data = redis_client.get(cache_key)
    if cached_data:
        print("Fetching from Redis Cache...")
        log_to_redis(f"Cache Hit: Fetching {current_user.username}'s products from Redis")
        return json.loads(cached_data)
        
    print("Fetching from Database...")
    log_to_redis(f"Cache Miss: Fetching {current_user.username}'s products from Database")
    product_service = ProductService(db)
    user_products = product_service.get_user_products(current_user.id)

    products_dict = jsonable_encoder(user_products)
    redis_client.setex(cache_key, 3600, json.dumps(products_dict))
    
    return user_products


# --- BATCH UPLOAD (GENERATOR CONSTRAINT) ---

def csv_row_generator(file_contents: str):
    """
    Python Generator that yields one row at a time from a CSV string.
    Fulfills constraint: Python Generators for batch processing.
    """
    f = StringIO(file_contents)
    reader = csv.reader(f)
    
    
    for row in reader:
        if row and row[0].strip(): # Ensure row is not empty
            yield row[0].strip() # Yields just the product name

@app.post("/products/batch", status_code=status.HTTP_202_ACCEPTED)
async def upload_batch_products(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    
    contents = await file.read()
    decoded_contents = contents.decode('utf-8')
    
    product_service = ProductService(db)
    count = 0
 
    for product_name in csv_row_generator(decoded_contents):

        product_data = schemas.ProductCreate(name=product_name)
        new_product = product_service.create_product(product_data, current_user.id)
        

        process_product_ai.delay(new_product.id, new_product.name)
        count += 1
        
    cache_key = f"products_user_{current_user.id}"
    redis_client.delete(cache_key)
        
    return {"message": f"Successfully queued {count} products for background AI processing."}


@app.get("/logs")
def get_system_logs():
    logs = redis_client.lrange('app_logs', 0, -1)
    return {"logs": logs}