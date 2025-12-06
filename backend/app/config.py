import os
from datetime import timedelta


class Settings:
    """Default application configuration."""

    API_PREFIX = os.getenv("API_PREFIX", "/api/v1")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://abram_user:abram_pass@db:5432/abram_db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv(
        "JWT_SECRET", "change-this-secret"
    )
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_EXPIRES_MINUTES", "60"))
    )
    APP_NAME = os.getenv("APP_NAME", "Instituto ABRAMS API")
    ENVIRONMENT = os.getenv("FLASK_ENV", os.getenv("APP_ENV", "development"))
    BACKEND_CORS_ORIGINS = os.getenv(
        "BACKEND_CORS_ORIGINS", os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    ).split(",")
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads"))
    MEDIA_BASE_URL = os.getenv("MEDIA_BASE_URL", "/uploads")
