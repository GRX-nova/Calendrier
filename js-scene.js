/* ==========================================================================
   SCENE — décors illustrés, lieux cliquables (transparents), carte générale, transitions.
   Les illustrations sont des images de fond ; les lieux sont des zones cliquables
   positionnées en pourcentage, donc toujours calées quelle que soit la taille d'écran.
   ========================================================================== */
(function () {
  const G = window.Game;
  const { $, h, sleep } = G;
  const [IW, IH] = G.config.stageSize;
  let activeBg = 'a', currentImage = '', bgToken = 0, titleTimer = null;
  let sweepTimer = null;

  const pct = (v, total) => (v / total * 100).toFixed(3) + '%';

  /* ---------- mise en page : le décor garde son format 16:9 ---------- */
  function layout() {
    const wrap = $('#stage-wrap'), st = $('#stage');
    const W = window.innerWidth, H = window.innerHeight, ar = IW / IH;
    let w, hh;
    if (W < H) { hh = H; w = H * ar; }                 // téléphone en portrait : on défile horizontalement
    else if (W / H >= ar) { hh = H; w = H * ar; }      // écran large : bandes sur les côtés
    else { w = W; hh = W / ar; }                        // écran plus carré : bandes en haut/bas
    st.style.width = Math.round(w) + 'px';
    st.style.height = Math.round(hh) + 'px';
    const scrollable = w > W + 2;
    wrap.classList.toggle('scrollable', scrollable);
    document.body.classList.toggle('portrait', W < H);
    if (!layout.done && scrollable) wrap.scrollLeft = (w - W) / 2;
    layout.done = true;
  }

  /* ---------- fond (fondu enchaîné) ---------- */
  function setBackground(url, instant) {
    const my = ++bgToken;
    return new Promise((resolve) => {
      if (url === currentImage) { resolve(); return; }
      const img = new Image();
      const apply = () => {
        if (my !== bgToken) { resolve(); return; }
        const next = activeBg === 'a' ? 'b' : 'a';
        const nx = $('#bg-' + next), cur = $('#bg-' + activeBg);
        nx.style.backgroundImage = `url("${url}")`;
        $('#backdrop').style.backgroundImage = `url("${url}")`;
        if (instant) nx.classList.add('instant');
        nx.classList.add('on'); cur.classList.remove('on');
        if (instant) setTimeout(() => nx.classList.remove('instant'), 50);
        activeBg = next; currentImage = url;
        setTimeout(resolve, instant ? 0 : 700);
      };
      img.onload = apply; img.onerror = apply;
      img.src = url;
    });
  }

  /* ---------- images facultatives : on vérifie une fois qu'elles existent (sinon : image de repli) ---------- */
  const probes = new Map();          // url → Promise<boolean>
  const known = new Map();           // url → boolean (une fois la vérification faite)
  function probe(url) {
    if (!url) return Promise.resolve(false);
    if (!probes.has(url)) probes.set(url, new Promise((res) => {
      const i = new Image();
      i.onload = () => { known.set(url, true); res(true); };
      i.onerror = () => { known.set(url, false); res(false); };
      i.src = url;
    }));
    return probes.get(url);
  }
  /* ---------- le décor d'un lieu (data/days.js → scene / sceneLocked) : affiché pendant son chapitre ---------- */
  let placeOn = false;
  async function showPlace(url) {
    if (!url) return;
    placeOn = true;
    $('#stage').classList.add('in-place');
    const wrap = $('#stage-wrap');
    if (wrap && wrap.classList.contains('scrollable')) wrap.scrollTo({ left: (wrap.scrollWidth - wrap.clientWidth) / 2, behavior: 'smooth' });
    if (!(await probe(url)) || !placeOn) return;
    await setBackground(url);
  }
  /** Retour au décor de la zone (le fondu est fait par refreshMood). */
  function leavePlace() {
    if (!placeOn) return;
    placeOn = false;
    $('#stage').classList.remove('in-place');
    refreshMood();
  }

  /** La zone a-t-elle des décors d'avancée réellement présents ? (alors pas d'étoile sur les lieux terminés) */
  const hasProgressArt = (z) => !!(z && z.progressImages && z.progressImages.some((u) => known.get(u) === true));

  /* ---------- lieux d'une zone ---------- */
  function renderSpots() {
    const S = G.store.get();
    const z = G.progress.zone(S.zone);
    const box = $('#hotspots');
    box.innerHTML = '';
    if (!z) return;
    if (G.decor) G.decor.render(box, z);          // le décor cliquable (data/decor.js), sous les lieux des jours
    G.progress.daysOf(z).forEach((day) => {
      const sp = z.spots[day]; if (!sp) return;
      const [x, y, w, hh] = sp.rect;
      const info = G.progress.spotStatus(day);
      const locked = info.status === 'locked';
      const label = locked ? `Jour ${day}` : `Jour ${day} · ${sp.place}`;
      const b = h('button', {
        class: `spot st-${info.status}` + (locked ? ` lock-${info.reason}` : '') + ((x + w / 2) / IW > 0.86 ? ' edge-r' : (x + w / 2) / IW < 0.12 ? ' edge-l' : ''),
        style: { left: pct(x, IW), top: pct(y, IH), width: pct(w, IW), height: pct(hh, IH) },
        dataset: { day },
        'aria-label': locked ? `Jour ${day} (verrouillé)` : `Jour ${day} : ${sp.place}` + (info.status === 'done' ? ' (terminé)' : ''),
        onclick: () => G.chapter.onSpot(day)
      },
        h('span', { class: 'spot-fx' }),
        h('span', { class: 'spot-label' }, label),
        info.status === 'done' && !hasProgressArt(z) ? h('span', { class: 'spot-badge', html: G.icons.star }) : null
      );
      box.append(b);
    });
  }

  const spotEl = (day) => $(`.spot[data-day="${day}"]`);
  function spotCenter(day) {
    const el = spotEl(day); if (!el) return G.fx.center();
    return G.fx.centerOf(el);
  }
  function scrollToSpot(day) {
    const wrap = $('#stage-wrap'), el = spotEl(day);
    if (!el || !wrap.classList.contains('scrollable')) return;
    const r = el.getBoundingClientRect();
    wrap.scrollTo({ left: wrap.scrollLeft + r.left + r.width / 2 - window.innerWidth / 2, behavior: 'smooth' });
  }

  /** Éveil magique des lieux qui viennent de s'ouvrir (une seule fois par jour). */
  function playUnlockFx() {
    const S = G.store.get();
    const z = G.progress.zone(S.zone); if (!z) return;
    let any = false;
    G.progress.daysOf(z).forEach((day) => {
      const st = G.progress.spotStatus(day).status;
      if ((st === 'available' || st === 'started') && !S.unlockedSeen[day]) {
        S.unlockedSeen[day] = true; any = true;
        const el = spotEl(day); if (!el) return;
        el.classList.add('awaken');
        setTimeout(() => el.classList.remove('awaken'), 2600);
        const c = G.fx.centerOf(el);
        setTimeout(() => { G.fx.ring(c.x, c.y, 'gold'); G.fx.sparkles(c.x, c.y, 14, { spread: 80 }); }, 400 + Math.random() * 400);
      }
    });
    if (any) { G.store.save(); setTimeout(() => G.audio.sfx('unlock'), 450); }
  }

  /** Le décor d'une zone : le château a un second décor, une fois l'Étoile reconstituée ;
      le village s'allume au fil des chapitres terminés (progressImages : on prend la plus avancée qui existe). */
  async function zoneImage(z) {
    if (z.imageAfter && G.store.get().finaleSeen) return z.imageAfter;
    if (z.imageBefore && !G.store.isDone(z.imageBefore.until) && await probe(z.imageBefore.src)) return z.imageBefore.src;   // (ex. la cheminée froide jusqu'au jour 23)
    const n = z.progressImages ? G.progress.zoneDoneCount(z) : 0;
    for (let k = Math.min(n, z.progressImages ? z.progressImages.length : 0); k >= 1; k--) {
      if (await probe(z.progressImages[k - 1])) return z.progressImages[k - 1];
    }
    if (z.progressImages) z.progressImages.forEach(probe);          // (pour savoir s'il faut encore les étoiles sur les portes)
    return z.image;
  }
  /** La piste musicale du lieu : la zone en cours (le château a une seconde musique après la reconstruction). */
  function musicKey() {
    const S = G.store.get(), z = G.progress.zone(S.zone);
    if (!z) return null;
    return (z.imageAfter && S.finaleSeen) ? z.key + '_apres' : z.key;
  }

  /* ---------- humeur du décor (château éteint → restauré) ---------- */
  function refreshMood() {
    const st = $('#stage');
    const z = G.progress.zone(G.store.get().zone);
    G.audio.setScene(musicKey());
    if (z && G.store.get().view === 'zone' && !placeOn) zoneImage(z).then((u) => { if (!placeOn && G.store.get().view === 'zone' && G.store.get().zone === z.id) setBackground(u); });   // (le village s'allume, le château s'éclaire : fondu vers le nouveau décor)
    st.dataset.zone = z ? z.id : '';
    const magic = G.progress.castleMagic();
    st.style.setProperty('--dim', (1 - magic).toFixed(3));
    st.classList.toggle('restored', !!G.store.get().finaleSeen);
    $('#star-glow').hidden = !G.store.get().finaleSeen || !z || z.id !== 4 || G.store.get().view !== 'zone' || !!z.imageAfter;   // (le décor « après » brille déjà : le halo artificiel n'est qu'un repli)
  }

  /* ---------- affichage d'une zone ---------- */
  async function showZone(id, o) {
    o = o || {};
    const S = G.store.get();
    const z = G.progress.zone(id);
    S.zone = id; S.view = 'zone'; G.store.save();
    $('#map-layer').hidden = true; $('#hotspots').hidden = false;
    $('#app').dataset.view = 'zone';
    const snowLevel = { 1: 1, 2: 0.85, 3: 1.15, 4: 0.45 }[id] || 1;
    G.fx.snow.setIntensity(snowLevel);
    G.audio.mood(id === 4 ? 'tense' : 'calm');
    await setBackground(await zoneImage(z), o.instant);
    renderSpots(); refreshMood();
    G.hud.refresh();
    if (o.fx !== false) setTimeout(playUnlockFx, 500);
    const nd = G.progress.nextDay();
    if (nd && G.progress.zoneOf(nd) && G.progress.zoneOf(nd).id === id) setTimeout(() => scrollToSpot(nd), 300);
    if (!o.instant && G.companion) G.companion.onView('zone');
  }

  /* ---------- carte générale ---------- */
  // Nuage de fumée posé sur le panneau-titre d'une zone pas encore découverte : son nom reste secret.
  const PUFFS = [[14, 32, 40], [37, 28, 42], [60, 30, 42], [84, 32, 40], [10, 62, 38], [30, 70, 42], [52, 72, 42], [74, 70, 42], [92, 62, 38], [50, 50, 56], [24, 50, 40], [76, 50, 40]];
  function smokeEl(z) {
    const [x, y, w, hh] = z.map.sign, ex = w * 0.13, ey = hh * 0.2;
    const box = h('div', {
      class: 'map-smoke', 'aria-hidden': 'true', dataset: { zone: z.id },
      style: { left: pct(x - ex, IW), top: pct(y - ey, IH), width: pct(w + 2 * ex, IW), height: pct(hh + 2 * ey, IH) }
    });
    PUFFS.forEach(([px, py, ps], i) => {
      const a = (i * 2.399 + z.id) % 6.283;
      box.append(h('i', { style: { '--x': px + '%', '--y': py + '%', '--s': ps + '%', '--d': -((i * 0.83 + z.id) % 7).toFixed(2) + 's', '--ex': Math.round(Math.cos(a) * 150) + '%', '--ey': Math.round(Math.sin(a) * 120 - 40) + '%', '--ld': (i % 4) * 0.08 + 's' } }));
    });
    return box;
  }
  /** Dissipe les nuages des zones qui viennent d'être découvertes (une seule fois). */
  async function liftSmoke(list) {
    if (!list.length) return;
    await sleep(700);
    if (mapArt) {                                   // cartes d'avancée : fondu vers la carte où la nouvelle région apparaît
      list.forEach(([z]) => G.store.revealOnMap(z.id));
      const next = await mapImageFor(revealedCount());
      setBackground(next.url);
      await sleep(350);
      list.forEach(([z]) => {
        const [x, y, w, hh] = z.map.sign || z.map.rect, st = $('#stage').getBoundingClientRect();
        const cx = st.left + (x + w / 2) / IW * st.width, cy = st.top + (y + hh / 2) / IH * st.height;
        G.fx.sparkles(cx, cy, 26, { spread: 140 }); G.fx.ring(cx, cy, 'gold');
      });
      G.audio.sfx('magic');
      await sleep(1300);
      return;
    }
    for (const [z, el] of list) {
      el.classList.add('lift');
      const c = G.fx.centerOf(el); G.fx.sparkles(c.x, c.y, 20, { spread: 120 });
      G.audio.sfx('magic');
      G.store.revealOnMap(z.id);
      setTimeout(() => el.remove(), 1900);
    }
    await sleep(1500);
  }

  /* La carte qui change avec l'avancée (data/zones.js → mapImages, indexées par le nombre de régions découvertes). */
  const revealedCount = () => G.data.zones.filter((z) => G.store.mapRevealed(z.id)).length;
  async function mapImageFor(n) {
    const m = G.data.mapImages || {};
    for (let k = n; k >= 1; k--) { if (m[k] && await probe(m[k])) return { url: m[k], art: true }; }
    return { url: G.data.mapImage, art: false };
  }
  let mapArt = false;                 // true : les cartes d'avancée existent → pas de nuages

  function renderMap() {
    const S = G.store.get();
    const layer = $('#map-layer');
    layer.querySelectorAll('.region, .map-smoke').forEach((n) => n.remove());
    const lifting = [];
    G.data.zones.forEach((z) => {
      const [x, y, w, hh] = z.map.rect;
      const unlocked = G.store.zoneUnlocked(z.id), done = G.progress.zoneDone(z), cur = S.zone === z.id;
      const b = h('button', {
        class: 'region' + (unlocked ? ' open' : ' locked') + (done ? ' done' : '') + (cur ? ' current' : ''),
        style: { left: pct(x, IW), top: pct(y, IH), width: pct(w, IW), height: pct(hh, IH) },
        'aria-label': unlocked ? z.name : 'Région inconnue (pas encore découverte)',
        onclick: () => G.chapter.goZone(z.id)
      }, h('span', { class: 'region-fx' }));
      layer.append(b);
      if (z.map.sign && !G.store.mapRevealed(z.id)) {
        if (mapArt) { if (unlocked) lifting.push([z, null]); }          // (la nouvelle carte se dévoilera en fondu)
        else {
          const sm = smokeEl(z);
          layer.append(sm);
          if (unlocked) lifting.push([z, sm]);
        }
      }
    });
    placeMapFlocon(S.zone);
    return lifting;
  }
  function placeMapFlocon(zoneId) {
    const z = G.progress.zone(zoneId);
    const f = $('#map-flocon');
    f.hidden = !G.progress.hasFlocon();
    f.style.left = pct(z.map.anchor[0], IW); f.style.top = pct(z.map.anchor[1], IH);
  }
  async function showMap(o) {
    o = o || {};
    const S = G.store.get();
    S.view = 'map'; G.store.save();
    $('#hotspots').hidden = true; $('#star-glow').hidden = true;
    $('#app').dataset.view = 'map';
    G.fx.snow.setIntensity(0.8);
    G.audio.mood('calm');
    G.audio.setScene(musicKey());                         // (sur la carte, la musique de la zone où l'on se trouve continue)
    const cur = await mapImageFor(revealedCount());
    mapArt = cur.art;
    await setBackground(cur.url, o.instant);
    $('#stage').dataset.zone = 'map';
    $('#stage').style.setProperty('--dim', 0);
    const lifting = renderMap();
    $('#map-layer').hidden = false;
    G.hud.refresh();
    if (!o.instant) { await liftSmoke(lifting); if (G.companion && !o.quiet) G.companion.onView('map'); }
    else if (lifting.length) {
      lifting.forEach(([z, el]) => { if (el) el.remove(); G.store.revealOnMap(z.id); });
      if (mapArt) setBackground((await mapImageFor(revealedCount())).url, true);
    }
  }

  /* ---------- voyage d'une zone à la suivante ---------- */
  async function travel(fromId, toId) {
    const S = G.store.get();
    await showMap({ quiet: true });        // (les nuages qui cachaient le panneau de la nouvelle zone se dissipent)
    $('#map-flocon').classList.remove('hidden');
    placeMapFlocon(fromId);
    await sleep(600);
    // des flocons traversent l'écran
    const sweep = $('#sweep'); sweep.hidden = false; sweep.classList.remove('run'); void sweep.offsetWidth; sweep.classList.add('run');
    G.fx.snow.setIntensity(3);
    if (!S.zonesSeen.includes(toId)) G.audio.sfx('zone');    // découverte d'une nouvelle zone (data/audio.js → sfx.zone)
    else G.audio.sfx('magic');
    const f = $('#map-flocon'), to = G.progress.zone(toId);
    f.classList.add('walking');
    await sleep(120);
    placeMapFlocon(toId);
    await sleep(3000);
    f.classList.remove('walking');
    await sleep(300);
    G.fx.snow.setIntensity(1);
    sweep.hidden = true;
    S.zone = toId; G.store.save();
    await showZone(toId, { fx: false });
    zoneTitle(to);
    await sleep(900);
  }

  /** Bandeau de titre à l'arrivée dans une zone. */
  function zoneTitle(z) {
    const t = $('#zone-title');
    t.innerHTML = '';
    t.append(h('small', null, 'Zone ' + z.id), h('strong', null, z.name));
    t.hidden = false; t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
    clearTimeout(titleTimer);
    titleTimer = setTimeout(() => { t.classList.remove('show'); setTimeout(() => { t.hidden = true; }, 700); }, 3000);
    G.audio.sfx('page');
  }

  function init() {
    layout();
    window.addEventListener('resize', layout);
    window.addEventListener('orientationchange', () => setTimeout(layout, 200));
  }

  G.scene = { probe, zoneImage, showPlace, leavePlace, init, layout, showZone, showMap, renderSpots, renderMap, refreshMood, spotEl, spotCenter, scrollToSpot, playUnlockFx, travel, zoneTitle, setBackground };
})();
