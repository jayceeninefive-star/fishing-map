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

## Updates and reliability (v5)
- **Updates:** the service worker cache is versioned (`fm-v5.0`). Older installs (v2-v4) are swapped out and reloaded once automatically. After that, when a new version is published you get an orange "Update available, tap to reload" button. When you're online the page always loads fresh HTML.
- **Smoother on phones:** big background layers (all water, NOAA chart areas, contour lines) are drawn on canvas instead of thousands of SVG shapes. The glow effect is paused while you pan or zoom. Requests for areas you've panned away from are cancelled. Far-away features are dropped after long sessions so memory stays flat.
- **Fewer tiny features zoomed out:** at zoom 11-12 you see waters over about 1 acre and creeks of stream order 2 or more (or named ones). Everything shows from zoom 13.
- **When a data source is down:** a small note says which source isn't responding ("Not responding right now: NOAA chart depths…") and the map keeps whatever did load. When you're offline you get an "Offline" note and the cached app.
- Gems and Find parking give up waiting after about 20 s and 9 s and show what they have. Water cards open right away and fill in creeks and access as they load.
- Location blocked: a clear message telling you to allow location for the site.
- Safari private mode: photos are stored as data URLs when IndexedDB can't store images.
- Tap targets are at least 44 px, switches are announced as switches, and there's a search label.

## Rules & closures (v6)

**Regulations change often. This map is a helper, not legal advice; always check current WDFW rules and emergency changes before fishing.**

A "Rules & closures" strip sits on every card, a full Rules sheet opens from it, and the lake sheet has its own section. The "Rules & closures" layer is on by default. The map legend uses red for closed or no fishing, orange for special or emergency rules, and amber for land status (check the rules).

| What | Official source | Notes |
|---|---|---|
| Emergency rules | WDFW RSS `https://wdfw.wa.gov/fishing/regulations/emergency-rules/rss` | The feed has no CORS, so `.github/workflows/emergency-rules.yml` runs `tools/fetch_rules.py` every 3 h and saves `data/emergency-rules.json`. Titles, dates and locations are copied word for word, and every notice links to its WDFW page. The feed only holds the newest ~30 notices. |
| Marine areas 1-13 | WDFW `ApplicationServices/Marine_Areas/MapServer/3` | Tapping salt water shows the area number and name, with links to the pamphlet page and the WDFW area page. |
| MPAs | WDFW `FP_FishMaps/MarineProtectedAreas` (layer 3 polygons + layer 0 allowed-use table) | Red hatch: every recreational category is Closed (no-take). Orange: some categories are Closed or Limited. Each MPA links to its WDFW page and WAC. |
| Freshwater | No WDFW regulations GIS layer exists (only marine and commercial WAC layers) | Shows the statewide rules quoted from the 2026-27 pamphlet, with links to the right Special Rules page. |
| Dams | Pamphlet statewide general rules + WAC 220-310-030(1); dam points from USACE NID (on-stream only), USGS NHD and OSM | 400 ft zone drawn downstream along the NHD flowline. If the flow direction is unknown, a 400 ft circle is drawn instead. |
| Land status | Census TIGERweb (reservations, military), NPS LRD boundaries, USFWS refuge boundaries | Amber with explanatory text. These are not bans. |

Matching: a notice "matches" a water when the name is the same and the county matches (from Census TIGERweb). When the name matches but the notice gives no county, the card says "possible match, check the rule". Many notices cover only part of a river. Gems skips waters with an active closure that matches by name and county, and flags possible matches. Property lines aren't mapped.

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
