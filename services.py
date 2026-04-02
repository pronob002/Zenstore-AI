from sqlalchemy.orm import Session
import models
import schemas
from utils import time_it

class ProductService:
    def __init__(self, db: Session):
        self.db = db
    def create_product(self, product: schemas.ProductCreate, user_id: int):
        new_product = models.Product(
            name=product.name,
            user_id=user_id,
            status="processing" 
        )
        self.db.add(new_product)
        self.db.commit()
        self.db.refresh(new_product)
        return new_product

    @time_it
    def get_user_products(self, user_id: int):
        return self.db.query(models.Product).filter(models.Product.user_id == user_id).all()