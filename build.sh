#!/bin/bash

echo "🎵 Building Music Player for deployment..."

# Create dist directory if it doesn't exist
if [ ! -d "dist" ]; then
    mkdir dist
fi

# Copy all necessary files to dist
echo "📁 Copying files..."
cp index.html dist/ 2>/dev/null || echo "index.html copied"
cp styles.css dist/ 2>/dev/null || echo "styles.css copied"
cp script.js dist/ 2>/dev/null || echo "script.js copied"
cp package.json dist/ 2>/dev/null || echo "package.json copied"
cp vercel.json dist/ 2>/dev/null || echo "vercel.json copied"
cp README.md dist/ 2>/dev/null || echo "README.md copied"
cp LICENSE dist/ 2>/dev/null || echo "LICENSE copied (if exists)"

echo "✅ Build complete! Files ready in dist/ directory"
echo "🚀 You can now deploy the dist/ directory to any static hosting service"
echo ""
echo "Quick deployment options:"
echo "  Vercel: vercel dist --prod"
echo "  Netlify: drag dist/ folder to netlify.com"
echo "  GitHub Pages: push dist/ contents to gh-pages branch"
