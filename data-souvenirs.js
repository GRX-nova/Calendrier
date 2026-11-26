/* ==========================================================================
   SOUVENIRS — l'album de Flocon (onglet « Souvenirs » du Journal).

   16 souvenirs, écrits par Flocon :
   • 3 par mini-jeu (js/minigames.js) : need = 0 → une première partie suffit ; sinon le score à atteindre.
   • 1 par zone : explore = n° de zone → avoir cliqué sur tous les endroits du décor de la zone (data/decor.js).
   Chaque souvenir est présenté comme une photo : un morceau du décor (photo = [image, taille, position])
   et Flocon (expr = son expression).
   Dès que les 16 sont réunis : la grande photo finale (final).
   {nom} = le prénom de l'héroïne.
   ========================================================================== */
(function () {
  const V = 'decor-zone1_J6.webp', FO = 'decor-foret.webp', GL = 'decor-glace.webp', CH = 'decor-chateau.webp';

  Game.data.souvenirs = [
    /* --- le stand de friandises (zone 1) --- */
    { id: 'friandises-1', game: 'friandises', need: 0, expr: 'amoureux', photo: [V, '260% auto', '0% 72%'],
      title: "Mon premier biscuit volant", hint: "Joue une partie au stand de friandises, sur la place du village.",
      text: "Aujourd’hui, {nom} et moi avons rattrapé les friandises du stand. Enfin… surtout {nom}. Moi, j’ai surtout ouvert la bouche. Je n’ai pas de ventre, mais je suis sûr qu’il était content." },
    { id: 'friandises-2', game: 'friandises', need: 150, expr: 'fier', photo: [V, '220% auto', '2% 75%'],
      title: "Le goûteur officiel", hint: "Fais 150 points au stand de friandises.",
      text: "Mme Cannelle est passée devant le stand et elle a ouvert de grands yeux : pas une seule friandise par terre ! Elle dit qu’on pourrait ouvrir une boutique. Moi, je serais le goûteur officiel. C’est un métier très sérieux." },
    { id: 'friandises-3', game: 'friandises', need: 250, expr: 'victoire', photo: [V, '300% auto', '0% 70%'],
      title: "Les maîtres du stand", hint: "Fais 250 points au stand de friandises.",
      text: "Le stand n’avait jamais vu ça. {nom} attrapait tout, et même le charbon faisait des détours pour l’éviter. Je l’écris ici pour que personne ne dise que j’exagère. (Je n’exagère jamais. Presque jamais.)" },

    /* --- les lucioles de la cascade (zone 2) --- */
    { id: 'lucioles-1', game: 'lucioles', need: 0, expr: 'emerveille', photo: [FO, '230% auto', '74% 88%'],
      title: "La luciole sur mon nez", hint: "Joue une partie aux lucioles de la cascade, dans la forêt.",
      text: "Ce soir, {nom} a voulu attraper les lucioles. Elles se moquaient un peu de nous, je crois. Mais l’une d’elles s’est posée sur mon nez. Je ne me suis jamais senti aussi brillant." },
    { id: 'lucioles-2', game: 'lucioles', need: 25, expr: 'rire', photo: [FO, '200% auto', '70% 80%'],
      title: "Une forêt qui brille", hint: "Fais 25 points aux lucioles de la cascade.",
      text: "La cascade brillait tellement qu’on aurait dit qu’elle avait avalé la lune. {nom} riait, et les lucioles clignotaient en rythme. Je crois qu’elles l’ont adoptée." },
    { id: 'lucioles-3', game: 'lucioles', need: 40, expr: 'celebration', photo: [FO, '260% auto', '78% 92%'],
      title: "La reine des lucioles", hint: "Fais 40 points aux lucioles de la cascade.",
      text: "Les lucioles ont tenu une grande réunion : {nom} sera leur reine. Moi, j’ai demandé à être le chevalier. Elles ont clignoté deux fois. Je pense que ça veut dire oui." },

    /* --- la glissade du lac gelé (zone 3) --- */
    { id: 'glissade-1', game: 'glissade', need: 0, expr: 'peur', photo: [GL, '220% auto', '78% 92%'],
      title: "Ma première glissade", hint: "Fais une glissade sur le lac gelé, au royaume de glace.",
      text: "Sur le lac gelé, j’ai découvert un talent caché : je glisse comme un savon dans une baignoire ! {nom} me guidait à gauche, à droite… et moi, je faisais « wiiiii ». C’était mon tout premier « wiiiii » officiel." },
    { id: 'glissade-2', game: 'glissade', need: 100, expr: 'fier', photo: [GL, '190% auto', '70% 85%'],
      title: "Plus vite que le vent", hint: "Fais 100 points à la glissade du lac gelé.",
      text: "Le vent a voulu faire la course avec nous. Il a perdu. {nom} choisissait le bon couloir à chaque fois, comme si les rochers lui soufflaient où ils allaient se cacher." },
    { id: 'glissade-3', game: 'glissade', need: 200, expr: 'victoire', photo: [GL, '260% auto', '85% 95%'],
      title: "Les champions de la glace", hint: "Fais 200 points à la glissade du lac gelé.",
      text: "Les poissons sous la glace nous ont regardés passer, la bouche grande ouverte. Bon, ils ont toujours la bouche ouverte. Mais là, c’était de l’admiration. {nom} et moi, on est les champions du lac. C’est écrit dans cet album, donc c’est vrai." },

    /* --- les paires du sac renversé (zone 4) --- */
    { id: 'paires-1', game: 'paires', need: 0, expr: 'surpris', photo: [CH, '170% auto', '50% 60%'],
      title: "Le sac renversé", hint: "Joue une partie de paires dans le grand escalier du château.",
      text: "J’ai renversé tout le sac dans le grand escalier. Nos objets dégringolaient de marche en marche ! {nom} les a ramassés deux par deux, sans même râler. Moi, j’ai surtout compté. Compter, c’est important aussi." },
    { id: 'paires-2', game: 'paires', need: 150, expr: 'malicieux', photo: [CH, '200% auto', '50% 62%'],
      title: "Une mémoire d’éléphant", hint: "Fais 150 points aux paires du sac renversé.",
      text: "{nom} retrouvait chaque paire comme si les objets l’appelaient par son prénom. La lettre avec la lettre, la plume avec la plume… Moi, j’ai cherché mon nez dans le tas. Il était sur ma figure." },
    { id: 'paires-3', game: 'paires', need: 260, expr: 'amoureux', photo: [CH, '240% auto', '50% 45%'],
      title: "Rien ne nous échappe", hint: "Fais 260 points aux paires du sac renversé.",
      text: "Toute notre aventure était étalée sur les marches, et {nom} se souvenait de chaque objet, de chaque jour. Moi aussi, je m’en souviens. Et je m’en souviendrai toujours." },

    /* --- l'exploration : tous les endroits du décor d'une zone --- */
    { id: 'explore-1', explore: 1, expr: 'content', photo: [V, 'cover', '50% 50%'],
      title: "Le tour du village", hint: "Regarde tous les endroits du village avec Flocon (le banc, le sapin, les maisons…).",
      text: "Aujourd’hui, {nom} a voulu tout voir : le banc, le sapin, le stand, les maisons… Personne n’avait jamais écouté toutes mes histoires jusqu’au bout. C’était le meilleur jour du monde. Pour l’instant." },
    { id: 'explore-2', explore: 2, expr: 'courage', photo: [FO, 'cover', '50% 40%'],
      title: "Tous les recoins de la forêt", hint: "Regarde tous les endroits de la forêt avec Flocon.",
      text: "{nom} a voulu voir le pont, la cascade et même le fond de la forêt, là où il fait tout noir. J’ai fait semblant d’être courageux. {nom} a fait semblant de me croire. C’est ça, l’amitié." },
    { id: 'explore-3', explore: 3, expr: 'serein', photo: [GL, 'cover', '50% 50%'],
      title: "Le royaume de glace, de bout en bout", hint: "Regarde tous les endroits du royaume de glace avec Flocon.",
      text: "Le chalet, le lac, le pont de glace, le château au loin… On a tout regardé, même ce qui faisait un peu peur. Avec {nom}, le froid a l’air moins froid. C’est bizarre à dire, pour un bonhomme de neige." },
    { id: 'explore-4', explore: 4, expr: 'reflexion', photo: [CH, 'cover', '50% 45%'],
      title: "Les secrets du château", hint: "Regarde tous les endroits du château avec Flocon (les bannières, le lustre, les cristaux…).",
      text: "Les bannières, le grand lustre, les cristaux, le grand escalier, la place vide de l’Étoile… {nom} a tout regardé avec ses grands yeux curieux. Le château était bien triste, mais il a eu de la visite. Ça compte, la visite." }
  ];

  // La grande photo finale : dès que les 16 souvenirs sont réunis.
  // photoAvant : le décor tant que l'Étoile n'est pas reconstituée (pour ne rien dévoiler du château illuminé).
  // photo : le décor de fond (pour mettre une vraie photo à la place, remplace-le par son chemin, ex. "decor-photo-finale.webp",
  //         et mets flocon: false pour ne pas superposer Flocon dessus).
  Game.data.souvenirFinal = {
    id: 'final', expr: 'celebration', flocon: true,
    photo: ['decor-chateau_apres.webp', '185% auto', '50% 0%'],
    photoAvant: ['decor-zone1_J6.webp', '190% auto', '52% 30%'],
    title: "Nous deux", caption: "Flocon & {nom} · Hiver de l’Étoile",
    text: "Seize souvenirs. Je les ai tous relus, au moins trois fois chacun. Il ne manquait qu’une chose : une photo de nous deux. Alors j’ai attendu la plus jolie lumière de l’hiver, et clic… Regarde : c’est nous. Le plus grand aventurier de ma catégorie… et la meilleure amie de toutes les catégories."
  };
})();
