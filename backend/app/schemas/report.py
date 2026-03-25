import uuid
from datetime import datetime

from pydantic import BaseModel


class ReportTemplateOut(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    sections: list[dict]
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportSectionOut(BaseModel):
    id: uuid.UUID
    report_id: uuid.UUID
    section_key: str
    title: str
    content: str
    order_index: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReportSectionUpdate(BaseModel):
    content: str


class ReportCreate(BaseModel):
    student_id: uuid.UUID
    template_id: uuid.UUID | None = None
    title: str
    period: str | None = None


class ReportUpdate(BaseModel):
    title: str | None = None
    period: str | None = None
    status: str | None = None


class ReportOut(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    author_id: uuid.UUID
    template_id: uuid.UUID | None
    title: str
    period: str | None
    status: str
    created_at: datetime
    updated_at: datetime
    sections: list[ReportSectionOut] = []

    model_config = {"from_attributes": True}


class AiAssistRequest(BaseModel):
    prompt: str
    mode: str = "generate"  # generate | improve | summarize
