# Deployment Guide

## Deploy to Vercel (Recommended)

### Method 1: Vercel CLI
1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project directory:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Method 2: GitHub + Vercel (Automated)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect it's a static site
6. Click "Deploy"

### Method 3: Drag & Drop
1. Go to [vercel.com](https://vercel.com)
2. Drag your project folder to the deployment area
3. Wait for deployment to complete

## Deploy to Netlify

### Method 1: Drag & Drop
1. Go to [netlify.com](https://netlify.com)
2. Drag your project folder to the deployment area
3. Your site will be live instantly

### Method 2: GitHub + Netlify
1. Push code to GitHub
2. Connect GitHub repo to Netlify
3. Set build command: (leave empty for static sites)
4. Set publish directory: `./` (root directory)

## Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings
3. Scroll to "Pages" section
4. Select source: "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click Save

## Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize project:
   ```bash
   firebase init hosting
   ```

4. Deploy:
   ```bash
   firebase deploy
   ```

## Important Notes

### File Structure
Your project is a static site, so all files should be in the root directory:
```
├── index.html (main entry point)
├── styles.css
├── script.js
├── package.json
├── vercel.json (for Vercel)
└── README.md
```

### Domain Configuration
- Most platforms provide a free subdomain
- You can add custom domains in platform settings
- SSL certificates are provided automatically

### Environment Variables
This project doesn't require environment variables, but if you add server-side features later, you can configure them in:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

### Performance Tips
- All assets are already optimized
- Consider adding a CDN for global distribution
- Monitor Core Web Vitals after deployment

## Troubleshooting

### Common Issues:

**"No Output Directory" Error (Vercel):**
- Solution: The `vercel.json` file is already configured
- Make sure all files are in the root directory

**404 Errors:**
- Check that `index.html` is in the root directory
- Verify file paths are relative (not absolute)

**CSS/JS Not Loading:**
- Ensure file paths use forward slashes `/`
- Check that files are in the same directory as `index.html`

**Audio Not Playing on Mobile:**
- This is normal - browsers require user interaction first
- The app handles this automatically

## Post-Deployment Testing

After deployment, test these features:
- [ ] Audio file upload and playback
- [ ] All control buttons work
- [ ] Search functionality
- [ ] Drag and drop
- [ ] Mobile responsiveness
- [ ] Keyboard shortcuts

Your music player is now ready for the world! 🌍🎵
