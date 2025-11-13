"""
Train XGBoost model to predict AQI 6 hours ahead.
Input: data/processed/delhi_features.csv
Output: models/xgb_model.pkl + data/processed/forecast.csv
"""
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from joblib import dump
import os

# Load data
df = pd.read_csv("data/processed/delhi_features.csv")
df['timestamp'] = pd.to_datetime(df['timestamp'])

# === TARGET: AQI in 6 hours ===
df['aqi_future'] = df['aqi'].shift(-6)
df = df.dropna()  # Remove last 6 rows

# Features
features = [
    'pm25', 'pm10', 'temp', 'humidity', 'wind_speed',
    'hour', 'is_night', 'pm25_lag_1', 'temp_rolling_6h', 'wind_calms'
]
X = df[features]
y = df['aqi_future']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

# Train
model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5)
model.fit(X_train, y_train)

# Save model
os.makedirs("models", exist_ok=True)
dump(model, "models/xgb_model.pkl")

# === FORECAST NEXT 6 HOURS ===
latest = df.iloc[-1:]
forecast_steps = 6
forecast = []

current = latest.copy()
for _ in range(forecast_steps):
    pred = model.predict(current[features])[0]
    forecast.append(pred)
    
    # Shift data forward
    current['pm25_lag_1'] = current['pm25'].values
    current['aqi'] = pred
    current['timestamp'] = current['timestamp'] + pd.Timedelta(hours=1)
    current['hour'] = current['timestamp'].dt.hour
    current['is_night'] = current['hour'].isin([22,23,0,1,2,3,4,5,6]).astype(int)
    current['temp_rolling_6h'] = current['temp'].rolling(6, min_periods=1).mean()

# Save forecast
future_times = pd.date_range(df['timestamp'].iloc[-1] + pd.Timedelta(hours=1), periods=6, freq='h')
forecast_df = pd.DataFrame({
    'timestamp': future_times,
    'aqi_forecast': forecast
})
os.makedirs("data/processed", exist_ok=True)
forecast_df.to_csv("data/processed/forecast.csv", index=False)

if len(X_test) > 0:
    score = model.score(X_test, y_test)
    print(f"Model trained. R²: {score:.3f}")
else:
    print("Model trained. (Too few samples for score)")