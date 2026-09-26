from fastapi import HTTPException
from ..database import supabase


def decrease_stock(product_id: str, warehouse_id: str, quantity: float):
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    response = (
        supabase
        .table("inventory")
        .select("*")
        .eq("product_id", product_id)
        .eq("warehouse_id", warehouse_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="No inventory found for this product in this warehouse"
        )

    inventory = response.data[0]
    current_quantity = float(inventory["quantity"])

    if current_quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {current_quantity}"
        )

    new_quantity = current_quantity - quantity

    update_response = (
        supabase
        .table("inventory")
        .update({
            "quantity": new_quantity
        })
        .eq("id", inventory["id"])
        .execute()
    )

    return update_response.data[0]


def create_delivery_ledger(
    product_id: str,
    quantity: float,
    warehouse_id: str,
    reference_id: str,
    customer: str
):
    response = (
        supabase
        .table("stock_ledger")
        .insert({
            "product_id": product_id,
            "operation_type": "DELIVERY",
            "quantity": quantity,
            "from_warehouse_id": warehouse_id,
            "reference_id": reference_id,
            "notes": f"Delivered to {customer}"
        })
        .execute()
    )

    return response.data[0]