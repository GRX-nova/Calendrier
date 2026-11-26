/* ==========================================================================
   AUDIO — musique et bruitages.

   • zones : la musique de chaque lieu (boucle). Quand on change de zone, les deux morceaux
     s'enchaînent en fondu. Le château a deux morceaux : avant et après la reconstruction de l'Étoile
     (le second démarre à l'éclosion de la nouvelle Étoile, au jour 24).
     Les fichiers sont des MP3 égalisés au même volume (-16 LUFS) : si tu en changes un, garde ce niveau.
   • puzzle : musique jouée pendant toutes les énigmes (se remplace par la musique du lieu à la fin de l'énigme).
   • music  : musique de repli pour une zone sans fichier (sinon : boîte à musique synthétisée).
   • finale : (facultatif) morceau joué pendant tout le final du 24, à la place de la musique du château.
   • sfx    : bruitages (par défaut synthétisés, aucun fichier nécessaire).
   La musique ne démarre JAMAIS toute seule : seulement après le clic sur « Entrer ».
   ========================================================================== */
Game.data.audio = {
  zones: {
    village:       "son-zone1-village.mp3",           // zone 1 · la place du village de Noël
    foret:         "son-zone2-foret.mp3",             // zone 2 · la forêt des lumières
    glace:         "son-zone3-glace.mp3",             // zone 3 · le royaume de glace
    chateau:       "son-zone4-chateau-avant.mp3",     // zone 4 · le château, Étoile brisée
    chateau_apres: "son-zone4-chateau-apres.mp3"      // zone 4 · le château, Étoile reconstruite
  },
  puzzle: "son-enigme.mp3",   // musique des phases d'énigme (fondu depuis / vers la musique du lieu)
  brainstorm: "son-grand-point.mp3", // musique du grand point avec Flocon (avant le jour 24)
  minigame: "son-mini-jeu.mp3", // musique des mini-jeux de Flocon (fondu depuis / vers la musique du lieu)
  music: null,      // ex. "son-ambiance-noel.mp3"  (boucle, repli)
  finale: null,     // ex. "son-final-magique.mp3"
  sfx: {            // ex. click: "son-click.mp3"  (null = bruitage synthétisé)
    acquire: "son-objet.mp3",            // obtention d'un objet (cadeau du jour, Flocon, récompense)
    solved:  "son-enigme-resolue.mp3",   // énigme résolue
    zone:    "son-zone-decouverte.mp3",  // découverte d'une nouvelle zone (voyage vers la zone suivante)
    voice:   "son-dialogue.mp3",         // babillage très doux pendant qu'une réplique s'écrit (son volume bas est dans le fichier)
    click: null, open: null, magic: null, unlock: null, success: null, soft_error: null, page: null
  },
  // Pendant ces bruitages, la musique baisse (0.3 = 30 % de son volume), puis remonte en douceur.
  duck: { zone: 0.3 }
};
