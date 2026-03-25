from typing import AsyncGenerator

from openai import AsyncOpenAI

from app.config import settings
from app.models.report import ReportSection
from app.models.student import Student

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

MODE_INSTRUCTIONS = {
    "generate": "Redacta el contenido completo de esta sección del informe.",
    "improve": "Mejora y enriquece el texto existente de esta sección, manteniendo la información original.",
    "summarize": "Resume el contenido de esta sección de forma concisa y clara.",
}


def _build_system_prompt(student: Student, section: ReportSection) -> str:
    needs_str = ", ".join(student.needs) if student.needs else "No especificadas"
    return f"""Eres un especialista en educación diferencial ayudando a educadores chilenos a redactar informes técnicos del Programa de Integración Escolar (PIE).

Contexto del estudiante:
- Nombre: {student.first_name} {student.last_name}
- Curso: {student.grade or "No especificado"}
- Establecimiento: {student.school_name or "No especificado"}
- Diagnóstico: {student.diagnosis or "No especificado"}
- Necesidades educativas especiales: {needs_str}

Sección actual del informe: "{section.title}"
Contenido actual: "{section.content or '(sin contenido aún)'}"

Escribe en español formal, con lenguaje técnico-pedagógico apropiado para documentos institucionales chilenos de educación especial. Sé específico y fundamentado."""


async def stream_ai_assist(student: Student, section: ReportSection, user_prompt: str, mode: str) -> AsyncGenerator[str, None]:
    mode_instruction = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["generate"])
    system_prompt = _build_system_prompt(student, section)
    full_prompt = f"{mode_instruction}\n\nInstrucción adicional del educador: {user_prompt}"

    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_prompt},
        ],
        stream=True,
        max_tokens=1500,
        temperature=0.7,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
