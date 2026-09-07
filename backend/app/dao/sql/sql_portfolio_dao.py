from sqlalchemy.orm import Session

from app.dao.interfaces.portfolio_dao import PortfolioDAOInterface
from app.models.user import User


class SQLPortfolioDAO(PortfolioDAOInterface):

    def __init__(self, db: Session):
        self.db = db

    def get_by_code(self, code: str) -> User | None:
        return self.db.query(User).filter(
            User.portfolio_code == code,
            User.deleted_at == None
        ).first()

    def update_code(self, user_id: int, new_code: str) -> None:
        user = self.db.query(User).filter(User.id == user_id).first()
        user.portfolio_code = new_code
        self.db.commit()

    def code_exists(self, code: str) -> bool:
        return self.db.query(User).filter(User.portfolio_code == code).first() is not None