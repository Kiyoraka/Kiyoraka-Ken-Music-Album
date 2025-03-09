// Store all album data
let allAlbums = [];
let totalSongs = 0;

// Pagination and filtering state
let currentPage = 1;
const albumsPerPage = 10;
let filteredAlbums = [];
let lastAppliedFilter = 'newest';
let lastSearchTerm = '';

// Function to load all albums
function loadAlbums() {
    try {
        // Show loading state while initializing
        toggleLoading(true);
        
        // Define the album directories
        const albumDirectories = [
            'Melody Of Blue Sky',
            'Crimson Flower Apocalypse',
            'Ethereal Ascension',
            'Chronicles Of The Azure Guardian',
            'Secangkir Kehidupan',
            'Shadow Flower Symphony',
        ];
        
        // We'll use a counter to know when all albums are loaded
        let loadedCount = 0;
        
        // Create script elements for each album
        albumDirectories.forEach(directory => {
            const script = document.createElement('script');
            script.src = `asset/album-name/${directory}/albumData.js`;
            
            // When the script loads successfully
            script.onload = function() {
                // Get the variable name we expect to find
                const varName = convertToVariableName(directory);
                
                // Check if the variable exists in window
                if (window[varName]) {
                    const albumData = window[varName];
                    allAlbums.push(albumData);
                    totalSongs += albumData.totalSongs;
                } else {
                    console.warn(`Album data for "${directory}" was loaded but variable "${varName}" was not found`);
                }
                
                loadedCount++;
                
                // If all albums are loaded, update the UI
                if (loadedCount === albumDirectories.length) {
                    // Update dashboard stats
                    document.getElementById('total-albums').textContent = allAlbums.length;
                    document.getElementById('total-songs').textContent = totalSongs;
                    
                    // Display albums in tables
                    displayAlbums();
                    
                    // Hide loading indicator
                    toggleLoading(false);
                }
            };
            
            // Handle script loading errors
            script.onerror = function() {
                console.error(`Failed to load album data for "${directory}"`);
                loadedCount++;
                
                // If all albums are loaded (or failed), update the UI
                if (loadedCount === albumDirectories.length) {
                    // Update dashboard stats
                    document.getElementById('total-albums').textContent = allAlbums.length;
                    document.getElementById('total-songs').textContent = totalSongs;
                    
                    // Display albums in tables
                    displayAlbums();
                    
                    // Hide loading indicator
                    toggleLoading(false);
                }
            };
            
            // Add the script to the page
            document.body.appendChild(script);
        });
        
    } catch (error) {
        console.error('Error loading albums:', error);
        toggleLoading(false);
    }
}

// Toggle loading state
function toggleLoading(isLoading) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }
}

// Helper function to convert directory name to valid variable name
function convertToVariableName(directory) {
    return directory.replace(/\s+/g, '_').toLowerCase() + '_data';
}

// Function to display albums in the tables with pagination
function displayAlbums() {
    const recentAlbumsBody = document.getElementById('recent-albums-body');
    const allAlbumsBody = document.getElementById('all-albums-body');
    
    // Clear existing content
    recentAlbumsBody.innerHTML = '';
    allAlbumsBody.innerHTML = '';
    
    // Only proceed if we have albums to show
    if (allAlbums.length === 0) {
        console.warn("No albums were loaded successfully");
        return;
    }
    
    // Sort albums by release date (newest first)
    const sortedAlbums = [...allAlbums].sort((a, b) => 
        new Date(b.releaseDate) - new Date(a.releaseDate)
    );
    
    // Store the sorted albums for filtering
    filteredAlbums = [...sortedAlbums];
    
    // Display recent albums on dashboard (2 most recent)
    sortedAlbums.slice(0, 2).forEach((album) => {
        const originalIndex = allAlbums.findIndex(a => a.name === album.name);
        const row = createAlbumRow(album, originalIndex);
        recentAlbumsBody.appendChild(row);
        
        // Add event listener to the View button
        const viewBtn = row.querySelector('.view-album-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const albumIndex = this.getAttribute('data-album-index');
                openAlbumModal(allAlbums[albumIndex]);
            });
        }
    });
    
    // Display paginated albums
    displayPaginatedAlbums();
    
    // Setup pagination controls
    setupPaginationControls();
    
    // Setup search and filter
    setupSearchAndFilter();
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

// Function to display the current page of albums
function displayPaginatedAlbums() {
    const allAlbumsBody = document.getElementById('all-albums-body');
    allAlbumsBody.innerHTML = '';
    
    // Calculate the slice of albums to show
    const startIndex = (currentPage - 1) * albumsPerPage;
    const endIndex = Math.min(startIndex + albumsPerPage, filteredAlbums.length);
    
    // Display only albums for current page
    for (let i = startIndex; i < endIndex; i++) {
        const album = filteredAlbums[i];
        const originalIndex = allAlbums.findIndex(a => a.name === album.name);
        const row = createAlbumRow(album, originalIndex);
        allAlbumsBody.appendChild(row);
    }
    
    // Update pagination UI
    updatePaginationUI();
    
    // Add view button event listeners
    allAlbumsBody.querySelectorAll('.view-album-btn').forEach(button => {
        button.addEventListener('click', function() {
            const albumIndex = this.getAttribute('data-album-index');
            openAlbumModal(allAlbums[albumIndex]);
        });
    });
}

// Update pagination UI elements
function updatePaginationUI() {
    const totalPages = Math.max(1, Math.ceil(filteredAlbums.length / albumsPerPage));
    
    // Update page numbers and counters
    const currentPageElement = document.getElementById('current-page');
    const totalPagesElement = document.getElementById('total-pages');
    const showingInfoElement = document.getElementById('showing-info');
    
    if (currentPageElement && totalPagesElement && showingInfoElement) {
        currentPageElement.textContent = currentPage;
        totalPagesElement.textContent = totalPages;
        
        if (filteredAlbums.length === 0) {
            showingInfoElement.textContent = 'No albums found';
        } else {
            const startItem = (currentPage - 1) * albumsPerPage + 1;
            const endItem = Math.min(currentPage * albumsPerPage, filteredAlbums.length);
            showingInfoElement.textContent = `Showing ${startItem}-${endItem} of ${filteredAlbums.length} albums`;
        }
    }
    
    // Update button states
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const firstPageBtn = document.getElementById('first-page');
    const lastPageBtn = document.getElementById('last-page');
    
    if (prevPageBtn && nextPageBtn && firstPageBtn && lastPageBtn) {
        prevPageBtn.disabled = (currentPage <= 1);
        nextPageBtn.disabled = (currentPage >= totalPages);
        firstPageBtn.disabled = (currentPage <= 1);
        lastPageBtn.disabled = (currentPage >= totalPages);
    }
}

// Setup pagination controls
function setupPaginationControls() {
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const firstPageBtn = document.getElementById('first-page');
    const lastPageBtn = document.getElementById('last-page');
    
    if (!prevPageBtn || !nextPageBtn || !firstPageBtn || !lastPageBtn) {
        return;
    }
    
    // Previous page
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayPaginatedAlbums();
        }
    });
    
    // Next page
    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredAlbums.length / albumsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayPaginatedAlbums();
        }
    });
    
    // First page
    firstPageBtn.addEventListener('click', function() {
        if (currentPage !== 1) {
            currentPage = 1;
            displayPaginatedAlbums();
        }
    });
    
    // Last page
    lastPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredAlbums.length / albumsPerPage);
        if (currentPage !== totalPages) {
            currentPage = totalPages;
            displayPaginatedAlbums();
        }
    });
}

// Setup search and filter functionality
function setupSearchAndFilter() {
    const searchInput = document.getElementById('album-search');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort-by');
    const applyFilterBtn = document.getElementById('apply-filter');
    
    if (!searchInput || !searchBtn || !sortSelect || !applyFilterBtn) {
        return;
    }
    
    // Remove existing event listeners if any
    searchBtn.replaceWith(searchBtn.cloneNode(true));
    applyFilterBtn.replaceWith(applyFilterBtn.cloneNode(true));
    
    // Get the new elements
    const newSearchBtn = document.getElementById('search-btn');
    const newApplyFilterBtn = document.getElementById('apply-filter');
    
    // Search functionality
    newSearchBtn.addEventListener('click', function() {
        performSearch();
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Filter functionality
    newApplyFilterBtn.addEventListener('click', function() {
        performSort();
    });
}

// Perform search with loading indicator
function performSearch() {
    toggleLoading(true);
    
    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
        const searchInput = document.getElementById('album-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        lastSearchTerm = searchTerm;
        
        // Reset to page 1 when searching
        currentPage = 1;
        
        if (searchTerm === '') {
            // No search term, show all albums with current sort
            filteredAlbums = [...allAlbums];
            performSort(false);
        } else {
            // Filter albums by search term
            filteredAlbums = allAlbums.filter(album => 
                album.name.toLowerCase().includes(searchTerm)
            );
            
            // Apply current sort to filtered results
            performSort(false);
        }
        
        toggleLoading(false);
    }, 10);
}

// Perform sort with loading indicator
function performSort(resetPage = true) {
    toggleLoading(true);
    
    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
        const sortSelect = document.getElementById('sort-by');
        const sortValue = sortSelect ? sortSelect.value : 'newest';
        lastAppliedFilter = sortValue;
        
        // Reset to page 1 when sorting (unless specified)
        if (resetPage) {
            currentPage = 1;
        }
        
        // Sort the filtered albums
        filteredAlbums.sort((a, b) => {
            switch(sortValue) {
                case 'newest':
                    return new Date(b.releaseDate) - new Date(a.releaseDate);
                case 'oldest':
                    return new Date(a.releaseDate) - new Date(b.releaseDate);
                case 'most-songs':
                    return b.totalSongs - a.totalSongs;
                case 'least-songs':
                    return a.totalSongs - b.totalSongs;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
        
        // Display the paginated results
        displayPaginatedAlbums();
        
        toggleLoading(false);
    }, 10);
}

// Function to open album modal
function openAlbumModal(album) {
    const modal = document.getElementById('album-modal');
    const albumCover = document.getElementById('album-cover');
    const albumTitle = document.getElementById('album-title');
    const albumReleaseDate = document.getElementById('album-release-date');
    const albumSongCount = document.getElementById('album-song-count');
    const albumSongsBody = document.getElementById('album-songs-body');
    
    if (!modal || !albumCover || !albumTitle || !albumReleaseDate || !albumSongCount || !albumSongsBody) {
        console.error('Modal elements not found');
        return;
    }
    
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
    const coverTabButton = document.querySelector('.tab-button[data-tab="cover-tab"]');
    const songsTabButton = document.querySelector('.tab-button[data-tab="songs-tab"]');
    const coverTab = document.getElementById('cover-tab');
    const songsTab = document.getElementById('songs-tab');
    
    if (coverTabButton && songsTabButton && coverTab && songsTab) {
        coverTabButton.classList.add('active');
        songsTabButton.classList.remove('active');
        coverTab.classList.remove('hidden');
        songsTab.classList.add('hidden');
    }
}

// Function to open lyrics modal
function openLyricsModal(song) {
    const modal = document.getElementById('lyrics-modal');
    const songTitle = document.getElementById('song-title');
    const songStyle = document.getElementById('song-style');
    const songLyrics = document.getElementById('song-lyrics');
    
    if (!modal || !songTitle || !songStyle || !songLyrics) {
        console.error('Lyrics modal elements not found');
        return;
    }
    
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
document.addEventListener('DOMContentLoaded', function() {
    loadAlbums();
    
    // Check if we need to add the loading indicator
    if (!document.getElementById('loading-indicator')) {
        const albumsContent = document.getElementById('albums-content');
        const tableContainer = albumsContent ? albumsContent.querySelector('.table-container') : null;
        
        if (tableContainer) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'loading-indicator';
            loadingIndicator.className = 'loading-indicator hidden';
            loadingIndicator.innerHTML = `
                <div class="spinner"></div>
                <span>Processing albums...</span>
            `;
            
            tableContainer.parentNode.insertBefore(loadingIndicator, tableContainer.nextSibling);
        }
    }
});