from fastapi import APIRouter, HTTPException, Depends

from ..database import supabase
from ..auth import get_current_user
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
def create_receipt(
    payload: ReceiptCreate,
    current_user=Depends(get_current_user)
):
    user_id = str(current_user.id)

    try:
        # Verify product belongs to the logged-in user
        product_response = (
            supabase
            .table("products")
            .select("id, name, sku")
            .eq("id", payload.product_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not product_response.data:
            raise HTTPException(
                status_code=404,
                detail="Product not found."
            )

        # Verify warehouse belongs to the logged-in user
        warehouse_response = (
            supabase
            .table("warehouses")
            .select("id, name")
            .eq("id", payload.warehouse_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not warehouse_response.data:
            raise HTTPException(
                status_code=404,
                detail="Warehouse not found."
            )

        # Create receipt owned by the logged-in user
        receipt_response = (
            supabase
            .table("receipts")
            .insert({
                "user_id": user_id,
                "supplier": payload.supplier,
                "status": "DONE",
                "warehouse_id": payload.warehouse_id
            })
            .execute()
        )

        if not receipt_response.data:
            raise HTTPException(
                status_code=500,
                detail="Receipt could not be created."
            )

        receipt = receipt_response.data[0]

        # Create receipt item owned by the logged-in user
        receipt_item_response = (
            supabase
            .table("receipt_items")
            .insert({
                "user_id": user_id,
                "receipt_id": receipt["id"],
                "product_id": payload.product_id,
                "quantity": payload.quantity
            })
            .execute()
        )

        if not receipt_item_response.data:
            raise HTTPException(
                status_code=500,
                detail="Receipt item could not be created."
            )

        # Increase only this user's inventory
        inventory = increase_stock(
            product_id=payload.product_id,
            warehouse_id=payload.warehouse_id,
            quantity=payload.quantity,
            user_id=user_id
        )

        # Create ledger entry owned by this user
        ledger = create_ledger_entry(
            product_id=payload.product_id,
            operation_type="RECEIPT",
            quantity=payload.quantity,
            user_id=user_id,
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
