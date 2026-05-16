@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "PYTHON_DIR=%PROJECT_DIR%python-ai"
cd /d "%PYTHON_DIR%"

if not exist ".venv\Scripts\python.exe" (
  echo Creating Python environment...
  python -m venv .venv
  if errorlevel 1 (
    echo Could not create Python environment.
    pause
    exit /b 1
  )
)

call ".venv\Scripts\activate.bat"

echo Installing Python backend packages...
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo Python package install failed.
  pause
  exit /b 1
)

if "%GEMINI_API_KEY%"=="" (
  set /p GEMINI_API_KEY=Paste Gemini API key for this local test: 
)

set "ALLOW_UNVERIFIED_DEV=true"
set "PORT=5050"

echo.
echo SEA.RHO7 Python AI backend is starting...
echo Local health: http://127.0.0.1:5050/api/health
echo Keep this window open while testing.
echo.

python app.py

echo.
echo Python AI backend stopped.
pause
