import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db import get_db
from models import Progress

router = APIRouter(prefix="/api/progress", tags=["progress"])


class ProgressPayload(BaseModel):
    rods: dict[str, bool] = Field(default_factory=dict)
    fish: dict[str, bool] = Field(default_factory=dict)


class ProgressResponse(BaseModel):
    id: str
    rods: dict[str, bool]
    fish: dict[str, bool]
    created_at: str | None = None
    updated_at: str | None = None


def _to_response(row: Progress) -> ProgressResponse:
    return ProgressResponse(
        id=str(row.id),
        rods=row.rods or {},
        fish=row.fish or {},
        created_at=row.created_at.isoformat() if row.created_at else None,
        updated_at=row.updated_at.isoformat() if row.updated_at else None,
    )


def _parse_uuid(progress_id: str) -> uuid.UUID:
    try:
        return uuid.UUID(progress_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid progress id") from exc


@router.get("/{progress_id}", response_model=ProgressResponse)
def get_progress(progress_id: str, db: Session = Depends(get_db)) -> ProgressResponse:
    pid = _parse_uuid(progress_id)
    row = db.get(Progress, pid)
    if not row:
        return ProgressResponse(id=str(pid), rods={}, fish={})
    return _to_response(row)


@router.put("/{progress_id}", response_model=ProgressResponse)
def upsert_progress(
    progress_id: str,
    payload: ProgressPayload,
    db: Session = Depends(get_db),
) -> ProgressResponse:
    pid = _parse_uuid(progress_id)
    row = db.get(Progress, pid)

    rods = {k: v for k, v in payload.rods.items() if v}
    fish = {k: v for k, v in payload.fish.items() if v}

    now = datetime.now(timezone.utc)
    if row:
        row.rods = rods
        row.fish = fish
        row.updated_at = now
    else:
        row = Progress(id=pid, rods=rods, fish=fish, created_at=now, updated_at=now)
        db.add(row)

    db.commit()
    db.refresh(row)
    return _to_response(row)
