/* ==========================================================================
   STORE — état du jeu + sauvegarde automatique (localStorage).
   Tout ce qui doit survivre à la fermeture du navigateur passe par ici.
   ========================================================================== */
(function () {
  const G = window.Game;
  const C = G.config;
  const KEY = C.saveKey, BAK = C.saveKey + '::precedente';
  let S = null, timer = null, storageOK = true, listeners = [];

  const fresh = () => ({
    v: 1,
    createdAt: new Date().toISOString(),
    started: false,
    audio: { music: true, sfx: true, volume: 0.7 },
    zone: 1,                 // zone affichée
    view: 'zone',            // 'zone' | 'map'
    zonesUnlocked: [1],
    zonesSeen: [],
    days: {},                // { [jour]: { status:'started'|'done', seg, gate, openedAt, doneAt } }
    items: {},               // { [objet]: { at, used, usedAt, how, uses } }
    docs: {},                // { [document]: { at } } — le carnet d'indices (lettres, pages, plans…)
    pins: { pz: null, ids: [] }, // indices épinglés pour l'énigme en cours (pz = identifiant de l'énigme)
    codesUsed: {},           // { [jour ou objet]: date ISO } — codes déjà saisis (1 à 24, « flocon »…)
    fragments: [],           // jours dont le fragment est récupéré
    puzzles: {},             // { [id]: { solved, at } }
    places: {},              // { [jour]: date ISO de la 1re visite }
    seen: {},                // dialogues / segments déjà vus
    unlockedSeen: {},        // jours dont l'ouverture magique a déjà été jouée
    mapRevealed: [1],        // zones dont le panneau de la carte n'est plus caché par les nuages
    said: [],                // dernières phrases dites par Flocon (pour ne pas se répéter)
    journal: [],             // (ancien journal de bord, plus utilisé)
    finaleSeen: false
  });

  function probeStorage() {
    try { localStorage.setItem(KEY + '::test', '1'); localStorage.removeItem(KEY + '::test'); return true; } catch (e) { return false; }
  }

  function parse(raw) {
    if (!raw) return null;
    try { const o = JSON.parse(raw); return o && typeof o === 'object' ? o : null; } catch (e) { return null; }
  }

  function load() {
    storageOK = probeStorage();
    let data = null;
    if (storageOK) {
      data = parse(localStorage.getItem(KEY)) || parse(localStorage.getItem(BAK));
    }
    S = Object.assign(fresh(), data || {});
    // Garde-fous pour les champs imbriqués
    S.audio = Object.assign({ music: true, sfx: true, volume: 0.7 }, S.audio || {});
    if (!Array.isArray(S.mapRevealed)) S.mapRevealed = [1];
    (S.zonesSeen || []).forEach((z) => { if (!S.mapRevealed.includes(z)) S.mapRevealed.push(z); });
    if (!Array.isArray(S.said)) S.said = [];
    if (!S.docs || typeof S.docs !== 'object') S.docs = {};
    if (!S.pins || typeof S.pins !== 'object' || !Array.isArray(S.pins.ids)) S.pins = { pz: null, ids: [] };
    return S;
  }

  function writeNow() {
    if (!storageOK) return false;
    try {
      const prev = localStorage.getItem(KEY);
      if (prev) localStorage.setItem(BAK, prev);
      localStorage.setItem(KEY, JSON.stringify(S));
      return true;
    } catch (e) { storageOK = false; return false; }
  }
  function save(immediate) {
    clearTimeout(timer);
    if (immediate) writeNow(); else timer = setTimeout(writeNow, 120);
    listeners.forEach((fn) => { try { fn(S); } catch (e) { console.error(e); } });
  }
  window.addEventListener('pagehide', () => { clearTimeout(timer); writeNow(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { clearTimeout(timer); writeNow(); } });

  /* ---------- accès ---------- */
  const get = () => S;
  const onChange = (fn) => listeners.push(fn);
  const canSave = () => storageOK;

  const dayState = (id) => S.days[id] || { status: 'new', seg: 0 };
  function setDay(id, patch) { S.days[id] = Object.assign({ status: 'new', seg: 0 }, S.days[id] || {}, patch); save(); }
  const isDone = (id) => dayState(id).status === 'done';
  const doneCount = () => Object.values(S.days).filter((d) => d.status === 'done').length;

  const hasItem = (id) => !!S.items[id];
  function giveItem(id) {
    if (S.items[id]) return false;
    S.items[id] = { at: G.time.iso(), used: false };
    save();
    return true;
  }
  function useItem(id, how) {
    if (!S.items[id]) return;
    S.items[id].used = true; S.items[id].usedAt = G.time.iso(); if (how) S.items[id].how = how;
    S.items[id].uses = (S.items[id].uses || 0) + 1;
    save();
  }
  const itemList = () => Object.entries(S.items).sort((a, b) => a[1].at.localeCompare(b[1].at)).map(([id, v]) => Object.assign({ id }, v));

  /* ---------- le carnet : documents trouvés ---------- */
  const hasDoc = (id) => !!S.docs[id];
  function giveDoc(id) {
    if (S.docs[id]) return false;
    S.docs[id] = { at: G.time.iso() };
    save();
    return true;
  }
  const docList = () => Object.entries(S.docs).sort((a, b) => a[1].at.localeCompare(b[1].at)).map(([id, v]) => Object.assign({ id }, v));
  /** Une page de notes écrite par la joueuse (résultat d'une partie d'énigme) : elle porte sa propre définition. */
  function giveNote(id, def) {
    if (S.docs[id]) return false;
    S.docs[id] = { at: G.time.iso(), def };
    save();
    return true;
  }
  /** La définition d'un document du carnet : page du jeu (data/docs.js) ou note écrite en cours de route. */
  const docDef = (id) => (S.docs[id] && S.docs[id].def) || (G.data.docs && G.data.docs[id]) || null;

  /* ---------- les indices épinglés : ceux qu'on garde sous les yeux pendant une énigme ---------- */
  /** Début d'une énigme : si ce n'est pas celle dont on avait épinglé des indices (page rechargée), on repart à zéro. */
  function pinScope(pid) { if (S.pins.pz !== pid) { S.pins = { pz: pid, ids: [] }; save(); } }
  const pins = () => S.pins.ids.filter((id) => S.docs[id]);
  const isPinned = (id) => S.pins.ids.includes(id);
  function pin(id, on) {
    const has = S.pins.ids.includes(id);
    if (on && !has && S.docs[id]) S.pins.ids.push(id);
    else if (!on && has) S.pins.ids = S.pins.ids.filter((x) => x !== id);
    else return false;
    save();
    return true;
  }
  function clearPins() { if (S.pins.pz || S.pins.ids.length) { S.pins = { pz: null, ids: [] }; save(); } }

  const hasFragment = (day) => S.fragments.includes(day);
  function addFragment(day) { if (!S.fragments.includes(day)) { S.fragments.push(day); save(); return true; } return false; }

  /** (Le « journal de bord » a été supprimé : on ne garde plus de trace des événements. La fonction reste pour les anciens appels.) */
  function log() { /* rien */ }

  const seen = (key) => !!S.seen[key];
  function markSeen(key) { if (!S.seen[key]) { S.seen[key] = true; save(); } }

  function unlockZone(id) { if (!S.zonesUnlocked.includes(id)) { S.zonesUnlocked.push(id); save(); return true; } return false; }
  const zoneUnlocked = (id) => S.zonesUnlocked.includes(id);
  const mapRevealed = (id) => S.mapRevealed.includes(id);
  function revealOnMap(id) { if (!S.mapRevealed.includes(id)) { S.mapRevealed.push(id); save(); return true; } return false; }

  /* ---------- export / import / reset ---------- */
  function exportCode() {
    const json = JSON.stringify(S);
    return btoa(unescape(encodeURIComponent(json)));
  }
  function importCode(code) {
    try {
      const json = decodeURIComponent(escape(atob(String(code).trim())));
      const o = JSON.parse(json);
      if (!o || typeof o !== 'object' || o.v !== 1 || !o.days) return false;
      S = Object.assign(fresh(), o);
      if (!S.pins || typeof S.pins !== 'object' || !Array.isArray(S.pins.ids)) S.pins = { pz: null, ids: [] };
      save(true);
      return true;
    } catch (e) { return false; }
  }
  function reset() {
    clearTimeout(timer);
    try { localStorage.removeItem(KEY); localStorage.removeItem(BAK); localStorage.removeItem(KEY + '::photo'); } catch (e) { /* rien */ }
    const audio = S ? S.audio : undefined;
    S = fresh();
    if (audio) S.audio = audio;
    save(true);
  }

  G.store = { load, get, save, onChange, canSave, dayState, setDay, isDone, doneCount, hasItem, giveItem, useItem, itemList, hasDoc, giveDoc, giveNote, docDef, docList, pinScope, pins, isPinned, pin, clearPins, hasFragment, addFragment, log, seen, markSeen, unlockZone, zoneUnlocked, mapRevealed, revealOnMap, exportCode, importCode, reset };
})();
