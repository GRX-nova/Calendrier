/* ==========================================================================
   PROGRESS — règles d'accès : quel jour est jouable, pourquoi un lieu est verrouillé…
   ========================================================================== */
(function () {
  const G = window.Game;
  const C = G.config;

  const zones = () => G.data.zones;
  const zone = (id) => zones().find((z) => z.id === id);
  const zoneOf = (day) => zones().find((z) => day >= z.days[0] && day <= z.days[1]);
  const daysOf = (z) => { const a = []; for (let d = z.days[0]; d <= z.days[1]; d++) a.push(d); return a; };
  const def = (day) => G.data.days[day];
  const placeOf = (day) => { const z = zoneOf(day); return z && z.spots[day] ? z.spots[day].place : ''; };

  /** Flocon est-il arrivé ? (Il apparaît quand on entre le code de son objet dans le sac.) */
  const hasFlocon = () => G.store.hasItem('flocon');
  /** Avant le 1er jour (et sans Flocon) : le royaume dort. Rien ne doit laisser deviner qu'un compagnon ou des objets arrivent. */
  const beforeStart = () => !hasFlocon() && !G.time.isUnlocked(1);

  /** Statut d'un lieu : done | started | available | locked (+ reason: flocon | zone | date | seq). */
  function spotStatus(day) {
    const st = G.store.dayState(day);
    const z = zoneOf(day);
    if (st.status === 'done') return { status: 'done' };
    if (!G.store.zoneUnlocked(z.id)) return { status: 'locked', reason: 'zone' };
    if (!hasFlocon()) return { status: 'locked', reason: 'flocon' };
    if (!G.time.isUnlocked(day)) return { status: 'locked', reason: 'date', date: G.time.unlockDate(day) };
    if (C.sequentialProgress && day > 1 && !G.store.isDone(day - 1)) return { status: 'locked', reason: 'seq' };
    return { status: st.status === 'started' ? 'started' : 'available' };
  }
  const isPlayable = (day) => ['available', 'started'].includes(spotStatus(day).status);

  function lockMessage(day) {
    const s = spotStatus(day);
    const d = G.time.unlockDate(day);
    if (s.reason === 'date') return `Ce lieu s'éveillera le ${G.time.long(d)}${C.unlockHour ? ' à ' + C.unlockHour + ' h' : ''}. Patience, la magie ne se presse pas !`;
    if (s.reason === 'seq') return `Il faut d'abord terminer le chapitre du jour ${day - 1}, pour que l'histoire reste dans l'ordre.`;
    if (s.reason === 'flocon') return "Le village dort encore… Il manque un compagnon pour réveiller ce lieu. Ouvre ton sac et entre le code de Flocon.";
    if (s.reason === 'zone') return "Cette région n'est pas encore accessible. Continue l'aventure pour la débloquer.";
    return '';
  }

  const zoneDone = (z) => daysOf(z).every((d) => G.store.isDone(d));
  const zoneDoneCount = (z) => daysOf(z).filter((d) => G.store.isDone(d)).length;
  const nextZone = (z) => zone(z.id + 1);

  /** Prochain jour à jouer (pour guider le joueur). */
  function nextDay() {
    for (let d = 1; d <= 24; d++) { if (!G.store.isDone(d)) return d; }
    return null;
  }
  const isFinaleDone = () => G.store.isDone(24);

  /** Niveau de « magie » du château (0 = éteint, 1 = restauré) pour l'ambiance visuelle. */
  function castleMagic() {
    if (G.store.get().finaleSeen) return 1;
    const z = zone(4);
    return Math.min(0.85, (zoneDoneCount(z) / 6) * 0.85);
  }

  G.progress = { beforeStart, hasFlocon, zone, zoneOf, daysOf, def, placeOf, spotStatus, isPlayable, lockMessage, zoneDone, zoneDoneCount, nextZone, nextDay, isFinaleDone, castleMagic };
})();
