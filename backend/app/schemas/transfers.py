from pydantic import BaseModel, Field


class TransferCreate(BaseModel):
    product_id: str
    from_warehouse_id: str
    to_warehouse_id: str
    quantity: float = Field(gt=0)