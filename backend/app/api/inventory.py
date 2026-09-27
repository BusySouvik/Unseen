from fastapi import APIRouter, HTTPException, Depends

from ..database import supabase
from ..auth import get_current_user

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.get("/")
def get_inventory(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)

    try:
        response = (
            supabase
            .table("inventory")
            .select("""
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
            """)
            .eq("user_id", user_id)
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
