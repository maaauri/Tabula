import uuid
from datetime import date, datetime

from pydantic import BaseModel


class StudentCreate(BaseModel):
    rut: str | None = None
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    grade: str | None = None
    school_name: str | None = None
    diagnosis: str | None = None
    needs: list[str] = []
    assigned_educator_id: uuid.UUID | None = None


class StudentUpdate(BaseModel):
    rut: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    grade: str | None = None
    school_name: str | None = None
    diagnosis: str | None = None
    needs: list[str] | None = None
    assigned_educator_id: uuid.UUID | None = None


class StudentOut(BaseModel):
    id: uuid.UUID
    rut: str | None
    first_name: str
    last_name: str
    date_of_birth: date | None
    grade: str | None
    school_name: str | None
    diagnosis: str | None
    needs: list[str]
    assigned_educator_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
