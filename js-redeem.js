/* ==========================================================================
   REDEEM — les codes : transformer un objet de la vraie vie en objet du jeu.

   • Un code = une empreinte dans data/codes.js (jamais le code en clair).
     Clé numérique (1 à 24) → cadeau du jour ; clé texte (« flocon »…) → objet du sac.
   • Un code ne sert qu'une fois (S.codesUsed) et ne débloque QUE l'objet virtuel.
   • On peut le saisir dans le sac (« Entrer un code objet »), ou pendant le chapitre du cadeau.
   ========================================================================== */
(function () {
  const G = window.Game;

  function describe(key) {
    if (/^\d+$/.test(key)) {
      const day = Number(key), def = G.data.days && G.data.days[day];
      return { day, item: def && def.gift ? def.gift.item : null };
    }
    return { day: null, item: key };
  }

  /** Retrouve à quoi correspond un code saisi (sans rien modifier). */
  function lookup(raw) {
    if (!G.normCode(raw)) return { ok: false, reason: 'empty' };
    const table = G.data.codes || {};
    for (const key of Object.keys(table)) {
      if (G.hashCode(key, raw) === table[key]) {
        const d = describe(key);
        if (!d.item || !G.data.items[d.item]) continue;
        return Object.assign({ ok: true, key }, d);
      }
    }
    return { ok: false, reason: 'invalid' };
  }

  /** Vérifie un code. expectKey (facultatif) : le code attendu (cadeau d'un jour précis). */
  function check(raw, expectKey) {
    const r = lookup(raw);
    if (!r.ok) return r;
    if (expectKey != null && String(expectKey) !== r.key) return Object.assign({}, r, { ok: false, reason: 'other' });
    const S = G.store.get();
    if (S.codesUsed[r.key] || G.store.hasItem(r.item)) return Object.assign({}, r, { ok: false, reason: 'used' });
    return r;
  }

  /** Valide l'échange : l'objet entre dans le sac, le code est marqué comme utilisé. */
  function commit(key) {
    key = String(key);
    const d = describe(key), S = G.store.get();
    if (!d.item) return null;
    S.codesUsed[key] = G.time.iso();
    G.store.giveItem(d.item);
    const name = G.data.items[d.item].name;
    if (d.day) G.store.log('item', `Cadeau du jour ${d.day} : ${name}`, d.day, 'gift:' + d.day);
    else G.store.log('item', `Objet reçu : ${name}`, null, 'obj:' + d.item);
    G.store.save();
    return Object.assign({ key }, d);
  }

  /** Message doux à afficher selon la raison de l'échec. */
  function failText(r) {
    const d = G.data.defaults;
    if (r.reason === 'empty') return 'Recopie le code écrit sur la petite carte.';
    if (r.reason === 'used') return d.giftUsed;
    if (r.reason === 'other') return "Ce code est bien valide, mais il appartient à un autre objet. Tu pourras l'entrer depuis ton sac (« Entrer un code objet »).";
    return d.giftFail;
  }

  G.redeem = { lookup, check, commit, failText };
})();
