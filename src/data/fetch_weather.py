"""
Fetch weather for any city.
"""
import requests
import pandas as pd
import os
import logging
from datetime import datetime, timedelta
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from dotenv import load_dotenv
load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not OPENWEATHER_API_KEY:
    raise ValueError("OPENWEATHER_API_KEY not found in .env")

# City → (lat, lon)
CITY_COORDS = {
    "delhi": (28.6139, 77.2090),
    "mumbai": (19.0760, 72.8777),
    "bangalore": (12.9716, 77.5946),
    "kolkata": (22.5726, 88.3639),
    "bhopal": (23.2599, 77.4126)
}

def fetch_current_weather(city):
    print(f"Fetching current weather for {city}...")
    lat, lon = CITY_COORDS[city]
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return pd.DataFrame()
    data = response.json()
    record = {
        'city': city,
        'timestamp': datetime.fromtimestamp(data['dt']).strftime("%Y-%m-%d %H:%M:%S"),
        'temp': data['main']['temp'],
        'humidity': data['main']['humidity'],
        'pressure': data['main']['pressure'],
        'wind_speed': data['wind']['speed'],
        'rain_1h': data.get('rain', {}).get('1h', 0)
    }
    df = pd.DataFrame([record])
    filepath = f"data/raw/{city}_current_weather.csv"
    os.makedirs("data/raw", exist_ok=True)
    df.to_csv(filepath, index=False)
    logger.info(f"Saved → {filepath}")
    return df

def fetch_historical_weather(city):
    print(f"Fetching historical weather for {city} (mock)...")
    records = []
    for i in range(7):
        d = datetime.now() - timedelta(days=i)
        records.append({
            'city': city,
            'timestamp': d.strftime("%Y-%m-%d %H:00:00"),
            'temp': 25 + i % 3,
            'humidity': 60 + i,
            'pressure': 1013,
            'wind_speed': 3.5 + i * 0.2,
            'rain_1h': 0
        })
    df = pd.DataFrame(records)
    filepath = f"data/raw/{city}_historical_weather.csv"
    df.to_csv(filepath, index=False)
    logger.info(f"Saved 7 mock records → {filepath}")
    return df

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/data/fetch_weather.py <city>")
        sys.exit(1)
    city = sys.argv[1].lower()
    if city not in CITY_COORDS:
        print(f"City {city} not supported. Choose: {list(CITY_COORDS.keys())}")
        sys.exit(1)
    fetch_current_weather(city)
    fetch_historical_weather(city)