/* ==========================================================================
   MAIN — démarrage du jeu : écran-titre, chargement de la sauvegarde, horloge
   (ouverture des lieux à la date réelle).
   ========================================================================== */
(function () {
  const G = window.Game;
  const { $, h, sleep } = G;
  const F = (expr, text) => ({ who: 'flocon', expr, text });
  const N = (text) => ({ who: 'narrator', text });
  let spotSignature = '';

  /* ---------- écran-titre ---------- */
  function buildTitle() {
    const S = G.store.get();
    const returning = S.started;
    const star = G.fx.starSVG(new Set(S.fragments.length ? S.fragments : Array.from({ length: 24 }, (_, i) => i + 1)));
    $('#title-star').append(star);
    // Au tout début, il n'y a personne : Flocon n'apparaît qu'une fois son code entré dans le sac.
    const fl = $('#title-flocon');
    fl.hidden = !G.progress.hasFlocon();
    fl.src = G.dlg.spriteSrc(returning ? 'content' : 'emerveille');
    $('#title-name').textContent = G.config.title;
    $('#title-sub').textContent = returning
      ? (S.fragments.length ? `Te revoilà ! ${S.fragments.length} fragment${S.fragments.length > 1 ? 's' : ''} de l'Étoile sur 24.` : 'Te revoilà !')
      : (G.progress.beforeStart() ? '' : "Un calendrier de l'Avent en 24 chapitres");
    const a = $('#btn-enter-sound'), b = $('#btn-enter-mute');
    a.textContent = returning ? 'Continuer avec le son' : 'Entrer avec le son';
    b.textContent = returning ? 'Continuer sans le son' : 'Entrer sans le son';
    a.addEventListener('click', () => enter(true));
    b.addEventListener('click', () => enter(false));
    $('#title-note').textContent = returning ? '' : 'Astuce : le jeu s’enregistre tout seul, tu peux le quitter à tout moment.';
  }

  async function enter(withSound) {
    const S = G.store.get();
    if (enter.done) return; enter.done = true;
    S.audio.music = withSound; S.audio.sfx = withSound;
    G.store.save();
    G.audio.init(S.audio);
    G.audio.sfx('open');
    const t = $('#title-screen');
    t.classList.add('leaving');
    await sleep(G.reduceMotion() ? 10 : 800);
    t.hidden = true;
    document.body.classList.remove('on-title');
    G.hud.refresh();
    if ($('#stage-wrap').classList.contains('scrollable') && !G.store.seen('hint:scroll')) {
      G.store.markSeen('hint:scroll');
      setTimeout(() => G.panels.toast('Astuce : fais glisser le décor pour explorer, de gauche à droite ↔', 5200), 900);
    }
    await welcome();
    clock();
  }

  /* ---------- premiers mots à l'entrée ---------- */
  async function welcome() {
    const S = G.store.get();
    if (S.view === 'map') return;
    // Avant le 1er décembre : le narrateur dit seulement qu'il n'y a rien pour l'instant (l'introduction attendra le jour J).
    if (!G.time.isUnlocked(1)) {
      const date = G.time.long(G.time.unlockDate(1));
      await G.chapter.mini((G.data.defaults.narratorBeforeStart || []).map((l) => Object.assign({}, l, { text: l.text.replace('{date}', date) })));
      G.hud.refresh();
      return;
    }
    // Au tout début : personne. Seul le narrateur parle, jusqu'à ce que le code de Flocon soit entré dans le sac.
    if (!G.progress.hasFlocon()) {
      const first = !S.started;
      if (first) {
        S.started = true;
        if (!S.zonesSeen.includes(S.zone)) { S.zonesSeen.push(S.zone); G.store.log('zone', `Arrivée : ${G.progress.zone(S.zone).name}`, null, 'zone:' + S.zone); }
        G.store.save();
      }
      await G.chapter.mini(first ? G.data.defaults.narratorIntro : G.data.defaults.narratorReminder);
      G.hud.refresh();
      return;
    }
    if (!S.started) { S.started = true; G.store.save(); }
    // Retour d'une joueuse : un petit mot si une porte l'attend
    const nd = G.progress.nextDay();
    if (!nd) return;
    const info = G.progress.spotStatus(nd);
    if (info.status === 'available' || info.status === 'started') {
      const z = G.progress.zoneOf(nd);
      const where = z.id === S.zone ? '' : ` (dans ${z.short})`;
      const txt = info.status === 'started'
        ? `Te revoilà ! On avait laissé le jour ${nd} en plan : « ${G.progress.placeOf(nd)} »${where}. On reprend ?`
        : `Te revoilà ! Le jour ${nd} nous attend : « ${G.progress.placeOf(nd)} »${where}.`;
      await G.chapter.mini([F('content', txt)]);
      if (z.id === S.zone) G.scene.scrollToSpot(nd);
    }
  }

  /* ---------- horloge : les lieux s'éveillent à la date réelle ---------- */
  function signature() {
    const z = G.progress.zone(G.store.get().zone);
    return z ? G.progress.daysOf(z).map((d) => d + G.progress.spotStatus(d).status).join('|') : '';
  }
  function clock() {
    spotSignature = signature();
    const tick = () => {
      if (document.hidden) return;
      const S = G.store.get();
      G.hud.refresh();
      if (S.view !== 'zone' || G.chapter.isActive()) return;
      const sig = signature();
      if (sig !== spotSignature) {
        const before = spotSignature;
        spotSignature = sig;
        G.scene.renderSpots();
        G.scene.playUnlockFx();
        if (before && !G.panels.isOpen()) G.panels.toast("Un nouveau lieu vient de s'éveiller dans le royaume ✦");
      }
    };
    setInterval(tick, 15000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  }

  /* ---------- démarrage ---------- */
  async function boot() {
    if (G.dev) G.dev.boot();                 // (mode développeur : date simulée mémorisée)
    const S = G.store.load();
    G.audio.setVolume(S.audio.volume);
    G.scene.init();
    G.fx.snow.start();
    G.hud.init();
    G.companion.init();
    buildTitle();
    document.body.classList.add('on-title');
    if (G.dev) G.dev.init();

    // décor de départ (derrière l'écran-titre)
    if (S.view === 'map') await G.scene.showMap({ instant: true });
    else await G.scene.showZone(S.zone, { instant: true, fx: false });
    $('#title-screen').classList.add('ready');
    G.hud.refresh();
    // préchargements discrets
    setTimeout(() => {
      G.dlg.preload();
      G.data.zones.forEach((z) => G.scene.zoneImage(z).then((u) => { const i = new Image(); i.src = u; }));
      const mi = G.data.mapImages || {}, nRev = G.data.zones.filter((z) => G.store.mapRevealed(z.id)).length;
      G.scene.probe(mi[nRev]).then((ok) => { const m = new Image(); m.src = ok ? mi[nRev] : G.data.mapImage; });
    }, 600);
  }

  window.addEventListener('DOMContentLoaded', () => {
    boot().catch((e) => {
      console.error(e);
      const n = $('#boot-error'); if (n) { n.hidden = false; n.textContent = 'Oups, le jeu n’a pas pu démarrer : ' + e.message; }
    });
  });
})();
