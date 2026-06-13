import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate


async def list_students(db: AsyncSession, educator_id: uuid.UUID) -> list[Student]:
    result = await db.execute(select(Student).where(Student.assigned_educator_id == educator_id))
    return list(result.scalars().all())


async def get_student(db: AsyncSession, student_id: uuid.UUID) -> Student | None:
    result = await db.execute(select(Student).where(Student.id == student_id))
    return result.scalar_one_or_none()


async def create_student(db: AsyncSession, data: StudentCreate, educator_id: uuid.UUID) -> Student:
    student = Student(
        **data.model_dump(),
        assigned_educator_id=educator_id,
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)
    return student


async def update_student(db: AsyncSession, student: Student, data: StudentUpdate) -> Student:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    await db.commit()
    await db.refresh(student)
    return student


async def delete_student(db: AsyncSession, student: Student) -> None:
    await db.delete(student)
    await db.commit()
