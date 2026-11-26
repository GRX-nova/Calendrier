/* ==========================================================================
   ÉNIGMES — une par journée (voir data/days.js : champ `puzzle`).

   Principe : jamais d'indice ni de choix multiple. Tout se résout avec l'énoncé et avec les pages du
   Carnet d'indices (data/docs.js) : le jeu ne dit jamais lesquelles. Les indices d'une énigme sont REÇUS
   avant qu'elle commence (champ `clues`), mais ils ne s'affichent jamais avec l'énoncé : la joueuse doit
   ouvrir son carnet et retrouver les pages utiles.

   TYPES
     text     réponse écrite                answers:[…]                      (accents, majuscules, espaces ignorés)
     multi    plusieurs réponses écrites    fields:[{label, answers:[…], keywords:[…]}]
                                            (`keywords` : la réponse est juste si elle CONTIENT un de ces mots)
     combo    serrure à molettes            digits, symbols, answer
     order    remettre dans l'ordre         items:[…] (dans le BON ordre), labels:[…] facultatifs
     match    associer des paires           pairs:[[gauche, droite],…], extras:[intrus à droite]
     pick     cocher les bonnes cartes      cards:[{title,text}], answer:[indices]
     svgpick  toucher le bon dessin         svg, answer:'clé' ou ['clé',…]  (les zones touchables portent data-k)
     diff     différences entre 2 images    titles, a, b, targets:[{x,y,r}]
     jigsaw   reconstituer une image        svg (contenu SVG), cols, rows, w, h
     mirrors  guider un faisceau de lumière source, walls, fixed, movable, targets, cols, rows
     find     objets cachés dans le décor   targets:[{x,y,r}]  (pixels de l'illustration 1670 × 941)
     steps    une énigme en plusieurs étapes : steps:[ {type, prompt, …}, … ]

   COMMUN À TOUS
     title, prompt (énoncé), success (dialogue après la victoire),
     clues (documents reçus AVANT l'énigme, rangés dans le carnet), clueLines (dialogue qui accompagne cette remise),
     carnet (true : l'énigme s'appuie sur le carnet, sans nouvel indice : un rappel s'affiche sous l'énoncé),
     docs (documents ajoutés au Carnet d'indices une fois l'énigme résolue).
   Énigme en plusieurs étapes : à la fin d'une étape (sauf la dernière), le résultat est noté automatiquement
     dans le carnet (« Notes · … »). Par étape : `grants:[docs]` donne de vrais documents à la place,
     `note:{title,body:[…]}` remplace le texte de la note, `note:false` n'en écrit pas.
   Balisage dans les textes : **gras**, *italique*, [[pig:TEXTE]], [[emb:nom]], [[chart]].

   ⚠ Chaque solution a été vérifiée par un script : si tu modifies un énoncé ou un tableau, vérifie qu'il reste
   UNE seule réponse possible et que tous les indices nécessaires sont bien dans le jeu avant l'énigme.
   ========================================================================== */
(function () {
  const F = (expr, text) => ({ who: 'flocon', expr, text });
  const N = (text) => ({ who: 'narrator', text });
  const P = (name, text, expr) => Game.chars.npc(name, text, expr);
  const { Givre, Brume, Nox, Eloi, Cannelle, Grelot, Plume, Aurore, Veilleur } = Game.chars.speakers;
  const M = Game.data.maps;
  const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

  Game.data.puzzles = {

    /* ---------------------------------------------------------------- JOUR 1 · le signe sous le rabat */
    p01: {
      type: 'text', title: "Le signe sous le rabat", placeholder: "Le lieu désigné…",
      prompt: "Sous le sceau de l'enveloppe, le Veilleur a tracé quelques signes. Au dos, sa grille donne la lettre de chaque signe. Quel lieu du village désigne-t-il ?",
      clues: ['rabat'],
      clueLines: [
        N("{nom} recopie soigneusement ces signes sur une page de son carnet."),
        { doc: 'rabat' },
        F('guide', "Tout ce qu’on trouve se range dans ton carnet d’indices : la lettre, son revers… et maintenant ces signes. Il ne s’ouvre pas tout seul, alors ouvre-le, relis tes pages, et retrouve celles qui peuvent nous servir !")
      ],
      answers: ["boulangerie", "la boulangerie", "la boulangerie de mme cannelle", "boulangerie de mme cannelle", "chez mme cannelle", "chez cannelle", "mme cannelle", "cannelle"],
      success: [
        F('emerveille', "« LA BOULANGERIE » !"),
        F('celebration', "On vient de déchiffrer un message secret, {nom} ! Un vrai ! Avec des signes et tout !"),
        F('malicieux', "Je propose qu’on ajoute « déchiffreur de messages secrets » à mon titre d’aventurier. Ça commence à faire beaucoup de titres, mais je les mérite.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 2 · le cahier de cuisson */
    p02: {
      type: 'multi', title: "Le cahier de cuisson",
      prompt: "Mme Cannelle note tout ce qu'elle cuit, à la minute près. Le soir de la Fête des Lumières, deux visiteurs sont entrés chez elle pendant la dernière fournée, et sont repartis à l'instant où elle la sortait du four. À partir de son cahier, retrouve **l'heure de sortie des biscuits d'étoiles**, puis **l'heure d'arrivée** des visiteurs.",
      clues: ['cahier_cuisson'],
      fields: [
        { label: "Heure de sortie des biscuits d'étoiles", placeholder: "hh h mm", answers: ["23h58", "2358"] },
        { label: "Heure d'arrivée des visiteurs", placeholder: "hh h mm", answers: ["23h35", "2335"] }
      ],
      docs: ['note_cannelle'],
      success: [
        Cannelle('nostalgie', "23 h 35… Oui. C’est bien ça."),
        Cannelle('tristesse', "Je n’osais plus prononcer cette heure. Comme si la dire à voix haute pouvait réveiller quelque chose que j’avais passé des années à essayer d’oublier."),
        F('reflexion', "Quelqu’un est entré à 23 h 35 et ressorti à 23 h 58. Vingt-trois minutes."),
        F('malicieux', "C’est beaucoup pour acheter du pain. Même quand on hésite entre une brioche et un pain d’épices."),
        Cannelle('accueil', "Attendez… Il y a autre chose. Le lendemain, j’ai écrit ce que je savais sur un bout de papier, que j’ai glissé dans mon cahier. Je ne l’ai jamais montré à personne."),
        Cannelle('generosite', "Tenez : c’est ma note secrète. Elle vous appartient, maintenant. Elle dit tout ce dont je me souviens de ces deux visiteurs.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 3 · les rouages de l'horloge */
    p03: {
      title: "L'horloge de la mairie",
      clues: ['cadran_releve'], carnet: true,
      clueLines: [
        Givre('reserve', "Voici le relevé que j’ai fait du cadran, le matin qui a suivi la Nuit des Éclats. Un horloger ne perd jamais ce qu’il a noté."),
        { doc: 'cadran_releve' },
        Givre('reserve', "Et si vous avez recueilli d’autres informations sur cette nuit-là, c’est le moment de vous en servir.")
      ],
      steps: [
        {
          type: 'order', title: "Les rouages de l'horloge",
          prompt: "Maître Givre a démonté cinq rouages. Chacun ne tourne qu'à un instant précis de la nuit où l'Étoile s'est brisée. Pour redémarrer le mécanisme, remets-les dans l'ordre où ils tournent, du premier au dernier.",
          items: [
            "**Rouage des Arrivants** : il tourne à l'heure où les deux visiteurs entrent chez Mme Cannelle.",
            "**Rouage du Souffle** : il tourne onze minutes avant l'heure où le cadran s'est bloqué.",
            "**Rouage de l'Arrêt** : il tourne à l'heure inscrite sur le cadran bloqué.",
            "**Rouage du Départ** : il tourne quand les deux visiteurs ressortent de la boulangerie.",
            "**Rouage de l'Étoile** : il tourne au dernier coup de minuit, quand l'Étoile se brise."
          ],
          labels: ["1er", "2e", "3e", "4e", "5e"],
          note: { title: "Notes · Les rouages de l'horloge", body: [
            "**1er · 23h35.** Rouage des Arrivants : les deux visiteurs entrent chez Mme Cannelle.",
            "**2e · 23h36.** Rouage du Souffle : onze minutes avant le blocage du cadran.",
            "**3e · 23h47.** Rouage de l'Arrêt : l'heure inscrite sur le cadran bloqué.",
            "**4e · 23h58.** Rouage du Départ : les deux visiteurs ressortent de la boulangerie.",
            "**5e · Minuit.** Rouage de l'Étoile : l'Étoile se brise."
          ] }
        },
        {
          type: 'multi', title: "Qui a bloqué l'horloge ?",
          prompt: "Le mécanisme repart… et une pensée te vient. L'horloge s'est arrêtée à **23h47**. Les deux visiteurs de la boulangerie sont arrivés et repartis à des heures que tu connais. Où se trouvaient-ils, à l'instant précis où l'horloge s'est arrêtée ?",
          fields: [{ label: "Ils se trouvaient…", placeholder: "Dans quel lieu ?", answers: [], keywords: ["boulang", "cannelle"] }]
        }
      ],
      success: [
        Givre('nervosite', "Ainsi… quelqu’un d’autre s’est approché de mon mécanisme. Quelqu’un qui connaissait précisément l’endroit où intervenir."),
        F('enerve', "Une horloge qui ment ! Ça ne se fait pas ! Le temps devrait être honnête !"),
        Givre('reserve', "Une horloge ne ment pas, petit bonhomme."),
        Givre('reserve', "On lui a fait dire ce qu’on voulait entendre. Pour un horloger, la nuance est considérable.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 4 · les plans de Grelot */
    p04: {
      type: 'combo', title: "Les trois plans de Grelot", digits: 4, symbols: "0123456789", answer: "5386", button: "Ouvrir le coffret",
      prompt: "Le coffret du Veilleur se ferme avec quatre molettes : le nombre de **dents** de la clé noire, de **cannelures** sur sa tige, de **perles** à son anneau et de **plumes** du corbeau gravé, dans cet ordre. Grelot a recopié trois fois ses plans, en glissant exprès **une erreur dans chaque plan, jamais deux fois au même endroit**. Sur chaque plan, les valeurs sont écrites sous la forme de **calculs** : fais-les, puis retrouve les vraies valeurs.",
      clues: ['plan_etabli', 'plan_tiroir', 'plan_coffre'],
      clueLines: [
        Grelot('bourru', "Voilà mes trois plans. Recopiés de ma main, à la plume, et chacun à sa façon."),
        { doc: 'plan_etabli', fast: true }, { doc: 'plan_tiroir', fast: true }, { doc: 'plan_coffre', fast: true },
        Grelot('perfectionnisme', "Les chiffres, je ne les écris pas tout cuits. À vous de faire les calculs."),
        N("Les trois plans glissent dans le carnet de {nom}.")
      ],
      docs: ['ordre'],
      success: [
        Grelot('fierte', "Clac !"),
        Grelot('fierte', "Voilà. Il s’ouvre. Je savais bien qu’un esprit patient finirait par comprendre mon travail."),
        F('content', "Tu as comparé les trois plans et gardé les indications sur lesquelles deux étaient d’accord !"),
        F('fier', "La patience, c’est très important. J’en ai énormément."),
        F('malicieux', "Surtout quand on me promet des biscuits.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 5 · les chroniques */
    p05: {
      title: "Les chroniques de Dame Plume",
      steps: [
        {
          type: 'order', title: "Dans l'ordre où elles furent écrites",
          prompt: "Six extraits de chroniques ont été sortis de leurs livres. Dame Plume veut les relire **dans l'ordre où ils furent écrits**, du plus ancien au plus récent.",
          items: [
            "*Chronique du Bourg.* « Le Veilleur prit la garde de l'Étoile sept ans avant la Nuit des Éclats. On le dit patient, silencieux, et le seul à la regarder en face. »",
            "*Annales du Conseil.* « Six semaines avant la Nuit des Éclats, le Veilleur se plaignit que l'Étoile brûlait trop fort. Le Conseil nota sa remarque et passa à l'ordre du jour. »",
            "*Registre de séance.* « Le soir de la Fête des Lumières, le Veilleur se plaignit auprès des Anciens. Ils lui donnèrent tort, par quatre voix contre une. »",
            "*Chronique du Bourg.* « Cette nuit-là, à minuit, l'Étoile se brisa en vingt-quatre éclats. Le Veilleur disparut dans la neige. »",
            "*Livre des Vérités.* « Un an après la Nuit des Éclats, il fut établi que le Veilleur avait brisé l'Étoile par jalousie, parce que le royaume ne le remerciait pas. »",
            "*Livre des Vérités.* « Trois hivers après la Nuit des Éclats, le Livre rappela que le Conseil avait toujours refusé, à l'unanimité, les caprices du Veilleur. »"
          ],
          grants: ['chroniques']
        },
        {
          type: 'multi', title: "Deux versions du même vote",
          prompt: "Dame Plume te rappelle que le Conseil des Anciens compte **cinq sièges**. Deux de ces textes parlent du même vote : le soir de la Fête des Lumières. Combien d'Anciens s'opposaient au Veilleur, selon chacun ?",
          fields: [
            { label: "Selon le *registre de séance*", placeholder: "Nombre d'Anciens", answers: ["4", "quatre"] },
            { label: "Selon le *Livre des Vérités* (« à l'unanimité »)", placeholder: "Nombre d'Anciens", answers: ["5", "cinq"] }
          ]
        }
      ],
      success: [
        Plume('choc', "Quatre voix contre une… et, trois hivers plus tard, une décision prétendument prise à l’unanimité."),
        Plume('colere_froide', "Un livre n’oublie pas un vote. Quelqu’un l’a réécrit."),
        F('enerve', "Je n’aime pas les livres qui racontent des histoires différentes !"),
        F('reflexion', "Enfin… sauf les livres d’aventures. Ceux-là ont le droit d’exagérer un peu."),
        Plume('determination', "Je vais ouvrir le rayon fermé. Il contient un registre que je n’ai jamais osé consulter.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 6 · la carte d'Aurore */
    p06: {
      type: 'svgpick', title: "La carte du Veilleur", svg: M.aurore(), answer: 'lights',
      prompt: "Aurore pose son doigt sur la vieille carte. « Le Veilleur dessinait ce qui se répète — des sapins, des maisons, des lacs — pour décrire le paysage. Mais un lieu qu'il voulait nommer, il ne le dessinait **qu'une seule fois**. » Touche le signe qui n'apparaît qu'une seule fois sur la carte.",
      docs: ['legende'],
      success: [
        Aurore('sagesse', "Un arbre dont les branches portent des lumières…"),
        Aurore('douceur', "La Forêt des Lumières. Il en a fait le seul signe qu’il n’a jamais répété."),
        F('emerveille', "La Forêt des Lumières ! Voilà une destination digne de mon talent d’aventurier !")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 7 · le poème de la Pierre */
    p07: {
      title: "Le poème de la Pierre",
      steps: [
        {
          type: 'order', title: "Les vers dispersés",
          prompt: "Cinq vers sont gravés sur la Pierre des Voyageurs, mais quelqu'un les a déplacés. Remets le poème en ordre, du premier au dernier vers.",
          items: [
            "Où le jour s'endort derrière les sapins,",
            "Une lumière s'éteint au bout du chemin.",
            "Elle seule connaît la route : suis-la jusqu'au bout,",
            "Sous l'aile du corbeau qui, là-bas, veille sur tout ;",
            "Trouve le vieux chêne, plus vieux que le vent."
          ],
          labels: ["1er vers", "2e vers", "3e vers", "4e vers", "5e vers"],
          grants: ['poeme']
        },
        {
          type: 'multi', title: "Dans quelle direction ?",
          prompt: "Le poème ne nomme aucune direction… et pourtant, celui qui l'a gravé en a caché une dedans. Vers quel point cardinal faut-il marcher depuis la Pierre ?",
          fields: [{ label: "Point cardinal", placeholder: "Nord, est, sud ou ouest ?", answers: [], keywords: ["ouest"] }]
        }
      ],
      success: [
        Nox('satisfaction', "Pas mal. Une voyageuse qui sait lire entre les lignes. C’est suffisamment rare pour mériter un compliment."),
        F('fier', "Tu vois ? On forme une excellente équipe !"),
        Nox('sarcasme', "Ne te réjouis pas trop vite. Vous avez simplement réussi à ne pas lire le poème à l’envers."),
        F('surpris', "Les premières lettres des vers ! O… U… E… S… T… OUEST !"),
        F('malicieux', "Là où le soleil se couche. Celui qui a gravé ce poème aimait vraiment les cachettes."),
        F('determine', "En route pour le vieux chêne !")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 8 · le message du chêne */
    p08: {
      type: 'text', title: "Le message du Chêne creux", placeholder: "De qui parle-t-il ?",
      prompt: "Au fond du coffre que Grelot a fabriqué, un message est gravé dans l'écriture des veilleurs : tu as déjà vu cette grille, au dos d'une certaine enveloppe. Déchiffre-le. De qui parle-t-il ?",
      clues: ['gravure_chene'], carnet: true,
      clueLines: [
        N("Du bout du doigt, {nom} suit chaque signe gravé au fond du coffre, puis les recopie un à un dans son carnet."),
        { doc: 'gravure_chene' },
        F('cherche', "Le Veilleur n’utilise qu’un seul alphabet, tu te souviens ? Il l’a dit lui-même.")
      ],
      answers: ["maitre givre", "givre", "maitre hivre", "hivre"],
      docs: ['journal1'],
      success: [
        F('surpris', "« Mon ami répare le temps »…"),
        F('surpris', "Maître Givre ?! L’horloger de la mairie était l’ami du Veilleur ?"),
        Nox('malaise', "Je n’ai rien dit."),
        F('cherche', "Tu savais ?"),
        Nox('ruse', "Tu as lu un message dans un arbre. Ce n’est pas ma faute si les arbres ont une meilleure mémoire que les habitants.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 9 · les panneaux */
    p09: {
      type: 'text', title: "Les quatre panneaux", placeholder: "Nord, est, sud ou ouest ?",
      prompt: "Nox jure que le Veilleur est parti par le **nord**. Les quatre panneaux tournent librement sur leur mât : leurs flèches ne montrent plus la bonne direction. Mais ce qui est **gravé** sur chacun dit **toujours la vérité**. Retrouve vers où part vraiment chaque chemin… puis par où le Veilleur est passé.",
      clues: ['panneaux'],
      clueLines: [
        N("Les panneaux tournent encore au moindre souffle. {nom} relève soigneusement ce qui est écrit sur chacun, et range la page dans son carnet."),
        { doc: 'panneaux' }
      ],
      answers: ["ouest", "l'ouest", "a l'ouest", "par l'ouest", "vers l'ouest"],
      docs: ['convocation'],
      success: [
        N("Les panneaux cessent soudain de tourner. L’un d’eux s’immobilise, pointant vers l’ouest."),
        Nox('conflit_interieur', "…L’ouest."),
        Nox('satisfaction', "Évidemment. Je savais bien que tu finirais par le trouver."),
        F('enerve', "Nox ! Tu nous as envoyés au nord !"),
        Nox('malaise', "Oui."),
        F('enerve', "Tu nous as menti !"),
        Nox('conflit_interieur', "Je protégeais quelqu’un. Alors, s’il te plaît, laisse-moi finir avant de me condamner, plumeau.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 10 · les souvenirs de la lanterne */
    p10: {
      type: 'order', title: "La lanterne n°7", carnet: true,
      prompt: "La lanterne n°7 est restée trop longtemps dans le noir : ses souvenirs se sont effrités, il leur manque des mots, et ils se sont mêlés. Ce sont les pensées du Veilleur, telles qu'il les a vécues. Remets-les dans l'ordre ; la lanterne se rallumera.",
      clues: ['journal1'],
      clueLines: [
        Brume('mystere', "Les souvenirs s’effritent quand on les garde trop longtemps dans le noir."),
        Brume('sagesse', "Mais ce qu’un homme a vécu, il l’a parfois aussi écrit quelque part.")
      ],
      items: [
        "« … L'Étoile est belle. Je la lis comme on lit un … »",
        "« … sa lumière est plus forte qu'… Les Anciens s'en … »",
        "« … plus de lanternes, plus de fêtes, plus de … qui brille. Je ne dis rien. »",
        "« … j'ai compris. La lumière ne se contente plus d'éclairer : elle … »",
        "« Elle … aux souvenirs, aux …, aux lanternes qu'on éteint. »",
        "« Elle les … pour briller plus fort. »",
        "« Si rien ne change, il ne … bientôt plus rien à éclairer. »",
        "« J'en ai parlé à un … qui répare ce que le temps … Nous allons préparer quelque chose. »"
      ],
      docs: ['souvenir_givre'],
      success: [
        N("La lanterne n°7 s’allume d’un seul coup. Une scène apparaît dans sa lumière : deux silhouettes se tiennent côte à côte devant une haute tour."),
        F('surpris', "Attends… Je connais cette silhouette !"),
        F('surpris', "Maître Givre ?! L’horloger de la mairie ?"),
        Brume('gravite', "Oui. Le seul ami à qui le Veilleur ait osé demander ce qu’il ne voulait pas demander.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 11 · les trois questions du pont */
    p11: {
      type: 'multi', title: "Les trois questions du Vieux Pont", carnet: true,
      prompt: "Le Vieux Pont ne laisse passer que ceux qui disent vrai. Il pose trois questions. Les réponses, tu les as trouvées toi-même, dans ce que tu as récolté depuis le début de l'aventure.",
      fields: [
        { label: "Combien d'Anciens ont voté contre le Veilleur, le soir de la Fête des Lumières ?", placeholder: "Un nombre", answers: ["4", "quatre"] },
        { label: "À quelle heure le Veilleur était-il convoqué devant le Conseil ?", placeholder: "hh h mm", answers: ["22h10", "2210"] },
        { label: "Combien de semaines avant la Fête a-t-il compris que l'Étoile consumait le royaume ?", placeholder: "Un nombre", answers: ["6", "six", "6semaines", "sixsemaines"] }
      ],
      success: [
        { scene: "lieu-j11-pont.webp" },
        N("Sous vos pieds, les vieilles pierres s’illuminent l’une après l’autre. La lumière traverse le pont, comme si chaque réponse avait réveillé une mémoire."),
        F('emerveille', "Regarde ! Il brille !"),
        Brume('sagesse', "Le pont ne t’a pas interrogée pour te juger."),
        Brume('gravite', "Il voulait s’assurer que tu portais la vérité en entier. Elle est parfois lourde, même pour les plus courageux.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 12 · le miroir brisé */
    p12: {
      type: 'jigsaw', title: "Le miroir de la cabane", cols: 4, rows: 3, w: 600, h: 360, svg: inner(M.royaume()),
      prompt: "Le grand miroir de la cabane est brisé en douze morceaux. Touche un morceau, puis un autre, pour les échanger : remets en place ce qu'il montre.",
      docs: ['lieux_memoire'],
      success: [
        N("Les morceaux du miroir retrouvent leur place. Une lumière pâle traverse les fissures, puis se rassemble au centre du verre."),
        N("Le miroir ne montre pas des routes, mais des souvenirs. Chacun de ses points lumineux représente un éclat de l’Étoile. Chaque éclat repose dans un lieu qui compte pour le royaume."),
        F('reflexion', "Alors… il avait tout prévu depuis le début ?"),
        F('emerveille', "Il a caché les éclats dans des endroits qui ont une histoire !"),
        F('malicieux', "J’aime les plans. Les plans sont très utiles."),
        F('decu', "Enfin… tant qu’ils ne nous obligent pas à courir dans des endroits très sombres.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 13 · la formule invisible */
    p13: {
      type: 'multi', title: "La formule du Veilleur",
      prompt: "La poussière bleue fait apparaître sur le tableau de Maître Givre les lignes que la craie de givre cachait. C'est la formule qu'il a préparée avec le Veilleur. Retrouve la quantité de chaque matière.",
      clues: ['formule_tableau'],
      clueLines: [
        N("Sous la poussière bleue, les lettres de givre se dessinent une à une sur le tableau. {nom} les recopie dans son carnet, ligne après ligne."),
        { doc: 'formule_tableau' }
      ],
      fields: [
        { label: "Mesures de neige", placeholder: "Un nombre", answers: ["4", "quatre"] },
        { label: "Mesures de givre", placeholder: "Un nombre", answers: ["2", "deux"] },
        { label: "Mesures de cristal", placeholder: "Un nombre", answers: ["6", "six"] }
      ],
      docs: ['plan_tour'],
      success: [
        Givre.spectral('honte', "Quatre… deux… six."),
        Givre.spectral('nostalgie', "Je les ai récités toutes les nuits depuis cette catastrophe. Je les connais par cœur. Pourtant, je n’ai jamais réussi à les prononcer devant quelqu’un."),
        F('triste', "Vous n’avez pas à porter tout ça tout seul, Maître Givre."),
        Givre.spectral('honte', "C’est ce que je me suis dit pendant des années. Puis j’ai compris que le silence ne rendait pas la faute plus légère.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 14 · l'escalier de glace */
    p14: {
      type: 'order', title: "Les cinq marches",
      prompt: "Pour que l'escalier tienne, il faut poser les cinq marches de l'escalier dans le bon ordre, de la plus basse à la plus haute. La règle est gravée dans la glace, sous forme de six phrases qui sont toutes vraies.",
      clues: ['regle_glace'],
      clueLines: [
        N("Six phrases sont gravées dans la glace de la première marche. {nom} les recopie dans son carnet, une par une."),
        { doc: 'regle_glace' }
      ],
      items: ["Pierre", "Verre", "Neige", "Glace", "Cristal"],
      labels: ["En bas", "2e", "3e", "4e", "En haut"],
      success: [
        N("Les marches se rejoignent dans un tintement cristallin. L’escalier devient stable, comme si la glace elle-même reconnaissait votre raisonnement."),
        F('fier', "On l’a fait ! Et sans tomber !"),
        Brume('sagesse', "Il aurait pu cacher ici un piège, une épreuve de force ou un monstre. Il a préféré un raisonnement."),
        Brume('mystere', "Le Veilleur savait que la personne qui viendrait ne serait pas nécessairement la plus forte. Il lui fallait quelqu’un qui sache regarder.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 15 · les cristaux */
    p15: {
      type: 'match', title: "Les cristaux de la terrasse", carnet: true,
      prompt: "Chaque cristal garde une scène de la Nuit des Éclats, sans son heure. Associe chaque scène à l'heure à laquelle elle s'est produite, à partir de ce que tu sais déjà. Deux heures ne correspondent à aucune scène.",
      pairs: [
        ["Le Veilleur comparaît devant les Cinq, dans la salle haute.", "22h10"],
        ["Le Veilleur quitte la salle haute, quarante minutes après y être entré.", "22h50"],
        ["Deux silhouettes franchissent la porte de la boulangerie.", "23h35"],
        ["Une main gantée bloque l'aiguille de l'horloge de la mairie.", "23h47"],
        ["Les deux silhouettes ressortent de la boulangerie.", "23h58"],
        ["L'Étoile se brise au-dessus de la tour.", "Minuit"],
        ["Un scribe est appelé auprès du Conseil, vingt minutes après la brisure de l'Étoile.", "00h20"]
      ],
      extras: ["23h15", "00h35"],
      docs: ['scene_nuit'],
      success: [
        Aurore('gravite', "Voilà. La Nuit des Éclats, heure par heure."),
        N("Les cristaux se stabilisent. Les scènes s’enchaînent désormais dans le bon ordre."),
        Aurore('tristesse', "Regarde bien la main qui bloque l’horloge. Son gant porte un signe : une couronne."),
        F('cherche', "Une couronne… J’ai l’impression d’avoir déjà vu ce signe quelque part."),
        Aurore('sagesse', "Tu as déjà, dans ton carnet, tout ce qu’il faut pour savoir à qui il appartient.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 16 · la lumière sous la glace */
    p16: {
      type: 'mirrors', title: "La lumière sous la glace",
      prompt: "Des miroirs de glace sont posés sur le lac. Touche-les pour les tourner : le faisceau qui part de la rive doit toucher **les trois étoiles** gravées sous la glace. Les blocs de glace l'arrêtent ; certains miroirs ne servent à rien.",
      cols: 8, rows: 6, source: {r: 0, c: 0, dir: "E"},
      walls: [[0, 6], [4, 3], [3, 5], [3, 3], [5, 2], [5, 3]],
      fixed: [{r: 1, c: 0, m: "/"}, {r: 4, c: 2, m: "/"}],
      movable: [{r: 3, c: 4, m: "/"}, {r: 0, c: 7, m: "/"}, {r: 4, c: 1, m: "\\"}, {r: 3, c: 1, m: "/"}, {r: 3, c: 2, m: "\\"}, {r: 5, c: 1, m: "/"}, {r: 2, c: 0, m: "\\"}, {r: 0, c: 1, m: "\\"}, {r: 2, c: 7, m: "\\"}, {r: 5, c: 0, m: "/"}],
      targets: [{r: 4, c: 0}, {r: 1, c: 7}, {r: 3, c: 0}],
      docs: ['journal2'],
      success: [
        N("Le faisceau traverse les miroirs et touche les trois étoiles, l’une après l’autre. Elles s’illuminent sous la glace."),
        N("Un grondement sourd résonne sous vos pieds. La glace se fend sans bruit, révélant une petite cavité enfouie dans les profondeurs."),
        F('surpris', "On dirait que le lac vient de nous ouvrir un passage !"),
        Nox('malaise', "C’est là…"),
        Nox('conflit_interieur', "Je savais que cet endroit existait. Je savais qu’il avait laissé quelque chose. Mais je n’ai jamais eu le courage de descendre.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 17 · la séance retrouvée */
    p17: {
      type: 'order', title: "La séance de la salle haute",
      prompt: "La grotte a gardé la séance du Conseil, mais les échos se répondent dans le désordre. Remets-les dans l'ordre où les mots ont été prononcés.",
      items: [
        "**Le Veilleur.** « Cinq Anciens, un seul souci : l'Étoile brûle trop fort. Elle consume ce qu'elle éclaire. Je vous demande de ralentir sa magie, ne serait-ce que pour cet hiver. »",
        "**Aldric.** « Ralentir ? Le royaume n'a jamais été aussi lumineux. Tu voudrais qu'on éteigne nos lanternes sur une simple inquiétude ? »",
        "**Le Veilleur.** « Ce n'est pas une inquiétude. J'ai lu les signes pendant six semaines. Dans un an, elle ne laissera plus rien à éclairer. »",
        "**Séraphine.** « Les signes se lisent mal, Veilleur. Beaucoup d'hivers, beaucoup d'erreurs… »",
        "**Éloi.** « Écoutons-le. Une semaine de prudence ne nous coûtera rien. »",
        "**Aldric.** « Voyons : qui est pour ? Un seul. Qui est contre ? Quatre. Le Conseil refuse. »",
        "**Le Veilleur.** « Alors je ferai ce que vous refusez de faire. Vous me le reprocherez. »",
        "**Aldric**, à mi-voix. « Et nous veillerons à ce que l'histoire retienne ce qu'il faut. »"
      ],
      docs: ['echos'],
      success: [
        N("Les voix se replacent. Les échos cessent de se chevaucher. Pour la première fois, la séance du Conseil se déroule dans son ordre véritable."),
        N("Les derniers mots d’Aldric résonnent encore entre les parois."),
        F('enerve', "« Ce qu’il faut »… Il avait déjà décidé de réécrire l’histoire avant même que la séance soit terminée !"),
        F('enerve', "Ce n’était pas une décision prise dans la panique. C’était prévu !")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 18 · le Belvédère */
    p18: {
      title: "La question du Veilleur", carnet: true,
      steps: [
        {
          type: 'pick', title: "Les preuves du Veilleur", button: "Présenter ces trois pages", note: { title: "Les pages montrées au Veilleur", body: ["Le Veilleur a lu tes trois pages : le **journal du Veilleur** (premières pages), la **séance de la grotte des Échos** et le **journal sous le lac**. Il n'a pas agi par méchanceté : il voulait protéger le royaume."] },
          prompt: "Le Veilleur ne répond qu'à ceux qui ont compris. « Montre-moi **trois** pages de ton carnet où l'on peut lire que je n'ai pas agi par méchanceté. » Relis tes pages dans le carnet, puis choisis-en trois. Une page qui n'en parle pas, ou qui dit le contraire, ne compte pas.",
          need: 3,
          cards: [
            { doc: 'chroniques' }, { doc: 'lettre' }, { doc: 'note_cannelle' }, { doc: 'journal1' }, { doc: 'plan_tour' },
            { doc: 'registre' }, { doc: 'echos' }, { doc: 'scene_nuit' }, { doc: 'journal2' }, { doc: 'formule_tableau' }
          ],
          // les 3 pages valables : le journal (premières pages), la séance de la grotte, le journal sous le lac.
          // La lettre ne compte plus (il y avoue seulement avoir brisé l'Étoile) ; les chroniques non plus : elles l'accusent de jalousie.
          answer: [3, 6, 8]
        },
        {
          type: 'multi', title: "La question",
          prompt: "Le Veilleur retire sa capuche… et pose enfin sa question : « **Si tu pouvais restaurer l'Étoile exactement comme elle était, le ferais-tu ?** » Réponds, puis explique en une phrase pourquoi.",
          fields: [
            { label: "Ta réponse (oui ou non)", placeholder: "Oui ou non ?", answers: ["non", "non."] },
            { label: "Pourquoi ?", placeholder: "Parce que…", answers: [], keywords: ["consum", "prend", "prendr", "danger", "recommenc", "brul", "memoire", "souvenir", "memechose", "memeerreur", "detrui", "devor", "volerait", "mal"] }
          ]
        }
      ],
      success: [
        Veilleur.homme('soulagement', "Alors tu as compris."),
        Veilleur.homme('gravite', "Restaurer l’Étoile exactement comme elle était, ce serait recommencer ce qui l’a brisée."),
        Veilleur.homme('gratitude', "Pendant des années, j’ai cru que personne ne comprendrait cette vérité. Merci de l’avoir vue."),
        F('surpris', "Alors… vous n’étiez pas le méchant ?"),
        F('malicieux', "Je le savais !"),
        F('malicieux', "Enfin… non. Je ne le savais pas du tout. Mais j’avais une intuition très héroïque."),
        Veilleur.homme('paix', "Une intuition héroïque peut être précieuse. Mais elle doit apprendre à écouter, à regarder et à douter."),
        F('reflexion', "C’est ce qu’on a fait. On a regardé les preuves. Même quand elles contredisaient ce qu’on nous racontait."),
        Veilleur.homme('soulagement', "C’est pour cela que vous êtes arrivés jusqu’ici.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 19 · les portraits repeints */
    p19: {
      type: 'multi', title: "Les portraits du Balcon",
      prompt: "Les cinq portraits du Balcon des Ancêtres parlent quand on les regarde, chacun racontant sa version de la Nuit des Éclats. Compare leurs paroles à ce que tu sais, et leur apparence au **registre interdit** de Dame Plume (la planche d'origine des Cinq Anciens). **Un seul portrait a été repeint.**",
      clues: ['portraits_dits', 'portraits_table'], carnet: true,
      clueLines: [
        N("Les cinq portraits parlent l’un après l’autre. {nom} note avec soin ce que chacun raconte, puis la manière dont chaque Ancien est peint aujourd’hui."),
        { doc: 'portraits_dits', fast: true }, { doc: 'portraits_table', fast: true }
      ],
      fields: [
        { label: "Quel Ancien a été repeint ?", placeholder: "Son nom", answers: ["eloi", "doyen eloi", "doyeneloi"] },
        { label: "Quel emblème portait-il à l'origine ?", placeholder: "Un emblème", answers: ["flamme", "la flamme", "une flamme"] },
        { label: "De quelle couleur était la pierre de sa bague ?", placeholder: "Une couleur", answers: ["bleue", "bleu", "la pierre bleue", "pierre bleue"] }
      ],
      success: [
        N("Les cinq portraits se mettent à trembler. La peinture du dernier visage se fend, révélant des couleurs différentes sous la couche officielle."),
        { scene: "lieu-j19-galerie-vraie.webp" },
        N("Une silhouette translucide se détache du portrait. Un vieux fantôme bleuté, un monocle à chaîne dorée sur l’œil, un livre serré contre sa robe."),
        Eloi('honte', "Ils ont remplacé mon emblème et ma bague par ceux d’Aldric. Ils ont mis dans ma bouche des mots que je n’ai jamais prononcés."),
        F('triste', "Monsieur Éloi… Vous êtes le seul qui a voté pour le Veilleur."),
        Eloi('regret', "Oui. Et pourtant, je me suis tu lorsque les autres ont décidé de faire de lui un monstre."),
        Eloi('honte', "J’ai cru qu’une seule voix ne changerait rien. J’ai découvert qu’une seule voix pouvait empêcher une vérité de disparaître.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 20 · les deux cartes */
    p20: Object.assign({
      type: 'diff', title: "Deux cartes, six désaccords", titles: ["Carte officielle du royaume", "Carte dessinée par le Veilleur"],
      prompt: "Dans le reflet du miroir, la carte officielle du Conseil laisse apparaître celle que le Veilleur avait dessinée. Les deux devraient se ressembler comme deux gouttes d'eau. Touche les **six endroits** où elles se contredisent : ce sont les endroits où quelque chose a été déplacé, ajouté ou effacé.",
      docs: ['eclats_vrais'],
      success: [
        N("Les six différences entre les cartes se mettent à briller. Sous chacune d’elles, un petit symbole apparaît."),
        Brume('gravite', "Six déplacements. Six mensonges. Et sous chacun, un éclat caché."),
        F('surpris', "Mais pourtant, on a trouvé plus de six fragments avec {nom} !"),
        Brume('sagesse', "C’est normal, mon petit bonhomme de neige. Certains étaient des parties de l’Étoile, et d’autres étaient des souvenirs scellés."),
        F('reflechit', "Ça commence à faire beaucoup d’histoires avec des souvenirs, là, quand même… Vous ne trouvez pas ?"),
        Brume('gravite', "Le Veilleur ne voulait pas que vous cherchiez uniquement la magie. Il voulait que vous découvriez les lieux qui méritaient d’être sauvés."),
        Nox('loyaute', "Voilà pourquoi il fallait tout rassembler. Sans jeter un seul éclat.")
      ]
    }, (function () { const c = M.compare(); return { a: c.a, b: c.b, targets: c.targets }; })()),

    /* ---------------------------------------------------------------- JOUR 21 · les livres cachés */
    p21: {
      type: 'pick', title: "Les titres cachés", button: "Garder ces quatre livres", carnet: true,
      prompt: "La cloche muette résonne sans un son, et huit titres cachés apparaissent sur les rayonnages. Seuls leurs **titres** sont lisibles. Certains livres ont été écrits ou réécrits sur ordre du Conseil ; d'autres ont gardé la vérité. Garde **les quatre livres qui racontent la même histoire que ton carnet**.",
      cards: [
        { title: "Livre des Vérités · cinquième édition" },
        { title: "Notes du Veilleur sur la lumière de l'Étoile" },
        { title: "Gazette de l'Hiver · édition du Conseil" },
        { title: "Registre des séances · feuillets d'origine" },
        { title: "Chronique du Bourg · première édition" },
        { title: "Éloge du Conseil" },
        { title: "Journal de la salle haute · copie non corrigée" },
        { title: "Chronique du Bourg · révisée" }
      ],
      answer: [1, 3, 4, 6],
      docs: ['journal3'],
      success: [
        N("Les quatre livres se rapprochent. Leurs pages se confondent, comme si les histoires qu’ils contiennent avaient enfin retrouvé leur place."),
        N("Dans le creux qu’ils laissent apparaît un journal très mince, relié de fil d’argent."),
        Plume('soulagement', "Voilà. Une bibliothèque qui dit la même chose du début à la fin."),
        Plume('tristesse', "Il m’aura fallu toute une vie pour la voir."),
        F('serein', "Vous avez encore le temps de faire les choses autrement, Dame Plume.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 22 · les constellations */
    p22: {
      title: "La constellation du Veilleur",
      steps: [
        {
          type: 'mirrors', title: "La constellation",
          prompt: "La fiole éclaire le Balcon des Étoiles. Les six étoiles gravées dans la pierre attendent son faisceau pour livrer ce qu'elles gardent. Touche les miroirs pour les tourner : le faisceau doit toucher **les six étoiles**. Elles s'éclairent dans l'ordre où il les touche, et chacune révèle une lettre. Les blocs de pierre l'arrêtent ; certains miroirs ne servent à rien.",
          cols: 9, rows: 7, source: {r: 0, c: 0, dir: "E"},
          walls: [[1, 2], [2, 7], [4, 3], [6, 1], [4, 2], [2, 6]],
          fixed: [{r: 2, c: 8, m: "\\"}, {r: 0, c: 8, m: "/"}],
          movable: [{r: 2, c: 3, m: "/"}, {r: 3, c: 8, m: "\\"}, {r: 5, c: 7, m: "\\"}, {r: 5, c: 5, m: "/"}, {r: 3, c: 2, m: "/"}, {r: 2, c: 5, m: "/"}, {r: 4, c: 8, m: "\\"}, {r: 1, c: 6, m: "/"}, {r: 3, c: 7, m: "\\"}, {r: 1, c: 1, m: "\\"}, {r: 0, c: 3, m: "/"}, {r: 1, c: 0, m: "/"}],
          targets: [{r: 0, c: 2, letter: "L"}, {r: 1, c: 3, letter: "I"}, {r: 3, c: 5, letter: "B"}, {r: 4, c: 5, letter: "R"}, {r: 4, c: 7, letter: "E"}, {r: 4, c: 4, letter: "L"}]
        },
        {
          type: 'multi', title: "Le mot effacé",
          prompt: "Sous la fausse fin gravée sur ordre d'Aldric (« …mais par celui qui la gouverne »), la lumière fait réapparaître la phrase d'origine : « *L'Étoile ne sera pas restaurée par celui qui la garde, mais par celui qui saura pourquoi elle…* » Le dernier mot reste effacé. Remets dans l'ordre les lettres que les étoiles viennent de révéler, et complète la phrase.",
          fields: [{ label: "…pourquoi elle", placeholder: "Le mot des étoiles", answers: ["brille", "elle brille"] }]
        }
      ],
      docs: ['prophetie'],
      success: [
        N("Les étoiles se déplacent. Une dernière ligne apparaît, longtemps cachée sous la pierre."),
        Aurore('emotion', "« L’Étoile ne sera pas restaurée par celui qui la garde, mais par celui qui saura pourquoi elle brille. »"),
        F('reflexion', "Pourquoi elle brille…"),
        F('decouvre', "Ce n’est pas « comment la réparer ». C’est « pourquoi »."),
        Aurore('gravite', "Aldric avait effacé ces mots parce qu’ils ne le désignaient pas. On peut gouverner un royaume entier sans savoir pourquoi son Étoile brille. Lui voulait seulement la posséder."),
        Aurore('espoir', "Elle désignait quelqu’un capable de comprendre que la magie doit être partagée et renouvelée, pas exploitée.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 23 · les souvenirs du royaume */
    p23: {
      type: 'match', title: "Ce qui nourrit le feu",
      prompt: "La cheminée royale ne brûle pas avec du bois, mais avec ce qui fait la vie d'un royaume. Associe chaque souvenir du royaume, tel que le miroir de la cabane te l'a montré, à ce qu'il offre au feu. Trois offrandes ne correspondent à aucun souvenir.",
      pairs: [
        ["La maison aux guirlandes : le premier Noël, quand on a accroché la première lumière", "Traditions"],
        ["La boulangerie : la première fournée partagée entre voisins", "Partage"],
        ["La Pierre des Voyageurs : la promesse de ne laisser personne marcher seul", "Moments ensemble"],
        ["L'Arbre aux Lanternes : les souvenirs de ceux qui ne sont plus là", "Mémoire"],
        ["Le Vieux Pont : la plus belle réconciliation de l'histoire du royaume", "Pardon"]
      ],
      extras: ["Gloire", "Pouvoir", "Richesse"],
      success: [
        N("Les souvenirs choisis s’élèvent au-dessus des boîtes. Ils tournent lentement, puis descendent dans la cheminée."),
        { scene: "lieu-j23-cheminee-allumee.webp" },
        N("Les bûches de cristal s’embrasent. La flamme n’est pas tout à fait faite de feu : elle semble composée de lumière, de voix et de petits éclats de mémoire."),
        F('surpris', "Attends… ces bûches de cristal ! Elles viennent de la Grotte des Échos, dans le Royaume de Glace !"),
        F('reflexion', "Les cristaux qui gardaient les souvenirs… Quelqu’un les a portés jusqu’ici pour qu’un jour, ils nourrissent ce feu."),
        Brume('espoir', "On ne rallume pas un royaume avec une seule lumière. Il faut plusieurs souvenirs, et il faut les choisir en sachant pourquoi."),
        F('reflexion', "La magie ne vient pas seulement de l’Étoile. Elle vient de ce que les gens font ensemble.")
      ]
    },

    /* ---------------------------------------------------------------- JOUR 24 · le dernier mécanisme */
    p24: {
      title: "Le cœur du château",
      steps: [
        {
          type: 'match', title: "Les trois choses rendues",
          prompt: "La prophétie le dit : l'Étoile ne brillera de nouveau que lorsque **trois choses** auront été rendues. Au centre du mécanisme, trois creux attendent un objet chacun. Associe chaque chose à l'objet de ton sac qui la rend. Les autres objets n'ont pas leur place ici.",
          pairs: [
            ["La vérité, rendue à celui qu'on a accusé", "Le Livre aux pages muettes"],
            ["La mémoire, rendue aux lieux qui l'ont perdue", "Le Cœur de Noël"],
            ["Le choix du chemin, laissé à celle qui n'est pas d'ici", "Le Compas du Cartographe"]
          ],
          extras: ["Le Sceau du Veilleur", "La Lunette stellaire", "La Bague des Anciens", "La Fiole de lumière"]
        },
        {
          type: 'multi', title: "Pourquoi elle brille",
          prompt: "Le mécanisme est prêt. Il ne lui manque plus qu'une chose : que quelqu'un dise, avec ses propres mots, **pourquoi l'Étoile brille**. Il n'y a pas de formule exacte : le cœur du château reconnaîtra les mots qui disent l'essentiel.",
          fields: [{ label: "L'Étoile brille parce que…", placeholder: "Dis-le avec tes mots", answers: [], keywords: ["ensemble", "partag", "souvenir", "memoire", "aime", "amiti", "ami", "coeur", "tradition", "espoir", "genero", "royaume", "chaleur", "lien", "noel", "fete", "gens", "personne", "habitant", "famille", "ceux", "donne", "joie", "bonheur", "amour"] }]
        }
      ],
      success: [
        { scene: "lieu-j24-salle-emblemes.webp" },
        N("Les trois emplacements s’illuminent."),
        N("Une première lumière s’élève : celle de la vérité retrouvée."),
        N("Une deuxième apparaît : celle des souvenirs que personne n’a voulu effacer."),
        N("La troisième est plus douce. Elle ressemble à une petite flamme qui passe d’une main à l’autre."),
        F('emerveille', "Elles se rejoignent…"),
        N("Le mécanisme s’éveille. Tout le château retient son souffle."),
        Veilleur.homme('paix', "Vous avez compris. Mais l’Étoile ne peut pas être reconstruite avec la seule magie de ce royaume."),
        Veilleur.homme('paix', "Il lui manque encore une lumière. Une lumière qui vient de l’extérieur.")
      ]
    }
  };
})();
