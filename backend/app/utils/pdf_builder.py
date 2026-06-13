import asyncio
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)), autoescape=True)


async def build_report_pdf(report, student, author) -> bytes:
    template = jinja_env.get_template("report.html")
    html = template.render(report=report, student=student, author=author)

    # Run WeasyPrint in thread pool to avoid blocking the event loop
    loop = asyncio.get_event_loop()
    pdf_bytes = await loop.run_in_executor(None, _render_pdf, html)
    return pdf_bytes


def _render_pdf(html: str) -> bytes:
    from weasyprint import HTML
    return HTML(string=html).write_pdf()
