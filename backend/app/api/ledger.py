from fastapi import APIRouter, HTTPException, Depends

from ..database import supabase
from ..auth import get_current_user

router = APIRouter(
    prefix="/ledger",
    tags=["Stock Ledger"]
)


@router.get("/")
def get_ledger(
    product_id: str | None = None,
    operation_type: str | None = None,
    warehouse_id: str | None = None,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)

    try:
        query = (
            supabase
            .table("stock_ledger")
            .select("""
                id,
                product_id,
                operation_type,
                quantity,
                from_warehouse_id,
                to_warehouse_id,
                reference_id,
                notes,
                created_at,
                products(name, sku),
                from_warehouse:warehouses!stock_ledger_from_warehouse_id_fkey(name),
                to_warehouse:warehouses!stock_ledger_to_warehouse_id_fkey(name)
            """)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
        )

        if product_id:
            query = query.eq("product_id", product_id)

        if operation_type:
            query = query.eq("operation_type", operation_type.upper())

        response = query.execute()

        data = response.data

        if warehouse_id:
            data = [
                item for item in data
                if item.get("from_warehouse_id") == warehouse_id
                or item.get("to_warehouse_id") == warehouse_id
            ]

        return {
            "success": True,
            "count": len(data),
            "data": data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
