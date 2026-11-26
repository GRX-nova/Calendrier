/* ==========================================================================
   ÉNIGMES — interfaces des différents types (voir data/puzzles.js).
   Principe : jamais de pénalité. Un mauvais essai = message doux, on peut réessayer à l'infini.
   Pas d'indices ni de choix multiples : tout se résout à partir de l'énoncé, du matériel affiché
   (tableaux, textes…) et des documents du carnet d'indices.

   Types : text, multi, combo, order, match, find, pick, svgpick, diff, jigsaw, mirrors
   et « steps » (une énigme en plusieurs étapes enchaînées).
   ========================================================================== */
(function () {
  const G = window.Game;
  const { $, h, shuffle, normAnswer } = G;
  const [IW, IH] = G.config.stageSize;
  const NS = 'http://www.w3.org/2000/svg';
  const pct = (v, t) => (v / t * 100).toFixed(3) + '%';
  const GENTLE = [
    "Hmm, pas tout à fait… réfléchis encore un peu !",
    "Presque ! Essaie une autre idée.",
    "Ce n'est pas ça, mais tu es sur la bonne piste.",
    "Pas encore ! Flocon croit en toi."
  ];
  let current = null;                                   // l'énigme à l'écran : { id, ui }
  let gentleIdx = 0;
  const gentle = () => GENTLE[gentleIdx++ % GENTLE.length];
  const rich = (s) => G.rich(s).replace(/\n/g, '<br>');

  /* ---------- le matériel d'une énigme : tableaux, textes, listes, colonnes à comparer ---------- */
  function materialNode(m) {
    const card = h('div', { class: 'pz-card' + (m.class ? ' ' + m.class : '') });
    if (m.title) card.append(h('h4', null, m.title));
    if (m.text) card.append(h('p', { html: rich(m.text) }));
    if (m.img) card.append(h('img', { class: 'pz-img', src: m.img, alt: m.alt || '', draggable: 'false' }));
    if (m.table) {
      const t = h('table', { class: 'pz-table' });
      if (m.table.head) t.append(h('thead', null, h('tr', null, m.table.head.map((c) => h('th', { html: rich(c) })))));
      t.append(h('tbody', null, m.table.rows.map((r) => h('tr', null, r.map((c) => h('td', { html: rich(String(c)) }))))));
      card.append(h('div', { class: 'pz-table-wrap' }, t));
    }
    if (m.list) card.append(h(m.ordered ? 'ol' : 'ul', { class: 'pz-list' }, m.list.map((x) => h('li', { html: rich(x) }))));
    if (m.cols) card.append(h('div', { class: 'pz-cols' }, m.cols.map((c) => materialNode(Object.assign({ class: 'col' }, c)))));
    if (m.note) card.append(h('p', { class: 'pz-note', html: rich(m.note) }));
    return card;
  }


  /* ---------- les fiches d'indices épinglés : flottantes, déplaçables au doigt ou à la souris ---------- */
  const PinBoard = (function () {
    const cards = new Map();          // id → { el, inner, folded, x, y, placed }
    const pos = {};                   // positions retenues pendant toute l'énigme (même d'une étape à l'autre)
    let layer = null, panelRef = null, zTop = 1, resizeBound = false;
    const M = 8;                      // marge avec les bords de l'écran
    const compact = () => window.innerWidth < 700 || window.innerHeight < 500;   // petit écran : fiches repliées, une seule ouverte à la fois
    const topLimit = () => { const hud = document.getElementById('hud'); return (hud ? hud.getBoundingClientRect().bottom : 64) + 4; };

    function ensureLayer() {
      if (layer && layer.isConnected) return layer;
      layer = h('div', { id: 'pin-layer' });
      $('#puzzle-root').append(layer);
      if (!resizeBound) { resizeBound = true; window.addEventListener('resize', () => { cards.forEach((c) => fit(c)); clampAll(); }); }
      return layer;
    }
    /** Réduit la fiche si elle est plus haute (ou plus large) que l'écran : tout reste visible. */
    function fit(c) {
      c.inner.style.transform = ''; c.el.style.width = ''; c.el.style.height = '';
      const availH = window.innerHeight - topLimit() - M, availW = window.innerWidth - 2 * M;
      const w = c.inner.offsetWidth, hh = c.inner.offsetHeight;
      const k = Math.min(1, availH / hh, availW / w);
      if (k < 1) {
        c.inner.style.transform = `scale(${k})`;
        c.el.style.width = Math.floor(w * k) + 'px'; c.el.style.height = Math.floor(hh * k) + 'px';
      }
      c.el.classList.toggle('shrunk', k < 0.999);
    }
    function clamp(c) {
      const r = { width: c.el.offsetWidth, height: c.el.offsetHeight }, t = topLimit();   // (tailles de mise en page : l'animation d'entrée ne fausse rien)
      c.x = Math.max(M, Math.min(c.x, window.innerWidth - r.width - M));
      c.y = Math.max(t, Math.min(c.y, window.innerHeight - r.height - M));
      c.el.style.left = c.x + 'px'; c.el.style.top = c.y + 'px';
    }
    const clampAll = () => cards.forEach(clamp);
    /** Place les fiches à côté de l'énigme (à droite, puis à gauche), sinon en cascade. */
    function arrange(all) {
      const pr = panelRef && panelRef.isConnected ? panelRef.getBoundingClientRect() : null;
      const t = topLimit();
      let rx = pr ? pr.right + 10 : M, ry = t, lx = pr ? pr.left - 10 : M, ly = t, k = 0, cy = t;
      cards.forEach((c, id) => {
        if (c.placed && !all) return;
        const r = { width: c.el.offsetWidth, height: c.el.offsetHeight };
        if (pr && rx + r.width <= window.innerWidth - M && ry + r.height <= window.innerHeight - M) { c.x = rx; c.y = ry; ry += r.height + 8; }
        else if (pr && lx - r.width >= M && ly + r.height <= window.innerHeight - M) { c.x = lx - r.width; c.y = ly; ly += r.height + 8; }
        else if (cy + r.height <= window.innerHeight - M) { c.x = window.innerWidth - r.width - M; c.y = cy; cy += r.height + 6; }   // (empilées le long du bord droit)
        else { c.x = window.innerWidth - r.width - M - k * 26; c.y = t + k * 34; k++; }   // (sinon en cascade, à déplacer)
        c.placed = true; pos[id] = null;
        clamp(c);
      });
    }
    function drag(c, id, e) {
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest('button')) return;
      e.preventDefault();
      c.el.style.zIndex = ++zTop; c.el.classList.add('dragging');
      const sx = e.clientX, sy = e.clientY, ox = c.x, oy = c.y;
      const move = (ev) => { c.x = ox + ev.clientX - sx; c.y = oy + ev.clientY - sy; clamp(c); };
      const up = () => {
        c.el.classList.remove('dragging'); pos[id] = { x: c.x, y: c.y };
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    }
    function build(id) {
      const d = G.store.docDef(id);
      const c = { folded: compact(), x: 0, y: 0, placed: false };
      const body = h('div', { class: 'pz-pin-body' }, G.panels.docNodes(d));
      const foldBtn = h('button', { class: 'pz-pin-f', type: 'button', title: 'Replier / déplier', 'aria-label': 'Replier ou déplier cet indice' }, '▾');
      const head = h('header', { class: 'pz-pin-h', title: 'Fais glisser pour déplacer' },
        h('span', { class: 'grip', 'aria-hidden': 'true' }, '⠿'),
        h('span', { class: 'pz-pin-t' }, h('b', null, d.title), d.from ? h('small', null, d.from) : null),
        foldBtn,
        h('button', { class: 'pz-pin-x', type: 'button', 'aria-label': 'Retirer cet indice des épinglés', title: 'Désépingler', onclick: () => { G.store.pin(id, false); G.puzzles.refreshPins(); } }, '✕'));
      c.inner = h('div', { class: 'pz-pin-in' }, head, body);
      c.el = h('article', { class: 'pz-pin floating kind-' + (d.kind || 'lettre'), style: { zIndex: ++zTop } }, c.inner);
      c.setFold = (f) => { c.folded = f; c.el.classList.toggle('folded', f); foldBtn.textContent = f ? '▸' : '▾'; fit(c); clamp(c); };
      foldBtn.addEventListener('click', () => {
        const open = c.folded;
        if (open && compact()) cards.forEach((o) => { if (o !== c && !o.folded) o.setFold(true); });   // (petit écran : une seule fiche dépliée)
        c.setFold(!c.folded);
        if (open) c.el.style.zIndex = ++zTop;
      });
      c.el.classList.toggle('folded', c.folded); foldBtn.textContent = c.folded ? '▸' : '▾';
      head.addEventListener('pointerdown', (e) => drag(c, id, e));
      c.el.querySelectorAll('img').forEach((im) => im.addEventListener('load', () => { fit(c); clamp(c); }));   // (une image arrive : la fiche se réajuste)
      c.el.addEventListener('pointerdown', () => { c.el.style.zIndex = ++zTop; });
      return c;
    }
    function sync(ids, panel) {
      panelRef = panel;
      cards.forEach((c, id) => { if (!ids.includes(id)) { c.el.remove(); cards.delete(id); } });
      if (!ids.length) return;
      const L = ensureLayer();
      ids.forEach((id) => {
        if (cards.has(id)) return;
        const c = build(id); cards.set(id, c); L.append(c.el);
        fit(c);
        if (pos[id]) { c.x = pos[id].x; c.y = pos[id].y; c.placed = true; clamp(c); }
      });
      arrange(false);
      requestAnimationFrame(() => { cards.forEach((c) => fit(c)); clampAll(); });   // (une fois les polices et les signes dessinés)
    }
    function clear() {
      cards.forEach((c) => c.el.remove()); cards.clear();
      for (const k in pos) delete pos[k];
      if (layer) { layer.remove(); layer = null; }
    }
    return { sync, arrange, clear };
  })();

  /* ---------- coque commune (titre, énoncé, matériel, messages) ---------- */
  function shell(id, def) {
    const banner = def.type === 'find';
    const msg = h('p', { class: 'pz-msg', 'aria-live': 'polite' });
    const body = h('div', { class: 'pz-body' });
    const counter = h('span', { class: 'pz-counter' });
    const promptEl = h('p', { class: 'pz-prompt', html: rich(def.prompt || '') });
    const hintEl = h('p', { class: 'pz-hint' });
    const pinsEl = h('div', { class: 'pz-pins', hidden: true });
    const devBtn = G.config.dev ? h('button', { class: 'btn small ghost dev-solve', onclick: () => ui.devSolve && ui.devSolve() }, '(dev) Résoudre') : null;
    const noteBtn = h('button', { class: 'btn small ghost pz-carnet', 'aria-label': "Ouvrir le carnet d'indices", onclick: () => G.panels.openNotebook() }, '✉ Carnet');
    const panel = h('section', { id: 'puzzle-panel', class: `panel parchment puzzle t-${def.type}` + (banner ? ' banner' : '') },
      h('header', { class: 'pz-head' },
        h('h2', null, def.title), counter, devBtn, noteBtn,
        h('button', { class: 'btn small ghost', onclick: () => G.chapter.quit() }, 'Plus tard')),
      promptEl, hintEl, pinsEl, body, msg);
    $('#puzzle-root').append(panel);

    let solved = false;
    const ui = {
      panel, body, counter, last: true, result: null, stepLabel: '',
      /** Petit compteur d'avancement (« 2 / 3 »), précédé de « Étape i / n » dans une énigme en plusieurs parties. */
      count(txt) { counter.textContent = this.stepLabel ? this.stepLabel + ' · ' + txt : txt; },
      say(text, kind) { msg.textContent = text; msg.className = 'pz-msg ' + (kind || ''); if (kind === 'bad') G.audio.sfx('soft_error'); },
      gentle() { this.say(gentle(), 'bad'); },
      /** Remplace l'énoncé, le matériel et le contenu (changement d'étape). */
      setStep(d) {
        promptEl.innerHTML = rich(d.prompt || '');
        hintEl.innerHTML = '';
        if ((def.clues && def.clues.length) || def.carnet) hintEl.append(h('span', null, "Les indices utiles sont rangés dans ton carnet : à toi de les retrouver. Épingle-les (📌) pour les garder sous les yeux. "), h('button', { class: 'btn small', onclick: () => G.panels.openNotebook() }, "Ouvrir le carnet"));
        hintEl.hidden = !hintEl.childNodes.length;
        ui.result = null;
        ui.refreshPins();
        counter.textContent = ui.stepLabel || '';
        body.innerHTML = ''; msg.textContent = ''; msg.className = 'pz-msg';
        panel.className = panel.className.replace(/\bt-\w+/, 't-' + d.type);
        panel.classList.remove('many');
        panel.scrollTop = 0;
      },
      success() {
        if (solved) return Promise.resolve();
        if (!this.last) { msg.textContent = 'Bien vu !'; msg.className = 'pz-msg good'; G.audio.sfx('magic'); G.fx.confetti(10); return G.sleep(900); }
        solved = true;
        panel.classList.add('solved');
        msg.textContent = 'Bravo !'; msg.className = 'pz-msg good';
        G.audio.sfx('solved'); G.fx.confetti(30);     // (bruit de résolution d'énigme : data/audio.js → sfx.solved)
        return G.sleep(1700);
      },
      /** Les indices épinglés (depuis le carnet) : des fiches flottantes, déplaçables, toujours lisibles EN ENTIER
          (jamais de barre de défilement : une fiche trop grande pour l'écran se réduit d'elle-même). */
      refreshPins() {
        const ids = banner ? [] : G.store.pins().filter((id) => G.store.docDef(id));
        pinsEl.innerHTML = '';
        pinsEl.hidden = !ids.length;
        if (ids.length) {
          pinsEl.append(h('span', null, `📌 ${ids.length} indice${ids.length > 1 ? 's' : ''} épinglé${ids.length > 1 ? 's' : ''} : fais-les glisser où tu veux.`),
            h('button', { class: 'btn small ghost', type: 'button', onclick: () => PinBoard.arrange(true) }, 'Ranger'));
        }
        PinBoard.sync(ids, panel);
      },
      destroy() { panel.remove(); PinBoard.clear(); }
    };
    ui.setStep(def);
    return ui;
  }

  /* ---------- faisceau lumineux (pur, testable hors navigateur) ---------- */
  const DIRS = { N: [-1, 0], E: [0, 1], S: [1, 0], W: [0, -1] };
  const BOUNCE = { '/': { E: 'N', N: 'E', W: 'S', S: 'W' }, '\\': { E: 'S', S: 'E', W: 'N', N: 'W' } };
  /** Suit le faisceau. `m` = orientation de chaque miroir mobile (index → '/' | '\\'). */
  function trace(def, m) {
    const wall = new Set((def.walls || []).map(([r, c]) => r + ',' + c));
    const fixed = new Map((def.fixed || []).map((f) => [f.r + ',' + f.c, f.m]));
    const mov = new Map((def.movable || []).map((f, i) => [f.r + ',' + f.c, i]));
    const tgt = new Map((def.targets || []).map((t, i) => [t.r + ',' + t.c, i]));
    let r = def.source.r, c = def.source.c, d = def.source.dir;
    const pts = [[r, c]], lit = [], seen = new Set();
    for (let guard = 0; guard < 400; guard++) {
      const [dr, dc] = DIRS[d];
      r += dr; c += dc;
      if (r < 0 || c < 0 || r >= def.rows || c >= def.cols) break;
      const k = r + ',' + c;
      if (wall.has(k)) break;
      pts.push([r, c]);
      if (tgt.has(k) && !lit.includes(tgt.get(k))) lit.push(tgt.get(k));
      const mir = mov.has(k) ? m[mov.get(k)] : fixed.get(k);
      if (mir) d = BOUNCE[mir][d];
      const key = k + d;
      if (seen.has(key)) break;
      seen.add(key);
    }
    return { pts, lit };
  }

  /* ---------- types ---------- */
  const TYPES = {
    text(def, ui, done) {
      const ok = def.answers.map(normAnswer);
      const input = h('input', { type: 'text', class: 'pz-input', placeholder: def.placeholder || '', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Ta réponse' });
      const form = h('form', { class: 'pz-form', onsubmit: (e) => {
        e.preventDefault();
        if (ok.includes(normAnswer(input.value))) { input.disabled = true; ui.success().then(done); }
        else { G.fx.shake(input); ui.gentle(); input.select(); }
      } }, input, h('button', { class: 'btn primary', type: 'submit' }, 'Valider'));
      ui.body.append(form);
      setTimeout(() => input.focus({ preventScroll: true }), 300);
    },

    /** Plusieurs réponses à donner (une par champ). Les champs justes se verrouillent. */
    multi(def, ui, done) {
      const rows = def.fields.map((f) => {
        const input = h('input', { type: 'text', class: 'pz-input', placeholder: f.placeholder || '', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': f.label.replace(/[*_]/g, '') });
        const exact = (f.answers || []).map(normAnswer), kws = (f.keywords || []).map(normAnswer);
        const ok = { includes: (v) => exact.includes(v) || kws.some((k) => k && v.includes(k)) || (f.minLength > 0 && v.length >= f.minLength) };   // (minLength : toute vraie phrase est acceptée)   // réponse exacte, ou contenant un mot-clé
        return { f, input, ok, good: false, row: h('label', { class: 'pz-field' }, h('span', { html: rich(f.label) }), input) };
      });
      const check = () => {
        let bad = 0;
        rows.forEach((r) => {
          if (r.good) return;
          if (r.ok.includes(normAnswer(r.input.value))) { r.good = true; r.input.disabled = true; r.row.classList.add('right'); }
          else { bad++; if (r.input.value.trim()) G.fx.shake(r.input); }
        });
        if (rows.length > 1) ui.count(`${rows.filter((r) => r.good).length} / ${rows.length}`);
        if (!bad) { ui.result = rows.map((r) => ({ label: r.f.label, value: r.input.value.trim() })); ui.success().then(done); }
        else ui.gentle();
      };
      if (rows.length > 1) ui.count(`0 / ${rows.length}`);
      ui.body.append(h('form', { class: 'pz-multi', onsubmit: (e) => { e.preventDefault(); check(); } },
        ...rows.map((r) => r.row), h('div', { class: 'pz-actions' }, h('button', { class: 'btn primary', type: 'submit' }, 'Valider'))));
      setTimeout(() => rows[0].input.focus({ preventScroll: true }), 300);
    },

    combo(def, ui, done) {
      const symbols = Array.from(def.symbols || '0123456789');
      const idx = Array(def.digits).fill(0);
      const cols = [];
      const refresh = () => cols.forEach((c, i) => { c.val.textContent = symbols[idx[i]]; });
      const bump = (i, d) => { idx[i] = (idx[i] + d + symbols.length) % symbols.length; refresh(); cols[i].val.classList.remove('tick'); void cols[i].val.offsetWidth; cols[i].val.classList.add('tick'); G.audio.sfx('click'); };
      const wheel = h('div', { class: 'pz-combo' });
      for (let i = 0; i < def.digits; i++) {
        const val = h('div', { class: 'dial-val', 'aria-live': 'polite' }, symbols[0]);
        cols.push({ val });
        wheel.append(h('div', { class: 'dial' },
          h('button', { class: 'dial-btn', 'aria-label': 'Symbole suivant', onclick: () => bump(i, 1) }, '▲'),
          val,
          h('button', { class: 'dial-btn', 'aria-label': 'Symbole précédent', onclick: () => bump(i, -1) }, '▼')));
        if (def.sep && def.sep.includes(i)) wheel.append(h('div', { class: 'dial-sep', 'aria-hidden': 'true' }, def.sepChar || ':'));
      }
      const open = h('button', { class: 'btn primary', onclick: () => {
        const v = idx.map((k) => symbols[k]).join('');
        if (v === String(def.answer).toUpperCase()) { wheel.classList.add('open'); open.disabled = true; ui.success().then(done); }
        else { G.fx.shake(wheel); ui.gentle(); }
      } }, def.button || 'Ouvrir');
      ui.body.append(wheel, h('div', { class: 'pz-actions' }, open));
    },

    order(def, ui, done) {
      const n = def.items.length;
      const tiles = def.items.map((t, i) => ({ t, i }));
      let pool = shuffle(tiles, true);
      const slots = Array(n).fill(null);
      const locked = new Set();
      const poolBox = h('div', { class: 'ord-pool' }), slotBox = h('div', { class: 'ord-slots' });
      ui.body.append(slotBox, poolBox);
      ui.panel.classList.toggle('many', n >= 6);
      const render = () => {
        slotBox.innerHTML = ''; poolBox.innerHTML = '';
        slots.forEach((tile, k) => {
          const s = h('button', { class: 'ord-slot' + (tile ? ' filled' : '') + (locked.has(k) ? ' right' : ''), 'aria-label': tile ? `Position ${k + 1} : ${tile.t}` : `Position ${k + 1} vide`,
            onclick: () => { if (!tile || locked.has(k)) return; slots[k] = null; pool.push(tile); render(); } },
            h('b', null, def.labels ? def.labels[k] : String(k + 1)), h('span', { html: rich(tile ? tile.t : '') }));
          slotBox.append(s);
        });
        pool.forEach((tile) => poolBox.append(h('button', { class: 'btn tile', onclick: () => {
          const k = slots.indexOf(null); if (k < 0) return;
          slots[k] = tile; pool = pool.filter((x) => x !== tile); render();
          if (!slots.includes(null)) setTimeout(check, 350);
        } }, h('span', { html: rich(tile.t) }))));
      };
      const check = () => {
        if (slots.every((t, k) => t && t.i === k)) { slots.forEach((_, k) => locked.add(k)); render(); ui.success().then(done); return; }
        ui.gentle(); G.fx.shake(slotBox);
        slots.forEach((t, k) => { if (t && t.i === k) locked.add(k); else if (t) { pool.push(t); slots[k] = null; } });
        render();
      };
      render();
    },

    match(def, ui, done) {
      const left = def.pairs.map(([l], i) => ({ t: l, i }));
      const right = shuffle(def.pairs.map(([, r], i) => ({ t: r, i })).concat((def.extras || []).map((t) => ({ t, i: -1 }))), true);
      let sel = null, matched = 0;
      const colL = h('div', { class: 'mt-col' }), colR = h('div', { class: 'mt-col' });
      const btnL = [], btnR = [];
      left.forEach((it) => { const b = h('button', { class: 'btn mt-item', html: rich(it.t), onclick: () => { if (b.classList.contains('matched')) return; btnL.forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); sel = { it, b }; } }); btnL.push(b); colL.append(b); });
      right.forEach((it) => { const b = h('button', { class: 'btn mt-item', html: rich(it.t), onclick: () => {
        if (b.classList.contains('matched')) return;
        if (!sel) { ui.say("Choisis d'abord un élément à gauche.", ''); return; }
        if (sel.it.i === it.i) {
          const hue = (matched * 70 + 20) % 360;
          [sel.b, b].forEach((x) => { x.classList.remove('sel'); x.classList.add('matched'); x.style.setProperty('--pair', `hsl(${hue} 65% 62%)`); });
          sel = null; matched++; ui.say('', ''); G.audio.sfx('magic');
          if (matched === left.length) ui.success().then(done);
        } else { G.fx.shake(sel.b); G.fx.shake(b); ui.gentle(); sel.b.classList.remove('sel'); sel = null; }
      } }); btnR.push(b); colR.append(b); });
      ui.body.append(h('div', { class: 'pz-match' }, colL, h('div', { class: 'mt-link', 'aria-hidden': 'true' }, '⟷'), colR));
    },

    /** Cocher exactement les bonnes cartes (answer = indices). */
    pick(def, ui, done) {
      const sel = new Set();
      const cards = def.cards.map((c0, i) => {
        // (une carte peut désigner une page du carnet : on n'affiche que son titre, il faut aller la relire)
        const dd = c0.doc ? G.store.docDef(c0.doc) : null;
        const c = dd ? { title: dd.from || 'Carnet', text: dd.title } : c0;
        const b = h('button', { class: 'pk-card', 'aria-pressed': 'false', onclick: () => {
          if (sel.has(i)) sel.delete(i); else sel.add(i);
          b.classList.toggle('on', sel.has(i)); b.setAttribute('aria-pressed', String(sel.has(i)));
          ui.count(`${sel.size} choisi${sel.size > 1 ? 's' : ''}`); G.audio.sfx('click');
        } }, h('strong', { html: rich(c.title) }), c.text ? h('span', { html: rich(c.text) }) : null);
        return b;
      });
      const go = h('button', { class: 'btn primary', onclick: () => {
        const want = new Set(def.answer);
        const need = def.need || want.size;            // need : combien en choisir parmi les bonnes (ex. 3 parmi 4)
        const ok = sel.size === need && [...sel].every((i) => want.has(i));
        if (ok) { ui.result = { picked: [...sel].sort((a, b) => a - b) }; go.disabled = true; cards.forEach((b) => (b.disabled = true)); ui.success().then(done); }
        else { G.fx.shake(go); ui.gentle(); }
      } }, def.button || 'Valider ma sélection');
      ui.count('0 choisi');
      ui.body.append(h('div', { class: 'pk-grid' }, cards), h('div', { class: 'pz-actions' }, go));
    },

    /** Une image SVG avec des zones à toucher (answer = clés des zones attendues). */
    svgpick(def, ui, done) {
      const want = new Set([].concat(def.answer));
      const multi = want.size > 1;
      const sel = new Set();
      const wrap = h('div', { class: 'svgp', html: def.svg });
      const svg = wrap.querySelector('svg');
      svg.classList.add('svgp-svg');
      const hits = Array.from(svg.querySelectorAll('[data-k]'));
      hits.forEach((el) => {
        el.classList.add('hit'); el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
        const act = () => {
          const k = el.dataset.k;
          if (!multi) {
            if (want.has(k)) { el.classList.add('good'); hits.forEach((x) => x.classList.add('frozen')); ui.success().then(done); }
            else { el.classList.add('nope'); setTimeout(() => el.classList.remove('nope'), 700); ui.gentle(); }
            return;
          }
          if (sel.has(k)) sel.delete(k); else sel.add(k);
          el.classList.toggle('on', sel.has(k)); G.audio.sfx('click');
          ui.count(`${sel.size} / ${want.size}`);
        };
        el.addEventListener('click', act);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      });
      ui.body.append(wrap);
      if (multi) {
        ui.count(`0 / ${want.size}`);
        const go = h('button', { class: 'btn primary', onclick: () => {
          const ok = sel.size === want.size && [...sel].every((k) => want.has(k));
          if (ok) { go.disabled = true; hits.forEach((x) => x.classList.add('frozen')); ui.success().then(done); } else { G.fx.shake(go); ui.gentle(); }
        } }, def.button || 'Valider');
        ui.body.append(h('div', { class: 'pz-actions' }, go));
      }
    },

    /** Deux images presque identiques : toucher les différences (targets en coordonnées du viewBox). */
    diff(def, ui, done) {
      const found = new Set(); let misses = 0;
      const box = h('div', { class: 'diff-box' });
      const mk = (title, svgStr) => {
        const w = h('figure', { class: 'diff-fig', html: svgStr });
        w.append(h('figcaption', null, title));
        return w;
      };
      const figs = [mk(def.titles[0], def.a), mk(def.titles[1], def.b)];
      box.append(...figs);
      const svgs = figs.map((f) => f.querySelector('svg'));
      const vb = svgs[0].viewBox.baseVal;
      const upd = () => { ui.count(`${found.size} / ${def.targets.length}`); };
      upd();
      svgs.forEach((svg) => {
        svg.classList.add('diff-svg');
        svg.addEventListener('click', (e) => {
          const r = svg.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width * vb.width + vb.x, y = (e.clientY - r.top) / r.height * vb.height + vb.y;
          const i = def.targets.findIndex((t, k) => !found.has(k) && Math.hypot(t.x - x, t.y - y) <= t.r);
          if (i >= 0) {
            found.add(i); upd(); G.audio.sfx('magic');
            svgs.forEach((s) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', def.targets[i].x); c.setAttribute('cy', def.targets[i].y); c.setAttribute('r', def.targets[i].r); c.setAttribute('class', 'diff-found'); s.append(c); });
            if (found.size === def.targets.length) ui.success().then(done);
          } else if (!found.size || true) {
            misses++;
            if (misses % 5 === 0) ui.say("Compare calmement les deux cartes, repère par repère…", '');
            G.audio.sfx('click');
          }
        });
      });
      ui.body.append(box);
    },

    /** Reconstituer une image découpée en morceaux mélangés (on échange deux morceaux). */
    jigsaw(def, ui, done) {
      const { cols, rows, w, h: ih } = def;
      const n = cols * rows;
      const inner = def.svg;
      const tw = w / cols, th = ih / rows;
      let order = Array.from({ length: n }, (_, i) => i);
      let tries = 0;
      do { order = shuffle(order); tries++; } while (order.filter((v, i) => v !== i).length < n - 2 && tries < 50);
      let first = null;
      const board = h('div', { class: 'jig', style: { '--cols': cols, '--rows': rows, aspectRatio: `${w} / ${ih}` } });
      const render = () => {
        board.innerHTML = '';
        order.forEach((piece, pos) => {
          const col = piece % cols, row = Math.floor(piece / cols);
          const t = h('button', { class: 'jig-tile' + (first === pos ? ' sel' : ''), 'aria-label': `Morceau ${pos + 1}`,
            html: `<svg viewBox="${col * tw} ${row * th} ${tw} ${th}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`,
            onclick: () => {
              if (first == null) { first = pos; render(); return; }
              if (first !== pos) { [order[first], order[pos]] = [order[pos], order[first]]; G.audio.sfx('click'); }
              first = null; render();
              if (order.every((v, i) => v === i)) { board.classList.add('done'); ui.success().then(done); }
            } });
          board.append(t);
        });
      };
      ui.body.append(board);
      render();
    },

    /** Faisceau de lumière et miroirs à orienter. */
    mirrors(def, ui, done) {
      const S = 56;                                    // taille d'une case (px de viewBox)
      const state = (def.movable || []).map((mv) => mv.m);
      const W = def.cols * S, H = def.rows * S;
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'mir-svg');
      const wrap = h('div', { class: 'mir-wrap' }, svg);
      const cx = (c) => c * S + S / 2, cy = (r) => r * S + S / 2;
      const order = h('div', { class: 'mir-order', 'aria-live': 'polite' });
      let finished = false;

      function draw() {
        const res = trace(def, state);
        let out = '';
        for (let r = 0; r < def.rows; r++) for (let c = 0; c < def.cols; c++) out += `<rect x="${c * S}" y="${r * S}" width="${S}" height="${S}" class="mir-cell"/>`;
        (def.walls || []).forEach(([r, c]) => { out += `<rect x="${c * S + 3}" y="${r * S + 3}" width="${S - 6}" height="${S - 6}" rx="8" class="mir-wall"/><path d="M${c * S + 14} ${r * S + 18}l8 -6M${c * S + 24} ${r * S + 40}l16 -14" class="mir-glint"/>`; });
        // faisceau
        const d = res.pts.map(([r, c], i) => `${i ? 'L' : 'M'}${cx(c)} ${cy(r)}`).join('');
        out += `<path d="${d}" class="mir-beam-glow"/><path d="${d}" class="mir-beam"/>`;
        // miroirs fixes et mobiles
        const mir = (r, c, m, movable, i) => {
          const a = m === '/' ? [cx(c) - 18, cy(r) + 18, cx(c) + 18, cy(r) - 18] : [cx(c) - 18, cy(r) - 18, cx(c) + 18, cy(r) + 18];
          return `<g class="${movable ? 'mir-mov' : 'mir-fix'}" ${movable ? `data-i="${i}" tabindex="0" role="button" aria-label="Miroir à tourner"` : ''}>${movable ? `<circle cx="${cx(c)}" cy="${cy(r)}" r="${S / 2 - 3}" class="mir-hit"/>` : ''}<line x1="${a[0]}" y1="${a[1]}" x2="${a[2]}" y2="${a[3]}" class="mir-line"/></g>`;
        };
        (def.fixed || []).forEach((f) => { out += mir(f.r, f.c, f.m, false); });
        (def.movable || []).forEach((f, i) => { out += mir(f.r, f.c, state[i], true, i); });
        // cibles
        def.targets.forEach((t, i) => {
          const on = res.lit.includes(i);
          out += `<g class="mir-tgt ${on ? 'lit' : ''}"><path d="${starD(cx(t.c), cy(t.r), 17, 8, 5)}"/>${t.letter ? `<text x="${cx(t.c)}" y="${cy(t.r) + 5}" text-anchor="middle">${on ? t.letter : ''}</text>` : ''}</g>`;
        });
        // source
        const s = def.source, dd = DIRS[s.dir];
        out += `<g class="mir-src"><circle cx="${cx(s.c)}" cy="${cy(s.r)}" r="15"/><path d="M${cx(s.c)} ${cy(s.r)}l${dd[1] * 22} ${dd[0] * 22}" class="mir-arrow"/></g>`;
        svg.innerHTML = out;
        svg.querySelectorAll('.mir-mov').forEach((g) => {
          const act = () => { if (finished) return; const i = Number(g.dataset.i); state[i] = state[i] === '/' ? '\\' : '/'; G.audio.sfx('click'); draw(); };
          g.addEventListener('click', act);
          g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        });
        ui.count(`${res.lit.length} / ${def.targets.length}`);
        order.textContent = def.targets.some((t) => t.letter) ? (res.lit.length ? 'Étoiles éclairées, dans l\'ordre : ' + res.lit.map((i) => def.targets[i].letter).join(' ') : '') : '';
        if (!finished && res.lit.length === def.targets.length) {
          finished = true; wrap.classList.add('lit'); G.audio.sfx('magic');
          ui.result = { letters: res.lit.map((i) => def.targets[i].letter).filter(Boolean) };
          ui.success().then(done);
        }
      }
      function starD(x, y, ro, ri, n) {
        let d = '';
        for (let i = 0; i < n * 2; i++) { const a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? ri : ro; d += `${i ? 'L' : 'M'}${(x + r * Math.cos(a)).toFixed(1)} ${(y + r * Math.sin(a)).toFixed(1)}`; }
        return d + 'Z';
      }
      ui.body.append(wrap, order);
      draw();
    },

    find(def, ui, done) {
      const hot = $('#hotspots'); hot.hidden = true;
      const layer = h('div', { id: 'find-layer' });
      $('#stage').append(layer);
      const found = new Set(); let misses = 0;
      const upd = () => { ui.count(`${found.size} / ${def.targets.length}`); };
      upd();
      def.targets.forEach((t, i) => {
        const b = h('button', { class: 'find-target', 'aria-label': 'Endroit à toucher',
          style: { left: pct(t.x - t.r, IW), top: pct(t.y - t.r, IH), width: pct(2 * t.r, IW), height: pct(2 * t.r, IH) },
          onclick: (e) => {
            e.stopPropagation();
            if (found.has(i)) return;
            found.add(i); b.classList.add('found'); upd();
            const c = G.fx.centerOf(b); G.fx.sparkles(c.x, c.y, 16, { spread: 70 }); G.fx.ring(c.x, c.y, 'gold'); G.audio.sfx('magic');
            if (found.size === def.targets.length) ui.success().then(done);
          } });
        layer.append(b);
      });
      layer.addEventListener('click', (e) => {
        misses++;
        const r = h('span', { class: 'ring miss', style: { left: e.clientX + 'px', top: e.clientY + 'px' } });
        r.addEventListener('animationend', () => r.remove()); $('#fx-root').append(r);
        if (misses % 6 === 0) ui.say("Prends ton temps, regarde bien tout le décor…", '');
      });
      ui.cleanupFind = () => { layer.remove(); hot.hidden = false; };
    }
  };

  /** Lance une énigme ; résout quand elle est résolue, rejette (Cancel) si le joueur part. */
  async function run(id) {
    const def = G.data.puzzles[id];
    if (!def) return;
    G.audio.puzzle(true);
    G.store.pinScope(id);
    const ui = shell(id, def.steps ? Object.assign({}, def, def.steps[0]) : def);
    current = { id, ui };
    try {
      if (def.steps) {
        const n = def.steps.length;
        for (let i = 0; i < n; i++) {
          const step = Object.assign({ title: def.title }, def.steps[i]);
          ui.last = i === n - 1;
          ui.stepLabel = n > 1 ? `Étape ${i + 1} / ${n}` : '';
          if (i) ui.setStep(step); else ui.counter.textContent = ui.stepLabel;
          await G.makeWaiter((done) => { ui.devSolve = () => ui.success().then(done); TYPES[step.type](step, ui, done); });
          if (!ui.last) await keepNotes(id, def, i, step, ui);
        }
      } else {
        await G.makeWaiter((done) => { ui.devSolve = () => ui.success().then(done); TYPES[def.type](def, ui, done); });
      }
    } finally {
      if (ui.cleanupFind) ui.cleanupFind();
      ui.destroy();
      G.audio.puzzle(false);
      current = null;
      G.store.clearPins();
    }
  }

  /* ---------- notes entre deux parties : ce qui vient d'être résolu reste lisible dans le carnet ---------- */
  const plain = (t) => String(t == null ? '' : t);
  function noteBody(step, ui) {
    const t = step.type;
    if (t === 'order') return (step.items || []).map((x, k) => (step.labels && step.labels[k] ? `**${step.labels[k]}.** ` : `**${k + 1}.** `) + x);
    if (t === 'multi') return (ui.result || []).map((r) => `${plain(r.label).replace(/^…/, '…')} : **${r.value}**`);
    if (t === 'match') return (step.pairs || []).map(([a, b]) => `${a} → **${b}**`);
    if (t === 'pick') return ((ui.result && ui.result.picked) || step.answer || []).map((i) => {
      const c0 = step.cards[i], dd = c0.doc ? G.store.docDef(c0.doc) : null;     // (une carte peut être une page du carnet)
      const c = dd ? { title: dd.title, text: dd.from ? '(' + dd.from + ')' : '' } : c0;
      return `**${c.title}.** ${c.text || ''}`;
    });
    if (t === 'mirrors') {
      const letters = (ui.result && ui.result.letters) || [];
      return [letters.length ? 'Les étoiles se sont éclairées dans cet ordre : **' + letters.join(' · ') + '**' : 'Le faisceau a rejoint toutes les étoiles.'];
    }
    return [`**${plain(step.answers && step.answers[0])}**`];
  }
  async function keepNotes(pid, def, i, step, ui) {
    if (step.note === false) return;
    for (const d of step.grants || []) await G.chapter.grantDoc(d);
    if (step.grants && step.grants.length) return;
    const custom = step.note && typeof step.note === 'object' ? step.note : null;
    const title = (custom && custom.title) || `Notes · ${step.title}`;
    const body = (custom && custom.body) || noteBody(step, ui);
    const nid = `note:${pid}:${i}`;
    if (G.store.giveNote(nid, { day: G.chapter.currentDay() || def.day || null, kind: 'note', from: `Tes notes · partie ${i + 1} de « ${def.title} »`, title, body })) {
      await G.panels.acquireDoc(nid);                 // (la note s'affiche pour être lue, puis rejoint le carnet)
    }
  }

  /** Retire toute énigme à l'écran (en cas de sortie du chapitre). */
  function clear() {
    const p = $('#puzzle-panel'); if (p) p.remove();
    PinBoard.clear();
    G.audio.puzzle(false);
    current = null; G.store.clearPins();
    const l = $('#find-layer'); if (l) l.remove();
    const hot = $('#hotspots'); if (hot) hot.hidden = G.store.get().view === 'map';
  }

  /** L'énigme à l'écran (identifiant) si on peut y épingler des indices, sinon null. */
  const pinnableNow = () => (current && $('#puzzle-panel') && !current.ui.panel.classList.contains('banner') ? current.id : null);
  const refreshPins = () => { if (current) current.ui.refreshPins(); };

  G.puzzles = { run, clear, trace, TYPES, materialNode, pinnableNow, refreshPins };
})();
