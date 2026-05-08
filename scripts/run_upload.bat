@echo off
chcp 65001 >nul
echo ================================================================================
echo MAWGOOD PRODUCT UPLOADER
echo ================================================================================
echo.
echo This script will upload products from Excel files to the database.
echo.
echo WARNING: This will DELETE ALL existing products!
echo.
pause
echo.
echo Starting upload...
echo.
python upload_products_v2.py
echo.
echo ================================================================================
echo Upload process completed!
echo ================================================================================
echo.
pause
