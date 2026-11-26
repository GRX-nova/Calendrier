/* ==========================================================================
   PERSONNAGES — Maître Givre, Dame Brume, Nox, Éloi, Mme Cannelle, le Vieux Grelot,
   Dame Plume, l'Ancienne Aurore et le Veilleur des Neiges.
   (Le catalogue — noms, formes, expressions — est dans data/characters.js ;
    les images sont dans assets/characters/<forme>/<expression>.webp.)

   Dans un dialogue (data/days.js) :
       Givre('mefiance', "Texte")                 Maître Givre, forme normale
       Givre.spectral('peur', "Texte")            Maître Givre, forme spectrale
       Veilleur.ombre('mystere', "Texte")         le Veilleur des Neiges, sous sa forme d'ombre à capuche
       Veilleur.homme('paix', "Texte")            … sous sa forme d'homme aux cheveux blancs
       Cannelle('joie', "Texte", { side: 'left' })    (côté de l'écran : 'left' / 'right')
       Veilleur.ombre('mystere', "Texte", { name: '???' })   (nom affiché différent)
   Les noms d'expression s'écrivent comme sur les planches, avec ou sans accent ni majuscule :
   « Méfiance », « mefiance », « colère froide », « colere_froide »…

   Moteur seulement (ne pas toucher sauf envie de modifier le fonctionnement).
   ========================================================================== */
(function () {
  const G = window.Game;

  /** « Colère froide » → « colere_froide » */
  const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const all = () => G.data.characters || {};

  let byName = null;
  function index() {
    byName = {};
    Object.entries(all()).forEach(([id, c]) => [id, c.name].concat(c.aliases || []).forEach((n) => { byName[norm(n)] = id; }));
  }
  /** Retrouve un personnage par son identifiant ou son nom (« Mme Cannelle », « le vieux grelot »…). */
  function find(nameOrId) {
    if (!byName) index();
    const k = norm(nameOrId);
    return byName[k] || byName[k.replace(/^(le|la|l)_/, '')] || null;
  }

  function form(id, formKey) {
    const c = all()[id];
    if (!c) return null;
    return c.forms[formKey || c.form] ? { key: formKey || c.form, f: c.forms[formKey || c.form] } : { key: c.form, f: c.forms[c.form] };
  }
  /** Chemin de l'image d'une expression (si elle n'existe pas : l'expression par défaut du personnage). */
  function sprite(id, formKey, expr) {
    const c = all()[id], fm = form(id, formKey);
    if (!c || !fm) { console.warn('[Personnages] personnage inconnu :', id); return null; }
    let key = norm(expr);
    if (!fm.f.expr[key]) {
      if (expr) console.warn(`[Personnages] « ${expr} » n'existe pas pour ${c.name} (${fm.key}) → « ${fm.f.default} » utilisée`);
      key = fm.f.default;
    }
    return { id, form: fm.key, expr: key, label: fm.f.expr[key], name: c.name, src: `${fm.f.dir}${key}.webp` };
  }

  /** Une réplique de personnage (voir le mode d'emploi en haut de ce fichier). */
  function line(id, formKey, expr, text, o) {
    return Object.assign({ who: 'char', char: id, form: formKey || null, expr: expr || null, text }, o || {});
  }

  /** Les constructeurs pour data/days.js : Givre(...), Givre.spectral(...), Veilleur.ombre(...) … */
  const speakers = {};
  function buildSpeakers() {
    Object.entries(all()).forEach(([id, c]) => {
      const name = id.charAt(0).toUpperCase() + id.slice(1);
      const fn = (expr, text, o) => line(id, null, expr, text, o);
      Object.keys(c.forms).forEach((fk) => { fn[fk] = (expr, text, o) => line(id, fk, expr, text, o); });
      speakers[name] = fn;
    });
  }

  /** Remplaçant de P("Nom", "texte") : si « Nom » est un personnage connu, il apparaît avec son image. */
  function npc(name, text, expr, o) {
    const id = find(name);
    if (!id) return Object.assign({ who: 'npc', name, text }, o || {});
    return line(id, null, expr || null, text, o);
  }

  /** Précharge les images utilisées par une journée (réplique par réplique, sans tout télécharger). */
  const loaded = new Set();
  function preloadLines(node) {
    (function walk(n) {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) { n.forEach(walk); return; }
      if (n.who === 'char') {
        const sp = sprite(n.char, n.form, n.expr);
        if (sp && !loaded.has(sp.src)) { loaded.add(sp.src); const i = new Image(); i.src = sp.src; }
      }
      Object.values(n).forEach((v) => { if (v && typeof v === 'object') walk(v); });
    })(node);
  }

  G.chars = { norm, all, find, form, sprite, line, npc, speakers, preloadLines };
  buildSpeakers();
})();
