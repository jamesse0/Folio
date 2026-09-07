import os

from fastapi import HTTPException, status

from app.config import settings
from sqlalchemy.orm import Session

from app.dao.sql.sql_photo_dao import SQLPhotoDAO
from app.models.photo import Photo
from app.models.user import User
from app.utils.images import save_upload


def upload(
    file_bytes: bytes,
    original_filename: str,
    caption: str | None,
    user: User,
    db: Session,
) -> Photo:
    file_path, thumbnail_path = save_upload(file_bytes, original_filename)
    return SQLPhotoDAO(db).create(
        user_id=user.id,
        file_path=file_path,
        thumbnail_path=thumbnail_path,
        original_filename=original_filename,
        caption=caption,
    )


def get_photos(user_id: int, skip: int, limit: int, db: Session) -> list[Photo]:
    return SQLPhotoDAO(db).get_by_user_id(user_id, skip, limit)


def update_caption(photo_id: int, caption: str, user: User, db: Session) -> Photo:
    photo = SQLPhotoDAO(db).get_by_id(photo_id)
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
    if photo.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your photo")
    return SQLPhotoDAO(db).update_caption(photo_id, caption)


def delete_photo(photo_id: int, user: User, db: Session) -> None:
    photo = SQLPhotoDAO(db).get_by_id(photo_id)
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
    if photo.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your photo")

    for full_path in (
        os.path.join(settings.upload_dir, photo.file_path),
        os.path.join(settings.thumbnail_dir, photo.thumbnail_path),
    ):
        try:
            os.remove(full_path)
        except FileNotFoundError:
            pass

    SQLPhotoDAO(db).delete(photo_id)