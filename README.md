# Fishing Map

A simple, phone-first fishing map: satellite imagery with **filled lake depth bands**, your own catch log, and recently stocked lakes.

**Open it:** https://jayceeninefive-star.github.io/fishing-map/
(Advanced version with every layer and tool: [index-advanced.html](https://jayceeninefive-star.github.io/fishing-map/index-advanced.html))

## What it shows
- **Depth bands (Washington lakes):** Washington Dept. of Ecology / USGS lake bathymetry polygons (5 ft bands) for a few hundred WA lakes, loaded for the area on screen at zoom 11 and up.
- **Depth fallback (coast and big waters):** the NOAA NCEI elevation model, colored into the same depth steps (Puget Sound, coastal US, Lake Washington and other low-lying water).
- **Recently stocked:** WDFW fish plants from data.wa.gov for the last 30 days, with a NEW badge when stocked within 14 days.
- **Boat launches:** WDFW water access sites in WA, and OpenStreetMap slipways elsewhere (zoom 12 and up).
- **My catches:** tap **+** to log a catch with a photo, species, weight, length, lure, depth and a note. Long-press the map to log a catch at that spot. Catches are saved only on your device (IndexedDB).

The layers button switches between depth and plain satellite.

## Notes
- **Not for navigation.** Depths are approximate, and many surveys are decades old.
- There is no free contour data for most small lakes outside Washington.
- One HTML file. Leaflet and Leaflet.markercluster come from a CDN, and no API keys are needed.

Data: Esri World Imagery, WA Ecology / USGS, WDFW, data.wa.gov, NOAA NCEI, OpenStreetMap contributors (Nominatim, Overpass), Photon.
