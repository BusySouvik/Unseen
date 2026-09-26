from pydantic import BaseModel, Field


class AdjustmentCreate(BaseModel):
    product_id: str
    warehouse_id: str
    counted_quantity: float = Field(ge=0)
    reason: str = Field(min_length=1)