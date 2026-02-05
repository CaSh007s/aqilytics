import xgboost as xgb
import joblib
import pandas as pd
import os
from app.core.config import settings

class AQIPredictor:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self.load_model()

    def load_model(self):
        if not os.path.exists(settings.MODEL_PATH):
            print(f"⚠️ Model not found at {settings.MODEL_PATH}. Run training first.")
            return

        # Load XGBoost
        self.model = xgb.XGBRegressor()
        self.model.load_model(settings.MODEL_PATH)
        
        # Load Metadata
        meta_path = settings.MODEL_PATH.replace(".json", "_metadata.pkl")
        if os.path.exists(meta_path):
            meta = joblib.load(meta_path)
            self.feature_names = meta.get("features", [])
        
        print("✅ Model loaded successfully.")

    def predict(self, input_data: dict) -> float:
        """
        Accepts a dictionary of features, converts to DF, and predicts.
        """
        if not self.model:
            raise RuntimeError("Model is not loaded.")
            
        # Convert input dict to DataFrame
        df = pd.DataFrame([input_data])
        
        # Ensure columns match training features
        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0 
        
        # Reorder columns to match training order
        df = df[self.feature_names]
        
        prediction = self.model.predict(df)
        return float(prediction[0])