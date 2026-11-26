/* ==========================================================================
   LES 24 JOURNÉES — chapitres de l'histoire « Le Royaume de l'Étoile d'Hiver ».

   Une journée = un lieu cliquable + un chapitre. Structure commune :
     zone      : zone du royaume (1 à 4)
     title     : titre du chapitre            summary : phrase du Journal d'aventure
     goal      : « ce qu'on doit faire » : la réponse de Flocon quand on le touche dans son coin de l'écran
     requires  : (optionnel) objet à UTILISER sur le lieu pour l'ouvrir (sélectionné dans le sac, puis lieu touché)
                 { item, locked:[dialogue si on touche le lieu sans l'objet], wrong:[mauvais objet], open:[à l'ouverture] }
     flow      : ordre des étapes (défaut : intro → gift → puzzle → outro). Le fragment d'étoile est donné à la fin.
     intro     : dialogues de début                outro : dialogues de fin
     gift      : { item, lines?, after? }  → code de la carte → objet virtuel dans l'inventaire
                 lines = dialogue AVANT la saisie du code, after = dialogue APRÈS.
                 (le code NE débloque QUE l'objet : voir data/codes.js ; les énigmes sont dans data/puzzles.js)
     puzzle    : identifiant d'énigme (data/puzzles.js) ou null
     finale    : true pour le jour 24 (carte finale à la fin)
     scene     : (facultatif) décor du lieu, affiché pendant tout le chapitre (lieu-)
     sceneLocked : (facultatif) décor du lieu tant qu'il est fermé (ex. le pont dans la brume)
     closing   : (ajouté plus bas, Game.data.dayClosings) le mot de Flocon juste avant la fin du chapitre

   Syntaxe d'un dialogue :  F('expression', "texte")   Flocon (expressions : data/flocon.js)
                            N("texte")                 narrateur
                            Me("texte")                l'héroïne
                            P("Nom", "texte")          une voix sans image (un portrait, un écho…)
                            Givre('mefiance', "texte")          un personnage, avec son EXPRESSION (data/characters.js)
                            Givre.spectral('peur', "texte")     (sa forme spectrale)       Veilleur.ombre(…) / Veilleur.homme(…)
                            Brume / Nox / Eloi / Cannelle / Grelot / Plume / Aurore / Veilleur
                              (+ { side:'left' } pour changer de côté, { name:'…' } pour changer le nom affiché)
                            DOC('identifiant')         un document rejoint le Carnet d'indices (data/docs.js)
                            FX('nom')                  effet spécial (final du 24)
   Dans les textes : {nom} = prénom de l'héroïne, *italique*, **gras**, [[pig:TEXTE]] (écriture des Veilleurs).
   ========================================================================== */
(function () {
  const F = (expr, text, extra) => Object.assign({ who: 'flocon', expr, text }, extra || {});
  const N = (text) => ({ who: 'narrator', text });
  const Me = (text) => ({ who: 'hero', text });
  const P = (name, text, expr) => Game.chars.npc(name, text, expr);
  const DOC = (id) => ({ doc: id });
  const FX = (fx, extra) => Object.assign({ fx }, extra || {});
  const { Givre, Brume, Nox, Eloi, Cannelle, Grelot, Plume, Aurore, Veilleur } = Game.chars.speakers;

  Game.data.defaults = {
    // (repli : utilisé seulement si un jour n'a pas de dialogue « avant la saisie du code »)
    giftIntro: [
      F('decouvre', "Regarde ! Un cadeau t'attend, juste là… et celui-là est dans le vrai monde !"),
      F('guide', "Ouvre-le, trouve la petite carte et recopie son code dans le livre magique. La magie fera le reste.")
    ],
    giftLater: [
      F('serein', "Pas de souci ! Tu pourras l’ouvrir quand tu voudras. Je t’attends ici, bien au chaud."),
      F('reflexion', "Façon de parler, évidemment. Je suis un bonhomme de neige. Mais j’ai un excellent nez.")
    ],
    // Messages du livre magique :
    giftFail: "Hmm… Ce code semble avoir trébuché sur un flocon. Vérifions-le ensemble !",
    giftUsed: "Ce code a déjà servi ! Ton objet est déjà dans ton inventaire. Inutile de lui faire subir une deuxième aventure.",
    // AU TOUT DÉBUT : personne. Seul le narrateur parle, jusqu'à ce que le code objet de Flocon
    // soit entré dans le sac (« Entrer un code objet »).
    narratorIntro: [
      N("Le Royaume de l’Étoile d’Hiver sommeille sous un manteau de neige. Sur la place du village, les maisons sont closes. Les lanternes se sont éteintes."),
      N("Pas un souffle. Pas une voix. Seul le vent fait tinter les guirlandes, comme s’il cherchait à réveiller quelqu’un."),
      N("Et pourtant, quelqu’un manque à l’appel. Un petit compagnon que la magie du royaume ne peut réveiller qu’à l’aide d’un objet venu du monde réel."),
      N("Ouvre ton sac, touche « Entrer un code objet », puis recopie le code qui accompagne ton compagnon.")
    ],
    // Si on ouvre le jeu avant le 1er décembre : rien n'a encore commencé.
    // (les deux premières phrases de l'introduction, puis rien : aucune allusion à un compagnon)
    narratorBeforeStart: [
      N("Le Royaume de l’Étoile d’Hiver sommeille sous un manteau de neige. Sur la place du village, les maisons sont closes. Les lanternes se sont éteintes."),
      N("Pas un souffle. Pas une voix. Seul le vent fait tinter les guirlandes."),
      N("L’ambiance est étrange, comme suspendue… Mais pour l’instant, rien ne se passe.")
    ],
    // Si elle revient sans avoir encore entré le code de Flocon :
    narratorReminder: [
      N("Le village dort toujours. Les lumières restent éteintes… et quelqu’un attend encore dans la neige."),
      N("Ouvre ton sac, touche « Entrer un code objet » et recopie le code de ton compagnon. Le royaume ne peut pas commencer sans lui.")
    ],
    // L'arrivée de Flocon, juste après la saisie de son code.
    floconArrival: [
      N("Un éclat de givre jaillit de ton sac et tourbillonne au-dessus de la neige. Une congère remue, puis remue encore…"),
      N("Une petite tête toute ronde apparaît. Un nez orange, deux yeux brillants… et un bonhomme de neige qui semble avoir du mal à sortir."),
      F('repose', "Wouah… Il n’était vraiment pas très confortable, ce carton ! J’ai fait tout le voyage avec le nez coincé contre le couvercle.", { name: '???' }),
      F('fier', "Moi, c’est Flocon. Le plus grand aventurier du royaume !", { prologue: true }),
      F('malicieux', "Enfin… le plus grand aventurier de ma catégorie et de ma taille !"),
      // Flocon est déjà un doudou dans le vrai monde : envoyé à l'aventurière (qui le reçoit le 1er décembre)
      // parce qu'elle est l'une des seules à avoir encore la magie de Noël.
      F('repose', "Ouf… Le voyage a été long, tu sais. Très, très long. Je ne pensais pas qu’un bonhomme de neige pouvait être aussi fatigué !", { prologue: true }),
      F('serein', "Dans ton monde, je suis un doudou. Un petit bonhomme de neige tout doux, qui devait arriver jusqu’à toi pour le 1ᵉʳ décembre. Et me voilà !", { prologue: true }),
      F('cherche', "Tu te demandes pourquoi toi ? Parce que dans ton monde, presque tout le monde a oublié la magie de Noël. Toi, tu l’as encore en toi : tu es l’une des seules. C’est vers toi qu’on m’a envoyé.", { prologue: true }),
      F('fier', "Mais ne t’inquiète pas : un aventurier de ma catégorie se remet très vite d’un voyage. Surtout quand le royaume a besoin de lui.")
    ],
    // Puis, selon qu'on est avant ou à partir du 1er décembre ({date} = jour d'ouverture) :
    welcomeEarly: [
      F('malicieux', "Oh ! Tu es en avance ! Très en avance. Les portes du royaume ne s’ouvriront que le {date}."),
      F('serein', "En attendant, tu peux regarder autour de toi. Et si tu as une question, touche-moi dans mon petit coin. Je suis officiellement responsable de l’orientation des aventuriers."),
      F('determine', "Reviens ce jour-là. Le royaume aura besoin de nous."),
      F('fier', "Et je préfère te prévenir : je suis excellent dans les situations dangereuses. Tant qu’elles ne sont pas trop dangereuses.")
    ],
    welcomeNow: [
      N("Autour de vous, les guirlandes vacillent. Une étrange tristesse flotte dans l’air, comme si le royaume avait oublié quelque chose d’essentiel."),
      FX('spots'),
      F('cherche', "Tu as vu ? Il y a quelque chose qui brille, là-bas. Un lieu vient de s’allumer !"),
      F('guide', "Touche-le pour entrer. Et si jamais tu te perds… touche-moi dans mon coin. Je connais presque tout le royaume."),
      F('triste', "Enfin, presque tout ce qui est indiqué sur les cartes. Quand j’arrive à les lire, bien sûr.")
    ]
  };

  // Le prologue, tel qu'il est résumé dans le Journal d'aventure (onglet « L'histoire jusqu'ici »).
  Game.data.prologue = [
    "Le Royaume de l’Étoile d’Hiver dormait sous la neige, ses lanternes éteintes, sans un bruit. Pour le réveiller, il lui fallait un compagnon venu du monde réel.",
    "Ce compagnon, c’est **Flocon**, un petit bonhomme de neige qui, dans le monde de {nom}, est un doudou. Il a fait tout le voyage jusqu’à elle, coincé dans un carton, parce qu’elle est l’une des seules à avoir encore la magie de Noël en elle.",
    "Flocon lui a raconté le malheur du royaume : la nuit de la Fête des Lumières, l’**Étoile d’Hiver**, qui nourrissait toute la magie de Noël, s’est brisée en **vingt-quatre éclats**. Depuis, les lumières s’éteignent les unes après les autres.",
    "Tout le monde accuse son gardien, le **Veilleur des Neiges**, de l’avoir détruite avant de disparaître. Plus personne n’ose prononcer son nom.",
    "Alors {nom} et Flocon, « le plus grand aventurier du royaume » (de sa catégorie), se sont mis en route pour retrouver les éclats… et comprendre ce qui s’est vraiment passé."
  ];

  Game.data.days = {

    /* ===================== ZONE 1 — LA PLACE DU VILLAGE DE NOËL ===================== */

    1: {
      zone: 1, title: "Une lettre sans nom",
      goal: "Lire la lettre du Veilleur et déchiffrer le premier signe tracé sous son sceau.",
      summary: "Sur la porte de la maison aux guirlandes, {nom} et Flocon trouvent une enveloppe scellée du symbole du Veilleur. Sa lettre avoue qu'il a brisé l'Étoile, et Flocon le trouve très louche. Son premier signe désigne la boulangerie.",
      intro: [
        N("La nuit tombe sur la place du village. Sur la façade de la maison aux guirlandes, les lumières clignotent une dernière fois… puis s’éteignent, l’une après l’autre."),
        F('triste', "Tu vois ça ? Depuis que l’Étoile d’Hiver s’est brisée, les lumières du royaume disparaissent peu à peu. Même les plus belles guirlandes n’arrivent plus à tenir leur éclat."),
        F('reflexion', "L’Étoile alimentait toute la magie de Noël : les lanternes, la neige scintillante, les lumières du château… Tout."),
        F('reflexion', "La nuit de la Fête des Lumières, elle s’est brisée en vingt-quatre éclats. On raconte que son gardien, le Veilleur des Neiges, l’a détruite avant de disparaître."),
        F('decu', "Les habitants n’aiment pas beaucoup parler de lui. Quand quelqu’un prononce son nom, les conversations s’arrêtent. C’est plutôt mauvais signe, ça."),
        N("Sur la porte de la maison, une enveloppe est retenue par un clou. Son papier épais porte un sceau de cire rouge. Au centre : une étoile à douze branches, traversée d’un trait."),
        F('emerveille', "Une lettre mystérieuse ! Je le savais ! Ma carrière d’aventurier allait forcément commencer par une lettre mystérieuse."),
        F('content', "Bon… j’avais imaginé ma première aventure en solo. Mais c’est encore mieux ! Une équipe, c’est beaucoup plus impressionnant.")
      ],
      gift: {
        item: 'lettre',
        lines: [
          N("L’enveloppe est faite d’un papier épais. Elle ne porte aucun nom. Comme si son destinataire n’avait pas encore été choisi… ou comme si quelqu’un savait déjà qui viendrait."),
          F('decouvre', "Et le plus incroyable, c’est que cette lettre existe aussi dans le vrai monde ! Ouvre ton cadeau, cherche la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          N("Tu romps le sceau avec précaution. À l’intérieur, une lettre. Au dos de l’enveloppe, une grille de petits signes tracés à l’encre."),
          DOC('lettre'),
          DOC('revers'),
          F('cherche', "…Il a l’air très louche, ce Veilleur des Neiges."),
          F('reflexion', "Il avoue qu’il a brisé l’Étoile… et il dit merci ? Comme si on allait l’aider à finir ce qu’il a commencé."),
          F('determine', "S’il nous écrit, c’est qu’il se cache quelque part, pas très loin. Restons sur nos gardes, {nom}. Et si on le trouve… c’est nous qui poserons les questions."),
          N("Sous le rabat de l’enveloppe, quelques signes sont tracés à la hâte. Un premier message attend d’être déchiffré.")
        ]
      },
      puzzle: 'p01',
      outro: [
        F('fier', "La boulangerie ! Mme Cannelle fait les meilleurs biscuits du royaume. Enfin, c’est ce qu’on m’a dit. Je n’en ai jamais mangé d’autres !"),
        F('guide', "Garde la lettre et son revers dans ton Carnet d’indices, accessible depuis le Journal. Le Veilleur nous a donné cette grille pour une raison. Il faut la conserver."),
        N("Quelque part sur la place, une première lanterne se rallume. Sa lumière est faible, mais elle résiste au vent.")
      ]
    },

    2: {
      scene: "lieu-j02-boulangerie.webp", 
      zone: 1, title: "Les horaires de Mme Cannelle",
      goal: "Retrouver, grâce au cahier de cuisson de Mme Cannelle, l'heure d'arrivée et de départ de ses deux visiteurs.",
      summary: "Mme Cannelle a vu le Veilleur la nuit de la catastrophe : il portait quelque chose, et il n'était pas seul. Son cahier de cuisson permet de retrouver leur arrivée (23h35) et leur départ (23h58). Elle confie à {nom} une boîte à biscuits qui cache une pièce d'horloge.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      intro: [
        N("Une odeur de pain d’épices et de cannelle vous accueille avant même que la porte soit ouverte. Derrière le comptoir, une vieille renarde en tablier remue sa pâte avec la précision de quelqu’un qui connaît chaque recette par cœur."),
        Cannelle('accueil', "Entrez donc, entrez ! Vous allez finir par laisser entrer le froid avec vous… Oh !", { name: '???' }),
        Cannelle('inquietude', "Ce sceau… Où avez-vous trouvé cette lettre ? Je n’avais plus vu cette étoile depuis bien des hivers.", { name: '???' }),
        F('cherche', "Vous connaissez le Veilleur, madame Cannelle ?"),
        Cannelle('inquietude', "Ici, on dit qu’il a brisé l’Étoile. On répète cette phrase depuis si longtemps qu’on a fini par oublier qu’il y en avait d’autres."),
        Cannelle('nostalgie', "Cette nuit-là, j’ai vu une grande silhouette passer devant la mairie. Une capuche, un manteau sombre… Il portait quelque chose contre lui."),
        Cannelle('inquietude', "Pas comme on porte un trésor. Plutôt comme on porte un enfant. Avec beaucoup de précautions."),
        Cannelle('chaleur', "Mon cahier de cuisson était ouvert cette nuit-là. J’y note chaque fournée, chaque heure, chaque minute. Les habitudes ont parfois meilleure mémoire que nous."),
        Cannelle('fierte', "Tenez. Si j’ai bien tout consigné, ce cahier pourra peut-être vous aider dans votre petite enquête !"),
        DOC('cahier_cuisson'),
        F('determine', "Un cahier, des heures, des minutes… Enfin une enquête où mon sens de l’organisation va pouvoir briller !"),
        F('malicieux', "Il est excellent, mon sens de l’organisation. Il est parfois tellement fort que je ne le comprends même pas.")
      ],
      gift: {
        item: 'piece',
        lines: [
          Cannelle('generosite', "Il y a autre chose. Cette boîte à biscuits a été déposée sur mon comptoir par la personne qui accompagnait la silhouette."),
          Cannelle('nostalgie', "Elle m’a dit : « Pour celui ou celle qui viendra demander. » Je n’ai jamais eu le courage de l’ouvrir."),
          Cannelle('chaleur', "Elle vous attend depuis tout ce temps. Prenez-la."),
          F('serein', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et donne son code au livre magique. Il fera le reste !")
        ],
        after: [
          N("Sous les derniers sablés, enveloppée dans un linge, repose une petite pièce de laiton. Un rouage d’horloge, usé sur les bords."),
          F('reflexion', "Un rouage caché dans une boîte à biscuits… Heureusement que personne ne l’a mangé !"),
          F('cherche', "Donc la personne l’a laissé ici pour quelqu’un…"),
          Cannelle('curiosite', "Les horloges, c’est du côté de la mairie. Et je vous conseille de ne pas perdre cette pièce. Comme je le dis toujours : les choses qui attendent longtemps ont souvent une bonne raison.")
        ]
      },
      puzzle: 'p02',
      outro: [
        Cannelle('inquietude', "On raconte que l’horloge de la mairie s’est arrêtée au moment exact où l’Étoile s’est brisée."),
        Cannelle('inquietude', "Cette nuit-là, j’ai entendu les cloches du château sonner minuit. Je m’en souviens comme si c’était hier."),
        F('reflexion', "Mhhh… Alors il faudrait savoir à quelle heure l’horloge de la mairie s’est arrêtée, exactement."),
        F('content', "Merci beaucoup, madame Cannelle ! On reviendra, {nom} et moi, quand on aura résolu cette énigme… pour manger des biscuits de récompense !"),
        Cannelle('generosite', "Avec plaisir ! Vous en aurez autant que vous voudrez, si vous découvrez ce qui s’est vraiment passé cette nuit-là !"),
        F('guide', "Il faut aller voir cette horloge de près. Direction la mairie ! Je marche devant."),
        F('malicieux', "Enfin… juste à côté de toi. Devant, c’est un peu trop exposé aux dangers.")
      ]
    },

    3: {
      scene: "lieu-j03-horloge-mairie.webp", 
      zone: 1, title: "L'heure qui ne dit pas la vérité",
      goal: "Remettre l'horloge de la mairie en marche et comprendre pourquoi elle s'est arrêtée à 23h47.",
      summary: "L'horloge de la mairie est figée sur 23h47, mais l'Étoile s'est brisée à minuit. Avec Maître Givre, {nom} remet les rouages en ordre : à 23h47, les deux visiteurs de la boulangerie étaient chez Mme Cannelle. Ce n'est pas eux qui ont arrêté l'horloge. Un passage secret s'ouvre sous la mairie.",
      intro: [
        N("Au sommet de la mairie, la grande horloge domine la place. Ses aiguilles sont figées. Dans l’ombre du cadran, un renard à lunettes ajuste un minuscule levier."),
        Givre('reserve', "Je vous prie de ne toucher à rien. Cette horloge est mon ouvrage… et, depuis quelques hivers, mon plus grand souci.", { name: '???' }),
        F('content', "Bonjour, monsieur ! Je suis Flocon, aventurier de renom. Et voici {nom}, ma partenaire d’enquête."),
        Givre('mefiance', "Maître Givre, horloger de la mairie. Une enquête, dites-vous… Je vois."),
        Givre('reserve', "Inutile de me demander l’heure : elle s’est arrêtée à 23 h 47, le soir de la Fête des Lumières… la Nuit des Éclats, comme on l’appelle depuis. Et tout le village répète que c’est l’instant où l’Étoile s’est brisée."),
        F('cherche', "Pourtant, Mme Cannelle affirme que les cloches du château ont sonné minuit. Elle en est sûre."),
        Givre('nervosite', "Mme Cannelle a une excellente mémoire pour les recettes. Pour les heures… c’est une autre affaire."),
        Givre('reserve', "J’ai démonté cinq rouages pour comprendre ce qui s’est passé. À présent, je ne sais même plus dans quel ordre ils doivent tourner."),
        Givre('reserve', "Si vous possédez des informations sur cette nuit-là, je vous serais reconnaissant de me les montrer.")
      ],
      gift: {
        item: 'cadran',
        lines: [
          N("Dans la poussière, au pied du mécanisme, Flocon découvre un morceau de cadran détaché. Au dos, un signe est gravé en creux."),
          F('malicieux', "Chhht… Ton cadeau du jour t’attend dans le vrai monde. Petite carte, code, livre magique… tu connais maintenant le rituel !")
        ],
        after: [
          DOC('signe_cadran'),
          Givre('malaise', "Ce signe…"),
          Givre('reserve', "Non. Je ne l’ai jamais vu."),
          Givre('nervosite', "On ne grave pas un symbole pareil sur un cadran par simple décoration. Quelqu’un voulait laisser une trace."),
          F('cherche', "Il a l’air de réfléchir très fort, monsieur Givre."),
          F('malicieux', "Ou de cacher quelque chose. Ce qui, dans une enquête, revient souvent au même.")
        ]
      },
      puzzle: 'p03',
      outro: [
        N("Un déclic profond résonne dans le mécanisme. Les aiguilles tremblent, puis se remettent à bouger. Derrière le cadran, une trappe s’ouvre sur un passage étroit qui descend sous la mairie."),
        Givre('nervosite', "Ce passage… Cela fait tellement longtemps que j’avais oublié son existence."),
        Givre('reserve', "Il débouche chez un vieil ami : Grelot, l’artisan. Il saura peut-être vous éclairer."),
        Givre('reserve', "Pour ma part, je dois rester ici. Une horloge ne se surveille pas toute seule."),
        F('impatient', "Un passage secret ! Un vrai passage secret !"),
        F('content', "Je savais que cette enquête allait devenir passionnante !"),
        F('malicieux', "Mhh… Tu pourras me porter, s’il te plaît, {nom} ? Mais pas parce que je suis trop petit pour ces grandes marches, hein !")
      ]
    },

    4: {
      scene: "lieu-j04-atelier-grelot.webp", 
      zone: 1, title: "Le coffret de Grelot",
      goal: "Ouvrir le coffret du Veilleur en recoupant les trois plans, truqués, du Vieux Grelot.",
      summary: "Le Vieux Grelot reconnaît avoir fabriqué des objets pour le Veilleur, mais ses plans sont truqués exprès. {nom} les recoupe et ouvre le coffret : la commande signée du Veilleur révèle que Grelot a forgé les vingt-quatre cachettes des éclats. Il lui confie une clé noire au corbeau.",
      intro: [
        N("Le passage débouche derrière un établi encombré d’engrenages, de jouets inachevés et d’outils minuscules. Un vieux nain en bonnet rapiécé sursaute si brusquement qu’une vis lui échappe des doigts."),
        Grelot('agacement', "Par les clous du vieux royaume ! Qui entre chez moi par la cave ?!", { name: '???' }),
        Grelot('bourru', "Seul Givre passe par là. Et encore, lui, il frappe !", { name: '???' }),
        F('content', "Vous devez être le Vieux Grelot ! C’est Maître Givre qui nous a envoyés. Nous cherchons des informations sur le Veilleur."),
        Grelot('tension', "…"),
        F('cherche', "Tiens… Maître Givre nous a pourtant dit qu’il avait oublié ce passage."),
        Grelot('mefiance', "Je n’ai rien à dire sur le Veilleur."),
        Grelot('bourru', "Il m’a demandé quelques bricoles, voilà tout. Des coffrets, des serrures, des fonds de lanternes. Rien qu’un artisan ne puisse faire."),
        Grelot('perfectionnisme', "Si vous voulez examiner mon travail, voici un coffret. Quatre molettes. Trois plans."),
        F('surpris', "Trois plans pour un seul coffret ?"),
        Grelot('fierte', "Trois copies, oui. Et chacune contient une erreur."),
        F('reflexion', "Vous avez fait des erreurs exprès ?"),
        Grelot('bourru', "Évidemment ! Un plan sans erreur, n’importe quel imbécile peut le copier."),
        Grelot('perfectionnisme', "Avec une erreur dans chaque exemplaire, il faut comparer, réfléchir, et surtout avoir de la patience."),
        Grelot('nostalgie', "C’est ce qu’il m’avait demandé. « Celui qui voudra copier ton travail devra être aussi patient que toi. »")
      ],
      gift: {
        item: 'cle',
        lines: [
          Grelot('tendresse', "Tenez. Prenez cette clé."),
          Grelot('nostalgie', "Elle a été forgée dans le fer d’une vieille lanterne. Le corbeau gravé sur son anneau n’est pas là pour faire joli."),
          Grelot('determination', "Elle ouvre ce qui n’aurait jamais dû être fermé. Mais ne cherchez pas sa serrure ici."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          F('reflexion', "Un corbeau sur l’anneau. Une clé qui n’ouvre rien ici…"),
          F('malicieux', "Je l’aime déjà. Elle a l’air d’avoir beaucoup de secrets."),
          Grelot('bourru', "Gardez-la. Un jour, vous trouverez la serrure."),
          Grelot('tension', "Et quand vous la trouverez, vous comprendrez que je n’ai fait que mon métier.")
        ]
      },
      puzzle: 'p04',
      outro: [
        Grelot('regret', "Il m’avait demandé vingt-quatre cachettes. Pas une de plus."),
        Grelot('nostalgie', "Des coffrets, des pierres creuses, des fonds de lanternes… un revers de miroir. Je les ai fabriquées. Toutes."),
        F('surpris', "Vous avez construit les cachettes des fragments de l’Étoile ?!"),
        Grelot('determination', "Le royaume prétend qu’il y a caché ses crimes. Moi, je crois qu’il cherchait à mettre quelque chose à l’abri."),
        Grelot('regret', "Mais personne ne m’a demandé pourquoi. Alors je me suis tu."),
        F('determine', "Eh bien, nous vous le demandons maintenant, Vieux Grelot."),
        F('serein', "Et nous allons vous écouter."),
        Grelot('tendresse', "Allez voir Dame Plume, à la bibliothèque. Elle conserve les chroniques du royaume."),
        Grelot('determination', "Si quelqu’un peut vous dire ce que le royaume a écrit sur le Veilleur… c’est elle.")
      ]
    },

    5: {
      scene: "lieu-j05-bibliotheque.webp", 
      zone: 1, title: "Les chroniques qui se contredisent",
      goal: "Remettre les chroniques dans l'ordre où elles furent écrites, et comparer les versions du vote du Conseil.",
      summary: "Dame Plume affirme que le Veilleur a détruit l'Étoile par jalousie. Mais ses chroniques, remises dans l'ordre, se contredisent : un registre dit « quatre voix contre une », le Livre des Vérités « à l'unanimité ». Les pages ont été réécrites. Elle ouvre le registre interdit.",
      intro: [
        N("La bibliothèque sent la cire chaude et le papier ancien. Entre les rayonnages, une chouette à lunettes classe des feuillets avec une précision presque intimidante."),
        Plume('rigueur', "Bonjour. Nous sommes dans une bibliothèque. On y parle doucement, on y marche doucement… et on n’y mange pas.", { name: '???' }),
        Plume('interet', "Cela vaut aussi pour les petits bonshommes de neige.", { name: '???' }),
        F('content', "Je ne mange ^^presque^^ pas ! C’est la règle numéro un des bonshommes de neige."),
        F('malicieux', "La règle numéro deux, c’est de ne jamais s’approcher d’un radiateur."),
        Plume('calme', "Je suis Dame Plume, gardienne des chroniques. Vous cherchez le Veilleur, n’est-ce pas ?"),
        Plume('rigueur', "Voici la version officielle : il aurait détruit l’Étoile par jalousie, parce que le royaume ne lui témoignait pas suffisamment de reconnaissance."),
        Plume('rigueur', "C’est écrit dans le Livre des Vérités. Un livre de référence ne se discute pas à la légère."),
        F('reflexion', "Un livre ne se discute pas ?"),
        F('malicieux', "Moi, je discute avec tout le monde. Même avec les armoires. Elles sont très discrètes, mais je pense qu’elles ont beaucoup à dire."),
        Plume('exasperation', "…"),
        Plume('rigueur', "Mais vous tombez bien. Ce matin, j’ai extrait six passages de différentes chroniques pour un inventaire. Ils sont dans le désordre."),
        Plume('determination', "Remettez-les dans l’ordre où ils ont été écrits. Et je vous prie de travailler sans plaisanter : les chroniques sont des choses sérieuses.")
      ],
      gift: {
        item: 'page',
        lines: [
          Plume('curiosite', "Tiens… Cette page s’était glissée entre deux chroniques."),
          Plume('reserve', "Son écriture est irrégulière, son bord est déchiré. Elle vient d’un journal, pas d’un ouvrage officiel."),
          Plume('rigueur', "Je n’ai pas le droit de la classer ici. Gardez-la."),
          F('serein', "Ton cadeau du jour t’attend tout près de toi. Ouvre-le, trouve la petite carte et donne son code au livre magique. Il fera le reste !")
        ],
        after: [
          F('cherche', "Une page arrachée à un vieux journal…"),
          F('reflexion', "Il manque la moitié de ce qu’elle raconte. Et j’ai comme l’impression que cette moitié n’a pas disparu toute seule."),
          Plume('reserve', "Les pages déchirées finissent parfois par retrouver leur place."),
          Plume('calme', "Maintenant, au travail !")
        ]
      },
      puzzle: 'p05',
      outro: [
        Plume('culpabilite', "J’ai consacré ma vie à protéger ces livres. Je les ai rangés, cités, recommandés…"),
        Plume('tristesse', "Et je les ai crus."),
        N("Elle traverse la salle jusqu’à un rayon fermé à clé. La serrure cède dans un petit clic. Sous une épaisse couche de poussière repose un registre interdit."),
        Plume('determination', "Le registre des Cinq Anciens. Il ne devrait être ouvert que par le Conseil."),
        Plume('rigueur', "Mais la planche peinte qu’il renferme n’a jamais été retouchée. Elle est plus ancienne que les chroniques officielles."),
        Plume('respect', "Gardez-la. Elle vous permettra de comparer ce qui a été écrit… et ce qui a été effacé."),
        DOC('registre'),
        F('cherche', "Qui connaissait le Veilleur avant que le royaume décide qu’il était un monstre ?"),
        Plume('reserve', "L’Ancienne Aurore. Elle était là bien avant que les chroniques ne commencent à raconter cette histoire.")
      ]
    },

    6: {
      scene: "lieu-j06-maison-aurore.webp", 
      zone: 1, title: "La carte du Veilleur",
      goal: "Trouver sur la carte ancienne le lieu que le Veilleur voulait désigner.",
      summary: "L'Ancienne Aurore connaît le Veilleur depuis des siècles. Elle assure que l'Étoile n'a pas été détruite mais « mise à l'abri », et que le Veilleur a laissé des indices exprès. Sa carte ancienne, déchiffrée, désigne la Forêt des Lumières.",
      intro: [
        N("Au bout de la place, la grande maison de l’Ancienne Aurore est réchauffée par un poêle qui ronronne. Dans un fauteuil, une femme aux cheveux blancs vous accueille avec un sourire paisible."),
        Aurore('douceur', "Entrez donc, petits voyageurs. Je vous attends depuis ce matin.", { name: '???' }),
        Aurore('nostalgie', "On m’appelle l’Ancienne Aurore. Vous portez le sceau du Veilleur… Je le connais depuis des siècles, vous savez."),
        Aurore('sagesse', "Il était déjà là lorsque ce royaume n’avait pas encore de nom."),
        F('surpris', "Des siècles ?! Alors vous savez s’il a vraiment brisé l’Étoile !"),
        Aurore('gravite', "Brisée, oui. Détruite, jamais."),
        Aurore('sagesse', "L’Étoile n’a pas été détruite. Elle a été mise à l’abri."),
        F('reflexion', "Mise à l’abri… Mais de quoi ?"),
        Aurore('gravite', "Voilà une question que le royaume aurait dû poser bien plus tôt."),
        Aurore('tendresse', "Le Veilleur n’a pas laissé ses indices au hasard. Il voulait qu’un jour quelqu’un puisse le suivre."),
        Aurore('douceur', "Il m’a confié sa carte. Elle ne se révèle qu’à celle qui sait la lire.")
      ],
      gift: {
        item: 'carte',
        lines: [
          N("Aurore déroule un parchemin très ancien. La carte a été dessinée de la main du Veilleur. Certains sentiers semblent changer légèrement lorsqu’on détourne les yeux."),
          F('malicieux', "Chhht… Ton cadeau du jour t’attend dans le vrai monde. Petite carte, code, livre magique… tu connais la recette !")
        ],
        after: [
          F('emerveille', "Une carte au trésor ! Une vraie !"),
          F('surpris', "Attends… Elle vient de bouger ?"),
          Aurore('curiosite', "Il dessinait ce qui se répétait pour décrire un paysage. Mais les lieux qu’il voulait nommer, il ne les représentait qu’une seule fois."),
          Aurore('sagesse', "Regarde bien. Il y a toujours une raison à ce qui semble étrange.")
        ]
      },
      puzzle: 'p06',
      outro: [
        Aurore('espoir', "La Forêt des Lumières. Là-bas, les arbres se souviennent de ce que les hommes oublient."),
        Aurore('gravite', "Si vous croisez un corbeau un peu trop bavard, ne prenez pas toutes ses paroles pour des vérités."),
        F('malicieux', "Un corbeau bavard ? J’adore."),
        F('reflexion', "Enfin, je ne sais pas encore si j’adore les corbeaux… mais j’adore déjà cette aventure."),
        N("Sur la carte, au bord du village, un sentier s’illumine doucement. Il s’enfonce entre les sapins.")
      ]
    },


    /* ===================== ZONE 2 — LA FORÊT DES LUMIÈRES ===================== */

    7: {
      zone: 2, title: "Le poème de la Pierre",
      goal: "Remettre en ordre le poème de la Pierre des Voyageurs et trouver la direction qu'il indique.",
      summary: "Sur la Pierre des Voyageurs, le corbeau Nox surveille les passants. Le poème gravé, remis en ordre, cache une direction dans les premières lettres de ses vers : l'ouest. Nox confie à {nom} un flacon de poussière bleue qui « révèle ce que l'on a voulu cacher ».",
      intro: [
        N("Au milieu du sentier se dresse une grande pierre couverte de mousse. Des dizaines de noms y sont gravés : ceux de voyageurs, de pèlerins et de personnes venues chercher quelque chose dans la forêt. Certains noms sont presque effacés. D’autres semblent avoir été gravés hier."),
        N("Au sommet de la pierre, un corbeau noir lisse ses plumes. Il vous observe d’un œil brillant, sans paraître le moins du monde surpris de votre arrivée."),
        Nox('sarcasme', "Encore des visiteurs. La Pierre attire les curieux comme les miettes attirent les pigeons.", { name: '???' }),
        F('cherche', "Ce corbeau nous regarde depuis qu’on est arrivés. Je suis presque certain qu’il sait quelque chose."),
        F('decu', "Ou qu’il veut mon nez. Tout le monde semble vouloir mon nez, aujourd’hui."),
        Nox('amusement', "Ton nez ? Il est si fripé que même un lapin affamé n’en voudrait pas. Je ne le voudrais pas pour décorer mon nid.", { name: '???' }),
        F('enerve', "Il est magnifique ! Il est orange, il est élégant et il est très bien comme il est !"),
        Nox('sarcasme', "Il a surtout l’air d’avoir passé l’hiver au fond d’un potager.", { name: '???' }),
        F('impatient', "Je ne t’aime pas beaucoup, toi."),
        Nox('curiosite', "Mais toi… Tu portes le sceau du Veilleur.", { name: '???' }),
        Nox('curiosite', "Laisse-moi voir ça. Hmmm. Alors c’est vrai. Quelqu’un a fini par venir.", { name: '???' }),
        F('cherche', "Tu connais le Veilleur ?"),
        Nox('ruse', "Je connais beaucoup de choses. Je suis Nox : messager, guetteur, gardien de quelques secrets… et le seul corbeau de cette forêt à avoir lu cette Pierre jusqu’au bout."),
        Nox('sarcasme', "Ce qui, entre nous, ne constitue pas une compétition très difficile."),
        Nox('ruse', "Elle indique un chemin à ceux qui savent remettre ses vers dans le bon ordre. Quelqu’un les a déplacés."),
        F('cherche', "Quelqu’un… comme toi ?"),
        Nox('ruse', "Moi ? Jamais. Je ne toucherais pas à une inscription aussi ancienne."),
        Nox('mefiance', "Enfin… probablement pas.")
      ],
      gift: {
        item: 'poussiere',
        lines: [
          Nox('satisfaction', "Tiens. Prends cette poudre."),
          Nox('ruse', "Elle révèle ce que l’on a voulu cacher. Les traces effacées, les mots dissimulés… parfois même les choses que leurs propriétaires préféreraient oublier."),
          F('cherche', "Et tu la gardais pour qui ?"),
          Nox('ruse', "Pour quelqu’un."),
          F('cherche', "Quelqu’un comme nous ?"),
          Nox('sarcasme', "Tu poses beaucoup de questions pour un bonhomme qui ne sait même pas voler."),
          F('impatient', "Je pourrais voler… si j’avais des ailes. Et si je le voulais."),
          F('guide', "Chhht… Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, cherche la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          N("La poussière bleue scintille dans le creux de votre main. Ses grains semblent contenir de minuscules étoiles, qui s’allument puis s’éteignent au rythme d’une respiration."),
          F('emerveille', "Oh, c’est beauuuuu… T’as vu ça, {nom} ?"),
          F('reflexion', "Je ne sais pas encore à quoi elle va servir… mais je suis sûr qu’on sera contents de l’avoir quand il fera très noir."),
          Nox('amusement', "Oh, il fera très noir. Plus noir que tu ne l’imagines."),
          F('peur', "Tu pourrais éviter de dire ce genre de choses avec ton petit sourire de corbeau ?")
        ]
      },
      puzzle: 'p07',
      outro: [
        Nox('loyaute', "Le Veilleur a traversé cette forêt plusieurs fois après la catastrophe. Quelqu’un l’a vu. Quelqu’un l’a aidé."),
        F('cherche', "Qui ?"),
        Nox('sarcasme', "Je ne vous l’ai pas dit."),
        F('malicieux', "C’est vrai. Mais tu n’as pas non plus dit que tu ne le savais pas."),
        Nox('amusement', "Tu apprends vite, petit bonhomme."),
        Nox('ruse', "Allez à l’ouest. Le chêne creux vous attend."),
        Nox('mefiance', "Et ne touchez à rien de ce qui brille."),
        F('cherche', "Même si ça brille très fort ?"),
        Nox('sarcasme', "Surtout si ça brille très fort."),
        Nox('ruse', "Sauf si ça brille pour vous.")
      ]
    },

    8: {
      zone: 2, title: "Le message dans le chêne",
      goal: "Déchiffrer le message gravé au fond de la cachette du Chêne creux.",
      summary: "La clé noire de Grelot ouvre la cachette du Veilleur dans le Chêne creux : un coffre de métal fabriqué par Grelot, qui renferme une plume noire, un fragment de lettre et un message en signes, à lire avec la grille du jour 1. Le journal du Veilleur montre qu'il avait prévu la catastrophe six semaines à l'avance.",
      requires: {
        item: 'cle',
        locked: [
          N("Le Chêne creux est immense. Son tronc est si large qu’il pourrait abriter une petite maison. Sous l’écorce, à hauteur de poitrine, une serrure noire se dissimule presque parfaitement dans les fissures du bois."),
          F('reflexion', "Une serrure… Mais pas une serrure ordinaire. Elle a un petit dessin bizarre… On dirait Nox !"),
          F('guide', "Tu sais, certains objets qu’on a reçus en chemin peuvent servir ailleurs. Pour en utiliser un, ouvre ton sac, sélectionne l’objet, puis touche l’endroit où tu veux t’en servir."),
          F('cherche', "Reste à savoir lequel de nos trésors pourrait aller avec cette serrure…")
        ],
        wrong: [
          F('decu', "Non, ça ne rentre pas. La serrure est beaucoup trop étroite."),
          F('reflexion', "Il faut quelque chose qui entre dans une serrure. Et quelqu’un nous a peut-être déjà confié ce qu’il faut…")
        ],
        open: [
          N("La clé noire glisse dans la serrure. Elle tourne sans le moindre bruit."),
          N("Un panneau de bois coulisse lentement dans le tronc, dévoilant une ouverture sombre."),
          F('emerveille', "Ça s’ouvre !"),
          F('content', "Une cachette secrète dans un arbre ! Je retire tout ce que j’ai dit sur ces arbres. Ils sont merveilleux."),
          F('decu', "Enfin… tant qu’ils ne se mettent pas à parler.")
        ]
      },
      intro: [
        N("À l’intérieur du chêne, l’air sent le bois humide et les vieilles plumes. Un petit coffre de métal repose dans l’ombre, calé entre deux racines."),
        N("Une plume d’un noir profond est accrochée à l’une d’elles. Elle semble avoir été placée là avec soin."),
        N("Dans un coin du couvercle, une minuscule clochette est gravée dans le métal, comme une signature."),
        F('decouvre', "Cette clochette… c’est la marque du Vieux Grelot ! Ce coffre, c’est lui qui l’a fabriqué ! Il nous l’avait dit : toutes les cachettes du Veilleur sortent de son atelier."),
        N("Un battement d’ailes résonne derrière vous. Nox se pose sur une racine, l’air de passer par hasard."),
        Nox('surprise', "Le chêne s’est ouvert ?!"),
        Nox('curiosite', "Alors Grelot a vraiment fini par donner sa clé à quelqu’un. Je commençais à croire qu’il l’emporterait dans sa tombe."),
        F('cherche', "Ce chêne t’appartient, Nox ?"),
        Nox('loyaute', "En principe, oui. Le Veilleur l’avait loué pour trois cents hivers."),
        F('surpris', "Trois cents hivers ?! C’est un sacré bail !"),
        Nox('sarcasme', "Le loyer se payait en gâteaux de Mme Cannelle. C’était une affaire raisonnable."),
        F('malicieux', "Miam, je comprends mieux pourquoi tu as accepté !"),
        Nox('mefiance', "Je n’ai jamais regardé dans ce coffre."),
        F('cherche', "Jamais ?"),
        Nox('ruse', "Presque jamais.")
      ],
      gift: {
        item: 'plume',
        lines: [
          Nox('ruse', "Cette plume, c’est la mienne. Ne vous avisez pas de la confondre avec une décoration."),
          Nox('ruse', "Elle sert de laissez-passer auprès des amis des corbeaux. Et d’épreuve pour ceux qui ne le sont pas."),
          F('decu', "Une épreuve ? Elle va nous demander de voler ?"),
          Nox('sarcasme', "Avec ce nez, tu piquerais du nez au premier battement d’ailes."),
          F('impatient', "Mon nez n’a rien à voir avec ça !"),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          N("Sous la plume, un morceau de lettre déchirée est coincé dans une fissure du bois."),
          N("Quelques mots seulement ont survécu : « …sais que tu viendras. Je n’ai pas pu te dire… »"),
          F('reflexion', "Une lettre inachevée. Il manque le début… et la fin."),
          F('triste', "C’est étrange. On dirait que quelqu’un a dû s’arrêter en plein milieu de ce qu’il voulait dire."),
          N("Au fond du coffre, un message est gravé dans l’écriture ancienne des Veilleurs.")
        ]
      },
      puzzle: 'p08',
      outro: [
        F('surpris', "Attends… « Six semaines avant la Fête des Lumières. J’ai compris. »"),
        F('reflexion', "Il avait compris quelque chose avant la catastrophe. Il savait que l’Étoile allait faire du mal ?"),
        F('triste', "Alors pourquoi personne ne l’a écouté ?"),
        Nox('malaise', "Il y a bien des possibilités."),
        Nox('ruse', "Mais tu n’as pas mon avis. Je ne donne pas d’avis gratuitement."),
        F('malicieux', "Tu donnes surtout beaucoup de réponses qui ne répondent à rien."),
        Nox('sarcasme', "Tu commences à comprendre comment fonctionne le monde."),
        Nox('ruse', "Suivez-moi jusqu’au carrefour aux panneaux. Je vous montrerai le chemin."),
        F('determine', "Le bon chemin, cette fois ?"),
        Nox('amusement', "Celui du nord.")
      ]
    },

    9: {
      zone: 2, title: "Le chemin qu'on t'a montré",
      goal: "Déterminer, avec les panneaux du carrefour, par où le Veilleur est vraiment passé.",
      summary: "Nox jure que le Veilleur est parti vers le nord. Mais les quatre panneaux, qui disent tous la vérité, racontent autre chose : c'est par l'ouest qu'il est passé, par le chemin de la cabane. Nox avoue avoir menti pour protéger quelqu'un.",
      intro: [
        N("Quatre chemins se croisent dans une clairière. Des panneaux de bois indiquent les directions, mais lorsque vous les touchez, vous vous rendez compte qu’ils tournent, comme s’ils n’étaient pas attachés."),
        Nox('arrogance', "Nous y voilà. Le Veilleur est parti par le nord. Je peux vous l’assurer."),
        F('cherche', "Tu en es certain ?"),
        Nox('mefiance', "Absolument."),
        F('reflexion', "Tu y étais, vraiment ?"),
        Nox('irritation', "Évidemment. Où voudrais-tu que je sois ?"),
        F('cherche', "Alors pourquoi le nord que tu indiques n’est pas le même que le nord des panneaux ?"),
        Nox('sarcasme', "Parce que quelqu’un les a retournés. Cette forêt est pleine de gens qui aiment compliquer les choses."),
        Nox('ruse', "Les panneaux de cette forêt ne mentent jamais, c’est vrai. Mais chacun n’en dit qu’un petit morceau."),
        F('reflexion', "Tous vrais… Alors il va falloir assembler leurs morceaux."),
        Nox('mefiance', "Assemblez donc. Vous verrez bien."),
        Nox('sarcasme', "À moins que vous préfériez continuer à suivre les corbeaux. C’est rarement une bonne idée.")
      ],
      gift: {
        item: 'cire',
        lines: [
          N("Au pied du mât, un morceau de cire rouge repose dans la neige. Il est brisé en deux, mais une empreinte est encore visible sur sa surface."),
          N("Quelqu’un a scellé un message avec cette cire. Quelqu’un d’autre l’a ouvert."),
          F('cherche', "Un sceau brisé… Comme celui de la lettre du Veilleur."),
          F('reflexion', "Je me demande si c’est le même symbole."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          N("Le fragment de cire rouge révèle une empreinte ancienne. Une couronne à trois pointes, posée sur un bandeau. Le symbole semble familier, sans que vous puissiez encore lui donner un nom."),
          F('cherche', "Une empreinte, un symbole… Je suis sûr qu’on l’a déjà vu quelque part."),
          Nox('malaise', "Gardez-la."),
          Nox('loyaute', "Vous finirez sûrement par lui trouver une utilité."),
          F('malicieux', "C’est presque une phrase gentille, venant de toi."),
          Nox('sarcasme', "Ne t’y habitue pas.")
        ]
      },
      puzzle: 'p09',
      outro: [
        Nox('conflit_interieur', "Je dis ça parce que cette cire… Je la reconnais."),
        Nox('loyaute', "La Nuit des Éclats, je portais un message scellé avec cette empreinte. Une convocation du Conseil."),
        F('surpris', "Tu l’as apportée au Veilleur ?"),
        Nox('loyaute', "Je la lui ai remise moi-même."),
        F('cherche', "Pourquoi nous avoir envoyés au nord, alors ?"),
        Nox('malaise', "Pour vous tenir loin de l’ouest. Loin de la cabane… et de quelqu’un qui n’a pas envie d’être retrouvée."),
        Nox('loyaute', "Le Veilleur m’avait fait promettre de la protéger. Je ne peux pas trahir cette promesse."),
        F('reflexion', "Tu as menti pour protéger quelqu’un…"),
        F('determine', "Je n’aime pas les mensonges. Mais je crois que je commence à comprendre pourquoi tu l’as fait."),
        F('malicieux', "Et je crois que je commence à t’aimer bien, aussi."),
        Nox('amusement', "N’exagère pas."),
        Nox('ruse', "Prenez le chemin de l’ouest. Je vous suivrai."),
        F('cherche', "De près ?"),
        Nox('sarcasme', "De loin. Je suis un corbeau, pas un guide touristique.")
      ]
    },

    10: {
      zone: 2, title: "La lanterne n°7",
      goal: "Remettre dans l'ordre les souvenirs de la lanterne n°7.",
      summary: "L'Arbre aux Lanternes garde les souvenirs de ceux qui ne sont plus là. Dame Brume y apparaît. La lanterne n°7, remise en ordre, montre le Veilleur avec Maître Givre : l'horloger a participé à la préparation de la fracture.",
      requires: {
        item: 'cle',
        locked: [
          N("Autour de l’Arbre aux Lanternes, une barrière de branches noueuses s’est refermée. Au centre, un cadenas de fer sombre est incrusté dans le bois. Un corbeau y est gravé."),
          F('cherche', "Un nouveau cadenas… avec un corbeau gravé dessus."),
          F('reflexion', "Ce corbeau… je suis sûr qu’on l’a déjà vu quelque part.")
        ],
        wrong: [
          F('decu', "Non, ce n’est pas le bon objet."),
          F('reflexion', "Hmm. Le cadenas n’en veut pas.")
        ],
        open: [
          N("La clé noire tourne dans le cadenas. Les branches se détendent, puis s’écartent lentement, comme les battants d’une porte oubliée."),
          F('emerveille', "C’est magnifique !"),
          F('malicieux', "J’avais raison : la clé du Vieux Grelot est une clé très importante. Je l’ai toujours dit."),
          F('reflexion', "Enfin… je crois que je l’ai dit une fois. Peut-être deux.")
        ]
      },
      intro: [
        N("Des centaines de lanternes pendent aux branches d’un arbre gigantesque. Chacune abrite une minuscule lueur, fragile comme une flamme, silencieuse comme un souvenir."),
        N("Tout au fond, une silhouette encapuchonnée se tient immobile parmi les lanternes."),
        Brume('mystere', "N’allume pas ce que tu ne comprends pas.", { name: '???' }),
        Brume('gravite', "Pas encore.", { name: '???' }),
        F('surpris', "Qui est là ?!"),
        Brume('mystere', "Dame Brume. Je veille sur cet arbre depuis que les Anciens ont cessé de se souvenir de lui."),
        F('cherche', "Vous connaissez le Veilleur ?"),
        Brume('curiosite', "Tu portes la clé noire. Et la plume de Nox."),
        Brume('sagesse', "Alors il t’a laissée venir jusqu’à moi. Ce choix en dit davantage sur toi que tu ne l’imagines."),
        F('malicieux', "Nox nous a même fait faire un détour. Il a une drôle de façon de nous aider."),
        Brume('amusement', "Les corbeaux protègent parfois mieux les secrets lorsqu’ils prétendent les trahir.")
      ],
      gift: {
        item: 'lanterne',
        lines: [
          Brume('mystere', "Chaque lanterne porte un numéro. Chaque numéro correspond à un souvenir."),
          Brume('gravite', "La septième s’est éteinte la Nuit des Éclats. Depuis, elle attend."),
          F('reflexion', "Elle attend quoi ?"),
          Brume('sagesse', "Quelqu’un qui saura lui rendre sa place."),
          Brume('confiance', "Prends-la. Ne cherche pas à la forcer à briller."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          N("La petite lanterne n°7 repose dans vos mains. Son métal est froid, mais une lueur semble frémir à l’intérieur, comme un souvenir qui dort."),
          F('emerveille', "Elle est froide… mais je sens quelque chose bouger dedans."),
          F('decu', "J’espère que ce n’est pas un insecte magique."),
          Brume('amusement', "Les souvenirs sont parfois plus remuants que les insectes.")
        ]
      },
      puzzle: 'p10',
      outro: [
        F('surpris', "Maître Givre était son ami ? Il nous a pourtant dit qu’il ne connaissait pas le signe du cadran…"),
        F('reflexion', "Il nous a menti."),
        Brume('sagesse', "Ne juge pas trop vite, petit aventurier."),
        Brume('gravite', "Ceux qui mentent par peur ne mentent pas tous pour les mêmes raisons. Certains cherchent à protéger une vérité. D’autres cherchent à l’enterrer."),
        F('triste', "Comment savoir lequel est lequel ?"),
        Brume('mystere', "C’est précisément ce que tu es venu apprendre."),
        Brume('sagesse', "Le Vieux Pont te posera des questions. Il ne s’ouvre pas à ceux qui prétendent savoir."),
        Brume('gravite', "Il ne laisse passer que ceux qui ont des amis parmi ceux qui volent."),
        F('peur', "Un pont qui pose des questions…"),
        F('malicieux', "J’espère qu’il ne demande pas de réciter des poèmes. Je suis très mauvais en poésie.")
      ]
    },

    11: {
      scene: "lieu-j11-pont-eteint.webp", sceneSolved: "lieu-j11-pont.webp", sceneLocked: "lieu-j11-pont-brume.webp", 
      zone: 2, title: "Les trois questions",
      goal: "Répondre aux trois questions du Vieux Pont, avec ce que tu as trouvé depuis le début.",
      summary: "Le Vieux Pont ne s'ouvre qu'à celui qui dit vrai : il pose trois questions dont les réponses sont dans les documents réunis. Dame Brume révèle ensuite que le Veilleur n'a jamais cherché à garder les éclats pour lui-même.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      requires: {
        item: 'plume',
        locked: [
          N("Le Vieux Pont enjambe un ravin noyé de brume. Une épaisse nappe blanche barre son entrée, immobile comme un mur. Sur le parapet, une empreinte de patte d’oiseau est gravée dans la pierre."),
          F('decu', "Je ne vois même pas l’autre côté…"),
          F('cherche', "Il y a une empreinte gravée sur le parapet…"),
          F('reflexion', "Ce pont attend sans doute quelque chose de nous. Mais quoi ?")
        ],
        wrong: [
          F('decu', "Hmm… Le pont ne réagit pas."),
          F('reflexion', "Ce n’est pas ce qu’il attend. Regarde encore cette empreinte.")
        ],
        open: [
          N("Lorsque la plume noire touche la pierre, la brume se déchire lentement. Les premières dalles du pont apparaissent, puis les suivantes, jusqu’à révéler un passage étroit au-dessus du ravin."),
          F('serein', "Ah ! Je préfère quand les ponts restent visibles."),
          F('malicieux', "C’est beaucoup plus pratique pour les aventuriers qui n’ont pas d’ailes.")
        ]
      },
      intro: [
        N("Au milieu du pont, Dame Brume vous attend. Sa silhouette se découpe dans la brume, immobile, comme si elle avait toujours été là."),
        Brume('respect', "Je t’attendais."),
        Brume('gravite', "Ce pont ne laisse passer ni les menteurs, ni les distraits, ni ceux qui répètent des mots sans les comprendre."),
        F('peur', "Et… que fait-il aux menteurs ?"),
        Brume('amusement', "Il leur demande de recommencer."),
        F('serein', "Ah. Je pensais qu’il allait nous jeter dans le ravin."),
        Brume('mystere', "Il pose trois questions. Il ne te demande pas de deviner. Il te demande de te souvenir."),
        Brume('sagesse', "Le Veilleur croyait que la vérité devait être retrouvée, pas simplement racontée."),
        F('reflexion', "Alors il faut se souvenir de ce qu’on a appris depuis le village…"),
        Brume('gravite', "Et accepter que certaines réponses soient plus difficiles à porter que d’autres.")
      ],
      gift: {
        item: 'galet',
        lines: [
          N("Lorsque la dernière réponse est donnée, un petit galet gris roule doucement jusqu’à vos pieds. Un signe ancien est gravé sur sa surface."),
          Brume('sagesse', "Ce galet repose sous le pont depuis des siècles."),
          Brume('confiance', "On raconte que le pont se souvient de ceux qui ont tenu leurs promesses. Il a gardé ce galet pour l’un d’eux."),
          Brume('confiance', "Il est à toi, désormais."),
          F('emerveille', "Et le plus beau, c’est qu’il existe aussi dans le vrai monde !"),
          F('guide', "Ouvre ton cadeau, cherche la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          F('content', "Un galet des promesses !"),
          F('serein', "Je vais le garder près de mon cœur."),
          F('malicieux', "Enfin… mon cœur de neige est un peu froid. Mais l’intention compte !")
        ]
      },
      puzzle: 'p11',
      outro: [
        Brume('tristesse', "Tu te demandes toujours pourquoi il a brisé l’Étoile."),
        Brume('gravite', "Voici ce que le royaume a toujours refusé d’entendre : le Veilleur n’a jamais cherché à garder les éclats pour lui."),
        Brume('sagesse', "Pas un seul. Il les a confiés, cachés, puis il s’est effacé."),
        F('triste', "Alors pourquoi tout le monde le croit-il coupable ?"),
        Brume('gravite', "Parce qu’il est plus facile de haïr un seul homme que de douter de cinq."),
        F('reflexion', "Les cinq Anciens…"),
        Brume('mystere', "Tu commences à comprendre."),
        Brume('sagesse', "Viens. De l’autre côté du pont, une cabane se cache dans les branches."),
        Brume('tristesse', "Elle appartenait au Veilleur."),
        F('peur', "Une cabane abandonnée ? Dans les arbres ?"),
        F('courage', "Bon… Je suis un aventurier. Les cabanes ne me font pas peur."),
        F('malicieux', "Sauf si elles sont hantées. Mais même là, je peux négocier.")
      ]
    },

    12: {
      scene: "lieu-j12-cabane.webp", 
      zone: 2, title: "Le miroir de la cabane",
      goal: "Reconstituer le grand miroir brisé de la cabane du Veilleur.",
      summary: "La cabane du Veilleur est pleine de cartes et de documents. Son grand miroir, brisé en douze morceaux, une fois reconstitué, montre que chaque éclat a été placé dans un lieu lié à un souvenir important du royaume. Le chemin vers le Royaume de Glace apparaît.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      intro: [
        N("Perchée dans les branches d’un très vieux sapin, une cabane de bois grince doucement dans le vent. Son toit est couvert de neige. Les fenêtres sont opaques, mais la porte est restée entrouverte."),
        N("À l’intérieur, des cartes sont empilées sur une table. Des feuillets s’entassent près d’une paire de lunettes de lecture. Une tasse de thé gelé attend encore, comme si son propriétaire devait revenir d’un instant à l’autre."),
        N("Un battement d’ailes : Nox se pose sur le rebord de la fenêtre, sans un mot."),
        Nox('malaise', "…"),
        Nox('conflit_interieur', "Je ne suis pas revenu ici depuis longtemps."),
        F('surpris', "Nox ? Tu connaissais cette cabane ?"),
        Nox('mefiance', "Je connaissais beaucoup de choses, autrefois."),
        Brume('tristesse', "Moi non plus, je ne suis pas revenue depuis longtemps."),
        F('triste', "C’est ici qu’il vivait ?"),
        Brume('gravite', "C’est ici qu’il préparait tout. Les plans, les cachettes, les messages…"),
        Brume('mystere', "Regarde le mur du fond."),
        N("Au fond de la cabane, un grand miroir de la taille d’une porte est brisé en douze morceaux. Les fragments sont éparpillés sur le sol. Certains reflètent la lumière de la fenêtre, d’autres semblent presque noirs."),
        Nox('conflit_interieur', "Il l’a brisé lui-même, le jour de son départ."),
        Nox('loyaute', "Il ne voulait pas que n’importe qui puisse lire ce qu’il montrait."),
        F('cherche', "Mais pourquoi l’avoir laissé ici ?"),
        Nox('ruse', "Pour que quelqu’un de patient puisse le retrouver.")
      ],
      gift: {
        item: 'miroir',
        lines: [
          N("Lorsque le dernier morceau retrouve sa place, un petit miroir de poche, fêlé de part en part, se détache du cadre et glisse dans la main de {nom}."),
          Brume('mystere', "Il montre ce qui est vrai, même lorsque les mots ont été effacés."),
          Brume('gravite', "Ceux qui sont venus fouiller ici avant toi l’ont cru inutile. Ils se trompaient."),
          Brume('confiance', "Garde-le."),
          F('decouvre', "Et le plus beau : celui-là existe dans le vrai monde !"),
          F('guide', "Ouvre ton cadeau, cherche la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          N("Le miroir de poche capte la lumière. Ses fissures la dispersent en petits éclats, mais son reflet reste étonnamment net."),
          F('cherche', "Il est cassé… mais on dirait qu’on voit certaines choses plus clairement dedans."),
          F('malicieux', "Peut-être qu’il fonctionne mieux que les miroirs ordinaires. Ou encore mieux, peut-être qu’il se mange !")
        ]
      },
      puzzle: 'p12',
      outro: [
        Brume('espoir', "Il n’a pas caché les éclats au hasard."),
        Brume('sagesse', "Chacun repose dans un lieu qui compte pour le royaume. Il voulait qu’en les cherchant, tu rencontres tout ce qui valait la peine d’être sauvé."),
        F('reflexion', "Les souvenirs, les promesses, les histoires…"),
        F('triste', "Ce n’était donc pas seulement une chasse aux fragments."),
        Nox('loyaute', "Il savait que quelqu’un finirait par trouver la route."),
        Nox('loyaute', "Elle commence là-haut."),
        N("Dans le miroir reconstitué, un chemin lumineux apparaît. Il grimpe entre les montagnes, vers un royaume de glace et de silence."),
        F('courage', "Le Royaume de Glace !"),
        F('determine', "Allez, on monte. Un grand aventurier n’abandonne jamais !"),
        F('decu', "Même quand il fait très, très froid."),
        F('malicieux', "Mais si quelqu’un a un manteau plus épais, je ne dirai pas non.")
      ]
    },


    /* ===================== ZONE 3 — LE ROYAUME DE GLACE ===================== */

    13: {
      scene: "lieu-j13-chalet-givre.webp", 
      zone: 3, title: "La formule du Veilleur",
      goal: "Révéler les inscriptions invisibles du chalet et retrouver la formule.",
      summary: "La poussière bleue révèle une formule cachée sur le tableau du chalet. Maître Givre, sous sa forme spectrale, reconnaît avoir aidé le Veilleur à briser l'Étoile, sans l'avoir choisi, et remet à {nom} le plan de la tour du Veilleur.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      requires: {
        item: 'poussiere',
        locked: [
          N("Le chalet semble abandonné depuis des années. Ses volets sont figés par le givre et la neige s’est accumulée contre la porte."),
          N("Pourtant, sous la glace qui recouvre les murs, on distingue des traces de craie. Des lignes, des chiffres, des formules… effacés à la hâte."),
          F('cherche', "Quelqu’un a écrit ici. Beaucoup écrit, même. Mais la glace a tout recouvert."),
          F('reflexion', "Il nous faudrait quelque chose pour faire réapparaître ce qui a été caché…")
        ],
        wrong: [
          F('decu', "Rien ne se passe. Cet objet ne révèle pas les inscriptions."),
          F('reflexion', "Il faut quelque chose qui révèle ce qu’on a voulu cacher.")
        ],
        open: [
          N("Une pincée de poussière bleue se disperse sur le tableau gelé. Les grains s’accrochent à la glace, puis s’illuminent."),
          N("Peu à peu, des lignes apparaissent. Une formule oubliée se dessine dans le givre, comme si quelqu’un venait de l’écrire."),
          F('emerveille', "Elle fait vraiment apparaître les choses cachées !")
        ]
      },
      intro: [
        N("À l’intérieur du chalet, le froid semble venir des murs eux-mêmes. Au fond de la pièce, une silhouette pâle se tient devant le tableau."),
        N("Elle est transparente. Son contour tremble comme une flamme dans le vent."),
        Givre.spectral('culpabilite', "Je savais que vous finiriez par venir."),
        F('surpris', "Maître Givre ?! Mais… vous êtes transparent !"),
        Givre.spectral('honte', "Dans le village, l’horloge me donne encore une forme. Ici, loin de son mécanisme, je ne suis plus qu’un souvenir."),
        F('decu', "Un souvenir de renard ?"),
        Givre.spectral('honte', "Un souvenir qui a commis une faute et qui n’a jamais trouvé le courage de la réparer."),
        Givre.spectral('culpabilite', "À la mairie, je vous ai menti. Je connaissais le Veilleur. Il était mon ami."),
        Givre.spectral('reserve', "Ce que vous allez découvrir ici ne changera pas ce que j’ai fait. Mais vous méritez de savoir pourquoi je l’ai fait.")
      ],
      gift: {
        item: 'montre',
        lines: [
          Givre.spectral('nostalgie', "Prends cette montre."),
          N("Le boîtier est ancien. Les aiguilles sont immobiles, figées à une heure que son propriétaire n’a jamais voulu oublier."),
          Givre.spectral('nostalgie', "Elle s’est arrêtée cette nuit-là. Je l’ai gardée depuis. Elle ne donne plus l’heure… mais elle me rappelle celle où j’ai promis de me taire."),
          Givre.spectral('nostalgie', "Peut-être qu’entre tes mains, elle servira à quelque chose de meilleur."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          F('triste', "Merci, Maître Givre. On la gardera précieusement."),
          Givre.spectral('soulagement', "Je ne l’avais jamais donnée à personne. Mais il faut que j’arrive à passer à autre chose, et me séparer d’elle est la première étape.")
        ]
      },
      puzzle: 'p13',
      outro: [
        Givre.spectral('culpabilite', "Je vous ai menti parce que je l’ai aidé à briser l’Étoile."),
        F('surpris', "Vous… vous avez vraiment participé à sa destruction ?"),
        Givre.spectral('honte', "Oui. Mais ce n’était pas une destruction. Du moins, pas comme le Conseil l’a raconté. Le Veilleur m’a demandé de l’aider. Il disait que l’Étoile ne pouvait plus continuer ainsi."),
        Givre.spectral('nostalgie', "Je l’ai cru. Et lorsque tout a été terminé, j’ai laissé les autres raconter leur version."),
        F('reflexion', "Vous aviez peur qu’on ne vous croie pas ?"),
        Givre.spectral('culpabilite', "J’avais peur de perdre ce qu’il me restait. Alors j’ai perdu bien davantage."),
        Givre.spectral('espoir', "Prends ce plan. Il mène à la tour où le Veilleur a accompli son geste. Je n’ai jamais osé y monter."),
        Givre.spectral('reserve', "Je pense que votre enquête se poursuivra là-bas."),
        N("Derrière le chalet, un escalier de glace s’élève en spirale vers une terrasse lointaine."),
        F('determine', "On y va. Et cette fois, on ne laissera pas la peur décider à notre place.")
      ]
    },

    14: {
      zone: 3, title: "Les cinq marches",
      goal: "Remettre dans l'ordre les cinq marches de l'escalier de glace.",
      summary: "L'escalier de glace est une énigme de raisonnement : cinq marches à ordonner selon six inscriptions. Au sommet, une cloche sans battant attend. Dame Brume sait ce qui s'est passé cette nuit-là, mais préfère laisser {nom} le découvrir elle-même.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      intro: [
        N("L’escalier de glace monte en spirale vers les hauteurs. Certaines marches sont parfaitement solides. D’autres se dissolvent dans la brume, avant de réapparaître quelques mètres plus loin."),
        F('peur', "Elles disparaissent !"),
        F('decu', "Je tiens à préciser que je suis un aventurier, pas un cascadeur."),
        Brume('mystere', "Le Veilleur a construit cet escalier pour ceux qui savent réfléchir avant d’avancer."),
        F('cherche', "Vous êtes là, Dame Brume ?! Vous nous avez suivis depuis la forêt ?"),
        Brume('sagesse', "Certaines routes ne se quittent jamais vraiment. Elles changent simplement de forme."),
        Brume('gravite', "Chaque marche répond à une vérité. Un mauvais pas, et elle disparaît. Un pas juste, et elle demeure."),
        F('peur', "Et si je fais un mauvais pas ?"),
        Brume('amusement', "La marche disparaîtra."),
        F('serein', "Ah. Seulement la marche."),
        F('peur', "Attends… Mais non, en fait, ça ne va pas du tout !")
      ],
      gift: {
        item: 'cloche',
        lines: [
          N("Tout en haut de l’escalier, une petite cloche de glace est suspendue à une branche gelée. Elle n’a ni battant, ni fêlure."),
          F('cherche', "Une cloche qui ne peut pas sonner ? C’est un peu comme un bonhomme de neige qui ne peut pas éternuer."),
          Brume('mystere', "Elle ne sonne pas. Elle écoute."),
          F('surpris', "Elle écoute quoi ?"),
          Brume('gravite', "Les livres qui mentent. Certains mensonges sont si anciens qu’ils ont fini par se croire vrais."),
          Brume('sagesse', "Garde-la. Elle vous sera utile plus haut."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          F('reflexion', "Une cloche qui écoute les livres qui mentent…"),
          F('reflechit', "C’est normal que je ne comprenne rien à ce que Dame Brume dit ?"),
          Brume('amusement', "Tout à fait normal. Tu comprendras plus haut.")
        ]
      },
      puzzle: 'p14',
      outro: [
        Brume('gravite', "Regarde les marches. Chacune repose sur une vérité que tu as su reconnaître."),
        F('reflexion', "Dame Brume… Vous savez ce qui s’est passé cette nuit-là, n’est-ce pas ?"),
        Brume('mystere', "Je sais ce que la brume a vu. Mais une vérité qu’on te donne ne vaut jamais celle que tu trouves toi-même."),
        F('decu', "J’étais sûr que vous alliez dire quelque chose comme ça."),
        Brume('sagesse', "Monte. La Terrasse aux Cristaux t’attend. Les heures de cette nuit-là y dorment encore.")
      ]
    },

    15: {
      zone: 3, title: "La Nuit des Éclats, heure par heure",
      goal: "Associer chaque scène des cristaux à l'heure à laquelle elle s'est produite.",
      summary: "La pièce d'horloge remet en marche le cadran de cristal, qui montre la Nuit des Éclats. L'Ancienne Aurore apparaît : l'Étoile s'est brisée à minuit, et l'horloge de la mairie a été bloquée à 23h47 par une main gantée marquée d'une couronne, pour empêcher minuit de sonner au château. Mais Maître Givre avait détaché les cloches : la formule que le Veilleur avait placée dans la tour s'est éveillée quand même.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      requires: {
        item: 'piece',
        locked: [
          N("Au milieu de la terrasse se dresse un immense cadran de cristal. Ses rouages tournent lentement, mais un emplacement reste vide en son centre."),
          F('reflexion', "Il manque une pièce. Un rouage, peut-être ?"),
          F('cherche', "Tout ce grand mécanisme attend un si petit morceau…")
        ],
        wrong: [
          F('decu', "Non, ça ne s’emboîte pas."),
          F('reflexion', "Il faudrait quelque chose qui ait déjà appartenu à une horloge…")
        ],
        open: [
          N("La pièce de laiton s’enfonce dans le cadran avec un petit clic."),
          N("Les rouages se mettent à tourner. Les cristaux s’illuminent, un à un, et la terrasse semble reprendre vie."),
          F('emerveille', "Ça y est ! Le mécanisme fonctionne !"),
          F('malicieux', "Je commence à croire que les horloges nous aiment bien. Enfin… certaines.")
        ]
      },
      intro: [
        N("Au-dessus de la terrasse, des cristaux flottent dans l’air. Chacun contient une scène minuscule, figée dans une lumière pâle."),
        N("Des silhouettes apparaissent et disparaissent. Une porte s’ouvre. Une ombre traverse une pièce. Une cloche sonne au loin."),
        Aurore('douceur', "Ces cristaux gardent ce qui a été vu cette nuit-là."),
        F('surpris', "L’Ancienne Aurore ? Vous êtes ici aussi ?"),
        Aurore('sagesse', "Les aurores vont là où les gens ont besoin d’elles."),
        Aurore('melancolie', "J’ai regardé ces scènes bien des fois. Mais les images ne donnent pas toujours les réponses. Elles ne donnent que ce qu’elles ont vu."),
        Aurore('gravite', "Les heures ont été effacées. À toi de les retrouver. Tu connais déjà plusieurs des événements de cette nuit.")
      ],
      gift: {
        item: 'cristal',
        lines: [
          Aurore('tendresse', "Prends cet éclat."),
          N("Le cristal renferme des couleurs très pâles : du rose, du vert, de l’or."),
          Aurore('nostalgie', "Il garde un peu de la lumière d’autrefois. Quand tu douteras de ce que tu vois, regarde à travers lui."),
          F('malicieux', "Chhht… Ton cadeau du jour t’attend dans le vrai monde. Petite carte, code, livre magique… tu connais maintenant le rituel !")
        ],
        after: [
          F('emerveille', "Il change de couleur quand je le tourne !"),
          F('content', "Rose, vert, doré… T’as vu ça, {nom} ?!"),
          F('malicieux', "Je vais essayer de ne pas le regarder trop longtemps. Je risquerais de devenir encore plus beau.")
        ]
      },
      puzzle: 'p15',
      outro: [
        F('reflexion', "Mais attends… L’Étoile s’est brisée à minuit. Mais l’horloge s’est arrêtée à 23 h 47."),
        F('cherche', "Quelqu’un l’a donc bloquée treize minutes avant la catastrophe. Pourquoi ?"),
        Aurore('gravite', "La magie de l’Étoile ne se laisse toucher qu’au douzième coup de minuit, la nuit de la Fête des Lumières. Celui qui a arrêté l’horloge le savait."),
        Aurore('melancolie', "Il ne croyait pas le Veilleur. Il pensait qu’en bloquant l’horloge de la mairie, celle qui fait sonner les cloches du château, minuit ne sonnerait jamais."),
        Aurore('sagesse', "Mais Maître Givre avait détaché les cloches du château de son horloge. À minuit, elles ont sonné quand même… et l’Étoile s’est brisée."),
        Aurore('gravite', "Ensuite, il a laissé le royaume croire que l’horloge indiquait l’heure exacte de la catastrophe. Ainsi, personne ne s’est demandé qui l’avait arrêtée."),
        F('enerve', "Alors on a fait mentir l’horloge pour cacher un autre mensonge !"),
        Aurore('tristesse', "Cette nuit-là, le Veilleur et Maître Givre n’étaient pas près de l’horloge au moment où elle a été bloquée. Ils étaient à la boulangerie."),
        F('cherche', "Mais si le Veilleur était au village à minuit… comment l’Étoile a-t-elle pu se briser au-dessus de la tour ?"),
        Aurore('sagesse', "Tout était prêt. Avant de descendre au village, il avait placé dans la lanterne de la tour la formule préparée avec Maître Givre. Elle n’attendait plus que les douze coups de minuit."),
        F('reflexion', "Mme Cannelle avait raison. Elle avait vu quelque chose… mais personne ne l’a écoutée."),
        Aurore('espoir', "Le lac, plus bas, garde encore une partie des écrits du Veilleur. Descends-y. Il y a des vérités que la glace n’a pas réussi à effacer.")
      ]
    },

    16: {
      zone: 3, title: "Ce qui dort sous la glace",
      goal: "Guider la lumière à travers les miroirs de glace jusqu'aux trois étoiles gravées sous le lac.",
      summary: "Sous le Lac Gelé, une salle ancienne s'éclaire quand le faisceau touche les trois étoiles gravées. Nox refuse de descendre. Dans la cavité : une fiole contenant une goutte de lumière, et une partie du journal personnel du Veilleur. La Grotte des Échos s'ouvre.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      intro: [
        N("Le lac gelé s’étend au pied de la montagne, lisse comme un miroir noir. Sous la glace, une lueur vacille. Elle pulse lentement, comme un cœur qui aurait oublié son rythme."),
        N("Des miroirs de glace sont disposés sur la surface. Sous la glace, trois étoiles ont été gravées, chacune à un endroit différent du lac."),
        N("Un battement d’ailes brise le silence. Une ombre noire descend du ciel et se pose sur un des miroirs de glace."),
        F('surpris', "Nox ?! Mais… d’où tu sors, toi ? On ne t’a pas vu depuis la forêt !"),
        Nox('ruse', "Je vous suis depuis le chalet. Un corbeau sait voler sans bruit… contrairement à un bonhomme de neige qui parle tout le temps."),
        F('enerve', "Tu aurais pu dire bonjour !"),
        Nox('sarcasme', "Bonjour."),
        Nox('malaise', "Je vous accompagne jusqu’au bord. Pas plus loin."),
        F('surpris', "Tu as peur, Nox ?"),
        Nox('irritation', "Je suis un corbeau. Pas un poisson. Je n’ai aucune raison de me promener sous la glace."),
        F('malicieux', "C’est une façon très compliquée de dire oui."),
        Nox('conflit_interieur', "…"),
        Nox('malaise', "C’est ici qu’il venait écrire, les derniers temps. Je ne suis jamais revenu depuis."),
        F('serein', "Tu n’étais pas obligé de revenir seul."),
        Nox('sarcasme', "Je ne suis pas seul. Je suis avec un bonhomme de neige qui parle trop et une aventurière qui ouvre toutes les portes."),
        F('content', "C’est vrai. Nous sommes une excellente compagnie."),
        Nox('malaise', "Regardez les miroirs. La lumière doit toucher les trois étoiles. Le Veilleur ne laissait jamais un mécanisme sans raison.")
      ],
      gift: {
        item: 'fiole',
        lines: [
          N("Dans la cavité, une fiole de verre repose sur un socle de glace. À l’intérieur, une unique goutte de lumière tremble doucement."),
          Nox('conflit_interieur', "C’est la lumière de l’Étoile. La vraie."),
          F('surpris', "Tu l’as déjà vue ?"),
          Nox('conflit_interieur', "La Nuit des Éclats, avant de descendre au village, il l’a recueillie dans la lanterne de la tour. Pour qu’il reste toujours un peu de la vraie lumière, quoi qu’il arrive."),
          F('reflexion', "Ce que le Veilleur portait contre lui quand Mme Cannelle l’a vu passer… « comme on porte un enfant »… C’était elle !"),
          Nox('conflit_interieur', "Il m’avait demandé de la veiller. Je lui avais promis."),
          Nox('conflit_interieur', "J’ai tenu la promesse de ne pas la laisser tomber entre de mauvaises mains. Mais je n’ai pas tenu celle de revenir."),
          F('reflexion', "« …sais que tu viendras. Je n’ai pas pu te dire… » La lettre du chêne… Elle était pour toi, Nox ?"),
          Nox('malaise', "Il n’a jamais su dire au revoir. Moi non plus."),
          Nox('loyaute', "Prends-la. Elle a assez attendu."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          F('emerveille', "Elle est tiède !"),
          F('cherche', "Et je crois qu’elle me regarde. Bonjour, petite goutte de lumière !"),
          Nox('amusement', "Si elle te répond, évite de lui raconter toute ta vie.")
        ]
      },
      puzzle: 'p16',
      outro: [
        N("Sous la fiole, un étui de cuir protège quelques pages d’un journal. L’écriture est fine, régulière, presque pressée."),
        F('cherche', "« Éloi seul m’a écouté… »"),
        F('reflexion', "Éloi. Ce nom figure dans le registre de Dame Plume. C’était l’un des Cinq Anciens."),
        Nox('malaise', "Éloi, le gardien des lanternes. On dit qu’il hante encore le château."),
        F('cherche', "Tu l’as connu ?"),
        Nox('mefiance', "J’ai connu beaucoup de gens. Certains auraient préféré que je ne les connaisse pas."),
        F('malicieux', "Tu es vraiment incapable de répondre simplement à une question."),
        Nox('sarcasme', "Et toi, incapable de ne pas en poser une autre."),
        N("Derrière la dernière étoile gravée, la glace se fissure. Un souffle froid remonte des profondeurs. Dans le silence, un murmure résonne… puis un passage s’ouvre vers la Grotte des Échos."),
        F('determine', "Éloi sait peut-être ce qui s’est passé. On doit retrouver la suite de ces pages.")
      ]
    },

    17: {
      scene: "lieu-j17-grotte-echos.webp", 
      zone: 3, title: "La séance retrouvée",
      goal: "Remettre dans l'ordre les échos de la séance du Conseil.",
      summary: "La page déchirée ouvre la Grotte des Échos, qui a gardé les paroles prononcées cette nuit-là. Remises dans l'ordre, elles reconstituent la séance : le Veilleur a averti les Anciens, quatre ont refusé, Aldric a promis que « l'histoire retiendrait ce qu'il faut ». Les archives ont été falsifiées.",
      requires: {
        item: 'page',
        locked: [
          N("L’entrée de la grotte est barrée par une épaisse paroi de glace. À l’intérieur, une moitié de page semble prisonnière du mur. Son bord déchiré est visible sous la surface."),
          F('cherche', "Une moitié de page, prisonnière de la glace…"),
          F('reflexion', "Son bord est déchiré. Quelque part, l’autre moitié doit exister.")
        ],
        wrong: [
          F('decu', "Non, ça ne s’ajuste pas."),
          F('reflexion', "Ce n’est pas ce bord-là que la glace attend.")
        ],
        open: [
          N("Tu poses la page contre la glace. Les deux bords s’ajustent exactement."),
          N("Un craquement traverse la paroi. La glace se fend en silence, puis s’écarte pour dévoiler l’entrée de la grotte."),
          F('emerveille', "C’était bien la même page !"),
          F('malicieux', "Je savais que les bibliothèques et les grottes avaient beaucoup de choses en commun. Elles sont toutes les deux pleines de choses qu’on ne retrouve pas facilement.")
        ]
      },
      intro: [
        N("La grotte est vaste. Des cristaux tapissent ses parois et renvoient chaque son avec un léger décalage."),
        F('rire', "Ohé !"),
        N("La voix de Flocon revient, plus grave, plus lente."),
        F('peur', "Ohé… ohé… Elle a pris du poids, ma voix !"),
        F('decu', "Je n’aime pas beaucoup cet endroit. Il répète tout ce qu’on dit."),
        N("Plus loin, plusieurs voix se répondent. Des phrases incomplètes, des mots isolés, des accusations. Elles semblent provenir d’une autre époque."),
        F('reflexion', "Ce sont des souvenirs. Mais ils sont dans le désordre.")
      ],
      gift: {
        item: 'coquille',
        lines: [
          N("Au pied d’un grand cristal, une coquille repose sur un lit de mousse gelée. Lorsqu’on s’en approche, elle murmure doucement."),
          F('cherche', "Une coquille dans une grotte de glace… Voilà qui est inhabituel."),
          F('emerveille', "Et le plus beau : celui-là existe pour de vrai ! Ouvre ton cadeau, cherche la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          N("La coquille se met à vibrer. Une voix grave s’en échappe, presque étouffée."),
          P("Voix dans la coquille", "« …alors je ferai ce que vous refusez de faire… »"),
          F('surpris', "Cette voix…"),
          F('reflexion', "Elle garde les paroles prononcées près d’elle. Si nous remettons les échos dans le bon ordre, nous pourrons peut-être entendre toute la séance.")
        ]
      },
      puzzle: 'p17',
      outro: [
        F('triste', "Alors c’est ça, la vérité…"),
        F('reflexion', "Quatre contre un. Puis ils ont modifié les chroniques pour faire croire que le Veilleur était le coupable."),
        F('determine', "Ils ont pris sa décision, l’ont déformée… et lui ont fait porter toute la faute."),
        F('reflexion', "Il faut le retrouver. Vu le nombre d’indices ici, ça ne m’étonnerait pas qu’il se cache tout près."),
        F('guide', "Au Belvédère, peut-être. C’est le dernier endroit où ses traces nous conduisent."),
        N("Au fond de la grotte, un escalier de glace s’élève vers un belvédère baigné de lune.")
      ]
    },

    18: {
      zone: 3, title: "Le Veilleur",
      goal: "Montrer au Veilleur ce que tu as compris, et répondre à sa question.",
      summary: "Au Belvédère, le Veilleur apparaît enfin. Il demande : « Si tu pouvais restaurer l'Étoile exactement comme elle était, le ferais-tu ? » {nom} répond non : elle consumerait de nouveau le royaume. Il lui confie le sceau qui ouvre le château.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      intro: [
        N("Au sommet, le vent s’est arrêté. Le belvédère domine le royaume, et le château se dessine au loin, silencieux, ses fenêtres éteintes."),
        N("Une silhouette encapuchonnée se tient face au vide. Elle ne se retourne pas lorsque vous approchez."),
        Veilleur.ombre('mystere', "Tu as mis longtemps.", { name: '???' }),
        F('peur', "C’est… c’est lui ?"),
        F('decu', "Le Veilleur des Neiges ?"),
        Veilleur.ombre('solitude', "C’est le nom qu’ils ont laissé derrière moi."),
        Veilleur.ombre('reserve', "Je suis celui que tu as suivi à travers les lettres, les pierres, les mensonges et les souvenirs."),
        Veilleur.ombre('tristesse', "Tu as lu mes traces au lieu de croire les chroniques. Peu de personnes en auraient pris la peine."),
        F('cherche', "Pourquoi ne pas être revenu expliquer ce qui s’était passé ?"),
        Veilleur.ombre('gravite', "Parce que ceux qui avaient besoin de me condamner n’auraient pas écouté. Et parce que j’avais moi-même quelque chose à apprendre."),
        Veilleur.ombre('mystere', "Je ne te demanderai pas de me croire. Je te demanderai de me montrer ce que tu as compris.")
      ],
      gift: {
        item: 'sceau',
        lines: [
          Veilleur.homme('vulnerabilite', "Prends ceci."),
          N("Dans sa main repose un sceau ancien. L’étoile gravée semble encore tiède, comme si elle gardait une braise de l’ancienne magie."),
          Veilleur.homme('tristesse', "Le sceau du Veilleur. Il ouvre les portes du château… et parfois celles que l’on croit fermées à jamais."),
          Veilleur.homme('gravite', "Je ne le porterai plus."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          Veilleur.homme('sincerite', "Je ne vais pas te dire comment réparer l’Étoile. Je ne le sais pas."),
          Veilleur.homme('espoir', "Je sais seulement qu’il ne faut pas la remettre comme elle était. Le royaume doit apprendre à vivre avec une magie différente."),
          Veilleur.homme('gravite', "Tu as retrouvé ce que j’avais laissé derrière moi. À présent, il te reste à comprendre ce que tout cela signifie."),
          N("Le Veilleur s’efface lentement. Lorsque tu relèves les yeux, il a disparu. Il ne reste que le vent… et le sceau tiède dans ta main.")
        ]
      },
      puzzle: 'p18',
      outro: [
        F('reflexion', "Mhh… Il est parti."),
        F('triste', "Il a passé tout ce temps à protéger le royaume, alors que le royaume le croyait coupable."),
        F('determine', "On ne peut pas le laisser disparaître dans l’oubli une deuxième fois."),
        F('guide', "Le sceau ouvre les portes du château. Allons-y. Il reste encore des vérités à découvrir.")
      ]
    },


    /* ===================== ZONE 4 — LE CHÂTEAU DE L'ÉTOILE D'HIVER ===================== */

    19: {
      zone: 4, title: "Les portraits repeints",
      scene: "lieu-j19-galerie.webp", sceneSolved: "lieu-j19-galerie-vraie.webp", sceneLocked: "lieu-j19-galerie.webp",
      goal: "Trouver quel portrait a été repeint, en comparant ses paroles aux archives.",
      summary: "Au Balcon des Ancêtres, cinq portraits d'Anciens racontent chacun leur version. Celui d'Éloi a été repeint : il dit avoir voté contre le Veilleur, alors qu'il fut le seul à le soutenir. Aldric avait ordonné de falsifier les archives. Un passage s'ouvre vers le bureau du Cartographe.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      requires: {
        item: 'cristal',
        locked: [
          N("Le balcon est fermé par une grille de fer noir. Elle n’a ni serrure, ni charnière, ni verrou. Elle ne fait même pas de bruit quand on la secoue."),
          F('cherche', "Une grille sans serrure… Comment on ouvre une grille qui n’a rien pour s’ouvrir ?"),
          F('reflexion', "Plus je la regarde, plus ses couleurs me paraissent bizarres… Tu ne trouves pas ?")
        ],
        wrong: [
          F('decu', "Rien. La grille ne réagit pas."),
          F('reflexion', "Et si le problème, ce n’était pas la grille… mais nos yeux ?")
        ],
        open: [
          N("Tu regardes la grille à travers le cristal d’aurore. De l’autre côté de la glace, il n’y a pas de fer : seulement un reflet peint dans l’air, une illusion."),
          N("Tu tends la main. La grille se dissout comme du givre au soleil."),
          F('surpris', "Une fausse grille ! Quelqu’un ne voulait vraiment pas qu’on vienne regarder ces portraits de près."),
          F('reflexion', "L’Ancienne Aurore l’avait dit : « Quand tu douteras de ce que tu vois, regarde à travers lui. »")
        ]
      },
      intro: [
        N("Le balcon domine la grande salle du château. Sur ses murs sont accrochés cinq grands portraits d’Anciens en robes de cérémonie."),
        N("Leurs yeux peints semblent suivre chacun de tes pas."),
        F('peur', "J’ai l’impression qu’ils me regardent. Tous. En même temps."),
        N("Dès que tu t’approches, chaque portrait se met à parler. Les voix sont graves, solennelles… et étrangement semblables."),
        P("Portrait du Doyen Aldric", "Le Veilleur a agi seul. Il a menacé le royaume."),
        P("Portrait de la Doyenne Séraphine", "Il a refusé d’obéir au Conseil."),
        P("Portrait du Doyen Barnabé", "Nous avons tenté de le raisonner."),
        P("Portrait de la Doyenne Mélisende", "Il ne nous a laissé aucun choix."),
        P("Portrait du Doyen Éloi", "Le royaume devait être protégé."),
        F('reflexion', "Cinq portraits, cinq versions… mais elles racontent toutes la même histoire."),
        F('cherche', "On sait déjà que quatre Anciens ont voté contre le Veilleur. Et un seul l’a soutenu."),
        F('determine', "Il faut trouver lequel de ces portraits a été modifié.")
      ],
      gift: {
        item: 'bague',
        lines: [
          N("Éloi tend la main. À son doigt repose une bague d’argent sertie d’une pierre bleue."),
          Eloi('respect', "Prenez ma bague. La vraie. Celle que le peintre a effacée de mon portrait."),
          Eloi('tristesse', "La pierre bleue était l’emblème de la flamme. Elle rappelait aux Anciens que leur pouvoir devait éclairer le royaume, jamais le dominer."),
          Eloi('regret', "Je l’ai portée pendant des siècles. Elle ne me rappelle désormais que ce que je n’ai pas eu le courage de dire."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          Eloi('regret', "J’ai voté pour le Veilleur, puis je me suis tu. C’est moi, le lâche de cette histoire."),
          F('triste', "Vous avez levé la main quand les autres la gardaient baissée. Ce n’est pas être lâche."),
          F('serein', "Vous avez peut-être manqué de courage après… mais vous n’avez pas été seul à vous tromper."),
          Eloi('soulagement', "Merci, petit compagnon. Tu as plus de sagesse dans ta neige que certains rois dans leurs couronnes.")
        ]
      },
      puzzle: 'p19',
      outro: [
        Eloi('courage', "Aldric a ordonné la falsification des archives. Les chroniques, les pages de la séance, mon portrait… Tout devait raconter la même histoire."),
        Eloi('honte', "Je l’ai vu faire venir le scribe. Mais je n’ai pas de preuve. Je n’ai qu’une mémoire."),
        F('reflexion', "Si j’ai appris une chose de cette aventure, c’est que quand plusieurs souvenirs racontent la même chose, ils finissent par former une preuve !"),
        Eloi('tristesse', "Il a même fait retoucher la prophétie."),
        F('surpris', "Une prophétie ?"),
        Eloi('solennite', "Une phrase très ancienne, gravée sur le Balcon des Étoiles le jour où l’Étoile fut allumée. Elle dit qui saura la restaurer si un jour elle se brise."),
        Eloi('honte', "Aldric en a fait effacer la fin, et graver à la place : « …mais par celui qui la gouverne ». Celui qui gouverne le royaume, c’était lui."),
        DOC('prophetie_aldric'),
        F('reflexion', "Alors la prophétie le désignait… simplement parce qu’il l’avait réécrite."),
        Eloi('regret', "La vraie fin, plus personne ne s’en souvient. Aldric y a veillé. Mais lui la connaissait. Et c’est elle qui lui faisait peur : elle ne parlait pas de lui."),
        Eloi('serenite', "Derrière mon portrait se trouve un passage. Il mène au bureau du Cartographe."),
        N("Un panneau coulisse dans le mur. Derrière s’ouvre un couloir étroit : celui que le plan de la tour traçait à l’encre bleue."),
        Eloi('serenite', "Le Cartographe connaissait les routes du royaume. Peut-être que vous trouverez d’autres pistes là-bas.")
      ]
    },

    20: {
      scene: "lieu-j20-bureau-cartographe.webp", sceneLocked: "lieu-j20-bureau-cartographe.webp",
      zone: 4, title: "Deux cartes, six désaccords",
      goal: "Comparer la carte officielle et celle du Veilleur pour trouver les endroits modifiés.",
      summary: "Le miroir fêlé fait apparaître sur la carte du royaume une seconde carte, celle du Veilleur. Les six désaccords entre les deux mènent aux cachettes. Mais les vingt-quatre éclats ne sont pas tous de vrais morceaux d'étoile : beaucoup sont des souvenirs scellés, qui protègent les vrais.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      requires: {
        item: 'miroir',
        locked: [
          N("Le bureau du Cartographe est une pièce ronde, tapissée de cartes. Au centre, sur une grande table, la carte officielle du royaume est étalée."),
          N("Elle est soignée, précise, sans une rature. Trop propre."),
          F('reflexion', "Cette carte est bizarre. Elle semble parfaite…")
        ],
        wrong: [
          F('decu', "Rien ne change. Il nous faut quelque chose qui montre autrement.")
        ],
        open: [
          N("Tu tiens le petit miroir fêlé au-dessus de la carte."),
          N("Dans le reflet, la carte change. Des routes apparaissent. Des noms effacés reviennent. Certains lieux ont été déplacés, d’autres ont disparu de la version officielle."),
          F('emerveille', "Une carte qui ment sans dire un seul mot ! C’est presque aussi compliqué que Nox.")
        ]
      },
      intro: [
        Brume('curiosite', "Le Cartographe a quitté le château avec le reste du Conseil, quand la lumière s’est éteinte. Mais sa carte, elle, est toujours là."),
        F('peur', "Waaah ! Dame Brume ?! Vous étiez là depuis quand ?"),
        Brume('sagesse', "Une carte ne ment pas toujours. Parfois, elle ne montre que ce qu’on lui demande de montrer."),
        Nox('ruse', "Moi, je trouve que cette carte s’ennuie. Elle a besoin d’un peu de désordre."),
        F('peur', "Aaah ! Nox ?! Mon petit cœur de neige a failli lâcher !", { jolt: true }),
        Brume('amusement', "Nous vous suivons depuis la cabane."),
        Nox('malaise', "Je me baladais."),
        F('malicieux', "Bien sûr. Une petite balade… qui passe exactement par le château."),
        Nox('sarcasme', "Le château a de très beaux couloirs.")
      ],
      gift: {
        item: 'compas',
        lines: [
          Brume('mystere', "Prends ce compas. Son aiguille ne pointe pas le nord."),
          F('surpris', "Alors elle pointe quoi ?"),
          Brume('sagesse', "L’endroit où l’on a le plus besoin d’aller. Elle hésite souvent entre deux directions, comme les personnes qui cherchent leur chemin."),
          F('malicieux', "Moi, je n’hésite jamais."),
          Nox('sarcasme', "L’autre jour, tu as mis cinq minutes à choisir entre une brioche et un biscuit."),
          F('impatient', "C’était une décision stratégique !"),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          F('content', "Il hésite entre deux directions…"),
          F('malicieux', "C’est comme moi devant un buffet. Mais je finis toujours par trouver le bon chemin.")
        ]
      },
      puzzle: 'p20',
      outro: [
        Brume('gravite', "Vous avez presque rassemblé les vingt-quatre éclats. Mais seuls certains sont de véritables fragments de l’Étoile."),
        F('surpris', "Aaaah, j’ai compris ! Il y a des fragments et des souvenirs ! Alors nous avons cherché les deux ?"),
        Brume('sagesse', "Oui. Les souvenirs protègent les fragments. Et les fragments protègent ce que les souvenirs racontent."),
        Brume('gravite', "Si vous aviez détruit les éclats qui vous semblaient inutiles, vous auriez effacé une partie de l’histoire du royaume."),
        F('reflexion', "Je comprends mieux. Il ne fallait pas seulement trouver les morceaux de l’Étoile. Il fallait comprendre pourquoi ils étaient cachés."),
        Nox('loyaute', "Tu as appris à regarder avant de juger. C’est une qualité rare, même chez les corbeaux."),
        F('guide', "Le château a sa propre bibliothèque, juste au-dessus. Si les dernières pages du Veilleur existent encore quelque part, c’est peut-être là.")
      ]
    },

    21: {
      scene: "lieu-j21-grande-bibliotheque.webp", sceneLocked: "lieu-j21-grande-bibliotheque.webp",
      zone: 4, title: "Les titres cachés",
      goal: "Choisir les quatre livres qui racontent la même histoire que tes preuves.",
      summary: "La cloche muette fait apparaître les titres cachés de la Grande Bibliothèque. {nom} choisit les quatre livres qui concordent avec ses preuves et découvre le journal complet du Veilleur : il voulait qu'une personne extérieure au royaume décide de l'avenir de l'Étoile.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      requires: {
        item: 'cloche',
        locked: [
          N("La Grande Bibliothèque s’étend sur trois étages de rayonnages. Pourtant, tous les livres ont le dos blanc."),
          N("Aucun titre. Aucun nom d’auteur. Aucun numéro. Comme si quelqu’un avait voulu rendre chaque livre impossible à retrouver."),
          F('surpris', "Des livres sans titre ?! Comment on les trie ?! C’est un cauchemar de bibliothécaire !"),
          F('reflexion', "Si les livres ne veulent pas dire leur nom… il faudrait quelque chose qui sache les écouter.")
        ],
        wrong: [
          F('decu', "Les livres ne bougent pas. Il faut quelque chose qui sache les écouter.")
        ],
        open: [
          N("Tu agites la cloche sans battant. Elle ne produit aucun son."),
          N("Pourtant, les dos des livres se mettent à frémir. Des titres apparaissent, un à un, comme de l’encre qui remonte à la surface."),
          F('emerveille', "Elle écoute vraiment les livres !")
        ]
      },
      intro: [
        N("Un frôlement d’ailes résonne dans la bibliothèque. Dame Plume se pose sur le haut d’une échelle, ses lunettes légèrement de travers."),
        Plume('rigueur', "Pardonnez cette entrée. J’ai entendu les livres frémir… alors je suis venue."),
        F('content', "Dame Plume ! Vous êtes venue nous aider ?"),
        Plume('rigueur', "Je suis venue ranger."),
        F('surpris', "Ranger ? La bibliothèque de quelqu’un d’autre ?"),
        F('malicieux', "Dame Plume… Je dis ça avec beaucoup d’affection, mais il faudrait peut-être penser à prendre des vacances."),
        Plume('exasperation', "Des vacances ?! Une bibliothécaire ne prend jamais de vacances, jeune bonhomme. Les livres, eux, ne se rangent jamais tout seuls."),
        Plume('rigueur', "Il y a quatre livres que le Conseil a voulu faire disparaître. Ils contiennent les versions originales de la séance, les notes du Veilleur et les premières chroniques."),
        Plume('culpabilite', "J’ai laissé faire. Je pensais protéger la bibliothèque. En réalité, je protégeais le mensonge.")
      ],
      gift: {
        item: 'livre',
        lines: [
          Plume('respect', "Ce livre n’a jamais eu une seule ligne écrite."),
          N("Ses pages sont blanches, mais elles semblent frémir sous la lumière."),
          Plume('calme', "Elles restent muettes pour ceux qui veulent imposer leur propre histoire. Elles se rempliront lorsque l’histoire sera complète."),
          Plume('respect', "Prenez-le. Il est à vous."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          F('emerveille', "Un livre blanc ! Je peux écrire dedans ?"),
          Plume('curiosite', "Pas encore."),
          F('malicieux', "Dommage. J’avais déjà prévu d’y dessiner mon portrait. Grandeur nature.")
        ]
      },
      puzzle: 'p21',
      outro: [
        F('reflexion', "Le Veilleur voulait que quelqu’un d’extérieur décide. Quelqu’un qui ne serait pas déjà pris dans les histoires du royaume."),
        Plume('respect', "Il vous a choisie sans vous connaître. Il ne savait qu’une chose : la personne qui viendrait devrait comprendre avant de réparer."),
        Plume('soulagement', "Je vais rouvrir mon rayon fermé. Il n’y aura plus de livres interdits : ni chez moi, ni ici."),
        F('determine', "Il nous reste à retrouver la vraie fin de la prophétie. Celle qu’Aldric a fait effacer."),
        N("Au-dessus de la bibliothèque, un balcon s’ouvre sur le ciel. Six étoiles sont gravées dans la pierre, mais aucune ne brille.")
      ]
    },

    22: {
      scene: "lieu-j22-balcon-allume.webp", sceneLocked: "lieu-j22-balcon-eteint.webp",
      zone: 4, title: "La prophétie complète",
      goal: "Guider la lumière jusqu'aux six étoiles et compléter la prophétie effacée.",
      summary: "La fiole de lumière du lac projette son rayon sur les six étoiles gravées du Balcon. Remises dans l'ordre, leurs lettres forment « BRILLE » : la prophétie complète est « L'Étoile ne sera pas restaurée par celui qui la garde, mais par celui qui saura pourquoi elle brille. » On l'avait tronquée.",
      requires: {
        item: 'fiole',
        locked: [
          N("Le balcon des Étoiles domine tout le royaume. Dans la pierre de la balustrade, six petites étoiles sont gravées, toutes éteintes."),
          N("Au centre, un creux de la forme d’une fiole."),
          F('reflexion', "Six étoiles éteintes… Il faudrait leur rendre leur lumière.")
        ],
        wrong: [
          F('decu', "Non. Ça ne va pas dans ce creux.")
        ],
        open: [
          N("Tu poses la fiole dans le creux. La goutte tremble, puis s’illumine."),
          N("Autour d’elle, les six étoiles gravées s’éveillent faiblement, reliées par de fins traits de lumière. Mais aucune ne livre encore ce qu’elle garde.")
        ]
      },
      intro: [
        N("Au-dessus du balcon, les étoiles s’alignent comme les mots d’un très ancien message."),
        Aurore('nostalgie', "Je me souviens du jour où le tailleur de pierre a gravé cette phrase."),
        F('surpris', "L’Ancienne Aurore ?! Vous aussi, vous nous avez suivis ? Il y a encore d’autres personnes cachées derrière nous ? Ça commence à faire beaucoup de monde !"),
        Aurore('douceur', "Rassure-toi, petit flocon. Les vieilles aurores vont seulement là où l’on a besoin d’elles."),
        Aurore('tristesse', "Je me souviens aussi de celui qui en a effacé la fin."),
        F('reflexion', "La prophétie était incomplète depuis tout ce temps ?"),
        Aurore('gravite', "Aldric a fait graver une autre fin par-dessus. Une fin qui le désignait, lui."),
        Aurore('sagesse', "Mais la pierre se souvient de ce qu’on y a gravé en premier. Et la vraie fin ne parlait ni de pouvoir, ni de royauté, ni de victoire."),
        Aurore('sagesse', "Regarde bien les étoiles. Chacune garde une lettre de la vraie fin. Il te restera à retrouver leur ordre.")
      ],
      gift: {
        item: 'lunette',
        lines: [
          Aurore('tendresse', "Regarde dans cette lunette."),
          N("La lunette est ancienne. Sa monture est ornée de minuscules étoiles."),
          Aurore('sagesse', "Elle montre les étoiles non comme elles sont, mais comme elles se souviennent d’avoir été."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          N("Dans la lunette, les six étoiles gravées brillent d’une lumière dorée, comme au jour de leur création."),
          F('emerveille', "C’est magnifique…")
        ]
      },
      puzzle: 'p22',
      outro: [
        Aurore('espoir', "Tu as retrouvé la prophétie. Le Veilleur avait attendu quelqu’un capable de comprendre ce qu’il n’avait pas réussi à comprendre lui-même."),
        F('fier', "Et moi, je suis l’assistant officiel de la personne plus forte que le Veilleur !"),
        F('malicieux', "Enfin… assistant officiel en période d’essai."),
        F('attend', "Dis, {nom}… Alors ? Je suis pris ?"),
        N("Flocon te regarde avec de grands yeux pleins d’espoir. Puis il se racle la gorge, très dignement, comme si de rien n’était."),
        Aurore('douceur', "Il reste une dernière épreuve avant le cœur du château. Descends à la cheminée royale."),
        Aurore('gravite', "L’Étoile ne se rallumera pas avec ses seuls fragments. Il lui faut ce qui l’a toujours nourrie."),
        F('reflexion', "Des souvenirs, j’imagine ?"),
        Aurore('sagesse', "Les souvenirs… et ce qu’ils nous apprennent à partager."),
        F('enerve', "Encore des histoires de souvenirs ! Je commence à en avoir un peu marre, moi… Je n’y comprends plus rien du tout !")
      ]
    },

    23: {
      scene: "lieu-j23-cheminee-eteinte.webp", sceneLocked: "lieu-j23-cheminee-eteinte.webp",
      zone: 4, title: "Les boîtes de mémoire",
      goal: "Choisir les souvenirs du royaume qui nourrissent le feu de la cheminée.",
      summary: "La cheminée royale renferme les souvenirs de Noël des habitants, scellés par le Conseil dans des boîtes de cire rouge. La bague d'Éloi, celle d'un Ancien, brise les sceaux. {nom} associe les cinq souvenirs que le miroir lui a montrés à ce qu'ils offrent au feu : traditions, partage, moments ensemble, mémoire, pardon. Les bûches de cristal, venues de la Grotte des Échos, s'embrasent, et le Cœur de Noël apparaît.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      requires: {
        item: 'bague',
        locked: [
          N("La cheminée royale est immense, assez large pour contenir un chêne. Pourtant, son foyer est froid : des bûches de cristal y dorment, éteintes."),
          N("Des sceaux de cire rouge, frappés d’une couronne, recouvrent plusieurs petites boîtes disposées autour de la cheminée."),
          F('reflexion', "Ces boîtes ont été scellées par le Conseil. Il faut les ouvrir sans les abîmer."),
          F('cherche', "Un sceau du Conseil… Qui aurait le droit de l’ouvrir ?")
        ],
        wrong: [
          F('decu', "Le sceau ne réagit pas. On dirait qu’il ne reconnaît pas ce qu’on lui présente.")
        ],
        open: [
          N("Tu poses la bague d’Éloi sur le premier sceau. Sa pierre bleue s’allume : la cire reconnaît la marque d’un Ancien. Un à un, les cachets se fissurent et les boîtes s’ouvrent."),
          N("À l’intérieur, des souvenirs apparaissent sous forme de petites lumières : une guirlande, une fournée de pain, une promesse, une lanterne, une main tendue."),
          F('emerveille', "Ce ne sont pas des trésors… Ce sont des souvenirs !")
        ]
      },
      intro: [
        N("Dame Brume sort de l’ombre de la cheminée, comme si elle avait toujours été là."),
        Brume('sagesse', "Chaque boîte contient une chose que le royaume avait oubliée."),
        F('reflexion', "Pourquoi les avoir enfermées ?"),
        Brume('tristesse', "Parce que le Conseil croyait que la magie devait être conservée, contrôlée et possédée."),
        Brume('gravite', "Ils ont oublié que les souvenirs ne vivent pas dans des coffres. Ils vivent lorsqu’on les partage."),
        N("Les boîtes sont marquées de symboles : une guirlande, un pain, une pierre, une lanterne et un pont."),
        Brume('sagesse', "Le feu royal ne s’allumera pas avec n’importe quel souvenir. Il faut choisir ceux qui nourrissent véritablement le royaume."),
        F('malicieux', "Je peux proposer une boîte remplie de biscuits ?"),
        Brume('amusement', "Les biscuits peuvent nourrir un aventurier. Mais ce n’est pas tout à fait ce que nous cherchons.")
      ],
      gift: {
        item: 'coeur',
        lines: [
          N("Au creux des braises, une petite chose chaude se met à battre. Ni vraiment un objet, ni vraiment une flamme."),
          Brume('espoir', "Le Cœur de Noël. Il contient les souvenirs de tout un royaume."),
          Brume('confiance', "Les fêtes, les chansons, les traditions, les gestes de bonté… tout ce qui donne un sens à la lumière."),
          Brume('confiance', "Prends-le. Il est à toi."),
          F('guide', "Ton cadeau du jour t’attend dans le vrai monde. Ouvre-le, trouve la petite carte et recopie son code dans le livre magique.")
        ],
        after: [
          F('emerveille', "Oh, il est tout chaud !"),
          F('malicieux', "Je crois qu’il m’aime bien. Ou alors il essaie de me faire fondre. C’est difficile à savoir."),
          Brume('sagesse', "Il aime tous ceux qui le portent avec soin.")
        ]
      },
      puzzle: 'p23',
      outro: [
        F('reflexion', "Je crois que je comprends enfin."),
        F('reflexion', "Ce n’est pas seulement une Étoile qu’on essaie de réparer. C’est tout le royaume."),
        Brume('sagesse', "Alors tu sais déjà ce que le Veilleur voulait que tu saches."),
        Brume('espoir', "L’Étoile était devenue trop puissante parce qu’elle gardait tout pour elle. La nouvelle magie devra circuler entre les habitants."),
        F('determine', "Il ne reste plus qu’un lieu : le cœur du château."),
        F('serein', "Allons-y ensemble. On a traversé le village, la forêt, les montagnes et le château. On ne va pas s’arrêter maintenant.")
      ]
    },

    24: {
      zone: 4, title: "Le cœur du château", finale: true,
      scene: "lieu-j24-salle.webp", sceneSolved: "lieu-j24-salle-emblemes.webp", sceneLocked: "lieu-j24-salle.webp",
      goal: "Placer tes trois objets dans le mécanisme final et redonner vie à l'Étoile.",
      summary: "Au cœur du château, {nom} place dans le mécanisme final la vérité, la mémoire et le choix. Les vingt-quatre éclats se mêlent aux souvenirs du Cœur de Noël : l'Étoile renaît, nouvelle et plus lumineuse. Le Veilleur est innocenté devant tout le royaume, Aldric baisse enfin la tête, Éloi et Maître Givre reconnaissent leur silence, et Flocon décide de rester avec {nom}, dans son monde.",
      flow: ['intro', 'puzzle', 'gift', 'outro'],
      intro: [
        N("Le sceau du Veilleur ouvre les dernières portes. Elles se referment derrière vous dans un grondement profond."),
        N("Au centre de la grande salle, un immense motif d’Étoile est gravé dans le sol. Il lui manque sa lumière, son centre et ses vingt-quatre branches."),
        N("Autour de l’Étoile, trois emplacements attendent quelque chose. Le premier porte le symbole d’une vérité. Le deuxième, celui d’un souvenir. Le troisième, celui d’un chemin à choisir."),
        F('peur', "Voilà. C’est ici."),
        F('peur', "Je n’ai jamais eu aussi peur… ni aussi hâte."),
        N("Dans l’ombre des piliers, des silhouettes se rassemblent."),
        Brume('espoir', "Nous sommes là. Nous ne pouvons pas faire ce que vous allez faire. Seulement être présents."),
        Nox('loyaute', "Si ça rate, je n’aurai rien dit. Si ça marche, j’étais là depuis le début."),
        F('malicieux', "C’est une façon très corbeau de dire que tu es fier de nous."),
        Nox('sarcasme', "Ne le répète à personne."),
        Eloi('courage', "Je suis revenu pour dire ce que je n’ai pas dit autrefois. Le Veilleur n’a pas trahi le royaume. C’est nous qui avons trahi la vérité."),
        N("Deux autres silhouettes sortent de l’ombre : Maître Givre, pâle comme le givre… et le Veilleur des Neiges lui-même."),
        Givre.spectral('culpabilite', "J’ai aidé à briser l’Étoile. Je ne peux pas effacer ce geste. Mais je peux enfin reconnaître pourquoi il était nécessaire."),
        Veilleur.homme('paix', "Je ne suis pas venu pour vous guider. Seulement pour être là."),
        Veilleur.homme('gravite', "Trois choses ont été retirées à ce royaume : la vérité, ses souvenirs, et le droit de choisir son chemin. Vous les avez retrouvées."),
        F('determine', "Alors rendons-les. Ensemble."),
        { scene: "lieu-j24-salle-etoile.webp" },
        N("Le motif de l’Étoile s’illumine légèrement. Trois emplacements attendent les derniers éléments."),
        F('reflexion', "Il ne suffit pas de mettre les objets dans les bonnes places. Il faut comprendre ce qu’ils représentent."),
        Veilleur.homme('paix', "Vous avez appris à regarder les traces, à écouter les souvenirs et à douter des histoires trop parfaites."),
        Veilleur.homme('espoir', "Maintenant, montrez à l’Étoile ce que vous avez compris.")
      ],
      gift: {
        item: 'etoile',
        lines: [
          N("Les éclats rassemblés jour après jour quittent lentement la besace de {nom}. Ils se mettent à flotter en cercle dans l’air froid du château."),
          FX('finale-start'),
          F('emerveille', "Ils sont là… Ils brillent."),
          F('serein', "Touche-les, {nom}. Touche l’Étoile pour la réveiller !", { await: 'tap' }),
          F('serein', "Il manque une dernière chose : ton vrai cadeau d’aujourd’hui, juste là, pour toi."),
          F('serein', "C’est la dernière pièce de notre Étoile."),
          F('guide', "Ouvre-le, trouve la carte et recopie son code dans le livre magique. Et regarde ce qui se passe…")
        ],
        after: [
          FX('finale-assemble'),
          N("Les fragments se rejoignent un à un, dans un tintement de cloche."),
          N("Mais la lumière ne reprend pas sa forme d’autrefois."),
          N("Elle se mêle aux souvenirs du Cœur de Noël. Les vingt-quatre éclats s’unissent, puis se transforment."),
          N("Une nouvelle Étoile prend forme : plus douce, plus claire, plus stable."),
          FX('finale-bloom'),
          N("Une Étoile qui n’a rien à consumer, parce que sa lumière est partagée."),
          F('emerveille', "Elle est magnifique…"),
          F('emerveille', "Elle ne brille pas toute seule. On dirait qu’elle porte un peu de chacun de nous."),
          Veilleur.homme('paix', "C’est ainsi qu’elle aurait toujours dû briller."),
          Brume('espoir', "La magie ne sera plus enfermée dans un seul objet. Elle circulera entre les habitants, dans leurs gestes, leurs souvenirs et leurs traditions."),
          Givre.spectral('soulagement', "Le temps peut enfin reprendre son cours."),
          N("Au loin, l’horloge de la mairie se met à sonner à toute volée."),
          N("Dans le village, les guirlandes s’allument. La forêt retrouve ses couleurs. Les cascades de glace recommencent à scintiller."),
          N("Les fenêtres du château s’illuminent une à une.")
        ]
      },
      puzzle: 'p24',
      outro: [
        Eloi('courage', "Il faut que le royaume entende la vérité."),
        Veilleur.homme('gravite', "Je ne demande ni pardon, ni couronne, ni retour à ce que j’étais."),
        Veilleur.homme('paix', "Je veux seulement que les habitants sachent pourquoi l’Étoile a été brisée."),
        Nox('loyaute', "Cette fois, je porterai le message. Et je ne laisserai personne le modifier en chemin."),
        F('malicieux', "Je pourrais venir aussi. Je suis très doué pour les messages importants."),
        Nox('sarcasme', "Tu es surtout doué pour les messages lorsqu’ils sont accompagnés de biscuits."),
        F('fier', "Les biscuits sont une excellente méthode de communication."),
        { scene: "lieu-j24-peuple.webp" },
        N("Les portes du château s’ouvrent. Au-dehors, les habitants se rassemblent sous les guirlandes."),
        N("Pour la première fois depuis la Nuit des Éclats, le Veilleur des Neiges apparaît au grand jour."),
        N("Personne ne s’agenouille. Personne ne le condamne. Ils l’écoutent."),
        Veilleur.homme('sincerite', "Je n’ai pas brisé l’Étoile pour détruire Noël. Je l’ai brisée parce qu’elle allait dévorer ce qu’elle devait protéger."),
        Veilleur.homme('paix', "J’aurais dû parler plus tôt. J’aurais dû trouver un autre moyen. Mais je ne pouvais pas laisser la magie continuer à prendre sans jamais rendre."),
        Givre.spectral('culpabilite', "Et moi, j’aurais dû dire la vérité."),
        Eloi('courage', "Nous avons tous laissé le silence devenir un mensonge."),
        N("Au dernier rang de la foule, un vieil ours au manteau bleu nuit garde les yeux baissés : Aldric. Les autres Anciens se tiennent près de lui, en silence."),
        Veilleur.homme('paix', "Je ne demande pas qu’on les punisse. Je demande seulement que plus jamais une seule voix n’écrive l’histoire à la place de tous."),
        N("Les habitants comprennent enfin. Le Veilleur n’était pas leur ennemi. Il avait tenté de sauver leur royaume, au prix de sa propre réputation."),
        F('serein', "Tu vois ? La vérité finit toujours par retrouver son chemin."),
        F('malicieux', "Même si elle doit passer par un village, une forêt, une montagne, un château et beaucoup trop d’escaliers."),
        N("La nouvelle Étoile s’élève au-dessus du château. Sa lumière se divise en milliers de petites étincelles."),
        N("Chaque étincelle rejoint une maison, une lanterne, une fenêtre, une chanson."),
        Brume('sagesse', "La magie n’appartient plus au château. Elle appartient à ceux qui la font vivre."),
        Aurore('tendresse', "Les traditions ne sont pas des choses que l’on garde enfermées. Ce sont des choses que l’on transmet."),
        Givre.spectral('espoir', "Et le temps peut recommencer."),
        N("L’horloge de la mairie sonne minuit. Mais cette fois, personne ne cherche à l’arrêter."),
        F('amoureux', "On a réussi…"),
        F('serein', "On a vraiment réussi."),
        Veilleur.homme('gratitude', "Vous avez fait ce que je n’ai jamais su faire : vous avez compris que la magie ne se sauve pas en la possédant."),
        Veilleur.homme('paix', "Elle se sauve en la partageant."),
        FX('finale-glow'),
        N("Le Royaume de l’Étoile d’Hiver a retrouvé sa lumière."),
        N("Les portes du village sont ouvertes. Les lanternes de la forêt brillent à nouveau. Les cascades du Royaume de Glace scintillent. Et le château n’est plus plongé dans le silence."),
        F('reflexion', "Tu sais… au début, je pensais que tu serais simplement ma partenaire d’aventure."),
        F('amoureux', "Je ne savais pas que tu deviendrais la personne qui aiderait tout un royaume à retrouver sa lumière."),
        F('malicieux', "Bon. Je le savais peut-être un tout petit peu. J’ai un instinct extraordinaire."),
        F('amoureux', "Mais je crois que ma partie préférée, ce n’est pas d’avoir sauvé l’Étoile."),
        F('amoureux', "C’est d’avoir traversé toutes ces aventures avec toi."),
        F('serein', "Si je pouvais garder un seul souvenir de cette aventure, ce serait celui de nous deux, en train de rire, malgré le froid, les énigmes et mes incroyables maladresses."),
        N("Flocon regarde une dernière fois le château. Puis il se tourne vers toi."),
        F('serein', "Notre aventure dans ce royaume est terminée."),
        F('malicieux', "Mais j’ai une dernière mission pour toi."),
        F('malicieux', "Tu croyais que le jour 24 était le dernier cadeau ?"),
        F('malicieux', "Pas tout à fait."),
        F('amoureux', "Après toutes ces aventures, toutes ces énigmes et toutes ces lumières retrouvées… j’aimerais t’offrir quelque chose qui ne vient pas du royaume."),
        N("Une dernière enveloppe apparaît. Elle ne porte ni sceau ancien, ni symbole magique."),
        F('serein', "Elle est pour toi."),
        F('amoureux', "Parce que les plus beaux souvenirs ne sont pas toujours ceux qu’on trouve dans les histoires."),
        F('amoureux', "Ce sont ceux qu’on crée ensemble."),
        FX('finale-letter'),
        F('serein', "Tu sais, quand je t’ai rencontrée, je pensais être le plus grand aventurier du royaume."),
        F('malicieux', "Je le pense toujours, d’ailleurs."),
        F('serein', "Mais tu m’as appris qu’être courageux, ce n’est pas ne jamais avoir peur. C’est continuer même quand on doute."),
        F('amoureux', "Merci de m’avoir emmené avec toi."),
        F('amoureux', "Et merci d’avoir partagé cette aventure avec moi."),
        F('serein', "Le Royaume de l’Étoile d’Hiver gardera toujours un peu de ta lumière."),
        F('reflexion', "Tu sais… j’ai pris une grande décision. Une décision très importante. Peut-être la plus importante de toute ma carrière d’aventurier."),
        F('amoureux', "Je reste avec toi. Dans ton monde. Le royaume a retrouvé sa lumière… et moi, j’ai trouvé ma partenaire."),
        F('malicieux', "Mais attention : il y a une condition. En échange, on partira à l’aventure ensemble. Souvent. Très souvent. C’est non négociable."),
        N("Au-dessus du château, la nouvelle Étoile brille doucement."),
        N("Décidant de rester dans le monde réel, un petit bonhomme de neige prépare déjà sa prochaine aventure."),
        F('malicieux', "Mais d’abord… est-ce qu’on peut manger quelque chose ? Les héros ont faim."),
        FX('finale-fade')
      ]
    }
  };

  /* ---------- Le mot de Flocon à la fin de chaque jour (joué juste avant que le chapitre se termine) ----------
     Une phrase par jour : Flocon est content d'être avec l'héroïne. (Le jour 24 a la sienne dans son outro.) */
  Game.data.dayClosings = {
    1: [F('content', "Je ne pensais pas qu’une aventure pouvait être aussi amusante. Enfin… avant de te rencontrer, je n’avais pas beaucoup d’aventures.")],
    2: [F('surpris', "Tu as vu ça ?! Tu as résolu cette énigme ! Moi, j’aurais probablement essayé de la manger.")],
    3: [F('fier', "Tu réfléchis, tu observes, tu trouves des solutions… Moi, je fais les discours héroïques. On forme une équipe parfaite !")],
    4: [F('courage', "Avec toi à mes côtés, je suis sûr qu’on pourrait affronter n’importe quoi… Bon, peut-être pas une armée de bonshommes de neige en colère.")],
    5: [F('malicieux', "Tu es vraiment douée, {nom}. Je le savais ! Enfin… je le savais depuis au moins trois énigmes.")],
    6: [F('fier', "On devrait écrire un livre sur nos aventures. Je propose comme titre : « {nom} et Flocon, les héros légendaires… ».")],
    7: [F('emerveille', "Tu es une sacrée aventurière, {nom} ! Je commence à me demander lequel de nous deux est le plus impressionnant.")],
    8: [F('victoire', "Je savais que tu réussirais ! Bon, j’ai peut-être eu un petit moment de panique… mais intérieurement, j’étais confiant.")],
    9: [F('determine', "Tu n’abandonnes jamais, même quand les choses deviennent difficiles. C’est ça, une véritable aventurière !")],
    10: [F('reflexion', "Parfois, je me demande si la magie vient vraiment des étoiles… ou simplement des personnes avec qui on partage les moments importants.")],
    11: [F('emerveille', "Je suis impressionné par toi. Et crois-moi, impressionner le grand Flocon n’est pas une mince affaire.")],
    12: [F('serein', "Je crois que je commence à comprendre pourquoi les aventuriers voyagent en équipe. C’est beaucoup plus chouette quand on n’est pas tout seul.")],
    13: [F('rire', "Je suis heureux de partager tout ça avec toi. Même les moments où je tombe dans la neige. Surtout ceux où tu ris de moi, en fait.")],
    14: [F('impatient', "Tu crois qu’on peut être officiellement une équipe de légende ? Parce que j’aimerais beaucoup une médaille. Ou un biscuit. Les deux, idéalement.")],
    15: [F('courage', "Tu as un courage incroyable. Même quand tu doutes, tu continues d’avancer. C’est quelque chose que j’admire beaucoup.")],
    16: [F('serein', "Je n’ai pas encore vécu beaucoup d’aventures… mais je sais déjà que celle-ci comptera toujours pour moi.")],
    17: [F('malicieux', "Je crois que cette aventure est la meilleure décision que j’aie prise de toute ma vie. La deuxième meilleure étant de ne pas manger cette mystérieuse baie dans la Forêt des Lumières.")],
    18: [F('serein', "Tu es bien plus forte que tu ne le crois, {nom}. Et je serai là pour te le rappeler chaque fois que tu l’oublieras.")],
    19: [F('conquete', "À ce rythme, tu vas devenir une légende du royaume ! J’espère qu’on mentionnera aussi mon rôle de conseiller stratégique.")],
    20: [F('rire', "Je ne sais pas ce que le royaume ferait sans nous. Probablement beaucoup moins de choses héroïques… et beaucoup moins de blagues.")],
    21: [F('determine', "Si je devais choisir une partenaire pour traverser mille royaumes enneigés, je te choisirais encore. Sans hésiter !")],
    22: [F('fier', "{nom}, tu es officiellement la meilleure partenaire que le grand Flocon ait jamais eue ! Bon… tu es aussi la seule. Mais ça compte quand même !")],
    23: [F('amoureux', "{nom}, merci de m’avoir laissé t’accompagner. Je ne suis peut-être qu’une petite peluche, mais avec toi, j’ai l’impression de vivre la plus grande aventure du monde."),
         F('impatient', "Oh, et avant le grand final… on doit faire le point tous les deux. Touche-moi, en bas de l’écran, quand tu es prête !")],
  };
  Object.keys(Game.data.dayClosings).forEach((d) => { if (Game.data.days[d]) Game.data.days[d].closing = Game.data.dayClosings[d]; });

  /* ---------- Fin du jeu : la lettre « Notre prochaine aventure », puis la carte finale ---------- */
  Game.data.finale = {
    // La lettre que Flocon remet à la fin (fenêtre « Notre prochaine aventure »).
    letter: {
      title: "Notre prochaine aventure",
      before: [
        "Bravo d’avoir sauvé le Royaume de l’Étoile d’Hiver, toi et Flocon ! Avec une équipe pareille, rien ne pouvait vous résister !",
        "J’espère que ton cadeau de Noël te plaira !",
        "Maintenant que tu as rétabli les souvenirs de tout un royaume, c’est à nous de nous créer tout plein de souvenirs !"
      ],
      real: null,
      after: [],
      signature: "Joyeux Noël ❤️"
    },
    // La carte qui clôt l'aventure.
    title: "Fin de l’aventure",
    subtitle: "Joyeux Noël ❤️",
    message: [
      "La magie ne disparaît jamais vraiment.",
      "Elle continue de briller dans les souvenirs que l’on partage."
    ]
  };
})();
