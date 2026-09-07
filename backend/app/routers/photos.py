from fastapi import APIRouter, BackgroundTasks, Depends, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.ml.pipeline import run as ml_run
from app.models.user import User
from app.schemas.photo import CaptionUpdate, PhotoResponse
from app.services import photo as photo_service
from app.utils.security import get_current_user

router = APIRouter()


@router.get("", response_model=list[PhotoResponse])
def get_photos(
    skip: int = 0,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return photo_service.get_photos(user.id, skip, limit, db)


@router.post("", response_model=PhotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    caption: str | None = Form(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_bytes = await file.read()
    photo = photo_service.upload(file_bytes, file.filename, caption, user, db)
    background_tasks.add_task(ml_run, photo.id)
    return photo


@router.patch("/{photo_id}", response_model=PhotoResponse)
def update_caption(
    photo_id: int,
    body: CaptionUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return photo_service.update_caption(photo_id, body.caption, user, db)


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    photo_service.delete_photo(photo_id, user, db)