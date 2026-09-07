from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String(255), nullable=True)
    name = Column(String(100), nullable=True)
    bio = Column(String(500), nullable=True)
    avatar_path = Column(String, nullable=True)
    portfolio_code = Column(String(8), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    photos = relationship("Photo", back_populates="owner", cascade="all, delete-orphan")