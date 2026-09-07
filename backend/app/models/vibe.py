# Phase 2
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class VibeLabel(Base):
    __tablename__ = "vibe_labels"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    labeled_photo_count = Column(Integer, default=0, nullable=False)


class PhotoVibe(Base):
    __tablename__ = "photo_vibes"

    photo_id = Column(Integer, ForeignKey("photos.id", ondelete="CASCADE"), primary_key=True)
    vibe_label_id = Column(Integer, ForeignKey("vibe_labels.id", ondelete="CASCADE"), primary_key=True)
    is_manual = Column(Boolean, default=False, nullable=False)
    confidence = Column(Float, nullable=True)


class VibeModel(Base):
    __tablename__ = "vibe_models"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    model_blob_path = Column(String, nullable=False)
    trained_at = Column(DateTime, server_default=func.now(), nullable=False)
    version = Column(Integer, default=1, nullable=False)