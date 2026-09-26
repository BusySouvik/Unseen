from pydantic import BaseModel, Field


class DeliveryCreate(BaseModel):
    customer: str = Field(min_length=1)
    product_id: str
    warehouse_id: str
    quantity: float = Field(gt=0)