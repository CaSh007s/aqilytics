
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
import os

# Load
df = pd.read_csv("data/historical/city_day.csv", parse_dates=['Datetime'])
df['Date'] = pd.to_datetime(df['Datetime'])

# 5 cities exactly as in CSV
cities = ["Delhi", "Mumbai", "Bengaluru", "Kolkata", "Chennai"]
df = df[df['City'].isin(cities)].copy()

# Clean missing values
df = df.dropna(subset=['AQI', 'PM2.5', 'PM10', 'NO2', 'CO', 'O3'])
df[['PM2.5','PM10','NO2','CO','O3']] = df[['PM2.5','PM10','NO2','CO','O3']].fillna(method='ffill').fillna(0)

# Features for the graph
df['Month'] = df['Date'].dt.month
df['Day'] = df['Date'].dt.day
df['DayOfWeek'] = df['Date'].dt.dayofweek
df['IsWeekend'] = (df['DayOfWeek'] >= 5).astype(int)

features = ['PM2.5', 'PM10', 'NO2', 'CO', 'O3', 'Month', 'Day', 'DayOfWeek', 'IsWeekend']
X = df[features]
y = df['AQI']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = xgb.XGBRegressor(n_estimators=600, max_depth=8, learning_rate=0.05, random_state=42)
model.fit(X_train, y_train)
print(f"Overall MAE: {mean_absolute_error(y_test, model.predict(X_test)):.2f}")

# Save one model per city
os.makedirs("models", exist_ok=True)
for city in cities:
    city_df = df[df['City'] == city]
    city_model = xgb.XGBRegressor(n_estimators=600, max_depth=8, learning_rate=0.05, random_state=42)
    city_model.fit(city_df[features], city_df['AQI'])
    joblib.dump(city_model, f"models/{city.lower()}_model.pkl")
    print(f"Saved → {city.lower()}_model.pkl")

print("Training complete!")