from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    
class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    user_id:int
    description: Optional[str] = None
    category: Optional[str] = None
    status: str

    class Config:
        from_attributes = True