@echo off
echo =====================================
echo   Admin Panel Health Check
echo =====================================
echo.

echo [1/5] Checking Backend (Port 9000)...
curl -s http://localhost:9000/health 2>nul | findstr "OK" >nul
if %errorlevel% equ 0 (
    echo ✓ Backend is running
) else (
    echo ✗ Backend is NOT running
)
echo.

echo [2/5] Checking Admin Panel (Port 5173)...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ✓ Admin Panel is running
) else (
    echo ✗ Admin Panel is NOT running
)
echo.

echo [3/5] Checking Database (Port 5432)...
netstat -ano | findstr ":5432" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ✓ Database is running
) else (
    echo ✗ Database is NOT running
)
echo.

echo [4/5] Testing Backend API with Publishable Key...
curl -s -H "x-publishable-api-key: pk_3e5434677a64beba278f80dfdd444cb978debabab7f445b20b2977233cd37c53" http://localhost:9000/admin/auth 2>nul | findstr "Unauthorized" >nul
if %errorlevel% equ 0 (
    echo ✓ Backend API is responding
) else (
    echo ✗ Backend API is NOT responding
)
echo.

echo [5/5] Checking Publishable Key in Database...
node backend\get-publishable-key.js 2>nul | findstr "pk_" >nul
if %errorlevel% equ 0 (
    echo ✓ Publishable key exists
) else (
    echo ✗ Publishable key NOT found
)
echo.

echo =====================================
echo   Summary
echo =====================================
echo.
echo Admin Panel URL: http://localhost:5173
echo Dashboard: http://localhost:5173/dashboard
echo Login: http://localhost:5173/login
echo.
echo If all checks passed, try:
echo 1. Open http://localhost:5173 in your browser
echo 2. Login with your admin credentials
echo 3. Navigate to /dashboard after login
echo.
pause
