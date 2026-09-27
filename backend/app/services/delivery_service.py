from fastapi import HTTPException

from ..database import supabase


def get_inventory_record(
    product_id: str,
    warehouse_id: str,
    user_id: str
):
    response = (
        supabase
        .table("inventory")
        .select("*")
        .eq("product_id", product_id)
        .eq("warehouse_id", warehouse_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )

    if response.data:
        return response.data[0]

    return None


def decrease_stock(
    product_id: str,
    warehouse_id: str,
    quantity: float,
    user_id: str
):
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    existing = get_inventory_record(
        product_id,
        warehouse_id,
        user_id
    )

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found."
        )

    current_quantity = float(existing["quantity"])

    if current_quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient stock. Available: "
                f"{current_quantity}, requested: {quantity}"
            )
        )

    new_quantity = current_quantity - quantity

    response = (
        supabase
        .table("inventory")
        .update({
            "quantity": new_quantity,
            "updated_at": "now()"
        })
        .eq("id", existing["id"])
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Inventory could not be updated."
        )

    return response.data[0]


def create_delivery_ledger(
    product_id: str,
    quantity: float,
    warehouse_id: str,
    user_id: str,
    reference_id: str | None = None,
    customer: str | None = None
):
    response = (
        supabase
        .table("stock_ledger")
        .insert({
            "user_id": user_id,
            "product_id": product_id,
            "operation_type": "DELIVERY",
            "quantity": quantity,
            "from_warehouse_id": warehouse_id,
            "reference_id": reference_id,
            "notes": f"Delivered to {customer}" if customer else "Delivery"
        })
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Delivery ledger entry could not be created."
        )

    return response.data[0]
