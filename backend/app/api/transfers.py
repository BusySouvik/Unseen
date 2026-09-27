from fastapi import APIRouter, HTTPException, Depends

from ..database import supabase
from ..auth import get_current_user
from ..schemas.transfers import TransferCreate
from ..services.transfer_service import transfer_stock

router = APIRouter(
    prefix="/transfers",
    tags=["Transfers"]
)


@router.post("/")
def create_transfer(
    payload: TransferCreate,
    current_user=Depends(get_current_user)
):
    user_id = str(current_user.id)

    try:
        # Verify product belongs to the logged-in user
        product_response = (
            supabase
            .table("products")
            .select("id, name, sku")
            .eq("id", payload.product_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not product_response.data:
            raise HTTPException(
                status_code=404,
                detail="Product not found."
            )

        # Verify source warehouse belongs to the logged-in user
        source_response = (
            supabase
            .table("warehouses")
            .select("id, name")
            .eq("id", payload.from_warehouse_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not source_response.data:
            raise HTTPException(
                status_code=404,
                detail="Source warehouse not found."
            )

        # Verify destination warehouse belongs to the logged-in user
        destination_response = (
            supabase
            .table("warehouses")
            .select("id, name")
            .eq("id", payload.to_warehouse_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not destination_response.data:
            raise HTTPException(
                status_code=404,
                detail="Destination warehouse not found."
            )

        if payload.from_warehouse_id == payload.to_warehouse_id:
            raise HTTPException(
                status_code=400,
                detail="Source and destination warehouses must be different."
            )

        # Create transfer owned by the logged-in user
        transfer_response = (
            supabase
            .table("transfers")
            .insert({
                "user_id": user_id,
                "product_id": payload.product_id,
                "from_warehouse_id": payload.from_warehouse_id,
                "to_warehouse_id": payload.to_warehouse_id,
                "quantity": payload.quantity,
                "status": "DONE"
            })
            .execute()
        )

        if not transfer_response.data:
            raise HTTPException(
                status_code=500,
                detail="Transfer could not be created."
            )

        transfer = transfer_response.data[0]

        # Move only this user's stock
        result = transfer_stock(
            product_id=payload.product_id,
            from_warehouse_id=payload.from_warehouse_id,
            to_warehouse_id=payload.to_warehouse_id,
            quantity=payload.quantity,
            user_id=user_id
        )

        # Create ledger entry owned by this user
        ledger_response = (
            supabase
            .table("stock_ledger")
            .insert({
                "user_id": user_id,
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

        if not ledger_response.data:
            raise HTTPException(
                status_code=500,
                detail="Transfer ledger entry could not be created."
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
