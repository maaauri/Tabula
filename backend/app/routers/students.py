import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.database import AsyncSession, get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.student import StudentCreate, StudentOut, StudentUpdate
from app.services import student_service

router = APIRouter(prefix="/students", tags=["students"])


@router.get("", response_model=list[StudentOut])
async def list_students(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await student_service.list_students(db, current_user.id)


@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
async def create_student(
    data: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await student_service.create_student(db, data, current_user.id)


@router.get("/{student_id}", response_model=StudentOut)
async def get_student(
    student_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    student = await student_service.get_student(db, student_id)
    if not student or student.assigned_educator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.put("/{student_id}", response_model=StudentOut)
async def update_student(
    student_id: uuid.UUID,
    data: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    student = await student_service.get_student(db, student_id)
    if not student or student.assigned_educator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return await student_service.update_student(db, student, data)


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    student = await student_service.get_student(db, student_id)
    if not student or student.assigned_educator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    await student_service.delete_student(db, student)
