# Urban Prosperity Intelligence Platform

An India-specific City Prosperity Index (CPI) measurement and analytical intelligence platform.

Designed to evaluate urban prosperity across six core dimensions:
1. **Productivity**
2. **Infrastructure Development**
3. **Quality of Life**
4. **Equity and Social Inclusion**
5. **Environmental Sustainability**
6. **Governance and Legislation**

## System Architecture

```
Raw Municipal Data / Vision / Sensors
               ↓
 AI & Statistical Measurement Models (LSTM, YOLOv8, CatBoost)
               ↓
    24 Standardized Indicators
               ↓
 Min-Max Normalization (Positive & Negative Formulations)
               ↓
      Six CPI Dimensions
               ↓
     Composite Overall CPI Score
               ↓
 Interactive Analytical Dashboard (React + TypeScript + Recharts + Leaflet)
```

## Quickstart

### 1. Backend Service
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to explore the dashboard.

### 3. Docker Compose (Optional)
```bash
docker-compose up --build
```
