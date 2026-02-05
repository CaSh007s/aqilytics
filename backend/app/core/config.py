import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aeronomy"
    API_V1_STR: str = "/api/v1"
    ENV_STATE: str = "dev"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # External API
    OPENWEATHER_API_KEY: str
    
    # Database
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str

    # Redis
    REDIS_HOST: str
    REDIS_PORT: int

    # ML
    MODEL_PATH: str

    class Config:
        env_file = ".env"
        extra = "ignore" 

settings = Settings()