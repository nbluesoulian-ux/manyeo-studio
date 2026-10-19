@echo off
setlocal
echo ========================================================
echo  [Manyeo Studio] Syncing changes to GitHub and Vercel...
echo ========================================================
git add .
git commit -m "Site update"
git push origin main
echo.
echo ========================================================
echo  GitHub push complete!
echo  Vercel is automatically deploying your changes.
echo  Live site: https://manyeo-studio.vercel.app
echo ========================================================
@timeout /t 3 >nul 2>&1
exit /b 0
