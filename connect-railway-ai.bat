@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_DIR=%LOCALAPPDATA%\OpenAI\Codex\bin"
set "NODE_EXE=%NODE_DIR%\node.exe"
set "NPM_CLI=%PROJECT_DIR%.tools\npm\package\bin\npm-cli.js"
set "FIREBASE_CLI=%PROJECT_DIR%.tools\firebase\node_modules\firebase-tools\lib\bin\firebase.js"
set "PATH=%NODE_DIR%;%PATH%"

cd /d "%PROJECT_DIR%"

echo.
echo SEA.RHO7 Railway AI connector
echo.
echo Paste your Railway public URL.
echo Example: https://searho7-ai-production.up.railway.app
echo.
set /p RAILWAY_URL=Railway URL: 

if "%RAILWAY_URL%"=="" (
  echo.
  echo No Railway URL was entered.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$url=$env:RAILWAY_URL.Trim();" ^
  "if($url.EndsWith('/')){$url=$url.TrimEnd('/')};" ^
  "if(-not $url.EndsWith('/api/ask')){$url=$url + '/api/ask'};" ^
  "$lines=@(" ^
  "'# GEMINI_API_KEY is not used by the browser app when Railway backend is connected.'," ^
  "'GEMINI_API_KEY=""MY_GEMINI_API_KEY""'," ^
  "'APP_URL=""http://localhost:3000""'," ^
  "'VITE_SEA_RHO7_AI_MODE=""paid-backend""'," ^
  "'VITE_SEA_RHO7_FREE_MODEL=""gemini-3.1-flash-lite""'," ^
  "'VITE_SEA_RHO7_AI_ENDPOINT=""' + $url + '""'" ^
  ");" ^
  "Set-Content -Path '.env.local' -Value $lines -Encoding utf8;" ^
  "Write-Host ('Connected endpoint: ' + $url)"
if errorlevel 1 (
  echo.
  echo Could not update .env.local.
  pause
  exit /b 1
)

if not exist "%NODE_EXE%" (
  echo.
  echo Node was not found in the Codex toolchain.
  pause
  exit /b 1
)

if not exist "%NPM_CLI%" (
  echo.
  echo npm was not found in .tools. Run the setup again first.
  pause
  exit /b 1
)

if not exist "%FIREBASE_CLI%" (
  echo.
  echo Firebase tools are not installed yet. Run deploy-firebase.bat first.
  pause
  exit /b 1
)

echo.
echo Selecting Firebase project searho7...
"%NODE_EXE%" "%FIREBASE_CLI%" use searho7
if errorlevel 1 (
  echo.
  echo Could not select Firebase project searho7.
  pause
  exit /b 1
)

echo.
echo Building SEA.RHO7 with Railway AI endpoint...
"%NODE_EXE%" "%NPM_CLI%" --cache ".npm-cache" exec vite build -- --configLoader native
if errorlevel 1 (
  echo.
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo Deploying Firebase Hosting only...
"%NODE_EXE%" "%FIREBASE_CLI%" deploy --only hosting
if errorlevel 1 (
  echo.
  echo Hosting deploy failed.
  pause
  exit /b 1
)

echo.
echo SEA.RHO7 is connected to Railway AI.
echo Open: https://searho7.web.app
pause
