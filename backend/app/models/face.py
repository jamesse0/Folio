# Phase 2
from sqlalchemy import Column, Float, ForeignKey, Integer, String

from app.database import Base


class FaceCluster(Base):
    __tablename__ = "face_clusters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cluster_label = Column(String, nullable=False)
    size = Column(Integer, default=0, nullable=False)
    representative_thumbnail_path = Column(String, nullable=True)


class PhotoFaceCluster(Base):
    __tablename__ = "photo_face_clusters"

    photo_id = Column(Integer, ForeignKey("photos.id", ondelete="CASCADE"), primary_key=True)
    face_cluster_id = Column(Integer, ForeignKey("face_clusters.id", ondelete="CASCADE"), primary_key=True)
    similarity_score = Column(Float, nullable=False)