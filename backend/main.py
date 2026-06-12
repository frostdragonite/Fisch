import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import init_db
from routes.progress import router as progress_router

app = FastAPI(title="Fisch Masterline Checklist API")

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:4200,http://127.0.0.1:4200",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(progress_router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
