from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.dao.sql.sql_portfolio_dao import SQLPortfolioDAO
from app.dao.sql.sql_user_dao import SQLUserDAO
from app.models.user import User
from app.schemas.auth import LoginRequest, ProfileUpdate, RegisterRequest, TokenResponse
from app.utils.portfolio_code import generate_unique_code
from app.utils.security import create_token, hash_password, verify_password


def register(body: RegisterRequest, db: Session) -> User:
    if SQLUserDAO(db).get_by_username(body.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )
    hashed = hash_password(body.password)
    code = generate_unique_code(SQLPortfolioDAO(db))
    return SQLUserDAO(db).create(body.username, hashed, body.email, code)


def login(body: LoginRequest, db: Session) -> TokenResponse:
    user = SQLUserDAO(db).get_by_username(body.username)
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    token = create_token(user.id)
    return TokenResponse(access_token=token)


def update_profile(body: ProfileUpdate, user: User, db: Session) -> User:
    return SQLUserDAO(db).update_profile(
        user_id=user.id,
        name=body.name,
        bio=body.bio,
        avatar_path=None,
        email=body.email,
    )


def delete_account(user: User, db: Session) -> None:
    import os

    from app.dao.sql.sql_photo_dao import SQLPhotoDAO

    photos = SQLPhotoDAO(db).get_by_user_id(user.id, skip=0, limit=999999)
    for photo in photos:
        for path in (photo.file_path, photo.thumbnail_path):
            try:
                os.remove(path)
            except FileNotFoundError:
                pass

    SQLUserDAO(db).hard_delete(user.id)