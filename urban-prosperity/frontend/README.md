# Urban Prosperity Frontend Dashboard

Modern analytical intelligence platform built with React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Leaflet.

## Features
- **Urban Observatory Command Center**: Research-grade visual interface with custom typography and restrained color aesthetics.
- **National CPI Ranking Table**: Interactive table with clickable rows, dynamic sorting, and dimension score breakdowns.
- **Six-Dimension Superimposed Radar Profiles**: High-resolution polygon visualization for individual and multi-city benchmarks.
- **Interactive Leaflet Geospatial Intelligence**: Visualized city markers with radii and color hues reflecting CPI performance.
- **City Detail Observatory**: Six large dimension cards, detailed progress bars for all 24 indicators, and dynamic AI-derived insights.
- **Air Quality Time-Series Forecasting**: 24-hour predictive PM2.5 trajectory with confidence interval envelopes.
- **SHAP Feature Explainability**: Horizontal bar charts illustrating positive drivers and negative drags behind estimated indicators.
- **Comparative Analysis Matrix**: Multi-city picker (2-5 cities) with side-by-side dimensional comparisons.
- **Indicator Registry & Methodology Whitepaper**: Complete mathematical equations and future government dataset registry.

## Startup Instructions

```bash
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```

Application will run at `http://localhost:5173` and proxy requests to the FastAPI backend at `http://127.0.0.1:8000`.
