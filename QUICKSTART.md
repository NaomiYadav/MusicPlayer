# Quick Start Guide

## Running the Music Player

### Option 1: Simple File Opening
1. Double-click `index.html` to open in your default browser
2. Start adding music files and enjoy!

### Option 2: Local Development Server (Recommended)
For the best experience with all features working properly:

1. **Install Node.js** (if not already installed):
   - Download from: https://nodejs.org/
   - Choose the LTS version

2. **Open Terminal/Command Prompt** in the project folder

3. **Start the development server**:
   ```bash
   npm start
   ```
   OR
   ```bash
   npx live-server --port=3000
   ```

4. **Open your browser** and go to: http://localhost:3000

## Features to Test

1. **Add Music**: Click "Add Songs" or drag & drop audio files
2. **Playback Controls**: Play, pause, skip, volume adjustment
3. **Playlist**: Click songs to play, remove with X button
4. **Search**: Type in search box to filter songs
5. **Shuffle/Repeat**: Test different playback modes
6. **Keyboard Controls**: Use spacebar, arrow keys
7. **Responsive**: Try different browser window sizes

## Supported Audio Formats
- MP3
- WAV 
- OGG
- M4A
- FLAC (browser dependent)

## Browser Requirements
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

**Audio not playing?**
- Check browser audio permissions
- Try a different audio file format
- Ensure file isn't corrupted

**Visualization not working?**
- Some browsers require user interaction first
- Try clicking play after adding a song

**Files not loading?**
- Use a local server (Option 2 above)
- Check file size (very large files may be slow)

Happy listening! 🎵
