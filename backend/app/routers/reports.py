import uuid
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from app.database import AsyncSession, get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.report import (
    AiAssistRequest,
    ReportCreate,
    ReportOut,
    ReportSectionOut,
    ReportSectionUpdate,
    ReportTemplateOut,
    ReportUpdate,
)
from app.services import ai_service, report_service
from app.utils.pdf_builder import build_report_pdf

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportOut])
async def list_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await report_service.list_reports(db, current_user.id)


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def create_report(
    data: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await report_service.create_report(db, data, current_user.id)


@router.get("/templates", response_model=list[ReportTemplateOut])
async def list_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await report_service.list_templates(db)


@router.get("/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_service.get_report(db, report_id)
    if not report or report.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report


@router.put("/{report_id}", response_model=ReportOut)
async def update_report(
    report_id: uuid.UUID,
    data: ReportUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_service.get_report(db, report_id)
    if not report or report.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return await report_service.update_report(db, report, data)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_service.get_report(db, report_id)
    if not report or report.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    await report_service.delete_report(db, report)


@router.put("/{report_id}/sections/{section_key}", response_model=ReportSectionOut)
async def update_section(
    report_id: uuid.UUID,
    section_key: str,
    data: ReportSectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_service.get_report(db, report_id)
    if not report or report.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    section = await report_service.update_section(db, report_id, section_key, data)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return section


@router.get("/{report_id}/export/pdf")
async def export_pdf(
    report_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_service.get_report(db, report_id)
    if not report or report.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    student = await report_service.get_student_for_report(db, report)

    pdf_bytes = await build_report_pdf(report, student, current_user)
    filename = f"informe_{report_id}.pdf"
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post("/{report_id}/sections/{section_key}/ai-assist")
async def ai_assist(
    report_id: uuid.UUID,
    section_key: str,
    data: AiAssistRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await report_service.get_report(db, report_id)
    if not report or report.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    section = next((s for s in report.sections if s.section_key == section_key), None)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    student = await report_service.get_student_for_report(db, report)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    async def event_stream() -> AsyncGenerator[bytes, None]:
        async for chunk in ai_service.stream_ai_assist(student, section, data.prompt, data.mode):
            yield f"data: {chunk}\n\n".encode("utf-8")
        yield b"data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
