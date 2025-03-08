// Store all album data
let allAlbums = [];
let totalSongs = 0;

// Function to load all albums
function loadAlbums() {
    try {
        // Define the album directories
        const albumDirectories = [
            'Melody Of Blue Sky',
            'Sunset Dreams',
            'Midnight Tales',
            'Acoustic Sessions',
            'Electric Vibes'
        ];
        
        // We'll use a counter to know when all albums are loaded
        let loadedCount = 0;
        
        // Create script elements for each album
        albumDirectories.forEach(directory => {
            const script = document.createElement('script');
            script.src = `asset/album-name/${directory}/albumData.js`;
            
            // When the script loads, it will define a global variable with album data
            script.onload = function() {
                // The loaded script will define a global variable with the directory name
                const albumData = window[convertToVariableName(directory)];
                allAlbums.push(albumData);
                totalSongs += albumData.totalSongs;
                
                loadedCount++;
                
                // If all albums are loaded, update the UI
                if (loadedCount === albumDirectories.length) {
                    // Update dashboard stats
                    document.getElementById('total-albums').textContent = allAlbums.length;
                    document.getElementById('total-songs').textContent = totalSongs;
                    
                    // Display albums in tables
                    displayAlbums();
                }
            };
            
            // Add the script to the page
            document.body.appendChild(script);
        });
        
    } catch (error) {
        console.error('Error loading albums:', error);
    }
}

// Helper function to convert directory name to valid variable name
function convertToVariableName(directory) {
    return directory.replace(/\s+/g, '_').toLowerCase() + '_data';
}

// Function to display albums in the tables
function displayAlbums() {
    const recentAlbumsBody = document.getElementById('recent-albums-body');
    const allAlbumsBody = document.getElementById('all-albums-body');
    
    // Clear existing content
    recentAlbumsBody.innerHTML = '';
    allAlbumsBody.innerHTML = '';
    
    // Sort albums by release date (newest first)
    const sortedAlbums = [...allAlbums].sort((a, b) => 
        new Date(b.releaseDate) - new Date(a.releaseDate)
    );
    
    // Display albums in both tables
    sortedAlbums.forEach((album, index) => {
        const row = createAlbumRow(album, index);
        
        // Add to all albums table
        allAlbumsBody.appendChild(row.cloneNode(true));
        
        // Add only the 2 most recent albums to the dashboard
        if (index < 2) {
            recentAlbumsBody.appendChild(row);
        }
    });
    
    // Add event listeners to the View buttons
    document.querySelectorAll('.view-album-btn').forEach(button => {
        button.addEventListener('click', function() {
            const albumIndex = this.getAttribute('data-album-index');
            openAlbumModal(allAlbums[albumIndex]);
        });
    });
}

// Function to create an album row
function createAlbumRow(album, index) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${album.name}</td>
        <td>${album.totalSongs}</td>
        <td>${formatDate(album.releaseDate)}</td>
        <td>
            <button class="action-btn view-album-btn" data-album-index="${index}">View</button>
        </td>
    `;
    
    return row;
}

// Function to open album modal
function openAlbumModal(album) {
    const modal = document.getElementById('album-modal');
    const albumCover = document.getElementById('album-cover');
    const albumTitle = document.getElementById('album-title');
    const albumReleaseDate = document.getElementById('album-release-date');
    const albumSongCount = document.getElementById('album-song-count');
    const albumSongsBody = document.getElementById('album-songs-body');
    
    // Set album details
    albumCover.src = album.coverArt;
    albumTitle.textContent = album.name;
    albumReleaseDate.textContent = formatDate(album.releaseDate);
    albumSongCount.textContent = album.totalSongs;
    
    // Clear existing songs
    albumSongsBody.innerHTML = '';
    
    // Add songs to the table
    album.songsData.forEach((song, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${song.title}</td>
            <td>${song.style}</td>
            <td>
                <button class="action-btn view-lyrics-btn" data-song-index="${index}">View Lyrics</button>
            </td>
        `;
        
        albumSongsBody.appendChild(row);
    });
    
    // Add event listeners to view lyrics buttons
    albumSongsBody.querySelectorAll('.view-lyrics-btn').forEach(button => {
        button.addEventListener('click', function() {
            const songIndex = this.getAttribute('data-song-index');
            openLyricsModal(album.songsData[songIndex]);
        });
    });
    
    // Show the modal
    modal.style.display = 'block';
    
    // Set the first tab as active
    document.querySelector('.tab-button[data-tab="cover-tab"]').classList.add('active');
    document.querySelector('.tab-button[data-tab="songs-tab"]').classList.remove('active');
    document.getElementById('cover-tab').classList.remove('hidden');
    document.getElementById('songs-tab').classList.add('hidden');
}

// Function to open lyrics modal
function openLyricsModal(song) {
    const modal = document.getElementById('lyrics-modal');
    const songTitle = document.getElementById('song-title');
    const songStyle = document.getElementById('song-style');
    const songLyrics = document.getElementById('song-lyrics');
    
    // Set song details
    songTitle.textContent = song.title;
    songStyle.textContent = `Style: ${song.style}`;
    songLyrics.textContent = song.lyrics;
    
    // Show the modal
    modal.style.display = 'block';
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Load albums when the page loads
document.addEventListener('DOMContentLoaded', loadAlbums);