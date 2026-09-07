# Urban Prosperity Backend API

FastAPI and SQLAlchemy backend implementing an India-specific City Prosperity Index (CPI) measurement engine across six core dimensions.

## Key Features
- **Deterministic 6-Dimension CPI Engine**: Normalized arithmetic aggregation calculated strictly via statistical formulation (never a black-box ML direct prediction).
- **Relational Entity-Attribute-Value Indicator Architecture**: Add arbitrary future indicators without changing table schemas.
- **Automated CSV Ingestion**: Automatically ingests and normalizes `cities.csv` upon server startup.
- **Modular Machine Learning Facade**:
  - **PyTorch LSTM**: 24-hour PM2.5 air quality forecasting with diurnal atmospheric cycles.
  - **Ultralytics YOLOv8**: Pavement and road damage detection mapped to road quality indices.
  - **CatBoost & SHAP**: Tabular indicator estimation with Shapley value feature attribution.
  - Fallback mock engines ensure 100% endpoint stability even without pre-trained model weights.

## Startup Instructions

```bash
# Navigate to backend
cd backend

# Install dependencies (Python 3.11+)
pip install -r requirements.txt

# Run database migrations and start server
uvicorn app.main:app --reload --port 8000
```

## Running Automated Tests

```bash
pytest -v
```

All 21 unit and integration tests validate CSV ingestion, edge-case normalization (max == min), 0-100 score bounds, ranking sorting, and REST API contracts.
