/* ==========================================================================
   COMPAGNON — Flocon, dans un coin de l'écran.
   • On le touche : petite bulle qui dit ce qu'on doit faire, puis où on en est, puis une petite pensée.
     (Ce n'est pas un dialogue : juste une bulle discrète, qui disparaît toute seule.)
   • Il parle aussi tout seul, de temps en temps, avec les phrases de data/phrases.js :
       carte du royaume → « l'aventurier autoproclamé »   · sac → « curiosité et maladresse »
       zones dangereuses → « peur et courage »            · après un chapitre → moments chaleureux
       le reste du temps → Noël, la magie, pensées spontanées
   • Il n'existe qu'après son arrivée (code objet de Flocon) et se tait pendant les dialogues,
     chapitres, énigmes et fenêtres.
   ========================================================================== */
(function () {
  const G = window.Game;
  const { $, h } = G;
  let els = null, hideTimer = null, nextAt = 0, tapStep = 0, lastTap = 0, lastSay = 0, wasTalkable = false, lastExpr = null, wasShown = false;

  const grab = () => (els = els || { root: $('#companion'), btn: $('#cmp-btn'), sprite: $('#cmp-sprite'), bubble: $('#cmp-bubble') });
  const delay = () => 55000 + Math.random() * 50000;      // un mot tout seul toutes les ~1 à 2 minutes

  /** Peut-il parler en ce moment ? (rien d'autre n'occupe l'écran) */
  function canTalk() {
    if (!G.progress.hasFlocon()) return false;
    const b = document.body;
    if (b.classList.contains('on-title') || b.classList.contains('in-chapter') || b.classList.contains('dlg-open') || b.classList.contains('modal-open')) return false;
    if (document.hidden || G.chapter.isActive() || $('#puzzle-panel')) return false;
    return true;
  }

  /* ---------- choix d'une phrase sans se répéter ---------- */
  function pick(pool) {
    const list = G.data.phrases[pool] || G.data.phrases.idle;
    const S = G.store.get();
    const recent = S.said.filter((k) => k.startsWith(pool + ':')).slice(-Math.max(1, Math.min(list.length - 1, 12)));
    let cand = list.map((_, i) => i).filter((i) => !recent.includes(pool + ':' + i));
    if (!cand.length) cand = list.map((_, i) => i);
    const i = cand[Math.floor(Math.random() * cand.length)];
    S.said.push(pool + ':' + i); if (S.said.length > 60) S.said.splice(0, S.said.length - 60);
    G.store.save();
    return list[i];
  }

  /* ---------- sprite & bulle ---------- */
  function setSprite(expr, animate) {
    const e = grab();
    expr = expr || 'content';
    if (expr === lastExpr && !animate) return;
    e.sprite.src = G.dlg.spriteSrc(expr);
    if (lastExpr !== expr) { e.sprite.classList.remove('pop', 'swap'); void e.sprite.offsetWidth; e.sprite.classList.add('swap'); }
    lastExpr = expr;
  }
  function hideBubble(instant) {
    const e = grab();
    clearTimeout(hideTimer);
    if (e.bubble.hidden) return;
    const fin = () => { e.bubble.hidden = true; e.bubble.classList.remove('out'); e.root.classList.remove('talking'); setSprite('content'); };
    if (instant) { fin(); return; }
    e.bubble.classList.add('out');
    hideTimer = setTimeout(fin, 300);
  }
  function say(text, expr, o) {
    o = o || {};
    const e = grab();
    clearTimeout(hideTimer);
    e.bubble.hidden = false; e.bubble.classList.remove('out');
    e.bubble.innerHTML = G.rich(text);
    e.bubble.style.animation = 'none'; void e.bubble.offsetWidth; e.bubble.style.animation = '';
    e.root.classList.add('talking');
    setSprite(expr || 'content');
    lastSay = Date.now();
    nextAt = lastSay + delay();
    hideTimer = setTimeout(() => hideBubble(), o.ms || Math.min(15000, 4200 + String(text).length * 60));
  }

  /* ---------- « qu'est-ce qu'on doit faire ? / où en est-on ? » ---------- */
  function objective() {
    const S = G.store.get();
    const nd = G.progress.nextDay();
    if (!nd) return { text: "On a retrouvé tous les fragments : l'Étoile d'Hiver brille de nouveau ! Tu peux revoir n'importe quel chapitre depuis le calendrier ou la carte.", expr: 'celebration' };
    const info = G.progress.spotStatus(nd), z = G.progress.zoneOf(nd), def = G.progress.def(nd);
    if (info.status === 'locked') {
      if (info.reason === 'date') {
        const when = G.time.long(info.date);
        return { text: nd === 1 ? `Les portes du royaume s'ouvriront le ${when}. D'ici là, il n'y a plus qu'à patienter… et à fouiller ton sac !`
          : `Rien à faire pour l'instant : le prochain lieu s'éveillera le ${when}. En attendant, tu peux fouiller ton sac ou revoir un ancien chapitre.`, expr: 'attend' };
      }
      return { text: "La suite de l'aventure n'est pas encore accessible. Finissons d'abord ce qui est ouvert !", expr: 'reflexion' };
    }
    const place = G.progress.placeOf(nd);
    const here = S.view === 'zone' && S.zone === z.id;
    let t = info.status === 'started'
      ? `On a commencé le jour ${nd} sans le finir : « ${place} ». On reprend là où on s'est arrêtés !`
      : `Le jour ${nd} nous attend : « ${place} ».`;
    if (def.goal) t += ' ' + def.goal;
    if (def.requires && !G.store.dayState(nd).gate) t += ' Ce lieu est fermé : il faudra utiliser un objet de ton sac dessus (sélectionne-le, puis touche le lieu).';
    if (!here) t += S.view === 'map' ? ` C'est du côté de ${z.short}.` : ` C'est dans ${z.short} : passe par la carte.`;
    return { text: t, expr: info.status === 'started' ? 'guide' : 'explore' };
  }
  function progressText() {
    const S = G.store.get(), n = S.fragments.length;
    const nd = G.progress.nextDay();
    const z = G.progress.zone(nd ? G.progress.zoneOf(nd).id : 4);
    const done = G.progress.zoneDoneCount(z), total = G.progress.daysOf(z).length;
    if (n >= 24) return { text: "Les vingt-quatre fragments sont réunis. Quelle aventure !", expr: 'celebration' };
    const t = n === 0 ? "On n'a pas encore retrouvé de fragment de l'Étoile, mais le premier nous attend !"
      : `On a retrouvé ${n} fragment${n > 1 ? 's' : ''} de l'Étoile sur 24. Plus que ${24 - n} !`;
    return { text: `${t} Ici, ${done} lieu${done > 1 ? 'x' : ''} sur ${total} terminé${done > 1 ? 's' : ''}.`, expr: n ? 'fier' : 'content' };
  }

  function onTap() {
    if (G.brainstorm && G.brainstorm.needed()) { hideBubble(true); G.brainstorm.open(); return; }   // (le grand point avant le jour 24)
    if (!canTalk()) return;
    const now = Date.now();
    if (now - lastTap > 30000) tapStep = 0;
    lastTap = now;
    const step = tapStep++ % 3;
    if (step === 0) { const o = objective(); say(o.text, o.expr, { ms: 9000 + o.text.length * 45 }); }
    else if (step === 1) { const o = progressText(); say(o.text, o.expr, { ms: 7000 + o.text.length * 45 }); }
    else { const p = pick(context()); say(p.t, p.e); }
  }

  /** Dans quelle ambiance parle-t-il ? */
  function context() {
    const S = G.store.get(), z = G.progress.zone(S.zone);
    if (S.view === 'map') return 'map';
    if (z && z.danger && Math.random() < 0.65) return 'danger';
    return 'idle';
  }
  function speak(pool) {
    if (!canTalk()) return;
    const p = pick(pool || context());
    say(p.t, p.e);
  }
  /** Un mot après un petit délai, si la situation n'a pas changé entre-temps. */
  function later(pool, ms, check) {
    setTimeout(() => {
      if (!canTalk() || Date.now() - lastSay < 12000) return;
      if (check && !check()) return;
      speak(pool);
    }, ms);
  }
  const onView = (view) => {
    const S = G.store.get(), z = G.progress.zone(S.zone);
    if (view === 'map') later('map', 2600, () => G.store.get().view === 'map');
    else if (z && z.danger) later('danger', 4500, () => G.store.get().view === 'zone' && G.store.get().zone === z.id);
  };
  const afterChapter = () => later('progress', 3600);

  /* ---------- affichage & minuterie ---------- */
  function refresh() {
    const e = grab();
    const has = G.progress.hasFlocon();
    e.root.classList.toggle('hidden', !has);
    e.root.classList.toggle('bs-ready', has && !!(G.brainstorm && G.brainstorm.needed()));   // Flocon brille : c'est l'heure du grand point
    if (has && !wasShown) { wasShown = true; setSprite('content', true); e.sprite.classList.remove('swap'); void e.sprite.offsetWidth; e.sprite.classList.add('pop'); nextAt = Date.now() + 25000; }
    if (!has) { wasShown = false; lastExpr = null; }
    const ok = canTalk();
    if (!ok && !e.bubble.hidden) hideBubble(true);
    if (ok && !wasTalkable) nextAt = Math.max(nextAt, Date.now() + 14000);   // il laisse un instant de calme après chaque interruption
    wasTalkable = ok;
  }
  function init() {
    const e = grab();
    e.btn.addEventListener('click', onTap);
    e.bubble.addEventListener('click', () => hideBubble());
    setInterval(() => {
      refresh();
      if (canTalk() && e.bubble.hidden && Date.now() >= nextAt) speak();
    }, 3000);
    refresh();
  }

  /* ---------- Flocon dans le sac (phrases « curiosité et maladresse ») ---------- */
  function embed() {
    const img = h('img', { alt: 'Flocon', draggable: 'false', src: G.dlg.spriteSrc('cherche') });
    const pic = h('button', { class: 'fl-pic', type: 'button', 'aria-label': 'Flocon', onclick: () => talk() }, img);
    const bubble = h('div', { class: 'fl-bubble', hidden: true });
    const root = h('div', { class: 'inv-flocon' }, pic, bubble);
    let tm = null, stopped = false;
    // Rythme des phrases dans le sac : chaque phrase reste affichée au moins BAG_MIN ms (plus longtemps si elle est longue).
    const BAG_MIN = 26000, BAG_PER_CHAR = 120;
    function talk() {
      if (stopped) return;
      const p = pick('bag');
      img.src = G.dlg.spriteSrc(p.e);
      bubble.hidden = false; bubble.textContent = p.t;
      bubble.style.animation = 'none'; void bubble.offsetWidth; bubble.style.animation = '';
      clearTimeout(tm);
      tm = setTimeout(talk, BAG_MIN + String(p.t).length * BAG_PER_CHAR);   // (toucher Flocon fait parler tout de suite et relance l'attente)
    }
    tm = setTimeout(talk, 700);
    return { el: root, talk, stop() { stopped = true; clearTimeout(tm); } };
  }

  G.companion = { init, refresh, say, speak, onView, afterChapter, objective, progressText, embed, canTalk };
})();
