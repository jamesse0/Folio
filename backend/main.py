import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import settings
from app.database import Base, engine
from app.limiter import limiter
import app.models  # registers all models with Base so create_all sees them
from app.routers import auth, photos, portfolio, profile

Base.metadata.create_all(bind=engine)

os.makedirs(settings.upload_dir, exist_ok=True)
os.makedirs(settings.thumbnail_dir, exist_ok=True)

app = FastAPI(title="Folio API")

app.mount("/uploads/originals", StaticFiles(directory=settings.upload_dir), name="originals")
app.mount("/uploads/thumbnails", StaticFiles(directory=settings.thumbnail_dir), name="thumbnails")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(photos.router, prefix="/photos", tags=["photos"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])