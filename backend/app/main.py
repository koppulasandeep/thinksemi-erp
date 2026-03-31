"""FastAPI application entry point for Thinksemi PCB Assembly ERP."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.api import api_router

app = FastAPI(
    title="Thinksemi PCB Assembly ERP API",
    version="1.0.0",
    description="Backend API for PCB Assembly Management System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

_static_dir = Path(__file__).parent / "static"
if _static_dir.is_dir():
    app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "version": "1.0.0", "app": "Thinksemi PCB Assembly ERP"}
