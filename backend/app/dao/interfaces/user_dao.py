from abc import ABC, abstractmethod

from app.models.user import User


class UserDAOInterface(ABC):

    @abstractmethod
    def get_by_id(self, user_id: int) -> User | None:
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> User | None:
        pass

    @abstractmethod
    def create(self, username: str, password_hash: str, email: str | None, portfolio_code: str) -> User:
        pass

    @abstractmethod
    def update_profile(self, user_id: int, name: str | None, bio: str | None, avatar_path: str | None, email: str | None) -> User:
        pass

    @abstractmethod
    def soft_delete(self, user_id: int) -> None:
        pass

    @abstractmethod
    def hard_delete(self, user_id: int) -> None:
        pass