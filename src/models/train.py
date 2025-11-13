"""
Train XGBoost model for any city.
Handles tiny or empty data with mock training.
"""
import pandas as pd
import xgboost as xgb
from joblib import dump
import os
import sys
import numpy as np

# === GET CITY ===
if len(sys.argv) < 2:
    print("Usage: python src/models/train.py <city>")
    sys.exit(1)
city = sys.argv[1].lower()

# === LOAD DATA ===
try:
    df = pd.read_csv(f"data/processed/{city}_features.csv")
    df['timestamp'] = pd.to_datetime(df['timestamp'])
except FileNotFoundError:
    print(f"Data not found for {city}. Using mock training...")
    df = pd.DataFrame()

# === TARGET: AQI in 6 hours ===
if len(df) > 0:
    df['aqi_future'] = df['aqi'].shift(-6)
    df = df.dropna(subset=['aqi_future'])
else:
    df = pd.DataFrame()

# === FEATURES ===
features = [
    'pm25', 'pm10', 'temp', 'humidity', 'wind_speed',
    'hour', 'is_night', 'pm25_lag_1', 'temp_rolling_6h', 'wind_calms'
]

# === IF NO DATA → CREATE MOCK ===
if len(df) == 0:
    print(f"No valid data for {city}. Using mock training...")
    mock = pd.DataFrame({
        'timestamp': pd.date_range("2025-04-01", periods=20, freq='h'),
        'aqi': np.random.randint(50, 400, 20),
        'pm25': np.random.randint(20, 300, 20),
        'pm10': np.random.randint(30, 400, 20),
        'temp': np.random.uniform(15, 35, 20),
        'humidity': np.random.uniform(30, 90, 20),
        'wind_speed': np.random.uniform(0, 10, 20),
        'hour': np.random.randint(0, 24, 20),
        'is_night': np.random.choice([0, 1], 20),
        'pm25_lag_1': np.random.randint(20, 300, 20),
        'temp_rolling_6h': np.random.uniform(15, 35, 20),
        'wind_calms': np.random.choice([0, 1], 20),
        'aqi_future': np.random.randint(50, 400, 20)
    })
    df = mock

# === FINAL X, y ===
X = df[features]
y = df['aqi_future']

# === TRAIN ===
model = xgb.XGBRegressor(n_estimators=50, learning_rate=0.1, max_depth=4)
model.fit(X, y)

# === SAVE MODEL ===
os.makedirs("models", exist_ok=True)
model_path = f"models/xgb_model_{city}.pkl"
dump(model, model_path)

# === FORECAST NEXT 6 HOURS ===
latest = df.iloc[-1:].copy()
forecast = []
current = latest.copy()

for _ in range(6):
    pred = model.predict(current[features])[0]
    forecast.append(pred)
    
    # Update lagged features
    current['pm25_lag_1'] = current['pm25'].values
    current['aqi'] = pred
    current['timestamp'] = pd.to_datetime(current['timestamp']) + pd.Timedelta(hours=1)
    current['hour'] = current['timestamp'].dt.hour
    current['is_night'] = current['hour'].isin([22,23,0,1,2,3,4,5,6]).astype(int)
    current['temp_rolling_6h'] = current['temp'].rolling(6, min_periods=1).mean().iloc[-1]

# === SAVE FORECAST ===
future_times = pd.date_range(
    pd.to_datetime(latest['timestamp'].iloc[0]) + pd.Timedelta(hours=1),
    periods=6, freq='h'
)
forecast_df = pd.DataFrame({
    'timestamp': future_times,
    'aqi_forecast': forecast
})
os.makedirs("data/processed", exist_ok=True)
forecast_df.to_csv(f"data/processed/{city}_forecast.csv", index=False)

print(f"Model saved → {model_path}")
print(f"Forecast saved → data/processed/{city}_forecast.csv")