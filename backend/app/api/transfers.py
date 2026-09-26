from fastapi import APIRouter, HTTPException

from ..database import supabase
from ..schemas.transfers import TransferCreate
from ..services.transfer_service import transfer_stock

router = APIRouter(
    prefix="/transfers",
    tags=["Transfers"]
)


@router.post("/")
def create_transfer(payload: TransferCreate):

    try:
        # Check product
        product_response = (
            supabase
            .table("products")
            .select("id, name, sku")
            .eq("id", payload.product_id)
            .execute()
        )

        if not product_response.data:
            raise HTTPException(
                status_code=404,
                detail="Product not found"
            )

        # Check source warehouse
        source_response = (
            supabase
            .table("warehouses")
            .select("id, name")
            .eq("id", payload.from_warehouse_id)
            .execute()
        )

        if not source_response.data:
            raise HTTPException(
                status_code=404,
                detail="Source warehouse not found"
            )

        # Check destination warehouse
        destination_response = (
            supabase
            .table("warehouses")
            .select("id, name")
            .eq("id", payload.to_warehouse_id)
            .execute()
        )

        if not destination_response.data:
            raise HTTPException(
                status_code=404,
                detail="Destination warehouse not found"
            )

        # Create transfer record
        transfer_response = (
            supabase
            .table("transfers")
            .insert({
                "product_id": payload.product_id,
                "from_warehouse_id": payload.from_warehouse_id,
                "to_warehouse_id": payload.to_warehouse_id,
                "quantity": payload.quantity,
                "status": "DONE"
            })
            .execute()
        )

        transfer = transfer_response.data[0]

        # Move stock
        result = transfer_stock(
            product_id=payload.product_id,
            from_warehouse_id=payload.from_warehouse_id,
            to_warehouse_id=payload.to_warehouse_id,
            quantity=payload.quantity
        )

        # Ledger
        ledger_response = (
            supabase
            .table("stock_ledger")
            .insert({
                "product_id": payload.product_id,
                "operation_type": "TRANSFER",
                "quantity": payload.quantity,
                "from_warehouse_id": payload.from_warehouse_id,
                "to_warehouse_id": payload.to_warehouse_id,
                "reference_id": transfer["id"],
                "notes": "Internal stock transfer"
            })
            .execute()
        )

        return {
            "success": True,
            "message": "Transfer completed and stock updated",
            "transfer_id": transfer["id"],
            "stock": result,
            "ledger": ledger_response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )