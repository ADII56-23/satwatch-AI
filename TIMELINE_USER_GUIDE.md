# How to Use the Timeline Feature

## 🎯 Quick Start Guide

### Step 1: Navigate to Live Section
Click on **"Live"** in the navigation bar

### Step 2: Search for a Location
1. Use the search bar at the top left
2. Type any location (e.g., "Paris", "Tokyo", "Grand Canyon")
3. Select from the dropdown suggestions
4. The map will fly to that location

### Step 3: Activate Timeline Mode
Click the **Clock icon** (⏰) button on the top right
- It's the second button, below the Bell icon
- The button will turn **blue** and start pulsing
- A timeline slider will appear at the top of the page

### Step 4: Explore Historical Imagery
Use any of these controls:

**Timeline Slider:**
- Drag the slider to any year between 2000-2025
- The map updates to show imagery from that year

**Arrow Buttons:**
- Click **←** to go back one year
- Click **→** to go forward one year

**Auto-Play:**
- Click the **Play button** (▶) to automatically cycle through years
- Click **Pause** (⏸) to stop auto-play
- Auto-play changes year every 3 seconds

**Year Markers:**
- Click on any year marker (2000, 2005, 2010, 2015, 2020, 2024)
- Jump directly to that year

### Step 5: View Metadata
Look at the metadata display showing:
- **Sensor type** (Landsat 8, Landsat 7, etc.)
- **Resolution** (30m/px, etc.)
- **Provider** information
- **Date** of imagery

### Step 6: Exit Timeline Mode
Click the **Clock button** again (or the **X** button on the timeline bar)
- Timeline mode deactivates
- Returns to normal map view

## 🎨 Visual Indicators

### Active Timeline Mode:
- Clock button is **blue** and **pulsing**
- Timeline bar visible at top
- Year display shows current selected year
- Metadata overlay shows sensor info

### Inactive Timeline Mode:
- Clock button is **gray**
- No timeline bar
- Normal map view

## 🔍 Tips & Tricks

1. **Best Locations to Try:**
   - Urban areas (cities show dramatic changes)
   - Coastal regions (see erosion/development)
   - Forests (deforestation tracking)
   - Deserts (urban expansion)

2. **Interesting Searches:**
   - "Dubai, UAE" (massive urban growth)
   - "Amazon Rainforest" (deforestation)
   - "Las Vegas, Nevada" (desert to city)
   - "Shanghai, China" (rapid development)
   - "Aral Sea" (environmental changes)

3. **Historical Filters:**
   - Pre-2010 imagery has a sepia tone
   - 2010-2018 imagery has enhanced contrast
   - 2018+ imagery is in full color

## ⚠️ Current Limitations (Demo Mode)

The timeline UI is fully functional, but:
- Satellite imagery doesn't change between years yet
- Requires Google Earth Engine API for actual historical imagery
- See `TIMELINE_IMPLEMENTATION.md` for API setup instructions

## 🚀 Coming Soon (With API Integration)

Once API credentials are added:
- ✅ Actual historical satellite imagery for each year
- ✅ Multiple dates per year
- ✅ Cloud coverage information
- ✅ Higher resolution imagery
- ✅ Change detection overlays
- ✅ Vegetation index visualization

## 📱 Mobile Support

The timeline feature is fully responsive:
- Touch-friendly slider
- Optimized button sizes
- Collapsible metadata
- Swipe gestures supported

## 🎥 Demo Workflow

**Example: Viewing Dubai's Growth**

1. Search: "Dubai, UAE"
2. Click Clock button
3. Set year to 2000 → See desert
4. Click Auto-play
5. Watch the city grow year by year
6. Pause at 2025 → See modern Dubai

**Example: Amazon Deforestation**

1. Search: "Amazon Rainforest, Brazil"
2. Click Clock button
3. Start at 2000 → Dense forest
4. Scrub to 2025 → See changes
5. Use arrow buttons to compare specific years

## 🔧 Troubleshooting

**Timeline not appearing?**
- Make sure you clicked the Clock button
- Check if the button turned blue
- Try refreshing the page

**Location not changing?**
- Search for a location first
- Wait for the map to finish flying to the location
- Then activate timeline mode

**Imagery looks the same?**
- This is expected in demo mode
- Visual filters (sepia/contrast) are applied for older years
- Full imagery changes require API integration

## 📞 Need Help?

If you encounter any issues or have questions:
1. Check the browser console for errors (F12)
2. Verify the backend is running (http://localhost:8000)
3. Ensure the frontend is running (http://localhost:5173)
4. Check `TIMELINE_IMPLEMENTATION.md` for API setup

---

**Enjoy exploring Earth's history! 🌍**
