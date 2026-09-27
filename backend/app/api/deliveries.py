from fastapi import APIRouter, HTTPException, Depends

from ..database import supabase
from ..auth import get_current_user
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
def create_delivery(
    payload: DeliveryCreate,
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

        # Create delivery owned by the logged-in user
        delivery_response = (
            supabase
            .table("deliveries")
            .insert({
                "user_id": user_id,
                "customer": payload.customer,
                "status": "DONE",
                "warehouse_id": payload.warehouse_id
            })
            .execute()
        )

        if not delivery_response.data:
            raise HTTPException(
                status_code=500,
                detail="Delivery could not be created."
            )

        delivery = delivery_response.data[0]

        # Create delivery item owned by the logged-in user
        delivery_item_response = (
            supabase
            .table("delivery_items")
            .insert({
                "user_id": user_id,
                "delivery_id": delivery["id"],
                "product_id": payload.product_id,
                "quantity": payload.quantity
            })
            .execute()
        )

        if not delivery_item_response.data:
            raise HTTPException(
                status_code=500,
                detail="Delivery item could not be created."
            )

        # Decrease only this user's inventory
        inventory = decrease_stock(
            product_id=payload.product_id,
            warehouse_id=payload.warehouse_id,
            quantity=payload.quantity,
            user_id=user_id
        )

        # Create ledger entry owned by this user
        ledger = create_delivery_ledger(
            product_id=payload.product_id,
            quantity=payload.quantity,
            warehouse_id=payload.warehouse_id,
            user_id=user_id,
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
