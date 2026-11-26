/* ==========================================================================
   CHAPITRE — déroule une journée : dialogues → cadeau (code) → énigme → conclusion,
   puis fragment d'étoile, fin de zone, voyage vers la zone suivante, final du 24.
   La progression est sauvegardée à chaque étape : on peut quitter et reprendre.
   ========================================================================== */
(function () {
  const G = window.Game;
  const { $, h, sleep } = G;
  let active = null, busy = false;

  const isActive = () => !!active;
  const currentDay = () => (active ? active.day : null);
  const F = (expr, text) => ({ who: 'flocon', expr, text });
  const N = (text) => ({ who: 'narrator', text });

  /** Un document rejoint le carnet d'indices (une seule fois), avec sa petite animation. */
  async function grantDoc(id, o) {
    const d = G.data.docs && G.data.docs[id];
    if (!d) { console.warn('[Carnet] document inconnu :', id); return; }
    if (!G.store.giveDoc(id)) return;
    G.dlg.hide();
    await G.panels.acquireDoc(id, o);
  }

  /* ---------- lecture d'une suite de répliques ---------- */
  async function playLines(lines, o) {
    o = o || {};
    let skipped = false;
    for (const line of lines || []) {
      if (line.fx) await runFx(line.fx);
      if (line.scene) await G.scene.showPlace(line.scene);     // (changement de décor en plein chapitre, ex. le feu qui s'allume)
      if (line.doc) await grantDoc(line.doc, { fast: !!line.fast });
      if (line.text == null || skipped) continue;
      const r = await G.dlg.say(line, { skippable: o.skippable });
      if (r === 'skip') { skipped = true; continue; }
      if (line.await === 'tap') await finaleTap();
    }
    if (!o.keepOpen) G.dlg.hide();
  }

  /** Petit dialogue hors chapitre (porte verrouillée, combinaison d'objets…). */
  async function mini(lines) {
    if (busy) return;
    busy = true;
    try { await playLines(lines, { skippable: false }); }
    catch (e) { if (!(e instanceof G.Cancel)) console.error(e); }
    finally { G.dlg.hide(); busy = false; G.hud.refresh(); }
  }

  /* ---------- le grand final : l'Étoile d'Hiver ---------- */
  function ensureFinale() {
    const el = $('#finale'), holder = el.querySelector('.finale-star');
    el.hidden = false; el.classList.remove('out');
    if (!holder.firstChild) {
      const set = new Set(G.store.get().fragments.filter((d) => d !== 24));
      const svg = G.fx.starSVG(set); svg.classList.add('big'); holder.append(svg);
    }
    return { el, holder, svg: holder.firstChild };
  }
  function finaleTap() {
    G.dlg.hide();
    const { el, holder } = ensureFinale();
    const hint = el.querySelector('.finale-hint');
    hint.hidden = false; holder.classList.add('tappable');
    return G.makeWaiter((done) => {
      const on = () => { holder.removeEventListener('click', on); hint.hidden = true; holder.classList.remove('tappable'); G.audio.sfx('star'); G.fx.pulse(holder); done(); };
      holder.addEventListener('click', on);
    });
  }
  const FX = {
    /** Les lieux du village s'éveillent (juste après l'arrivée de Flocon, le jour J). */
    async spots() { G.scene.renderSpots(); G.scene.playUnlockFx(); G.hud.refresh(); },
    async 'finale-start'() {
      G.audio.finale(true);
      const z4 = G.progress.zone(4); if (z4 && z4.imageAfter) { const i = new Image(); i.src = z4.imageAfter; }     // (le château éclairé, prêt pour l'éclosion)
      const { svg } = ensureFinale();
      svg.classList.add('scattered'); svg.classList.remove('glow', 'shine');
      G.audio.sfx('magic');
      await sleep(900);
    },
    async 'finale-assemble'() {
      const { svg } = ensureFinale();
      svg.classList.remove('scattered');
      G.audio.sfx('magic');
      await sleep(1900);
      const all = new Set(Array.from({ length: 24 }, (_, i) => i + 1));
      G.fx.setStarCollected(svg, all, svg.querySelector('.shard').dataset.gid);
      svg.classList.add('glow'); G.audio.sfx('star');
      await sleep(1000);
    },
    async 'finale-bloom'() {
      const S = G.store.get();
      const { el, holder } = ensureFinale();
      G.fx.flash('#fff8e0', 2000); G.audio.sfx('success'); G.fx.confetti(70);
      holder.classList.add('shine');
      S.finaleSeen = true; G.store.save();
      G.scene.refreshMood();
      await sleep(2800);
      el.classList.add('out');
      await sleep(900);
      el.hidden = true; holder.innerHTML = '';
    },
    /** Le royaume rallumé : un halo doux, des étincelles (le dernier chapitre commence). */
    async 'finale-glow'() {
      G.fx.flash('#fff3c4', 1800); G.audio.sfx('magic');
      const c = G.fx.center(); G.fx.sparkles(c.x, c.y - 20, 26, { spread: 240 });
      G.scene.refreshMood();
      await sleep(G.reduceMotion() ? 300 : 1100);
    },
    /** La lettre « Notre prochaine aventure » (texte et expérience réelle : Game.data.finale.letter). */
    async 'finale-letter'() {
      const f = (G.data.finale || {}).letter; if (!f) return;
      G.dlg.hide(); G.audio.sfx('magic');
      await new Promise((resolve) => {
        G.panels.openModal({
          title: f.title, className: 'finalecard letter', dismissible: false,
          content: (b) => {
            b.append(h('div', { class: 'final-star' }, G.fx.starSVG(new Set(Array.from({ length: 24 }, (_, i) => i + 1)))));
            (f.before || []).forEach((p) => b.append(h('p', { html: G.rich(p) })));
            if (f.real) b.append(h('div', { class: 'final-real' }, h('p', { html: G.rich('**' + f.real + '**') })));
            (f.after || []).forEach((p) => b.append(h('p', { html: G.rich(p) })));
            if (f.signature) b.append(h('p', { class: 'final-sign', html: G.rich(f.signature) }));
          },
          buttons: [{ label: 'Continuer', class: 'primary', onClick: (a) => a.close() }],
          onClose: resolve
        });
      });
    },
    /** Fondu au blanc, une petite étoile apparaît ; le voile reste jusqu'à l'ouverture de la carte finale. */
    async 'finale-fade'() {
      G.dlg.hide();
      document.querySelectorAll('.whitefade').forEach((e) => e.remove());
      const star = G.fx.starSVG(new Set(Array.from({ length: 24 }, (_, i) => i + 1)));
      const veil = h('div', { class: 'whitefade' }, h('div', { class: 'wf-star' }, star));
      $('#fx-root').append(veil);
      void veil.offsetWidth; veil.classList.add('on');
      await sleep(G.reduceMotion() ? 500 : 1700);
      G.audio.sfx('star'); veil.classList.add('star');
      await sleep(G.reduceMotion() ? 600 : 1800);
    }
  };
  async function runFx(name) { if (FX[name]) await FX[name](); }

  async function finaleCard() {
    const f = G.data.finale;
    const veil = document.querySelector('.whitefade');         // (le fondu au blanc de la fin : on le lève sur la carte)
    await new Promise((resolve) => {
      G.panels.openModal({
        title: f.title, className: 'finalecard', dismissible: false,
        content: (b) => {
          b.append(h('div', { class: 'final-star' }, G.fx.starSVG(new Set(Array.from({ length: 24 }, (_, i) => i + 1)))));
          if (f.subtitle) b.append(h('p', { class: 'final-sub', html: G.rich(f.subtitle) }));
          (f.message || []).forEach((p) => b.append(h('p', { html: G.rich(p) })));
        },
        buttons: [{ label: 'Revenir dans le royaume', class: 'primary', onClick: (a) => a.close() }],
        onClose: resolve
      });
      if (veil) { veil.classList.remove('on', 'star'); setTimeout(() => veil.remove(), 1700); }
    });
  }

  /* ---------- segments d'une journée ---------- */
  async function giftSegment(day, def, replay) {
    const gift = def.gift; if (!gift) return;
    const item = gift.item;
    if (replay) { if (gift.after && gift.after.length) await playLines(gift.after, { skippable: true }); return; }
    const seenAfter = `d${day}:giftAfter`;
    if (!G.store.hasItem(item)) {
      const introKey = `d${day}:giftIntro`;
      await playLines(gift.lines || G.data.defaults.giftIntro, { skippable: G.store.seen(introKey) });
      G.store.markSeen(introKey);
      if (!G.store.hasItem(item)) {                       // (le code a pu être entré depuis le sac entre-temps)
        if (G.dev && G.dev.autoCode) G.redeem.commit(String(day));
        else {
          const res = await G.panels.codeEntry(day);
          if (res !== 'ok') {
            await playLines(G.data.defaults.giftLater);
            throw new G.Cancel('plus tard');
          }
        }
        await G.panels.acquire(item);
      }
    }
    if (!G.store.seen(seenAfter)) {
      if (gift.after && gift.after.length) await playLines(gift.after, { skippable: false });
      G.store.markSeen(seenAfter);
    }
  }

  async function puzzleSegment(day, def, replay) {
    if (!def.puzzle || replay) return;
    const S = G.store.get(), pid = def.puzzle, pz = G.data.puzzles[pid];
    if (!pz) return;
    if (S.puzzles[pid] && S.puzzles[pid].solved) { for (const d of (pz.clues || []).concat(pz.docs || [])) await grantDoc(d); return; }   // (reprise après une sortie en plein milieu)
    if (G.dev && G.dev.autoPuzzle) { S.puzzles[pid] = { solved: true, at: G.time.iso() }; G.store.save(); for (const d of (pz.clues || []).concat(pz.docs || [])) G.store.giveDoc(d); return; }
    // 1. D'abord, on reçoit les indices : ils rejoignent le carnet, mais ne s'affichent PAS avec l'énigme.
    //    C'est à la joueuse de les retrouver dans son carnet.
    const clueKey = `d${day}:clues`;
    if (!G.store.seen(clueKey)) {
      if (pz.clueLines && pz.clueLines.length) await playLines(pz.clueLines, { skippable: G.store.seen(clueKey + ':begun') });
      G.store.markSeen(clueKey + ':begun');
      for (const d of pz.clues || []) await grantDoc(d);
      G.store.markSeen(clueKey);
    }
    for (const d of pz.clues || []) G.store.giveDoc(d);                       // (sécurité : on ne perd jamais un indice)
    // 2. Puis l'énigme (avec sa musique), suivie de sa conclusion et des pages qu'elle débloque.
    await G.puzzles.run(pid);
    S.puzzles[pid] = { solved: true, at: G.time.iso() };
    G.store.save();
    await playLines(pz.success || [], { skippable: false });
    for (const d of pz.docs || []) await grantDoc(d);
  }

  async function runSegment(name, day, def, replay) {
    if (name === 'intro' || name === 'outro') {
      const key = `d${day}:${name}`, begun = key + ':begun';
      // déjà vu en entier, ou commencé lors d'une visite précédente : on propose « Passer »
      const skip = replay || G.store.seen(key) || G.store.seen(begun);
      if (!replay) G.store.markSeen(begun);
      await playLines(def[name] || [], { skippable: skip });
      if (!replay) G.store.markSeen(key);
    } else if (name === 'gift') await giftSegment(day, def, replay);
    else if (name === 'puzzle') await puzzleSegment(day, def, replay);
  }

  /* ---------- fin de chapitre ---------- */
  async function fragmentAnim(day) {
    const svg = G.fx.starSVG(new Set([day])); svg.classList.add('frag');
    const holder = h('div', { class: 'frag-ico' }, svg);
    const card = h('div', { class: 'acquire frag' }, holder, h('div', { class: 'acq-txt' }, h('small', null, 'Fragment de l\'Étoile retrouvé'), h('strong', null, `n° ${day} sur 24`)));
    $('#fx-root').append(card);
    G.audio.sfx('star');
    const c = G.fx.center(); G.fx.sparkles(c.x, c.y - 20, 18, { spread: 100 });
    await sleep(G.reduceMotion() ? 900 : 1800);
    const from = G.fx.centerOf(holder);
    card.classList.add('out');
    G.fx.fly(from, $('#btn-star'), svg.cloneNode(true), { size: 70, dur: 900 });
    await sleep(850);
    card.remove();
    G.hud.refresh();
  }

  async function completeDay(day, def) {
    G.store.setDay(day, { status: 'done', doneAt: G.time.iso(), seg: 99 });
    G.store.log('done', `Chapitre ${day} terminé : ${def.title}`, day, 'done:' + day);
    if (G.store.addFragment(day) && !def.finale) await fragmentAnim(day);   // (le 24 : l'Étoile vient de se reconstituer sous ses yeux)
    for (const r of def.rewards || []) { if (G.store.giveItem(r)) await G.panels.acquire(r); }
    G.hud.refresh();
    if (def.finale) { await finaleCard(); return; }
    const z = G.progress.zoneOf(day);
    if (day === z.days[1]) await zoneComplete(z);
  }

  async function zoneComplete(z) {
    const next = G.progress.nextZone(z);
    if (!next) return;
    G.store.unlockZone(next.id);
    G.store.log('zone', `${z.short} : toutes les étapes sont terminées.`, null, 'zonedone:' + z.id);
    await playLines(z.outro || [], { keepOpen: true });
    const pick = await G.dlg.ask(F('guide', z.travelQuestion || `Partir vers ${next.short} ?`), ['Oui, en route !', 'Pas tout de suite']);
    G.dlg.hide();
    if (pick === 0) { await travelTo(next); }
    else { G.panels.toast("Tu pourras partir quand tu veux depuis la carte."); }
    G.hud.refresh();
  }

  async function arrive(z) {
    const S = G.store.get();
    const first = !S.zonesSeen.includes(z.id);
    if (first) { S.zonesSeen.push(z.id); G.store.save(); G.store.log('zone', `Arrivée : ${z.name}`, null, 'zone:' + z.id); }
    if (first && z.intro && z.intro.length) await playLines(z.intro, { skippable: false });
    const st = G.progress.spotStatus(z.days[0]);
    if (first && st.reason === 'date') {
      await playLines([F('serein', `Les lumières de ce lieu s'éveilleront le ${G.time.long(st.date)}. D'ici là, repose-toi : une aventurière a besoin de sommeil !`)]);
    }
  }
  async function travelTo(z) {
    const from = G.store.get().zone;
    await G.scene.travel(from, z.id);
    await arrive(z);
  }

  /* ---------- exécution d'un chapitre ---------- */
  function endChapter() {
    active = null; busy = false;
    G.abortAll();
    G.dlg.hide();
    G.puzzles.clear();
    document.querySelectorAll('.whitefade').forEach((e) => e.remove());
    const f = $('#finale');
    if (f && !f.hidden) { f.hidden = true; f.classList.remove('out'); const hd = f.querySelector('.finale-star'); if (hd) hd.innerHTML = ''; }
    G.audio.finale(false);
    G.scene.leavePlace();
    G.scene.renderSpots(); G.scene.refreshMood(); G.hud.refresh();
  }

  async function openDay(day, o) {
    o = o || {};
    if (busy) return;
    busy = true;
    const replay = !!o.replay;
    active = { day, replay };
    G.hud.refresh();
    const def = G.progress.def(day), S = G.store.get();
    G.chars.preloadLines(def);                 // les images des personnages de ce chapitre, à l'avance
    let completed = false;
    try {
      if (!replay && !S.places[day]) { S.places[day] = G.time.iso(); G.store.log('place', `Lieu visité : ${G.progress.placeOf(day)}`, day, 'place:' + day); }
      const flow = def.flow || ['intro', 'gift', 'puzzle', 'outro'];
      const st = G.store.dayState(day);
      if (!replay && st.status === 'new') { G.store.setDay(day, { status: 'started', openedAt: G.time.iso(), seg: 0 }); G.store.log('chapter', `Chapitre ${day} : ${def.title}`, day, 'chap:' + day); }
      let seg = replay ? 0 : (G.store.dayState(day).seg || 0);
      if (seg > flow.length) seg = 0;
      G.scene.renderSpots();
      G.scene.scrollToSpot(day);
      const pzSolved = def.puzzle && S.puzzles[def.puzzle] && S.puzzles[def.puzzle].solved;
      const decor = def.sceneSolved && (replay || pzSolved) ? def.sceneSolved : def.scene;   // (sceneSolved : le décor une fois l'énigme résolue)
      if (decor) await G.scene.showPlace(decor);                 // le décor du lieu, le temps du chapitre
      for (; seg < flow.length; seg++) {
        if (!replay) G.store.setDay(day, { seg });
        await runSegment(flow[seg], day, def, replay);
      }
      if (def.closing && def.closing.length) {               // le petit mot de Flocon avant la fin du jour
        const ck = `d${day}:closing`;
        await playLines(def.closing, { skippable: replay || G.store.seen(ck) });
        if (!replay) G.store.markSeen(ck);
      }
      if (!replay) { await completeDay(day, def); completed = true; }
      else if (def.finale) await finaleCard();
    } catch (e) {
      if (e instanceof G.Cancel) G.panels.toast('Chapitre mis de côté : tu pourras le reprendre depuis son lieu.');
      else console.error(e);
    } finally { endChapter(); if (completed) G.companion.afterChapter(); }
  }
  const replay = (day) => openDay(day, { replay: true });

  /* ---------- l'arrivée de Flocon (juste après la saisie de son code dans le sac) ---------- */
  async function floconArrives() {
    if (busy || active) return;
    const d = G.data.defaults;
    const info = G.progress.spotStatus(1);
    const early = info.status === 'locked' && info.reason === 'date';
    const date = G.time.long(G.time.unlockDate(1));
    const tail = (early ? d.welcomeEarly : d.welcomeNow).map((l) => (l.text ? Object.assign({}, l, { text: l.text.replace('{date}', date) }) : l));
    G.hud.refresh();
    await mini([].concat(d.floconArrival, tail));
    G.scene.renderSpots(); G.scene.playUnlockFx(); G.hud.refresh();
  }

  /* ---------- lieux : portes verrouillées par un objet ---------- */
  let gating = false;                                  // (une porte est en train de s'ouvrir : on ignore un second toucher)
  async function tryGate(day) {
    gating = true;
    try { return await gateSteps(day); } finally { gating = false; }
  }
  async function gateSteps(day) {
    const def = G.progress.def(day), req = def.requires, sel = G.panels.selected();
    if (sel && sel === req.item && G.store.hasItem(sel)) {
      G.store.setDay(day, { gate: true });
      G.store.useItem(sel, 'jour ' + day);
      G.panels.select(null);
      const c = G.scene.spotCenter(day);
      G.fx.ring(c.x, c.y, 'gold'); G.fx.sparkles(c.x, c.y, 22, { spread: 90 }); G.audio.sfx('unlock');
      if (def.sceneLocked) {                                   // (ex. le pont : la brume se déchire pendant l'ouverture)
        await G.scene.showPlace(def.sceneLocked);
        if (def.scene) setTimeout(() => G.scene.showPlace(def.scene), 2200);
      }
      await mini(req.open || []);
      return openDay(day);
    }
    if (def.sceneLocked) await G.scene.showPlace(def.sceneLocked);
    await mini(sel ? (req.wrong || [F('decu', "Hmm, ça ne marche pas avec ça…")]) : (req.locked || [F('cherche', "Il faut quelque chose pour ouvrir ça…")]));
    if (def.sceneLocked) G.scene.leavePlace();
  }

  async function onSpot(day) {
    if (busy || active || gating) return;
    const info = G.progress.spotStatus(day);
    if (info.status === 'locked' && info.reason === 'flocon') {
      G.audio.sfx('soft_error');
      const el = G.scene.spotEl(day); if (el) G.fx.shake(el);
      return mini([N("Ce lieu dort sous le givre. Il manque encore quelqu'un pour le réveiller…"), N("Ouvre ton **sac**, touche **« Entrer un code objet »** et recopie le code de ton compagnon.")]);
    }
    if (info.status === 'locked') {
      G.panels.toast(G.progress.lockMessage(day));
      G.audio.sfx('soft_error');
      const el = G.scene.spotEl(day); if (el) G.fx.shake(el);
      return;
    }
    if (info.status === 'done') {
      const ok = await G.panels.confirmDialog({ title: `Jour ${day} · ${G.progress.def(day).title}`, text: 'Revoir ce chapitre ? Rien ne sera perdu ni donné une seconde fois.', yes: 'Revoir', no: 'Non merci' });
      if (ok) replay(day);
      return;
    }
    if (day === 24 && G.brainstorm && G.brainstorm.needed()) {          // le grand point avec Flocon d'abord
      const el = document.getElementById('companion'); if (el) G.fx.shake(el);
      const [expr, text] = G.brainstorm.blockedLine();
      return mini([F(expr, text)]);
    }
    const def = G.progress.def(day);
    if (def.requires && !G.store.dayState(day).gate) return tryGate(day);
    openDay(day);
  }

  /* ---------- navigation ---------- */
  async function goZone(id) {
    if (busy || active) return;
    if (!G.store.zoneUnlocked(id)) { G.panels.toast("Cette région n'est pas encore accessible. Termine d'abord les chapitres de la précédente."); G.audio.sfx('soft_error'); return; }
    const S = G.store.get();
    const z = G.progress.zone(id);
    if (!S.zonesSeen.includes(id)) {
      busy = true;
      try { await travelTo(z); } catch (e) { if (!(e instanceof G.Cancel)) console.error(e); } finally { G.dlg.hide(); busy = false; G.hud.refresh(); }
    } else await G.scene.showZone(id);
  }
  async function goToDay(day) {
    if (busy || active) return;
    const z = G.progress.zoneOf(day);
    if (!G.store.zoneUnlocked(z.id)) { G.panels.toast(G.progress.lockMessage(day)); return; }
    await G.scene.showZone(z.id, { fx: false });
    G.scene.scrollToSpot(day);
    const el = G.scene.spotEl(day);
    if (el) { el.classList.add('awaken'); setTimeout(() => el.classList.remove('awaken'), 2600); const c = G.fx.centerOf(el); G.fx.ring(c.x, c.y, 'gold'); }
    const info = G.progress.spotStatus(day);
    G.panels.toast(info.status === 'locked' ? G.progress.lockMessage(day) : `Jour ${day} : ${G.progress.placeOf(day)}` + (info.status === 'done' ? ' (touche pour revoir)' : ' (touche le lieu pour entrer)'));
  }
  async function toggleMap() {
    if (busy || active) return;
    const S = G.store.get();
    if (S.view === 'map') await G.scene.showZone(S.zone, { fx: false }); else await G.scene.showMap();
  }
  async function back() {
    if (active) return quit();
    const S = G.store.get();
    if (S.view === 'map' && !busy) await G.scene.showZone(S.zone, { fx: false });
  }
  function quit() { G.abortAll(); }

  G.chapter = { grantDoc, isActive, currentDay, onSpot, openDay, replay, mini, playLines, floconArrives, goZone, goToDay, toggleMap, back, quit, arrive };
})();
