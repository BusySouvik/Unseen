from fastapi import APIRouter, HTTPException

from ..database import supabase
from ..schemas.receipts import ReceiptCreate
from ..services.inventory_service import (
    increase_stock,
    create_ledger_entry
)

router = APIRouter(
    prefix="/receipts",
    tags=["Receipts"]
)


@router.post("/")
def create_receipt(payload: ReceiptCreate):

    try:
        product_response = (
            supabase
            .table("products")
            .select("id, name, sku")
            .eq("id", payload.product_id)
            .execute()
        )

        if not product_response.data:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        warehouse_response = (
            supabase
            .table("warehouses")
            .select("id, name")
            .eq("id", payload.warehouse_id)
            .execute()
        )

        if not warehouse_response.data:
            raise HTTPException(
                status_code=404,
                detail="Warehouse not found"
            )

        receipt_response = (
            supabase
            .table("receipts")
            .insert({
                "supplier": payload.supplier,
                "status": "DONE",
                "warehouse_id": payload.warehouse_id
            })
            .execute()
        )

        receipt = receipt_response.data[0]

        supabase.table("receipt_items").insert({
            "receipt_id": receipt["id"],
            "product_id": payload.product_id,
            "quantity": payload.quantity
        }).execute()

        inventory = increase_stock(
            payload.product_id,
            payload.warehouse_id,
            payload.quantity
        )

        ledger = create_ledger_entry(
            product_id=payload.product_id,
            operation_type="RECEIPT",
            quantity=payload.quantity,
            to_warehouse_id=payload.warehouse_id,
            reference_id=receipt["id"],
            notes=f"Received from {payload.supplier}"
        )

        return {
            "success": True,
            "message": "Receipt validated and stock updated",
            "receipt_id": receipt["id"],
            "inventory": inventory,
            "ledger": ledger
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )