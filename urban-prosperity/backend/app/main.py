import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.data_loader import load_and_seed_data
from app.routers import (
    health_router,
    cities_router,
    cpi_router,
    indicators_router,
    predictions_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("urban_prosperity")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed CSV data
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    logger.info("Verifying city datasets from cities.csv...")
    db = SessionLocal()
    try:
        count = load_and_seed_data(db)
        logger.info(f"Database verified with {count} Indian city benchmarks.")
    except Exception as e:
        logger.error(f"Error during dataset initialization: {e}", exc_info=True)
    finally:
        db.close()

    yield
    # Shutdown
    logger.info("Shutting down Urban Prosperity Intelligence Platform API.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Production-oriented API providing an India-specific City Prosperity Index (CPI) "
        "synthesized across six core dimensions: Productivity, Infrastructure Development, "
        "Quality of Life, Equity and Social Inclusion, Environmental Sustainability, and Governance."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router, prefix="/api")
app.include_router(cities_router, prefix="/api")
app.include_router(cpi_router, prefix="/api")
app.include_router(indicators_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": "/api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
