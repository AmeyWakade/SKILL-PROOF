@echo off
setlocal
cd /d "%~dp0frontend"
where node.exe >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found in PATH. Install Node.js, then reopen this launcher.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Frontend packages are missing. Installing them now...
  call npm.cmd install
  if errorlevel 1 (
    echo npm install failed. Review the error above.
    pause
    exit /b 1
  )
)
echo Starting SkillProof website. Keep this window open while using the site.
call npm.cmd run dev -- --host 127.0.0.1
echo.
echo SkillProof website stopped.
pause
