@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_DIR=C:\Users\arupc\AppData\Local\OpenAI\Codex\bin"
set "PATH=%NODE_DIR%;%PATH%"
set "FIREBASE_CLI=%PROJECT_DIR%.tools\firebase\node_modules\firebase-tools\lib\bin\firebase.js"

cd /d "%PROJECT_DIR%"

if not exist "%FIREBASE_CLI%" (
  echo Firebase tools are not installed yet. Run deploy-firebase.bat first.
  pause
  exit /b 1
)

"%NODE_DIR%\node.exe" "%FIREBASE_CLI%" projects:list
pause
