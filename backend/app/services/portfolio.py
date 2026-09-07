from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.dao.sql.sql_photo_dao import SQLPhotoDAO
from app.dao.sql.sql_portfolio_dao import SQLPortfolioDAO
from app.models.user import User
from app.schemas.photo import PortfolioResponse, PhotoResponse
from app.utils.portfolio_code import generate_unique_code


def get_code(user: User) -> str:
    return user.portfolio_code


def regenerate_code(user: User, db: Session) -> str:
    new_code = generate_unique_code(SQLPortfolioDAO(db))
    SQLPortfolioDAO(db).update_code(user.id, new_code)
    return new_code


def get_portfolio(code: str, db: Session) -> PortfolioResponse:
    photographer = SQLPortfolioDAO(db).get_by_code(code)
    if not photographer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")

    photos = SQLPhotoDAO(db).get_by_user_id(photographer.id, skip=0, limit=100)

    return PortfolioResponse(
        photographer_name=photographer.name,
        photos=[PhotoResponse.model_validate(p) for p in photos],
    )