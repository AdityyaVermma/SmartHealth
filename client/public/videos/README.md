# Video Background Setup Guide

## 📹 How to Add Your Northeast India Nature Video

Your dashboard now has a beautiful video background! Here's how to add your own video:

---

## 🎬 Step 1: Get Your Video

### Option A: Download Free Stock Videos
**Recommended Sources:**
1. **Pexels Videos** - https://www.pexels.com/videos/
   - Search: "northeast india forest", "assam river", "meghalaya waterfall"
   - Free, no attribution required

2. **Pixabay** - https://pixabay.com/videos/
   - Search: "india nature", "mountain river", "forest stream"
   - Free, high quality

3. **Videvo** - https://www.videvo.net/
   - Search: "tropical forest", "river nature", "mountain landscape"

### Option B: Use Your Own Video
- Record your own footage of NE India nature
- Or use existing videos you have

---

## 📏 Video Specifications

### Recommended Settings:
- **Resolution**: 1920x1080 (Full HD) or higher
- **Format**: MP4 (H.264 codec)
- **Duration**: 10-30 seconds (will loop)
- **File Size**: Under 10MB for fast loading
- **Aspect Ratio**: 16:9

### Tips for Best Results:
✅ Smooth, slow-moving footage (rivers, forests, clouds)
✅ Good lighting (not too dark)
✅ Minimal camera shake
✅ Natural colors (greens, blues)
✅ No people or text in the video

---

## 🚀 Step 2: Add Your Video

1. **Download your video** (e.g., `ne-nature.mp4`)

2. **Place it in this folder**:
   ```
   client/public/videos/ne-nature.mp4
   ```

3. **That's it!** The video will automatically play on your dashboard

---

## 🎨 Current Setup

### Video Path:
```
/videos/ne-nature.mp4
```

### Features:
✅ Auto-plays on page load
✅ Loops continuously
✅ Muted (no sound)
✅ Optimized opacity (40%) for text readability
✅ Fallback to static image if video fails
✅ Responsive on all devices
✅ Smooth gradient overlay

---

## 🔧 Customization Options

### Change Video Opacity:
In `Dashboard.jsx`, find the video style and change:
```javascript
opacity: 0.4  // Change to 0.3 (lighter) or 0.5 (darker)
```

### Change Video:
Just replace the file in `public/videos/ne-nature.mp4` with your new video (keep the same name)

Or update the path in `Dashboard.jsx`:
```javascript
<source src="/videos/your-video-name.mp4" type="video/mp4" />
```

### Add Multiple Videos:
You can create a playlist that rotates videos - let me know if you want this!

---

## 🎯 Suggested Video Themes

Perfect videos for your NE India health dashboard:

1. **Rivers & Waterfalls**
   - Brahmaputra River
   - Meghalaya waterfalls
   - Mountain streams

2. **Forests & Tea Gardens**
   - Assam tea plantations
   - Dense green forests
   - Misty mountains

3. **Landscapes**
   - Rolling hills
   - Valley views
   - Sunrise/sunset over mountains

4. **Wildlife & Nature**
   - Birds in nature
   - Butterflies
   - Natural scenery

---

## 📊 Performance Tips

### Optimize Your Video:
If your video is too large, compress it:

**Online Tools:**
- https://www.freeconvert.com/video-compressor
- https://www.videosmaller.com/

**Settings:**
- Target size: 5-10MB
- Resolution: 1920x1080
- Bitrate: 2-3 Mbps

---

## 🐛 Troubleshooting

### Video not showing?
1. Check file path: `public/videos/ne-nature.mp4`
2. Check file format: Must be MP4
3. Clear browser cache (Ctrl+Shift+R)
4. Check browser console for errors

### Video too bright/dark?
Adjust opacity in Dashboard.jsx (line with `opacity: 0.4`)

### Video not looping?
Check that `loop` attribute is present in the video tag

---

## 🎨 Example Video Searches

Copy these into Pexels/Pixabay:

1. "assam tea garden aerial"
2. "meghalaya waterfall"
3. "brahmaputra river"
4. "northeast india forest"
5. "mountain river flowing"
6. "green forest aerial"
7. "misty mountain landscape"
8. "tropical rainforest"

---

## ✨ What's Already Implemented

Your video background includes:

✅ **Auto-play** - Starts immediately
✅ **Loop** - Plays continuously
✅ **Muted** - No sound
✅ **Fallback** - Shows image if video fails
✅ **Overlay** - Dark gradient for text readability
✅ **Responsive** - Works on all screen sizes
✅ **Optimized** - Smooth performance
✅ **Poster** - Shows image while loading

---

## 📝 Next Steps

1. Find/download a beautiful NE India nature video
2. Name it `ne-nature.mp4`
3. Place it in `client/public/videos/`
4. Refresh your dashboard
5. Enjoy the immersive experience! 🌿

---

**Current Status**: ✅ Video background implemented
**Waiting for**: Your NE India nature video

Once you add the video, your dashboard will look absolutely stunning! 🎥✨
