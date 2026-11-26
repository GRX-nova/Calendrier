/* ==========================================================================
   AUDIO — musique d'ambiance + bruitages.
   Une musique par zone (data/audio.js → zones), enchaînées en fondu quand on change de lieu.
   Sans fichier pour un lieu, tout est synthétisé : boîte à musique douce, carillons, bruits de papier.
   Rien ne démarre avant une interaction (clic sur « Entrer »).
   ========================================================================== */
(function () {
  const G = window.Game;
  const cfg = () => G.data.audio || {};
  let ctx = null, master = null, musicBus = null, sfxBus = null, delay = null;
  let musicOn = false, sfxOn = true, volume = 0.7, timer = null, nextT = 0, step = 0, mood = 'calm';
  let sceneKey = null, finaleMode = false, puzzleMode = false, gameMode = false, bsMode = false, usingSynth = false, noVolume = false, fadeTimer = null;
  const tracks = {};                 // clé de piste → { key, el (<audio>), fade (0..1), target }
  const FADE = 1.8;                  // durée du fondu enchaîné entre deux musiques (secondes)

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    // petite réverbération en écho doux
    delay = ctx.createDelay(1);
    delay.delayTime.value = 0.34;
    const fb = ctx.createGain(); fb.gain.value = 0.34;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
    musicBus.connect(master); musicBus.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(master);
    sfxBus.connect(master); sfxBus.connect(delay);
    master.connect(ctx.destination);
    applyGains();
    return ctx;
  }
  function applyGains() {
    if (!ctx) return;
    master.gain.value = volume;
    musicBus.gain.value = musicOn ? 0.5 : 0;
    sfxBus.gain.value = sfxOn ? 0.85 : 0;
  }

  /* ---------- synthèse ---------- */
  function tone(f, t, dur, o) {
    o = o || {};
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    const a = o.attack || 0.01, peak = o.gain == null ? 0.2 : o.gain;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.dest || sfxBus);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function bell(f, t, dur, gain, dest) {
    tone(f, t, dur, { type: 'sine', gain, dest });
    tone(f * 2.01, t, dur * 0.6, { type: 'sine', gain: gain * 0.35, dest });
    tone(f * 3.98, t, dur * 0.3, { type: 'sine', gain: gain * 0.12, dest });
  }
  function noise(t, dur, gain, freq) {
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 2400; f.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(sfxBus); src.start(t);
  }

  const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5 };
  const SFX = {
    click(t) { tone(900, t, 0.06, { gain: 0.08, type: 'triangle' }); },
    open(t) { bell(N.E5, t, 0.5, 0.12); bell(N.B4 * 2, t + 0.09, 0.6, 0.1); },
    magic(t) { [N.C5, N.E5, N.G5, N.C6, N.E6].forEach((f, i) => bell(f, t + i * 0.07, 0.7, 0.07)); },
    acquire(t) { [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => bell(f, t + i * 0.11, 0.9, 0.12)); bell(N.E6, t + 0.5, 1.2, 0.07); },
    unlock(t) { bell(N.G4, t, 0.6, 0.12); bell(N.D5, t + 0.12, 0.7, 0.12); bell(N.G5, t + 0.26, 1, 0.1); noise(t, 0.4, 0.015, 5000); },
    success(t) { [N.C5, N.E5, N.G5].forEach((f) => bell(f, t, 1.1, 0.1)); bell(N.C6, t + 0.2, 1.3, 0.08); },
    soft_error(t) { tone(250, t, 0.22, { type: 'sine', gain: 0.07, slide: 190 }); },
    page(t) { noise(t, 0.16, 0.05, 3000); },
    star(t) { [N.G5, N.C6, N.E6].forEach((f, i) => bell(f, t + i * 0.08, 0.8, 0.07)); },
    // (replis synthétisés si les fichiers de data/audio.js → sfx manquent)
    solved(t) { SFX.success(t); },
    zone(t) { SFX.magic(t); SFX.star(t + 0.5); }
  };

  /* ---------- musique de boîte à musique (3/4, do majeur) ---------- */
  const CHORDS = [[130.81, 0, 4, 7], [110, 0, 3, 7], [87.31, 0, 4, 7], [98, 0, 4, 7]]; // C, Am, F, G (graves)
  const PENTA = [N.C5, N.D5, N.E5, N.G5, N.A5, N.C6];
  const semis = (f, s) => f * Math.pow(2, s / 12);
  function playStep(st, t) {
    const bar = Math.floor(st / 6), pos = st % 6, ch = CHORDS[bar % 4];
    const root = ch[0] * 2;
    const arp = [0, 1, 2, 3, 2, 1];
    const iv = [ch[1], ch[2], ch[3], 12 + ch[1]][arp[pos] % 4];
    const g = mood === 'tense' ? 0.05 : 0.07;
    tone(semis(root, iv), t, 1.6, { type: 'triangle', gain: g, dest: musicBus });
    if (pos === 0) tone(ch[0], t, 2.2, { type: 'sine', gain: 0.1, dest: musicBus });
    if ((bar % 2 === 1) && (pos === 0 || pos === 3) && Math.random() < 0.75) {
      const f = PENTA[Math.floor(Math.random() * PENTA.length)];
      bell(f, t + 0.02, 1.8, 0.05, musicBus);
    }
  }
  function schedule() {
    if (!ctx || !musicOn || !usingSynth) return;
    const eighth = 0.48;
    while (nextT < ctx.currentTime + 0.7) { playStep(step, nextT); nextT += eighth; step++; }
  }
  function startSynth() {
    if (!ctx || timer) return;
    nextT = ctx.currentTime + 0.1; step = 0;
    timer = setInterval(schedule, 160);
  }
  function stopSynth() { clearInterval(timer); timer = null; }

  /* ---------- fichiers fournis : une piste par lieu ---------- */
  const TRACK_VOL = 0.6;             // niveau d'une piste par rapport au volume général (les pistes sont égalisées à -16 LUFS)
  function trackSrc(key) {
    const c = cfg();
    if (key === 'finale') return c.finale || null;
    if (key === 'music') return c.music || null;
    if (key === 'enigme') return c.puzzle || null;
    if (key === 'minijeu') return c.minigame || null;
    if (key === 'grandpoint') return c.brainstorm || null;
    return (c.zones || {})[key] || null;
  }
  /** La piste (créée à la demande : seul le morceau du lieu en cours est téléchargé). */
  function getTrack(key) {
    if (!key) return null;
    if (tracks[key]) return tracks[key].bad ? null : tracks[key];
    const src = trackSrc(key); if (!src) return null;
    const el = new Audio();
    el.loop = true; el.preload = 'auto'; el.volume = 0; el.src = src;
    const t = { key, el, fade: 0, target: 0, bad: false };
    el.addEventListener('error', () => { t.bad = true; sync(); });         // fichier introuvable → boîte à musique synthétisée
    tracks[key] = t;
    return t;
  }
  /** Quelle piste doit jouer maintenant ? (null → synthèse) */
  function wantedTrack() {
    if (finaleMode) { const f = getTrack('finale'); if (f) return f; }
    if (bsMode) { const b = getTrack('grandpoint'); if (b) return b; }     // (pendant le grand point avec Flocon)
    if (gameMode) { const m = getTrack('minijeu'); if (m) return m; }     // (pendant un mini-jeu de Flocon)
    if (puzzleMode) { const p = getTrack('enigme'); if (p) return p; }   // (pendant une énigme : sa musique à elle, puis retour au fondu vers celle du lieu)
    return getTrack(sceneKey) || getTrack(String(sceneKey || '').replace(/_apres$/, '')) || getTrack('music');
  }
  function applyTrackVolumes() {
    Object.values(tracks).forEach((t) => { if (!noVolume) t.el.volume = G.clamp(volume * TRACK_VOL * t.fade * duck, 0, 1); });
  }
  /* ---------- la musique baisse pendant certains bruitages (data/audio.js → duck) ---------- */
  let duck = 1, duckTarget = 1, duckTimer = null;
  function duckTo(v) {
    duckTarget = v;
    if (duckTimer) return;
    duckTimer = setInterval(() => {
      const step = duckTarget < duck ? 0.12 : 0.04;              // (descend vite, remonte doucement)
      duck = duckTarget < duck ? Math.max(duckTarget, duck - step) : Math.min(duckTarget, duck + step);
      applyTrackVolumes();
      if (duck === duckTarget) { clearInterval(duckTimer); duckTimer = null; }
    }, 60);
  }
  /* ---------- bruitages en fichiers ----------
     Sur iPhone / iPad, un son qui démarre « plus tard » (après une animation, une vérification…) est refusé,
     sauf si ce même lecteur a déjà joué une fois pendant un geste. On prépare donc, au clic « Entrer »,
     deux lecteurs déverrouillés par bruitage, qu'on réutilise ensuite (jamais de copie : une copie serait verrouillée). */
  const POOL = 2;
  const sfxPool = {};                // nom → [<audio>, …]
  function poolFor(name) {
    const file = (cfg().sfx || {})[name]; if (!file) return null;
    if (!sfxPool[name]) sfxPool[name] = Array.from({ length: name === 'voice' ? 1 : POOL }, () => {
      const a = new Audio(); a.preload = 'auto'; a.src = file; a.bad = false;
      a.addEventListener('error', () => { a.bad = true; });
      return a;
    });
    return sfxPool[name].some((a) => !a.bad) ? sfxPool[name] : null;
  }
  /** Déverrouille tous les lecteurs de bruitages (doit être appelé pendant un clic ou un toucher). */
  let unlocked = false;
  function unlockSfx() {
    if (unlocked) return; unlocked = true;
    Object.keys(cfg().sfx || {}).forEach((name) => (poolFor(name) || []).forEach((a) => {
      try {
        a.muted = true;
        const pr = a.play();
        const back = () => { a.pause(); try { a.currentTime = 0; } catch (e) { /* ok */ } a.muted = false; };
        if (pr && pr.then) pr.then(back, () => { a.muted = false; unlocked = false; }); else back();
      } catch (e) { a.muted = false; }
    }));
  }
  document.addEventListener('pointerdown', unlockSfx, true);   // (filet de sécurité : au premier toucher, si « Entrer » n'a pas suffi)
  function playFile(name) {
    const pool = poolFor(name); if (!pool) return false;
    const a = pool.find((x) => !x.bad && (x.paused || x.ended)) || pool.find((x) => !x.bad);
    try {
      a.pause(); a.currentTime = 0; a.muted = false;
      if (!noVolume) a.volume = G.clamp(volume, 0, 1);
      const d = (cfg().duck || {})[name];
      if (d != null && musicOn) { duckTo(d); const up = () => { duckTo(1); a.removeEventListener('ended', up); }; a.addEventListener('ended', up); }
      const pr = a.play();
      if (pr && pr.catch) pr.catch(() => { duckTo(1); synth(name); });   // (refusé malgré tout → bruitage synthétisé)
      return true;
    } catch (e) { return false; }
  }
  function synth(name) {
    if (!ctx || ctx.state === 'closed') return;
    if (ctx.state === 'suspended') ctx.resume();
    const fn = SFX[name];
    if (fn) fn(ctx.currentTime + 0.01);
  }
  /* ---------- le petit babillage des dialogues : il joue pendant que la réplique s'écrit ---------- */
  let voiceTimer = null;
  function voice(on) {
    const pool = sfxOn ? poolFor('voice') : null;
    const a = pool && pool[0];
    clearTimeout(voiceTimer);
    if (!a || a.bad) return;
    if (!on) { voiceTimer = setTimeout(() => a.pause(), 60); return; }
    try {
      if (!noVolume) a.volume = G.clamp(volume, 0, 1);
      a.loop = true;
      const dur = isFinite(a.duration) ? a.duration : 0;
      if (a.paused && dur > 3) a.currentTime = Math.random() * (dur - 3);   // (chaque réplique démarre ailleurs : jamais la même ritournelle)
      const pr = a.play(); if (pr && pr.catch) pr.catch(() => { });
    } catch (e) { /* ok */ }
  }
  function fadeTick() {
    const step = 0.06 / (musicOn ? FADE : 0.4);
    let busy = false;
    Object.values(tracks).forEach((t) => {
      if (noVolume) t.fade = t.target;                                      // (iPhone : le volume d'un <audio> n'est pas réglable → coupure nette)
      else if (t.fade < t.target) t.fade = Math.min(t.target, t.fade + step);
      else if (t.fade > t.target) t.fade = Math.max(t.target, t.fade - step);
      if (t.fade !== t.target) busy = true;
      else if (t.target === 0 && !t.el.paused) t.el.pause();
    });
    applyTrackVolumes();
    if (!busy) { clearInterval(fadeTimer); fadeTimer = null; }
  }
  /** Aligne ce qui joue sur ce qui doit jouer : fondu entre les pistes, ou synthèse si aucun fichier. */
  function sync() {
    const want = musicOn ? wantedTrack() : null;
    usingSynth = musicOn && !want;
    if (usingSynth) startSynth(); else stopSynth();
    Object.values(tracks).forEach((t) => { t.target = (t === want && !document.hidden) ? 1 : 0; });
    if (want && !document.hidden && want.el.paused) {
      const pr = want.el.play();
      if (pr && pr.catch) pr.catch((e) => { if (e && e.name === 'NotSupportedError') { want.bad = true; sync(); } /* sinon : lecture refusée avant un geste, on réessaie au prochain */ });
    }
    if (!fadeTimer) fadeTimer = setInterval(fadeTick, 60);
  }

  /* ---------- API ---------- */
  const api = {
    /** À appeler depuis un geste utilisateur (clic « Entrer »). */
    init(settings) {
      if (settings) { musicOn = !!settings.music; sfxOn = !!settings.sfx; volume = settings.volume == null ? 0.7 : settings.volume; }
      // iPhone : sans ceci, les sons synthétisés se taisent quand le bouton « silencieux » est activé (la musique, elle, joue).
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* ok */ }
      ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      try { const probe = new Audio(); probe.volume = 0.5; noVolume = Math.abs(probe.volume - 0.5) > 0.01; } catch (e) { /* ok */ }
      unlockSfx();                                                  // (bruitages fournis : préchargés et déverrouillés pendant ce clic)
      applyGains();
      api.refreshMusic();
    },
    refreshMusic() { sync(); },
    /** Le lieu où l'on se trouve : « village », « foret », « glace », « chateau », « chateau_apres »… (voir data/audio.js). */
    setScene(key) { if (key === sceneKey) return; sceneKey = key; sync(); },
    setMusic(on) { musicOn = !!on; if (ctx) { ensure(); if (ctx.state === 'suspended') ctx.resume(); applyGains(); } sync(); },
    setSfx(on) { sfxOn = !!on; applyGains(); if (!on) voice(false); },
    setVolume(v) { volume = G.clamp(v, 0, 1); applyGains(); applyTrackVolumes(); },
    isMusic: () => musicOn,
    isSfx: () => sfxOn,
    getVolume: () => volume,
    mood(m) { mood = m; },
    /** Bascule vers la musique du final (fichier `finale` si fourni ; sinon la musique du lieu continue). */
    finale(on) { finaleMode = !!on; sync(); },
    /** Musique des énigmes (data/audio.js → puzzle) : fondu enchaîné vers elle quand une énigme s'ouvre, et retour à la musique du lieu quand elle se ferme. */
    puzzle(on) {
      on = !!on; if (on === puzzleMode) return;
      puzzleMode = on;
      if (on) { const t = getTrack('enigme'); if (t && t.fade === 0 && t.el.paused) { try { t.el.currentTime = 0; } catch (e) { /* ok */ } } }
      sync();
    },
    /** Musique du grand point avec Flocon (data/audio.js → brainstorm). */
    brainstorm(on) {
      on = !!on; if (on === bsMode) return;
      bsMode = on;
      if (on) { const t = getTrack('grandpoint'); if (t && t.fade === 0) { try { t.el.currentTime = 0; } catch (e) { /* ok */ } } }
      sync();
    },
    /** Musique des mini-jeux (data/audio.js → minigame) : elle repart du début à chaque ouverture du jeu. */
    minigame(on) {
      on = !!on; if (on === gameMode) return;
      gameMode = on;
      if (on) { const t = getTrack('minijeu'); if (t && t.fade === 0) { try { t.el.currentTime = 0; } catch (e) { /* ok */ } } }
      sync();
    },
    /** Une note de cloche (mini-jeux) : fréquence en Hz, durée en secondes. */
    note(f, dur) {
      if (!sfxOn) return;
      const c = ensure(); if (!c) return;
      if (c.state === 'suspended') c.resume();
      bell(f, c.currentTime + 0.01, dur || 0.5, 0.2);
    },
    sfx(name) {
      if (!sfxOn) return;
      if (playFile(name)) return;
      synth(name);
    },
    /** Babillage des dialogues (data/audio.js → sfx.voice) : true quand une réplique commence à s'écrire, false quand elle est écrite. */
    voice,
    unlock: unlockSfx
  };
  G.audio = api;

  // En arrière-plan (onglet ou appli masqués) : la musique se met en pause, et reprend au retour.
  document.addEventListener('visibilitychange', () => { if (document.hidden) Object.values(tracks).forEach((t) => t.el.pause()); sync(); });

  // Petit bruit de clic sur tous les boutons (discret)
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button, .btn');
    if (b && !b.dataset.nosound) api.sfx('click');
  }, true);
})();
