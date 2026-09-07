# Urban Prosperity Intelligence Platform

Production-oriented India-specific City Prosperity Index (CPI) measurement platform based on six core urban dimensions:
1. Productivity
2. Infrastructure Development
3. Quality of Life
4. Equity and Social Inclusion
5. Environmental Sustainability
6. Governance and Legislation

## Quickstart

### Running the Backend
```bash
cd urban-prosperity/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be accessible at: `http://127.0.0.1:8000/docs`

### Running the Frontend
```bash
cd urban-prosperity/frontend
npm install
npm run dev
```
Dashboard will be accessible at: `http://localhost:5173`

### Running Automated Tests
```bash
cd urban-prosperity/backend
pytest -v
```

All 21 unit and integration tests validate CSV ingestion, edge-case normalization (max == min), 0-100 score bounds, ranking sorting, and REST API contracts.
