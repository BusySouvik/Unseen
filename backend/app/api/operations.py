from fastapi import APIRouter, HTTPException, Depends

from ..database import supabase
from ..auth import get_current_user

router = APIRouter(
    prefix="/operations",
    tags=["Operations"]
)


@router.get("/receipts")
def get_receipts(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)

    try:
        response = (
            supabase
            .table("receipts")
            .select("""
                *,
                warehouses(name),
                receipt_items(
                    quantity,
                    products(name, sku, unit)
                )
            """)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/deliveries")
def get_deliveries(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)

    try:
        response = (
            supabase
            .table("deliveries")
            .select("""
                *,
                warehouses(name),
                delivery_items(
                    quantity,
                    products(name, sku, unit)
                )
            """)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/transfers")
def get_transfers(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)

    try:
        response = (
            supabase
            .table("transfers")
            .select("""
                *,
                products(name, sku, unit),
                from_warehouse:warehouses!transfers_from_warehouse_id_fkey(name),
                to_warehouse:warehouses!transfers_to_warehouse_id_fkey(name)
            """)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/adjustments")
def get_adjustments(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)

    try:
        response = (
            supabase
            .table("adjustments")
            .select("""
                *,
                products(name, sku, unit),
                warehouses(name)
            """)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "data": response.data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
