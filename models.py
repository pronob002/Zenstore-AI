from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    _tablename_="users"
    id = Column(Integer,primary_key=True,index=True)
    username=Column(String, unique=True,index=True,nullable=False)
    password_hash=Column(String,nullable=False)
    products=relationship("Product", back_populates="owner")

class Product(Base):
    _tablename_="products"
    id=Column(Integer,primary_key=True,index=True)
    name=Column(String, index=True, nullable=False)
    description=Column(String, nullable=True)
    category=Column(String, nullable=False)
    #status can be 'pending','processing','completed','failed'
    status=Column(String, default='pending')
    user_id=Column(Integer, ForeignKey("users.id"))
    owner=relationship("User", back_populates="products")