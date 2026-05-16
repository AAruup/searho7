@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "PY_EXE=python"

cd /d "%PROJECT_DIR%"

if not exist "dist\index.html" (
  echo Building app preview...
  cmd /d /s /c "subst X: ""%PROJECT_DIR%"" && X: && cd \ && node .tools\npm\package\bin\npm-cli.js --cache .npm-cache exec vite build -- --configLoader native"
  cd /d "%PROJECT_DIR%"
)

echo Starting SEA.RHO7 preview at http://localhost:4173
echo Keep this window open while using the app.
echo.

%PY_EXE% -m http.server 4173 --bind 127.0.0.1 --directory dist

echo.
echo Preview server stopped.
pause
