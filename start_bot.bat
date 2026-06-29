@echo off
echo ===================================================
echo        Starting OnboardBot Servers...
echo ===================================================

echo Starting Backend Server...
cd onboardbot_v2
start cmd /k ".\venv\Scripts\activate && python -m uvicorn app.main:app --port 8000 --reload"

echo Starting Frontend Server...
cd ..\frontend
start cmd /k "npm run dev"

echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening OnboardBot in your browser...
start http://localhost:5173/

echo Done! You can close this window.
