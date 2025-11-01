# 🎵 Kiyoraka Ken Music Album Collection

Software Version: 2.0.0 - Automatic Discovery with Lazy Loading

## Description

A professional music album portfolio with automatic discovery and lazy loading. This system automatically scans and loads all albums from the `asset/album-name/` directory, eliminating manual array maintenance.

## ✨ Features

- **🤖 Automatic Album Discovery** - No manual array updates needed
- **⚡ Lazy Loading** - Fast initial page load (first 8 albums), progressive loading on scroll
- **🔍 Advanced Search** - Search by album name or song title
- **📊 Multiple Sort Options** - Sort by date, name, or song count
- **📱 Responsive Design** - Beautiful on all devices

## 🚀 Quick Start

### Adding a New Album

1. Create album folder in `asset/album-name/Your Album Name/`
2. Add `albumData.js` with album metadata
3. Add `Art.jpg` or `Art.png` for cover art
4. Run auto-discovery:
   ```bash
   npm run generate
   ```
5. Commit changes

That's it! No manual array editing required.

### Album Data Format

```javascript
window.your_album_name_data = {
    folder: "Your Album Name",
    name: "Your Album Name",
    releaseDate: "2025-11-17",
    totalSongs: 7,
    coverArt: "asset/album-name/Your Album Name/Art.jpg",
    songsData: [
        {
            title: "Song Title",
            style: "Genre description",
            lyrics: "Full lyrics text",
            isrs: "QZDA62569234" // Optional
        }
    ]
};
```

## 🛠️ NPM Scripts

```bash
npm run generate    # Scan folders and generate album-data.js
npm run precommit   # Run before committing (auto-generates list)
npm test           # Open index.html in browser
```

## 📝 Workflow Improvement

### Old Way (Manual) ❌
1. Create album folder
2. Add albumData.js
3. **Manually update asset/js/album-data.js array**
4. Risk of forgetting albums (like "Cyber Hacker" was forgotten)

### New Way (Automatic) ✅
1. Create album folder
2. Add albumData.js
3. Run `npm run generate`
4. All albums discovered automatically!

## 🎯 Performance

- **Initial Load**: First 8 albums (~1-2 seconds)
- **Lazy Load**: 6 albums per batch (triggered on scroll)
- **Total Albums**: 30+ albums with smooth progressive loading
- **Total Songs**: 200+ songs across all albums

## 🔬 Technical Implementation

### Lazy Loading
- Uses Intersection Observer API
- Initial batch: 8 albums
- Subsequent batches: 6 albums each
- Trigger: 200px before reaching bottom
- Non-blocking async loading

### Error Handling
- Missing album validation
- Malformed data warnings
- User-friendly error notifications
- Graceful degradation

---

**⚠️ Important**: Never manually edit `asset/js/album-data.js` - it's auto-generated! Always run `npm run generate` after adding new albums.
