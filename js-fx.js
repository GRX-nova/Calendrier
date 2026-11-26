/* ==========================================================================
   FX — neige légère, étincelles, objets qui volent vers l'inventaire, confettis,
   et l'Étoile d'Hiver en 24 éclats (SVG).
   Tout reste discret et léger ; réduit automatiquement si l'appareil le demande.
   ========================================================================== */
(function () {
  const G = window.Game;
  const { $, h } = G;
  const fxRoot = () => $('#fx-root');

  /* ---------- neige ---------- */
  const snow = {
    cv: null, cx: null, flakes: [], intensity: 1, last: 0, raf: 0, w: 0, h: 0, dpr: 1,
    start() {
      this.cv = $('#snow'); if (!this.cv) return;
      this.cx = this.cv.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(this.raf); else { this.last = 0; this.loop(performance.now()); }
      });
      this.loop(performance.now());
    },
    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      this.w = window.innerWidth; this.h = window.innerHeight;
      this.cv.width = this.w * this.dpr; this.cv.height = this.h * this.dpr;
      this.cv.style.width = this.w + 'px'; this.cv.style.height = this.h + 'px';
      this.populate();
    },
    populate() {
      const base = Math.min(70, Math.round(this.w / 24));
      const n = Math.round(base * this.intensity * (G.reduceMotion() ? 0.35 : 1));
      while (this.flakes.length < n) this.flakes.push(this.make(true));
      this.flakes.length = n;
    },
    make(anywhere) {
      return { x: Math.random() * this.w, y: anywhere ? Math.random() * this.h : -10, r: 0.8 + Math.random() * 2.2, v: 14 + Math.random() * 30, ph: Math.random() * 6.28, dr: 6 + Math.random() * 14, a: 0.35 + Math.random() * 0.5 };
    },
    setIntensity(v) { this.intensity = v; this.populate(); },
    loop(t) {
      const dt = this.last ? Math.min(0.05, (t - this.last) / 1000) : 0.016; this.last = t;
      const cx = this.cx; cx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); cx.clearRect(0, 0, this.w, this.h);
      for (const f of this.flakes) {
        f.y += f.v * dt; f.ph += dt * 0.9; f.x += Math.sin(f.ph) * f.dr * dt;
        if (f.y > this.h + 6) { Object.assign(f, this.make(false)); }
        cx.globalAlpha = f.a; cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 6.283); cx.fill();
      }
      this.raf = requestAnimationFrame((tt) => this.loop(tt));
    }
  };

  /* ---------- petits effets DOM ---------- */
  function sparkles(x, y, n, o) {
    if (G.reduceMotion()) n = Math.ceil((n || 10) / 3);
    n = n || 10; o = o || {};
    const root = fxRoot(); if (!root) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, d = (o.spread || 60) * (0.4 + Math.random() * 0.8);
      const s = h('span', { class: 'spark', style: { left: x + 'px', top: y + 'px', '--dx': Math.cos(a) * d + 'px', '--dy': Math.sin(a) * d - 14 + 'px', '--s': 0.6 + Math.random() * 0.9, animationDuration: 700 + Math.random() * 600 + 'ms' } });
      if (o.color) s.style.setProperty('--c', o.color);
      s.addEventListener('animationend', () => s.remove());
      root.append(s);
    }
  }
  function ring(x, y, cls) {
    const r = h('span', { class: 'ring ' + (cls || ''), style: { left: x + 'px', top: y + 'px' } });
    r.addEventListener('animationend', () => r.remove());
    fxRoot().append(r);
  }
  function pulse(el) { if (!el) return; el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); setTimeout(() => el.classList.remove('pulse'), 900); }
  function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 600); }
  function flash(color, ms) {
    const f = h('div', { class: 'flash', style: { background: color || '#fff8e0', animationDuration: (ms || 1400) + 'ms' } });
    f.addEventListener('animationend', () => f.remove());
    fxRoot().append(f);
  }
  function confetti(n) {
    n = n || 26; if (G.reduceMotion()) n = 8;
    const colors = ['#f4d35e', '#ee6055', '#8ecae6', '#ffffff', '#b8f2e6', '#ffafcc'];
    const root = fxRoot();
    for (let i = 0; i < n; i++) {
      const c = h('i', { class: 'confetto', style: { left: 10 + Math.random() * 80 + 'vw', background: colors[i % colors.length], animationDelay: Math.random() * 0.5 + 's', animationDuration: 1.8 + Math.random() * 1.4 + 's', '--rot': Math.random() * 720 - 360 + 'deg', '--sw': Math.random() * 120 - 60 + 'px' } });
      c.addEventListener('animationend', () => c.remove());
      root.append(c);
    }
  }
  /** Fait voler un contenu (icône, étoile…) d'un point vers un élément de l'interface. */
  function fly(from, toEl, content, o) {
    o = o || {};
    const size = o.size || 64, dur = o.dur || 950;
    if (!toEl) return Promise.resolve();
    const n = h('div', { class: 'fly', style: { width: size + 'px', height: size + 'px' } });
    if (typeof content === 'string') n.innerHTML = content; else if (content) n.append(content);
    fxRoot().append(n);
    const r = toEl.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2;
    const mx = (from.x + tx) / 2, my = Math.min(from.y, ty) - 110;
    const T = (x, y, s) => `translate(${x - size / 2}px,${y - size / 2}px) scale(${s})`;
    const anim = n.animate([
      { transform: T(from.x, from.y, 0.4), opacity: 0 },
      { transform: T(from.x, from.y, 1.2), opacity: 1, offset: 0.22 },
      { transform: T(mx, my, 1), opacity: 1, offset: 0.62 },
      { transform: T(tx, ty, 0.25), opacity: 0.85 }
    ], { duration: dur, easing: 'cubic-bezier(.4,.1,.3,1)' });
    return anim.finished.then(() => { n.remove(); pulse(toEl); }).catch(() => n.remove());
  }
  const center = () => ({ x: window.innerWidth / 2, y: window.innerHeight * 0.42 });
  const centerOf = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

  /* ---------- l'Étoile d'Hiver : 12 branches = 24 éclats ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function starSVG(collected, opts) {
    opts = opts || {};
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('class', 'star-svg'); svg.setAttribute('aria-hidden', 'true');
    const gid = 'gold' + Math.floor(Math.random() * 1e6);
    svg.innerHTML = `<defs><radialGradient id="${gid}" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#fff6c9"/><stop offset=".55" stop-color="#f6d365"/><stop offset="1" stop-color="#e0a93a"/></radialGradient></defs>`;
    const R = 46, r = 22, c = 50;
    const pt = (a, rad) => [c + rad * Math.cos(a), c + rad * Math.sin(a)];
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'shards');
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 6;
      const O = pt(a, R), L = pt(a - Math.PI / 12, r), Rr = pt(a + Math.PI / 12, r);
      [[L, 2 * i + 1], [Rr, 2 * i + 2]].forEach(([I, day]) => {
        const p = document.createElementNS(NS, 'polygon');
        p.setAttribute('points', `${c},${c} ${O[0].toFixed(2)},${O[1].toFixed(2)} ${I[0].toFixed(2)},${I[1].toFixed(2)}`);
        p.setAttribute('class', 'shard'); p.dataset.day = day; p.dataset.gid = gid;
        p.style.setProperty('--ox', ((O[0] - c) * 0.9).toFixed(1) + 'px'); p.style.setProperty('--oy', ((O[1] - c) * 0.9).toFixed(1) + 'px');
        p.style.setProperty('--rot', ((Math.random() - 0.5) * 140).toFixed(0) + 'deg');
        g.append(p);
      });
    }
    svg.append(g);
    setStarCollected(svg, collected || new Set(), gid);
    return svg;
  }
  function setStarCollected(svg, collected, gid) {
    const set = collected instanceof Set ? collected : new Set(collected);
    svg.querySelectorAll('.shard').forEach((p) => {
      const on = set.has(Number(p.dataset.day));
      p.classList.toggle('on', on);
      p.setAttribute('fill', on ? `url(#${gid || p.dataset.gid})` : 'rgba(255,255,255,.07)');
    });
  }

  G.fx = { snow, sparkles, ring, pulse, shake, flash, confetti, fly, center, centerOf, starSVG, setStarCollected };
})();
