import os
import requests
from dotenv import load_dotenv

# 1. Load the secret environment variables
load_dotenv()

api_key = os.getenv("OPENWEATHER_API_KEY")
print(f"🔑 Key loaded: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("❌ ERROR: No API Key found. Check your .env file!")
    exit()

# 2. Make the request manually
url = "https://api.openweathermap.org/data/2.5/weather"
params = {
    "q": "Delhi",
    "appid": api_key,
    "units": "metric"
}

print(f"🌍 Connecting to {url}...")
response = requests.get(url, params=params)

# 3. Show the RAW truth
print(f"📡 Status Code: {response.status_code}")
print(f"📄 Response Body: {response.text}")