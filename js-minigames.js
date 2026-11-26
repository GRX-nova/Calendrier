/* ==========================================================================
   DÉCOR CLIQUABLE & MINI-JEUX DE FLOCON

   • Les endroits du fond de chaque zone (data/decor.js) : un clic → Flocon dit une phrase.
   • Un endroit par zone lance un mini-jeu (score, record, message de Flocon à la fin) :
       zone 1 · le stand        → « friandises » : attraper les friandises qui tombent
       zone 2 · la cascade      → « lucioles »   : toucher les lucioles avant qu'elles s'éteignent
       zone 3 · le lac gelé     → « glissade »   : glisser entre les rochers
       zone 4 · le grand escalier → « paires »   : retrouver les paires d'objets du sac renversé
   Les records sont gardés dans la sauvegarde (S.minigames).
   ========================================================================== */
(function () {
  const G = window.Game;
  const { h } = G;
  const IW = 1670, IH = 941;
  const pct = (v, t) => (v / t * 100).toFixed(3) + '%';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ======================================================================
     1. Le décor cliquable
     ====================================================================== */
  function nextLine(sp) {
    const S = G.store.get();
    const after = !!(sp.linesAfter && (S.finaleSeen || G.store.hasFragment(24)));
    const list = after ? sp.linesAfter : sp.lines;
    if (!S.decorSaid || typeof S.decorSaid !== 'object') S.decorSaid = {};
    const key = sp.id + (after ? ':apres' : '');
    const prev = S.decorSaid[key];
    const i = prev == null ? Math.floor(Math.random() * list.length) : (prev + 1) % list.length;
    S.decorSaid[key] = i; G.store.save();
    return list[i];
  }

  function render(box, z) {
    const list = (G.data.decor || {})[z.id];
    if (!list || !G.progress.hasFlocon()) return;      // (Flocon doit être là pour parler du décor)
    list.forEach((sp) => sp.rects.forEach((r) => {
      const [x, y, w, hh] = r;
      const b = h('button', {
        class: 'decor' + (sp.game ? ' decor-game' : '') + ((x + w / 2) / IW < 0.12 ? ' edge-l' : (x + w / 2) / IW > 0.88 ? ' edge-r' : ''),
        style: { left: pct(x, IW), top: pct(y, IH), width: pct(w, IW), height: pct(hh, IH) },
        'aria-label': sp.name + (sp.game ? ' (mini-jeu avec Flocon)' : ''),
        onclick: (e) => { e.stopPropagation(); onDecor(sp, z.id); }
      },
        h('span', { class: 'decor-fx' }),
        sp.game ? h('span', { class: 'decor-star', 'aria-hidden': 'true' }, '✦') : null,
        h('span', { class: 'spot-label decor-label' }, sp.game ? sp.name + ' · mini-jeu' : sp.name));
      box.append(b);
    }));
  }

  let decorBusy = false;
  async function onDecor(sp, zone) {
    if (decorBusy || cur || G.chapter.isActive() || G.panels.isOpen()) return;
    decorBusy = true;
    try {
      const [expr, text] = nextLine(sp);
      await G.chapter.mini([{ who: 'flocon', expr, text }]);
      const news = G.souvenirs ? G.souvenirs.afterDecor(zone, sp.id) : [];   // (tout le décor de la zone regardé → souvenir)
      if (news.length) await G.souvenirs.show(news);
      if (sp.game && !G.chapter.isActive()) open(sp.game);
    } finally { decorBusy = false; }
  }

  /* ======================================================================
     2. La fenêtre des mini-jeux
     ====================================================================== */
  let cur = null;
  const sprites = {};
  function sprite(expr) {
    if (!sprites[expr]) { const i = new Image(); i.src = G.dlg.spriteSrc(expr); sprites[expr] = i; }
    return sprites[expr];
  }
  function drawSprite(ctx, img, cx, bottom, size, rot) {
    if (!img.complete || !img.naturalWidth) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    const w = ratio >= 1 ? size : size * ratio, hh = ratio >= 1 ? size / ratio : size;
    ctx.save(); ctx.translate(cx, bottom - hh / 2); if (rot) ctx.rotate(rot);
    ctx.drawImage(img, -w / 2, -hh / 2, w, hh); ctx.restore();
  }

  function open(id) {
    const def = GAMES[id];
    if (!def || cur) return;
    const S = G.store.get();
    if (!S.minigames || typeof S.minigames !== 'object') S.minigames = {};
    const rec = S.minigames[id] = Object.assign({ best: 0, plays: 0 }, S.minigames[id] || {});
    const scoreEl = h('b', null, '0'), bestEl = h('b', null, String(rec.best)), extra = h('span', { class: 'mg-extra' });
    const canvas = h('canvas', { class: 'mg-canvas' });
    const screen = h('div', { class: 'mg-screen' });
    const bg = h('div', { class: 'mg-bg' });
    bg.style.backgroundImage = `url("${def.bg}")`;
    bg.style.backgroundSize = def.bgSize || 'cover';
    bg.style.backgroundPosition = def.bgPos || 'center';
    bg.style.filter = `blur(3px) brightness(${1 - (def.dim == null ? 0.35 : def.dim)}) saturate(.9)`;
    const stage = h('div', { class: 'mg-stage' }, bg, canvas, screen);
    const root = h('div', { class: 'mg-back', role: 'dialog', 'aria-modal': 'true', 'aria-label': def.title },
      h('div', { class: 'mg-box parchment' },
        h('header', { class: 'mg-head' },
          h('h2', null, def.title),
          h('div', { class: 'mg-scores' }, h('span', null, 'Score ', scoreEl), h('span', null, 'Record ', bestEl), extra),
          h('button', { class: 'modal-x', 'aria-label': 'Fermer', onclick: () => close() }, '×')),
        stage));
    (document.getElementById('modal-root') || document.body).append(root);   // (dans #modal-root : un souvenir peut s'ouvrir par-dessus)
    document.body.classList.add('mg-open');
    cur = { id, def, rec, root, stage, canvas, screen, scoreEl, bestEl, extra, run: null, raf: 0, score: 0 };
    // entrées
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    stage.addEventListener('pointerdown', (e) => { if (!cur || !cur.run || !cur.ready || e.target !== canvas) return; e.preventDefault(); const [x, y] = pos(e); cur.run.pointer && cur.run.pointer('down', x, y); });
    stage.addEventListener('pointermove', (e) => { if (!cur || !cur.run || !cur.ready) return; const [x, y] = pos(e); cur.run.pointer && cur.run.pointer('move', x, y, e.buttons || e.pointerType === 'mouse'); });
    showScreen('intro');
    G.audio.sfx('page');
    G.audio.minigame(true);                       // la musique des mini-jeux (data/audio.js → minigame)
  }

  function onKey(e) {
    if (!cur || G.panels.isOpen()) return;          // (un souvenir est ouvert par-dessus : c'est lui qui écoute le clavier)
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (cur.run && cur.run.key && cur.ready) { if (cur.run.key(e.key, e.type === 'keydown') !== false && e.key.startsWith('Arrow')) e.preventDefault(); }
  }
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup', onKey);
  window.addEventListener('resize', () => { if (cur && cur.run) sizeCanvas(); });

  function sizeCanvas() {
    const c = cur, r = c.stage.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    c.canvas.width = Math.round(r.width * dpr); c.canvas.height = Math.round(r.height * dpr);
    c.api.W = r.width; c.api.H = r.height; c.dpr = dpr;
  }

  function showScreen(kind, res) {
    const c = cur, def = c.def;
    c.screen.innerHTML = ''; c.screen.hidden = false;
    let expr, text, top;
    if (kind === 'intro') {
      [expr, text] = [def.introExpr || 'content', def.intro];
      top = h('p', { class: 'mg-howto', html: def.howto.split('\n').map((l) => G.rich(l)).join('<br>') });
    } else {
      [expr, text] = endMessage(def, res.score, res.record);
      top = h('div', { class: 'mg-result' }, h('span', null, 'Score'), h('strong', null, String(res.score)),
        res.record ? h('em', null, '✦ Nouveau record ! ✦') : h('small', null, 'Record : ' + c.rec.best),
        res.news && res.news.length ? h('button', { class: 'mg-souv', onclick: (e) => { e.currentTarget.classList.add('seen'); G.souvenirs.show(res.news); } },
          h('span', null, '✦'), ` ${res.news.length > 1 ? res.news.length + ' nouveaux souvenirs' : 'Nouveau souvenir'} pour l'album ! `, h('u', null, 'Le lire')) : null);
    }
    const btns = kind === 'intro'
      ? [h('button', { class: 'btn primary', onclick: start }, 'Jouer !'), h('button', { class: 'btn', onclick: close }, 'Plus tard')]
      : [h('button', { class: 'btn primary', onclick: start }, 'Rejouer'), h('button', { class: 'btn', onclick: close }, 'Quitter')];
    c.screen.append(h('div', { class: 'mg-card' }, top,
      h('div', { class: 'mg-flocon' }, h('img', { src: G.dlg.spriteSrc(expr), alt: 'Flocon' }), h('p', { class: 'mg-bubble', html: G.rich(text) })),
      h('div', { class: 'mg-actions' }, ...btns)));
    setTimeout(() => { const b = c.screen.querySelector('.btn.primary'); if (b) b.focus({ preventScroll: true }); }, 50);
  }

  function endMessage(def, score, record) {
    const m = def.msg;
    if (record && score > 0) return pick(m.record);
    if (score <= 0) return pick(m.zero);
    const [a, b, c] = def.tiers;
    return pick(score >= c ? m.high : score >= b ? m.mid : score >= a ? m.low : m.low);
  }

  function start() {
    const c = cur; if (!c) return;
    c.screen.hidden = true; c.screen.innerHTML = '';
    c.score = 0; c.scoreEl.textContent = '0'; c.extra.textContent = '';
    c.rec.plays++; G.store.save();
    let ended = false;
    const api = c.api = {
      W: 0, H: 0,
      setScore(v) { c.score = Math.max(0, Math.round(v)); c.scoreEl.textContent = String(c.score); },
      addScore(v) { api.setScore(c.score + v); },
      get score() { return c.score; },
      setExtra(t) { c.extra.textContent = t; },
      sfx(n) { G.audio.sfx(n); },
      note(f, d) { G.audio.note(f, d); },
      end(delay) {
        if (ended) return; ended = true;
        setTimeout(() => finish(), delay == null ? 700 : delay);
      }
    };
    sizeCanvas();
    c.run = c.def.create(api);
    const ctx = c.canvas.getContext('2d');
    let last = performance.now(), cd = 0, lastN = 0;        // cd : le compte à rebours « 3, 2, 1, Go ! »
    c.ready = false;
    const frame = (now) => {
      if (!cur || cur !== c || !c.run) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      cd += dt;
      const n = cd < 3 ? 3 - Math.floor(cd) : 0;
      if (n !== lastN) { lastN = n; api.note(n ? 587 : 880, n ? 0.3 : 0.6); }
      if (!c.ready && cd >= 3) c.ready = true;
      if (c.ready && (!ended || c.run.afterEnd)) c.run.update(dt, ended);
      ctx.setTransform(c.dpr, 0, 0, c.dpr, 0, 0);
      ctx.clearRect(0, 0, api.W, api.H);
      c.run.draw(ctx, api.W, api.H);
      if (cd < 3.7) {
        const label = n ? String(n) : 'Go !', p = n ? cd % 1 : (cd - 3) / 0.7;
        ctx.save();
        if (n) { ctx.fillStyle = 'rgba(10,16,36,.35)'; ctx.fillRect(0, 0, api.W, api.H); }
        ctx.globalAlpha = n ? 1 - p * 0.6 : 1 - p;
        ctx.translate(api.W / 2, api.H / 2); ctx.scale(1.4 - p * 0.4, 1.4 - p * 0.4);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 ${Math.round(Math.min(api.W, api.H) * 0.22)}px Georgia, serif`;
        ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(40,25,10,.75)'; ctx.strokeText(label, 0, 0);
        ctx.fillStyle = n ? '#fff6dc' : '#ffd96a'; ctx.fillText(label, 0, 0);
        ctx.restore();
      }
      c.raf = requestAnimationFrame(frame);
    };
    c.raf = requestAnimationFrame(frame);
    G.audio.sfx('click');
  }

  function finish() {
    const c = cur; if (!c || !c.run) return;
    cancelAnimationFrame(c.raf); c.run = null;
    const score = c.score, record = score > c.rec.best;
    if (record) { c.rec.best = score; c.bestEl.textContent = String(score); }
    G.store.save();
    const news = G.souvenirs ? G.souvenirs.afterGame(c.id, score) : [];
    if (record && score > 0) { G.audio.sfx('success'); G.fx && G.fx.confetti && G.fx.confetti(); } else G.audio.sfx('page');
    showScreen('end', { score, record, news });
  }

  function close() {
    const c = cur; if (!c) return;
    cancelAnimationFrame(c.raf); c.run = null; cur = null;
    c.root.classList.add('out'); setTimeout(() => c.root.remove(), 200);
    document.body.classList.remove('mg-open');
    G.audio.minigame(false);
    G.store.save();
  }

  /* petits effets partagés : textes qui s'envolent (« +1 ») */
  function pops() {
    const list = [];
    return {
      add(x, y, text, color) { list.push({ x, y, text, color: color || '#fff6c8', age: 0 }); },
      update(dt) { list.forEach((p) => { p.age += dt; p.y -= 40 * dt; }); for (let i = list.length - 1; i >= 0; i--) if (list[i].age > 0.9) list.splice(i, 1); },
      draw(ctx) {
        ctx.save(); ctx.textAlign = 'center'; ctx.font = '700 20px Georgia, serif';
        list.forEach((p) => { ctx.globalAlpha = Math.max(0, 1 - p.age / 0.9); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(30,20,10,.7)'; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.color; ctx.fillText(p.text, p.x, p.y); });
        ctx.restore();
      }
    };
  }
  function flake(ctx, x, y, r, rot, color) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.strokeStyle = color || '#fff'; ctx.lineWidth = Math.max(2, r / 5); ctx.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r);
      ctx.moveTo(0, -r * 0.55); ctx.lineTo(-r * 0.25, -r * 0.78); ctx.moveTo(0, -r * 0.55); ctx.lineTo(r * 0.25, -r * 0.78); ctx.stroke();
    }
    ctx.restore();
  }
  function glow(ctx, x, y, r, rgb, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  /* ======================================================================
     3. Les quatre mini-jeux
     ====================================================================== */
  const GAMES = {

    /* ------------------------------------------------ ZONE 1 · le stand de friandises */
    friandises: {
      title: "Le stand de friandises", bg: 'decor-zone1_J6.webp', bgSize: '260% auto', bgPos: '0% 72%',
      introExpr: 'amoureux',
      intro: "Le panier de Mme Cannelle s’est renversé sur le stand ! Aide-moi à tout rattraper avant que ça tombe dans la neige. Je me dévoue : c’est moi qui attrape.",
      howto: "Déplace Flocon avec le doigt ou la souris (ou les flèches ← →).\n**Biscuit** +1 · **sucre d’orge** +3.\nAttention : **3 morceaux de charbon**, et la partie est finie !",
      tiers: [50, 150, 250],
      msg: {
        zero: [['triste', "Zéro ? Ce n’est pas grave… J’avoue, j’ai peut-être mangé deux ou trois biscuits pendant que tu jouais."]],
        low: [['content', "Pas mal du tout ! Mais mon ventre est sûr que tu peux faire mieux."], ['malicieux', "Joli ! Il en reste quelques-uns par terre… Je m’en occupe. Pour la science."]],
        mid: [['fier', "Bravo ! Mme Cannelle serait fière de nous. Enfin, surtout de toi."], ['content', "Quel panier ! On a de quoi goûter pendant une semaine."]],
        high: [['emerveille', "Incroyable ! Tu es une vraie championne de la friandise !"], ['victoire', "Pas un biscuit n’a touché la neige ! Je n’en reviens pas."]],
        record: [['celebration', "Nouveau record ! Je le grave tout de suite dans ma mémoire de neige !"], ['victoire', "Nouveau record ! On mérite une médaille. En chocolat, si possible."]]
      },
      create(api) {
        const img = sprite('amoureux'), hurtImg = sprite('surpris'), fx = pops();
        let px = api.W / 2, target = px, t = 0, spawn = 0.6, lives = 3, hurt = 0, keys = { l: false, r: false };
        const items = [];
        const hearts = () => api.setExtra('❤'.repeat(lives) + '♡'.repeat(3 - lives));
        hearts();
        const size = () => Math.min(120, api.H * 0.22);
        return {
          pointer(type, x) { target = x; },
          key(k, down) { if (k === 'ArrowLeft') keys.l = down; else if (k === 'ArrowRight') keys.r = down; else return false; },
          update(dt) {
            const W = api.W, H = api.H, FS = size();
            t += dt; hurt = Math.max(0, hurt - dt);
            if (keys.l) target = px - 420 * dt * 2; if (keys.r) target = px + 420 * dt * 2;
            target = Math.max(FS * 0.4, Math.min(W - FS * 0.4, target));
            px += (target - px) * Math.min(1, dt * 14);
            spawn -= dt;
            if (spawn <= 0) {
              spawn = Math.max(0.3, 0.85 - t * 0.012);
              const r = Math.random(), coal = Math.min(0.32, 0.16 + t * 0.003);
              const type = r < coal ? 'coal' : r < coal + 0.16 ? 'cane' : 'biscuit';
              items.push({ x: rnd(26, W - 26), y: -24, type, rot: rnd(0, 6), vr: rnd(-3, 3), v: (150 + t * 6) * rnd(0.85, 1.2) });
            }
            const catchTop = H - FS * 0.95, catchBot = H - FS * 0.3;
            for (let i = items.length - 1; i >= 0; i--) {
              const it = items[i];
              it.y += it.v * dt; it.rot += it.vr * dt;
              if (it.y > catchTop && it.y < catchBot && Math.abs(it.x - px) < FS * 0.48) {
                items.splice(i, 1);
                if (it.type === 'coal') { lives--; hurt = 0.5; hearts(); api.sfx('soft_error'); fx.add(it.x, it.y, 'Ouille !', '#ffb0a0'); if (lives <= 0) api.end(900); }
                else if (it.type === 'cane') { api.addScore(3); api.sfx('magic'); fx.add(it.x, it.y, '+3', '#ffd96a'); }
                else { api.addScore(1); api.sfx('click'); fx.add(it.x, it.y, '+1'); }
              } else if (it.y > H + 30) items.splice(i, 1);
            }
            fx.update(dt);
          },
          draw(ctx, W, H) {
            const FS = size(), k = Math.max(0.9, Math.min(1.7, H / 380));
            // le comptoir du stand
            ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, H - 8, W, 8);
            items.forEach((it) => {
              ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot); ctx.scale(k, k);
              if (it.type === 'biscuit') {
                ctx.fillStyle = '#d99a4e'; ctx.strokeStyle = '#7a4a1c'; ctx.lineWidth = 2.5;
                ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, rr = k % 2 ? 9 : 17; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#fff4dc'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill();
              } else if (it.type === 'cane') {
                ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = '#fff';
                ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, -6); ctx.arc(-8, -6, 8, 0, Math.PI, true); ctx.stroke();
                ctx.lineWidth = 9; ctx.strokeStyle = '#d6332a'; ctx.setLineDash([5, 6]);
                ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(0, -6); ctx.arc(-8, -6, 8, 0, Math.PI, true); ctx.stroke(); ctx.setLineDash([]);
              } else {
                ctx.fillStyle = '#2b2b33'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(-14, -4); ctx.lineTo(-6, -14); ctx.lineTo(9, -12); ctx.lineTo(15, 2); ctx.lineTo(7, 13); ctx.lineTo(-10, 11); ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(-3, -6, 3, 0, 7); ctx.fill();
              }
              ctx.restore();
            });
            drawSprite(ctx, hurt > 0 ? hurtImg : img, px, H - 4, FS, hurt > 0 ? Math.sin(hurt * 40) * 0.12 : 0);
            fx.draw(ctx);
          }
        };
      }
    },

    /* ------------------------------------------------ ZONE 2 · les lucioles de la cascade */
    lucioles: {
      title: "Les lucioles de la cascade", bg: 'decor-foret.webp', bgSize: '230% auto', bgPos: '74% 88%', dim: 0.5,
      introExpr: 'emerveille',
      intro: "Les lucioles de la cascade adorent jouer à cache-cache. Touche-les avant qu’elles ne s’éteignent !",
      howto: "Touche les **lucioles** (+1). Les **dorées** valent **+3**.\nAttention aux **feuilles de houx** : −2 !\nTu as **30 secondes**.",
      tiers: [10, 25, 40],
      msg: {
        zero: [['decu', "Les lucioles ont été plus rapides que nous… Elles ont dû s’entraîner tout l’été."]],
        low: [['content', "Quelques lucioles attrapées ! Elles chatouillent un peu, non ?"], ['rire', "Pas mal ! Une luciole m’a fait un clin d’œil. Je crois qu’elle m’aime bien."]],
        mid: [['emerveille', "Regarde comme ça brille ! On a presque rallumé la forêt à nous deux."]],
        high: [['fier', "Tu as des réflexes de chouette ! Aucune luciole ne t’échappe."]],
        record: [['celebration', "Nouveau record ! Même les lucioles applaudissent… enfin, elles clignotent. C’est pareil."]]
      },
      create(api) {
        const DUR = 30, fx = pops();
        let t = 0, spawn = 0.3;
        const flies = [];
        api.setExtra('⏱ ' + DUR);
        const R = () => Math.max(26, Math.min(40, api.W * 0.04));
        return {
          pointer(type, x, y) {
            if (type !== 'down') return;
            const r = R() * 1.25;
            for (let i = flies.length - 1; i >= 0; i--) {
              const f = flies[i];
              if (Math.hypot(f.x - x, f.y - y) < r) {
                flies.splice(i, 1);
                if (f.kind === 'gold') { api.addScore(3); api.sfx('magic'); fx.add(f.x, f.y, '+3', '#ffd96a'); }
                else if (f.kind === 'houx') { api.addScore(-2); api.sfx('soft_error'); fx.add(f.x, f.y, '−2', '#ffb0a0'); }
                else { api.addScore(1); api.note(880 + Math.random() * 220, 0.25); fx.add(f.x, f.y, '+1'); }
                return;
              }
            }
          },
          update(dt) {
            const W = api.W, H = api.H;
            t += dt;
            api.setExtra('⏱ ' + Math.max(0, Math.ceil(DUR - t)));
            if (t >= DUR) { api.end(300); return; }
            spawn -= dt;
            if (spawn <= 0) {
              spawn = Math.max(0.26, 0.6 - t * 0.012);
              const r = Math.random(), kind = r < 0.12 ? 'gold' : r < 0.28 ? 'houx' : 'fly';
              const life = Math.max(0.85, 1.8 - t * 0.03) * (kind === 'gold' ? 0.75 : kind === 'houx' ? 1.4 : 1);
              flies.push({ x: rnd(40, W - 40), y: rnd(40, H - 40), age: 0, life, kind, ph: rnd(0, 6), vx: rnd(-30, 30), vy: rnd(-30, 30) });
            }
            for (let i = flies.length - 1; i >= 0; i--) {
              const f = flies[i]; f.age += dt; f.ph += dt * 6;
              if (f.kind !== 'houx') { f.x += (f.vx + Math.sin(f.ph) * 25) * dt; f.y += (f.vy + Math.cos(f.ph * 0.7) * 20) * dt; }
              if (f.age > f.life) flies.splice(i, 1);
            }
            fx.update(dt);
          },
          draw(ctx) {
            const r = R();
            flies.forEach((f) => {
              const a = Math.max(0, Math.min(1, f.age / 0.2, (f.life - f.age) / 0.35));
              ctx.save(); ctx.globalAlpha = a;
              if (f.kind === 'houx') {
                ctx.translate(f.x, f.y);
                ctx.fillStyle = '#2f7a43'; ctx.strokeStyle = '#163d22'; ctx.lineWidth = 2;
                [-1, 1].forEach((s) => { ctx.beginPath(); ctx.ellipse(s * r * 0.45, 0, r * 0.55, r * 0.26, s * 0.4, 0, 7); ctx.fill(); ctx.stroke(); });
                ctx.fillStyle = '#d6332a'; [[-4, -5], [4, -5], [0, 3]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx, dy, r * 0.17, 0, 7); ctx.fill(); });
              } else {
                const gold = f.kind === 'gold', tw = 0.75 + Math.sin(f.ph * 2) * 0.25;
                glow(ctx, f.x, f.y, r * (gold ? 1.6 : 1.2) * tw, gold ? '255,210,90' : '200,255,140', 0.75);
                ctx.fillStyle = gold ? '#fff2b0' : '#f4ffd0'; ctx.beginPath(); ctx.arc(f.x, f.y, r * (gold ? 0.32 : 0.24), 0, 7); ctx.fill();
                if (gold) flake(ctx, f.x, f.y, r * 0.55, f.ph * 0.3, 'rgba(255,240,180,.9)');
              }
              ctx.restore();
            });
            fx.draw(ctx);
          }
        };
      }
    },

    /* ------------------------------------------------ ZONE 3 · la glissade sur le lac gelé */
    glissade: {
      title: "La glissade du lac gelé", bg: 'decor-glace.webp', bgSize: '220% auto', bgPos: '78% 92%', dim: 0.3,
      introExpr: 'fier',
      intro: "Accroche-toi, {nom} ! Je glisse sur le lac, et toi, tu me guides entre les rochers.",
      howto: "Touche à **gauche** ou à **droite** (ou ← →) pour changer de couloir.\nÉvite les **rochers** et les **fissures**. Attrape les **flocons** : +5 !",
      tiers: [40, 100, 200],
      msg: {
        zero: [['echec', "Aïe… Le premier rocher, déjà. Ce n’est pas grave, la glace est très glissante aujourd’hui."]],
        low: [['rire', "Wouhou ! J’ai encore la tête qui tourne. On recommence ?"], ['echec', "Boum ! Ce rocher est sorti de nulle part. Je suis sûr qu’il a bougé."]],
        mid: [['fier', "Quelle glissade ! On allait plus vite que le vent."]],
        high: [['victoire', "Tu pilotes comme une reine de la glace ! Je n’ai même pas eu peur. Enfin, presque pas."]],
        record: [['celebration', "Nouveau record ! Personne n’a jamais glissé aussi loin sur ce lac. Enfin, je crois."]]
      },
      create(api) {
        const img = sprite('explore'), crash = sprite('echec'), fx = pops();
        let t = 0, dist = 0, bonus = 0, lane = 1, lx = 1, nextRow = 260, dead = false, deadT = 0, streak = 0;
        const objs = [];
        const laneX = (l) => api.W * (0.5 + (l - 1) * 0.28);
        const size = () => Math.min(110, api.H * 0.2);
        const move = (d) => { if (dead) return; lane = Math.max(0, Math.min(2, lane + d)); api.sfx('click'); };
        return {
          afterEnd: true,
          pointer(type, x) { if (type === 'down') move(x < api.W / 2 ? -1 : 1); },
          key(k, down) { if (!down) return; if (k === 'ArrowLeft') move(-1); else if (k === 'ArrowRight') move(1); else return false; },
          update(dt) {
            const H = api.H, FS = size();
            if (dead) { deadT += dt; fx.update(dt); return; }
            t += dt;
            const speed = Math.min(720, 260 + t * 13);
            dist += speed * dt; streak += speed * dt;
            lx += (lane - lx) * Math.min(1, dt * 14);
            nextRow -= speed * dt;
            if (nextRow <= 0) {
              nextRow = Math.max(150, 330 - t * 4.5);
              const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
              const blocks = t > 12 && Math.random() < 0.45 ? 2 : 1;
              for (let k = 0; k < blocks; k++) objs.push({ lane: lanes[k], y: -50, kind: Math.random() < 0.5 ? 'rock' : 'crack' });
              if (Math.random() < 0.45) objs.push({ lane: lanes[2], y: -50, kind: 'flake', rot: 0 });
            }
            const fy = H - FS * 0.55;
            for (let i = objs.length - 1; i >= 0; i--) {
              const o = objs[i]; o.y += speed * dt; if (o.rot != null) o.rot += dt * 2;
              if (o.lane === lane && Math.abs(o.y - fy) < FS * 0.42 && Math.abs(lx - lane) < 0.45) {
                if (o.kind === 'flake') { objs.splice(i, 1); bonus += 5; api.sfx('magic'); fx.add(laneX(o.lane), fy - FS * 0.5, '+5', '#dff3ff'); continue; }
                dead = true; api.sfx('soft_error'); api.end(1100); break;
              }
              if (o.y > H + 60) objs.splice(i, 1);
            }
            api.setScore(Math.floor(dist / 100) + bonus);
            fx.update(dt);
          },
          draw(ctx, W, H) {
            const FS = size();
            // traces de vitesse sur la glace
            ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
            const off = (dist * 0.9) % 90;
            for (let y = -90 + off; y < H; y += 90) [0.12, 0.36, 0.64, 0.88].forEach((fxp, k) => { ctx.beginPath(); ctx.moveTo(W * fxp, y + k * 20); ctx.lineTo(W * fxp, y + k * 20 + 34); ctx.stroke(); });
            ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.setLineDash([10, 14]);
            [0.36, 0.64].forEach((p) => { ctx.beginPath(); ctx.moveTo(W * p, 0); ctx.lineTo(W * p, H); ctx.stroke(); });
            ctx.setLineDash([]);
            const ow = Math.min(W * 0.2, 120);
            objs.forEach((o) => {
              const x = laneX(o.lane);
              if (o.kind === 'rock') {
                ctx.fillStyle = '#6f8aa6'; ctx.strokeStyle = '#2c3e55'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.ellipse(x, o.y, ow * 0.42, ow * 0.3, 0, 0, 7); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#f4f9ff'; ctx.beginPath(); ctx.ellipse(x - 4, o.y - ow * 0.14, ow * 0.3, ow * 0.13, 0, 0, 7); ctx.fill();
              } else if (o.kind === 'crack') {
                ctx.fillStyle = 'rgba(20,40,70,.35)'; ctx.beginPath(); ctx.ellipse(x, o.y, ow * 0.5, ow * 0.2, 0, 0, 7); ctx.fill();
                ctx.strokeStyle = '#1d3350'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
                ctx.beginPath(); ctx.moveTo(x - ow * 0.45, o.y); ctx.lineTo(x - ow * 0.2, o.y - 8); ctx.lineTo(x - ow * 0.05, o.y + 6); ctx.lineTo(x + ow * 0.15, o.y - 7); ctx.lineTo(x + ow * 0.45, o.y + 3);
                ctx.moveTo(x - ow * 0.05, o.y + 6); ctx.lineTo(x, o.y + 16); ctx.stroke();
              } else {
                glow(ctx, x, o.y, ow * 0.4, '220,240,255', 0.7); flake(ctx, x, o.y, ow * 0.2, o.rot, '#ffffff');
              }
            });
            drawSprite(ctx, dead ? crash : img, laneX(lx), H - 4, FS, dead ? Math.sin(deadT * 30) * 0.2 : (lane - lx) * 0.5);
            fx.draw(ctx);
          }
        };
      }
    },

    /* ------------------------------------------------ ZONE 4 · les paires du sac renversé */
    paires: {
      title: "Le sac renversé", bg: 'decor-chateau.webp', bgSize: '170% auto', bgPos: '50% 60%', dim: 0.5,
      introExpr: 'surpris',
      intro: "Oups… J’ai renversé tout le sac dans l’escalier ! Les objets de notre aventure sont tous mélangés. Tu m’aides à les retrouver deux par deux ?",
      howto: "Retourne les cartes deux par deux pour retrouver les **paires d’objets**.\nPaire trouvée : **+10**, et **+5** de plus à chaque paire trouvée d’affilée.\nTout le plateau réussi : **+20**, et un nouveau plateau arrive. Tu as **60 secondes**.",
      tiers: [70, 150, 260],
      msg: {
        zero: [['reflechit', "Hmm… Ces objets se cachent bien, hein ? On recommence doucement."]],
        low: [['content', "Pas mal ! Tu as une bonne mémoire. Meilleure que la mienne, en tout cas."], ['malicieux', "On en a retrouvé plein ! Il reste juste… mon nez ? Ah non, il est là."]],
        mid: [['emerveille', "Tous nos objets sont rangés ! Le sac n’a jamais été aussi bien organisé."]],
        high: [['fier', "Quelle mémoire ! Même Dame Plume serait impressionnée."]],
        record: [['celebration', "Nouveau record ! Plus rien ne nous échappe, à nous deux !"]]
      },
      create(api) {
        const DUR = 60, COLS = 4, ROWS = 4, fx = pops();
        const S = G.store.get();
        let pool = Object.keys(S.items || {}).filter((id) => G.data.items[id] && !G.data.items[id].image);
        if (pool.length < 8) pool = Object.keys(G.data.items).filter((id) => !G.data.items[id].image);
        const imgs = {};
        const imgOf = (id) => {
          if (!imgs[id]) {
            let svg = G.itemArt(id);
            if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            const i = new Image(); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); imgs[id] = i;
          }
          return imgs[id];
        };
        let t = 0, cards = [], open = [], lock = 0, combo = 0, boards = 0;
        const deal = () => {
          const ids = G.shuffle(pool.slice()).slice(0, 8);
          cards = G.shuffle(ids.concat(ids)).map((id, i) => ({ id, i, up: false, done: false, flip: 0 }));
          ids.forEach(imgOf);
        };
        deal();
        api.setExtra('⏱ ' + DUR);
        const layout = () => {
          const W = api.W, H = api.H, pad = Math.max(8, Math.min(W, H) * 0.022);
          const cw = Math.min((W - pad * (COLS + 1)) / COLS, ((H - pad * (ROWS + 1)) / ROWS) / 1.12);
          const ch = cw * 1.12, gw = cw * COLS + pad * (COLS - 1), gh = ch * ROWS + pad * (ROWS - 1);
          const x0 = (W - gw) / 2, y0 = (H - gh) / 2;
          return cards.map((c, k) => ({ x: x0 + (k % COLS) * (cw + pad), y: y0 + Math.floor(k / COLS) * (ch + pad), w: cw, h: ch }));
        };
        const tap = (k) => {
          const c = cards[k];
          if (!c || c.up || c.done || lock > 0 || open.length >= 2) return;
          c.up = true; open.push(c); api.sfx('click');
          if (open.length === 2) {
            const [a, b] = open;
            if (a.id === b.id) {
              a.done = b.done = true; open = [];
              const gain = 10 + combo * 5; combo++;
              api.addScore(gain); api.note(660 + combo * 60, 0.4);
              const r = layout()[b.i]; fx.add(r.x + r.w / 2, r.y + r.h / 2, '+' + gain, combo > 1 ? '#ffd96a' : '#fff6c8');
              if (cards.every((x) => x.done)) { api.addScore(20); boards++; api.sfx('magic'); fx.add(api.W / 2, api.H / 2, 'Plateau réussi ! +20', '#ffd96a'); lock = 1.1; setTimeout(() => { if (t < DUR) deal(); }, 1000); }
            } else { combo = 0; lock = 0.75; }
          }
        };
        return {
          pointer(type, x, y) {
            if (type !== 'down') return;
            layout().forEach((r, k) => { if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) tap(k); });
          },
          update(dt) {
            t += dt;
            api.setExtra('⏱ ' + Math.max(0, Math.ceil(DUR - t)));
            if (t >= DUR) { api.end(400); return; }
            if (lock > 0) { lock -= dt; if (lock <= 0) { lock = 0; open.forEach((c) => { c.up = false; }); open = []; } }
            cards.forEach((c) => { const want = c.up || c.done ? 1 : 0; c.flip += (want - c.flip) * Math.min(1, dt * 14); });
            fx.update(dt);
          },
          draw(ctx) {
            layout().forEach((r, k) => {
              const c = cards[k]; if (!c) return;
              const sx = Math.abs(Math.cos(c.flip * Math.PI)), face = c.flip > 0.5;
              ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.scale(Math.max(0.04, sx), 1);
              const w = r.w, hh = r.h, rr = Math.min(12, w * 0.12);
              ctx.beginPath(); ctx.moveTo(-w / 2 + rr, -hh / 2); ctx.arcTo(w / 2, -hh / 2, w / 2, hh / 2, rr); ctx.arcTo(w / 2, hh / 2, -w / 2, hh / 2, rr); ctx.arcTo(-w / 2, hh / 2, -w / 2, -hh / 2, rr); ctx.arcTo(-w / 2, -hh / 2, w / 2, -hh / 2, rr); ctx.closePath();
              if (face) {
                ctx.fillStyle = c.done ? '#fff3cf' : '#fffaf0'; ctx.fill();
                ctx.lineWidth = c.done ? 3 : 2; ctx.strokeStyle = c.done ? '#e0a93a' : '#c9a23a'; ctx.stroke();
                const im = imgs[c.id], s = Math.min(w, hh) * 0.72;
                if (im && im.complete) ctx.drawImage(im, -s / 2, -s / 2, s, s);
                if (c.done) { ctx.globalAlpha = 0.35; glow(ctx, 0, 0, w * 0.6, '255,217,106', 0.6); ctx.globalAlpha = 1; }
              } else {
                const gr = ctx.createLinearGradient(0, -hh / 2, 0, hh / 2); gr.addColorStop(0, '#2f4a8a'); gr.addColorStop(1, '#1d2f5c');
                ctx.fillStyle = gr; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#c9a23a'; ctx.stroke();
                flake(ctx, 0, 0, Math.min(w, hh) * 0.22, 0, 'rgba(255,240,200,.75)');
              }
              ctx.restore();
            });
            fx.draw(ctx);
          }
        };
      }
    }
  };

  G.decor = { render, open, games: GAMES };
})();
