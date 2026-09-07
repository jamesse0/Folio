from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.models.user import User
from app.schemas.photo import PortfolioResponse
from app.services import portfolio as portfolio_service
from app.utils.security import get_current_user

router = APIRouter()


@router.get("/code")
def get_code(user: User = Depends(get_current_user)):
    return {"code": portfolio_service.get_code(user)}


@router.post("/code/regenerate")
def regenerate_code(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {"code": portfolio_service.regenerate_code(user, db)}


@router.get("/{code}", response_model=PortfolioResponse)
@limiter.limit("20/minute")
def get_portfolio(request: Request, code: str, db: Session = Depends(get_db)):
    return portfolio_service.get_portfolio(code, db)