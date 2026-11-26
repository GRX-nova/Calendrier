/* ==========================================================================
   GLYPHES — l'écriture des Veilleurs (alphabet en « grille », comme un cryptogramme de
   l'ancien temps) et les emblèmes (Veilleur, Anciens, corbeau…), dessinés en SVG.

   Dans n'importe quel texte du jeu (dialogue, document, énigme) :
       [[pig:LA BOULANGERIE]]   → le texte écrit avec l'alphabet des Veilleurs
       [[emb:couronne]]          → un emblème (veilleur, corbeau, couronne, croissant, sablier, rose, flamme)
       [[chart]]                 → la grille complète de l'alphabet (clé de lecture)
   Moteur seulement : rien à modifier ici pour écrire l'histoire.
   ========================================================================== */
(function () {
  const G = window.Game;
  const LINE = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"';

  /* ---------- l'alphabet en grille ---------- */
  // côtés tracés pour la case d'une grille « # » : t = haut, r = droite, b = bas, l = gauche
  const GRID = ['br', 'lrb', 'lb', 'trb', 'tlrb', 'tlb', 'tr', 'tlr', 'tl'];
  const A = 4, B = 20;   // cadre de la case dans le viewBox 24 × 24
  function gridPath(sides) {
    let d = '';
    if (sides.includes('t')) d += `M${A} ${A}H${B}`;
    if (sides.includes('b')) d += `M${A} ${B}H${B}`;
    if (sides.includes('l')) d += `M${A} ${A}V${B}`;
    if (sides.includes('r')) d += `M${B} ${A}V${B}`;
    return d;
  }
  // 4 chevrons de la grille « X » : S (haut) T (gauche) U (droite) V (bas)
  const X_PATH = ['M4 4L12 16L20 4', 'M4 4L17 12L4 20', 'M20 4L7 12L20 20', 'M4 20L12 8L20 20'];
  const X_DOT = [[12, 7.5], [8.5, 12], [15.5, 12], [12, 16.5]];

  function glyph(ch) {
    const c = String(ch).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
    const i = c.charCodeAt(0) - 65;
    if (c.length < 1 || i < 0 || i > 25) return '';
    let body = '', dot = null;
    if (i < 18) {                       // A–R : grille « # » (J–R avec un point)
      body = `<path d="${gridPath(GRID[i % 9])}" ${LINE}/>`;
      if (i >= 9) dot = [12, 12];
    } else {                            // S–Z : grille « X » (W–Z avec un point)
      const k = (i - 18) % 4;
      body = `<path d="${X_PATH[k]}" ${LINE}/>`;
      if (i >= 22) dot = X_DOT[k];
    }
    if (dot) body += `<circle cx="${dot[0]}" cy="${dot[1]}" r="1.7" fill="currentColor"/>`;
    return `<svg viewBox="0 0 24 24" class="pig-svg" aria-hidden="true">${body}</svg>`;
  }

  /** Un texte entier en écriture des Veilleurs. */
  function pigText(text) {
    const words = String(text).split(/\s+/).filter(Boolean).map((w) =>
      '<span class="pig-word">' + Array.from(w).map((ch) => { const g = glyph(ch); return g ? `<span class="pig">${g}</span>` : ''; }).join('') + '</span>');
    return `<span class="pig-text" role="img" aria-label="Texte écrit en signes mystérieux">${words.join(' ')}</span>`;
  }
  /** La grille de lecture : chaque signe avec sa lettre. */
  function pigChart() {
    const cells = Array.from({ length: 26 }, (_, i) => {
      const L = String.fromCharCode(65 + i);
      return `<span class="pig-cell"><span class="pig">${glyph(L)}</span><b>${L}</b></span>`;
    });
    return `<span class="pig-chart">${cells.join('')}</span>`;
  }

  /* ---------- emblèmes ---------- */
  function star(cx, cy, ro, ri, n) {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? ri : ro;
      d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    }
    return d + 'Z';
  }
  const EMB = {
    // le sceau du Veilleur : une étoile à douze branches entourée d'un cercle, un trait vertical au centre (« l'œil qui veille »)
    veilleur: `<circle cx="32" cy="32" r="27" ${LINE}/><path d="${star(32, 32, 22, 11, 12)}" ${LINE}/><path d="M32 22V42" ${LINE}/>`,
    // le corbeau
    corbeau: `<path d="M10 40c6-2 8-8 12-12 5-6 13-7 17-2l10 0-6 5c-1 9-9 17-20 17H14z" fill="currentColor" stroke="none"/><path d="M39 26l12 3-10 4z" fill="currentColor" stroke="none"/><circle cx="37" cy="27" r="1.6" fill="#fff"/><path d="M26 48l-2 8M33 48l1 8" ${LINE}/>`,
    // les cinq Anciens
    couronne: `<path d="M10 44L8 22l12 10 12-16 12 16 12-10-2 22z" ${LINE}/><path d="M10 50h44" ${LINE}/><circle cx="8" cy="20" r="2" fill="currentColor"/><circle cx="32" cy="14" r="2" fill="currentColor"/><circle cx="56" cy="20" r="2" fill="currentColor"/>`,
    croissant: `<path d="M44 10a22 22 0 1 0 6 36A18 18 0 0 1 44 10z" ${LINE}/>`,
    sablier: `<path d="M16 8h32M16 56h32M18 8c0 14 14 18 14 24S18 42 18 56M46 8c0 14-14 18-14 24s14 10 14 24" ${LINE}/><path d="M25 50c3-5 11-5 14 0z" fill="currentColor" stroke="none"/>`,
    rose: `<path d="${star(32, 32, 24, 6, 8)}" ${LINE}/><circle cx="32" cy="32" r="4" ${LINE}/>`,
    flamme: `<path d="M32 8c10 12 16 20 16 30a16 16 0 0 1-32 0c0-8 5-12 8-18 3 4 4 6 8 6-2-6-2-12 0-18z" ${LINE}/><path d="M32 40c4 4 5 8 0 12-5-4-4-8 0-12z" fill="currentColor" stroke="none"/>`,
    // le cadran de l'horloge de la mairie
    cadran: `<circle cx="32" cy="32" r="26" ${LINE}/><path d="M32 12v6M32 46v6M12 32h6M46 32h6M32 32l-8 8M32 32l12-14" ${LINE}/>`
  };
  const emblem = (name) => {
    const body = EMB[name];
    return body ? `<svg viewBox="0 0 64 64" class="emb-svg" aria-hidden="true">${body}</svg>` : '';
  };

  /* ---------- balisage dans les textes (en plus de **gras** et *italique*) ---------- */
  const baseRich = G.rich;
  G.rich = function (str) {
    let s = baseRich(str);
    if (s.indexOf('[[') < 0) return s;
    s = s.replace(/\[\[pig:([^\]]+)\]\]/g, (_, t) => pigText(t.replace(/&#39;/g, "'")));
    s = s.replace(/\[\[emb:([a-z]+)\]\]/g, (_, n) => `<span class="emb">${emblem(n)}</span>`);
    s = s.replace(/\[\[chart\]\]/g, () => pigChart());
    return s;
  };

  G.glyphs = { glyph, pigText, pigChart, emblem, EMB };
})();
