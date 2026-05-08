@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   Mawgood - Local DB Export to Production
echo ============================================
echo.

REM ─── Config ───────────────────────────────────────────────────────────────
set LOCAL_DB=mercurjs
set LOCAL_USER=postgres
set LOCAL_HOST=localhost
set LOCAL_PORT=5432
set DUMP_FILE=%~dp0mawgood_export_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%.sql
set DUMP_FILE=%DUMP_FILE: =0%

echo [1/3] Exporting local database "%LOCAL_DB%" ...
echo       Output: %DUMP_FILE%
echo.

REM pg_dump must be in PATH (comes with PostgreSQL installation)
pg_dump -h %LOCAL_HOST% -p %LOCAL_PORT% -U %LOCAL_USER% -d %LOCAL_DB% ^
  --no-owner --no-acl --clean --if-exists ^
  -f "%DUMP_FILE%"

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] pg_dump failed. Make sure:
  echo   1. PostgreSQL bin folder is in your PATH
  echo      e.g. C:\Program Files\PostgreSQL\16\bin
  echo   2. Local PostgreSQL is running
  echo   3. Database "%LOCAL_DB%" exists
  echo.
  pause
  exit /b 1
)

echo [OK] Export complete: %DUMP_FILE%
echo.

echo [2/3] File size:
for %%A in ("%DUMP_FILE%") do echo       %%~zA bytes
echo.

echo [3/3] Next steps to import on Hostinger VPS:
echo.
echo   a) Upload the SQL file to your VPS:
echo      scp "%DUMP_FILE%" root@YOUR_VPS_IP:/tmp/mawgood_export.sql
echo.
echo   b) SSH into your VPS and run:
echo      psql -h localhost -U mawgood_user -d mawgood_production -f /tmp/mawgood_export.sql
echo.
echo   c) Or use the automated import script:
echo      bash /var/www/mawgood-web/scripts/import-on-server.sh
echo.
echo ============================================
echo   Export DONE. File: %DUMP_FILE%
echo ============================================
pause
