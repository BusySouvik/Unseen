from fastapi import APIRouter, HTTPException

from ..database import supabase
from ..schemas.deliveries import DeliveryCreate
from ..services.delivery_service import (
    decrease_stock,
    create_delivery_ledger
)

router = APIRouter(
    prefix="/deliveries",
    tags=["Deliveries"]
)


@router.post("/")
def create_delivery(payload: DeliveryCreate):

    try:
        # Check product
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

        # Check warehouse
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

        # Create delivery
        delivery_response = (
            supabase
            .table("deliveries")
            .insert({
                "customer": payload.customer,
                "status": "DONE",
                "warehouse_id": payload.warehouse_id
            })
            .execute()
        )

        delivery = delivery_response.data[0]

        # Add delivery item
        supabase.table("delivery_items").insert({
            "delivery_id": delivery["id"],
            "product_id": payload.product_id,
            "quantity": payload.quantity
        }).execute()

        # Decrease inventory
        inventory = decrease_stock(
            payload.product_id,
            payload.warehouse_id,
            payload.quantity
        )

        # Ledger entry
        ledger = create_delivery_ledger(
            product_id=payload.product_id,
            quantity=payload.quantity,
            warehouse_id=payload.warehouse_id,
            reference_id=delivery["id"],
            customer=payload.customer
        )

        return {
            "success": True,
            "message": "Delivery validated and stock updated",
            "delivery_id": delivery["id"],
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
    