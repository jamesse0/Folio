from abc import ABC, abstractmethod

from app.models.photo import Photo


class PhotoDAOInterface(ABC):

    @abstractmethod
    def get_by_id(self, photo_id: int) -> Photo | None:
        pass

    @abstractmethod
    def get_by_user_id(self, user_id: int, skip: int, limit: int) -> list[Photo]:
        pass

    @abstractmethod
    def create(self, user_id: int, file_path: str, thumbnail_path: str, original_filename: str | None, caption: str | None) -> Photo:
        pass

    @abstractmethod
    def update_caption(self, photo_id: int, caption: str) -> Photo:
        pass

    @abstractmethod
    def delete(self, photo_id: int) -> None:
        pass