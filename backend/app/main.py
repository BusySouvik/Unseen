import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.products import router as products_router
from .api.inventory import router as inventory_router
from .api.warehouses import router as warehouses_router
from .api.receipts import router as receipts_router
from .api.deliveries import router as deliveries_router
from .api.transfers import router as transfers_router
from .api.adjustments import router as adjustments_router
from .api.dashboard import router as dashboard_router
from .api.ledger import router as ledger_router
from .api.operations import router as operations_router


app = FastAPI(
    title="StockSense API",
    description="Inventory Management System API",
    version="1.0.0",
)


# Frontend URL for production.
# Locally, Vite runs on port 5173.
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    frontend_url,
]

# Remove duplicates while preserving order.
allowed_origins = list(dict.fromkeys(allowed_origins))


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(products_router)
app.include_router(inventory_router)
app.include_router(warehouses_router)
app.include_router(receipts_router)
app.include_router(deliveries_router)
app.include_router(transfers_router)
app.include_router(adjustments_router)
app.include_router(dashboard_router)
app.include_router(ledger_router)
app.include_router(operations_router)


@app.get("/")
def root():
    return {
        "message": "StockSense API is running",
        "status": "online",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }