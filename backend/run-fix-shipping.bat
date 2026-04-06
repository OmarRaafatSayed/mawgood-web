@echo off
set PGPASSWORD=02486
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d mercurjs -f fix-shipping-cod.sql
pause
