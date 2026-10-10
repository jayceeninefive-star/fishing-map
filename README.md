# Fishing Map

A simple, phone-first fishing map: satellite imagery with **filled lake depth bands**, your own catch log and saved spots, recently stocked lakes, directions, parking near the water, and a "hidden gems" finder.

**Open it:** https://jayceeninefive-star.github.io/fishing-map/
(Advanced version with every layer and tool: [index-advanced.html](https://jayceeninefive-star.github.io/fishing-map/index-advanced.html))

Install it: open it in Chrome (Android) and choose **Add to Home Screen** / **Install app**, or in Safari (iPhone) tap Share → **Add to Home Screen**. The app shell then opens without a signal. Map tiles and data you've already viewed come from the cache. Anything new needs a connection.

## Depths: best source per area (v4)
- **Surveyed WA lakes (~255):** WA Ecology / USGS lake surveys. You get 5 ft filled bands plus the **exact surveyed contour lines** with depth labels at zoom 14+. Tap the water to read the depth, interpolated between the two nearest contours (for example "≈ 23 ft, between the 20 and 25 ft contours"). The public service doesn't publish survey years. Ecology's old MapServer has a few extra lakes (such as Pine Lake). The app retries it every 3 minutes while it's down. Lakes that have contour lines but no bands get filled from the closed contour rings.
- **NOAA-charted water** (Lake Washington, Lake Union, Puget Sound, the Columbia…): NOAA ENC depth areas (DRVAL1–DRVAL2) as filled bands at zoom 10+, and sounding numbers in feet at zoom 15+. Tapping shows the nearest sounding, its survey date and the chart cell. These depths are below chart datum.
- **Everywhere else on the coast:** the NOAA NCEI DEM mosaic, which is CUDEM 1/9 arc-second (~3 m) around Puget Sound. Taps say "model estimate, low accuracy".
- **Every other lake, pond, reservoir and marsh:** the USGS NHDPlus HR outline (plus OSM water) with a gray hatch, and "No depth survey available".
- Depths are approximate; surveys may be old; water levels change.

## Creeks and water features (v4)
- NHDPlus HR flowlines with the artificial paths inside lakes removed. Lines are aqua with a white casing, wider for bigger streams, dashed for intermittent ones and thin for canals. Names appear at zoom 13+. Tap a creek for its name, type and flow status, plus a reminder about WDFW rules.
- Inflow and outflow arrows mark where creeks meet a lake. They're counted on the lake card and in Gems.
- Springs, waterfalls, dams and weirs (NHD points + OSM) appear at zoom 14+.
- **Water near me** (in the Spots tab) lists every mapped water body around you, nearest first.

## Tabs
- **Map:** the map itself. Tap a lake's depth bands for the **lake info sheet**, which has area, max depth, depth bands, recent WDFW stocking, launches and parking, current conditions (Open-Meteo: temperature, wind, pressure trend, sunrise and sunset), an approximate solunar bite window, drop-offs, and WDFW links.
- **Spots:** your saved spots, sorted by distance from you, with search, plus **Export backup / Import**. The backup is a GeoJSON file of spots and catches, with photos included as data URLs.
- **Gems:** ranks the surveyed lakes in view (Washington, zoom 11+) with a 0–100 score and a one-line reason. It's a guess from map data, not a promise of fish. Lakes with no public access found are hidden.

## Adding things
- **+** → Log a catch (photo, species, weight, length, lure, depth, note) or Save a spot (name, type: hot spot, drop-off, weed bed, dock, shore access, parking or launch, notes, optional photo).
- **Long-press the map** to log a catch, save a spot, find parking, or get directions for that exact point.
- **★ on any card** (stocked lake, launch, parking, drop-off, lake) saves it to My Spots. Tap it again to remove it.
- Spot cards have Directions, Parking, Share (a link like `?lat=..&lng=..&name=..` that opens the map at that spot), Edit and Delete.

## Directions and parking
- **Directions** opens a sheet with Google Maps, Apple Maps (iPhone/iPad only) and Waze links, the straight-line distance from you, and a rough drive time from the free OSRM demo router. A dashed line runs from you to the spot.
- **Parking** layer: OpenStreetMap `amenity=parking` (lot or street, free or paid, capacity where tagged; private lots are skipped) within ~400 m of water (USGS NHD and lake depth outlines) or of a launch, plus WDFW water access areas. **Find parking** on a card zooms to the nearest one and draws the straight-line walk to the water or spot.
- WDFW water access areas require a **Discover Pass or a WDFW Vehicle Access Pass**. The Vehicle Access Pass comes free with most annual fishing and hunting licenses, but not razor-clam or shellfish-only ones. ([WDFW rules](https://wdfw.wa.gov/licenses/parking))

## How the Gems score works
- Structure, up to 35: max depth, number of 5 ft bands, and the steepest 10 ft drop (from the depth polygons).
- Stocking, up to 20: a WDFW plant within 14 days scores 20, within 30 days 12.
- Low pressure, up to 20: small lake, no motorized WDFW launch or marina, and few OSM parks, piers, fishing spots or lots nearby. Distance from roads is not measured.
- Public access, up to 15: a WDFW access site, an OSM public park, parking, pier or fishing spot, or a WDFW-listed shoreline.
- Streams, up to 10: USGS NHD creeks touching the shore.

Small markers on the map show the drop-off hotspots, where depth changes fastest.

## Notes and limits
- **Not for navigation.** Depths are approximate, and many surveys are decades old. Depth bands, drop-offs and Gems cover only the few hundred WA lakes that have Ecology surveys.
- Overpass (OSM) public servers are sometimes slow or down. When they are, OSM parking and the OSM part of the pressure score are missing, but WDFW sites still show.
- The solunar bite window is folklore. The times come from moon transit, rise and set (SunCalc).
- Spots and catches live only on this device. Export a backup now and then.

Data: Esri World Imagery, WA Ecology / USGS lake bathymetry (ArcGIS Online + Ecology MapServer), WDFW, data.wa.gov, USGS NHD, NOAA NCEI, OpenStreetMap contributors (Overpass, Nominatim), Photon, Open-Meteo, OSRM, SunCalc.
