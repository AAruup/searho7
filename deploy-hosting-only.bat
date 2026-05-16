@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_DIR=C:\Users\arupc\AppData\Local\OpenAI\Codex\bin"
set "PATH=%NODE_DIR%;%PATH%"
set "FIREBASE_CLI=%PROJECT_DIR%.tools\firebase\node_modules\firebase-tools\lib\bin\firebase.js"

cd /d "%PROJECT_DIR%"

echo.
echo SEA.RHO7 Firebase Hosting deploy
echo Project: searho7
echo.

if not exist "%FIREBASE_CLI%" (
  echo Firebase tools are not installed yet. Run deploy-firebase.bat first.
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
echo Building latest app...
"%NODE_DIR%\node.exe" ".tools\npm\package\bin\npm-cli.js" --cache ".npm-cache" exec vite build -- --configLoader native
if errorlevel 1 (
  echo.
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo Deploying Hosting only...
"%NODE_DIR%\node.exe" "%FIREBASE_CLI%" deploy --only hosting
if errorlevel 1 (
  echo.
  echo Hosting deploy failed.
  pause
  exit /b 1
)

echo.
echo Hosting deploy complete.
pause
