
import pandas as pd
import os
import logging
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_csv(filepath):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"{filepath} not found.")
    return pd.read_csv(filepath)

def merge_aqi_weather(city):
    print(f"Merging data for {city}...")

    # Load raw data
    aqi_current = load_csv(f"data/raw/{city}_current_aqi.csv")
    aqi_hist    = load_csv(f"data/raw/{city}_historical_aqi.csv")
    weather_current = load_csv(f"data/raw/{city}_current_weather.csv")
    weather_hist    = load_csv(f"data/raw/{city}_historical_weather.csv")

    # Combine AQI
    aqi = pd.concat([aqi_hist, aqi_current], ignore_index=True)
    aqi['timestamp'] = pd.to_datetime(aqi['timestamp'])

    # Combine Weather
    weather = pd.concat([weather_hist, weather_current], ignore_index=True)
    weather['timestamp'] = pd.to_datetime(weather['timestamp'])

    # Merge on timestamp (hourly)
    merged = pd.merge(aqi, weather, on=['city', 'timestamp'], how='inner')

    # EXTRACT PM2.5 & PM10 FROM WAQI (FALLBACK)
    def extract_pm(pollutants_str):
        if pd.isna(pollutants_str) or pollutants_str in ["{}", "null", ""]:
            return None, None
        try:
            data = eval(pollutants_str)
            pm25 = data.get('pm25') or data.get('pm2.5') or data.get('pm2_5')
            pm10 = data.get('pm10')
            return float(pm25) if pm25 else None, float(pm10) if pm10 else None
        except:
            return None, None

    merged[['pm25', 'pm10']] = merged['pollutants'].apply(
        lambda x: pd.Series(extract_pm(x))
    )

    # OVERRIDE WITH REAL PM2.5 (INDIA)
    cpcb_path = f"data/raw/{city}_cpcb_pm25.csv"
    if os.path.exists(cpcb_path):
        try:
            cpcb_df = pd.read_csv(cpcb_path)
            if not cpcb_df.empty and 'pm25' in cpcb_df.columns:
                real_pm25 = float(cpcb_df.iloc[-1]['pm25'])
                merged['pm25'] = real_pm25
                print(f"Using REAL PM2.5 from CPCB: {real_pm25} µg/m³")
            else:
                merged['pm25'] = merged['pm25'].fillna(50)
        except Exception as e:
            print(f"CPCB read error: {e}")
            merged['pm25'] = merged['pm25'].fillna(50)
    else:
        merged['pm25'] = merged['pm25'].fillna(50)

    # Fallback PM10
    merged['pm10'] = merged['pm10'].fillna(100)

    # FEATURE ENGINEERING
    merged = merged.sort_values('timestamp')
    merged['hour'] = merged['timestamp'].dt.hour
    merged['is_night'] = merged['hour'].isin([22,23,0,1,2,3,4,5,6]).astype(int)

    merged['pm25_lag_1'] = merged['pm25'].shift(1).fillna(merged['pm25'])
    merged['temp_rolling_6h'] = merged['temp'].rolling(window=6, min_periods=1).mean()
    merged['wind_calms'] = (merged['wind_speed'] < 1.5).astype(int)

    # Final features
    features = [
        'aqi', 'pm25', 'pm10', 'temp', 'humidity', 'wind_speed',
        'hour', 'is_night', 'pm25_lag_1', 'temp_rolling_6h', 'wind_calms'
    ]

    # Save
    os.makedirs("data/processed", exist_ok=True)
    filepath = f"data/processed/{city}_features.csv"
    merged[features + ['timestamp']].to_csv(filepath, index=False)
    logger.info(f"Saved → {filepath}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/features/merge_data.py <city>")
        sys.exit(1)
    city = sys.argv[1].lower()
    merge_aqi_weather(city)