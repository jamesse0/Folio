from abc import ABC, abstractmethod

from app.models.user import User


class PortfolioDAOInterface(ABC):

    @abstractmethod
    def get_by_code(self, code: str) -> User | None:
        pass

    @abstractmethod
    def update_code(self, user_id: int, new_code: str) -> None:
        pass

    @abstractmethod
    def code_exists(self, code: str) -> bool:
        pass