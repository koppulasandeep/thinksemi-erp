"""Application configuration via Pydantic v2 Settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://pcberp:pcberp123@localhost:5432/pcb_erp"
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: list[str] = [
        "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://thinksemi-erp.netlify.app",
    ]

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""

    BASE_URL: str = "http://localhost:8000"

    STORAGE_BACKEND: str = "local"
    STORAGE_DIR: str = "storage"

    S3_BUCKET: str = ""
    S3_REGION: str = "ap-south-1"
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    def model_post_init(self, __context: object) -> None:
        is_default_key = self.SECRET_KEY == "change-me-in-production"
        is_local_db = "localhost" in self.DATABASE_URL or "127.0.0.1" in self.DATABASE_URL
        if is_default_key and not is_local_db:
            raise ValueError("SECRET_KEY must be changed when not using localhost DB.")


settings = Settings()
