/* ==========================================================================
   LE GRAND POINT AVEC FLOCON — une vraie discussion entre l'aventurière et Flocon,
   obligatoire entre le jour 23 et le jour 24 (on la lance en touchant Flocon, en bas de l'écran).

   Ils reprennent l'histoire dans l'ordre et s'entraident sur ce que chacun a mal compris :
   • { flocon: [...] }        Flocon parle (une ou plusieurs répliques [expression, texte]).
   • { explain: {...} }       Flocon s'emmêle : l'aventurière lui explique en choisissant sa réplique.
        options : { t: ce qu'elle dit, ok: true pour la bonne, reply: la réaction de Flocon si c'est faux (un indice, jamais la réponse) }
        good : la réaction de Flocon quand elle a bien expliqué.
   • { doubt: [expr, texte] } C'est au tour de l'aventurière d'avoir un doute : elle choisit ce qu'elle n'a pas compris
        (dans « doubts » ; chaque doute n'est posé qu'une fois) et Flocon lui explique.
   {nom} = le prénom de l'héroïne.
   ========================================================================== */
(function () {
  Game.data.brainstorm = {
    scene: "lieu-reflexion.webp",   // le décor : les lieux déjà visités, comme des souvenirs accrochés
    script: [
      { flocon: [
        ['reflechit', "Dis, {nom}… On s’assoit deux minutes ? Avant demain, j’aimerais qu’on remette toute l’histoire dans l’ordre, tous les deux."],
        ['triste', "Parce que moi, j’avoue… avec toutes ces histoires de fragments, de souvenirs et de portraits repeints, j’ai quelques trous dans la neige."]
      ] },

      { explain: {
        q: ['reflexion', "Au tout début, il y avait la lettre du Veilleur. Il avouait avoir brisé l’Étoile… Moi, j’étais sûr que c’était le méchant. Mais au final, pourquoi il l’a brisée, déjà ?"],
        options: [
          { t: "Par jalousie envers les Anciens.", reply: ['reflechit', "Hmm… C’est ce que racontaient les chroniques de Dame Plume. Mais on a découvert qu’elles avaient été réécrites, non ?"] },
          { t: "Parce que l’Étoile devenait trop puissante : elle consumait le royaume.", ok: true },
          { t: "Pour garder sa magie rien que pour lui.", reply: ['reflechit', "Pourtant, Dame Brume nous l’a dit au Vieux Pont : il n’a jamais cherché à récupérer les fragments pour lui…"] }
        ],
        good: [
          ['emerveille', "Voilà ! Elle prenait tout pour elle. Il l’a brisée pour protéger le royaume…"],
          ['triste', "Et tout le monde l’a pris pour le méchant. Moi le premier. Oups."]
        ]
      } },

      { explain: {
        q: ['cherche', "Ensuite, l’horloge de la mairie, bloquée à 23h47, juste avant la brisure… Ça, c’était forcément le Veilleur, non ? Il a tout manigancé, cette nuit-là !"],
        options: [
          { t: "Oui, c’est lui qui l’a bloquée.", reply: ['reflechit', "Attends… À 23h47, le Veilleur et son ami étaient chez Mme Cannelle ! Le cahier de cuisson disait qu’ils étaient arrivés à 23h35 et repartis à 23h58."] },
          { t: "Non, c’est Maître Givre.", reply: ['reflechit', "Maître Givre était avec le Veilleur, chez Mme Cannelle… Et sur le cadran de cristal, la main qui bloquait l’horloge portait un gant marqué d’un symbole. Tu te souviens lequel ?"] },
          { t: "Non : c’est Aldric. La main gantée était marquée de sa couronne.", ok: true }
        ],
        good: [
          ['decouvre', "Aldric ! Pas le Veilleur ! Il ne le croyait pas, et il a voulu l’empêcher de briser l’Étoile…"],
          ['reflechit', "Il pensait qu’en bloquant l’horloge, minuit ne sonnerait jamais au château. Sauf que Maître Givre avait détaché les cloches !"],
          ['reflexion', "Donc le Veilleur n’a rien manigancé du tout. C’est Aldric qui jouait dans son dos."]
        ]
      } },

      { doubt: ['content', "Et toi, {nom} ? Il y a un truc que tu n’as pas bien compris ? Vas-y, demande-moi. Pour une fois que je peux expliquer quelque chose !"] },

      { explain: {
        q: ['reflechit', "Mais alors… si le Veilleur voulait protéger le royaume, pourquoi tout le monde le prenait pour le méchant ?"],
        options: [
          { t: "Parce qu’il voulait vraiment détruire le royaume.", reply: ['triste', "Non… On a vu ses vraies notes, son journal, la séance de la grotte. Il avait prévenu tout le monde, six semaines à l’avance."] },
          { t: "Parce qu’Aldric a fait réécrire les livres et repeindre les portraits pour l’accuser.", ok: true },
          { t: "Parce que Nox l’avait dénoncé.", reply: ['reflechit', "Nox ? Au contraire ! Il a même menti sur le chemin pour tenir la promesse qu’il avait faite au Veilleur…"] }
        ],
        good: [
          ['enerve', "Voilà ! Les chroniques, les pages de la séance, le portrait d’Éloi… Aldric avait promis que « l’histoire retiendrait ce qu’il faut »."],
          ['fier', "Sauf que nous, on a recoupé tous les souvenirs. Et plusieurs souvenirs qui disent la même chose, ça fait une preuve !"]
        ]
      } },

      { doubt: ['malicieux', "À ton tour ! Encore une question ? Je suis chaud. Enfin… façon de parler, hein."] },

      { explain: {
        q: ['cherche', "Et la prophétie… Aldric avait fait graver une autre fin par-dessus la vraie. Mais pourquoi il a fait ça ?"],
        options: [
          { t: "Pour protéger le Veilleur.", reply: ['reflechit', "Hmm… La fausse fin disait « …mais par celui qui la gouverne ». Et qui gouvernait le royaume, à ce moment-là ?"] },
          { t: "Pour qu’elle le désigne, lui, comme celui qui sauverait l’Étoile.", ok: true },
          { t: "Par erreur : le tailleur de pierre s’était trompé.", reply: ['reflechit', "Une erreur ? L’Ancienne Aurore se souvenait très bien de celui qui en avait effacé la fin, pourtant…"] }
        ],
        good: [
          ['serein', "Exactement. La vraie fin disait : « …par celui qui saura pourquoi elle brille. » Ça ne parlait pas de pouvoir. Ça parlait de comprendre."],
          ['amoureux', "Et la personne qui a compris… c’est toi."]
        ]
      } },

      { doubt: ['content', "Dernière question pour toi ! Après, je te laisse tranquille. Promis."] },

      { explain: {
        q: ['reflexion', "Et demain, pour rallumer l’Étoile… On la refait exactement comme avant, c’est ça ?"],
        options: [
          { t: "Oui, exactement comme avant.", reply: ['reflechit', "Le Veilleur nous a posé cette question au Belvédère, tu te souviens ? Et tu lui avais répondu…"] },
          { t: "Non. Une Étoile nouvelle, qui partage sa lumière au lieu de tout garder.", ok: true }
        ],
        good: [
          ['determine', "Une Étoile qui ne prend plus rien à personne… Avec les fragments, et les souvenirs du Cœur de Noël."]
        ]
      } },

      { flocon: [
        ['amoureux', "Merci, {nom}. Tu vois ? Tout seul, je m’emmêlais. Mais à deux, on a tout compris. Enfin… presque tout."],
        ['determine', "On est prêts. Demain, le cœur du château nous attend !"]
      ] }
    ],

    // ce que l'aventurière peut ne pas avoir compris (elle en choisit trois au fil de la discussion)
    doubts: [
      { t: "Qui accompagnait le Veilleur, le soir de la Nuit des Éclats ?", a: [
        ['reflechit', "Maître Givre ! La lanterne n°7 les montrait ensemble. Il a aidé à préparer la fracture… sans vraiment l’avoir choisi."],
        ['triste', "Il s’en voulait tellement qu’il nous a confié sa montre, pour enfin passer à autre chose."]
      ] },
      { t: "Comment l’Étoile a pu se briser à minuit, si le Veilleur était à la boulangerie ?", a: [
        ['reflechit', "Il avait tout préparé avant de descendre au village : la formule de Maître Givre attendait dans la lanterne de la tour. Au douzième coup de minuit, elle s’est éveillée toute seule."],
        ['emerveille', "Et ce qu’il portait contre lui, comme un enfant, c’était une goutte de la vraie lumière de l’Étoile. Celle que Nox a gardée sous le lac !"]
      ] },
      { t: "Pourquoi l’Étoile était devenue dangereuse ?", a: [
        ['reflechit', "Elle était devenue trop puissante. Elle gardait toute la lumière, tous les souvenirs du royaume pour elle… et elle consumait tout le monde, petit à petit."],
        ['triste', "Le Veilleur l’avait vu venir. Mais le Conseil n’a pas voulu l’écouter."]
      ] },
      { t: "C’est quoi, au juste, les « souvenirs scellés » ?", a: [
        ['reflechit', "Alors ça, j’ai mis du temps… Parmi les éclats, il y avait des vrais morceaux de l’Étoile, et des souvenirs du royaume."],
        ['fier', "Les souvenirs protégeaient les fragments. Et comme ça, on a dû visiter tous les lieux importants du royaume. Malin, le Veilleur."]
      ] },
      { t: "Pourquoi le Veilleur m’a choisie, moi ?", a: [
        ['amoureux', "Parce que tu ne viens pas du royaume ! Ici, tout le monde était pris dans les histoires du Conseil. Il fallait quelqu’un qui regarde avec des yeux tout neufs."],
        ['fier', "Et un assistant très compétent, bien sûr. Mais ça, c’était un bonus."]
      ] },
      { t: "À quoi sert le Cœur de Noël ?", a: [
        ['emerveille', "C’est tous les souvenirs du royaume : les traditions, le partage, les moments ensemble, la mémoire, le pardon…"],
        ['determine', "C’est ce qui donnera sa lumière à la nouvelle Étoile. Une lumière qui vient de tout le monde, et qui retourne à tout le monde."]
      ] }
    ],

    // ce que dit Flocon si on veut aller au jour 24 avant d'avoir fait le point
    blocked: ['impatient', "Attends, {nom} ! Avant le grand final, on doit faire le point tous les deux… Touche-moi, là, en bas de l’écran !"]
  };
})();
