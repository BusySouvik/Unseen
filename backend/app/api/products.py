from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from ..database import supabase
from ..auth import get_current_user


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


class ProductUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    sku: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=100)
    unit: str = Field(..., min_length=1, max_length=30)
    reorder_level: float = Field(default=0, ge=0)


@router.get("/")
def get_products(
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)

    try:
        response = (
            supabase
            .table("products")
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
def create_product(
    product: ProductCreate,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)

    try:
        existing = (
            supabase
            .table("products")
            .select("id")
            .eq("sku", product.sku.strip())
            .eq("user_id", user_id)
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
                "user_id": user_id,
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
@router.put("/{product_id}")
def update_product(
    product_id: str,
    product: ProductUpdate,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)

    try:
        existing = (
            supabase
            .table("products")
            .select("id, sku")
            .eq("id", product_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not existing.data:
            raise HTTPException(
                status_code=404,
                detail="Product not found."
            )

        duplicate = (
            supabase
            .table("products")
            .select("id")
            .eq("sku", product.sku.strip())
            .eq("user_id", user_id)
            .neq("id", product_id)
            .limit(1)
            .execute()
        )

        if duplicate.data:
            raise HTTPException(
                status_code=409,
                detail=f"Product with SKU '{product.sku}' already exists."
            )

        response = (
            supabase
            .table("products")
            .update({
                "name": product.name.strip(),
                "sku": product.sku.strip(),
                "category": product.category.strip(),
                "unit": product.unit.strip(),
                "reorder_level": product.reorder_level,
            })
            .eq("id", product_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="Product could not be updated."
            )

        return {
            "success": True,
            "message": "Product updated successfully.",
            "data": response.data[0]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
