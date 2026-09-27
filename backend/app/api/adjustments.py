from fastapi import APIRouter, HTTPException, Depends

from ..database import supabase
from ..auth import get_current_user
from ..schemas.adjustments import AdjustmentCreate
from ..services.adjustment_service import adjust_stock

router = APIRouter(
    prefix="/adjustments",
    tags=["Adjustments"]
)


@router.post("/")
def create_adjustment(
    payload: AdjustmentCreate,
    current_user=Depends(get_current_user)
):
    user_id = str(current_user.id)

    try:
        # Verify product belongs to the logged-in user
        product = (
            supabase
            .table("products")
            .select("id, name, sku")
            .eq("id", payload.product_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not product.data:
            raise HTTPException(
                status_code=404,
                detail="Product not found."
            )

        # Verify warehouse belongs to the logged-in user
        warehouse = (
            supabase
            .table("warehouses")
            .select("id, name")
            .eq("id", payload.warehouse_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not warehouse.data:
            raise HTTPException(
                status_code=404,
                detail="Warehouse not found."
            )

        # Adjust only this user's inventory
        result = adjust_stock(
            product_id=payload.product_id,
            warehouse_id=payload.warehouse_id,
            counted_quantity=payload.counted_quantity,
            reason=payload.reason,
            user_id=user_id
        )

        # Save adjustment owned by this user
        adjustment_response = (
            supabase
            .table("adjustments")
            .insert({
                "user_id": user_id,
                "product_id": payload.product_id,
                "warehouse_id": payload.warehouse_id,
                "previous_quantity": result["previous_quantity"],
                "counted_quantity": result["counted_quantity"],
                "difference": result["difference"],
                "reason": payload.reason
            })
            .execute()
        )

        if not adjustment_response.data:
            raise HTTPException(
                status_code=500,
                detail="Adjustment could not be created."
            )

        adjustment = adjustment_response.data[0]

        # Create ledger entry owned by this user
        ledger_response = (
            supabase
            .table("stock_ledger")
            .insert({
                "user_id": user_id,
                "product_id": payload.product_id,
                "operation_type": "ADJUSTMENT",
                "quantity": result["difference"],
                "to_warehouse_id": payload.warehouse_id,
                "reference_id": adjustment["id"],
                "notes": payload.reason
            })
            .execute()
        )

        if not ledger_response.data:
            raise HTTPException(
                status_code=500,
                detail="Adjustment ledger entry could not be created."
            )

        return {
            "success": True,
            "message": "Inventory adjusted successfully",
            "adjustment_id": adjustment["id"],
            "inventory": result["inventory"],
            "difference": result["difference"],
            "ledger": ledger_response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
