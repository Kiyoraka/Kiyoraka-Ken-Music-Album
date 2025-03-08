// Album information
const albumInfo = {
    name: "Melody Of Blue Sky",
    releaseDate: "2025-02-15",
    totalSongs: 8,
    coverArt: "cover.jpg"
};

// Export album info for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = albumInfo;
}