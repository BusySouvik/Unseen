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


def increase_stock(
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

    if existing:
        new_quantity = float(existing["quantity"]) + quantity

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

    response = (
        supabase
        .table("inventory")
        .insert({
            "user_id": user_id,
            "product_id": product_id,
            "warehouse_id": warehouse_id,
            "quantity": quantity
        })
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Inventory could not be created."
        )

    return response.data[0]


def create_ledger_entry(
    product_id: str,
    operation_type: str,
    quantity: float,
    user_id: str,
    from_warehouse_id: str | None = None,
    to_warehouse_id: str | None = None,
    reference_id: str | None = None,
    notes: str | None = None
):
    response = (
        supabase
        .table("stock_ledger")
        .insert({
            "user_id": user_id,
            "product_id": product_id,
            "operation_type": operation_type,
            "quantity": quantity,
            "from_warehouse_id": from_warehouse_id,
            "to_warehouse_id": to_warehouse_id,
            "reference_id": reference_id,
            "notes": notes
        })
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Ledger entry could not be created."
        )

    return response.data[0]
