/* ==========================================================================
   ZONES — les 4 régions du royaume, leurs décors, leurs lieux cliquables.

   • image : illustration de fond (jamais redessinée en HTML).
   • spots : un lieu par jour. rect = [x, y, largeur, hauteur] en PIXELS de l'illustration
             (1670 × 941). Les zones cliquables sont transparentes et se recalent
             automatiquement quand l'écran change de taille.
   • map.rect : région cliquable sur la carte générale ; map.anchor : où Flocon se tient ;
     map.sign : le panneau-titre imprimé sur la carte (même repère en pixels). Tant que la zone n'est pas
     découverte, un nuage de fumée le recouvre pour que son nom ne soit pas dévoilé trop tôt.
   • imageAfter : (facultatif) décor affiché une fois l'Étoile reconstituée (le château éclairé, jour 24).
   • imageBefore : (facultatif) { until: N, src } → décor affiché tant que le jour N n'est pas terminé
     (le château : la cheminée reste froide jusqu'au jour 23).
   • progressImages : (facultatif) une image par chapitre terminé dans la zone (1re = 1 chapitre fini…).
     Si la zone en a, l'étoile posée au-dessus des lieux terminés disparaît : c'est le décor qui montre l'avancée.
   • danger : true → Flocon y a un peu peur (ses phrases « peur et courage » reviennent plus souvent).
   • intro / outro : dialogues joués à l'arrivée dans la zone / à la fin de la zone.
   ========================================================================== */
(function () {
  const F = (expr, text) => ({ who: 'flocon', expr, text });
  const N = (text) => ({ who: 'narrator', text });
  const P = (name, text, expr) => Game.chars.npc(name, text, expr);
  const { Givre, Brume, Nox, Eloi, Cannelle, Grelot, Plume, Aurore, Veilleur } = Game.chars.speakers;   // (data/zones.js est chargé après js/characters.js)

  Game.data.mapImage = "decor-map.webp";   // carte générale du royaume (image de repli)

  // Carte générale qui change avec l'avancée : une image par nombre de régions découvertes.
  //   1 = seul le Village est découvert, 2 = + la Forêt, 3 = + la Glace, 4 = + le Château.
  // Tant que ces fichiers n'existent pas, le jeu garde map.webp et cache les régions inconnues sous des nuages.
  // (Même format que map.webp : 1670 × 941 px, même cadrage, pour que les zones cliquables restent en place.)
  Game.data.mapImages = {
    1: "decor-carte_1.webp",
    2: "decor-carte_2.webp",
    3: "decor-carte_3.webp",
    4: "decor-carte_4.webp"
  };

  Game.data.zones = [
    {
      id: 1, key: 'village', name: "La Place du Village de Noël", short: "Le Village de Noël",
      image: "decor-village.webp", days: [1, 6], mood: 'warm',
      // Le village s'allume au fil des épreuves : image N affichée quand N chapitres de la zone sont terminés.
      // (Remplace la petite étoile au-dessus des portes terminées. Fichier manquant → image précédente, puis `image`.)
      progressImages: [
        "decor-zone1_J1.webp", "decor-zone1_J2.webp", "decor-zone1_J3.webp",
        "decor-zone1_J4.webp", "decor-zone1_J5.webp", "decor-zone1_J6.webp"
      ],
      map: { rect: [0, 525, 420, 416], anchor: [300, 800], sign: [88, 530, 290, 142] },
      spots: {
        1: { place: "La maison aux guirlandes", rect: [143, 425, 130, 200] },
        2: { place: "La boulangerie de Mme Cannelle", rect: [412, 450, 100, 130] },
        3: { place: "L'horloge de la mairie", rect: [647, 378, 90, 105] },
        4: { place: "L'atelier du Vieux Grelot", rect: [1097, 457, 95, 110] },
        5: { place: "La bibliothèque de Dame Plume", rect: [1297, 443, 95, 108] },
        6: { place: "La maison de l'Ancienne Aurore", rect: [1537, 392, 110, 255] }
      },
      intro: [],   // la première journée raconte déjà l'arrivée
      outro: [
        F('fier', "Six lieux explorés ! Six étapes franchies ! Je n’en reviens pas… Nous sommes vraiment une équipe exceptionnelle."),
        F('reflexion', "Récapitulons : le Veilleur n’a pas disparu. L’horloge ne dit pas la bonne heure, les chroniques ne racontent pas toutes la même chose… et l’Ancienne Aurore dit que l’Étoile a été « mise à l’abri »."),
        F('cherche', "Mais pour l’instant, il faut se méfier du Veilleur. Si tout le monde dit que c’est lui qui a cassé l’Étoile, c’est qu’il y a une bonne raison…"),
        F('malicieux', "J’imagine."),
        F('reflexion', "L’Ancienne Aurore pense que la réponse se trouve dans la Forêt des Lumières."),
        F('peur', "Une forêt immense… avec des arbres qui chuchotent et des corbeaux qui regardent mon nez avec beaucoup trop d’appétit."),
        F('courage', "Mais avec toi, je n’ai presque pas peur."),
        F('malicieux', "Presque. Il faut garder un peu de peur pour rester prudent.")
      ],
      travelQuestion: "Prendre le chemin de la Forêt des Lumières ?"
    },
    {
      id: 2, key: 'foret', name: "La Forêt des Lumières", short: "La Forêt des Lumières",
      image: "decor-foret.webp", days: [7, 12], mood: 'mystery',
      map: { rect: [0, 170, 720, 350], anchor: [470, 470], sign: [190, 250, 268, 130] },
      spots: {
        7: { place: "La Pierre des Voyageurs", rect: [65, 605, 220, 190] },
        8: { place: "Le Chêne creux", rect: [165, 265, 170, 130] },
        9: { place: "Le carrefour aux panneaux", rect: [617, 410, 120, 220] },
        10: { place: "L'Arbre aux Lanternes", rect: [960, 290, 140, 100] },
        11: { place: "Le Vieux Pont", rect: [1370, 520, 200, 160] },
        12: { place: "La cabane dans les branches", rect: [1380, 50, 220, 280] }
      },
      intro: [
        N("Les derniers toits du village disparaissent derrière vous. À mesure que vous avancez, les grands sapins se rapprochent, jusqu’à refermer leurs branches au-dessus du sentier. La forêt est bien plus ancienne que le royaume. Sous ses racines reposent des objets abandonnés, des souvenirs oubliés… et des secrets que personne n’a jamais osé réveiller."),
        F('emerveille', "La Forêt des Lumières… Elle est encore plus grande que dans les histoires ! Regarde ces arbres ! On dirait qu’ils touchent les étoiles."),
        F('decu', "On raconte qu’ils chuchotent la nuit."),
        F('peur', "J’espère qu’ils ne parlent pas de moi. Je n’ai rien fait de bizarre depuis notre arrivée.")
      ],
      outro: [
        F('fier', "Douze fragments… enfin, douze étapes de notre enquête ! Et nous avons découvert un plan incroyable."),
        F('reflexion', "Le Veilleur n’a pas caché les éclats pour les garder. Il les a placés dans des lieux qui comptent pour le royaume."),
        F('reflexion', "Il voulait qu’on se souvienne de ce qui avait de la valeur. Pas seulement de l’Étoile."),
        F('malicieux', "Bon… je continue de préférer les aventures qui se déroulent en plein jour, avec des biscuits à portée de main."),
        F('emerveille', "Regarde là-haut ! Les falaises de glace !"),
        F('determine', "Le miroir nous montre le chemin vers le Royaume de Glace. Il doit y avoir d’autres réponses là-bas."),
        F('courage', "On y va ensemble ?")
      ],
      travelQuestion: "Monter vers le Royaume de Glace ?"
    },
    {
      id: 3, key: 'glace', name: "Le Royaume de Glace", short: "Le Royaume de Glace",
      image: "decor-glace.webp", days: [13, 18], mood: 'ice', danger: true,
      map: { rect: [900, 340, 770, 450], anchor: [1100, 700], sign: [1338, 376, 292, 136] },
      spots: {
        13: { place: "Le chalet du givre", rect: [110, 590, 150, 200] },
        14: { place: "L'escalier de glace", rect: [485, 385, 140, 120] },
        15: { place: "La Terrasse aux Cristaux", rect: [635, 195, 130, 100] },
        16: { place: "Le Lac Gelé", rect: [935, 675, 150, 150] },
        17: { place: "La Grotte des Échos", rect: [1460, 390, 200, 220] },
        18: { place: "Le Belvédère", rect: [1435, 65, 160, 90] }
      },
      intro: [
        N("Le vent change brusquement. Il ne souffle plus : il semble glisser sur le monde, comme une lame de verre. Devant vous, des cascades sont figées en pleine chute. Au loin, derrière les montagnes de glace, se dresse le château."),
        N("Ici, tout paraît suspendu. Les flocons ne tombent plus. Les branches ne bougent plus. Même les ombres semblent attendre."),
        F('emerveille', "Regarde le château… Il est encore plus grand que dans les histoires. Et beaucoup moins accueillant."),
        F('decu', "J’ai froid. Même pour un bonhomme de neige, c’est un peu excessif."),
        F('reflexion', "Après tout ce qu’on a découvert dans la forêt, je ne sais plus qui croire. Nox nous a menti pour protéger quelqu’un. Maître Givre nous cache quelque chose. Et Dame Brume…"),
        F('malicieux', "Elle parle comme si chaque phrase était une énigme. C’est très impressionnant. Mais aussi très fatigant."),
        F('determine', "On continue. Si le Veilleur a laissé des traces ici, on les trouvera.")
      ],
      outro: [
        F('victoire', "Dix-huit étapes ! Dix-huit lieux ! Et on a rencontré le Veilleur en personne !"),
        F('malicieux', "Je vais devoir trouver un titre encore plus impressionnant pour mon carnet d’aventurier."),
        F('triste', "Il nous a laissé son sceau, puis il a disparu dans le vent."),
        F('determine', "Il faut se dépêcher. Si l’Étoile a encore un peu de lumière, elle ne pourra pas attendre éternellement."),
        F('courage', "Allez. Dernière étape : on ouvre les portes du château avec le sceau du Veilleur.")
      ],
      travelQuestion: "Entrer dans le Château de l'Étoile d'Hiver ?"
    },
    {
      id: 4, key: 'chateau', name: "Le Château de l'Étoile d'Hiver", short: "Le Château de l'Étoile d'Hiver",
      image: "decor-chateau.webp", imageAfter: "decor-chateau_apres.webp", days: [19, 24],
      imageBefore: { until: 23, src: "decor-chateau_cheminee_froide.webp" },   // la cheminée froide, tant que le jour 23 n'est pas fini mood: 'dim', danger: true,
      map: { rect: [1040, 0, 630, 330], anchor: [1260, 240], sign: [1392, 53, 240, 162] },
      spots: {
        19: { place: "Le Balcon des Ancêtres", rect: [100, 125, 300, 130] },
        20: { place: "Le bureau du Cartographe", rect: [40, 625, 310, 255] },
        21: { place: "La Grande Bibliothèque", rect: [175, 345, 195, 275] },
        22: { place: "Le Balcon des Étoiles", rect: [1350, 165, 300, 130] },
        23: { place: "La cheminée royale", rect: [1390, 510, 220, 220] },
        24: { place: "Le cœur du château", rect: [680, 715, 400, 170] }
      },
      intro: [
        N("Le sceau du Veilleur tourne dans la serrure. Les lourdes portes du château s’ouvrent dans un long grincement, comme si elles n’avaient pas bougé depuis des siècles."),
        N("À l’intérieur, tout est silencieux. Seules quelques bougies tremblent encore au grand lustre. Les tapisseries pendent dans l’ombre. Une fine couche de givre recouvre les marches du grand escalier."),
        N("C’est ici que la vérité a été cachée : dans les archives officielles, les souvenirs des Anciens et les passages secrets du château."),
        F('peur', "Je n’aime pas quand c’est aussi calme. Même les châteaux hantés ont normalement la politesse de faire un petit bruit."),
        F('courage', "Mais nous sommes des aventuriers. Et les aventuriers ne font pas demi-tour devant une porte sombre."),
        F('malicieux', "Enfin… ils peuvent quand même la regarder de très près avant d’entrer."),
        F('determine', "Allez. On a suivi les traces du Veilleur jusqu’ici. Il est temps de découvrir ce que les Anciens ont vraiment fait.")
      ],
      outro: [],
      travelQuestion: ""
    }
  ];
})();
