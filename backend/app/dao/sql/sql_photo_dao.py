from sqlalchemy.orm import Session

from app.dao.interfaces.photo_dao import PhotoDAOInterface
from app.models.photo import Photo


class SQLPhotoDAO(PhotoDAOInterface):

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, photo_id: int) -> Photo | None:
        return self.db.query(Photo).filter(Photo.id == photo_id).first()

    def get_by_user_id(self, user_id: int, skip: int = 0, limit: int = 50) -> list[Photo]:
        return (
            self.db.query(Photo)
            .filter(Photo.user_id == user_id)
            .order_by(Photo.uploaded_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, user_id: int, file_path: str, thumbnail_path: str, original_filename: str | None, caption: str | None) -> Photo:
        photo = Photo(
            user_id=user_id,
            file_path=file_path,
            thumbnail_path=thumbnail_path,
            original_filename=original_filename,
            caption=caption,
        )
        self.db.add(photo)
        self.db.commit()
        self.db.refresh(photo)
        return photo

    def update_caption(self, photo_id: int, caption: str) -> Photo:
        photo = self.db.query(Photo).filter(Photo.id == photo_id).first()
        photo.caption = caption
        self.db.commit()
        self.db.refresh(photo)
        return photo

    def delete(self, photo_id: int) -> None:
        photo = self.db.query(Photo).filter(Photo.id == photo_id).first()
        self.db.delete(photo)
        self.db.commit()