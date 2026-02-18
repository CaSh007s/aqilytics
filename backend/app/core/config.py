import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aeronomy"
    API_V1_STR: str = "/api/v1"
    ENV_STATE: str = "dev"
    
    # Auth
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7" # Fallback
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    

    # External API
    OPENWEATHER_API_KEY: str
    
    # Database
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str


    # ML
    MODEL_PATH: str

    class Config:
        env_file = ".env"
        extra = "ignore" 

settings = Settings()