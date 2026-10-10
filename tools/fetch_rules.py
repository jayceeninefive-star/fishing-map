#!/usr/bin/env python3
"""Fetch WDFW's official emergency sport-fishing rules RSS feed and save it as JSON for the map.
Source: https://wdfw.wa.gov/fishing/regulations/emergency-rules/rss  (WDFW Sportfishing Rules Updates)
Nothing is invented: titles, dates and locations are copied from the feed; the app links every item to its WDFW page.
"""
import json, re, html, sys, datetime, urllib.request, os
FEED = 'https://wdfw.wa.gov/fishing/regulations/emergency-rules/rss'
OUT = os.path.join(os.path.dirname(__file__), '..', 'data', 'emergency-rules.json')
MON = {m: i + 1 for i, m in enumerate(['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])}
WTYPES = r'(?:River|Creek|Lake|Lakes|Slough|Reservoir|Pond|Ponds|Channel|Fork|Bay|Inlet|Harbor|Canal)'

def text(s): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()
def field(desc, label):
    m = re.search(r'<strong>\s*' + label + r'[^<]*?</strong>\s*:?\s*(.*?)</p>', desc, re.S | re.I)
    if not m: m = re.search(r'<strong>\s*' + label + r'[^<]*?:?\s*</strong>(.*?)</p>', desc, re.S | re.I)
    return text(m.group(1)).lstrip(': ').strip() if m else None

def parse_dates(eff, pub):
    """Return (start, end, open_ended) as ISO dates or None. Only explicit dates in the feed text are used."""
    if not eff: return None, None, False
    s = eff.replace('–', '-').replace('—', '-')
    years = [int(y) for y in re.findall(r'\b(20\d\d)\b', s)]
    year = years[-1] if years else pub.year
    toks = re.findall(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(\d{1,2})\b|(?<=-)\s*(\d{1,2})\b(?!\d)', s)
    dates, cur = [], None
    for mon, day, bare in toks:
        if mon: cur = MON[mon[:3].lower()]; d = int(day)
        elif cur: d = int(bare)
        else: continue
        try: dates.append(datetime.date(year, cur, d))
        except ValueError: pass
    if len(dates) >= 2 and dates[0] > dates[-1]: dates[0] = dates[0].replace(year=year - 1)  # e.g. Dec. 1, 2026-Jan. 31, 2027 handled by year; Nov-Feb spans
    imm = re.search(r'\bimmediately\b', s, re.I)
    open_end = bool(re.search(r'until further notice', s, re.I))
    start = (pub.date() if imm else (dates[0] if dates else None))
    end = None if open_end else (dates[-1] if dates else None)
    if open_end and dates and not imm: start = dates[0]
    return (start.isoformat() if start else None), (end.isoformat() if end else None), open_end

STOP = r'(?:The|From|And|In|On|Of|To|At|Upper|Lower|Opens|Closes|Reopens|Returns|Mainstem|Fork|Includes|Including|All|Only|Both|Marine|Areas?|Puget|Sound)'
def waters(t):
    out = []
    # "Green (Duwamish) River" -> both names
    for m in re.finditer(r"\b([A-Z][a-z]+)\s*\(([A-Z][a-z]+)\)\s+(River|Creek|Lake)\b", t):
        out += [(m.group(1) + ' ' + m.group(3), None), (m.group(2) + ' ' + m.group(3), None)]
    for m in re.finditer(r"\bLake\s+([A-Z][\w'’.-]+(?:\s+[A-Z][\w'’.-]+)?)(?:\s*\(([A-Z][a-z]+) County\))?", t):
        out.append(('Lake ' + m.group(1), m.group(2)))
    for m in re.finditer(r"\b((?:[A-Z][\w'’.-]*\s+){1,3}" + WTYPES + r")\b(?:\s*\(([A-Z][a-z]+) County\))?", t):
        n = m.group(1).strip()
        while True:
            n2 = re.sub(r'^' + STOP + r'\s+', '', n)
            if n2 == n: break
            n = n2
        out.append((n, m.group(2)))
    res = {}
    for name, county in out:
        name = re.sub(r'\s+', ' ', name).strip()
        if len(name.split()) < 2 or re.match(STOP + r'\b', name) or re.fullmatch(r'(North|South|East|West|Middle) Fork', name): continue
        k = name.lower()
        if k in res:
            if county and not res[k]['county']: res[k]['county'] = county
        else: res[k] = {'name': name, 'county': county}
    return list(res.values())

def main():
    req = urllib.request.Request(FEED, headers={'User-Agent': 'fishing-map rules fetcher (+https://jayceeninefive-star.github.io/fishing-map/)'})
    raw = urllib.request.urlopen(req, timeout=60).read().decode('utf8', 'replace')
    items = []
    for it in re.findall(r'<item>(.*?)</item>', raw, re.S):
        g = lambda tag: (re.search(r'<' + tag + r'>(.*?)</' + tag + '>', it, re.S) or [None, ''])[1]
        title = text(g('title')); link = text(g('link')); desc = html.unescape(g('description'))
        try: pub = datetime.datetime.strptime(text(g('pubDate')), '%a, %d %b %Y %H:%M:%S %z')
        except Exception: pub = datetime.datetime.now(datetime.timezone.utc)
        eff = field(desc, 'Effective date'); loc = field(desc, 'Location'); action = field(desc, 'Action'); species = field(desc, 'Species affected')
        start, end, open_end = parse_dates(eff, pub)
        blob = ' '.join(x for x in [title, loc or '', action or ''])
        # red only when WDFW's own title says the water closes to fishing; everything else is a rule change
        closure = bool(re.search(r'\b(clos(e|es|ed|ing))\b(\s+\w+){0,2}\s+(to\s+)?(all\s+)?fishing|closed to fishing|closed to all fishing', title, re.I))
        marine = sorted(set(re.findall(r'Marine Areas?\s+((?:\d{1,2}(?:-\d)?(?:,\s*|\s+and\s+|\s*&\s*)?)+)', blob)), key=str)
        mareas = sorted({a for grp in marine for a in re.findall(r'\d{1,2}(?:-\d)?', grp)}, key=lambda a: [int(x) for x in a.split('-')])
        items.append({'title': title, 'link': link, 'published': pub.isoformat(), 'effective': eff, 'start': start, 'end': end, 'openEnded': open_end,
                      'locations': loc, 'action': action, 'species': species, 'closure': closure,
                      'waters': waters(blob), 'marineAreas': mareas})
    now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
    data = {'source': FEED, 'sourcePage': 'https://wdfw.wa.gov/fishing/regulations/emergency-rules', 'checkedAt': now,
            'note': 'Copied from WDFW\'s emergency rules RSS feed (the newest ~30 notices). Older rules that are still in effect may not be in the feed.', 'items': items}
    old = None
    try: old = json.load(open(OUT))
    except Exception: pass
    changed = not old or old.get('items') != items
    stale = True
    if old and not changed:
        try: stale = (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(old['checkedAt'])).total_seconds() > 20 * 3600
        except Exception: stale = True
    if changed or stale:
        json.dump(data, open(OUT, 'w'), indent=1, ensure_ascii=False); print('wrote', len(items), 'items', 'changed' if changed else 'refresh')
    else: print('no change')
if __name__ == '__main__': main()
