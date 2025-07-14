@echo off
echo 🎵 Building Music Player for deployment...

REM Create dist directory if it doesn't exist
if not exist "dist" mkdir dist

REM Copy all necessary files to dist
echo 📁 Copying files...
copy index.html dist\ >nul 2>&1
copy styles.css dist\ >nul 2>&1
copy script.js dist\ >nul 2>&1
copy package.json dist\ >nul 2>&1
copy vercel.json dist\ >nul 2>&1
copy README.md dist\ >nul 2>&1
copy LICENSE dist\ >nul 2>&1

echo ✅ Build complete! Files ready in dist\ directory
echo 🚀 You can now deploy the dist\ directory to any static hosting service
echo.
echo Quick deployment options:
echo   Vercel: vercel dist --prod
echo   Netlify: drag dist\ folder to netlify.com
echo   GitHub Pages: push dist\ contents to gh-pages branch

pause
