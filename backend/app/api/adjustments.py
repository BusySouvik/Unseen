from fastapi import APIRouter, HTTPException

from ..database import supabase
from ..schemas.adjustments import AdjustmentCreate
from ..services.adjustment_service import adjust_stock

router = APIRouter(
    prefix="/adjustments",
    tags=["Adjustments"]
)


@router.post("/")
def create_adjustment(payload: AdjustmentCreate):

    try:
        # Check product
        product = (
            supabase
            .table("products")
            .select("id, name, sku")
            .eq("id", payload.product_id)
            .execute()
        )

        if not product.data:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        # Check warehouse
        warehouse = (
            supabase
            .table("warehouses")
            .select("id, name")
            .eq("id", payload.warehouse_id)
            .execute()
        )

        if not warehouse.data:
            raise HTTPException(
                status_code=404,
                detail="Warehouse not found"
            )

        # Adjust inventory
        result = adjust_stock(
            product_id=payload.product_id,
            warehouse_id=payload.warehouse_id,
            counted_quantity=payload.counted_quantity,
            reason=payload.reason
        )

        # Save adjustment
        adjustment_response = (
            supabase
            .table("adjustments")
            .insert({
                "product_id": payload.product_id,
                "warehouse_id": payload.warehouse_id,
                "previous_quantity": result["previous_quantity"],
                "counted_quantity": result["counted_quantity"],
                "difference": result["difference"],
                "reason": payload.reason
            })
            .execute()
        )

        adjustment = adjustment_response.data[0]

        # Ledger
        ledger_response = (
            supabase
            .table("stock_ledger")
            .insert({
                "product_id": payload.product_id,
                "operation_type": "ADJUSTMENT",
                "quantity": result["difference"],
                "to_warehouse_id": payload.warehouse_id,
                "reference_id": adjustment["id"],
                "notes": payload.reason
            })
            .execute()
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