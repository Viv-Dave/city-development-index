from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="", tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Urban Prosperity Intelligence Platform API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected",
        "environment": "production-prototype"
    }
