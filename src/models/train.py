
import pandas as pd
import xgboost as xgb
from joblib import dump
import os
import sys
import numpy as np

if len(sys.argv) < 2:
    print("Usage: python src/models/train.py <city>")
    sys.exit(1)
city = sys.argv[1].lower()

try:
    df = pd.read_csv(f"data/processed/{city}_features.csv")
except FileNotFoundError:
    print(f"No data for {city}")
    sys.exit(1)

latest = df.iloc[-1:].copy()
latest['timestamp'] = pd.to_datetime(latest['timestamp'])

features = [
    'pm25', 'pm10', 'temp', 'humidity', 'wind_speed',
    'hour', 'is_night', 'pm25_lag_1', 'temp_rolling_6h', 'wind_calms'
]

train_df = df.tail(6).copy()
if len(train_df) < 2:
    print("Not enough data. Using mock training...")
    base_aqi = latest['aqi'].iloc[0]
    mock = pd.DataFrame({
        'aqi': np.linspace(base_aqi - 20, base_aqi + 20, 6),
        'pm25': [latest['pm25'].iloc[0]] * 6,
        'pm10': [latest['pm10'].iloc[0]] * 6,
        'temp': np.linspace(latest['temp'].iloc[0] - 2, latest['temp'].iloc[0] + 2, 6),
        'humidity': [latest['humidity'].iloc[0]] * 6,
        'wind_speed': [latest['wind_speed'].iloc[0]] * 6,
        'hour': [(latest['timestamp'].dt.hour.iloc[0] - i) % 24 for i in range(6)],
        'is_night': [1 if h in [22,23,0,1,2,3,4,5,6] else 0 for h in [(latest['timestamp'].dt.hour.iloc[0] - i) % 24 for i in range(6)]],
        'pm25_lag_1': [latest['pm25'].iloc[0]] * 6,
        'temp_rolling_6h': [latest['temp'].iloc[0]] * 6,
        'wind_calms': [latest['wind_calms'].iloc[0]] * 6,
    })
    X = mock[features]
    y = mock['aqi'].shift(-1).fillna(mock['aqi'])
else:
    X = train_df[features]
    y = train_df['aqi'].shift(-1).fillna(train_df['aqi'])

model = xgb.XGBRegressor(n_estimators=20, learning_rate=0.05, max_depth=3)
model.fit(X, y)

os.makedirs("models", exist_ok=True)
dump(model, f"models/xgb_model_{city}.pkl")

current = latest.copy()
forecast = []
for _ in range(6):
    pred = model.predict(current[features])[0]
    pred = max(0, min(500, pred))
    forecast.append(round(pred, 1))
    
    current['pm25_lag_1'] = current['pm25']
    current['aqi'] = pred
    current['timestamp'] = current['timestamp'] + pd.Timedelta(hours=1)
    current['hour'] = current['timestamp'].dt.hour
    current['is_night'] = current['hour'].isin([22,23,0,1,2,3,4,5,6]).astype(int)
    current['temp_rolling_6h'] = current['temp']

future_times = pd.date_range(
    start=latest['timestamp'].iloc[0] + pd.Timedelta(hours=1),
    periods=6, freq='h'
)
forecast_df = pd.DataFrame({
    'timestamp': future_times,
    'aqi_forecast': forecast
})
os.makedirs("data/processed", exist_ok=True)
forecast_df.to_csv(f"data/processed/{city}_forecast.csv", index=False)

print(f"Model saved → models/xgb_model_{city}.pkl")
print(f"Forecast saved → data/processed/{city}_forecast.csv")
