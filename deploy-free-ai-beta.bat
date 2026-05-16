@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_DIR=%LOCALAPPDATA%\OpenAI\Codex\bin"
set "NODE_EXE=%NODE_DIR%\node.exe"
set "NPM_CLI=%PROJECT_DIR%.tools\npm\package\bin\npm-cli.js"
set "FIREBASE_CLI=%PROJECT_DIR%.tools\firebase\node_modules\firebase-tools\lib\bin\firebase.js"
set "PATH=%NODE_DIR%;%PATH%"
set "VITE_SEA_RHO7_AI_MODE=firebase-free-beta"
set "VITE_SEA_RHO7_FREE_MODEL=gemini-3.1-flash-lite"

cd /d "%PROJECT_DIR%"

echo.
echo SEA.RHO7 free AI beta deploy
echo Project: searho7
echo.
echo This deploy uses Firebase Hosting only.
echo It does not deploy paid Cloud Functions.
echo.

if not exist "%NODE_EXE%" (
  echo Node was not found in the Codex toolchain.
  pause
  exit /b 1
)

if not exist "%NPM_CLI%" (
  echo npm was not found in .tools. Run the setup again first.
  pause
  exit /b 1
)

if not exist "%FIREBASE_CLI%" (
  echo Firebase tools are not installed yet. Run deploy-firebase.bat first.
  pause
  exit /b 1
)

"%NODE_EXE%" "%FIREBASE_CLI%" use searho7
if errorlevel 1 (
  echo.
  echo Could not select Firebase project searho7.
  pause
  exit /b 1
)

echo.
echo Building SEA.RHO7 free AI beta...
"%NODE_EXE%" "%NPM_CLI%" --cache ".npm-cache" exec vite build -- --configLoader native
if errorlevel 1 (
  echo.
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo Deploying Hosting only...
"%NODE_EXE%" "%FIREBASE_CLI%" deploy --only hosting
if errorlevel 1 (
  echo.
  echo Hosting deploy failed.
  pause
  exit /b 1
)

echo.
echo Free AI beta deploy complete.
echo Open: https://searho7.web.app
pause
