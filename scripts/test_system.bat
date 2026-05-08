@echo off
chcp 65001 >nul
echo ================================================================================
echo SYSTEM TEST - Testing Backend Connection and Files
echo ================================================================================
echo.
python test_connection.py
echo.
pause
