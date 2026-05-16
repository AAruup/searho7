@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_DIR=C:\Users\arupc\AppData\Local\OpenAI\Codex\bin"
set "PATH=%NODE_DIR%;%PATH%"
set "FIREBASE_CLI=%PROJECT_DIR%.tools\firebase\node_modules\firebase-tools\lib\bin\firebase.js"

cd /d "%PROJECT_DIR%"

echo.
echo SEA.RHO7 Firebase deploy helper
echo Project: searho7
echo.

if not exist "%FIREBASE_CLI%" (
  echo Installing Firebase tools locally...
  "%NODE_DIR%\node.exe" ".tools\npm\package\bin\npm-cli.js" --cache ".npm-cache" install --prefix ".tools\firebase" firebase-tools
  if errorlevel 1 (
    echo.
    echo Firebase tools install failed.
    pause
    exit /b 1
  )
)

echo.
echo Logging in to Firebase...
"%NODE_DIR%\node.exe" "%FIREBASE_CLI%" login
if errorlevel 1 (
  echo.
  echo Firebase login failed.
  pause
  exit /b 1
)

echo.
echo Selecting project searho7...
"%NODE_DIR%\node.exe" "%FIREBASE_CLI%" use searho7
if errorlevel 1 (
  echo.
  echo Could not select Firebase project searho7.
  pause
  exit /b 1
)

echo.
echo Deploying SEA.RHO7...
"%NODE_DIR%\node.exe" "%FIREBASE_CLI%" deploy
if errorlevel 1 (
  echo.
  echo Deploy failed.
  pause
  exit /b 1
)

echo.
echo Deploy complete.
pause
