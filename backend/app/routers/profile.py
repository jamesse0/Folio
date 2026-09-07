from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import ProfileUpdate, UserResponse
from app.services import auth as auth_service
from app.utils.security import get_current_user

router = APIRouter()


@router.get("", response_model=UserResponse)
def get_profile(user: User = Depends(get_current_user)):
    return user


@router.patch("", response_model=UserResponse)
def update_profile(
    body: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return auth_service.update_profile(body, user, db)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth_service.delete_account(user, db)