from fastapi import APIRouter, HTTPException

from ..database import supabase


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.get("/")
def get_inventory():
    try:
        response = (
            supabase
            .table("inventory")
            .select(
                """
                id,
                quantity,
                product_id,
                warehouse_id,
                products (
                    name,
                    sku,
                    category,
                    unit,
                    reorder_level
                ),
                warehouses (
                    name,
                    location
                )
                """
            )
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )