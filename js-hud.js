/* ==========================================================================
   HUD — boutons (carte, inventaire, journal, calendrier, son, réglages), compteur
   d'étoile, objet sélectionné, bandeau d'attente.
   ========================================================================== */
(function () {
  const G = window.Game;
  const { $, h } = G;
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const IC = {
    map: svg('<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'),
    bag: svg('<path d="M6 8h12l1 12H5z"/><path d="M9 8V6a3 3 0 016 0v2"/>'),
    book: svg('<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v13"/>'),
    cal: svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
    sound: svg('<path d="M4 10h4l5-4v12l-5-4H4z"/><path d="M16 9c1.5 1.5 1.5 4.5 0 6M18.5 6.5c3 3 3 8 0 11"/>'),
    mute: svg('<path d="M4 10h4l5-4v12l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
    back: svg('<path d="M15 5l-7 7 7 7"/>')
  };
  let starSvg = null;

  function btn(id, icon, label, fn, extra) {
    return h('button', { id, class: 'hud-btn ' + (extra || ''), 'aria-label': label, title: label, onclick: fn },
      h('span', { class: 'ic', html: icon }), h('span', { class: 'lbl' }, label));
  }

  function init() {
    const right = $('#hud-right');
    right.append(
      h('button', { id: 'btn-star', class: 'hud-star', 'aria-label': "L'Étoile d'Hiver", title: "L'Étoile d'Hiver", onclick: () => G.panels.openStar() },
        h('span', { class: 'star-mini' }), h('span', { class: 'star-count' }, '0/24')),
      btn('btn-map', IC.map, 'Carte', () => G.chapter.toggleMap(), 'needs-free'),
      btn('btn-inventory', IC.bag, 'Sac', () => G.panels.openInventory()),
      btn('btn-journal', IC.book, 'Journal', () => G.panels.openJournal()),
      btn('btn-calendar', IC.cal, 'Calendrier', () => G.panels.openCalendar(), 'needs-free'),
      btn('btn-sound', IC.sound, 'Son', () => {
        const S = G.store.get(); const on = !G.audio.isMusic();
        G.audio.init(); G.audio.setMusic(on); G.audio.setSfx(on || G.audio.isSfx());
        S.audio.music = on; G.store.save(); refresh();
      }),
      btn('btn-settings', IC.gear, 'Réglages', () => G.panels.openSettings()));
    $('#hud-left').append(
      h('button', { id: 'btn-back', class: 'hud-btn back', hidden: true, onclick: () => G.chapter.back() },
        h('span', { class: 'ic', html: IC.back }), h('span', { class: 'lbl', id: 'back-lbl' }, 'Retour')),
      h('div', { id: 'zone-chip' }, h('small', { id: 'zone-num' }), h('strong', { id: 'zone-name' })));
    $('#sel-chip').addEventListener('click', () => { G.panels.select(null); });
  }

  function waitText() {
    if (G.progress.beforeStart()) return '';
    if (!G.progress.hasFlocon()) return "Ouvre ton sac et entre le code de ton compagnon.";
    const nd = G.progress.nextDay();
    if (!nd) return '';
    const st = G.progress.spotStatus(nd);
    if (st.reason !== 'date') return '';
    const days = Math.ceil((st.date - G.time.now()) / 86400000);
    if (nd === 1) return `Les portes du royaume s'ouvriront le ${G.time.long(st.date)}.` + (days > 1 ? ` Plus que ${days} jours…` : ' C\'est pour très bientôt !');
    return `Prochaine porte : le ${G.time.long(st.date)}.`;
  }

  function refresh() {
    const S = G.store.get();
    const inMap = S.view === 'map';
    const active = G.chapter.isActive();
    const z = G.progress.zone(S.zone);
    $('#zone-num').textContent = inMap ? 'Le Royaume' : `Zone ${z.id}`;
    $('#zone-name').textContent = inMap ? "Carte de l'Étoile d'Hiver" : z.name;
    document.body.classList.toggle('in-chapter', active);
    document.body.classList.toggle('before-start', G.progress.beforeStart());   // (avant le 1er décembre : seuls Son et Réglages restent)
    document.body.classList.toggle('view-map', inMap);
    // étoile
    const set = new Set(S.fragments);
    const holder = $('#btn-star .star-mini');
    if (holder) {
      if (!starSvg) { starSvg = G.fx.starSVG(set); holder.append(starSvg); } else G.fx.setStarCollected(starSvg, set, starSvg.querySelector('.shard').dataset.gid);
    }
    $('#btn-star .star-count').textContent = `${set.size}/${G.config.fragmentsTotal}`;
    // son
    $('#btn-sound .ic').innerHTML = G.audio.isMusic() ? IC.sound : IC.mute;
    $('#btn-sound').classList.toggle('off', !G.audio.isMusic());
    // retour
    const back = $('#btn-back');
    back.hidden = !(active || inMap);
    $('#back-lbl').textContent = active ? 'Quitter le chapitre' : 'Retour au lieu';
    $('#btn-map').classList.toggle('on', inMap);
    // objet sélectionné
    const sel = G.panels.selected();
    const chip = $('#sel-chip');
    chip.hidden = !sel;
    if (sel) chip.innerHTML = `<span class="chip-ico">${G.itemArt(sel)}</span><span>${G.escapeHtml(G.data.items[sel].name)} sélectionné · touche un lieu</span><b aria-hidden="true">×</b>`;
    // bandeau d'attente
    const wb = $('#wait-banner');
    const txt = (!active && !inMap && S.started) ? waitText() : '';
    wb.hidden = !txt; wb.textContent = txt;
    // lueur sur le bouton carte quand une zone attend
    const pending = G.data.zones.some((zz) => G.store.zoneUnlocked(zz.id) && !S.zonesSeen.includes(zz.id));
    $('#btn-map').classList.toggle('attention', pending && !inMap);
    // le sac clignote tant que le compagnon n'est pas arrivé
    $('#btn-inventory').classList.toggle('attention', !G.progress.hasFlocon() && !G.progress.beforeStart() && S.started && !active);
    if (G.companion) G.companion.refresh();
  }

  G.hud = { init, refresh };
})();
