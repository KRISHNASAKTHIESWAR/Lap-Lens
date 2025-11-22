@echo off
REM Quick start script for Windows
echo F1 Telemetry Prediction System - Quick Start
echo.

REM Check if venv exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        exit /b 1
    )
)

REM Activate venv
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    exit /b 1
)

REM Install requirements
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies
    exit /b 1
)

REM Train models
echo.
echo Training models...
python train.py
if errorlevel 1 (
    echo Failed to train models
    exit /b 1
)

REM Start server
echo.
echo Starting API server...
echo Server will be available at http://localhost:8000
echo API docs at http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
