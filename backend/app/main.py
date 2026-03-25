from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, reports, students


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed default template on startup
    from app.database import AsyncSessionLocal
    from app.services.report_service import get_or_create_default_template
    async with AsyncSessionLocal() as db:
        await get_or_create_default_template(db)
    yield


app = FastAPI(
    title="Tabula API",
    description="Plataforma PIE para gestión de estudiantes e informes",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(reports.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
