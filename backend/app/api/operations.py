from fastapi import APIRouter, HTTPException
from ..database import supabase

router = APIRouter(
    prefix="/operations",
    tags=["Operations"]
)


@router.get("/receipts")
def get_receipts():

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
            .order("created_at", desc=True)
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


@router.get("/deliveries")
def get_deliveries():

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
            .order("created_at", desc=True)
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


@router.get("/transfers")
def get_transfers():

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
            .order("created_at", desc=True)
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


@router.get("/adjustments")
def get_adjustments():

    try:

        response = (
            supabase
            .table("adjustments")
            .select("""
                *,
                products(name, sku, unit),
                warehouses(name)
            """)
            .order("created_at", desc=True)
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