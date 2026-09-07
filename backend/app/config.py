from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str

    # Auth
    jwt_secret: str
    jwt_expire_days: int = 7

    # File storage
    upload_dir: str
    thumbnail_dir: str
    max_upload_mb: int = 25

    # ML thresholds (Phase 2)
    face_cluster_min_size: int = 3
    face_similarity_threshold: float = 0.6
    vibe_degradation_threshold: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
