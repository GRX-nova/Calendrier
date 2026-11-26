/* ==========================================================================
   CONFIG — réglages généraux du jeu.
   C'est LE fichier à ouvrir en premier pour personnaliser l'aventure.
   ========================================================================== */
window.Game = window.Game || {};
Game.data = Game.data || {};

Game.config = {
  title: "Le Royaume de l’Étoile d’Hiver",

  // Calendrier : les journées s'ouvrent à la date réelle (décembre de cette année).
  year: 2026,
  unlockHour: 0,            // heure d'ouverture de chaque journée (0 = minuit)

  // Prénom de l'héroïne : remplace {nom} dans tous les dialogues.
  heroName: "Laura",

  // true  : le jour N ne peut être joué qu'après avoir terminé le jour N-1
  //         (histoire toujours cohérente, rattrapage possible dans l'ordre).
  // false : chaque jour se joue dès qu'il est ouvert par la date.
  sequentialProgress: true,

  // Sauvegarde (localStorage). Changer la clé = repartir d'une sauvegarde vierge.
  saveKey: "royaume-etoile-hiver::laura-2026",   // (nouvelle clé pour la version offerte : les parties de test ne la touchent pas. Ne plus la changer ensuite.)

  // Sel utilisé pour protéger les codes cadeaux (voir tools/generateur-codes.html).
  // Si tu le changes, il faut régénérer data/codes.js.
  codeSalt: "etoile-hiver-2026",

  fragmentsTotal: 24,

  // Taille de référence des illustrations (les positions des lieux sont en pixels de cette taille).
  stageSize: [1670, 941],

  // ==================== MODE DÉVELOPPEUR ====================
  // true  : un petit panneau « DEV » permet de passer les jours à la main, de sauter les codes
  //         et les énigmes, de donner Flocon, de tout réinitialiser… (voir js/dev.js)
  // false : plus aucun outil de test, nulle part dans le jeu.
  // ⚠ POUR LA VERSION FINALE : mettre false (et, pour être tranquille, supprimer js/dev.js
  //   et sa ligne <script> dans index.html).
  dev: false
};
