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


def transfer_stock(
    product_id: str,
    from_warehouse_id: str,
    to_warehouse_id: str,
    quantity: float,
    user_id: str
):
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if from_warehouse_id == to_warehouse_id:
        raise HTTPException(
            status_code=400,
            detail="Source and destination warehouses must be different."
        )

    source_inventory = get_inventory_record(
        product_id,
        from_warehouse_id,
        user_id
    )

    if not source_inventory:
        raise HTTPException(
            status_code=404,
            detail="Source inventory record not found."
        )

    source_quantity = float(source_inventory["quantity"])

    if source_quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient stock. Available: "
                f"{source_quantity}, requested: {quantity}"
            )
        )

    destination_inventory = get_inventory_record(
        product_id,
        to_warehouse_id,
        user_id
    )

    new_source_quantity = source_quantity - quantity

    source_update = (
        supabase
        .table("inventory")
        .update({
            "quantity": new_source_quantity,
            "updated_at": "now()"
        })
        .eq("id", source_inventory["id"])
        .eq("user_id", user_id)
        .execute()
    )

    if not source_update.data:
        raise HTTPException(
            status_code=500,
            detail="Source inventory could not be updated."
        )

    if destination_inventory:
        new_destination_quantity = (
            float(destination_inventory["quantity"]) + quantity
        )

        destination_update = (
            supabase
            .table("inventory")
            .update({
                "quantity": new_destination_quantity,
                "updated_at": "now()"
            })
            .eq("id", destination_inventory["id"])
            .eq("user_id", user_id)
            .execute()
        )

        if not destination_update.data:
            raise HTTPException(
                status_code=500,
                detail="Destination inventory could not be updated."
            )

        destination_result = destination_update.data[0]

    else:
        destination_insert = (
            supabase
            .table("inventory")
            .insert({
                "user_id": user_id,
                "product_id": product_id,
                "warehouse_id": to_warehouse_id,
                "quantity": quantity
            })
            .execute()
        )

        if not destination_insert.data:
            raise HTTPException(
                status_code=500,
                detail="Destination inventory could not be created."
            )

        destination_result = destination_insert.data[0]

    return {
        "source": source_update.data[0],
        "destination": destination_result
    }
