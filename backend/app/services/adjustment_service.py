from fastapi import HTTPException
from ..database import supabase


def adjust_stock(
    product_id: str,
    warehouse_id: str,
    counted_quantity: float,
    reason: str
):
    if counted_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Counted quantity cannot be negative"
        )

    response = (
        supabase
        .table("inventory")
        .select("*")
        .eq("product_id", product_id)
        .eq("warehouse_id", warehouse_id)
        .execute()
    )

    if response.data:
        inventory = response.data[0]
        previous_quantity = float(inventory["quantity"])
    else:
        previous_quantity = 0

    difference = counted_quantity - previous_quantity

    if response.data:
        updated = (
            supabase
            .table("inventory")
            .update({
                "quantity": counted_quantity
            })
            .eq("id", inventory["id"])
            .execute()
        )
    else:
        updated = (
            supabase
            .table("inventory")
            .insert({
                "product_id": product_id,
                "warehouse_id": warehouse_id,
                "quantity": counted_quantity
            })
            .execute()
        )

    return {
        "inventory": updated.data[0],
        "previous_quantity": previous_quantity,
        "counted_quantity": counted_quantity,
        "difference": difference,
        "reason": reason
    }