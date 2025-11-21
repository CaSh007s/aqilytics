# AQILytics 🌬️

**Real-time Air Quality Prediction Platform**  
Predicts AQI for the next 1–24 hours using ML + live weather data.

## Features
- Live AQI + 24h forecast
- Confidence bands
- SHAP explanations
- Multi-city ready
- Docker + Streamlit

## Quick Start
```bash
pip install -r requirements.txt
streamlit run app.py
```

## Data Pipeline

- **AQI**: WAQI API (live current, mock historical)
- **Weather**: OpenWeatherMap (live current, mock historical)
- **Output**: `data/raw/delhi_*.csv`
- **Upgrade Path**: One Call 3.0 (paid) for real history
