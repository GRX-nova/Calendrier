/* ==========================================================================
   SOUVENIRS — l'album de Flocon (data/souvenirs.js).
   • afterGame(jeu, score) / afterDecor(zone, endroit) : débloquent les souvenirs gagnés.
   • checkFinal() : la grande photo, quand les 16 sont réunis et que l'Étoile est reconstituée.
   • show(liste) : présente les nouveaux souvenirs (une page à lire, puis rangée dans l'album).
   • albumTab() : l'onglet « Souvenirs » du Journal.
   Sauvegarde : S.souvenirs = { [id]: { at, score } }, S.decorSeen = { [endroit]: true }.
   ========================================================================== */
(function () {
  const G = window.Game;
  const { h } = G;

  const S = () => {
    const s = G.store.get();
    if (!s.souvenirs || typeof s.souvenirs !== 'object') s.souvenirs = {};
    if (!s.decorSeen || typeof s.decorSeen !== 'object') s.decorSeen = {};
    return s;
  };
  const list = () => G.data.souvenirs || [];
  const def = (id) => (id === 'final' ? G.data.souvenirFinal : list().find((x) => x.id === id));
  const has = (id) => !!S().souvenirs[id];
  const count = () => list().filter((x) => has(x.id)).length;

  function grant(id, extra) {
    if (has(id)) return false;
    S().souvenirs[id] = Object.assign({ at: G.time.iso() }, extra || {});
    G.store.save();
    return true;
  }

  /** Fin d'une partie : les souvenirs de ce jeu atteints par ce score. */
  function afterGame(game, score) {
    // un seul souvenir par partie : le premier pas encore gagné que ce score permet d'obtenir
    const x = list().find((y) => y.game === game && !has(y.id) && (!y.need || score >= y.need));
    const out = x && grant(x.id, { score }) ? [x] : [];
    return out.concat(checkFinal());
  }

  /** Un endroit du décor a été regardé : si c'était le dernier de la zone, souvenir d'exploration. */
  function afterDecor(zone, spotId) {
    const s = S();
    if (!s.decorSeen[spotId]) { s.decorSeen[spotId] = true; G.store.save(); }
    const spots = (G.data.decor || {})[zone] || [];
    const out = [];
    if (spots.length && spots.every((sp) => s.decorSeen[sp.id])) {
      const x = list().find((y) => y.explore === zone);
      if (x && grant(x.id)) out.push(x);
    }
    return out.concat(checkFinal());
  }

  /** La grande photo : dès que les 16 souvenirs sont réunis. */
  function checkFinal() {
    const f = G.data.souvenirFinal;
    if (!f || has('final')) return [];
    if (count() < list().length) return [];
    grant('final');
    return [f];
  }

  /* ---------- la vraie photo de l'aventurière avec Flocon (caméra de l'appareil) ----------
     Elle reste sur cet appareil uniquement (localStorage), à part de la sauvegarde : rien n'est envoyé nulle part. */
  const PHOTO_KEY = () => G.config.saveKey + '::photo';
  function getPhoto() { try { return localStorage.getItem(PHOTO_KEY()) || null; } catch (e) { return null; } }
  // overlay : '' si Flocon est déjà dans l'image ; 'left' / 'right' s'il faut le poser par-dessus à l'affichage
  // (quand le jeu est ouvert en fichier local, le navigateur interdit de mélanger son image à celle de la caméra)
  function photoOverlay() { try { return localStorage.getItem(PHOTO_KEY() + '-flocon') || ''; } catch (e) { return ''; } }
  function setPhoto(d, overlay) {
    try { localStorage.setItem(PHOTO_KEY(), d); localStorage.setItem(PHOTO_KEY() + '-flocon', overlay || ''); return true; } catch (e) { return false; }
  }

  /** Ouvre la caméra : aperçu avec Flocon à côté, « 3, 2, 1… Souris ! », puis on garde ou on reprend. Résout true si une photo a été gardée. */
  function takePhoto() {
    return new Promise((resolve) => {
      let stream = null, kept = false, side = 'right', shot = null, busy = false, overlay = '', pose = 0;
      let flo = sprite(POSES[0]);
      const video = h('video', { class: 'cam-video', autoplay: '', playsinline: '' }); video.muted = true; video.setAttribute('playsinline', '');
      const still = h('img', { class: 'cam-still', alt: 'Ta photo avec Flocon', hidden: true });
      const floEl = h('img', { class: 'cam-flocon right', alt: '', src: flo.src });
      const count = h('div', { class: 'cam-count', 'aria-live': 'assertive' });
      const flash = h('div', { class: 'cam-flash' });
      const msg = h('p', { class: 'cam-msg' }, "Flocon se recoiffe le nez… Autorise la caméra pour prendre la photo !");
      // changer la pose de Flocon : flèches posées sur l'image
      const setPose = (d) => { pose = (pose + d + POSES.length) % POSES.length; flo = sprite(POSES[pose]); floEl.src = flo.src; poseLbl.textContent = `Pose ${pose + 1} / ${POSES.length}`; G.audio.sfx('click'); };
      const poseLbl = h('span', { class: 'cam-pose-lbl' }, `Pose 1 / ${POSES.length}`);
      const poseBar = h('div', { class: 'cam-poses' },
        h('button', { class: 'cam-arrow', 'aria-label': 'Pose précédente de Flocon', onclick: () => setPose(-1) }, '‹'),
        poseLbl,
        h('button', { class: 'cam-arrow', 'aria-label': 'Pose suivante de Flocon', onclick: () => setPose(1) }, '›'));
      const view = h('div', { class: 'cam-view' }, video, floEl, still, count, flash, poseBar);
      const stop = () => { if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; };
      const m = G.panels.openModal({
        title: 'Une photo avec Flocon', className: 'cam-modal',
        onClose: () => { stop(); resolve(kept); },
        content: (b) => b.append(h('div', { class: 'cam-wrap' }, view, msg))
      });
      const live = () => {
        still.hidden = true; video.hidden = false; floEl.hidden = false; poseBar.hidden = false; shot = null;
        msg.textContent = "Mets-toi bien dans le cadre, à côté de Flocon. Prête ?";
        m.setButtons([
          { label: side === 'right' ? '← Flocon à gauche' : 'Flocon à droite →', class: 'ghost', onClick: () => { side = side === 'right' ? 'left' : 'right'; floEl.className = 'cam-flocon ' + side; live(); } },
          { label: '📷 Prendre la photo', class: 'primary', onClick: snap }
        ]);
      };
      async function snap() {
        if (busy || !stream) return; busy = true;
        m.setButtons([]); poseBar.hidden = true;
        for (const n of ['3', '2', '1']) { count.textContent = n; count.classList.remove('pop'); void count.offsetWidth; count.classList.add('pop'); G.audio.note(587, 0.25); await G.sleep(800); }
        count.textContent = 'Souris !'; G.audio.note(880, 0.5); await G.sleep(450);
        count.textContent = '';
        // l'image : 4/3, en miroir (comme un selfie), Flocon posé à côté
        const W = 960, H = 720;
        const render = (withFlocon) => {
          const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
          const g = cv.getContext('2d'), vw = video.videoWidth || W, vh = video.videoHeight || H;
          const sc = Math.max(W / vw, H / vh), dw = vw * sc, dh = vh * sc;
          g.save(); g.translate(W, 0); g.scale(-1, 1); g.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh); g.restore();
          if (withFlocon && flo.complete && flo.naturalWidth) {
            const fh = H * 0.62, fw = fh * flo.naturalWidth / flo.naturalHeight;
            g.drawImage(flo, side === 'right' ? W - fw - W * 0.02 : W * 0.02, H - fh - H * 0.01, fw, fh);
          }
          const vg = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.85);   // un léger voile doré sur les bords
          vg.addColorStop(0, 'rgba(255,220,150,0)'); vg.addColorStop(1, 'rgba(120,70,20,.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
          return cv.toDataURL('image/jpeg', 0.82);
        };
        try { shot = render(true); overlay = ''; } catch (e) { shot = render(false); overlay = side + '|' + POSES[pose]; }   // (fichier local : Flocon posé par-dessus à l'affichage)
        flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go'); G.audio.sfx('magic');
        still.src = shot; still.hidden = false; video.hidden = true; floEl.hidden = !overlay;
        msg.textContent = "Clic ! Elle te plaît ?";
        busy = false;
        m.setButtons([
          { label: 'Reprendre', class: 'ghost', onClick: live },
          { label: 'Garder cette photo ✦', class: 'primary', onClick: () => { if (setPhoto(shot, overlay)) { kept = true; m.close(); } else msg.textContent = "Oups, la photo n'a pas pu être rangée (plus de place sur l'appareil ?)."; } }
        ]);
      }
      m.setButtons([{ label: 'Annuler', class: 'ghost', onClick: () => m.close() }]);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        msg.textContent = "Cet appareil ne permet pas d'utiliser la caméra ici. (Il faut ouvrir le jeu depuis une adresse https, ou dans Chrome sur un ordinateur.)";
        return;
      }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
        .then((s) => { stream = s; video.srcObject = s; const p = video.play(); if (p && p.catch) p.catch(() => { }); live(); })
        .catch(() => { msg.textContent = "Flocon n'a pas pu allumer la caméra (accès refusé ou pas de caméra). Tu pourras réessayer depuis l'album."; });
    });
  }
  // les poses de Flocon proposées pour la photo
  const POSES = ['celebration', 'content', 'rire', 'amoureux', 'fier', 'victoire', 'emerveille', 'malicieux', 'courage', 'surpris', 'serein'];
  const sprites = {};
  function sprite(expr) { if (!sprites[expr]) { const i = new Image(); i.src = G.dlg.spriteSrc(expr); sprites[expr] = i; } return sprites[expr]; }

  /* ---------- la « photo » d'un souvenir ---------- */
  function stampOf(x) {
    if (x.id === 'final') return '';
    if (x.explore) return 'Exploration';
    if (!x.need) return '1re partie';
    return `${x.need} points`;
  }
  function photo(x, o) {
    o = o || {};
    const got = o.locked ? false : has(x.id);
    const real = x.id === 'final' && got ? getPhoto() : null;          // la vraie photo, si elle a été prise
    const starBack = G.progress.isFinaleDone() || G.store.get().finaleSeen;
    const [img, size, pos] = real ? [real, 'cover', 'center'] : ((!starBack && x.photoAvant) || x.photo || []);
    const bg = h('div', { class: 'sv-bg' });
    if (img) { bg.style.backgroundImage = `url("${img}")`; bg.style.backgroundSize = size || 'cover'; bg.style.backgroundPosition = pos || 'center'; }
    const [ovSide, ovExpr] = (real ? photoOverlay() : '').split('|');
    const shot = h('div', { class: 'sv-photo' }, bg,
      ovSide ? h('img', { class: 'sv-flocon-ov ' + ovSide, alt: '', src: G.dlg.spriteSrc(ovExpr || 'celebration') }) : null,
      got && !real && x.flocon !== false ? h('img', { class: 'sv-flocon', alt: '', src: G.dlg.spriteSrc(x.expr || 'content') }) : null,
      got ? null : h('span', { class: 'sv-q' }, '?'));
    const rec = S().souvenirs[x.id];
    const cap = h('figcaption', null,
      h('strong', { html: G.rich(got ? (x.caption && o.big ? x.caption : x.title) : '???') }),
      h('small', null, got ? (rec && rec.at ? G.fmtDate(rec.at) : '') : x.hint || ''));
    const fig = h('figure', { class: 'sv-pola' + (got ? '' : ' locked') + (o.big ? ' big' : '') + (x.id === 'final' ? ' final' : '') }, shot, cap,
      got && stampOf(x) ? h('span', { class: 'sv-stamp' }, stampOf(x)) : null);
    return fig;
  }

  /** Lire un souvenir (album, ou juste gagné). */
  function read(x, isNew) {
    return new Promise((resolve) => {
      const fin = x.id === 'final';
      let again = false;
      const noPhoto = fin && !getPhoto();
      const camBtns = !fin ? [] : !noPhoto
        ? [{ label: '📷 Reprendre la photo', class: 'ghost', onClick: (m) => { again = true; m.close(); } },
           { label: '⬇ Télécharger', class: 'ghost', onClick: () => { const a = document.createElement('a'); a.href = getPhoto(); a.download = 'flocon-et-' + (G.config.heroName || 'moi').toLowerCase() + '.jpg'; document.body.append(a); a.click(); a.remove(); } }]
        : [];
      G.panels.openModal({
        title: isNew ? '✦ Nouveau souvenir ! ✦' : (x.id === 'final' ? 'La grande photo' : 'Souvenir'),
        className: 'souvenir-modal',
        onClose: () => { if (again) takePhoto().then(() => read(x).then(resolve)); else resolve(); },
        content: (b) => b.append(h('div', { class: 'sv-read' + (x.id === 'final' ? ' final' : '') },
          photo(x, { big: true }),
          noPhoto ? h('div', { class: 'sv-cam-call' },
              h('img', { src: G.dlg.spriteSrc('impatient'), alt: '' }),
              h('p', null, h('strong', null, 'Psst ! '), 'Cette photo, c’est juste moi… Il manque ', h('strong', null, 'toi'), ' ! On en prend une vraie, tous les deux, avec la caméra ? Clique sur ', h('strong', null, '« 📷 Prendre notre photo ! »'), '.')) : null,
          h('div', { class: 'sv-text' },
            h('h3', { html: G.rich(x.title) }),
            h('p', { html: G.rich(x.text) }),
            h('p', { class: 'sv-sign' }, '— Flocon')))),
        buttons: camBtns.concat(noPhoto
          ? [{ label: isNew ? "Plus tard" : 'Fermer', class: 'ghost', onClick: (m) => m.close() },
             { label: '📷 Prendre notre photo !', class: 'primary big cam-cta', onClick: (m) => { again = true; m.close(); } }]
          : [{ label: isNew ? "Ranger dans l'album ✦" : 'Fermer', class: 'primary', onClick: (m) => m.close() }])
      });
      if (isNew) G.audio.sfx(x.id === 'final' ? 'success' : 'magic');
    });
  }
  async function show(items) {
    for (const x of items || []) await read(x, true);
  }

  /* ---------- l'onglet « Souvenirs » du Journal ---------- */
  function albumTab() {
    const all = list(), n = count(), f = G.data.souvenirFinal;
    const wrap = h('div', { class: 'sv-album' });
    wrap.append(h('p', { class: 'sv-intro' }, n
      ? `${n} souvenir${n > 1 ? 's' : ''} sur ${all.length}. Flocon les garde précieusement… et il les relit souvent.`
      : "L'album est encore vide. Joue avec Flocon aux mini-jeux (les endroits marqués ✦) et regarde le décor avec lui pour le remplir."));
    if (f) {
      const got = has('final');
      const big = photo(f, { big: true });
      wrap.append(h('div', { class: 'sv-final-slot' },
        got ? h('button', { class: 'sv-card', onclick: () => read(f) }, big)
          : h('div', { class: 'sv-final-locked' }, h('span', null, '✦'), h('p', null,
            `La dernière page de l'album est vide. Il manque encore ${all.length - n} souvenir${all.length - n > 1 ? 's' : ''}…`))));
    }
    const section = (title, items) => h('section', { class: 'sv-sec' }, h('h3', null, title),
      h('div', { class: 'sv-grid' }, items.map((x) => has(x.id)
        ? h('button', { class: 'sv-card', 'aria-label': 'Souvenir : ' + G.plain(x.title), onclick: () => read(x) }, photo(x))
        : h('div', { class: 'sv-card', 'aria-label': 'Souvenir à découvrir' }, photo(x)))));
    wrap.append(
      section('Les jeux avec Flocon', all.filter((x) => x.game)),
      section('Les balades', all.filter((x) => x.explore)));
    return wrap;
  }

  G.souvenirs = { afterGame, afterDecor, checkFinal, show, read, albumTab, takePhoto, count, total: () => list().length };
})();
