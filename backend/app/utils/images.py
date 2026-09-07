import os
import uuid
from io import BytesIO

from fastapi import HTTPException, status
from PIL import Image

from app.config import settings

THUMBNAIL_MAX_SIZE = (400, 400)


def check_size(file_bytes: bytes) -> None:
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {settings.max_upload_mb} MB limit",
        )


def validate_image(file_bytes: bytes) -> None:
    try:
        image = Image.open(BytesIO(file_bytes))
        image.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is not a valid image",
        )


def build_filename(original_filename: str) -> str:
    _, ext = os.path.splitext(original_filename)
    return f"{uuid.uuid4()}{ext.lower()}"


def process_image(file_bytes: bytes) -> tuple[Image.Image, Image.Image]:
    image = Image.open(BytesIO(file_bytes))

    # convert to RGB so EXIF stripping works across all formats (e.g. PNG, HEIC)
    image = image.convert("RGB")

    # thumbnail is generated before any resizing of the original
    thumbnail = image.copy()
    thumbnail.thumbnail(THUMBNAIL_MAX_SIZE)

    return image, thumbnail


def save_upload(file_bytes: bytes, original_filename: str) -> tuple[str, str]:
    check_size(file_bytes)
    validate_image(file_bytes)

    filename = build_filename(original_filename)

    original, thumbnail = process_image(file_bytes)

    original_path = os.path.join(settings.upload_dir, filename)
    thumbnail_path = os.path.join(settings.thumbnail_dir, filename)

    # saving without exif kwarg strips all metadata automatically
    original.save(original_path, format="JPEG", quality=95)
    thumbnail.save(thumbnail_path, format="JPEG", quality=85)

    # return just the filename so the DB stays path-agnostic
    return filename, filename