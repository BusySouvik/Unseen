from pydantic import BaseModel, Field


class ReceiptCreate(BaseModel):
    supplier: str = Field(min_length=1)
    product_id: str
    warehouse_id: str
    quantity: float = Field(gt=0)


class ReceiptResponse(BaseModel):
    success: bool
    message: str
    receipt_id: str
    inventory: dict
    ledger: dict