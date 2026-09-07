from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String, nullable=False)
    thumbnail_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=True)
    caption = Column(String, nullable=True)
    uploaded_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    is_ml_processed = Column(Boolean, default=False, nullable=False)

    owner = relationship("User", back_populates="photos")