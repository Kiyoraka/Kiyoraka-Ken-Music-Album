// Store all album data
let allAlbums = [];
let totalSongs = 0;

// Function to load all albums
async function loadAlbums() {
    try {
        // In a real application, you would fetch this data from the server
        // For demo purposes, we'll use a predefined list of album directories
        const albumDirectories = [
            'Melody Of Blue Sky',
            'Sunset Dreams',
            'Midnight Tales',
            'Acoustic Sessions',
            'Electric Vibes'
        ];
        
        // Load each album data
        for (const directory of albumDirectories) {
            const albumData = await loadAlbumData(directory);
            allAlbums.push(albumData);
            totalSongs += albumData.totalSongs;
        }
        
        // Update dashboard stats
        document.getElementById('total-albums').textContent = allAlbums.length;
        document.getElementById('total-songs').textContent = totalSongs;
        
        // Display albums in tables
        displayAlbums();
        
    } catch (error) {
        console.error('Error loading albums:', error);
    }
}

// Function to load album data from a directory
async function loadAlbumData(directory) {
    // Normally, this would be a fetch request to load the album info file
    // For demo purposes, we'll simulate this with a Promise
    
    return new Promise((resolve) => {
        // This simulates loading album data from a file
        setTimeout(() => {
            // Check if it's our example album
            if (directory === 'Melody Of Blue Sky') {
                resolve({
                    folder: directory,
                    name: 'Melody Of Blue Sky',
                    releaseDate: '2025-02-15',
                    totalSongs: 8,
                    coverArt: 'asset/album-name/Melody Of Blue Sky/cover.jpg',
                    songsData: [
                        {
                            title: 'Blue Horizons',
                            style: 'Ambient',
                            lyrics: "Endless blue above\nStretching to infinity\nWhere earth meets the sky\n\nClouds drift peacefully\nWhite islands in azure seas\nHeaven's symphony\n\nBreath of gentle wind\nCaressing the mountain peaks\nNature's lullaby"
                        },
                        {
                            title: 'Sky Dreams',
                            style: 'Dream Pop',
                            lyrics: "Close your eyes and see\nThe vastness of open skies\nDreams take flight so free\n\nSoaring through the blue\nWhere limitations don't exist\nSpirit breaks the chains\n\nInfinite vistas\nUnfold before searching eyes\nEndless horizon"
                        },
                        {
                            title: 'Clouds Dance',
                            style: 'Instrumental',
                            lyrics: "Fluffy white dancers\nTwirling across azure stage\nEphemeral art\n\nShifting formations\nTelling stories in the sky\nNature's poetry\n\nShadows cast below\nPainting landscapes with darkness\nEver-changing world"
                        },
                        {
                            title: 'Heavenly Light',
                            style: 'Acoustic',
                            lyrics: "Rays pierce through the clouds\nGolden beams of warm sunlight\nCelestial gift\n\nIlluminating\nThe path through shadowed valleys\nGuiding weary souls\n\nDivine radiance\nSpilling across the landscape\nHeaven touches earth"
                        },
                        {
                            title: 'Aerial View',
                            style: 'Atmospheric',
                            lyrics: "Far below, the world\nSpreads like a detailed map\nPerspective transformed\n\nMountains turn to bumps\nRivers to silver ribbons\nCities to pixels\n\nElevated sight\nReveals our true dimension\nHumble existence"
                        },
                        {
                            title: 'Dawn Chorus',
                            style: 'Folk',
                            lyrics: "Morning symphony\nBirds welcome the rising sun\nSky turns pink and gold\n\nDew-kissed grass glistens\nAs darkness retreats slowly\nNew day emerges\n\nHope rises with light\nPromise of fresh beginnings\nSky heralds rebirth"
                        },
                        {
                            title: 'Sunset Serenade',
                            style: 'Ballad',
                            lyrics: "Day bids farewell now\nSun sinks into horizon\nPainting skies aflame\n\nOrange melts to red\nPurple deepens into night\nStars begin to wake\n\nBeauty in endings\nReminds us that all things pass\nYet return again"
                        },
                        {
                            title: 'Night Sky',
                            style: 'Ambient',
                            lyrics: "Darkness unfurls wide\nVelvet canvas studded with\nDiamonds of light\n\nAncient constellations\nTell stories of gods and myths\nTimeless observers\n\nMilky way stretches\nCosmic river flowing through\nInfinite darkness"
                        }
                    ]
                });
            } else {
                // Generate placeholder data for other albums
                const songCount = Math.floor(Math.random() * 8) + 5;
                const songs = [];
                
                for (let i = 1; i <= songCount; i++) {
                    songs.push({
                        title: `Song ${i}`,
                        style: getRandomStyle(),
                        lyrics: "Placeholder lyrics\nFor demonstration purposes\nWill be replaced later"
                    });
                }
                
                resolve({
                    folder: directory,
                    name: formatAlbumName(directory),
                    releaseDate: getRandomDate(),
                    totalSongs: songCount,
                    coverArt: 'asset/placeholder-cover.jpg',
                    songsData: songs
                });
            }
        }, 100);
    });
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

// Helper function to format album name from folder name
function formatAlbumName(folderName) {
    return folderName.replace(/([A-Z])/g, ' $1').trim();
}

// Helper function to generate random date
function getRandomDate() {
    const start = new Date(2023, 0, 1);
    const end = new Date(2025, 2, 8); // Current date
    
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    return randomDate.toISOString().split('T')[0];
}

// Helper function to get random music style
function getRandomStyle() {
    const styles = ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Ambient', 'Folk'];
    return styles[Math.floor(Math.random() * styles.length)];
}

// Load albums when the page loads
document.addEventListener('DOMContentLoaded', loadAlbums);