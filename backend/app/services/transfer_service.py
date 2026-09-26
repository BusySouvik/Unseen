from fastapi import HTTPException
from ..database import supabase


def get_inventory(product_id: str, warehouse_id: str):
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
            detail="Inventory record not found"
        )

    return response.data[0]


def transfer_stock(
    product_id: str,
    from_warehouse_id: str,
    to_warehouse_id: str,
    quantity: float
):
    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    if from_warehouse_id == to_warehouse_id:
        raise HTTPException(
            status_code=400,
            detail="Source and destination warehouses must be different"
        )

    source = get_inventory(product_id, from_warehouse_id)

    source_quantity = float(source["quantity"])

    if source_quantity < quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {source_quantity}"
        )

    # Remove from source
    new_source_quantity = source_quantity - quantity

    supabase.table("inventory").update({
        "quantity": new_source_quantity
    }).eq("id", source["id"]).execute()

    # Check destination
    destination_response = (
        supabase
        .table("inventory")
        .select("*")
        .eq("product_id", product_id)
        .eq("warehouse_id", to_warehouse_id)
        .execute()
    )

    if destination_response.data:
        destination = destination_response.data[0]

        new_destination_quantity = (
            float(destination["quantity"]) + quantity
        )

        destination_result = (
            supabase
            .table("inventory")
            .update({
                "quantity": new_destination_quantity
            })
            .eq("id", destination["id"])
            .execute()
        )

    else:
        destination_result = (
            supabase
            .table("inventory")
            .insert({
                "product_id": product_id,
                "warehouse_id": to_warehouse_id,
                "quantity": quantity
            })
            .execute()
        )

    return {
        "source": {
            "warehouse_id": from_warehouse_id,
            "quantity": new_source_quantity
        },
        "destination": destination_result.data[0]
    }