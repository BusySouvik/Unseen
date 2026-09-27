from fastapi import APIRouter, HTTPException, Depends

from ..database import supabase
from ..auth import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)

    try:
        products = (
            supabase
            .table("products")
            .select("id")
            .eq("user_id", user_id)
            .execute()
        )

        inventory = (
            supabase
            .table("inventory")
            .select("""
                id,
                quantity,
                product_id,
                warehouse_id,
                products(name, sku, reorder_level),
                warehouses(name)
            """)
            .eq("user_id", user_id)
            .execute()
        )

        receipts = (
            supabase
            .table("receipts")
            .select("id, status")
            .eq("user_id", user_id)
            .execute()
        )

        deliveries = (
            supabase
            .table("deliveries")
            .select("id, status")
            .eq("user_id", user_id)
            .execute()
        )

        transfers = (
            supabase
            .table("transfers")
            .select("id, status")
            .eq("user_id", user_id)
            .execute()
        )

        total_stock = 0
        low_stock = 0
        out_of_stock = 0

        for item in inventory.data:
            quantity = float(item["quantity"])
            total_stock += quantity

            reorder_level = 0

            if item.get("products"):
                reorder_level = float(
                    item["products"].get("reorder_level", 0)
                )

            if quantity == 0:
                out_of_stock += 1
            elif quantity <= reorder_level:
                low_stock += 1

        pending_receipts = sum(
            1 for r in receipts.data
            if r["status"] not in ["DONE", "CANCELED"]
        )

        pending_deliveries = sum(
            1 for d in deliveries.data
            if d["status"] not in ["DONE", "CANCELED"]
        )

        scheduled_transfers = sum(
            1 for t in transfers.data
            if t["status"] not in ["DONE", "CANCELED"]
        )

        return {
            "success": True,
            "data": {
                "total_products": len(products.data),
                "total_stock": total_stock,
                "low_stock": low_stock,
                "out_of_stock": out_of_stock,
                "pending_receipts": pending_receipts,
                "pending_deliveries": pending_deliveries,
                "internal_transfers_scheduled": scheduled_transfers
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
