@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_DIR=C:\Users\arupc\AppData\Local\OpenAI\Codex\bin"
set "PATH=%NODE_DIR%;%PATH%"
set "FIREBASE_CLI=%PROJECT_DIR%.tools\firebase\node_modules\firebase-tools\lib\bin\firebase.js"

cd /d "%PROJECT_DIR%"

echo.
echo SEA.RHO7 Firestore rules deploy
echo Project: searho7
echo.

if not exist "%FIREBASE_CLI%" (
  echo Firebase tools are not installed yet. Run deploy-hosting-only.bat first.
  pause
  exit /b 1
)

"%NODE_DIR%\node.exe" "%FIREBASE_CLI%" use searho7
if errorlevel 1 (
  echo.
  echo Could not select Firebase project searho7.
  pause
  exit /b 1
)

echo.
echo Deploying Firestore rules only...
"%NODE_DIR%\node.exe" "%FIREBASE_CLI%" deploy --only firestore:rules
if errorlevel 1 (
  echo.
  echo Firestore rules deploy failed.
  pause
  exit /b 1
)

echo.
echo Firestore rules deploy complete.
pause
