import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.report import Report, ReportSection, ReportTemplate
from app.models.student import Student
from app.schemas.report import ReportCreate, ReportSectionUpdate, ReportUpdate

DEFAULT_PIE_TEMPLATE_SECTIONS = [
    {"key": "antecedentes", "title": "Antecedentes del Estudiante", "order": 0},
    {"key": "motivo_consulta", "title": "Motivo de Consulta / Derivación", "order": 1},
    {"key": "evaluacion_psicopedagogica", "title": "Evaluación Psicopedagógica", "order": 2},
    {"key": "resultados", "title": "Resultados e Interpretación", "order": 3},
    {"key": "conclusion", "title": "Conclusión Diagnóstica", "order": 4},
    {"key": "sugerencias", "title": "Sugerencias y Plan de Intervención", "order": 5},
]


async def get_or_create_default_template(db: AsyncSession) -> ReportTemplate:
    result = await db.execute(select(ReportTemplate).where(ReportTemplate.name == "Informe PIE Semestral"))
    template = result.scalar_one_or_none()
    if not template:
        template = ReportTemplate(
            name="Informe PIE Semestral",
            description="Plantilla estándar para informes del Programa de Integración Escolar",
            sections=DEFAULT_PIE_TEMPLATE_SECTIONS,
        )
        db.add(template)
        await db.commit()
        await db.refresh(template)
    return template


async def list_reports(db: AsyncSession, author_id: uuid.UUID) -> list[Report]:
    result = await db.execute(
        select(Report)
        .where(Report.author_id == author_id)
        .options(selectinload(Report.sections))
        .order_by(Report.created_at.desc())
    )
    return list(result.scalars().all())


async def get_report(db: AsyncSession, report_id: uuid.UUID) -> Report | None:
    result = await db.execute(
        select(Report)
        .where(Report.id == report_id)
        .options(selectinload(Report.sections), selectinload(Report.student))
    )
    return result.scalar_one_or_none()


async def create_report(db: AsyncSession, data: ReportCreate, author_id: uuid.UUID) -> Report:
    template_id = data.template_id
    if template_id is None:
        template = await get_or_create_default_template(db)
        template_id = template.id
        sections_def = template.sections
    else:
        result = await db.execute(select(ReportTemplate).where(ReportTemplate.id == template_id))
        template = result.scalar_one_or_none()
        sections_def = template.sections if template else DEFAULT_PIE_TEMPLATE_SECTIONS

    report = Report(
        student_id=data.student_id,
        author_id=author_id,
        template_id=template_id,
        title=data.title,
        period=data.period,
    )
    db.add(report)
    await db.flush()

    for sec in sections_def:
        section = ReportSection(
            report_id=report.id,
            section_key=sec["key"],
            title=sec["title"],
            content="",
            order_index=sec.get("order", 0),
        )
        db.add(section)

    await db.commit()
    await db.refresh(report)
    return await get_report(db, report.id)


async def update_report(db: AsyncSession, report: Report, data: ReportUpdate) -> Report:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(report, field, value)
    await db.commit()
    return await get_report(db, report.id)


async def delete_report(db: AsyncSession, report: Report) -> None:
    await db.delete(report)
    await db.commit()


async def update_section(db: AsyncSession, report_id: uuid.UUID, section_key: str, data: ReportSectionUpdate) -> ReportSection | None:
    result = await db.execute(
        select(ReportSection).where(
            ReportSection.report_id == report_id,
            ReportSection.section_key == section_key,
        )
    )
    section = result.scalar_one_or_none()
    if not section:
        return None
    section.content = data.content
    await db.commit()
    await db.refresh(section)
    return section


async def list_templates(db: AsyncSession) -> list[ReportTemplate]:
    # Ensure default exists
    await get_or_create_default_template(db)
    result = await db.execute(select(ReportTemplate))
    return list(result.scalars().all())


async def get_student_for_report(db: AsyncSession, report: Report) -> Student | None:
    result = await db.execute(select(Student).where(Student.id == report.student_id))
    return result.scalar_one_or_none()
