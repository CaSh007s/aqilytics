"""
Fetch weather from OpenWeatherMap (free tier: current + forecast).
Mock historical for training.
Extensible: Add paid historical later.
"""
import os
import requests
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
import yaml
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def load_config():
    with open("config/config.yaml", "r") as f:
        return yaml.safe_load(f)

def fetch_current_weather(city_config):
    """Fetch current weather (free tier)."""
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        raise ValueError("Missing WEATHER_API_KEY in .env")
    
    base_url = city_config.get("apis", {}).get("weather_base", "https://api.openweathermap.org/data/2.5")
    url = f"{base_url}/weather"
    
    params = {
        "lat": city_config["lat"],
        "lon": city_config["lon"],
        "appid": api_key,
        "units": "metric"  # Celsius
    }
    
    response = requests.get(url, params=params)
    response.raise_for_status()
    
    data = response.json()
    current_time = datetime.fromtimestamp(data["dt"])
    
    result = {
        "timestamp": current_time.isoformat(),
        "city": city_config["name"],
        "temp": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "wind_speed": data["wind"]["speed"],
        "pressure": data["main"]["pressure"],
        "rain_1h": data.get("rain", {}).get("1h", 0),
        "lat": city_config["lat"],
        "lon": city_config["lon"]
    }
    logger.info(f"Fetched current weather for {city_config['name']}: {result['temp']}°C, {result['humidity']}% humidity")
    return result

def fetch_historical_weather(city_config, days_back=7):
    """
    Free tier: No historical. Mock realistic Delhi weather from current.
    For real history: Upgrade to One Call API 3.0 (paid).
    """
    logger.warning("OpenWeather free tier has no historical API. Using current + mock for training.")
    current = fetch_current_weather(city_config)
    historical = []
    base_time = datetime.fromisoformat(current["timestamp"].replace("Z", "+00:00"))
    
    for i in range(days_back):
        mock_time = base_time - timedelta(days=i)
        mock_entry = current.copy()
        mock_entry["timestamp"] = mock_time.isoformat()
        
        # Mock realistic Delhi variation: cooler nights, seasonal AQI boost
        hour = mock_time.hour
        mock_entry["temp"] = max(15, current["temp"] + (hour - 12) * 0.5 + (i % 3 - 1) * 2)  # Daily/seasonal swing
        mock_entry["humidity"] = min(95, current["humidity"] + (i % 5) * 5 + (24 - hour) * 0.5)  # Higher at night
        mock_entry["wind_speed"] = max(0, current["wind_speed"] + (i % 4 - 2) * 0.5)
        mock_entry["pressure"] = current["pressure"] + (i % 3 - 1) * 2
        
        historical.append(mock_entry)
    
    return historical

def save_to_csv(data_list, filepath):
    df = pd.DataFrame(data_list)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    logger.info(f"Saved {len(data_list)} records to {filepath}")

if __name__ == "__main__":
    config = load_config()
    delhi = next(c for c in config["cities"] if c["name"] == "Delhi")
    delhi["apis"] = config["apis"]
    
    # Fetch current
    current = fetch_current_weather(delhi)
    save_to_csv([current], "data/raw/delhi_current_weather.csv")
    
    # Mock historical
    historical = fetch_historical_weather(delhi, days_back=7)
    save_to_csv(historical, "data/raw/delhi_historical_weather.csv")