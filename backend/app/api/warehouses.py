from fastapi import APIRouter, HTTPException

from ..database import supabase


router = APIRouter(
    prefix="/warehouses",
    tags=["Warehouses"]
)


@router.get("/")
def get_warehouses():
    try:
        response = (
            supabase
            .table("warehouses")
            .select("*")
            .order("name")
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