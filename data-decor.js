/* ==========================================================================
   DÉCOR — les petits endroits cliquables du fond de chaque zone.

   Un clic sur un de ces endroits : Flocon dit une phrase (information, question, blague…).
   Les phrases défilent dans l'ordre, puis recommencent (pas deux fois la même d'affilée).

   • rects : une ou plusieurs zones [x, y, largeur, hauteur] en PIXELS de l'illustration (1670 × 941),
             comme les lieux des jours (data/zones.js). Les lieux des jours restent toujours par-dessus.
   • lines : [expression de Flocon, phrase]. {nom} = le prénom de l'héroïne.
   • linesAfter : (facultatif) phrases utilisées une fois l'Étoile reconstituée (fin du jour 24).
   • game : (un seul par zone) identifiant du mini-jeu lancé après la phrase (js/minigames.js).
            Ses phrases sont alors des invitations à jouer.
   ========================================================================== */
(function () {
  Game.data.decor = {
    /* ---------------------------------------------------------------- ZONE 1 · le village */
    1: [
      { id: 'banc', name: "Le banc", rects: [[140, 655, 260, 190]], lines: [
        ['repose', "Un banc ! Parfait pour une pause d’aventurier. Cinq minutes… ou cinq heures."],
        ['rire', "Une fois, j’ai voulu m’asseoir sur un banc. Mes pieds ne touchaient pas le sol. Mes fesses non plus, d’ailleurs."],
        ['reflexion', "Je me demande combien de secrets ont été chuchotés sur ce banc."],
        ['malicieux', "Si on reste assis trop longtemps dans le froid, on finit en bonhomme de neige. Ah. Trop tard pour moi."],
        ['serein', "D’ici, on voit toute la place. C’est le meilleur endroit pour regarder les lumières."]
      ] },
      { id: 'stand', name: "Le stand de friandises", rects: [[0, 545, 140, 200]], game: 'friandises', lines: [
        ['amoureux', "Le stand de friandises… Ça sent le sucre d’orge et le biscuit chaud. On fait un concours ?"],
        ['malicieux', "Je suis imbattable pour attraper les friandises. Tu veux vérifier ?"],
        ['impatient', "Une petite partie ? Juste une ! Bon… peut-être deux."]
      ] },
      { id: 'sapin', name: "Le grand sapin", rects: [[760, 250, 290, 370]], lines: [
        ['emerveille', "Le grand sapin ! Il brille tellement qu’on dirait qu’il a avalé des étoiles."],
        ['reflechit', "Tu crois que l’étoile tout en haut est un peu jalouse de l’Étoile d’Hiver ?"],
        ['malicieux', "Si je grimpe tout en haut, je pourrais remplacer l’étoile. Une étoile avec un nez, ça changerait."],
        ['content', "Chez moi, on dit qu’un vœu fait au pied du sapin compte double. Enfin… c’est moi qui le dis."],
        ['peur', "Attention aux boules tombées ! J’ai marché sur une, une fois. Elle a fait « crac », et moi « aïe »."]
      ] },
      { id: 'chateau1', name: "Le château, là-haut", rects: [[1205, 75, 180, 120]], lines: [
        ['emerveille', "Le château, tout là-haut sur la montagne… Il a l’air si loin."],
        ['reflechit', "Je me demande qui vit là-haut. Quelqu’un de très important, sûrement. Ou de très frileux."],
        ['malicieux', "D’ici, il est tout petit. Presque de ma taille. Ça me plaît bien."],
        ['determine', "Un jour, on ira jusque-là, {nom}. Je le sens dans mon nez."],
        ['cherche', "Il brille comme de la glace sous la lune… Pourtant, on dit que plus personne n’y vit."]
      ] },
      { id: 'foret1', name: "La forêt", rects: [[330, 120, 200, 180], [1335, 120, 90, 210]], lines: [
        ['explore', "La forêt commence juste derrière les maisons. Elle a l’air pleine de chemins."],
        ['peur', "Les sapins sont gentils le jour. La nuit, je préfère ne pas compter leurs ombres."],
        ['reflechit', "On dit que les arbres se souviennent de tout. J’espère qu’ils ne se souviennent pas de mes chansons."],
        ['content', "Ça sent la résine et la neige fraîche. Mon parfum préféré… juste après les biscuits."],
        ['malicieux', "Si on se perd, on n’aura qu’à suivre mon nez. Il est orange : on le voit de loin."]
      ] },
      { id: 'maisons', name: "Les maisons", rects: [[580, 265, 120, 90], [1180, 260, 170, 110]], lines: [
        ['content', "Toutes ces petites maisons… Dans chacune, quelqu’un boit sûrement un chocolat chaud."],
        ['impatient', "Tu crois qu’ils nous inviteraient pour un chocolat chaud ? Je demande pour un ami. L’ami, c’est moi."],
        ['reflechit', "Je compte les cheminées qui fument… sept, huit… Ah non, celle-là, c’est un nuage."],
        ['serein', "Le soir, les fenêtres s’allument une par une. On dirait un deuxième ciel."],
        ['rire', "Une maison sans neige sur le toit, c’est comme un bonhomme de neige sans nez. C’est tout triste."]
      ] }
    ],

    /* ---------------------------------------------------------------- ZONE 2 · la forêt */
    2: [
      { id: 'pont2', name: "Le petit pont", rects: [[700, 560, 410, 140]], lines: [
        ['content', "Un petit pont en bois ! Il craque un peu, mais c’est sa façon de dire bonjour."],
        ['peur', "Ne regarde pas en bas… Bon, d’accord, ce n’est pas très haut. Mais ne regarde pas quand même."],
        ['malicieux', "Si un troll vit dessous, je lui dirai que je suis bien trop froid pour être mangé."],
        ['reflechit', "Un pont, ça sert à relier les choses. Un peu comme nous deux, en fait."],
        ['fier', "Je pourrais le traverser les yeux fermés. Mais je préfère les garder ouverts. Par principe."]
      ] },
      { id: 'cascade', name: "La petite cascade", rects: [[1100, 690, 170, 135]], game: 'lucioles', lines: [
        ['emerveille', "Regarde la petite cascade ! Des lucioles dansent au-dessus de l’eau… On essaie de les attraper ?"],
        ['malicieux', "Je te préviens, les lucioles sont rapides. Moi aussi. Enfin, moins qu’elles. Une partie ?"],
        ['impatient', "Les lucioles sont revenues ! Vite, vite, avant qu’elles s’envolent !"]
      ] },
      { id: 'fond', name: "Le fond de la forêt", rects: [[560, 120, 360, 280]], lines: [
        ['peur', "Tout au fond, c’est tout noir… Tu as entendu ? Non ? Moi non plus. Tant mieux."],
        ['explore', "Je parie qu’il y a des chemins secrets là-bas. Les forêts adorent les chemins secrets."],
        ['reflechit', "Les arbres sont si hauts qu’on ne voit plus le ciel. On dirait qu’ils ont construit un toit."],
        ['courage', "Si quelque chose sort de l’ombre, je le regarde droit dans les yeux. Ou je me cache derrière toi. On verra."],
        ['serein', "Écoute… La neige qui tombe des branches fait « plouf ». C’est le bruit le plus doux du monde."]
      ] }
    ],

    /* ---------------------------------------------------------------- ZONE 3 · la glace */
    3: [
      { id: 'chalet', name: "Le chalet", rects: [[30, 240, 310, 290]], lines: [
        ['content', "Un chalet avec de la fumée qui sort de la cheminée… Moi, je reste loin de la cheminée. Par sécurité."],
        ['reflechit', "Construire un chalet si près de la glace… Il faut aimer le froid. Comme moi."],
        ['malicieux', "Une cheminée, ça veut dire du chocolat chaud. Je dis ça, je ne dis rien."],
        ['serein', "Les fenêtres dorées, la neige sur le toit… On dirait une carte de vœux."],
        ['peur', "Si on entre, tu ne m’approches pas du feu, d’accord ? Je tiens à rester entier."]
      ] },
      { id: 'lac', name: "Le lac gelé", rects: [[780, 610, 820, 280]], game: 'glissade', lines: [
        ['emerveille', "Le lac est complètement gelé… C’est une patinoire géante ! On fait une glissade ?"],
        ['fier', "Je glisse très bien, tu sais. Je suis un peu fait pour ça. Tu me regardes ?"],
        ['malicieux', "Une petite glissade ? Promis, cette fois, je ne fonce pas dans les rochers. Enfin, j’essaie."]
      ] },
      { id: 'pont3', name: "Le pont de glace", rects: [[880, 390, 220, 75]], lines: [
        ['peur', "Un pont en glace… Tu es sûre qu’il tient ? Moi, je tiens. Mais lui ?"],
        ['emerveille', "Il est tout transparent ! On voit la cascade à travers. C’est magnifique."],
        ['reflechit', "Qui a pu construire un pont en glace ? Il faut beaucoup de patience. Et de bonnes moufles."],
        ['malicieux', "Si on lèche la glace, la langue reste collée. Heureusement, je n’ai pas de langue. Problème réglé."],
        ['courage', "On le traversera ensemble. Toi devant. Enfin… moi devant. Bon : côte à côte."]
      ] },
      { id: 'chateau3', name: "Le château", rects: [[1015, 15, 185, 180]], lines: [
        ['emerveille', "Le château ! Il est beaucoup plus près, maintenant. Et beaucoup plus grand."],
        ['peur', "Il brille, mais il a l’air froid. Même pour moi, et pourtant le froid, je m’y connais."],
        ['determine', "On y arrive, {nom}. Pas à pas. Enfin, petit pas par petit pas, pour moi."],
        ['reflechit', "Ses tours sont si pointues… On dirait des glaçons posés à l’envers."],
        ['cherche', "Je me demande ce qui nous attend derrière ces murs."]
      ] }
    ],

    /* ---------------------------------------------------------------- ZONE 4 · le château */
    4: [
      { id: 'trone', name: "L’emplacement de l’Étoile", rects: [[810, 330, 140, 170]], lines: [
        ['reflechit', "C’est ici que l’Étoile brillait. Il y a comme un vide… même dans l’air."],
        ['emerveille', "Les cristaux scintillent encore un peu, comme s’ils se souvenaient d’elle."],
        ['peur', "Je n’ose pas trop m’approcher. On dirait un endroit qui retient son souffle."],
        ['determine', "Un jour, elle brillera de nouveau ici. Je te le promets. Et je tiens toujours mes promesses… presque toujours."],
        ['triste', "Une étoile qui n’est plus là, ça laisse beaucoup de place. Trop de place."]
      ], linesAfter: [
        ['emerveille', "Elle brille de nouveau… et cette fois, d’une lumière toute douce."],
        ['fier', "C’est un peu grâce à nous, tu sais. Bon. Surtout grâce à toi. Mais un peu grâce à mon nez."],
        ['serein', "Elle ne prend plus rien à personne. Elle éclaire, c’est tout."]
      ] },
      { id: 'bannieres', name: "Les bannières", rects: [[525, 115, 80, 250], [1150, 115, 80, 250]], lines: [
        ['fier', "Un flocon sur chaque bannière du château ! C’est un signe : j’étais attendu."],
        ['reflechit', "Des flocons partout sur les drapeaux… C’est un peu ma famille, en fait."],
        ['malicieux', "Si on me cousait sur une bannière, il faudrait une toute petite bannière."],
        ['cherche', "Elles sont un peu poussiéreuses. Personne ne les a regardées depuis longtemps."],
        ['content', "Bleu nuit et argent… Ce sont les couleurs de l’hiver. Mes couleurs."]
      ] },
      { id: 'lustre', name: "Le grand lustre", rects: [[760, 0, 230, 152]], lines: [
        ['emerveille', "Regarde ce lustre ! Il y a au moins mille bougies. Bon, peut-être douze. Mais elles brillent comme mille."],
        ['peur', "Pourvu qu’il soit bien accroché… Je n’ai aucune envie de finir en bonhomme de neige aplati."],
        ['reflechit', "Qui monte allumer toutes ces bougies, le soir ? Il faut une très longue échelle. Ou un très long bras."],
        ['malicieux', "Si je m’assois dessus, je pourrais me balancer au-dessus de toute la salle. Ce serait le meilleur siège du château !"],
        ['serein', "Sa lumière danse sur la glace des murs. On dirait que le château respire doucement."]
      ] },
      { id: 'cristaux', name: "Les cristaux de glace", rects: [[555, 560, 95, 125], [1105, 560, 95, 125], [1515, 800, 155, 141]], lines: [
        ['emerveille', "Ces cristaux poussent partout dans le château ! Comme des fleurs… mais en glace."],
        ['reflechit', "Ils ressemblent aux cristaux de la Grotte des Échos. Tu crois qu’ils se souviennent de choses, eux aussi ?"],
        ['malicieux', "Si je me mets à côté et que je ne bouge plus, tu crois qu’on me prendra pour un cristal ? Un cristal avec un nez, ça ferait de l’effet."],
        ['peur', "Attention, c’est pointu ! Pour une fois que quelque chose est plus piquant que Nox…"],
        ['serein', "Quand la lumière passe à travers, ils font des petits arcs-en-ciel sur le sol. C’est tout doux."]
      ] },
      { id: 'escalier', name: "Le grand escalier", rects: [[700, 500, 360, 190]], game: 'paires', lines: [
        ['surpris', "Oh non… J’ai trébuché sur la première marche et tout le sac s’est renversé ! Tu m’aides à tout retrouver ?"],
        ['malicieux', "Si je renverse encore le sac exprès… tu rejoues avec moi ? Je dis ça, je ne dis rien."],
        ['impatient', "Tous nos objets dans l’escalier… On fait une partie de paires ? Je suis sûr de gagner. Enfin, presque."]
      ] }
    ]
  };
})();
