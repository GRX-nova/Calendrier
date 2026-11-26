/* ==========================================================================
   DOCUMENTS — le carnet d'indices (Journal → « Carnet d'indices »).
   Lettres, pages de journal, plans… trouvés au fil de l'histoire. Ils servent de preuves : plusieurs
   énigmes ne se résolvent qu'en les relisant (le jeu ne dit jamais lesquels).

   • day   : le jour où le document est trouvé (sert au mode développeur et au journal).
   • kind  : lettre | note | page | carte | plan | souvenir | registre | chronique | echo | symbole
   • from  : petite mention au-dessus du titre.
   • body  : une liste de blocs. Un bloc est un paragraphe (texte) ou un objet :
             { table: { head: [..], rows: [[..], ..] } }, { list: [..] } ou { note: "texte en italique" }.
             Balisage possible : **gras**, *italique*, [[emb:couronne]],
             [[pig:TEXTE]] (écriture des Veilleurs) et [[chart]] (la grille de l'alphabet).
   • Le carnet ne contient QUE des indices physiques (lettres, pages, plans, relevés…). Ce que les personnages
     racontent à l'oral va dans l'onglet « Personnages » (data/people.js).
   • Les indices d'une énigme (champ `clues` dans data/puzzles.js) sont reçus AVANT l'énigme, mais ne sont
     jamais affichés avec elle : c'est à la joueuse de les retrouver dans son carnet.

   Un document arrive au bon moment grâce à une ligne  { doc: 'identifiant' }  dans un dialogue
   (data/days.js), ou au bout d'une énigme (champ `docs` dans data/puzzles.js).
   ========================================================================== */
Game.data.docs = {

  lettre: { day: 1, kind: 'lettre', from: "Enveloppe scellée · jour 1", title: "La lettre du Veilleur", body: [
    "*À celle ou celui qui viendra,*",
    "Si tu lis ces lignes, c'est que les lanternes du village se sont éteintes et que quelqu'un a continué de marcher quand tout le monde s'est arrêté. Merci.",
    "On dira de moi que j'ai brisé l'Étoile d'Hiver. C'est vrai : je l'ai brisée.",
    "— Le Veilleur [[emb:veilleur]]"
  ] },

  revers: { day: 1, kind: 'symbole', from: "Enveloppe scellée · le revers", title: "Le revers de l'enveloppe", body: [
    "Au dos de l'enveloppe, le Veilleur a tracé la grille de ses signes. Chaque signe est une lettre : c'est ce qu'il appelle « l'alphabet des veilleurs ».",
    "[[chart]]",
    "Dessous, d'une écriture serrée : *« Un seul alphabet pour tous mes messages. Ne le perds pas. »*"
  ] },

  note_cannelle: { day: 2, kind: 'note', from: "Glissée dans le cahier de cuisson", title: "Note secrète de Mme Cannelle", body: [
    "Ce soir-là, ils étaient deux. D'abord une grande silhouette sous une capuche, qui n'a presque rien dit. Elle serrait quelque chose contre elle, comme on porte un enfant.",
    "Derrière elle, un petit quelqu'un qui *cliquetait*, comme une montre à gousset qu'on remonte sans arrêt. Je n'ai pas vu son visage. C'est lui qui a laissé sur mon comptoir une boîte à biscuits « pour celui ou celle qui viendra demander ».",
    "Ils sont arrivés à **23h35**, pendant que mes biscuits d'étoiles cuisaient, et ils sont repartis à **23h58**, j'en suis sûre : je venais de les sortir du four.",
    "Je n'ai jamais osé le dire aux Anciens. Personne ne m'a posé la question."
  ] },

  signe_cadran: { day: 3, kind: 'symbole', from: "Gravé au dos du fragment de cadran", title: "Le signe du fragment de cadran", body: [
    "[[emb:couronne]]",
    "Trois pointes, un bandeau. Personne ne le reconnaît encore.",
    "Maître Givre a dit : *« On ne grave pas un signe pareil par accident sur un cadran. Quelqu'un voulait laisser une trace. »*"
  ] },

  ordre: { day: 4, kind: 'page', from: "Atelier du Vieux Grelot", title: "Ordre signé du Veilleur", body: [
    "*Pour Grelot, mon ami.*",
    "Vingt-quatre cachettes, aussi variées que possible : des coffrets, un creux dans une pierre, un fond de lanterne, un revers de miroir. Chacune doit pouvoir être ouverte ; aucune ne doit pouvoir être forcée.",
    "Une seule clé, noire, qui n'ouvre que ce qu'elle doit ouvrir. Grave-y un corbeau : Nox saura la reconnaître.",
    "Tu mettras des erreurs dans tes plans. Beaucoup. Celui qui voudra copier ton travail devra être aussi patient que toi.",
    "Tu ne diras rien, même aux Anciens. Je te demande pardon pour ce silence.",
    "— Le Veilleur [[emb:veilleur]]"
  ] },

  chroniques: { day: 5, kind: 'chronique', from: "Bibliothèque de Dame Plume · rayon des Chroniques", title: "Les chroniques, dans l'ordre où elles furent écrites", body: [
    "**1.** *Chronique du Bourg.* « Le Veilleur prit la garde de l'Étoile sept ans avant la Nuit des Éclats. On le dit patient, silencieux, et le seul à la regarder en face. »",
    "**2.** *Annales du Conseil.* « Six semaines avant la Nuit des Éclats, le Veilleur se plaignit que l'Étoile brûlait trop fort. Le Conseil nota sa remarque et passa à l'ordre du jour. »",
    "**3.** *Registre de séance.* « Le soir de la Fête des Lumières, le Veilleur se plaignit auprès des Anciens. Ils lui donnèrent tort, par **quatre voix contre une**. »",
    "**4.** *Chronique du Bourg.* « Cette nuit-là, à minuit, l'Étoile se brisa en vingt-quatre éclats. Le Veilleur disparut dans la neige. »",
    "**5.** *Livre des Vérités.* « Un an après la Nuit des Éclats, il fut établi que le Veilleur avait brisé l'Étoile par jalousie, parce que le royaume ne le remerciait pas. »",
    "**6.** *Livre des Vérités.* « Trois hivers après la Nuit des Éclats, le Livre rappela que le Conseil avait toujours refusé, **à l'unanimité**, les caprices du Veilleur. »"
  ] },

  registre: { day: 5, kind: 'registre', from: "Bibliothèque de Dame Plume · rayon fermé", title: "Registre interdit : les Cinq Anciens", body: [
    "Le Conseil des Anciens compte **cinq** sièges. Voici la planche peinte à l'atelier du peintre, avant toute retouche : chaque Ancien avec son emblème, l'objet de sa charge et sa bague.",
    { img: "doc-cinq-anciens.webp", alt: "Les Cinq Anciens : Doyen Aldric (couronne), Doyenne Séraphine (croissant de lune), Doyen Barnabé (sablier), Doyenne Mélisende (rose des vents), Doyen Éloi (flamme)." },
    "*En marge, de la main de Dame Plume : « Les pages qui racontent la séance de la Nuit des Éclats ont été réécrites. Cette planche-ci n'a jamais été touchée. »*"
  ] },

  legende: { day: 6, kind: 'carte', from: "Maison de l'Ancienne Aurore", title: "Légende de la carte d'Aurore", body: [
    "Aurore a recopié pour toi la manière dont le Veilleur dessinait.",
    "*Un arbre nu :* un lieu où rien ne se cache. *Un arbre en pointes :* un sapin, un abri. *Un arbre à l'envers :* un lieu qu'il ne faut pas fouiller. *Un arbre aux branches chargées de lumières :* la **Forêt des Lumières**, là où les arbres se souviennent.",
    "*« Il n'a jamais utilisé le même signe pour deux lieux. Ce qu'il montre une seule fois est ce qu'il veut que tu regardes. »*"
  ] },

  poeme: { day: 7, kind: 'page', from: "Pierre des Voyageurs", title: "Le poème de la Pierre, remis en ordre", body: [
    "*Où le jour s'endort derrière les sapins,*",
    "*Une lumière s'éteint au bout du chemin.*",
    "*Elle seule connaît la route : suis-la jusqu'au bout,*",
    "*Sous l'aile du corbeau qui, là-bas, veille sur tout ;*",
    "*Trouve le vieux chêne, plus vieux que le vent.*"
  ] },

  journal1: { day: 8, kind: 'page', from: "Cachette du Chêne creux · coffre de Grelot", title: "Journal du Veilleur : premières pages", body: [
    "« Premier hiver de ma garde. L'Étoile est belle. Je la lis comme on lit un visage. »",
    "« Cinq hivers plus tard, sa lumière est plus forte qu'avant. Les Anciens s'en réjouissent : plus de lanternes, plus de fêtes, plus de neige qui brille. Je ne dis rien. »",
    "« À **six semaines** de la Fête des Lumières, j'ai compris. La lumière ne se contente plus d'éclairer : elle *prend*. Elle prend aux souvenirs, aux chants, aux lanternes qu'on éteint. Elle les consume pour briller plus fort. Si rien ne change, il ne restera bientôt plus rien à éclairer. »",
    "« J'en ai parlé à un ami qui répare ce que le temps abîme. Nous allons préparer quelque chose, au cas où. Je déteste ces mots-là. »"
  ] },

  convocation: { day: 9, kind: 'note', from: "Message scellé que Nox portait", title: "La convocation du Conseil", body: [
    "*Le Conseil des Anciens convoque le Veilleur des Neiges devant les Cinq, à **22h10**, dans la salle haute, pour y justifier ses inquiétudes au sujet de l'Étoile.*",
    "*Il est prié de venir seul.*",
    "— Scellé à la cire rouge, du sceau du président du Conseil."
  ] },

  souvenir_givre: { day: 10, kind: 'souvenir', from: "Arbre aux Lanternes · lanterne n°7", title: "Souvenir : deux amis", body: [
    "Le Veilleur et Maître Givre, côte à côte devant la tour, un soir de neige. Givre tient sa loupe d'horloger.",
    "— Je ne sais pas si c'est possible, dit Givre.",
    "— Moi non plus, dit le Veilleur. Mais je sais que ce n'est pas impossible.",
    "Givre plie un plan en quatre. « Je ferai ce que tu demandes. Mais je préférerais ne jamais avoir à le faire. »",
    "— Moi aussi, dit le Veilleur. C'est pour ça que c'est à toi que je le demande."
  ] },

  lieux_memoire: { day: 12, kind: 'carte', from: "Cabane dans les Branches · le miroir reconstitué", title: "Les lieux de mémoire du royaume", body: [
    "Le miroir reconstitué ne montre pas des routes, mais des souvenirs. Chaque éclat a été caché dans un lieu qui compte pour le royaume :",
    "**La maison aux guirlandes** : le premier Noël, quand on a accroché la première lumière. **La boulangerie** : la première fournée partagée entre voisins. **La Pierre des Voyageurs** : la promesse de ne laisser personne marcher seul. **L'Arbre aux Lanternes** : les souvenirs de ceux qui ne sont plus là. **Le Vieux Pont** : la plus belle réconciliation de l'histoire du royaume.",
    "*« Le Veilleur n'a pas caché les éclats pour qu'on ne les trouve pas. Il les a cachés là où chacun est une raison de les chercher. »*"
  ] },

  plan_tour: { day: 13, kind: 'plan', from: "Chalet du Givre", title: "Plan de la tour du Veilleur", body: [
    "La tour de l'Étoile, vue en coupe. Sept niveaux :",
    "**1.** Le tunnel des Archives, au pied. **2.** L'atelier du Veilleur. **3.** Le niveau de l'horloge (le mécanisme relié à celle de la mairie). **4.** La salle haute, où siège le Conseil. **5.** Le Balcon des Ancêtres. **6.** Le Balcon des Étoiles. **7.** La lanterne : le lieu où dormait l'Étoile.",
    "Un passage étroit relie le Balcon des Ancêtres au Bureau du Cartographe. Il est tracé à l'encre bleue : la couleur de Givre.",
    "*En marge : « C'est ici qu'il l'a fait. Je n'ai pas osé monter. »*"
  ] },

  scene_nuit: { day: 15, kind: 'souvenir', from: "Terrasse aux Cristaux · les cristaux, mis dans l'ordre", title: "La Nuit des Éclats, heure par heure", body: [
    "**22h10.** Le Veilleur est devant le Conseil, dans la salle haute.",
    "**22h50.** Il quitte la salle. Sur le seuil, un petit renard l'attend en faisant tourner une montre.",
    "**23h35.** À la boulangerie, une boîte à biscuits change de mains.",
    "**23h47.** Une main gantée, marquée d'une couronne, bloque l'aiguille de l'horloge de la mairie.",
    "**23h58.** Les deux silhouettes quittent la boulangerie.",
    "**Minuit.** Les cloches du château sonnent les douze coups. L'Étoile se brise au-dessus de la tour.",
    "**00h20.** Le président du Conseil fait venir un scribe : il faut « corriger » les archives."
  ] },

  journal2: { day: 16, kind: 'page', from: "Sous la glace du Lac Gelé", title: "Journal du Veilleur : sous le lac", body: [
    "« Je laisse ces pages sous la glace, là où personne ne cherche. »",
    "« J'ai vu Aldric lire la lumière de l'Étoile comme on lit un livre de comptes. *Tant qu'elle brille, personne n'osera nous reprocher quoi que ce soit*, a-t-il dit. Il ne parlait pas de l'Étoile. Il parlait de lui. »",
    "« Éloi seul m'a écouté. Il a voté pour moi. Seul. Je sais ce que cela lui coûtera. Je voudrais pouvoir lui dire merci. »",
    "« Si je disparais, que personne ne cherche à me venger. Que quelqu'un cherche seulement à *comprendre*. »"
  ] },

  echos: { day: 17, kind: 'echo', from: "Grotte des Échos", title: "La séance de la salle haute, telle que la grotte l'a gardée", body: [
    "**Le Veilleur.** « Cinq Anciens, un seul souci : l'Étoile brûle trop fort. Elle consume ce qu'elle éclaire. Je vous demande de ralentir sa magie, ne serait-ce que pour cet hiver. »",
    "**Aldric.** « Ralentir ? Le royaume n'a jamais été aussi lumineux. Tu voudrais qu'on éteigne nos lanternes sur une simple inquiétude ? »",
    "**Le Veilleur.** « Ce n'est pas une inquiétude. J'ai lu les signes pendant six semaines. Dans un an, elle ne laissera plus rien à éclairer. »",
    "**Séraphine.** « Les signes se lisent mal, Veilleur. Beaucoup d'hivers, beaucoup d'erreurs… »",
    "**Éloi.** « Écoutons-le. Une semaine de prudence ne nous coûtera rien. »",
    "**Aldric.** « Voyons : qui est pour ? Un seul. Qui est contre ? Quatre. Le Conseil refuse. »",
    "**Le Veilleur.** « Alors je ferai ce que vous refusez de faire. Vous me le reprocherez. »",
    "**Aldric**, à mi-voix. « Et nous veillerons à ce que l'histoire retienne ce qu'il faut. »"
  ] },

  eclats_vrais: { day: 20, kind: 'carte', from: "Bureau du Cartographe", title: "Les vrais éclats et les leurres", body: [
    "Vingt-quatre éclats ont été cachés. **Une partie seulement** sont de vrais morceaux de l'Étoile : la magie y bat encore, et c'est ce que le Conseil voulait retrouver pour la rallumer telle quelle.",
    "Les **autres** sont des souvenirs, scellés dans la forme d'un éclat pour tromper ceux qui voudraient les prendre. Mais chacun est le souvenir d'un vrai lieu du royaume : le détruire serait effacer un morceau de ce que l'on cherche à sauver.",
    "*« Voilà pourquoi il faut les rassembler tous, sans en jeter un seul. »*"
  ] },

  journal3: { day: 21, kind: 'page', from: "Grande Bibliothèque · le journal complet", title: "Journal du Veilleur : les dernières pages", body: [
    "« Je ne peux pas restaurer l'Étoile. Celui qui l'a gardée ne peut pas la juger : j'ai vécu trop longtemps à ses côtés. »",
    "« Il faudra qu'un regard neuf, venu d'ailleurs, décide ce que le royaume veut faire de sa lumière. Je ne sais pas qui sera cette personne. Je sais qu'elle devra avoir envie de *comprendre* avant d'avoir envie de réparer. »",
    "« Si ce journal est lu en entier, c'est qu'elle est arrivée jusqu'ici. À toi, alors, qui que tu sois : je ne te demande pas de me pardonner. Je te demande de choisir. »"
  ] },

  prophetie_aldric: { day: 19, kind: 'page', from: "Balcon des Étoiles · la version gravée sur ordre d'Aldric", title: "La prophétie, version du Conseil", body: [
    "« **L'Étoile ne sera pas restaurée par celui qui la garde, mais par celui qui la gouverne.** »",
    "*D'après Éloi, la fin a été effacée et regravée sur ordre d'Aldric, président du Conseil. La phrase d'origine disait autre chose. Plus personne ne s'en souvient.*"
  ] },
  prophetie: { day: 22, kind: 'page', from: "Balcon des Étoiles · la prophétie, en entier", title: "La prophétie", body: [
    "« **L'Étoile ne sera pas restaurée par celui qui la garde, mais par celui qui saura pourquoi elle brille.** »",
    "*« Elle ne brillera de nouveau que lorsque trois choses auront été rendues : la vérité à celui qu'on a accusé, la mémoire aux lieux qui l'ont perdue, et le choix à celle ou celui qui n'est pas d'ici. »*",
    "Aldric avait fait effacer cette fin et graver « …par celui qui la gouverne » à la place : la vraie prophétie ne le désignait pas, et rendait sa prise de pouvoir inutile."
  ] },

  /* ------------ indices reçus avant une énigme (voir `clues` dans data/puzzles.js) ------------ */

  rabat: { day: 1, kind: 'symbole', from: "Enveloppe scellée · sous le rabat", title: "Les signes sous le rabat", body: [
    "Quelques signes, tracés à la hâte par le Veilleur juste sous le sceau. Un premier message, à déchiffrer.",
    "[[pig:LA BOULANGERIE]]"
  ] },

  cahier_cuisson: { day: 2, kind: 'note', from: "Prêté par Mme Cannelle", title: "Cahier de cuisson · la Fête des Lumières", body: [
    "Mme Cannelle note tout ce qu'elle cuit, à la minute près. Voici la page du soir de la Fête des Lumières :",
    { table: { head: ["Fournée", "Au four à", "Cuisson", "Sortie"], rows: [
      ["Pain d'épices", "20h40", "55 min", "21h35"],
      ["Brioches", "21h50", "40 min", "22h30"],
      ["Sablés", "22h35", "25 min", "23h00"],
      ["Biscuits d'étoiles", "23h22", "36 min", "…"]
    ] } },
    { note: "Dans la marge, de la main de Mme Cannelle : « La clochette de la porte a sonné pendant la cuisson des biscuits d'étoiles : le minuteur du four affichait encore **23 minutes**. »" }
  ] },

  cadran_releve: { day: 3, kind: 'plan', from: "Carnet de relevés de Maître Givre", title: "Relevé du cadran de la mairie", body: [
    "Le cadran de la mairie, tel que Maître Givre l'a trouvé au matin qui a suivi la Nuit des Éclats.",
    "Les aiguilles sont figées sur **23h47**.",
    { note: "En marge, de la main de Givre : « Aucun rouage cassé. Rien qui explique l'arrêt. »" }
  ] },

  plan_etabli: { day: 4, kind: 'plan', from: "Atelier du Vieux Grelot · copie n°1", title: "Plan de l'établi", body: [
    "Les mesures du coffret et de sa clé noire, recopiées par Grelot. Chaque valeur est écrite sous la forme d'un calcul.",
    { list: ["Dents de la clé : **12 − 7**", "Cannelures de la tige : **2 × 2**", "Perles de l'anneau : **24 ÷ 3**", "Plumes du corbeau : **3 × 2**"] }
  ] },

  plan_tiroir: { day: 4, kind: 'plan', from: "Atelier du Vieux Grelot · copie n°2", title: "Plan du tiroir", body: [
    "Les mesures du coffret et de sa clé noire, recopiées par Grelot. Chaque valeur est écrite sous la forme d'un calcul.",
    { list: ["Dents de la clé : **10 ÷ 2**", "Cannelures de la tige : **9 − 6**", "Perles de l'anneau : **5 + 2**", "Plumes du corbeau : **4 + 2**"] }
  ] },

  plan_coffre: { day: 4, kind: 'plan', from: "Atelier du Vieux Grelot · copie n°3", title: "Plan du coffre", body: [
    "Les mesures du coffret et de sa clé noire, recopiées par Grelot. Chaque valeur est écrite sous la forme d'un calcul.",
    { list: ["Dents de la clé : **3 × 2**", "Cannelures de la tige : **12 ÷ 4**", "Perles de l'anneau : **4 × 2**", "Plumes du corbeau : **18 ÷ 3**"] }
  ] },

  gravure_chene: { day: 8, kind: 'symbole', from: "Cachette du Chêne creux · au fond du coffre de Grelot", title: "Le message gravé au fond du coffre", body: [
    "Un message gravé par le Veilleur dans l'écriture des veilleurs, recopié signe par signe.",
    "[[pig:MON AMI REPARE LE TEMPS]]"
  ] },

  panneaux: { day: 9, kind: 'carte', from: "Carrefour aux panneaux", title: "Les inscriptions des quatre panneaux", body: [
    "Les quatre panneaux tournent librement : leurs flèches ne veulent plus rien dire. Seuls le nom du lieu et la phrase gravée dessous sont restés vrais. Relevé mot pour mot :",
    { table: { head: ["Panneau", "Phrase gravée"], rows: [
      ["« Village »", "« Mon chemin part du côté où le soleil se lève. »"],
      ["« Chêne creux »", "« Quand on suit mon chemin, le chemin du Village est sur la gauche. »"],
      ["« Cabane »", "« Quand on suit mon chemin, le chemin des Falaises est sur la droite. »"],
      ["« Falaises de glace »", "« Le Veilleur n'est passé ni par le nord, ni par l'est, ni par le chemin du Chêne creux. »"]
    ] } }
  ] },

  formule_tableau: { day: 13, kind: 'page', from: "Tableau de Maître Givre · révélée par la poussière bleue", title: "La formule cachée du tableau", body: [
    "Les lignes que la craie de givre cachait, apparues en lettres de givre :",
    { list: [
      "« Trois matières seulement dans la formule : de la neige, du givre et du cristal. »",
      "« Il y a deux fois plus de neige que de givre. »",
      "« Il y a autant de cristal que de neige et de givre réunis. »",
      "« En tout : douze mesures, pas une de plus. »"
    ] }
  ] },

  regle_glace: { day: 14, kind: 'carte', from: "Escalier de glace · première marche", title: "Les six phrases gravées dans la glace", body: [
    "La règle de l'escalier, gravée dans la glace. Les six phrases sont toutes vraies :",
    { list: [
      "« Le Verre est plus haut que la Pierre. »",
      "« La Neige n'est pas la première marche. »",
      "« Le Cristal est juste au-dessus de la Glace. »",
      "« Entre la Pierre et la Neige, il y a exactement une marche. »",
      "« Ni le Verre ni la Pierre ne sont tout en haut. »",
      "« La Glace est plus haute que la Neige. »"
    ] }
  ] },

  portraits_dits: { day: 19, kind: 'echo', from: "Balcon des Ancêtres · les cinq portraits", title: "Ce que disent les portraits", body: [
    "Les cinq portraits parlent quand on les regarde. Chacun raconte sa version de la Nuit des Éclats :",
    { list: [
      "**Doyen Aldric** : « J'ai voté contre le Veilleur, comme il se devait. »",
      "**Doyenne Séraphine** : « J'ai voté contre le Veilleur : les signes se lisent si mal. »",
      "**Doyen Barnabé** : « J'ai voté contre le Veilleur, car jamais l'Étoile n'avait si bien brillé. »",
      "**Doyenne Mélisende** : « J'ai voté contre le Veilleur, et je le referais. »",
      "**Doyen Éloi** : « J'ai voté contre le Veilleur, comme tous les autres. Nous étions unanimes. »"
    ] }
  ] },

  portraits_table: { day: 19, kind: 'registre', from: "Balcon des Ancêtres · relevé des portraits", title: "Les portraits, tels qu'ils sont accrochés aujourd'hui", body: [
    "Comment chaque Ancien est peint, aujourd'hui, sur le Balcon des Ancêtres :",
    { table: { head: ["Ancien", "Robe", "Objet", "Bague", "Emblème"], rows: [
      ["Doyen Aldric", "bleu nuit", "le sceau du Conseil", "pierre rouge", "[[emb:couronne]]"],
      ["Doyenne Séraphine", "vert sapin", "un rameau de houx", "pierre verte", "[[emb:croissant]]"],
      ["Doyen Barnabé", "grise", "un sablier", "argent nue", "[[emb:sablier]]"],
      ["Doyenne Mélisende", "pourpre", "une boussole", "pierre dorée", "[[emb:rose]]"],
      ["Doyen Éloi", "ocre", "un grimoire", "pierre rouge", "[[emb:couronne]]"]
    ] } }
  ] },
};
