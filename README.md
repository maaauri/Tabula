# Tabula

Plataforma educativa para el **Programa de Integración Escolar (PIE)** de establecimientos chilenos. Permite a educadores diferenciales gestionar estudiantes con necesidades educativas especiales, crear informes técnicos estructurados y redactarlos con ayuda de inteligencia artificial.

---

## Características principales

- **Gestión de estudiantes PIE** — Registro de perfil completo: RUT, curso, establecimiento, diagnóstico y NEE (necesidades educativas especiales).
- **Informes técnicos** — Creación de informes con plantilla estándar de 6 secciones (antecedentes, motivo de consulta, evaluación, resultados, conclusión y sugerencias).
- **Asistente IA** — Integración con OpenAI GPT-4o para generar, mejorar o resumir el contenido de cada sección. El modelo recibe automáticamente el contexto del estudiante (nombre, curso, diagnóstico, NEE) en el system prompt. El texto se muestra en tiempo real mediante streaming SSE.
- **Exportación a PDF** — El servidor genera un PDF profesional en formato A4, con datos del estudiante, todas las secciones y espacio para firma del profesional.
- **Multiplataforma** — La app corre en Android y navegador web desde la misma base de código (React Native + Expo).

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React Native + Expo (TypeScript), Expo Router |
| Estilos | NativeWind (Tailwind CSS para React Native) |
| Estado servidor | TanStack React Query |
| Estado global | Zustand + expo-secure-store |
| Formularios | react-hook-form + Zod |
| Backend | Python FastAPI (async) |
| Base de datos | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 (async) + asyncpg |
| Migraciones | Alembic |
| IA | OpenAI API (gpt-4o), streaming SSE |
| PDF | WeasyPrint + Jinja2 |
| Auth | JWT con python-jose + bcrypt |
| Contenedores | Docker + docker-compose |

---

## Estructura del proyecto

```
Tabula/
├── backend/
│   ├── app/
│   │   ├── main.py                  # Entry point FastAPI, CORS, routers
│   │   ├── config.py                # Variables de entorno (pydantic-settings)
│   │   ├── database.py              # Engine async SQLAlchemy + get_db
│   │   ├── models/                  # ORM: user, student, report
│   │   ├── schemas/                 # Pydantic: request/response schemas
│   │   ├── routers/                 # Endpoints: auth, students, reports
│   │   ├── services/                # Lógica de negocio + OpenAI streaming
│   │   ├── dependencies/auth.py     # get_current_user (JWT)
│   │   ├── utils/pdf_builder.py     # WeasyPrint → bytes
│   │   └── templates/report.html   # Plantilla Jinja2 para PDF
│   ├── alembic/                     # Migraciones de base de datos
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── _layout.tsx              # Root layout + auth guard
│   │   ├── (auth)/login.tsx         # Pantalla de inicio de sesión
│   │   └── (app)/
│   │       ├── index.tsx            # Dashboard
│   │       ├── students/            # Lista, detalle y creación
│   │       └── reports/             # Lista, editor y creación
│   └── src/
│       ├── api/                     # Axios client + funciones por recurso
│       ├── components/              # UI reutilizable + AiAssistPanel
│       ├── hooks/                   # useStudents, useReports, useAiAssist
│       ├── store/authStore.ts       # Zustand con persistencia segura
│       └── types/                   # Interfaces TypeScript
├── docker-compose.yml
└── README.md
```

---

## Requisitos previos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- [Node.js](https://nodejs.org/) 20+ y npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Una API key de [OpenAI](https://platform.openai.com/api-keys)

---

## Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd Tabula
```

### 2. Configurar el backend

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` y completar los valores:

```env
DATABASE_URL=postgresql+asyncpg://tabula:tabula@db:5432/tabula
SECRET_KEY=cambia-esto-por-una-clave-secreta-larga
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7
OPENAI_API_KEY=sk-...          # Tu API key de OpenAI
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:3000
```

### 3. Levantar el backend con Docker

```bash
docker-compose up --build
```

Esto levanta automáticamente:
- PostgreSQL en el puerto `5432`
- Ejecuta las migraciones de Alembic (`alembic upgrade head`)
- Inicia la API FastAPI en `http://localhost:8000`
- Siembra la plantilla de informe PIE por defecto al arrancar

Documentación interactiva de la API disponible en: `http://localhost:8000/docs`

### 4. Configurar el frontend

```bash
cd frontend
cp .env.example .env
```

Editar `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

> **Nota para Android físico:** reemplaza `localhost` por la IP local de tu máquina (ej. `http://192.168.1.x:8000`).

### 5. Instalar dependencias e iniciar la app

```bash
npm install
npx expo start
```

Presiona `w` para web, `a` para Android (emulador o dispositivo).

---

## Flujo de uso

```
Registrar cuenta → Iniciar sesión
        ↓
Agregar estudiante (nombre, RUT, curso, diagnóstico, NEE)
        ↓
Crear informe → seleccionar estudiante + período
        ↓
Editar secciones del informe
   └── Botón "IA" por sección → Panel de asistente
            ├── Elegir modo: Redactar / Mejorar / Resumir
            ├── Escribir instrucción
            └── Ver texto generado en tiempo real → Insertar
        ↓
Marcar como Completado
        ↓
Exportar PDF → compartir / descargar
```

---

## API endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/register` | Crear cuenta de educador |
| `POST` | `/auth/login` | Iniciar sesión → JWT |
| `GET` | `/auth/me` | Perfil del usuario actual |
| `GET/POST` | `/students` | Listar / crear estudiantes |
| `GET/PUT/DELETE` | `/students/{id}` | Detalle / editar / eliminar |
| `GET/POST` | `/reports` | Listar / crear informes |
| `GET/PUT/DELETE` | `/reports/{id}` | Detalle / editar / eliminar |
| `PUT` | `/reports/{id}/sections/{key}` | Actualizar contenido de sección |
| `POST` | `/reports/{id}/sections/{key}/ai-assist` | Asistente IA (streaming SSE) |
| `GET` | `/reports/{id}/export/pdf` | Descargar PDF del informe |
| `GET` | `/reports/templates` | Listar plantillas disponibles |

---

## Plantilla de informe PIE por defecto

Al iniciar el servidor se crea automáticamente la plantilla **"Informe PIE Semestral"** con las siguientes secciones:

1. Antecedentes del Estudiante
2. Motivo de Consulta / Derivación
3. Evaluación Psicopedagógica
4. Resultados e Interpretación
5. Conclusión Diagnóstica
6. Sugerencias y Plan de Intervención

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexión PostgreSQL async | `postgresql+asyncpg://tabula:tabula@db:5432/tabula` |
| `SECRET_KEY` | Clave secreta para firmar JWT | Cadena aleatoria de al menos 32 caracteres |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_DAYS` | Expiración del token en días | `7` |
| `OPENAI_API_KEY` | API key de OpenAI | `sk-...` |
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos (separados por coma) | `http://localhost:8081` |

### Frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL base de la API backend | `http://localhost:8000` |

---

## Comandos útiles

```bash
# Ver logs del backend en tiempo real
docker-compose logs -f backend

# Ejecutar solo la base de datos (sin Docker para el backend)
docker-compose up db

# Correr el backend sin Docker
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Limpiar volúmenes de Docker (resetear base de datos)
docker-compose down -v
```

---

## Decisiones técnicas relevantes

**Streaming SSE para IA:** el frontend usa `fetch` con `ReadableStream` directamente (no Axios, que bufferiza la respuesta completa) para mostrar los tokens del modelo en tiempo real.

**PDF server-side:** WeasyPrint convierte HTML/CSS a PDF en el servidor. Esto garantiza fidelidad tipográfica y evita limitaciones de renderizado en React Native.

**Auth con SecureStore:** el token JWT se guarda en `expo-secure-store` (keychain cifrado en Android/iOS) y en `localStorage` en web, con fallback automático según la plataforma.

**Contexto automático en IA:** el asistente recibe automáticamente el perfil del estudiante (nombre, curso, diagnóstico, NEE) en el system prompt, sin que el educador tenga que repetirlo en cada consulta.
