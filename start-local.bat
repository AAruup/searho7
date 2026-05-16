@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_EXE=%LOCALAPPDATA%\OpenAI\Codex\bin\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"

subst X: /D >nul 2>nul
subst X: "%PROJECT_DIR%"
if errorlevel 1 (
  echo Failed to create the temporary X: drive mapping.
  pause
  exit /b 1
)

X:
cd \
set DISABLE_HMR=true

echo Starting SEA.RHO7 Advanced Suite at http://localhost:3000
echo Keep this window open while using the app.
echo.

"%NODE_EXE%" .tools\npm\package\bin\npm-cli.js --cache .npm-cache run dev
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo Server stopped with exit code %EXIT_CODE%.
subst X: /D >nul 2>nul
pause
exit /b %EXIT_CODE%
