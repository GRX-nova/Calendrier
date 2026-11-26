/* ==========================================================================
   CARTES — les dessins (SVG) utilisés par certaines énigmes :
     aurore()   la carte du Veilleur, chez l'Ancienne Aurore (jour 6)
     royaume()  la grande carte du royaume, dans le miroir fêlé (jour 12, à reconstituer)
     compare()  les deux cartes à comparer au Bureau du Cartographe (jour 20)
   Moteur du dessin seulement : pas besoin d'y toucher pour écrire l'histoire.
   ========================================================================== */
Game.data.maps = (function () {
  const PAPER = '#ecd9a8', INK = '#5b3a1e';

  /* ---------- petits symboles de carte (dessinés autour de 0,0) ---------- */
  const SYM = {
    fir: `<path d="M0 -20L11 -2H-11ZM0 -12L14 8H-14Z" fill="#3f7d58" stroke="#2b3d2e" stroke-width="2" stroke-linejoin="round"/><rect x="-2.5" y="8" width="5" height="8" fill="#6b4527"/>`,
    bare: `<path d="M0 16V-2M0 8L-9 -2M0 3L10 -8M0 -2L-6 -14M0 -3L5 -16" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    inverted: `<g transform="scale(1 -1)"><path d="M0 16V-2M0 8L-9 -2M0 3L10 -8M0 -2L-6 -14M0 -3L5 -16" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/></g>`,
    lights: `<rect x="-3" y="3" width="6" height="14" fill="#6b4527"/><circle cx="0" cy="-8" r="16" fill="#3f7d58" stroke="#2b3d2e" stroke-width="2"/>` +
      [[-8, -14], [7, -16], [-12, -4], [11, -6], [0, -3], [-2, -22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#ffd96a" stroke="#c9983a" stroke-width="1.2"/>`).join(''),
    house: `<rect x="-11" y="-4" width="22" height="16" fill="#f3e3bd" stroke="${INK}" stroke-width="2"/><path d="M-14 -4L0 -16L14 -4Z" fill="#a63a2e" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><rect x="-3" y="3" width="6" height="9" fill="${INK}"/>`,
    tower: `<rect x="-8" y="-12" width="16" height="30" fill="#cfc7b2" stroke="${INK}" stroke-width="2"/><path d="M-10 -12h4v-6h4v6h4v-6h4v6h4v-6h-0" fill="#cfc7b2" stroke="${INK}" stroke-width="2"/><rect x="-2" y="-2" width="4" height="8" fill="${INK}"/>`,
    lake: `<ellipse rx="27" ry="14" fill="#a9dcf5" stroke="#6fb7e0" stroke-width="2.5"/><path d="M-12 -2q4-3 8 0M2 3q4-3 8 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    round: `<rect x="-3" y="3" width="6" height="14" fill="#6b4527"/><circle cx="0" cy="-8" r="16" fill="#3f7d58" stroke="#2b3d2e" stroke-width="2"/>`,
    mount: `<path d="M-22 14L-6 -14 2 -2 8 -10 22 14Z" fill="#cfc7b2" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M-10 -7L-6 -14-2 -7-6 -5ZM5 -6L8 -10 11 -5Z" fill="#fff" stroke="${INK}" stroke-width="1"/>`,
    star: `<path d="M0 -9L2.6 -2.6 9 0 2.6 2.6 0 9-2.6 2.6-9 0-2.6-2.6Z" fill="#e0a62a" stroke="#8a5a14" stroke-width="1.2"/>`
  };
  const sym = (name, x, y, o) => {
    o = o || {};
    const body = `<g transform="translate(${x} ${y})${o.s ? ' scale(' + o.s + ')' : ''}">${o.k ? '<circle r="22" fill="transparent"/>' : ''}${SYM[name]}</g>`;
    return o.k ? body.replace('<g ', `<g data-k="${o.k}" `) : body;
  };

  /* ---------- jour 6 : la carte d'Aurore (un seul signe n'apparaît qu'une fois) ---------- */
  function aurore() {
    const items = [];
    const put = (name, pts) => pts.forEach(([x, y]) => items.push(sym(name, x, y, { k: name })));
    // (beaucoup de signes répétés ; l'arbre aux lumières n'est dessiné qu'une fois, loin du centre,
    //  au milieu d'arbres ronds qui lui ressemblent)
    put('fir', [[450, 70], [291, 236], [269, 192], [187, 348], [500, 116], [340, 133], [336, 297], [366, 364], [230, 166], [233, 86], [112, 115], [595, 270]]);
    put('round', [[579, 211], [385, 167], [290, 78], [589, 107], [164, 270], [532, 177], [350, 249], [488, 162]]);
    put('bare', [[469, 231], [56, 71], [144, 313], [448, 111], [388, 88], [534, 312]]);
    put('inverted', [[238, 253], [149, 171], [51, 244], [545, 111]]);
    put('house', [[298, 148], [54, 304], [402, 217], [43, 168], [453, 360], [211, 298]]);
    put('tower', [[573, 166], [515, 73], [341, 186]]);
    put('lake', [[446, 285], [93, 202], [540, 253], [275, 328]]);
    put('mount', [[184, 220], [185, 124], [380, 317], [105, 356], [56, 123]]);
    put('lights', [[118, 262]]);
    return `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Carte ancienne">
      <rect width="640" height="400" fill="${PAPER}"/>
      <rect x="9" y="9" width="622" height="382" fill="none" stroke="#8a5a2b" stroke-width="3"/>
      <rect x="15" y="15" width="610" height="370" fill="none" stroke="#8a5a2b" stroke-width="1" opacity=".6"/>
      <path d="M0 130C110 175 210 95 310 150S520 260 640 225" fill="none" stroke="#7fb8d8" stroke-width="11" opacity=".55"/>
      <path d="M40 360C140 310 200 330 300 300S470 230 600 250" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="6 6" opacity=".6"/>
      <path d="M90 40C150 120 130 200 190 250" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="6 6" opacity=".6"/>
      <text x="320" y="44" text-anchor="middle" font-family="Georgia, serif" font-size="17" font-style="italic" fill="${INK}" opacity=".75">Carte du Veilleur</text>
      <g opacity=".5"><circle cx="585" cy="355" r="22" fill="none" stroke="${INK}" stroke-width="1.5"/><path d="M585 328V382M558 355H612" stroke="${INK}" stroke-width="1.5"/></g>
      ${items.join('')}
    </svg>`;
  }

  /* ---------- jour 12 : la grande carte du royaume (600 × 360, 4 × 3 morceaux) ---------- */
  function royaume() {
    const cracks = `<g stroke="#2b3d52" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round" stroke-linejoin="round">
      <path d="M300 0l14 40-22 30 20 40-12 50"/><path d="M0 180l60-10 50 24 90-14 100 16"/><path d="M150 360l-8-60 30-30-6-70"/><path d="M600 130l-70 20-30-24-80 16"/></g>`;
    const stars = [[70, 250], [180, 290], [255, 150], [420, 110], [350, 230], [455, 275], [535, 95], [95, 90]]
      .map(([x, y]) => sym('star', x, y, { s: 1.1 })).join('');
    const forest = [[225, 130], [245, 112], [268, 128], [288, 110], [255, 150], [232, 156], [280, 150], [302, 132]]
      .map(([x, y], i) => sym(i % 3 === 0 ? 'lights' : 'fir', x, y, { s: .85 })).join('');
    const village = [[48, 262], [74, 276], [98, 258], [66, 235], [118, 280]].map(([x, y]) => sym('house', x, y, { s: .9 })).join('');
    const ridge = [[330, 44], [362, 36], [394, 48], [346, 62]].map(([x, y]) => `<path d="M${x - 20} ${y + 14}L${x} ${y - 14}L${x + 20} ${y + 14}Z" fill="#b9b2a2" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M${x - 7} ${y - 3}L${x} ${y - 14}L${x + 7} ${y - 3}Z" fill="#fff" stroke="none"/>`).join('');
    const castle = `<g transform="translate(520 76)"><rect x="-34" y="-8" width="68" height="40" fill="#d8d1be" stroke="${INK}" stroke-width="2.4"/><rect x="-42" y="-30" width="20" height="62" fill="#cfc7b2" stroke="${INK}" stroke-width="2.4"/><rect x="22" y="-30" width="20" height="62" fill="#cfc7b2" stroke="${INK}" stroke-width="2.4"/><path d="M-44 -30h6v-8h8v8h6v-0M20 -30h6v-8h8v8h6" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M-10 32v-18a10 10 0 0 1 20 0v18z" fill="${INK}"/><path d="M0 -8l0-26" stroke="${INK}" stroke-width="2"/><path d="M0 -34l16 5-16 5z" fill="#a63a2e" stroke="${INK}" stroke-width="1.5"/></g>`;
    return `<svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="rk-bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#efdcae"/><stop offset=".55" stop-color="#e6cf9c"/><stop offset="1" stop-color="#d9bf86"/></linearGradient></defs>
      <rect width="600" height="360" fill="url(#rk-bg)"/>
      <path d="M-10 70C80 120 140 40 240 90S380 200 470 190 580 280 620 330" fill="none" stroke="#7fb8d8" stroke-width="16" opacity=".75" stroke-linecap="round"/>
      <path d="M-10 70C80 120 140 40 240 90S380 200 470 190 580 280 620 330" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-dasharray="2 12" stroke-linecap="round"/>
      <path d="M60 255C130 215 190 235 260 205S410 170 520 108" fill="none" stroke="${INK}" stroke-width="3.2" stroke-dasharray="9 7" opacity=".8" stroke-linecap="round"/>
      <path d="M255 205C300 250 330 270 380 280" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="9 7" opacity=".7" stroke-linecap="round"/>
      <ellipse cx="410" cy="285" rx="52" ry="26" fill="#bfe3f5" stroke="#6fb7e0" stroke-width="3"/><path d="M386 282q8-6 16 0M418 290q8-6 16 0" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${ridge}${forest}${village}${castle}${stars}
      <g font-family="Georgia, serif" font-style="italic" fill="${INK}">
        <text x="40" y="308" font-size="19">Le village</text>
        <text x="200" y="198" font-size="17">Forêt des Lumières</text>
        <text x="375" y="326" font-size="17">Lac Gelé</text>
        <text x="470" y="150" font-size="18">Château</text>
        <text x="302" y="102" font-size="15" opacity=".8">Monts blancs</text>
        <text x="140" y="60" font-size="15" opacity=".8">Rivière Argentée</text>
      </g>
      <g transform="translate(548 316)" opacity=".8"><circle r="24" fill="none" stroke="${INK}" stroke-width="2"/><path d="M0 -30L5 0 0 30-5 0Z M-30 0L0 -5 30 0 0 5Z" fill="${INK}" opacity=".6"/><text y="-34" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="${INK}">N</text></g>
      ${cracks}
    </svg>`;
  }

  /* ---------- jour 20 : deux cartes à comparer (A : officielle, B : celle du Veilleur) ---------- */
  function compareMap(v) {
    const B = v === 'B';
    const shift = B ? 24 : 0;
    const parts = [];
    parts.push(`<rect width="400" height="260" fill="${PAPER}"/><rect x="5" y="5" width="390" height="250" fill="none" stroke="#8a5a2b" stroke-width="2.4"/>`);
    parts.push(`<path d="M0 100C80 130 140 70 210 100S330 160 400 140" fill="none" stroke="#7fb8d8" stroke-width="9" opacity=".6"/>`);
    parts.push(`<path d="M30 210C100 190 160 200 220 170S320 120 380 60" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="5 5" opacity=".6"/>`);
    // décors identiques sur les deux cartes
    [[40, 50], [70, 38], [100, 54], [330, 220], [356, 200], [300, 238]].forEach(([x, y]) => parts.push(sym('fir', x, y, { s: .8 })));
    [[150, 40], [220, 230]].forEach(([x, y]) => parts.push(sym('house', x, y, { s: .8 })));
    parts.push(sym('tower', 360, 40, { s: .8 }));
    // (beaucoup d'autres signes, identiques sur les deux cartes : les différences se cachent dans la foule)
    [[211, 178], [332, 27], [262, 90], [99, 83], [347, 62], [29, 195], [37, 234], [159, 145], [240, 125], [133, 90], [194, 198], [36, 95]].forEach(([x, y]) => parts.push(sym('fir', x, y, { s: .7 })));
    [[378, 65], [99, 29], [234, 54], [296, 32], [123, 128], [206, 59], [183, 29]].forEach(([x, y]) => parts.push(sym('round', x, y, { s: .7 })));
    [[323, 185], [192, 143], [174, 175], [356, 229], [159, 85]].forEach(([x, y]) => parts.push(sym('bare', x, y, { s: .7 })));
    [[183, 230], [164, 111], [124, 25], [266, 237]].forEach(([x, y]) => parts.push(sym('house', x, y, { s: .7 })));
    [[83, 231], [377, 155], [28, 147], [298, 146]].forEach(([x, y]) => parts.push(sym('mount', x, y, { s: .7 })));
    [[343, 170], [257, 28], [80, 196]].forEach(([x, y]) => parts.push(sym('inverted', x, y, { s: .7 })));
    // 1 · arbre aux lumières : seulement sur la carte du Veilleur
    if (B) parts.push(sym('lights', 70, 150, { s: .85 }));
    // 2 · pont : seulement sur la carte officielle
    if (!B) parts.push(`<g transform="translate(205 96)"><path d="M-16 6Q0 -12 16 6" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M-16 6v8M16 6v8M-8 0v10M8 0v10" stroke="${INK}" stroke-width="2"/></g>`);
    // 3 · tour de guet : seulement sur la carte officielle
    if (!B) parts.push(sym('tower', 300, 70, { s: .8 }));
    // 4 · le lac, légèrement déplacé
    parts.push(sym('lake', 120 + shift, 205 + (B ? 6 : 0), { s: .85 }));
    // 5 · le toit de la maison près du gué
    parts.push(`<g transform="translate(262 175) scale(.85)"><rect x="-11" y="-4" width="22" height="16" fill="#f3e3bd" stroke="${INK}" stroke-width="2"/><path d="M-14 -4L0 -16L14 -4Z" fill="${B ? '#3a6aa8' : '#a63a2e'}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><rect x="-3" y="3" width="6" height="9" fill="${INK}"/></g>`);
    // 6 · une inscription
    parts.push(`<text x="285" y="128" font-family="Georgia, serif" font-style="italic" font-size="12" fill="${INK}">${B ? 'Pierre des Voyageurs' : 'Pierre aux Voyageurs'}</text>`);
    return `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
  }
  // centres des différences (coordonnées du viewBox 400 × 260)
  const compareTargets = [
    { x: 70, y: 150, r: 26 },   // l'arbre aux lumières
    { x: 205, y: 100, r: 24 },  // le pont
    { x: 300, y: 70, r: 22 },   // la tour de guet
    { x: 132, y: 207, r: 34 },  // le lac déplacé
    { x: 262, y: 176, r: 22 },  // le toit de la maison
    { x: 340, y: 124, r: 28 }   // l'inscription
  ];
  const compare = () => ({ a: compareMap('A'), b: compareMap('B'), targets: compareTargets });

  return { aurore, royaume, compare, SYM };
})();
