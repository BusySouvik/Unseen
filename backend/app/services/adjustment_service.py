from fastapi import HTTPException

from ..database import supabase


def adjust_stock(
    product_id: str,
    warehouse_id: str,
    counted_quantity: float,
    reason: str,
    user_id: str
):
    if counted_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Counted quantity cannot be negative."
        )

    # Find only this user's inventory record
    inventory_response = (
        supabase
        .table("inventory")
        .select("*")
        .eq("product_id", product_id)
        .eq("warehouse_id", warehouse_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    if not inventory_response.data:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found."
        )

    inventory = inventory_response.data[0]

    previous_quantity = float(inventory["quantity"])
    difference = counted_quantity - previous_quantity

    # Update only this user's inventory
    inventory_update = (
        supabase
        .table("inventory")
        .update({
            "quantity": counted_quantity,
            "updated_at": "now()"
        })
        .eq("id", inventory["id"])
        .eq("user_id", user_id)
        .execute()
    )

    if not inventory_update.data:
        raise HTTPException(
            status_code=500,
            detail="Inventory could not be adjusted."
        )

    return {
        "inventory": inventory_update.data[0],
        "previous_quantity": previous_quantity,
        "counted_quantity": counted_quantity,
        "difference": difference
    }
