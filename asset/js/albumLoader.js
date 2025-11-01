// Store all album data
let allAlbums = [];
let totalSongs = 0;

// Pagination and filtering state
let currentPage = 1;
const albumsPerPage = 10;
let filteredAlbums = [];
let lastAppliedFilter = 'newest';
let lastSearchTerm = '';

// Lazy loading configuration
const INITIAL_ALBUM_LOAD_COUNT = 8; // Load first 8 albums immediately
const LAZY_LOAD_BATCH_SIZE = 6;     // Load 6 more albums per batch
let currentLoadIndex = 0;           // Track which albums are loaded
let isLoadingMore = false;          // Prevent concurrent loading
let allAlbumsFullyLoaded = false;   // Track if all albums are loaded

// Function to load all albums with lazy loading
function loadAlbums() {
    try {
        // Validation: Check if albumDirectories is defined
        if (typeof albumDirectories === 'undefined' || !Array.isArray(albumDirectories)) {
            console.error('❌ Album directories not found! Please ensure album-data.js is loaded correctly.');
            showErrorMessage('Failed to load album configuration. Please refresh the page.');
            toggleLoading(false);
            return;
        }

        if (albumDirectories.length === 0) {
            console.warn('⚠️ No albums found in directory configuration.');
            showErrorMessage('No albums available. Please add albums to the collection.');
            toggleLoading(false);
            return;
        }

        console.log(`🎵 Starting album load: ${albumDirectories.length} albums discovered`);

        // Show loading state while initializing
        toggleLoading(true);

        // Load initial batch of albums
        loadNextBatch(INITIAL_ALBUM_LOAD_COUNT);

        // Setup lazy loading observer for infinite scroll
        setupLazyLoadObserver();

    } catch (error) {
        console.error('❌ Critical error loading albums:', error);
        showErrorMessage('An unexpected error occurred. Please refresh the page.');
        toggleLoading(false);
    }
}

// Load next batch of albums
function loadNextBatch(batchSize = LAZY_LOAD_BATCH_SIZE) {
    if (isLoadingMore || allAlbumsFullyLoaded) {
        return;
    }

    isLoadingMore = true;
    const startIndex = currentLoadIndex;
    const endIndex = Math.min(startIndex + batchSize, albumDirectories.length);
    const albumsToLoad = endIndex - startIndex;

    if (albumsToLoad === 0) {
        allAlbumsFullyLoaded = true;
        isLoadingMore = false;
        console.log('✅ All albums loaded successfully');
        return;
    }

    console.log(`📦 Loading albums ${startIndex + 1}-${endIndex} of ${albumDirectories.length}`);

    let loadedCount = 0;
    const loadedInBatch = [];

    // Create script elements for albums in this batch
    for (let i = startIndex; i < endIndex; i++) {
        const directory = albumDirectories[i];
            const script = document.createElement('script');
            script.src = `asset/album-name/${directory}/albumData.js`;
            
            // When the script loads successfully
        script.onload = function() {
            // Get the variable name we expect to find
            const varName = convertToVariableName(directory);

            // Check if the variable exists in window
            if (window[varName]) {
                const albumData = window[varName];

                // Validation: Check if album data has required fields
                if (!albumData.name || !albumData.releaseDate || !albumData.songsData) {
                    console.warn(`⚠️ Album "${directory}" is missing required fields`);
                } else {
                    allAlbums.push(albumData);
                    loadedInBatch.push(albumData);
                    totalSongs += albumData.totalSongs;
                }
            } else {
                console.warn(`⚠️ Album data for "${directory}" was loaded but variable "${varName}" was not found`);
            }

            loadedCount++;

            // If this batch is complete
            if (loadedCount === albumsToLoad) {
                currentLoadIndex = endIndex;
                isLoadingMore = false;

                // Check if this was the last batch
                if (currentLoadIndex >= albumDirectories.length) {
                    allAlbumsFullyLoaded = true;
                }

                // Update UI after each batch
                updateDashboardStats();
                displayAlbums();

                // Hide loading indicator if initial batch is done
                if (currentLoadIndex >= INITIAL_ALBUM_LOAD_COUNT) {
                    toggleLoading(false);
                }

                console.log(`✅ Batch complete: ${loadedInBatch.length} albums loaded (Total: ${allAlbums.length}/${albumDirectories.length})`);
            }
        };

        // Handle script loading errors
        script.onerror = function() {
            console.error(`❌ Failed to load album data for "${directory}"`);
            loadedCount++;

            // Continue even if this album failed
            if (loadedCount === albumsToLoad) {
                currentLoadIndex = endIndex;
                isLoadingMore = false;

                // Check if this was the last batch
                if (currentLoadIndex >= albumDirectories.length) {
                    allAlbumsFullyLoaded = true;
                }

                // Update UI after each batch
                updateDashboardStats();
                displayAlbums();

                // Hide loading indicator if initial batch is done
                if (currentLoadIndex >= INITIAL_ALBUM_LOAD_COUNT) {
                    toggleLoading(false);
                }
            }
        };

        // Add the script to the page
        document.body.appendChild(script);
    }
}

// Setup Intersection Observer for lazy loading
function setupLazyLoadObserver() {
    // Create a sentinel element at the bottom of the page
    const sentinel = document.createElement('div');
    sentinel.id = 'lazy-load-sentinel';
    sentinel.style.height = '1px';

    // Find the albums content section
    const allAlbumsBody = document.getElementById('all-albums-body');
    if (allAlbumsBody && allAlbumsBody.parentElement) {
        allAlbumsBody.parentElement.appendChild(sentinel);

        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !allAlbumsFullyLoaded && !isLoadingMore) {
                    console.log('📜 Lazy loading triggered: Loading more albums...');
                    loadNextBatch();
                }
            });
        }, {
            root: null,
            rootMargin: '200px', // Start loading 200px before reaching the sentinel
            threshold: 0
        });

        observer.observe(sentinel);
        console.log('👁️ Lazy load observer initialized');
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const totalAlbumsElement = document.getElementById('total-albums');
    const totalSongsElement = document.getElementById('total-songs');

    if (totalAlbumsElement) {
        totalAlbumsElement.textContent = allAlbums.length;
    }

    if (totalSongsElement) {
        totalSongsElement.textContent = totalSongs;
    }
}

// Show error message to user
function showErrorMessage(message) {
    // Create error notification if it doesn't exist
    let errorNotification = document.getElementById('error-notification');

    if (!errorNotification) {
        errorNotification = document.createElement('div');
        errorNotification.id = 'error-notification';
        errorNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
        `;
        document.body.appendChild(errorNotification);
    }

    errorNotification.textContent = message;
    errorNotification.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorNotification.style.display = 'none';
    }, 5000);
}

// Toggle loading state
function toggleLoading(isLoading, message = 'Processing albums...') {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
            const loadingText = loadingIndicator.querySelector('span');
            if (loadingText) {
                // Show progress if lazy loading
                if (currentLoadIndex > 0 && currentLoadIndex < albumDirectories.length) {
                    loadingText.textContent = `Loading albums ${currentLoadIndex}/${albumDirectories.length}...`;
                } else {
                    loadingText.textContent = message;
                }
            }
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
        const searchTypeSelect = document.getElementById('search-type');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const searchType = searchTypeSelect ? searchTypeSelect.value : 'album';
        
        lastSearchTerm = searchTerm;
        
        // Reset to page 1 when searching
        currentPage = 1;
        
        if (searchTerm === '') {
            // No search term, show all albums with current sort
            filteredAlbums = [...allAlbums];
            performSort(false);
        } else {
            // Filter albums by search term
            if (searchType === 'album') {
                filteredAlbums = allAlbums.filter(album => 
                    album.name.toLowerCase().includes(searchTerm)
                );
            } else { // searchType === 'song'
                filteredAlbums = allAlbums.filter(album =>
                    album.songsData.some(song =>
                        song.title.toLowerCase().includes(searchTerm)
                    )
                );
            }
            
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