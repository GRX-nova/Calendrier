/* ==========================================================================
   UTIL — petites fonctions utilitaires partagées.
   ========================================================================== */
(function () {
  const G = window.Game;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /** Construit un élément DOM : h('div', {class:'x', onclick:fn}, enfants…) */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : document.createTextNode(kid));
    }
    return el;
  }

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Mini-balisage sûr : **gras**, *italique*, {nom}. */
  function rich(str) {
    let s = escapeHtml(str == null ? '' : str);
    s = s.replace(/\{nom\}/g, escapeHtml(G.config.heroName));
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/\^\^(.+?)\^\^/g, '<small class="tiny">$1</small>');   // ^^texte^^ = écrit en tout petit
    return s;
  }
  const plain = (str) => String(str == null ? '' : str).replace(/\{nom\}/g, G.config.heroName).replace(/\*/g, '').replace(/\^\^/g, '');

  /* ---------- SHA-256 (JS pur : fonctionne aussi en ouvrant index.html directement) ---------- */
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const ror = (x, n) => (x >>> n) | (x << (32 - n));
  function sha256(str) {
    const bytes = new TextEncoder().encode(str);
    const l = bytes.length;
    const buf = new Uint8Array(((l + 9 + 63) >> 6) << 6);
    buf.set(bytes);
    buf[l] = 0x80;
    const dv = new DataView(buf.buffer);
    dv.setUint32(buf.length - 4, (l * 8) >>> 0);
    dv.setUint32(buf.length - 8, Math.floor((l * 8) / 0x100000000));
    let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    const w = new Uint32Array(64);
    for (let i = 0; i < buf.length; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const s0 = ror(w[t - 15], 7) ^ ror(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = ror(w[t - 2], 17) ^ ror(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, hh] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = ror(e, 6) ^ ror(e, 11) ^ ror(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (hh + S1 + ch + K[t] + w[t]) >>> 0;
        const S0 = ror(a, 2) ^ ror(a, 13) ^ ror(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H = [(H[0] + a) >>> 0, (H[1] + b) >>> 0, (H[2] + c) >>> 0, (H[3] + d) >>> 0, (H[4] + e) >>> 0, (H[5] + f) >>> 0, (H[6] + g) >>> 0, (H[7] + hh) >>> 0];
    }
    return H.map((x) => x.toString(16).padStart(8, '0')).join('');
  }

  /** Normalise un code saisi : insensible à la casse, aux espaces, tirets, accents. */
  const normCode = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  /** Normalise une réponse libre d'énigme. */
  const normAnswer = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const hashCode = (day, code, salt) => sha256((salt || G.config.codeSalt) + ':' + day + ':' + normCode(code));

  /* ---------- Attentes annulables (dialogues, énigmes…) ---------- */
  class Cancel extends Error { }
  const waiters = new Set();
  function makeWaiter(setup) {
    return new Promise((resolve, reject) => {
      const w = {};
      const done = (v) => { waiters.delete(w); resolve(v); };
      const fail = (e) => { waiters.delete(w); reject(e); };
      w.reject = fail;
      waiters.add(w);
      setup(done, fail);
    });
  }
  function abortAll() { for (const w of [...waiters]) w.reject(new Cancel('annulé')); waiters.clear(); }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function shuffle(arr, avoidSame) {
    const a = arr.slice();
    for (let tries = 0; tries < 8; tries++) {
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      if (!avoidSame || a.some((v, i) => v !== arr[i])) break;
    }
    return a;
  }

  /* ---------- Temps (avec décalage de test possible en mode dev) ---------- */
  const time = {
    offset: 0,
    now() { return new Date(Date.now() + this.offset); },
    setFake(date) { this.offset = date.getTime() - Date.now(); },
    clearFake() { this.offset = 0; },
    isFake() { return this.offset !== 0; },
    unlockDate(day) { return new Date(G.config.year, 11, day, G.config.unlockHour, 0, 0); },
    isUnlocked(day) { return this.now() >= this.unlockDate(day); },
    long(d) { return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/(^|\s)1 /, '$11er '); },   // (« 1er décembre »)
    short(d) { return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }); },
    iso() { return this.now().toISOString(); }
  };
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }); } catch (e) { return ''; } };

  Object.assign(G, { $, $$, h, rich, plain, escapeHtml, sha256, normCode, normAnswer, hashCode, Cancel, makeWaiter, abortAll, sleep, clamp, reduceMotion, shuffle, time, fmtDate });
})();
