from app.routers.health import router as health_router
from app.routers.cities import router as cities_router
from app.routers.cpi import router as cpi_router
from app.routers.indicators import router as indicators_router
from app.routers.predictions import router as predictions_router

__all__ = [
    "health_router",
    "cities_router",
    "cpi_router",
    "indicators_router",
    "predictions_router"
]
