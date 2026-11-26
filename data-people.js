/* ==========================================================================
   PERSONNAGES — l'onglet « Personnages » du Journal.

   Le carnet d'indices ne contient que des indices PHYSIQUES (lettres, pages, plans…). Tout ce que les
   personnages racontent À L'ORAL est rangé ici : un onglet par personnage, avec ce qu'il t'a déjà dit.
   Un personnage que tu n'as pas encore rencontré apparaît grisé, avec « ??? » à la place de son nom.

   Pour chaque personnage :
     char  : identifiant dans data/characters.js (sert aussi à afficher son portrait)
     name  : nom affiché une fois rencontré
     role  : petite mention sous le nom
     facts : ce qu'il a dit, dans l'ordre de l'histoire. Chaque information est { day, when, text } :
               day  : le jour du chapitre
               when : à quel moment du chapitre l'information est donnée —
                      'intro'  (après le début du chapitre), 'gift' (après le cadeau),
                      'puzzle' (après l'énigme) ou 'end' (à la fin du chapitre)
             Une information n'apparaît qu'une fois ce moment passé : aucun spoil.
     Le personnage est « rencontré » dès que sa 1re information apparaît.
   Dans les textes : {nom} = prénom de l'héroïne, **gras**, *italique*.
   ========================================================================== */
Game.data.people = [

  { id: 'cannelle', char: 'cannelle', name: "Mme Cannelle", role: "Boulangère du village", facts: [
    { day: 2, when: 'intro', text: "Elle reconnaît le sceau de la lettre : elle n'avait plus vu cette étoile depuis bien des hivers." },
    { day: 2, when: 'intro', text: "Au village, on répète que le Veilleur a brisé l'Étoile. On le répète depuis si longtemps qu'on a fini par oublier qu'il y avait d'autres versions." },
    { day: 2, when: 'intro', text: "La Nuit des Éclats, elle a vu une grande silhouette à capuche passer devant la mairie. Elle portait quelque chose contre elle, « pas comme on porte un trésor, plutôt comme on porte un enfant, avec beaucoup de précautions »." },
    { day: 2, when: 'intro', text: "Elle note chaque fournée dans son cahier de cuisson, à la minute près. Elle te le prête." },
    { day: 2, when: 'puzzle', text: "Les deux visiteurs sont arrivés chez elle à **23h35**. Elle n'osait plus prononcer cette heure." },
    { day: 2, when: 'gift', text: "La personne qui accompagnait la silhouette a déposé une boîte à biscuits sur son comptoir : « Pour celui ou celle qui viendra demander. » Elle n'a jamais eu le courage de l'ouvrir." },
    { day: 2, when: 'end', text: "On raconte que l'horloge de la mairie s'est arrêtée au moment exact où l'Étoile s'est brisée. Pourtant, elle a entendu les cloches du château sonner minuit cette nuit-là." }
  ] },

  { id: 'givre', char: 'givre', name: "Maître Givre", role: "Horloger de la mairie", facts: [
    { day: 3, when: 'intro', text: "L'horloge de la mairie est son ouvrage. Elle s'est arrêtée à **23h47** la Nuit des Éclats, et tout le village répète que c'est l'instant où l'Étoile s'est brisée." },
    { day: 3, when: 'intro', text: "Il a démonté cinq rouages pour comprendre ce qui s'est passé, mais ne sait plus dans quel ordre ils doivent tourner." },
    { day: 3, when: 'gift', text: "Il ne reconnaît pas le signe gravé au dos du fragment de cadran. On ne grave pas un symbole pareil par décoration : quelqu'un voulait laisser une trace, ou s'assurer qu'elle ne serait jamais retrouvée." },
    { day: 3, when: 'puzzle', text: "Quelqu'un d'autre s'est approché de son mécanisme, quelqu'un qui connaissait précisément l'endroit où intervenir. « On lui a fait dire ce qu'on voulait entendre. »" },
    { day: 3, when: 'end', text: "Un passage secret s'ouvre sous la mairie : il avait oublié son existence. Il débouche chez son vieil ami Grelot, l'artisan." },
    { day: 13, when: 'intro', text: "Il avoue t'avoir menti à la mairie : il connaissait le Veilleur, c'était son ami." },
    { day: 13, when: 'gift', text: "Sa montre s'est arrêtée cette nuit-là. Il la garde depuis, comme le souvenir de l'heure où il a promis de se taire. Il te la confie." },
    { day: 13, when: 'end', text: "Il a aidé le Veilleur à briser l'Étoile : le Veilleur lui a demandé son aide, disant qu'elle ne pouvait plus continuer ainsi. Après coup, il a laissé les autres raconter leur version, par peur de perdre ce qu'il lui restait." },
    { day: 13, when: 'end', text: "Il n'a jamais osé monter dans la tour du Veilleur. Il t'en donne le plan." },
    { day: 24, when: 'end', text: "Il ne peut pas effacer son geste, mais il reconnaît enfin pourquoi il était nécessaire. Il aurait dû dire la vérité. « Le temps peut recommencer. »" }
  ] },

  { id: 'grelot', char: 'grelot', name: "Le Vieux Grelot", role: "Artisan", facts: [
    { day: 4, when: 'intro', text: "Le Veilleur lui a demandé « quelques bricoles » : des coffrets, des serrures, des fonds de lanternes. Rien qu'un artisan ne puisse faire." },
    { day: 4, when: 'intro', text: "Il copie ses plans en glissant une erreur dans chaque exemplaire. C'est ce que le Veilleur lui avait demandé : « Celui qui voudra copier ton travail devra être aussi patient que toi. »" },
    { day: 4, when: 'gift', text: "Il te donne une clé noire, forgée dans le fer d'une vieille lanterne, avec un corbeau gravé sur l'anneau. Elle ouvre ce qui n'aurait jamais dû être fermé, mais pas ici : tu trouveras la serrure plus loin." },
    { day: 4, when: 'end', text: "Le Veilleur lui a commandé **vingt-quatre** cachettes, pas une de plus : des coffrets, des pierres creuses, des fonds de lanternes, un revers de miroir. Il les a toutes fabriquées." },
    { day: 4, when: 'end', text: "Il est persuadé que le Veilleur cherchait à mettre quelque chose à l'abri. Personne ne lui a demandé pourquoi : alors il s'est tu." },
    { day: 4, when: 'end', text: "Il t'envoie voir Dame Plume, à la bibliothèque : elle conserve les chroniques du royaume." }
  ] },

  { id: 'plume', char: 'plume', name: "Dame Plume", role: "Bibliothécaire", facts: [
    { day: 5, when: 'intro', text: "Version officielle, écrite dans le Livre des Vérités : le Veilleur aurait détruit l'Étoile par jalousie, parce que le royaume ne lui témoignait pas assez de reconnaissance." },
    { day: 5, when: 'gift', text: "Une page de journal, déchirée, s'était glissée entre deux chroniques. Elle n'a pas le droit de la classer : elle te la confie." },
    { day: 5, when: 'puzzle', text: "Le soir de la Fête des Lumières, le Conseil a refusé par **quatre voix contre une**. Trois hivers plus tard, le Livre des Vérités parle d'une décision prise « à l'unanimité ». « Un livre n'oublie pas un vote. Quelqu'un l'a réécrit. »" },
    { day: 5, when: 'end', text: "Elle ouvre le rayon fermé : le registre des Cinq Anciens, des esquisses jamais retouchées, plus anciennes que les chroniques officielles. Elle te les confie pour que tu puisses comparer ce qui a été écrit et ce qui a été effacé." },
    { day: 5, when: 'end', text: "Elle a consacré sa vie à protéger ces livres, et elle les a crus. Elle t'envoie voir l'Ancienne Aurore, qui était là avant que les chroniques ne racontent cette histoire." },
    { day: 21, when: 'intro', text: "Le Conseil a voulu faire disparaître quatre livres : les versions originales de la séance, les notes du Veilleur et les premières chroniques. Elle a laissé faire : en croyant protéger la bibliothèque, elle protégeait le mensonge." },
    { day: 21, when: 'gift', text: "Elle te donne le Livre aux pages muettes, qui n'a jamais eu une seule ligne écrite. Ses pages restent muettes pour ceux qui veulent imposer leur histoire ; elles se rempliront quand l'histoire sera complète." },
    { day: 21, when: 'end', text: "Le Veilleur t'a choisie sans te connaître. Il savait une seule chose : la personne qui viendrait devrait comprendre avant de réparer. Elle rouvre son rayon fermé : il n'y aura plus de livres interdits." }
  ] },

  { id: 'aurore', char: 'aurore', name: "L'Ancienne Aurore", role: "Ancienne du royaume", facts: [
    { day: 6, when: 'intro', text: "Elle connaît le Veilleur depuis des siècles : il était déjà là quand le royaume n'avait pas encore de nom." },
    { day: 6, when: 'intro', text: "L'Étoile n'a pas été détruite, elle a été **mise à l'abri**. « Brisée, oui. Détruite, jamais. »" },
    { day: 6, when: 'intro', text: "Le Veilleur n'a pas laissé ses indices au hasard : il voulait qu'un jour quelqu'un puisse le suivre, quelqu'un qui prendrait le temps de regarder plutôt que de croire ce qu'on lui raconte." },
    { day: 6, when: 'gift', text: "Le Veilleur lui a confié sa carte, qui ne se révèle qu'à celle qui sait la lire. Il dessinait ce qui se répétait pour décrire un paysage ; les lieux qu'il voulait nommer, il ne les représentait qu'une seule fois." },
    { day: 6, when: 'end', text: "Dans la Forêt des Lumières, les arbres se souviennent de ce que les hommes oublient. Elle te met en garde : un corbeau un peu trop bavard n'est pas toujours à croire." },
    { day: 15, when: 'intro', text: "Les cristaux de la terrasse gardent ce qui a été vu la Nuit des Éclats. Les heures ont été effacées : à toi de les retrouver." },
    { day: 15, when: 'gift', text: "Elle te donne un cristal qui garde un peu de la lumière d'autrefois : quand tu douteras de ce que tu vois, tu pourras regarder à travers lui." },
    { day: 15, when: 'puzzle', text: "La main qui a bloqué l'horloge portait une couronne. Ce n'était ni celle du Veilleur, ni celle de son ami." },
    { day: 15, when: 'end', text: "La magie de l'Étoile ne se laisse toucher qu'au douzième coup de minuit, la nuit de la Fête des Lumières. Celui qui a bloqué l'horloge de la mairie, qui fait sonner les cloches du château, voulait empêcher minuit de sonner. Mais Maître Givre avait détaché les cloches : à minuit, elles ont sonné, et l'Étoile s'est brisée." },
    { day: 15, when: 'end', text: "Ensuite, il a laissé le royaume croire que l'horloge indiquait l'heure exacte de la catastrophe, pour que personne ne se demande qui l'avait arrêtée." },
    { day: 15, when: 'end', text: "Cette nuit-là, le Veilleur et Maître Givre étaient à la boulangerie quand l'horloge a été bloquée. Avant de descendre au village, le Veilleur avait placé dans la lanterne de la tour la formule préparée avec Givre : elle n'attendait plus que minuit." },
    { day: 22, when: 'intro', text: "Elle se souvient du jour où le tailleur de pierre a gravé la prophétie, et de celui qui en a effacé la fin : Aldric, qui y a fait graver une fin le désignant, lui." },
    { day: 22, when: 'gift', text: "Elle te prête une lunette qui montre les étoiles non pas comme elles sont, mais comme elles se souviennent d'avoir été." },
    { day: 22, when: 'puzzle', text: "La phrase complète : « L'Étoile ne sera pas restaurée par celui qui la garde, mais par celui qui saura pourquoi elle brille. » Elle ne désignait ni un roi, ni un gardien, ni un Ancien, mais quelqu'un capable de comprendre que la magie doit être partagée et renouvelée, pas exploitée." },
    { day: 22, when: 'end', text: "L'Étoile ne se rallumera pas avec ses seuls fragments : il lui faut ce qui l'a toujours nourrie, les souvenirs, et ce qu'ils nous apprennent à partager." },
    { day: 24, when: 'end', text: "Les traditions ne sont pas des choses que l'on garde enfermées : ce sont des choses que l'on transmet." }
  ] },

  { id: 'nox', char: 'nox', name: "Nox", role: "Corbeau messager", facts: [
    { day: 7, when: 'intro', text: "Il se dit messager, guetteur, gardien de quelques secrets, et le seul corbeau de la forêt à avoir lu la Pierre des Voyageurs." },
    { day: 7, when: 'intro', text: "La Pierre indique un chemin à ceux qui remettent ses vers dans le bon ordre. Quelqu'un les a déplacés. Lui ? « Probablement pas. »" },
    { day: 7, when: 'gift', text: "Il te donne une poudre qui révèle ce que l'on a voulu cacher : traces effacées, mots dissimulés." },
    { day: 7, when: 'end', text: "Le Veilleur a traversé la forêt plusieurs fois après la catastrophe. Quelqu'un l'a vu, quelqu'un l'a aidé. Direction : l'ouest, le chêne creux." },
    { day: 8, when: 'intro', text: "Le Veilleur louait le chêne creux pour trois cents hivers. Le loyer se payait en gâteaux de Mme Cannelle." },
    { day: 8, when: 'gift', text: "Il te donne l'une de ses plumes : un laissez-passer auprès des amis des corbeaux, et une épreuve pour ceux qui ne le sont pas." },
    { day: 8, when: 'end', text: "Pourquoi personne n'a écouté le Veilleur ? « Il y a bien des possibilités. » Mais il ne donne pas son avis gratuitement." },
    { day: 9, when: 'intro', text: "Il jure que le Veilleur est parti par le nord. Les panneaux du carrefour ont été retournés : leurs flèches ne veulent plus rien dire, mais ce qui est gravé dessus dit toujours la vérité." },
    { day: 9, when: 'puzzle', text: "Il avait affirmé que le Veilleur était parti par le nord. C'était faux : le Veilleur est passé par l'**ouest**." },
    { day: 9, when: 'end', text: "La Nuit des Éclats, il portait un message scellé du Conseil, une convocation. Il l'a remise lui-même au Veilleur." },
    { day: 9, when: 'end', text: "Il a menti pour tenir loin de l'ouest, de la cabane, quelqu'un qui n'a pas envie d'être retrouvée. Le Veilleur lui avait fait promettre de la protéger." },
    { day: 12, when: 'intro', text: "C'est le Veilleur lui-même qui a brisé le grand miroir de la cabane, le jour de son départ : il ne voulait pas que n'importe qui puisse lire ce qu'il montrait." },
    { day: 16, when: 'intro', text: "C'est au bord du lac que le Veilleur venait écrire, les derniers temps. Nox n'y était jamais revenu depuis." },
    { day: 16, when: 'gift', text: "La Nuit des Éclats, avant de descendre au village, le Veilleur a recueilli une goutte de la vraie lumière de l'Étoile : c'est elle qu'il portait « comme un enfant » quand Mme Cannelle l'a vu passer." },
    { day: 16, when: 'gift', text: "La lettre déchirée du Chêne creux lui était destinée : le Veilleur n'a jamais su lui dire au revoir." },
    { day: 16, when: 'gift', text: "Le Veilleur lui avait demandé de veiller sur la lumière de l'Étoile, la vraie. Il a tenu la promesse de ne pas la laisser tomber entre de mauvaises mains, mais pas celle de revenir. Il te la confie." },
    { day: 16, when: 'end', text: "Éloi, le gardien des lanternes : on dit qu'il hante encore le château." },
    { day: 24, when: 'end', text: "Cette fois, c'est lui qui portera le message du Veilleur, et il ne laissera personne le modifier en chemin." }
  ] },

  { id: 'brume', char: 'brume', name: "Dame Brume", role: "Gardienne de l'Arbre aux Lanternes", facts: [
    { day: 10, when: 'intro', text: "Nox t'a laissée venir jusqu'à elle : c'est elle qu'il protégeait en vous envoyant vers le nord." },
    { day: 10, when: 'intro', text: "Elle veille sur l'Arbre aux Lanternes depuis que les Anciens ont cessé de se souvenir de lui. Chaque lanterne porte un numéro, et chaque numéro correspond à un souvenir." },
    { day: 10, when: 'gift', text: "La lanterne n°7 s'est éteinte la Nuit des Éclats. Depuis, elle attend quelqu'un qui saura lui rendre sa place, sans chercher à la forcer à briller." },
    { day: 10, when: 'end', text: "Ceux qui mentent par peur ne mentent pas tous pour les mêmes raisons : certains cherchent à protéger une vérité. Le Vieux Pont te posera des questions." },
    { day: 11, when: 'intro', text: "Le Vieux Pont ne laisse passer ni les menteurs, ni les distraits. Il pose trois questions : il ne demande pas de deviner, il demande de se souvenir." },
    { day: 11, when: 'gift', text: "Le galet qu'elle te donne repose sous le pont depuis des siècles : le pont se souvient de ceux qui ont tenu leurs promesses." },
    { day: 11, when: 'end', text: "Le Veilleur n'a jamais cherché à garder les éclats pour lui : il les a confiés, cachés, puis il s'est effacé. « Il est plus facile de haïr un seul homme que de douter de cinq. »" },
    { day: 12, when: 'intro', text: "La cabane est l'endroit où le Veilleur préparait tout : les plans, les cachettes, les messages." },
    { day: 12, when: 'end', text: "Le miroir montre ce qui est vrai, même lorsque les mots ont été effacés. Le Veilleur n'a pas caché les éclats au hasard : chacun repose dans un lieu qui compte pour le royaume." },
    { day: 14, when: 'gift', text: "La cloche sans battant ne sonne pas, elle écoute. Elle t'en fait cadeau : elle te servira plus haut, pour vérifier les livres qui mentent." },
    { day: 14, when: 'end', text: "Elle sait ce que la brume a vu cette nuit-là, mais préfère que tu le découvres toi-même : « Une vérité qu'on te donne ne vaut jamais celle que tu trouves toi-même. »" },
    { day: 14, when: 'end', text: "Les heures de cette nuit-là dorment encore à la Terrasse aux Cristaux, plus haut." },
    { day: 20, when: 'intro', text: "Le Cartographe a quitté le château avec le reste du Conseil, quand la lumière s'est éteinte, mais sa carte est toujours là. « Une carte ne ment pas toujours. Parfois, elle ne montre que ce qu'on lui demande de montrer. »" },
    { day: 20, when: 'gift', text: "Elle te donne un compas dont l'aiguille ne pointe pas le nord : elle indique l'endroit où l'on a le plus besoin d'aller, et hésite souvent entre deux directions." },
    { day: 20, when: 'end', text: "Seuls certains des vingt-quatre éclats sont de véritables fragments de l'Étoile. Les souvenirs protègent les fragments, et les fragments protègent ce que les souvenirs racontent : détruire les éclats « inutiles » aurait effacé une partie de l'histoire du royaume." },
    { day: 23, when: 'intro', text: "Chaque boîte de mémoire contient une chose que le royaume avait oubliée. Le Conseil croyait que la magie devait être conservée, contrôlée et possédée ; mais les souvenirs ne vivent pas dans des coffres, ils vivent lorsqu'on les partage." },
    { day: 23, when: 'gift', text: "Elle te donne le Cœur de Noël, qui contient les souvenirs de tout un royaume : les fêtes, les chansons, les traditions, les gestes de bonté." },
    { day: 23, when: 'end', text: "L'Étoile était devenue trop puissante parce qu'elle gardait tout pour elle. La nouvelle magie devra circuler entre les habitants." },
    { day: 24, when: 'end', text: "« La magie n'appartient plus au château. Elle appartient à ceux qui la font vivre. »" }
  ] },

  { id: 'veilleur', char: 'veilleur', name: "Le Veilleur des Neiges", role: "Gardien de l'Étoile", facts: [
    { day: 18, when: 'intro', text: "Il est celui que tu as suivi à travers les lettres, les pierres, les mensonges et les souvenirs. Il ne te demande pas de le croire : il te demande de lui montrer ce que tu as compris." },
    { day: 18, when: 'gift', text: "Il te remet son sceau, qui ouvre les portes du château. Il ne sait pas comment réparer l'Étoile, mais il sait qu'il ne faut pas la remettre comme elle était : le royaume doit apprendre à vivre avec une magie différente." },
    { day: 18, when: 'puzzle', text: "Restaurer l'Étoile exactement comme elle était, ce serait recommencer ce qui l'a brisée. Pendant des années, il a cru que personne ne comprendrait cette vérité." },
    { day: 24, when: 'intro', text: "Trois choses ont été retirées au royaume : la vérité, ses souvenirs, et le droit de choisir son chemin. Tu les as retrouvées." },
    { day: 24, when: 'puzzle', text: "L'Étoile ne peut pas être reconstruite avec la seule magie de ce royaume : il lui manque encore une lumière, une lumière qui vient de l'extérieur." },
    { day: 24, when: 'end', text: "Il ne demande ni pardon, ni couronne, ni retour à ce qu'il était. Il veut seulement que les habitants sachent pourquoi l'Étoile a été brisée : elle allait dévorer ce qu'elle devait protéger." },
    { day: 24, when: 'end', text: "Il ne demande pas qu'on punisse Aldric et les autres Anciens : seulement que plus jamais une seule voix n'écrive l'histoire à la place de tous." },
    { day: 24, when: 'end', text: "Il aurait dû parler plus tôt, trouver un autre moyen. « La magie ne se sauve pas en la possédant. Elle se sauve en la partageant. »" }
  ] },

  { id: 'eloi', char: 'eloi', name: "Éloi", role: "Ancien du Conseil, gardien des lanternes", facts: [
    { day: 19, when: 'puzzle', text: "Son portrait a été repeint aux couleurs d'Aldric, et on a mis dans sa bouche des mots qu'il n'a jamais prononcés." },
    { day: 19, when: 'puzzle', text: "Il est le seul Ancien à avoir voté pour le Veilleur. Puis il s'est tu quand les autres ont décidé d'en faire un monstre : « J'ai cru qu'une seule voix ne changerait rien. »" },
    { day: 19, when: 'gift', text: "Il te remet sa vraie bague, celle que le peintre a effacée de son portrait. La pierre bleue était l'emblème de la flamme : elle rappelait aux Anciens que leur pouvoir devait éclairer le royaume, jamais le dominer." },
    { day: 19, when: 'end', text: "Aldric a ordonné la falsification des archives : les chroniques, les pages de la séance, son portrait. Il l'a vu faire venir le scribe, mais il n'a pas de preuve, seulement une mémoire." },
    { day: 19, when: 'end', text: "Aldric a aussi fait regraver la fin de la prophétie : « …mais par celui qui la gouverne ». La vraie fin ne parlait pas de lui, et c'est ce qui lui faisait peur." },
    { day: 19, when: 'end', text: "Derrière son portrait, un passage mène au bureau du Cartographe, qui connaissait les routes du royaume." },
    { day: 24, when: 'intro', text: "Il est revenu dire ce qu'il n'a pas dit autrefois : « Le Veilleur n'a pas trahi le royaume. C'est nous qui avons trahi la vérité. »" },
    { day: 24, when: 'end', text: "« Nous avons tous laissé le silence devenir un mensonge. » Il faut que le royaume entende la vérité." }
  ] }
];
