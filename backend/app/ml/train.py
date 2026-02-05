import xgboost as xgb
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.metrics import mean_squared_error, mean_absolute_error
from app.core.config import settings
from app.ml.features import AQIFeatureEngineer

def train_model():
    print("🔄 Initializing Training Pipeline...")
    
    # 1. Load & Process Data
    csv_path = "data/raw/aqi_data.csv" # Ensure this exists!
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}. Please place your Delhi CSV there.")

    engineer = AQIFeatureEngineer()
    df = engineer.prepare_training_data(csv_path)
    
    print(f"✅ Data Processed. Shape: {df.shape}")

    # 2. Split Data
    split_idx = int(len(df) * 0.8)
    
    features = [c for c in df.columns if c not in ['Date', 'AQI', 'City', 'AQI_Bucket']]
    target = 'AQI'
    
    X_train = df.iloc[:split_idx][features]
    y_train = df.iloc[:split_idx][target]
    
    X_test = df.iloc[split_idx:][features]
    y_test = df.iloc[split_idx:][target]

    print(f"📊 Training on {len(X_train)} samples, Validating on {len(X_test)} samples.")

    # 3. Train XGBoost
    model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_estimators=1000,
        learning_rate=0.05,
        max_depth=6,
        early_stopping_rounds=50,
        n_jobs=-1
    )
    
    model.fit(
        X_train, y_train,
        eval_set=[(X_train, y_train), (X_test, y_test)],
        verbose=100
    )

    # 4. Evaluate
    predictions = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    mae = mean_absolute_error(y_test, predictions)
    
    print(f"\n🎯 Model Evaluation Results:")
    print(f"   RMSE: {rmse:.4f}")
    print(f"   MAE:  {mae:.4f}")

    # 5. Save Model
    os.makedirs(os.path.dirname(settings.MODEL_PATH), exist_ok=True)
    
    # Save XGBoost model JSON
    model.save_model(settings.MODEL_PATH)
    print(f"💾 Model saved to {settings.MODEL_PATH}")
    
    metadata = {
        "features": features,
        "rmse": rmse
    }
    joblib.dump(metadata, settings.MODEL_PATH.replace(".json", "_metadata.pkl"))
    print("💾 Metadata saved.")

if __name__ == "__main__":
    train_model()