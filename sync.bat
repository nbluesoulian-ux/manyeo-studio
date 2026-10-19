@echo off
setlocal
echo ========================================================
echo  [Manyeo Studio] Fetching works from Supabase...
echo ========================================================
node sync-supabase-works.js
if %ERRORLEVEL% NEQ 0 (
    echo [Error] Failed to fetch data from Supabase.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo  [Manyeo Studio] Syncing changes to GitHub and Vercel...
echo ========================================================
git add .
git commit -m "Auto-sync works from Supabase"
git push origin main

echo.
echo ========================================================
echo  Done! GitHub push complete.
echo  Vercel is automatically deploying your changes.
echo  Live site: https://manyeo-studio.vercel.app/work
echo ========================================================
@timeout /t 5 >nul 2>&1
exit /b 0
