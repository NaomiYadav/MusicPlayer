class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio');
        this.playBtn = document.getElementById('play-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.repeatBtn = document.getElementById('repeat-btn');
        this.progressSlider = document.getElementById('progress-slider');
        this.volumeSlider = document.getElementById('volume-slider');
        this.currentTimeSpan = document.getElementById('current-time');
        this.durationSpan = document.getElementById('duration');
        this.songTitle = document.getElementById('song-title');
        this.songArtist = document.getElementById('song-artist');
        this.songAlbum = document.getElementById('song-album');
        this.albumCover = document.getElementById('album-cover');
        this.playlist = document.getElementById('playlist');
        this.fileInput = document.getElementById('file-input');
        this.addSongsBtn = document.getElementById('add-songs-btn');
        this.clearPlaylistBtn = document.getElementById('clear-playlist-btn');
        this.progress = document.getElementById('progress');
        this.uploadModal = document.getElementById('upload-modal');
        this.modalAddBtn = document.getElementById('modal-add-btn');
        this.albumArt = document.querySelector('.album-art');
        this.searchInput = document.getElementById('search-input');
        this.dropZone = document.getElementById('drop-zone');
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.visualizer = document.getElementById('visualizer');

        this.songs = [];
        this.filteredSongs = [];
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isShuffled = false;
        this.repeatMode = 'none'; // 'none', 'one', 'all'
        this.shuffledIndices = [];
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAudioVisualization();
        this.setupDragAndDrop();
        this.setVolume(50);
        this.loadPlaylistFromStorage();
        
        // Initialize filtered songs
        this.filteredSongs = [...this.songs];
        
        if (this.songs.length === 0) {
            this.showUploadModal();
        }
    }

    setupEventListeners() {
        // Play/Pause button
        this.playBtn.addEventListener('click', () => this.togglePlay());

        // Previous/Next buttons
        this.prevBtn.addEventListener('click', () => this.previousSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());

        // Shuffle and Repeat buttons
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());

        // Progress slider
        this.progressSlider.addEventListener('input', () => this.seek());
        this.progressSlider.addEventListener('change', () => this.seek());

        // Volume slider
        this.volumeSlider.addEventListener('input', () => this.setVolume(this.volumeSlider.value));

        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleSongEnd());
        this.audio.addEventListener('loadstart', () => this.onLoadStart());
        this.audio.addEventListener('canplay', () => this.onCanPlay());
        this.audio.addEventListener('error', (e) => this.onError(e));

        // File input
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.addSongsBtn.addEventListener('click', () => this.fileInput.click());
        this.modalAddBtn.addEventListener('click', () => {
            this.hideUploadModal();
            this.fileInput.click();
        });

        // Clear playlist
        this.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());

        // Search functionality
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Toast close buttons
        document.querySelectorAll('.toast-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.toast').classList.remove('show');
            });
        });
    }

    showUploadModal() {
        if (this.songs.length === 0) {
            this.uploadModal.style.display = 'block';
        }
    }

    hideUploadModal() {
        this.uploadModal.style.display = 'none';
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
        this.fileInput.value = '';
    }

    renderPlaylist() {
        // Remove existing non-demo songs
        const existingSongs = this.playlist.querySelectorAll('.playlist-item:not(.demo-song)');
        existingSongs.forEach(song => song.remove());

        // Hide or show drop zone based on playlist content
        if (this.songs.length > 0) {
            this.dropZone.classList.add('hidden');
        } else {
            this.dropZone.classList.remove('hidden');
        }

        // Use filtered songs for display
        const songsToShow = this.filteredSongs.length > 0 || this.searchInput.value.trim() 
            ? this.filteredSongs 
            : this.songs;

        // Add real songs
        songsToShow.forEach((song, displayIndex) => {
            const actualIndex = this.songs.findIndex(s => s.id === song.id);
            const playlistItem = document.createElement('div');
            playlistItem.className = 'playlist-item';
            playlistItem.dataset.index = actualIndex;
            
            playlistItem.innerHTML = `
                <div class="song-details">
                    <div class="song-name">${song.name}</div>
                    <div class="song-meta">${song.artist} - ${song.album}</div>
                </div>
                <div class="song-duration">${song.duration}</div>
                <button class="remove-btn" title="Remove from playlist">
                    <i class="fas fa-times"></i>
                </button>
            `;

            playlistItem.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-btn')) {
                    this.loadSong(actualIndex);
                    if (!this.isPlaying) {
                        this.play();
                    }
                }
            });

            // Add remove button functionality
            const removeBtn = playlistItem.querySelector('.remove-btn');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeSong(actualIndex);
            });

            this.playlist.appendChild(playlistItem);
        });

        this.updatePlaylistHighlight();
    }

    updatePlaylistHighlight() {
        const items = this.playlist.querySelectorAll('.playlist-item:not(.demo-song)');
        items.forEach((item, index) => {
            if (index === this.currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    loadSong(index) {
        if (index < 0 || index >= this.songs.length) return;

        this.currentSongIndex = index;
        const song = this.songs[index];

        this.audio.src = song.url;
        this.songTitle.textContent = song.name;
        this.songArtist.textContent = song.artist;
        this.songAlbum.textContent = song.album;
        
        // Update album cover (using a placeholder for now)
        this.albumCover.src = 'https://via.placeholder.com/300x300/667eea/ffffff?text=' + encodeURIComponent(song.name.substring(0, 2));
        this.albumCover.alt = song.name;

        this.updatePlaylistHighlight();
        this.resetProgress();
    }

    play() {
        if (this.songs.length === 0) {
            this.showUploadModal();
            return;
        }

        // Resume audio context if suspended (required for some browsers)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.audio.play().then(() => {
            this.isPlaying = true;
            this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.albumArt.classList.add('playing');
            this.drawVisualization();
        }).catch(error => {
            console.error('Error playing audio:', error);
            this.showError('Unable to play this audio file');
        });
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.albumArt.classList.remove('playing');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    previousSong() {
        if (this.songs.length === 0) return;

        let prevIndex;
        if (this.isShuffled) {
            const currentShuffledIndex = this.shuffledIndices.indexOf(this.currentSongIndex);
            const prevShuffledIndex = currentShuffledIndex > 0 ? currentShuffledIndex - 1 : this.shuffledIndices.length - 1;
            prevIndex = this.shuffledIndices[prevShuffledIndex];
        } else {
            prevIndex = this.currentSongIndex > 0 ? this.currentSongIndex - 1 : this.songs.length - 1;
        }

        this.loadSong(prevIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    nextSong() {
        if (this.songs.length === 0) return;

        let nextIndex;
        if (this.isShuffled) {
            const currentShuffledIndex = this.shuffledIndices.indexOf(this.currentSongIndex);
            const nextShuffledIndex = currentShuffledIndex < this.shuffledIndices.length - 1 ? currentShuffledIndex + 1 : 0;
            nextIndex = this.shuffledIndices[nextShuffledIndex];
        } else {
            nextIndex = this.currentSongIndex < this.songs.length - 1 ? this.currentSongIndex + 1 : 0;
        }

        this.loadSong(nextIndex);
        if (this.isPlaying) {
            this.play();
        }
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active', this.isShuffled);

        if (this.isShuffled) {
            this.generateShuffledIndices();
        }
    }

    generateShuffledIndices() {
        this.shuffledIndices = [...Array(this.songs.length)].map((_, i) => i);
        
        // Fisher-Yates shuffle
        for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
        }
    }

    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];

        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        
        // Update icon based on repeat mode
        if (this.repeatMode === 'one') {
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i><span style="font-size: 10px; position: absolute; bottom: 2px; right: 2px;">1</span>';
        } else {
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
        }
    }

    seek() {
        const seekTime = (this.progressSlider.value / 100) * this.audio.duration;
        this.audio.currentTime = seekTime;
    }

    setVolume(value) {
        this.audio.volume = value / 100;
        this.volumeSlider.value = value;
    }

    updateProgress() {
        if (this.audio.duration) {
            const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progress.style.width = progressPercent + '%';
            this.progressSlider.value = progressPercent;
            this.currentTimeSpan.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        this.durationSpan.textContent = this.formatTime(this.audio.duration);
        
        // Update song duration in the songs array
        if (this.songs[this.currentSongIndex]) {
            this.songs[this.currentSongIndex].duration = this.formatTime(this.audio.duration);
            this.renderPlaylist();
        }
    }

    resetProgress() {
        this.progress.style.width = '0%';
        this.progressSlider.value = 0;
        this.currentTimeSpan.textContent = '0:00';
        this.durationSpan.textContent = '0:00';
    }

    handleSongEnd() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.repeatMode === 'all' || this.currentSongIndex < this.songs.length - 1 || this.isShuffled) {
            this.nextSong();
        } else {
            this.pause();
            this.resetProgress();
        }
    }

    clearPlaylist() {
        if (this.songs.length === 0) return;

        if (confirm('Are you sure you want to clear the entire playlist?')) {
            // Clean up object URLs
            this.songs.forEach(song => {
                if (song.url && song.url.startsWith('blob:')) {
                    URL.revokeObjectURL(song.url);
                }
            });

            this.songs = [];
            this.filteredSongs = [];
            this.resetPlayer();
            
            // Clear search
            this.searchInput.value = '';
            
            // Clear playlist display
            const playlistItems = this.playlist.querySelectorAll('.playlist-item:not(.demo-song)');
            playlistItems.forEach(item => item.remove());
            
            // Clear storage
            localStorage.removeItem('musicPlayerPlaylist');
            
            this.renderPlaylist();
            this.showUploadModal();
            this.showSuccess('Playlist cleared');
        }
    }

    handleKeyboard(event) {
        // Prevent default behavior when input elements are focused
        if (event.target.tagName === 'INPUT') return;

        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.previousSong();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextSong();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.setVolume(Math.min(100, this.audio.volume * 100 + 10));
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.setVolume(Math.max(0, this.audio.volume * 100 - 10));
                break;
        }
    }

    onLoadStart() {
        this.showLoading();
        this.songTitle.style.opacity = '0.6';
    }

    onCanPlay() {
        this.hideLoading();
        this.songTitle.style.opacity = '1';
    }

    onError(error) {
        console.error('Audio error:', error);
        this.hideLoading();
        this.showError('Error loading audio file. Please try a different file.');
        this.pause();
    }

    setupAudioVisualization() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.visualizer.width = 200;
            this.visualizer.height = 200;
        } catch (error) {
            console.warn('Audio visualization not supported:', error);
        }
    }

    setupDragAndDrop() {
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            this.processFiles(files);
        });

        // Also enable drag and drop on the entire player
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.target.closest('.music-player')) {
                const files = Array.from(e.dataTransfer.files);
                this.processFiles(files);
            }
        });
    }

    drawVisualization() {
        if (!this.analyser || !this.isPlaying) return;

        const canvas = this.visualizer;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 80;

        this.analyser.getByteFrequencyData(this.dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create radial bars
        const barCount = 64;
        const barWidth = 2;
        
        for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * Math.PI * 2;
            const dataIndex = Math.floor((i / barCount) * this.dataArray.length);
            const barHeight = (this.dataArray[dataIndex] / 255) * 40;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);
            
            const hue = (i / barCount) * 360;
            ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
            ctx.lineWidth = barWidth;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        this.animationId = requestAnimationFrame(() => this.drawVisualization());
    }

    async processFiles(files) {
        const audioFiles = files.filter(file => file.type.startsWith('audio/'));
        
        if (audioFiles.length === 0) {
            this.showError('Please select valid audio files');
            return;
        }

        this.showLoading();

        for (const file of audioFiles) {
            try {
                const metadata = await this.extractMetadata(file);
                const song = {
                    file: file,
                    name: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
                    artist: metadata.artist || 'Unknown Artist',
                    album: metadata.album || 'Unknown Album',
                    duration: '0:00',
                    url: URL.createObjectURL(file),
                    id: Date.now() + Math.random()
                };
                this.songs.push(song);
            } catch (error) {
                console.error('Error processing file:', file.name, error);
            }
        }

        this.hideLoading();
        this.savePlaylistToStorage();
        this.renderPlaylist();
        this.hideUploadModal();
        this.showSuccess(`Added ${audioFiles.length} song(s) to playlist`);

        if (this.songs.length > 0 && !this.audio.src) {
            this.loadSong(0);
        }
    }

    async extractMetadata(file) {
        return new Promise((resolve) => {
            // Simple metadata extraction - in a real app you might use a library like music-metadata
            const metadata = {
                title: null,
                artist: null,
                album: null
            };
            
            // Try to extract from filename
            const filename = file.name.replace(/\.[^/.]+$/, "");
            const parts = filename.split(' - ');
            
            if (parts.length >= 2) {
                metadata.artist = parts[0].trim();
                metadata.title = parts[1].trim();
            } else {
                metadata.title = filename;
            }
            
            resolve(metadata);
        });
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.filteredSongs = [...this.songs];
        } else {
            this.filteredSongs = this.songs.filter(song =>
                song.name.toLowerCase().includes(query.toLowerCase()) ||
                song.artist.toLowerCase().includes(query.toLowerCase()) ||
                song.album.toLowerCase().includes(query.toLowerCase())
            );
        }
        this.renderPlaylist();
    }

    savePlaylistToStorage() {
        try {
            const playlistData = this.songs.map(song => ({
                name: song.name,
                artist: song.artist,
                album: song.album,
                duration: song.duration,
                id: song.id
                // Note: We can't save the file or URL as they're temporary
            }));
            localStorage.setItem('musicPlayerPlaylist', JSON.stringify(playlistData));
        } catch (error) {
            console.warn('Could not save playlist to storage:', error);
        }
    }

    loadPlaylistFromStorage() {
        try {
            const saved = localStorage.getItem('musicPlayerPlaylist');
            if (saved) {
                const playlistData = JSON.parse(saved);
                // Note: We can only restore metadata, not actual files
                // This would show the structure but files need to be re-added
                console.log('Previous playlist found:', playlistData.length, 'songs');
            }
        } catch (error) {
            console.warn('Could not load playlist from storage:', error);
        }
    }

    showLoading() {
        this.loadingSpinner.style.display = 'block';
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }

    showError(message) {
        const toast = document.getElementById('error-toast');
        const messageSpan = document.getElementById('error-message');
        messageSpan.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    showSuccess(message) {
        const toast = document.getElementById('success-toast');
        const messageSpan = document.getElementById('success-message');
        messageSpan.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    removeSong(index) {
        if (index < 0 || index >= this.songs.length) return;

        const song = this.songs[index];
        
        // Revoke object URL to free memory
        if (song.url && song.url.startsWith('blob:')) {
            URL.revokeObjectURL(song.url);
        }

        // Remove song from array
        this.songs.splice(index, 1);

        // Update current song index if necessary
        if (index < this.currentSongIndex) {
            this.currentSongIndex--;
        } else if (index === this.currentSongIndex) {
            if (this.currentSongIndex >= this.songs.length) {
                this.currentSongIndex = this.songs.length - 1;
            }
            
            if (this.songs.length > 0) {
                this.loadSong(this.currentSongIndex);
            } else {
                this.resetPlayer();
            }
        }

        this.savePlaylistToStorage();
        this.renderPlaylist();
        this.showSuccess('Song removed from playlist');

        if (this.songs.length === 0) {
            this.showUploadModal();
        }
    }

    resetPlayer() {
        this.pause();
        this.audio.src = '';
        this.resetProgress();
        this.songTitle.textContent = 'Select a song to play';
        this.songArtist.textContent = 'Unknown Artist';
        this.songAlbum.textContent = 'Unknown Album';
        this.albumCover.src = 'https://via.placeholder.com/300x300/667eea/ffffff?text=No+Song';
        this.currentSongIndex = 0;
    }
}

// Initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new MusicPlayer();
    } catch (error) {
        console.error('Failed to initialize music player:', error);
        
        // Fallback error display
        const fallbackError = document.createElement('div');
        fallbackError.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff6b6b;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        fallbackError.innerHTML = `
            <h3>⚠️ Music Player Error</h3>
            <p>Sorry, the music player failed to load.</p>
            <p>Please refresh the page or try a different browser.</p>
        `;
        document.body.appendChild(fallbackError);
    }
});

// Close modal when clicking outside
document.addEventListener('click', (event) => {
    const modal = document.getElementById('upload-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Placeholder for future service worker implementation
        console.log('Service Worker support detected');
    });
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
