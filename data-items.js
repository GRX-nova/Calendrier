/* ==========================================================================
   OBJETS — tout ce qui peut entrer dans l'inventaire.

   • gift:true + day:N  → objet virtuel lié au cadeau physique du jour N
                          (débloqué par le code de la petite carte, voir data/codes.js).
                          ⚠ Chaque objet ci-dessous est la « version conte de fées » du cadeau du jour :
                          quand tu connaîtras ton vrai cadeau, adapte simplement le nom et la description.
   • code d'un objet    → data/codes.js (clé = l'identifiant de l'objet, ex. « flocon »). On l'entre dans
                          le sac (« Entrer un code objet ») : l'objet de la vraie vie devient un objet du jeu.
   • usable:false       → l'objet ne se sélectionne pas pour être utilisé sur un lieu.
   • origin             → petite mention affichée dans l'inventaire (sinon : cadeau du jour).
   • icon               → nom d'une icône intégrée (voir js/icons.js)…
   • image              → …ou chemin d'une illustration à toi (ex. "objet-cle.png").
                          Si "image" est renseigné, il remplace l'icône.
   • name / desc        → texte affiché dans l'inventaire.

   LES OBJETS QUI SERVENT PLUS TARD (chaînes d'objets du scénario) :
     Pièce d'horloge (J2) → J15 · Clé noire (J4) → J8 et J10 · Page déchirée (J5) → J17
     Poussière bleue (J7) → J13 · Plume noire (J8) → J11 · Cristal d'aurore (J15) → J19
     Miroir fêlé (J12) → J20 · Cloche sans battant (J14) → J21 · Fiole de lumière (J16) → J22 · Bague (J19) → J23
     (La cire rouge du J9 n'ouvre rien : c'est une preuve, le sceau d'Aldric.)
   Ces objets s'utilisent en les sélectionnant dans le sac, puis en touchant le lieu (voir `requires` dans data/days.js).
   ========================================================================== */
Game.data.items = {
  // Le compagnon : sans lui, personne ne parle dans le royaume. Son objet réel (la peluche ?) porte un code.
  flocon:     { gift: false, usable: false, origin: "Ton compagnon d'aventure", image: "flocon-content.webp", name: "Flocon", desc: "Un petit bonhomme de neige tout doux, qui se dit « le plus grand aventurier du royaume (de sa taille) ». Il ne te quittera plus." },

  /* ----- Zone 1 · La place du village ----- */
  lettre:     { gift: true, day: 1,  icon: 'letter',   usable: false, name: "Lettre scellée du Veilleur", desc: "Une enveloppe fermée par un sceau rouge : une étoile à douze branches, un trait au milieu. Elle ne portait aucun nom, sauf celui de la personne qui viendrait." },
  piece:      { gift: true, day: 2,  icon: 'gear',     name: "Pièce d'horloge",           desc: "Un petit mécanisme de laiton, caché dans une boîte à biscuits. Il tourne à vide, comme s'il attendait sa place dans une horloge plus grande." },
  cadran:     { gift: true, day: 3,  icon: 'dial',     usable: false, name: "Fragment de cadran",        desc: "Un morceau de cadran d'horloge. Au dos, gravé en creux, un signe que personne ne reconnaît : trois pointes, un bandeau, comme une couronne." },
  cle:        { gift: true, day: 4,  icon: 'keyblack', name: "Clé noire",                 desc: "Une clé de fer sombre, forgée par le Vieux Grelot. Un corbeau est gravé dans son anneau. Elle ouvre ce qui ne devait pas l'être." },
  page:       { gift: true, day: 5,  icon: 'page',     name: "Page déchirée",             desc: "Une page arrachée au journal du Veilleur, au bord irrégulier. Il manque la moitié de ce qu'elle disait. L'autre moitié, quelque part, l'attend." },
  carte:      { gift: true, day: 6,  icon: 'map',      usable: false, name: "Carte ancienne d'Aurore",   desc: "Une carte très vieille, dessinée de la main du Veilleur. Les sentiers y changent un peu quand on cligne des yeux." },

  /* ----- Zone 2 · La forêt des Lumières ----- */
  poussiere:  { gift: true, day: 7,  icon: 'dust',     name: "Poussière bleue",           desc: "Un flacon de poussière bleue qui brille un peu dans le noir. Nox dit qu'elle « révèle ce que l'on a voulu cacher ». Il ne dit pas comment il le sait." },
  plume:      { gift: true, day: 8,  icon: 'feather',  name: "Plume noire",               desc: "Une longue plume de corbeau, d'un noir profond. Elle sert de laissez-passer aux amis de Nox, et d'épreuve à ceux qui n'en sont pas." },
  cire:       { gift: true, day: 9,  icon: 'wax',      name: "Cire rouge",                desc: "Un morceau de cire rouge brisé, encore marqué d'une empreinte : une couronne à trois pointes. Quelqu'un a scellé quelque chose avec, et quelqu'un d'autre l'a rompu." },
  lanterne:   { gift: true, day: 10, icon: 'lantern',  usable: false, name: "Lanterne n°7",              desc: "Une petite lanterne numérotée, décrochée de l'Arbre aux Lanternes. Elle contenait un souvenir ; maintenant elle brille doucement, comme si elle le gardait." },
  galet:      { gift: true, day: 11, icon: 'pebble',   usable: false, name: "Galet des promesses",       desc: "Un galet gris poli par des siècles de passages sous le Vieux Pont. Un petit signe y est gravé : on dit que le pont se souvient de ceux qui disent vrai." },
  miroir:     { gift: true, day: 12, icon: 'mirror',   name: "Miroir fêlé",               desc: "Un miroir de poche fêlé de part en part. Reflété dedans, le monde garde sa forme, mais certaines choses y paraissent plus nettes que dans la réalité." },

  /* ----- Zone 3 · Le royaume de glace ----- */
  montre:     { gift: true, day: 13, icon: 'watch',    usable: false, name: "Montre de Maître Givre",    desc: "La montre à gousset de Maître Givre, arrêtée depuis longtemps. Il te la confie : « Peut-être qu'entre tes mains, elle servira à quelque chose de meilleur. »" },
  cloche:     { gift: true, day: 14, icon: 'bellmute', name: "Cloche sans battant",       desc: "Une petite cloche de glace sans battant. Elle ne sonne pas : elle écoute. Il paraît qu'elle ne répond qu'aux livres qui mentent." },
  cristal:    { gift: true, day: 15, icon: 'crystal',  name: "Cristal d'aurore",          desc: "Un éclat de glace offert par l'Ancienne Aurore. Il garde en lui, très pâles, toutes les couleurs des aurores d'autrefois." },
  fiole:      { gift: true, day: 16, icon: 'lightvial', name: "Fiole de lumière",         desc: "Au fond de la fiole, une unique goutte de lumière, vivante, qui tremble quand on s'approche. Une goutte de la vraie lumière de l'Étoile." },
  coquille:   { gift: true, day: 17, icon: 'shell',    usable: false, name: "Coquille d'écho",           desc: "Une coquille qui garde les dernières paroles dites près d'elle. Colle-la à ton oreille : elle murmure encore quelques mots de la grotte." },
  sceau:      { gift: true, day: 18, icon: 'seal',     usable: false, name: "Sceau du Veilleur",         desc: "Le sceau que le Veilleur te confie avant de disparaître. Un cachet rouge frappé de l'étoile à douze branches : il ouvre les portes du château, et celles des cœurs." },

  /* ----- Zone 4 · Le château de glace ----- */
  bague:      { gift: true, day: 19, icon: 'ring',     name: "Bague des Anciens",         desc: "La vraie bague de l'Ancien Éloi, en argent, à la pierre bleue, que le peintre avait effacée de son portrait. Elle porte l'emblème de la flamme : le pouvoir doit éclairer le royaume, jamais le dominer." },
  compas:     { gift: true, day: 20, icon: 'compass',  usable: false, name: "Compas du Cartographe",     desc: "Son aiguille ne pointe pas le nord, mais l'endroit où l'on a le plus besoin d'aller. Il hésite souvent entre deux directions." },
  livre:      { gift: true, day: 21, icon: 'book',     usable: false, name: "Livre aux pages muettes",   desc: "Un livre dont les pages sont blanches, tant qu'on ne le regarde pas avec un cœur honnête. Les pages se rempliront quand l'histoire sera complète." },
  lunette:    { gift: true, day: 22, icon: 'telescope', usable: false, name: "Lunette stellaire",        desc: "Une lunette de laiton qui montre les étoiles non comme elles sont, mais comme elles se souviennent d'avoir été." },
  coeur:      { gift: true, day: 23, icon: 'heart',    usable: false, name: "Cœur de Noël",              desc: "Une petite chose chaude qui bat, ni vraiment un objet, ni vraiment une flamme. Elle contient les souvenirs de tout un royaume." },
  etoile:     { gift: true, day: 24, icon: 'star',     usable: false, name: "La nouvelle étoile",        desc: "Pas l'ancienne Étoile d'Hiver, mais une autre, née de tout ce que vous avez rassemblé. Elle brille d'une lumière douce : celle que l'on ressent quand on est bien accompagné." }
};

/* Combinaisons d'objets : sélectionne un objet dans l'inventaire, puis touche l'autre.
   (Aucune dans cette version de l'histoire. Exemple de format, si tu en veux plus tard :
     { a: 'objetA', b: 'objetB', result: 'objetC', lines: [ { who: 'flocon', expr: 'emerveille', text: "…" } ] } ) */
Game.data.recipes = [];
