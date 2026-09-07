from datetime import datetime

from pydantic import BaseModel


class PhotoResponse(BaseModel):
    id: int
    user_id: int
    file_path: str
    thumbnail_path: str
    original_filename: str | None
    caption: str | None
    uploaded_at: datetime
    is_ml_processed: bool
    # Phase 2 — populated once ML pipeline is active
    place_tags: list[str] = []
    vibe_label: str | None = None

    class Config:
        from_attributes = True


class CaptionUpdate(BaseModel):
    caption: str


class PortfolioResponse(BaseModel):
    photographer_name: str | None
    photos: list[PhotoResponse]