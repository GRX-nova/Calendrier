/* ==========================================================================
   ICÔNES — petites illustrations d'objets (SVG intégrés).
   Remplaçables objet par objet via "image" dans data/items.js.
   Style commun : trait brun, remplissages or / glace / rouge, viewBox 64×64.
   ========================================================================== */
(function () {
  const G = window.Game;
  const GOLD = '#e9c46a', GOLD2 = '#c9983a', DARK = '#5b3a1e', ICE = '#a9dcf5', ICE2 = '#6fb7e0', CREAM = '#fff3d6',
    RED = '#c0392b', GREEN = '#3f7d58', WOOD = '#9a6a3a', WHITE = '#ffffff';
  const st = `stroke="${DARK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const wrap = (inner) => `<svg viewBox="0 0 64 64" class="ico" aria-hidden="true">${inner}</svg>`;

  function gearPath(cx, cy, r1, r2, n) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2, a2 = a + Math.PI / (n * 2);
      const r = i % 2 ? r1 : r2;
      d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} `;
      d += `L${(cx + r * Math.cos(a2)).toFixed(1)},${(cy + r * Math.sin(a2)).toFixed(1)} `;
    }
    return d + 'Z';
  }
  function starPath(cx, cy, ro, ri, n) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? ri : ro;
      d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} `;
    }
    return d + 'Z';
  }

  const icons = {
    lantern: wrap(`<path d="M32 6c-5 0-7 4-7 6" fill="none" ${st}/><rect x="23" y="12" width="18" height="5" rx="2" fill="${GOLD2}" ${st}/><path d="M24 17h16l3 28H21z" fill="${CREAM}" ${st}/><ellipse cx="32" cy="33" rx="6" ry="9" fill="${GOLD}" opacity=".9"/><path d="M32 25c3 4 4 8 0 14-4-6-3-10 0-14z" fill="#f4a261"/><rect x="20" y="45" width="24" height="6" rx="2" fill="${GOLD2}" ${st}/>`),
    cookie: wrap(`<path d="${starPath(32, 33, 25, 15, 5)}" fill="#d9a066" ${st}/><circle cx="26" cy="30" r="2" fill="${DARK}"/><circle cx="37" cy="27" r="2" fill="${DARK}"/><circle cx="32" cy="38" r="2" fill="${DARK}"/><circle cx="40" cy="39" r="1.6" fill="${DARK}"/><path d="M22 40l4-3" stroke="${WHITE}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`),
    gear: wrap(`<path d="${gearPath(32, 32, 18, 24, 9)}" fill="${GOLD}" ${st}/><circle cx="32" cy="32" r="8" fill="${CREAM}" ${st}/><path d="M22 22l4 3" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`),
    key: wrap(`<circle cx="20" cy="22" r="11" fill="${GOLD}" ${st}/><circle cx="20" cy="22" r="4.5" fill="${CREAM}" ${st}/><path d="M28 29l22 22" ${st} fill="none" stroke-width="6" stroke="${DARK}"/><path d="M28 29l22 22" fill="none" stroke="${GOLD}" stroke-width="3.2" stroke-linecap="round"/><path d="M42 43l5-5M47 48l5-5" ${st} fill="none"/><path d="M46 28l1-4 3 3-4 1z" fill="${ICE}" stroke="none"/>`),
    scroll: wrap(`<path d="M16 14h32c3 0 5 2 5 5v4H21c-3 0-5-2-5-5z" fill="#e8d3a2" ${st}/><path d="M21 23h27v24c0 3 2 5 5 5H21c-3 0-5-2-5-5V19" fill="${CREAM}" ${st}/><path d="M26 30h16M26 36h16M26 42h10" stroke="${WOOD}" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M45 8l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="${GOLD}" stroke="none"/>`),
    vial: wrap(`<path d="M26 8h12v4h-2v10l11 20c3 6-1 12-8 12H25c-7 0-11-6-8-12l11-20V12h-2z" fill="${CREAM}" ${st}/><path d="M22 40l-4 6c-3 5 1 10 7 10h14c6 0 10-5 7-10l-4-6z" fill="${ICE2}" opacity=".9"/><circle cx="29" cy="46" r="1.8" fill="#fff"/><circle cx="36" cy="49" r="1.4" fill="#fff"/><circle cx="33" cy="43" r="1.2" fill="#fff"/><rect x="25" y="6" width="14" height="5" rx="2" fill="${WOOD}" ${st}/>`),
    bell: wrap(`<path d="M32 8c-9 0-14 8-14 18 0 8-3 12-6 15h40c-3-3-6-7-6-15 0-10-5-18-14-18z" fill="${ICE}" ${st}/><path d="M24 20c1-4 4-7 8-8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="32" cy="48" r="4.5" fill="${GOLD}" ${st}/><circle cx="32" cy="7" r="2.6" fill="${GOLD}" ${st}/>`),
    map: wrap(`<path d="M8 16l16-6 16 6 16-6v38l-16 6-16-6-16 6z" fill="#ecd9a8" ${st}/><path d="M24 10v38M40 16v38" stroke="${DARK}" stroke-width="1.6" fill="none" opacity=".5"/><path d="M14 38c6-8 10 2 16-6s10 2 16-6" stroke="${RED}" stroke-width="2.2" stroke-dasharray="3 3" fill="none" stroke-linecap="round"/><path d="M44 18l6 6M50 18l-6 6" stroke="${RED}" stroke-width="2.6" stroke-linecap="round"/>`),
    mitten: wrap(`<path d="M20 24c0-8 3-14 8-14s7 4 7 10l3-1c3-1 6 1 5 5l-3 10c-1 5-3 8-3 12H22c-2-6-2-14-2-22z" fill="${RED}" ${st}/><rect x="21" y="44" width="21" height="9" rx="3" fill="${WHITE}" ${st}/><path d="M26 28l2 3 2-3M32 34l2 3 2-3M27 38l2 3 2-3" stroke="${WHITE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`),
    jar: wrap(`<rect x="20" y="8" width="24" height="7" rx="2" fill="${WOOD}" ${st}/><path d="M22 15h20c4 4 6 9 6 14v17c0 4-3 7-7 7H23c-4 0-7-3-7-7V29c0-5 2-10 6-14z" fill="#f1f7ff" fill-opacity=".55" ${st}/><circle cx="26" cy="30" r="2.8" fill="${GOLD}"/><circle cx="38" cy="36" r="2.8" fill="${GOLD}"/><circle cx="30" cy="44" r="2.8" fill="${GOLD}"/><circle cx="40" cy="26" r="2.2" fill="#ffe08a"/><circle cx="26" cy="30" r="5.5" fill="${GOLD}" opacity=".25"/><circle cx="38" cy="36" r="5.5" fill="${GOLD}" opacity=".25"/>`),
    rope: wrap(`<ellipse cx="32" cy="36" rx="22" ry="14" fill="none" stroke="${DARK}" stroke-width="8" /><ellipse cx="32" cy="36" rx="22" ry="14" fill="none" stroke="#d9b36a" stroke-width="4.6"/><ellipse cx="32" cy="32" rx="14" ry="8" fill="none" stroke="${DARK}" stroke-width="7"/><ellipse cx="32" cy="32" rx="14" ry="8" fill="none" stroke="#d9b36a" stroke-width="3.6"/><path d="M50 40c6 2 8 8 4 12" fill="none" stroke="${DARK}" stroke-width="6" stroke-linecap="round"/><path d="M50 40c6 2 8 8 4 12" fill="none" stroke="#d9b36a" stroke-width="3" stroke-linecap="round"/>`),
    telescope: wrap(`<g transform="rotate(-28 32 32)"><rect x="8" y="26" width="22" height="12" rx="3" fill="${WOOD}" ${st}/><rect x="28" y="23" width="18" height="18" rx="3" fill="${GOLD}" ${st}/><rect x="44" y="20" width="12" height="24" rx="3" fill="${GOLD2}" ${st}/><ellipse cx="56" cy="32" rx="2.6" ry="10" fill="${ICE}" ${st}/></g><path d="M24 42l-6 14M28 44l6 12" ${st} fill="none"/>`),
    scarf: wrap(`<path d="M10 20c8-8 36-8 44 0v10c-8-8-36-8-44 0z" fill="${RED}" ${st}/><path d="M24 29l6 26h12l-4-24z" fill="${RED}" ${st}/><path d="M26 36h13M28 44h13M30 52h12" stroke="${WHITE}" stroke-width="3" stroke-linecap="round"/><path d="M32 54v5M36 54v5M40 54v5" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/><path d="M18 19c10-4 20-4 30 0" stroke="${WHITE}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>`),
    crampon: wrap(`<path d="M12 28h30l6 8c2 3 0 6-3 6H12c-3 0-5-2-5-5v-6c0-2 2-3 5-3z" fill="#7a8896" ${st}/><rect x="10" y="42" width="40" height="5" rx="2" fill="#4a5560" ${st}/><path d="M14 47l3 9 3-9M24 47l3 9 3-9M34 47l3 9 3-9M44 47l2 7 2-7" fill="${ICE}" ${st}/><path d="M18 18h14v10H18z" fill="#aab7c4" ${st}/>`),
    crystal: wrap(`<path d="M32 6l12 14-4 34H24l-4-34z" fill="${ICE}" ${st}/><path d="M32 6l-3 48M32 6l11 14M32 6L21 20M20 20h24" stroke="${ICE2}" stroke-width="1.8" fill="none"/><path d="M12 32l8-6 4 28H14z" fill="#c9ecfb" ${st}/><path d="M52 34l-8-6-4 26h10z" fill="#bfe3f7" ${st}/><path d="M28 14l2-4" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`),
    skate: wrap(`<path d="M14 10h14v22l16 6c6 2 10 6 10 12v2H12V10z" fill="${CREAM}" ${st}/><path d="M14 10h14v8H14z" fill="${RED}" ${st}/><path d="M8 52h50" stroke="${DARK}" stroke-width="5" stroke-linecap="round"/><path d="M8 52h50" stroke="#dfe6ec" stroke-width="2.4" stroke-linecap="round"/><path d="M18 46v6M44 46v6" stroke="${DARK}" stroke-width="2.6"/><path d="M20 22h6M20 27h6" stroke="${DARK}" stroke-width="1.8" stroke-linecap="round"/>`),
    gem: wrap(`<path d="M16 22l8-12h16l8 12-16 32z" fill="${ICE}" ${st}/><path d="M16 22h32M24 10l-4 12 12 32 12-32-4-12M32 10l-6 12 6 32 6-32z" fill="none" stroke="${ICE2}" stroke-width="1.6"/><path d="M22 18l4-5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="32" cy="30" r="14" fill="${GOLD}" opacity=".18"/>`),
    flag: wrap(`<path d="M16 6v52" stroke="${DARK}" stroke-width="5" stroke-linecap="round"/><path d="M16 6v52" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/><path d="M18 10c10-5 18 5 30 0v24c-12 5-20-5-30 0z" fill="${RED}" ${st}/><path d="${starPath(33, 22, 7, 3, 6)}" fill="${WHITE}" stroke="none"/><circle cx="16" cy="6" r="3.4" fill="${GOLD}" ${st}/>`),
    candle: wrap(`<path d="M32 6c5 6 6 10 0 16-6-6-5-10 0-16z" fill="#f4a261" ${st}/><path d="M32 12c2 3 3 5 0 8-3-3-2-5 0-8z" fill="#ffe08a"/><rect x="24" y="24" width="16" height="28" rx="3" fill="${CREAM}" ${st}/><path d="M24 30c4 3 6-1 8 2s6 0 8 2" fill="#fff" opacity=".8" stroke="none"/><path d="M18 52h28l-3 6H21z" fill="#c4ccd6" ${st}/>`),
    hourglass: wrap(`<rect x="14" y="6" width="36" height="6" rx="2" fill="${GOLD2}" ${st}/><rect x="14" y="52" width="36" height="6" rx="2" fill="${GOLD2}" ${st}/><path d="M18 12h28c0 12-6 16-10 20 4 4 10 8 10 20H18c0-12 6-16 10-20-4-4-10-8-10-20z" fill="#e9f6ff" fill-opacity=".7" ${st}/><path d="M24 14h16c-1 6-5 8-8 11-3-3-7-5-8-11z" fill="${ICE2}" opacity=".6"/><path d="M26 52c1-5 4-7 6-9 2 2 5 4 6 9z" fill="${GOLD}"/>`),
    book: wrap(`<path d="M10 12c8-3 16-2 22 3 6-5 14-6 22-3v38c-8-3-16-2-22 3-6-5-14-6-22-3z" fill="#2f4a8a" ${st}/><path d="M32 15v38" stroke="${GOLD}" stroke-width="2.2"/><path d="M13 16c6-2 12-1 17 2v32c-5-3-11-4-17-2z" fill="${CREAM}" opacity=".95"/><path d="${starPath(44, 26, 7, 3, 6)}" fill="${GOLD}" stroke="${DARK}" stroke-width="1.2"/><path d="M18 24h8M18 30h8M18 36h8" stroke="${WOOD}" stroke-width="1.8" stroke-linecap="round"/>`),
    medallion: wrap(`<path d="M32 4c-8 0-14 4-14 8M32 4c8 0 14 4 14 8" fill="none" ${st}/><circle cx="32" cy="38" r="20" fill="${GOLD}" ${st}/><circle cx="32" cy="38" r="14.5" fill="#2f4a8a" ${st}/><path d="${starPath(32, 38, 11, 5, 12)}" fill="${GOLD}" stroke="${DARK}" stroke-width="1"/><circle cx="32" cy="38" r="3" fill="${CREAM}"/>`),
    spark: wrap(`<circle cx="32" cy="32" r="22" fill="#ffd27d" opacity=".25"/><path d="M32 6c2 14 6 18 20 20-14 2-18 6-20 20-2-14-6-18-20-20 14-2 18-6 20-20z" fill="${GOLD}" ${st}/><path d="M32 18c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10z" fill="${CREAM}" stroke="none"/><circle cx="50" cy="14" r="2.4" fill="#ffe08a"/><circle cx="14" cy="50" r="2" fill="#ffe08a"/>`),
    star: wrap(`<circle cx="32" cy="32" r="28" fill="#ffd27d" opacity=".22"/><path d="${starPath(32, 32, 27, 14, 12)}" fill="${GOLD}" ${st}/><path d="${starPath(32, 32, 14, 7, 12)}" fill="${CREAM}" stroke="none"/>`),
    elixir: wrap(`<path d="M27 6h10v8l-2 4c9 3 15 10 15 20 0 11-8 18-18 18S14 49 14 38c0-10 6-17 15-20l-2-4z" fill="${CREAM}" ${st}/><path d="M16 38c0 11 7 16 16 16s16-5 16-16c-6 3-10-2-16 0s-10-3-16 0z" fill="${ICE2}"/><circle cx="26" cy="44" r="2" fill="#fff"/><circle cx="38" cy="47" r="1.6" fill="#fff"/><circle cx="33" cy="40" r="1.4" fill="${GOLD}"/><rect x="26" y="4" width="12" height="5" rx="2" fill="${WOOD}" ${st}/><path d="M44 12l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="${GOLD}" stroke="none"/>`),
    /* ---- objets du récit ---- */
    letter: wrap(`<rect x="7" y="15" width="50" height="35" rx="3" fill="${CREAM}" ${st}/><path d="M7 17l25 19 25-19" fill="none" ${st}/><path d="M7 49l18-15M57 49L39 34" stroke="${DARK}" stroke-width="1.6" fill="none" opacity=".55"/><circle cx="32" cy="38" r="8.5" fill="${RED}" ${st}/><path d="${starPath(32, 38, 5.5, 2.4, 8)}" fill="${CREAM}" stroke="none"/><path d="M32 33v10" stroke="${RED}" stroke-width="1.4"/>`),
    dial: wrap(`<path d="M32 56L6 24A42 42 0 0 1 58 24z" fill="${CREAM}" ${st}/><path d="M32 56L6 24A42 42 0 0 1 58 24z" fill="none" stroke="${GOLD2}" stroke-width="3" opacity=".9" transform="translate(0 0) scale(1)"/><path d="M12 28l4 3M20 17l3 4M32 12v6M44 17l-3 4M52 28l-4 3" stroke="${DARK}" stroke-width="2.2" stroke-linecap="round"/><path d="M24 44l3-6 5 4 5-4 3 6z" fill="none" stroke="${RED}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="32" cy="40" r="1.8" fill="${RED}"/>`),
    keyblack: wrap(`<circle cx="20" cy="22" r="11.5" fill="#2e2e44" ${st}/><circle cx="20" cy="22" r="5" fill="${CREAM}" ${st}/><path d="M28 29l22 22" ${st} fill="none" stroke-width="6.5" stroke="${DARK}"/><path d="M28 29l22 22" fill="none" stroke="#2e2e44" stroke-width="3.6" stroke-linecap="round"/><path d="M42 43l5-5M47 48l5-5" ${st} fill="none"/><path d="M14 24c3-5 8-6 12-3l-3 2 2 4-5-1z" fill="${GOLD}" stroke="none"/>`),
    page: wrap(`<path d="M14 6h26l10 10v10l-4 3 3 4-4 4 3 4-2 4v9H14z" fill="#f3e3bd" ${st}/><path d="M40 6v10h10" fill="none" ${st}/><path d="M20 22h16M20 29h22M20 36h18M20 43h12" stroke="${WOOD}" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M46 28l4 3-4 4 3 4-4 4" stroke="${DARK}" stroke-width="1.6" fill="none" opacity=".6"/>`),
    dust: wrap(`<path d="M26 8h12v4h-2v10l11 20c3 6-1 12-8 12H25c-7 0-11-6-8-12l11-20V12h-2z" fill="${CREAM}" ${st}/><path d="M22 40l-4 6c-3 5 1 10 7 10h14c6 0 10-5 7-10l-4-6z" fill="#3a7bd5" opacity=".95"/><circle cx="28" cy="47" r="1.8" fill="#bfe3ff"/><circle cx="37" cy="50" r="1.4" fill="#bfe3ff"/><circle cx="33" cy="43" r="1.2" fill="#bfe3ff"/><circle cx="46" cy="22" r="1.6" fill="#7fb8ff" stroke="none"/><circle cx="50" cy="30" r="1.2" fill="#7fb8ff" stroke="none"/><rect x="25" y="6" width="14" height="5" rx="2" fill="${WOOD}" ${st}/>`),
    feather: wrap(`<path d="M52 8C30 8 14 24 12 54l5-3c4-7 8-9 14-11 11-4 19-16 21-32z" fill="#2e2e44" ${st}/><path d="M13 54L40 22" stroke="#9a9ac4" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M26 38l-8 1M32 32l-9-1M38 26l-6-3" stroke="#9a9ac4" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`),
    wax: wrap(`<path d="M10 34c-2-12 8-22 21-21 13 0 23 8 22 21-1 11-9 18-21 17-12 0-20-6-22-17z" fill="#b5281f" ${st}/><path d="M18 24c4-6 10-8 15-7" stroke="#e8756a" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M26 34l4-6 5 4 4-5 2 8z" fill="none" stroke="#7d1812" stroke-width="2.2" stroke-linejoin="round"/><path d="M50 22l5-3-1 6 4 2-6 1" fill="#b5281f" ${st}/>`),
    pebble: wrap(`<path d="M10 38c0-14 10-24 24-24 14 0 22 10 20 22-2 12-12 16-24 15-12 0-20-4-20-13z" fill="#9aa5ad" ${st}/><path d="M18 26c4-5 9-7 14-7" stroke="#d6dde2" stroke-width="3" stroke-linecap="round" fill="none"/><path d="${starPath(33, 38, 8.5, 3.6, 6)}" fill="none" stroke="${DARK}" stroke-width="2.2" stroke-linejoin="round"/>`),
    mirror: wrap(`<rect x="28" y="40" width="8" height="18" rx="3" fill="${WOOD}" ${st}/><ellipse cx="32" cy="24" rx="19" ry="21" fill="${GOLD}" ${st}/><ellipse cx="32" cy="24" rx="14.5" ry="16.5" fill="#dff2ff" ${st}/><path d="M30 8l5 12-8 7 9 13M35 20l11 4" stroke="${DARK}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 16c2-3 5-5 8-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>`),
    watch: wrap(`<path d="M32 10V4M26 4h12" stroke="${DARK}" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="34" r="22" fill="${GOLD}" ${st}/><circle cx="32" cy="34" r="17" fill="${CREAM}" ${st}/><path d="M32 20v3M32 45v3M18 34h3M43 34h3" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/><path d="M32 34l-5 9M32 34l9 4" stroke="${RED}" stroke-width="2.6" stroke-linecap="round"/><circle cx="32" cy="34" r="2" fill="${DARK}"/><path d="M14 14c-6 4-9 10-8 16" stroke="${GOLD2}" stroke-width="2.4" fill="none" stroke-dasharray="4 3"/>`),
    bellmute: wrap(`<path d="M32 8c-9 0-14 8-14 18 0 8-3 12-6 15h40c-3-3-6-7-6-15 0-10-5-18-14-18z" fill="${ICE}" ${st}/><path d="M24 20c1-4 4-7 8-8" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M12 41h40" stroke="${DARK}" stroke-width="2.4" stroke-linecap="round"/><path d="M27 46h10" stroke="${ICE2}" stroke-width="2" stroke-dasharray="2 3" stroke-linecap="round"/><circle cx="32" cy="7" r="2.6" fill="${GOLD}" ${st}/><path d="M22 54l20-12" stroke="${RED}" stroke-width="0" />`),
    lightvial: wrap(`<circle cx="32" cy="42" r="19" fill="#ffe08a" opacity=".3"/><path d="M26 8h12v4h-2v10l11 20c3 6-1 12-8 12H25c-7 0-11-6-8-12l11-20V12h-2z" fill="${CREAM}" ${st}/><path d="M32 33c4 6 6 9 0 15-6-6-4-9 0-15z" fill="#ffd96a" stroke="${GOLD2}" stroke-width="1.6"/><circle cx="32" cy="43" r="3" fill="#fff"/><rect x="25" y="6" width="14" height="5" rx="2" fill="${WOOD}" ${st}/>`),
    shell: wrap(`<path d="M10 46c-2-16 8-32 24-34 12-1 20 8 20 18 0 12-10 22-24 22-8 0-18-2-20-6z" fill="#f4d9c0" ${st}/><path d="M34 12c-4 12-8 24-22 34M34 12c2 10 0 24-12 36M34 12c8 6 14 14 12 28M34 12c10 2 18 8 20 18" stroke="#c98f6a" stroke-width="1.8" fill="none"/><path d="M52 12c3 2 4 5 4 8M56 8c4 3 6 8 6 12" stroke="${ICE2}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`),
    seal: wrap(`<path d="M22 44l-6 14 10-4 4 6 4-18M42 44l6 14-10-4-4 6-4-18" fill="${RED}" ${st}/><circle cx="32" cy="28" r="22" fill="#8f2a22" ${st}/><circle cx="32" cy="28" r="16.5" fill="none" stroke="#d65a4c" stroke-width="2"/><path d="${starPath(32, 28, 12.5, 6, 12)}" fill="#e0867a" stroke="#5a1510" stroke-width="1.2"/><path d="M32 22v12" stroke="#5a1510" stroke-width="1.8" stroke-linecap="round"/>`),
    ring: wrap(`<ellipse cx="32" cy="42" rx="17" ry="13" fill="none" stroke="${DARK}" stroke-width="9"/><ellipse cx="32" cy="42" rx="17" ry="13" fill="none" stroke="${GOLD}" stroke-width="5.2"/><path d="M24 26l4-9h8l4 9-8 11z" fill="${ICE}" ${st}/><path d="M24 26h16M28 17l4 9 4-9" stroke="${ICE2}" stroke-width="1.4" fill="none"/>`),
    compass: wrap(`<circle cx="32" cy="32" r="25" fill="${GOLD}" ${st}/><circle cx="32" cy="32" r="19.5" fill="${CREAM}" ${st}/><path d="M32 14l5 18-5 18-5-18z" fill="${WHITE}" ${st}/><path d="M32 14l5 18H27z" fill="${RED}" ${st}/><path d="M14 32h4M46 32h4M32 12v3" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="32" r="2.4" fill="${DARK}"/><circle cx="32" cy="6" r="3.2" fill="${GOLD}" ${st}/>`),
    heart: wrap(`<circle cx="32" cy="32" r="28" fill="#ffd27d" opacity=".25"/><path d="M32 56C9 40 7 22 17 15c7-4 13-1 15 6 2-7 8-10 15-6 10 7 8 25-15 41z" fill="#ff8a6b" ${st}/><path d="M32 56C9 40 7 22 17 15c7-4 13-1 15 6 2-7 8-10 15-6 10 7 8 25-15 41z" fill="none" stroke="${GOLD}" stroke-width="1.4" opacity=".7" transform="translate(0 0)"/><path d="${starPath(32, 32, 9, 4, 6)}" fill="${CREAM}" stroke="${GOLD2}" stroke-width="1.2"/><path d="M20 20c2-3 5-4 8-3" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>`),
    snowflake: wrap(`<g stroke="${ICE}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M32 6v52M9.5 19l45 26M9.5 45l45-26"/><path d="M26 10l6 5 6-5M26 54l6-5 6 5M8 28l8 1-2 8M56 28l-8 1 2 8M8 36l8-1-2-8M56 36l-8-1 2-8"/></g>`),
    lock: wrap(`<rect x="14" y="28" width="36" height="28" rx="5" fill="${GOLD2}" ${st}/><path d="M22 28v-8a10 10 0 0120 0v8" fill="none" ${st}/><circle cx="32" cy="42" r="4" fill="${DARK}"/>`),
    gift: wrap(`<rect x="10" y="26" width="44" height="30" rx="3" fill="${RED}" ${st}/><rect x="8" y="20" width="48" height="10" rx="3" fill="#d94a3a" ${st}/><rect x="28" y="20" width="8" height="36" fill="${GOLD}" ${st}/><path d="M32 20c-8-12-18-6-12 0M32 20c8-12 18-6 12 0" fill="none" ${st}/>`)
  };

  /* ---- objets du récit : version illustrée (plus détaillée) ---- */
  (function () {
    const IRON = '#34344e', IRON2 = '#6c6c92', SILVER = '#d9dee6', SILVER2 = '#9aa4b2', PAPER = '#f6e7c4', PAPER2 = '#e2c98f';
    const sh = (rx) => `<ellipse cx="32" cy="59" rx="${rx || 18}" ry="2.8" fill="#3b2614" opacity=".14"/>`;
    const hl = (d, w) => `<path d="${d}" stroke="#fff" stroke-width="${w || 2.2}" stroke-linecap="round" fill="none" opacity=".75"/>`;
    const sp = (x, y, r, c) => `<path d="M${x} ${y - r}c${r * .15} ${r * .7} ${r * .3} ${r * .85} ${r} ${r}c${-r * .7} ${r * .15} ${-r * .85} ${r * .3} ${-r} ${r}c${-r * .15} ${-r * .7} ${-r * .3} ${-r * .85} ${-r} ${-r}c${r * .7} ${-r * .15} ${r * .85} ${-r * .3} ${r} ${-r}z" fill="${c || '#ffe08a'}"/>`;
    Object.assign(icons, {
      letter: wrap(`${sh(24)}<rect x="6" y="15" width="52" height="36" rx="3" fill="${PAPER}" ${st}/>
        <path d="M6 49l20-15M58 49L38 34" stroke="${PAPER2}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M7 17l25 21 25-21z" fill="#ecd6a4" ${st}/>${hl('M11 19l20 16', 1.6)}
        <path d="M23 39c0-6 4-9 9-9s9 3 9 8c0 3-1 5-2 6l1 4-4-2c-1 1-3 1-4 1-5 0-9-3-9-8z" fill="#b5281f" ${st}/>
        <circle cx="32" cy="38.5" r="5.8" fill="#931e17"/><path d="${starPath(32, 38.5, 5, 2.3, 12)}" fill="#e8756a"/>
        <path d="M32 34.5v8" stroke="#5a1510" stroke-width="1.4" stroke-linecap="round"/>${hl('M26 35c1-2 3-3 5-3.4', 1.6)}`),
      gear: wrap(`${sh(20)}<path d="${gearPath(26, 36, 15, 20, 10)}" fill="${GOLD}" ${st}/>
        <circle cx="26" cy="36" r="11.5" fill="#d9ad4f" ${st}/>
        <circle cx="26" cy="29" r="2.6" fill="${CREAM}" stroke="${DARK}" stroke-width="1.4"/><circle cx="33" cy="36" r="2.6" fill="${CREAM}" stroke="${DARK}" stroke-width="1.4"/><circle cx="26" cy="43" r="2.6" fill="${CREAM}" stroke="${DARK}" stroke-width="1.4"/><circle cx="19" cy="36" r="2.6" fill="${CREAM}" stroke="${DARK}" stroke-width="1.4"/>
        <circle cx="26" cy="36" r="3.4" fill="${GOLD2}" ${st}/>
        <path d="${gearPath(47, 19, 7.5, 11, 8)}" fill="#e2bc62" ${st}/><circle cx="47" cy="19" r="3" fill="${DARK}"/>
        ${hl('M13 30c2-5 6-8 11-9', 2)}${sp(54, 40, 3)}`),
      dial: wrap(`${sh(20)}<path d="M9 32L17 13l16-5 12 5-3 8 9 7-6 11 7 10-21 8-7-10-10 2z" fill="${CREAM}" ${st}/>
        <path d="M9 32L17 13l16-5 12 5" fill="none" stroke="${GOLD2}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M9 32L17 13l16-5 12 5" fill="none" stroke="${DARK}" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M17 19l2 2.5M24 14.5l1 3M33 12.5v3.5M41 15.5l-1.5 3" stroke="${DARK}" stroke-width="2" stroke-linecap="round"/>
        <text x="31.5" y="23.5" font-family="Georgia,serif" font-size="6" font-weight="700" fill="${DARK}" text-anchor="middle">XII</text>
        <path d="M22 45l2.5-9 4.5 5 4-7 4 7 4.5-5 2.5 9z" fill="#f2c4bc" stroke="${RED}" stroke-width="2" stroke-linejoin="round"/><path d="M22 45h22" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
        <path d="M45 13l-3 8M51 28l-6 11" stroke="${DARK}" stroke-width="1" opacity=".4"/>`),
      keyblack: wrap(`${sh(20)}<g transform="rotate(-38 32 32)">
        <circle cx="13" cy="27" r="6" fill="${IRON}" ${st}/><circle cx="13" cy="37" r="6" fill="${IRON}" ${st}/><circle cx="8" cy="32" r="6" fill="${IRON}" ${st}/><circle cx="18" cy="32" r="6" fill="${IRON}" ${st}/>
        <circle cx="13" cy="32" r="6.5" fill="${IRON}"/><circle cx="13" cy="32" r="3.3" fill="${CREAM}" ${st}/>
        <rect x="21" y="29.5" width="34" height="5" rx="2" fill="${IRON}" ${st}/>
        <rect x="22" y="26.5" width="4" height="11" rx="1.4" fill="${IRON}" ${st}/><rect x="29" y="27.5" width="3" height="9" rx="1.2" fill="${IRON}" ${st}/>
        <path d="M45 34.5h10v11h-3v-4h-3v6h-4z" fill="${IRON}" ${st}/>
        <path d="M33 31h20" stroke="${IRON2}" stroke-width="1.4" stroke-linecap="round"/><path d="M6 29c1-3 3-5 6-5" stroke="${IRON2}" stroke-width="1.6" stroke-linecap="round" fill="none"/></g>
        ${sp(50, 14, 3.4, GOLD)}`),
      page: wrap(`${sh(18)}<path d="M18 9h24l8 8v6l-3 3 3 4-4 3 3 4-3 4 2 4-2 3v7H18z" fill="${PAPER2}" opacity=".6" transform="rotate(-6 32 32)"/>
        <path d="M14 7h26l9 9v7l-3 3 3 4-4 4 3 4-3 4 2 4-2 3v7H14z" fill="${PAPER}" ${st}/>
        <path d="M40 7v9h9" fill="#e8d3a2" ${st}/>
        <path d="M19 21h15M19 27h22M19 33h19M19 39h22M19 45h12" stroke="${WOOD}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <path d="M19 50c3-2 5 2 8 0" stroke="${WOOD}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
        <path d="M46 26l3 4-4 4 3 4-3 4" stroke="${DARK}" stroke-width="1" fill="none" opacity=".35"/>`),
      map: wrap(`${sh(24)}<path d="M11 14h42v36H11z" fill="#ecd9a8" ${st}/>
        <rect x="6" y="9" width="52" height="8" rx="4" fill="#d6b97c" ${st}/><rect x="6" y="47" width="52" height="8" rx="4" fill="#d6b97c" ${st}/>
        <circle cx="10" cy="13" r="2" fill="${WOOD}"/><circle cx="54" cy="13" r="2" fill="${WOOD}"/><circle cx="10" cy="51" r="2" fill="${WOOD}"/><circle cx="54" cy="51" r="2" fill="${WOOD}"/>
        <path d="M15 36l5-9 5 9z" fill="#c6d3e0" stroke="${DARK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M22 36l4-6 4 6z" fill="#dbe4ed" stroke="${DARK}" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M39 44l3-6 3 6zM44 44l2.5-5 2.5 5z" fill="${GREEN}" stroke="${DARK}" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M18 42c6 2 10-1 14-6s8-9 12-11" stroke="${RED}" stroke-width="1.8" stroke-dasharray="2.5 2.5" fill="none" stroke-linecap="round"/>
        <circle cx="46" cy="23" r="4.6" fill="none" stroke="${RED}" stroke-width="2"/><path d="${starPath(46, 23, 2.4, 1.1, 6)}" fill="${DARK}"/>`),
      dust: wrap(`${sh(16)}<circle cx="32" cy="40" r="20" fill="#7fb8ff" opacity=".22"/>
        <path d="M27 10h10v8c9 3 14 10 14 19 0 10-8 18-19 18S13 47 13 37c0-9 5-16 14-19z" fill="#eef6ff" fill-opacity=".85" ${st}/>
        <path d="M15.5 39c1 9 8 14 16.5 14s15.5-5 16.5-14c-6 3-11-2-16.5 0s-11-3-16.5 0z" fill="#3a7bd5"/>
        <circle cx="24" cy="45" r="1.6" fill="#cfe6ff"/><circle cx="31" cy="49" r="1.3" fill="#cfe6ff"/><circle cx="38" cy="44" r="1.8" fill="#cfe6ff"/><circle cx="43" cy="48" r="1.1" fill="#cfe6ff"/><circle cx="33" cy="42" r="1" fill="#fff"/>
        <rect x="25.5" y="5" width="13" height="7" rx="2" fill="${WOOD}" ${st}/>${hl('M20 30c2-4 5-7 9-8', 2)}
        ${sp(50, 16, 3, '#9fd0ff')}${sp(13, 22, 2.2, '#9fd0ff')}`),
      feather: wrap(`${sh(16)}<path d="M53 6C34 9 18 24 15 48l3 2c7-4 13-8 19-15 9-10 14-19 16-29z" fill="${IRON}" ${st}/>
        <path d="M53 6c-4 14-10 23-17 30" stroke="#5b5b88" stroke-width="5" stroke-linecap="round" fill="none" opacity=".6"/>
        <path d="M11 58l8-11 32-38" stroke="#c9c9e6" stroke-width="2" stroke-linecap="round" fill="none"/>
        <path d="M24 38l-7-1M29 32l-8-2M34 26l-7-3M40 20l-6-3M30 38l3 5M36 31l4 4M42 24l4 3" stroke="#8e8ebe" stroke-width="1.3" stroke-linecap="round" opacity=".8"/>
        <path d="M22 44l-4 3M27 41l-1 4" stroke="${DARK}" stroke-width="1.6" stroke-linecap="round"/>`),
      wax: wrap(`${sh(20)}<path d="M8 33c-1-11 7-19 18-20l3 7-4 5 5 4-3 6 4 6-4 7C16 49 9 43 8 33z" fill="#b5281f" ${st}/>
        <path d="M33 13c12 0 22 8 21 20-1 11-9 17-19 18l3-7-4-6 3-6-5-4 4-5z" fill="#a52219" ${st} transform="translate(3 2)"/>
        <circle cx="31" cy="32" r="12" fill="none" stroke="#7d1812" stroke-width="1.6" opacity=".7"/>
        <path d="M23 37l2-10 4 5 2-7 2 7 4-5 2 10z" fill="#d9574b" stroke="#7d1812" stroke-width="1.3" stroke-linejoin="round"/><path d="M23 37h16" stroke="#7d1812" stroke-width="2.4" stroke-linecap="round"/>
        ${hl('M13 25c2-4 6-7 10-8', 2.2)}<path d="M52 47l4 3-5 1" fill="#b5281f" ${st}/>`),
      lantern: wrap(`${sh(16)}<circle cx="32" cy="36" r="17" fill="#ffd27d" opacity=".3"/>
        <path d="M26 9a6 6 0 0 1 12 0" fill="none" ${st}/>
        <path d="M22 16h20l-3-6H25z" fill="${GOLD2}" ${st}/>
        <path d="M23 16h18l2 32H21z" fill="#fff6dc" ${st}/>
        <ellipse cx="32" cy="34" rx="7" ry="10" fill="#ffd96a" opacity=".85"/>
        <path d="M32 25c4 5 5 9 0 15-5-6-4-10 0-15z" fill="#f4a261"/><path d="M32 30c2 3 2 5 0 8-2-3-2-5 0-8z" fill="#fff3b0"/>
        <path d="M27 16l-1 32M37 16l1 32" stroke="${DARK}" stroke-width="1.6"/>
        <path d="M19 48h26l-2 6H21z" fill="${GOLD2}" ${st}/>
        <path d="M43 22l7 3v8l-7-3z" fill="${CREAM}" stroke="${DARK}" stroke-width="1.4" stroke-linejoin="round"/><text x="46.5" y="30.5" font-family="Georgia,serif" font-size="6.2" font-weight="700" fill="${RED}" text-anchor="middle">7</text>`),
      pebble: wrap(`${sh(22)}<path d="M9 38c0-13 11-23 25-23 13 0 22 9 21 20-1 12-11 18-24 18C18 53 9 48 9 38z" fill="#9aa5ad" ${st}/>
        <path d="M12 42c3 6 10 9 19 9 11 0 19-4 22-12-4 6-11 9-20 9-9 0-16-2-21-6z" fill="#7e8a93"/>
        <path d="M16 28c4-6 10-9 17-9" stroke="#e1e7eb" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="${starPath(32, 33, 7, 3, 6)}" fill="none" stroke="${DARK}" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="32" cy="33" r="10" fill="none" stroke="${DARK}" stroke-width="1.4" stroke-dasharray="2 2.4" opacity=".7"/>`),
      mirror: wrap(`${sh(12)}<rect x="28.5" y="42" width="7" height="16" rx="3" fill="${WOOD}" ${st}/><rect x="27" y="40" width="10" height="4" rx="1.5" fill="${GOLD2}" ${st}/>
        <ellipse cx="32" cy="23" rx="20" ry="21" fill="${GOLD}" ${st}/>
        <path d="M14 18c-3-2-3-6 0-7M50 18c3-2 3-6 0-7M32 2.5c-2 0-3 1-3 2.5M32 2.5c2 0 3 1 3 2.5" stroke="${DARK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <ellipse cx="32" cy="23" rx="15" ry="16" fill="#cfeaff" ${st}/>
        <path d="M22 14c3-4 7-6 11-6" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".85"/>
        <path d="M30 7.5l4 10-7 6 8 10 2 5M34 17.5l12 4M27 23.5l-9 3" stroke="${DARK}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M40 30l4 4" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`),
      watch: wrap(`${sh(18)}<path d="M54 30c6 6 6 16-2 22" stroke="${GOLD2}" stroke-width="2.6" fill="none" stroke-dasharray="3.5 2.2" stroke-linecap="round"/>
        <circle cx="30" cy="8" r="3.6" fill="none" ${st}/><rect x="27" y="10.5" width="6" height="5" rx="1.4" fill="${GOLD2}" ${st}/>
        <circle cx="30" cy="36" r="21" fill="${GOLD}" ${st}/><circle cx="30" cy="36" r="17" fill="#d9ad4f"/>
        <circle cx="30" cy="36" r="15.5" fill="${CREAM}" ${st}/>
        <path d="M30 22.5v3.5M30 46v3.5M16.5 36h3.5M40 36h3.5M20.5 26.5l2 2M39.5 26.5l-2 2M20.5 45.5l2-2M39.5 45.5l-2-2" stroke="${DARK}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M30 36l-4-9M30 36l8 4" stroke="${DARK}" stroke-width="2.4" stroke-linecap="round"/><circle cx="30" cy="36" r="2" fill="${RED}"/>
        <path d="M19 28c2-4 6-6 10-7" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/>`),
      bellmute: wrap(`${sh(20)}<path d="M28 5a4 4 0 0 1 8 0v4h-8z" fill="none" ${st}/>
        <path d="M32 9c-10 0-15 8-15 18 0 9-3 14-7 17h44c-4-3-7-8-7-17 0-10-5-18-15-18z" fill="${ICE}" ${st}/>
        <path d="M24 30c0-8 3-14 8-16" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".85"/>
        <path d="M40 18c2 3 3 7 3 11" stroke="${ICE2}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
        <ellipse cx="32" cy="44" rx="22" ry="5" fill="${ICE2}" ${st}/><ellipse cx="32" cy="44" rx="17" ry="3" fill="#3f6f8f" opacity=".7"/>
        <path d="M24 36l3-3 3 3 3-3 3 3 3-3 3 3" stroke="#fff" stroke-width="1.4" fill="none" opacity=".7"/>
        ${sp(51, 14, 3, '#dff3ff')}${sp(12, 22, 2.2, '#dff3ff')}`),
      crystal: wrap(`${sh(22)}<path d="M33 4l11 13-3 38H25l-3-38z" fill="#b8e6f7" ${st}/>
        <path d="M33 4l-2 51M33 4l11 13M33 4L22 17" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8"/>
        <path d="M22 17h22l-1 12-21 6z" fill="#c9b6f2" opacity=".55"/><path d="M22.5 35l20.5-6-.6 9-20 6z" fill="#a7f0c4" opacity=".55"/><path d="M23 44l19-6-1 9-17 6z" fill="#ffc4dc" opacity=".5"/>
        <path d="M11 30l9-6 4 31H13z" fill="#d6f1fb" ${st}/><path d="M54 33l-9-6-3 28h9z" fill="#cfeaf8" ${st}/>
        <path d="M14 33l3-3M48 32l2 2" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
        ${sp(51, 12, 3.2, '#fff')}${sp(13, 15, 2.4, '#ffe0f0')}`),
      lightvial: wrap(`${sh(14)}<circle cx="32" cy="40" r="21" fill="#ffe08a" opacity=".3"/><circle cx="32" cy="41" r="12" fill="#ffe08a" opacity=".35"/>
        <path d="M32 13v-2M18 22l-3-2M46 22l3-2M11 40H8M53 40h3" stroke="${GOLD}" stroke-width="2" stroke-linecap="round"/>
        <path d="M27 9h10v10c8 3 13 10 13 19 0 10-8 17-18 17s-18-7-18-17c0-9 5-16 13-19z" fill="#fffaf0" fill-opacity=".8" ${st}/>
        <path d="M32 31c5 7 7 10 0 17-7-7-5-10 0-17z" fill="#ffd96a" stroke="${GOLD2}" stroke-width="1.6"/><circle cx="32" cy="42" r="3.2" fill="#fff"/>
        <rect x="25.5" y="4" width="13" height="7" rx="2" fill="${WOOD}" ${st}/><path d="M25.5 7.5h13" stroke="${DARK}" stroke-width="1" opacity=".5"/>
        ${hl('M19 34c1-4 4-8 8-10', 2.2)}`),
      shell: wrap(`${sh(20)}<path d="M8 46C6 30 16 14 32 12c14-1 22 9 21 20-1 12-11 21-25 21-8 0-18-2-20-7z" fill="#f6d9c4" ${st}/>
        <path d="M33 13c-5 11-10 23-24 33M33 13c1 11-2 25-13 37M33 13c6 8 9 20 5 36M33 13c9 4 15 12 15 26" stroke="#c98f6a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M8 46c3 4 11 7 20 7" stroke="#b07a58" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        ${hl('M18 24c3-5 8-8 12-9', 2.2)}
        <path d="M50 10c3 2 4 5 4 8M55 5c4 3 6 8 6 13" stroke="${ICE2}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`),
      seal: wrap(`${sh(18)}<path d="M23 44l-7 15 9-3 4 6 4-17M41 44l7 15-9-3-4 6-4-17" fill="${RED}" ${st}/>
        <path d="M32 6c3 0 4 2 6 2s4-1 6 1 1 4 2 6 3 3 3 6-2 4-2 6 1 4-1 6-4 1-6 2-3 3-6 3-4-2-6-2-4 1-6-1-1-4-2-6-3-3-3-6 2-4 2-6-1-4 1-6 4-1 6-2 3-3 6-3z" fill="#8f2a22" ${st} transform="translate(0 2)"/>
        <circle cx="32" cy="29" r="14" fill="#a8342a" stroke="#5a1510" stroke-width="1.4"/>
        <path d="${starPath(32, 29, 11.5, 5.5, 12)}" fill="#e0867a" stroke="#5a1510" stroke-width="1.1"/>
        <path d="M32 23v12" stroke="#5a1510" stroke-width="1.8" stroke-linecap="round"/>${hl('M20 21c2-3 5-5 8-6', 1.8)}`),
      ring: wrap(`${sh(18)}<ellipse cx="32" cy="42" rx="18" ry="13" fill="none" stroke="${DARK}" stroke-width="9.5"/>
        <ellipse cx="32" cy="42" rx="18" ry="13" fill="none" stroke="${SILVER}" stroke-width="6"/>
        <path d="M15 44c2 6 9 10 17 10s15-4 17-10" stroke="${SILVER2}" stroke-width="2.4" fill="none"/>
        <path d="M18 38c2-4 7-7 12-8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <path d="M24 27l3-4h10l3 4-3 4H27z" fill="${SILVER2}" ${st}/>
        <path d="M24 20l4-8h8l4 8-8 10z" fill="#4f8fd6" ${st}/><path d="M24 20h16M28 12l4 8 4-8M32 20v10" stroke="#9fd0ff" stroke-width="1.2" fill="none"/>
        ${hl('M27 15l2-2', 1.8)}${sp(46, 10, 3, '#cfe6ff')}`),
      compass: wrap(`${sh(20)}<circle cx="32" cy="7" r="3.4" fill="none" ${st}/>
        <circle cx="32" cy="34" r="24" fill="${GOLD}" ${st}/><circle cx="32" cy="34" r="20" fill="#d9ad4f"/><circle cx="32" cy="34" r="18.5" fill="${CREAM}" ${st}/>
        <path d="${starPath(32, 34, 16, 4, 8)}" fill="#efe0b8" stroke="${GOLD2}" stroke-width="1"/>
        <path d="M32 18l5 16-5 16-5-16z" fill="${WHITE}" ${st}/><path d="M32 18l5 16H27z" fill="${RED}" ${st}/>
        <circle cx="32" cy="34" r="2.6" fill="${GOLD2}" ${st}/>
        <path d="M21 25c2-3 6-5 10-6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".8"/>`),
      book: wrap(`${sh(24)}<path d="M8 13c9-3 17-2 24 3 7-5 15-6 24-3v38c-9-3-17-2-24 3-7-5-15-6-24-3z" fill="#2f4a8a" ${st}/>
        <path d="M11 16c7-2 14-1 20 2.5v33c-6-3.5-13-4-20-2.5z" fill="#fffaf0"/><path d="M53 16c-7-2-14-1-20 2.5v33c6-3.5 13-4 20-2.5z" fill="#fff6e4"/>
        <path d="M32 16.5v37" stroke="${GOLD}" stroke-width="2.2"/>
        <path d="M15 24c5-1 9 0 13 1.5M15 30c5-1 9 0 13 1.5M15 36c5-1 9 0 13 1.5" stroke="#e8dcc2" stroke-width="1.4" stroke-linecap="round" fill="none"/>
        <path d="${starPath(43, 32, 7, 3, 6)}" fill="${GOLD}" opacity=".35"/>
        ${sp(43, 32, 4.5, '#ffe08a')}${sp(51, 10, 2.6, '#ffe08a')}`),
      telescope: wrap(`${sh(20)}<path d="M28 40l-9 18M32 41v17M36 40l9 18" stroke="${WOOD}" stroke-width="3" stroke-linecap="round"/><path d="M28 40l-9 18M32 41v17M36 40l9 18" stroke="${DARK}" stroke-width="1" stroke-linecap="round" opacity=".5"/>
        <circle cx="32" cy="39" r="3" fill="${GOLD2}" ${st}/>
        <g transform="rotate(-30 32 32)"><rect x="6" y="28" width="16" height="9" rx="2.5" fill="${WOOD}" ${st}/><rect x="20" y="26" width="18" height="13" rx="2.5" fill="${GOLD}" ${st}/><rect x="36" y="23.5" width="17" height="18" rx="3" fill="${GOLD2}" ${st}/>
        <rect x="28" y="25.5" width="3" height="14" fill="#d9ad4f" stroke="${DARK}" stroke-width="1.2"/><ellipse cx="53" cy="32.5" rx="2.8" ry="9" fill="${ICE}" ${st}/>
        <path d="M23 28.5h12M39 26h11" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".75"/></g>
        ${sp(54, 6, 3)}${sp(60, 16, 2)}`),
      heart: wrap(`<circle cx="32" cy="32" r="28" fill="#ffd27d" opacity=".25"/><circle cx="32" cy="33" r="20" fill="#ffb27d" opacity=".25"/>
        <path d="M32 55C10 40 7 23 16 15c7-5 13-2 16 5 3-7 9-10 16-5 9 8 6 25-16 40z" fill="#ff7a5c" ${st}/>
        <path d="M32 55C17 44 12 33 14 25c4 10 10 18 18 22 8-4 14-12 18-22 2 8-3 19-18 30z" fill="#e65a43" opacity=".7"/>
        <path d="M32 24c5 6 7 10 1 17-1-3-3-4-4-4 1 3 0 5-2 6-3-6 0-12 5-19z" fill="#ffd96a" stroke="${GOLD2}" stroke-width="1.2" stroke-linejoin="round"/>
        <path d="M33 33c2 3 2 5 0 7-2-2-2-4 0-7z" fill="#fff6c8"/>
        ${hl('M19 20c2-3 5-4 8-3', 2.4)}${sp(51, 10, 3)}${sp(12, 46, 2.2)}`),
      star: wrap(`<circle cx="32" cy="32" r="29" fill="#ffd27d" opacity=".2"/><circle cx="32" cy="32" r="20" fill="#ffe08a" opacity=".3"/>
        <path d="M32 2v8M32 54v8M2 32h8M54 32h8M11 11l5 5M48 48l5 5M53 11l-5 5M16 48l-5 5" stroke="${GOLD}" stroke-width="2" stroke-linecap="round" opacity=".7"/>
        <path d="${starPath(32, 32, 24, 9, 8)}" fill="${GOLD}" ${st}/>
        <path d="${starPath(32, 32, 14, 6, 8)}" fill="#ffe9a8"/>
        <circle cx="32" cy="32" r="5.5" fill="#fff"/><path d="M24 22l3 4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`)
    });
  })();

  G.icons = icons;
  /** HTML de l'illustration d'un objet : image personnalisée si fournie, sinon icône intégrée. */
  G.itemArt = function (id) {
    const it = G.data.items[id];
    if (!it) return icons.gift;
    if (it.image) return `<img src="${G.escapeHtml(it.image)}" alt="" class="ico-img">`;
    return icons[it.icon] || icons.gift;
  };
})();
