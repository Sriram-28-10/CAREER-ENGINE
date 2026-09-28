@echo off
echo Starting Career Readiness Twin Application...
set PATH=C:\Program Files\nodejs;C:\Users\user\.node_portable\node-v20.12.2-win-x64;%PATH%

start "FastAPI Backend (8000)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload"
start "Next.js Frontend (3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- -p 3000"

echo Both servers launched in background windows!
