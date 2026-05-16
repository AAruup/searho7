@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "REPO_URL=https://github.com/AAruup/searho7.git"

cd /d "%PROJECT_DIR%"

echo.
echo SEA.RHO7 GitHub upload helper
echo Repo: %REPO_URL%
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo Git was not found on this computer.
  echo Install Git for Windows first, then run this file again.
  echo.
  echo Install command:
  echo winget install --id Git.Git -e --source winget
  pause
  exit /b 1
)

if not exist ".git" (
  git init
  if errorlevel 1 goto failed
)

git branch -M main

git config user.name >nul 2>nul
if errorlevel 1 git config user.name "Arup"

git config user.email >nul 2>nul
if errorlevel 1 git config user.email "x1xvampire83@gmail.com"

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  git remote add origin "%REPO_URL%"
) else (
  git remote set-url origin "%REPO_URL%"
)

git add .
if errorlevel 1 goto failed

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Initial SEA.RHO7 app"
  if errorlevel 1 goto failed
) else (
  echo Nothing new to commit.
)

git push -u origin main
if errorlevel 1 goto failed

echo.
echo Upload complete.
echo Open: https://github.com/AAruup/searho7
pause
exit /b 0

:failed
echo.
echo GitHub upload failed. Copy the message above and send it to Codex.
pause
exit /b 1
