from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..database import supabase


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    sku: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=100)
    unit: str = Field(..., min_length=1, max_length=30)
    reorder_level: float = Field(default=0, ge=0)


@router.get("/")
def get_products():
    try:
        response = (
            supabase
            .table("products")
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


@router.post("/")
def create_product(product: ProductCreate):
    try:
        # Check for duplicate SKU first
        existing = (
            supabase
            .table("products")
            .select("id")
            .eq("sku", product.sku.strip())
            .limit(1)
            .execute()
        )

        if existing.data:
            raise HTTPException(
                status_code=409,
                detail=f"Product with SKU '{product.sku}' already exists."
            )

        response = (
            supabase
            .table("products")
            .insert({
                "name": product.name.strip(),
                "sku": product.sku.strip(),
                "category": product.category.strip(),
                "unit": product.unit.strip(),
                "reorder_level": product.reorder_level,
            })
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Product could not be created."
            )

        return {
            "success": True,
            "message": "Product created successfully.",
            "data": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
