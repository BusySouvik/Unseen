from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from ..database import supabase
from ..auth import get_current_user

router = APIRouter(
    prefix="/warehouses",
    tags=["Warehouses"]
)


class WarehouseCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    location: str = Field(..., min_length=1, max_length=200)


@router.get("/")
def get_warehouses(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)

    try:
        response = (
            supabase
            .table("warehouses")
            .select("*")
            .eq("user_id", user_id)
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


@router.post("/")
def create_warehouse(
    warehouse: WarehouseCreate,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)

    try:
        response = (
            supabase
            .table("warehouses")
            .insert({
                "user_id": user_id,
                "name": warehouse.name.strip(),
                "location": warehouse.location.strip(),
            })
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Warehouse could not be created."
            )

        return {
            "success": True,
            "message": "Warehouse created successfully.",
            "data": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
