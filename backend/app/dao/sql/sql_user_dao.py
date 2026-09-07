from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.dao.interfaces.user_dao import UserDAOInterface
from app.models.user import User


class SQLUserDAO(UserDAOInterface):

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(
            User.id == user_id,
            User.deleted_at == None
        ).first()

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(
            User.username == username,
            User.deleted_at == None
        ).first()

    def create(self, username: str, password_hash: str, email: str | None, portfolio_code: str) -> User:
        user = User(
            username=username,
            password_hash=password_hash,
            email=email,
            portfolio_code=portfolio_code,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_profile(self, user_id: int, name: str | None, bio: str | None, avatar_path: str | None, email: str | None) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if name is not None:
            user.name = name
        if bio is not None:
            user.bio = bio
        if avatar_path is not None:
            user.avatar_path = avatar_path
        if email is not None:
            user.email = email
        self.db.commit()
        self.db.refresh(user)
        return user

    def soft_delete(self, user_id: int) -> None:
        user = self.db.query(User).filter(User.id == user_id).first()
        user.deleted_at = datetime.now(timezone.utc)
        self.db.commit()

    def hard_delete(self, user_id: int) -> None:
        user = self.db.query(User).filter(User.id == user_id).first()
        self.db.delete(user)
        self.db.commit()