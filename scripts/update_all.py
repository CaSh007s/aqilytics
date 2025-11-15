
import subprocess
import sys

CITIES = ["delhi", "mumbai", "bangalore", "kolkata", "bhopal"]

for city in CITIES:
    print(f"\n=== Updating {city.upper()} ===")
    subprocess.run(["python", "src/data/fetch_aqi.py", city], check=True)
    subprocess.run(["python", "src/data/fetch_weather.py", city], check=True)
    subprocess.run(["python", "src/features/merge_data.py", city], check=True)
    subprocess.run(["python", "src/models/train.py", city], check=True)

print("\nAll cities updated!")