/* ==========================================================================
   PANNEAUX — fenêtres parchemin : inventaire, étoile, journal, calendrier,
   paramètres, saisie des codes (cadeau du jour / objet du sac), confirmations, acquisition d'objet.
   ========================================================================== */
(function () {
  const G = window.Game;
  const { $, h, sleep } = G;
  const stack = [];
  const inv = { selected: null, detail: null };

  /* ---------- fenêtre générique ---------- */
  function openModal(o) {
    const root = $('#modal-root');
    const body = h('div', { class: 'modal-body' });
    const foot = h('footer', { class: 'modal-foot' });
    const closeBtn = o.dismissible === false ? null : h('button', { class: 'modal-x', 'aria-label': 'Fermer', onclick: () => api.close() }, '×');
    const modal = h('div', { class: 'modal panel parchment ' + (o.className || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || '' },
      h('header', { class: 'modal-head' }, h('h2', null, o.title || ''), closeBtn), body, foot);
    const back = h('div', { class: 'modal-back' }, modal);
    const entry = { el: back, onClose: o.onClose, dismissible: o.dismissible !== false };
    const api = {
      el: modal, body, foot,
      close(result) { const i = stack.indexOf(entry); if (i >= 0) stack.splice(i, 1); back.classList.add('out'); setTimeout(() => back.remove(), 180); updateRoot(); if (entry.onClose) entry.onClose(result); },
      setButtons(btns) { foot.innerHTML = ''; (btns || []).forEach((b) => foot.append(h('button', { class: 'btn ' + (b.class || ''), onclick: () => b.onClick(api), disabled: b.disabled }, b.label))); foot.hidden = !(btns && btns.length); }
    };
    if (typeof o.content === 'function') o.content(body, api); else if (o.content) body.append(o.content);
    api.setButtons(o.buttons);
    if (entry.dismissible) back.addEventListener('mousedown', (e) => { if (e.target === back) api.close(); });
    stack.push(entry);
    root.append(back);
    updateRoot();
    G.audio.sfx('page');
    setTimeout(() => { const f = modal.querySelector('input, textarea, .btn.primary, .modal-x'); if (f && o.focus !== false) f.focus({ preventScroll: true }); }, 60);
    return api;
  }
  function updateRoot() { document.body.classList.toggle('modal-open', stack.length > 0); }
  function closeTop() { const t = stack[stack.length - 1]; if (t && t.dismissible) { t.el.querySelector('.modal-x')?.click(); return true; } return false; }
  function closeAll() { [...stack].forEach((t) => { t.el.remove(); if (t.onClose) t.onClose(); }); stack.length = 0; updateRoot(); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && closeTop()) e.preventDefault(); });
  const isOpen = () => stack.length > 0;

  function confirmDialog(o) {
    return new Promise((resolve) => {
      let result = false;
      const m = openModal({
        title: o.title, className: 'small', dismissible: o.dismissible !== false,
        content: (b) => b.append(h('p', { html: G.rich(o.text) })),
        buttons: [
          { label: o.no || 'Annuler', class: 'ghost', onClick: (a) => { result = false; a.close(); } },
          { label: o.yes || 'Oui', class: o.danger ? 'danger' : 'primary', onClick: (a) => { result = true; a.close(); } }
        ],
        onClose: () => resolve(result), focus: false
      });
      if (o.danger) setTimeout(() => m.foot.querySelector('.ghost')?.focus(), 80);
    });
  }
  function toast(text, ms) {
    const t = h('div', { class: 'toast' }, text);
    $('#toasts').append(t);
    setTimeout(() => t.classList.add('out'), ms || 3600);
    setTimeout(() => t.remove(), (ms || 3600) + 400);
  }

  /* ---------- inventaire ---------- */
  function owned() { return G.store.itemList(); }
  function select(id) {
    inv.selected = id;
    G.hud.refresh();
  }
  const selected = () => inv.selected;

  function recipeFor(a, b) { return (G.data.recipes || []).find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a)); }

  async function tryCombine(a, b) {
    const r = recipeFor(a, b);
    if (!r) { toast("Ces deux objets ne semblent pas aller ensemble… pour l'instant."); G.audio.sfx('soft_error'); return false; }
    if (G.store.hasItem(r.result)) { toast('Tu as déjà fabriqué cet objet.'); return true; }
    closeAll();
    inv.selected = null;
    G.store.giveItem(r.result);
    G.store.log('item', `Objet fabriqué : ${G.data.items[r.result].name}`, G.chapter.currentDay(), 'craft:' + r.result);
    if (!G.chapter.isActive()) {
      await G.chapter.mini(r.lines || []);
    } else if (r.lines && r.lines.length) toast(G.plain(r.lines[r.lines.length - 1].text));
    await acquire(r.result, { label: 'Objet fabriqué !' });
    G.hud.refresh();
    openInventory(r.result);
    return true;
  }

  function openInventory(focusId) {
    const items = owned();
    const total = G.config.fragmentsTotal;
    let tab = 'items';
    let cur = focusId || inv.detail || (items[0] && items[0].id) || null;
    const emb = G.progress.hasFlocon() ? G.companion.embed() : null;    // Flocon, dans le sac : il commente tes trouvailles
    const m = openModal({
      title: "Mon inventaire", className: 'inventory', onClose: () => { inv.detail = cur; if (emb) emb.stop(); },
      content: (body) => render(body)
    });
    function render(body) {
      body = body || m.body;
      body.innerHTML = '';
      const noFlocon = !G.progress.hasFlocon();
      const tabs = h('div', { class: 'tabs', role: 'tablist' },
        h('button', { class: 'tab' + (tab === 'items' ? ' on' : ''), role: 'tab', onclick: () => { tab = 'items'; render(); } }, `Objets (${items.length})`),
        h('button', { class: 'tab' + (tab === 'star' ? ' on' : ''), role: 'tab', onclick: () => { tab = 'star'; render(); } }, `L'Étoile (${G.store.get().fragments.length}/${total})`),
        h('span', { class: 'tabs-fill' }),
        h('button', { class: 'btn small primary code-open' + (noFlocon ? ' attn' : ''), onclick: () => redeemFromBag() }, '✦ Entrer un code objet'));
      body.append(tabs, tab === 'items' ? renderItems() : renderStar());
      if (emb) body.append(emb.el);
    }
    function renderItems() {
      const wrap = h('div', { class: 'inv-wrap' });
      const grid = h('div', { class: 'inv-grid' });
      for (let i = 0; i < total; i++) {
        const it = items[i];
        if (!it) { grid.append(h('div', { class: 'slot empty', 'aria-hidden': 'true' })); continue; }
        const def = G.data.items[it.id];
        const b = h('button', {
          class: 'slot' + (cur === it.id ? ' on' : '') + (inv.selected === it.id ? ' picked' : '') + (it.used ? ' used' : ''), 'aria-label': def.name, title: def.name,
          onclick: async () => {
            if (inv.selected && inv.selected !== it.id) { const ok = await tryCombine(inv.selected, it.id); if (ok) return; }
            cur = it.id; render();
          }
        }, h('span', { class: 'slot-art', html: G.itemArt(it.id) }));
        grid.append(b);
      }
      const detail = h('div', { class: 'inv-detail' });
      if (!cur || !G.store.hasItem(cur)) {
        detail.append(items.length
          ? h('p', { class: 'muted' }, 'Touche un objet pour le regarder de plus près.')
          : h('div', { class: 'inv-empty' }, h('span', { class: 'gift-ico', html: G.icons.gift }),
              h('p', null, "Ton sac est vide pour l'instant."),
              h('p', { class: 'muted' }, "Quand tu reçois un objet dans la vraie vie, recopie son code avec le bouton « Entrer un code objet » : il apparaîtra ici.")));
      } else {
        const def = G.data.items[cur], st = G.store.get().items[cur];
        const isSel = inv.selected === cur;
        const origin = def.origin || (def.gift ? `cadeau du jour ${def.day}` : 'objet fabriqué');
        const usable = def.usable !== false;
        detail.append(
          h('div', { class: 'det-art', html: G.itemArt(cur) }),
          h('div', { class: 'det-txt' },
            h('h3', null, def.name),
            h('p', null, def.desc),
            h('p', { class: 'meta' }, `Obtenu le ${G.fmtDate(st.at)} · ${origin}`),
            usable ? h('p', { class: 'meta' }, st.used ? '✔ Déjà utilisé : il reste dans ton sac.' : 'Précieusement gardé dans ton sac.') : null,
            usable ? h('button', { class: 'btn ' + (isSel ? '' : 'primary'), onclick: () => { inv.selected = isSel ? null : cur; G.hud.refresh(); render(); } }, isSel ? 'Désélectionner' : 'Sélectionner') : null,
            usable && isSel ? h('p', { class: 'tip' }, "Sélectionné : touche un lieu pour l'utiliser, ou un autre objet ici pour essayer de les combiner.") : null));
      }
      wrap.append(grid, detail);
      return wrap;
    }
    function renderStar() { return starPanel(); }
  }

  function starPanel() {
    const S = G.store.get();
    const set = new Set(S.fragments);
    const wrap = h('div', { class: 'star-panel' });
    const svg = G.fx.starSVG(set);
    const list = h('ol', { class: 'frag-list' });
    for (let d = 1; d <= 24; d++) {
      const got = set.has(d);
      list.append(h('li', { class: got ? 'got' : '' }, h('b', null, String(d)), h('span', null, got ? G.progress.placeOf(d) : '???')));
    }
    wrap.append(h('div', { class: 'star-big' }, svg),
      h('div', { class: 'star-txt' },
        h('p', { class: 'big' }, `${set.size} fragment${set.size > 1 ? 's' : ''} sur 24`),
        h('p', { class: 'muted' }, "Chaque chapitre terminé te rapproche de l'Étoile d'Hiver. Elle compte douze branches, partagées en vingt-quatre éclats."),
        list));
    return wrap;
  }
  function openStar() { openModal({ title: "L'Étoile d'Hiver", className: 'starwin', content: (b) => b.append(starPanel()) }); }

  /* ---------- journal d'aventure : l'histoire, le carnet d'indices (par zones) et les personnages ---------- */
  const DOC_ICON = { lettre: '✉', note: '✎', page: '❦', carte: '⌖', plan: '⌗', souvenir: '✦', registre: '❖', chronique: '❡', echo: '♪', symbole: '✺' };

  /** Un bloc d'une page du carnet : paragraphe, tableau, liste ou note en italique. */
  function docBlock(blk) {
    if (typeof blk === 'string') return h('p', { html: G.rich(blk) });
    if (blk.note) return h('p', { class: 'pz-note', html: G.rich(blk.note) });
    return G.puzzles.materialNode(Object.assign({ class: 'plain' }, blk));
  }
  /** Le contenu d'une page du carnet, en éléments (réutilisé par les indices épinglés d'une énigme). */
  const docNodes = (def) => (def.body || []).map(docBlock);
  const docZone = (def) => { const z = G.progress.zoneOf((def && def.day) || 1); return z ? z.id : 1; };

  /** Une information orale de la fiche d'un personnage est-elle déjà « passée » dans l'histoire ? */
  function factOpen(f) {
    const S = G.store.get(), d = f.day, def = G.progress.def(d);
    if (G.store.isDone(d)) return true;
    if (f.when === 'intro') return G.store.seen(`d${d}:intro`);
    if (f.when === 'gift') return G.store.seen(`d${d}:giftAfter`);
    if (f.when === 'puzzle') return !!(def && S.puzzles[def.puzzle] && S.puzzles[def.puzzle].solved);
    return false;
  }
  const factsOf = (p) => (p.facts || []).filter(factOpen);

  /** Le prologue : un résumé du début de l'histoire (data/days.js → Game.data.prologue). */
  const prologueText = () => G.data.prologue || [];

  /** Ouvre le journal ; o.tab = 'story' | 'docs' | 'people' ; o.doc = document à lire en premier. */
  function openJournal(o) {
    o = o || {};
    let tab = o.tab || 'story', curDoc = o.doc || null, zoneSel = null, curPerson = o.person || null;
    const S = () => G.store.get();
    const TITLES = { story: "Journal d'aventure", docs: "Carnet d'indices", people: 'Personnages', souv: 'Album de souvenirs' };
    let lastKey = '';                                   // (avant openModal : le premier rendu s'en sert)
    const m = openModal({ title: TITLES[tab], className: 'journal', content: (b) => render(b) });
    const fin = G.souvenirs ? G.souvenirs.checkFinal() : [];                 // (la grande photo de l'album, si elle vient d'être méritée)
    if (fin.length) setTimeout(() => G.souvenirs.show(fin).then(() => render()), 500);
    function render(b) {
      b = b || m.body;
      // garder la position des barres de défilement d'un rendu à l'autre (seule la page lue repart en haut si on en change)
      const key = tab + '|' + zoneSel + '|' + (tab === 'people' ? curPerson : curDoc);
      const keep = { body: b.scrollTop, list: (b.querySelector('.nb-list') || {}).scrollTop || 0, page: (b.querySelector('.nb-page') || {}).scrollTop || 0, wrap: (b.querySelector('.nb-wrap') || {}).scrollTop || 0, sameTab: lastKey.split('|')[0] === tab, samePage: lastKey === key };
      b.innerHTML = '';
      const head = b.parentElement && b.parentElement.querySelector('h2');
      if (head) head.textContent = TITLES[tab];
      const nPeople = G.data.people.filter((p) => factsOf(p).length).length;
      const tabBtn = (k, label) => h('button', { class: 'tab' + (tab === k ? ' on' : ''), role: 'tab', 'aria-selected': String(tab === k), onclick: () => { tab = k; render(); } }, label);
      b.append(h('div', { class: 'tabs', role: 'tablist' },
        tabBtn('story', "L'histoire jusqu'ici"),
        tabBtn('docs', `Carnet d'indices (${G.store.docList().filter((d) => G.store.docDef(d.id)).length})`),
        tabBtn('people', `Personnages (${nPeople}/${G.data.people.length})`),
        G.souvenirs ? tabBtn('souv', `Souvenirs (${G.souvenirs.count()}/${G.souvenirs.total()})`) : null),
        tab === 'story' ? story() : tab === 'docs' ? docs() : tab === 'souv' ? G.souvenirs.albumTab() : people());
      lastKey = tab + '|' + zoneSel + '|' + (tab === 'people' ? curPerson : curDoc);
      if (keep.sameTab) {
        b.scrollTop = keep.body;
        const l = b.querySelector('.nb-list'); if (l) l.scrollTop = keep.list;
        const w = b.querySelector('.nb-wrap'); if (w) w.scrollTop = keep.wrap;
        const pg = b.querySelector('.nb-page'); if (pg && keep.samePage) pg.scrollTop = keep.page;
      }
    }

    /* --- le carnet : indices physiques, rangés par zone --- */
    function docs() {
      const list = G.store.docList().filter((d) => G.store.docDef(d.id));
      const wrap = h('div', { class: 'nb' });
      const pz = G.puzzles.pinnableNow();                    // une énigme est à l'écran : on peut y épingler des indices
      if (!list.length) {
        wrap.append(h('p', { class: 'muted' }, "Ton carnet est encore vide. Les lettres, pages, plans et relevés que tu trouveras en chemin viendront s'y ranger : relis-les, ils servent souvent à comprendre une énigme."));
        return wrap;
      }
      const byZone = {};
      list.forEach((d) => { (byZone[docZone(G.store.docDef(d.id))] = byZone[docZone(G.store.docDef(d.id))] || []).push(d); });
      if (curDoc && G.store.hasDoc(curDoc) && !zoneSel) zoneSel = docZone(G.store.docDef(curDoc));
      if (!zoneSel) {
        const cd = G.chapter.currentDay();
        zoneSel = cd ? G.progress.zoneOf(cd).id : docZone(G.store.docDef(list[list.length - 1].id));
      }
      const zones = h('div', { class: 'nb-zones', role: 'tablist', 'aria-label': 'Zones' });
      G.data.zones.forEach((z) => {
        const n = (byZone[z.id] || []).length, known = n > 0 || S().zonesSeen.includes(z.id);
        zones.append(h('button', { class: 'nb-zone' + (zoneSel === z.id ? ' on' : '') + (known ? '' : ' locked'), role: 'tab', 'aria-selected': String(zoneSel === z.id), disabled: !known,
          onclick: () => { zoneSel = z.id; curDoc = null; render(); } },
          h('small', null, 'Zone ' + z.id), h('span', null, known ? z.short : '???'), known ? h('b', null, String(n)) : null));
      });
      if (pz) wrap.append(h('p', { class: 'nb-tip' }, '📌 Touche « Épingler » sur les indices utiles à l’énigme : ils resteront affichés pendant que tu cherches.'));
      wrap.append(zones);
      const here = byZone[zoneSel] || [];
      if (!here.length) {
        wrap.append(h('p', { class: 'muted nb-empty' }, "Tu n'as encore trouvé aucun indice dans cette zone."));
        return wrap;
      }
      if (!curDoc || !here.some((d) => d.id === curDoc)) curDoc = here[0].id;   // (la 1re page de la zone : rien n'est mis en avant)
      const side = h('div', { class: 'nb-list', role: 'tablist' });
      here.forEach((d) => {
        const def = G.store.docDef(d.id);
        side.append(h('button', { class: 'nb-item' + (curDoc === d.id ? ' on' : '') + (d.def ? ' is-note' : ''), role: 'tab', onclick: () => { curDoc = d.id; render(); } },
          h('i', { 'aria-hidden': 'true' }, DOC_ICON[def.kind] || '✉'), h('span', null, def.title),
          pz && G.store.isPinned(d.id) ? h('em', { class: 'nb-pin', 'aria-label': 'épinglé', title: 'Épinglé' }, '📌') : null));
      });
      const def = G.store.docDef(curDoc);
      const pinned = G.store.isPinned(curDoc);
      const pinBtn = pz ? h('button', { class: 'btn small pin-btn' + (pinned ? ' on' : ''), type: 'button', 'aria-pressed': String(pinned),
        onclick: () => { G.store.pin(curDoc, !pinned); G.puzzles.refreshPins(); if (!pinned) toast('📌 Indice épinglé : tu le retrouveras dans l’énigme.', 2400); render(); } },
        pinned ? '📌 Épinglé · retirer' : '📌 Épingler pour l’énigme') : null;
      const page = h('article', { class: 'nb-page kind-' + (def.kind || 'lettre') },
        h('header', { class: 'nb-page-head' }, h('div', null, h('small', null, def.from || ''), h('h3', null, def.title)), pinBtn),
        docNodes(def));
      wrap.append(h('div', { class: 'nb-wrap' }, side, page));
      return wrap;
    }

    /* --- les personnages : ce que chacun t'a dit à l'oral --- */
    function people() {
      const wrap = h('div', { class: 'nb-wrap pp-wrap' });
      const rows = G.data.people.map((p) => ({ p, facts: factsOf(p) }));
      if (!curPerson || !rows.some((r) => r.p.id === curPerson)) curPerson = (rows.filter((r) => r.facts.length).pop() || rows[0]).p.id;
      const portrait = (p, met) => {
        const form = p.char === 'veilleur' ? (G.store.isDone(18) || G.store.seen('d18:intro') ? 'homme' : 'ombre') : null;
        const sp = G.chars.sprite(p.char, form, null);
        return h('img', { src: sp ? sp.src : '', alt: met ? p.name : '', class: 'pp-face' + (met ? '' : ' unknown') });
      };
      const side = h('div', { class: 'nb-list pp-list', role: 'tablist' });
      rows.forEach(({ p, facts }) => {
        const met = facts.length > 0;
        side.append(h('button', { class: 'nb-item pp-item' + (curPerson === p.id ? ' on' : '') + (met ? '' : ' unknown'), role: 'tab', 'aria-selected': String(curPerson === p.id), onclick: () => { curPerson = p.id; render(); } },
          h('i', { class: 'pp-av', 'aria-hidden': 'true' }, portrait(p, met)), h('span', null, met ? p.name : '???')));
      });
      const cur = rows.find((r) => r.p.id === curPerson), met = cur.facts.length > 0;
      const page = h('article', { class: 'nb-page pp-page' + (met ? '' : ' unknown') });
      if (!met) {
        page.append(h('header', null, h('small', null, 'Personnage'), h('h3', null, '???')),
          h('div', { class: 'pp-big' }, portrait(cur.p, false)),
          h('p', { class: 'muted' }, "Tu n'as pas encore rencontré ce personnage. Poursuis l'aventure : sa fiche se remplira au fil de ce qu'il te racontera."));
      } else {
        page.append(h('header', { class: 'pp-head' }, h('div', { class: 'pp-big sm' }, portrait(cur.p, true)), h('div', null, h('small', null, cur.p.role), h('h3', null, cur.p.name))),
          h('p', { class: 'pp-intro' }, "Ce que ce personnage t'a raconté, dans l'ordre où tu l'as appris :"),
          h('ul', { class: 'pp-facts' }, cur.facts.map((f) => h('li', null, h('b', null, 'Jour ' + f.day), h('span', { html: G.rich(f.text) })))));
      }
      wrap.append(side, page);
      return wrap;
    }

    /* --- l'histoire : un chapitre n'apparaît qu'une fois terminé (pas de spoil) --- */
    function story() {
      const wrap = h('div', { class: 'jr-story' });
      const begun = G.store.seen('d1:intro:begun') || G.store.dayState(1).status !== 'new';
      if (!begun) { wrap.append(h('p', { class: 'muted' }, "Ton aventure n'a pas encore commencé. Touche un lieu éclairé pour ouvrir le premier chapitre.")); return wrap; }
      wrap.append(h('article', { class: 'chap prologue' },
        h('h3', null, h('span', { class: 'num' }, 'Prologue'), " L'Étoile brisée"),
        prologueText().map((t) => h('p', { class: 'narr', html: G.rich(t) }))));
      for (let d = 1; d <= 24; d++) {
        const st = G.store.dayState(d);
        if (st.status === 'new') continue;
        const def = G.progress.def(d);
        if (st.status !== 'done') {                         // chapitre en cours : rien n'est dévoilé avant la fin
          wrap.append(h('article', { class: 'chap pending' },
            h('h3', null, h('span', { class: 'num' }, 'Jour ' + d), ' Chapitre en cours…'),
            h('p', { class: 'where' }, G.progress.placeOf(d)),
            h('p', { class: 'muted' }, "Le récit de ce jour s'écrira quand tu auras terminé le chapitre.")));
          continue;
        }
        wrap.append(h('article', { class: 'chap done' },
          h('h3', null, h('span', { class: 'num' }, 'Jour ' + d), ' ' + def.title),
          h('p', { class: 'where' }, G.progress.placeOf(d)),
          h('p', { html: G.rich(def.summary) }),
          !G.chapter.isActive() ? h('button', { class: 'btn small', onclick: () => { closeAll(); G.chapter.replay(d); } }, 'Revoir ce chapitre') : null));
      }
      return wrap;
    }
  }

  /* ---------- calendrier ---------- */
  function openCalendar() {
    const m = openModal({ title: 'Calendrier de l\'Avent', className: 'calendar', content: (b) => {
      const S = G.store.get();
      const nd = G.progress.nextDay();
      let intro = '';
      if (!G.progress.hasFlocon()) intro = "Le royaume attend encore son compagnon : ouvre ton sac et entre le code de Flocon.";
      else if (nd) {
        const st = G.progress.spotStatus(nd);
        if (st.reason === 'date') intro = `Prochaine porte : le jour ${nd}, le ${G.time.long(G.time.unlockDate(nd))}.`;
        else intro = `Le jour ${nd} t'attend : ${G.progress.placeOf(nd)}.`;
      } else intro = "Tous les chapitres sont terminés. Quelle aventure !";
      b.append(h('p', { class: 'cal-intro' }, intro));
      G.data.zones.forEach((z) => {
        // le nom d'une zone n'est dévoilé qu'une fois la zone découverte
        b.append(h('h3', { class: 'cal-zone' }, `Zone ${z.id} · ${G.store.zoneUnlocked(z.id) ? z.short : '???'}`));
        const grid = h('div', { class: 'cal-grid' });
        G.progress.daysOf(z).forEach((d) => {
          const info = G.progress.spotStatus(d);
          const card = h('button', { class: `cal-day st-${info.status}` + (info.reason ? ' lock-' + info.reason : ''),
            'aria-label': `Jour ${d}` + (info.status === 'done' ? ' terminé' : info.status === 'locked' ? ' verrouillé' : ''),
            onclick: () => { m.close(); G.chapter.goToDay(d); } },
            h('b', null, String(d)),
            h('span', null, info.status === 'locked' ? (!G.time.isUnlocked(d) ? G.time.short(G.time.unlockDate(d)) : '…') : G.progress.placeOf(d)),
            info.status === 'done' ? h('i', { class: 'check', html: G.icons.star }) : (info.status === 'locked' ? h('i', { class: 'lock', html: G.icons.lock }) : null));
          grid.append(card);
        });
        b.append(grid);
      });
    } });
  }

  /* ---------- paramètres ---------- */
  function openSettings() {
    const m = openModal({ title: 'Paramètres', className: 'settings', content: (b) => {
      const S = G.store.get();
      const sw = (label, on, fn) => { const bt = h('button', { class: 'switch' + (on ? ' on' : ''), role: 'switch', 'aria-checked': String(!!on), onclick: () => { const v = !bt.classList.contains('on'); bt.classList.toggle('on', v); bt.setAttribute('aria-checked', String(v)); fn(v); } }, h('i')); return h('label', { class: 'row' }, h('span', null, label), bt); };
      const vol = h('input', { type: 'range', min: 0, max: 100, value: Math.round(G.audio.getVolume() * 100), 'aria-label': 'Volume', oninput: () => { G.audio.setVolume(vol.value / 100); S.audio.volume = vol.value / 100; G.store.save(); } });
      b.append(
        h('h3', null, 'Son'),
        sw('Musique d\'ambiance', G.audio.isMusic(), (v) => { G.audio.setMusic(v); S.audio.music = v; G.store.save(); G.hud.refresh(); }),
        sw('Bruitages', G.audio.isSfx(), (v) => { G.audio.setSfx(v); S.audio.sfx = v; G.store.save(); }),
        h('label', { class: 'row' }, h('span', null, 'Volume'), vol),
        h('h3', null, 'Sauvegarde'),
        h('p', { class: 'muted' }, G.store.canSave() ? "Ta progression est enregistrée automatiquement sur cet appareil." : "⚠ Ce navigateur bloque l'enregistrement automatique (navigation privée ?). Utilise l'export ci-dessous pour ne rien perdre."),
        h('div', { class: 'row wrap' },
          h('button', { class: 'btn', onclick: () => saveCode() }, 'Exporter ma sauvegarde'),
          h('button', { class: 'btn', onclick: () => loadCode() }, 'Importer une sauvegarde')),
        h('h3', null, 'Recommencer'),
        h('button', { class: 'btn danger', onclick: async () => {
          const ok = await confirmDialog({ title: "Recommencer l'aventure ?", text: G.progress.beforeStart() ? "Tout sera effacé. **Cette action est définitive.**" : "Tout sera effacé : chapitres, objets, codes déjà saisis, carnet d'indices. **Cette action est définitive.**", yes: 'Oui, tout effacer', no: 'Non, garder ma progression', danger: true });
          if (ok) { G.store.reset(); location.reload(); }
        } }, "Recommencer l'aventure"),
        h('p', { class: 'muted small' }, G.config.title + (G.progress.beforeStart() ? '' : ' · un calendrier de l\'Avent fait main, rien que pour toi.')));
    } });
  }
  function saveCode() {
    const code = G.store.exportCode();
    const ta = h('textarea', { readonly: true, rows: 5, class: 'codebox' }, code);
    openModal({ title: 'Ma sauvegarde', className: 'small', content: (b) => b.append(h('p', null, 'Copie ce texte et garde-le précieusement (message à toi-même, notes…). Tu pourras le coller dans « Importer une sauvegarde ».'), ta),
      buttons: [{ label: 'Copier', class: 'primary', onClick: () => { ta.select(); try { navigator.clipboard.writeText(code); toast('Sauvegarde copiée !'); } catch (e) { document.execCommand('copy'); toast('Sauvegarde copiée !'); } } }] });
  }
  function loadCode() {
    const ta = h('textarea', { rows: 5, class: 'codebox', placeholder: 'Colle ici ta sauvegarde…' });
    openModal({ title: 'Importer une sauvegarde', className: 'small', content: (b) => b.append(h('p', null, "Cela remplacera la progression actuelle."), ta),
      buttons: [{ label: 'Importer', class: 'primary', onClick: (a) => {
        if (G.store.importCode(ta.value)) { a.close(); toast('Sauvegarde importée !'); setTimeout(() => location.reload(), 600); }
        else { toast("Hmm, ce texte n'a pas l'air d'une sauvegarde valide."); G.audio.sfx('soft_error'); }
      } }] });
  }

  /* ---------- saisie d'un code ---------- */
  function codeField(onSubmit) {
    const msg = h('p', { class: 'code-msg', 'aria-live': 'polite' });
    const input = h('input', { type: 'text', class: 'code-input', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', placeholder: 'CODE', 'aria-label': 'Code de la carte' });
    const form = h('form', { class: 'code-form', onsubmit: (e) => { e.preventDefault(); onSubmit(); } }, input);
    const fail = (r) => {
      msg.textContent = G.redeem.failText(r);
      msg.className = 'code-msg' + (r.reason === 'empty' ? '' : ' bad');
      if (r.reason !== 'empty') { G.fx.shake(input); G.audio.sfx('soft_error'); input.select(); }
    };
    return { msg, input, form, fail };
  }

  /** Pendant un chapitre : le code du cadeau du jour (day). Résout 'ok' ou 'later'. */
  function codeEntry(day) {
    return new Promise((resolve) => {
      let outcome = 'later';
      const f = codeField(() => submit());
      let api = null;
      const submit = () => {
        const r = G.redeem.check(f.input.value, day);
        if (!r.ok) return f.fail(r);
        G.redeem.commit(r.key); outcome = 'ok'; api.close();
      };
      api = openModal({
        title: `Le cadeau du jour ${day}`, className: 'codewin', dismissible: false,
        content: (b) => b.append(
          h('div', { class: 'gift-card' }, h('span', { class: 'gift-ico', html: G.icons.gift }),
            h('p', null, "Ouvre ton cadeau, puis recopie ici le code écrit sur la petite carte.")), f.form, f.msg),
        buttons: [
          { label: 'Je n\'ai pas encore ouvert mon cadeau', class: 'ghost', onClick: (a) => { outcome = 'later'; a.close(); } },
          G.config.dev ? { label: '(dev) Passer le code', class: 'ghost', onClick: (a) => { G.redeem.commit(String(day)); outcome = 'ok'; a.close(); } } : null,
          { label: 'Valider', class: 'primary', onClick: () => submit() }
        ].filter(Boolean),
        onClose: () => resolve(outcome)
      });
    });
  }

  /** Depuis le sac : n'importe quel code (Flocon, cadeaux…). Résout l'échange réussi, ou null. */
  function openItemCode() {
    return new Promise((resolve) => {
      let got = null, api = null;
      const f = codeField(() => submit());
      const submit = () => {
        const r = G.redeem.check(f.input.value);
        if (!r.ok) return f.fail(r);
        got = G.redeem.commit(r.key); api.close();
      };
      api = openModal({
        title: 'Entrer un code objet', className: 'codewin',
        content: (b) => b.append(
          h('div', { class: 'gift-card' }, h('span', { class: 'gift-ico', html: G.icons.gift }),
            h('p', null, "Tu as reçu un objet dans la vraie vie ? Recopie ici le code qui l'accompagne : l'objet apparaîtra dans ton sac.")), f.form, f.msg),
        buttons: [
          { label: 'Annuler', class: 'ghost', onClick: (a) => a.close() },
          { label: 'Valider', class: 'primary', onClick: () => submit() }
        ],
        onClose: () => resolve(got)
      });
    });
  }
  /** Bouton « Entrer un code objet » du sac : après l'échange, l'objet est montré ; Flocon, lui, apparaît dans le jeu. */
  async function redeemFromBag() {
    const got = await openItemCode();
    if (!got) return;
    closeAll();
    await acquire(got.item);
    if (got.item === 'flocon') { if (!G.chapter.isActive()) await G.chapter.floconArrives(); }
    else openInventory(got.item);
  }

  /* ---------- animation d'acquisition d'un objet ---------- */
  async function acquire(itemId, o) {
    o = o || {};
    const it = G.data.items[itemId];
    const card = h('div', { class: 'acquire' },
      h('div', { class: 'acq-ico', html: G.itemArt(itemId) }),
      h('div', { class: 'acq-txt' }, h('small', null, o.label || 'Nouvel objet !'), h('strong', null, it.name)));
    $('#fx-root').append(card);
    G.audio.sfx('acquire');
    const c = G.fx.center(); G.fx.sparkles(c.x, c.y - 20, 22, { spread: 110 });
    await sleep(G.reduceMotion() ? 900 : 1900);
    const from = G.fx.centerOf(card.querySelector('.acq-ico'));
    card.classList.add('out');
    const target = $('#btn-inventory');
    G.fx.fly(from, target, G.itemArt(itemId), { size: 72, dur: 900 });
    await sleep(850);
    card.remove();
    G.hud.refresh();
  }

  /** Un document vient d'être trouvé : on l'annonce, on le montre EN ENTIER pour que la joueuse le lise,
      puis il rejoint le carnet (la suite du dialogue n'arrive qu'après « Continuer »). */
  async function acquireDoc(docId, o) {
    o = o || {};
    const d = G.store.docDef(docId);
    if (!d) return;
    const card = h('div', { class: 'acquire doc' },
      h('div', { class: 'acq-ico doc-ico', 'aria-hidden': 'true' }, DOC_ICON[d.kind] || '✉'),
      h('div', { class: 'acq-txt' }, h('small', null, d.def ? 'Nouvelle note !' : 'Nouveau document !'), h('strong', null, d.title)));
    $('#fx-root').append(card);
    G.audio.sfx('page');
    const c = G.fx.center(); G.fx.sparkles(c.x, c.y - 20, 16, { spread: 90 });
    await sleep(G.reduceMotion() ? 600 : 1100);
    card.classList.add('out');
    setTimeout(() => card.remove(), 400);
    // la page, à lire tranquillement
    let flyFrom = G.fx.center();
    await new Promise((resolve) => {
      const m = openModal({
        title: d.title, className: 'docread', focus: false,
        content: (b) => b.append(h('article', { class: 'nb-page docread-page kind-' + (d.kind || 'lettre') },
          d.from ? h('header', { class: 'nb-page-head' }, h('div', null, h('small', null, d.from))) : null,
          docNodes(d))),
        buttons: [{ label: 'Ranger dans mon carnet ✦', class: 'primary', onClick: (a) => { flyFrom = G.fx.centerOf(a.el); a.close(); } }],
        onClose: resolve
      });
      setTimeout(() => { const b = m.foot.querySelector('.btn'); if (b) b.focus({ preventScroll: true }); }, 400);   // (pas tout de suite : un clic de dialogue ne doit pas la fermer par mégarde)
    });
    const fly = h('span', { class: 'doc-fly' }, DOC_ICON[d.kind] || '✉');
    G.fx.fly(flyFrom, $('#btn-journal'), fly.outerHTML, { size: 64, dur: 800 });
    await sleep(750);
    G.hud.refresh();
  }

  G.panels = { docNodes, acquireDoc, openNotebook: (doc) => openJournal({ tab: 'docs', doc }), openPeople: (person) => openJournal({ tab: 'people', person }), openModal, closeAll, closeTop, isOpen, confirmDialog, toast, openInventory, openStar, openJournal, openCalendar, openSettings, codeEntry, openItemCode, redeemFromBag, acquire, select, selected, tryCombine, starPanel };
})();
