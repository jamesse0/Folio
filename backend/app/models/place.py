# Phase 2
from sqlalchemy import Column, ForeignKey, Integer, String

from app.database import Base


class PlaceTag(Base):
    __tablename__ = "place_tags"

    id = Column(Integer, primary_key=True, index=True)
    photo_id = Column(Integer, ForeignKey("photos.id", ondelete="CASCADE"), nullable=False, index=True)
    tag = Column(String, nullable=False)