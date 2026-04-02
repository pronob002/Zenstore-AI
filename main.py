from fastapi import FastAPI, Depends, HTTPException,status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db, Base, engine
import models
from security import create_access_token, password_hash, verify_password,get_current_user
from pydantic import BaseModel

import schemas
from services import ProductService




models.Base.metadata.create_all(bind=engine)
app=FastAPI(
    title="ZenStore API",
    descriptions="Api for managing products with AI generated descriptions",
    version="1.0.0"
)

class UserCreate(BaseModel):
    username:str
    password:str

class Token(BaseModel):
    access_token:str
    token_type:str

@app.post("/signup",response_model=dict,status_code=status.HTTP_201_CREATED)
def signup(user:UserCreate, db:Session=Depends(get_db)):
    existing_user=db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists")
    hashed_pwd=password_hash(user.password)
    new_user=models.User(username=user.username,password_hash=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message":"User created successfully"}

@app.post("/login",response_model=Token)
def login(form_data:OAuth2PasswordRequestForm=Depends(),db:Session=Depends(get_db)):
    user=db.query(models.User).filter(models.User.username==form_data.username).first()
    if not user or not verify_password(form_data.password,user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate":"Bearer"}
        )
    access_token=create_access_token(data={"sub":str(user.id)})
    return {"access_token":access_token,"token_type":"bearer"}
    
    
    # --- PRODUCT ROUTES ---

@app.post("/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    product_service = ProductService(db)
    new_product = product_service.create_product(product, current_user.id)
    return new_product


@app.get("/products", response_model=list[schemas.ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) 
):
    product_service = ProductService(db)
    user_products = product_service.get_user_products(current_user.id)
    
    return user_products
    