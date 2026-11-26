/* ==========================================================================
   FLOCON — catalogue des expressions.
   Chaque expression = une image WebP transparente (flocon-<nom>.webp).
   Pour AJOUTER une expression : déposer l'image (WebP ou PNG) dans flocon- (format conseillé :
   720 × 660 px, fond transparent, Flocon posé en bas de l'image) puis l'ajouter ci-dessous.
   Dans les dialogues, on l'utilise ensuite par son nom : F('nouvelle_expression', "texte").
   ========================================================================== */
Game.data.flocon = {
  name: "Flocon",
  dir: "flocon-",

  expressions: {
    // Planche 1 — émotions
    content: "content.webp", reflexion: "reflexion.webp", triste: "triste.webp", enerve: "enerve.webp", peur: "peur.webp",
    rire: "rire.webp", emerveille: "emerveille.webp", surpris: "surpris.webp", determine: "determine.webp", decu: "decu.webp",
    serein: "serein.webp", malicieux: "malicieux.webp", fier: "fier.webp", impatient: "impatient.webp", amoureux: "amoureux.webp",
    // Planche 2 — actions
    cherche: "cherche.webp", conquete: "conquete.webp", explore: "explore.webp", reflechit: "reflechit.webp", decouvre: "decouvre.webp",
    escalade: "escalade.webp", victoire: "victoire.webp", cachette: "cachette.webp", courage: "courage.webp", echec: "echec.webp",
    repose: "repose.webp", attend: "attend.webp", repare: "repare.webp", guide: "guide.webp", celebration: "celebration.webp"
  },

  // Synonymes pratiques (accents, variantes…)
  aliases: {
    "émerveillé": "emerveille", "émerveille": "emerveille", "énervé": "enerve", "déterminé": "determine", "déçu": "decu",
    "réflexion": "reflexion", "réfléchit": "reflechit", "découvre": "decouvre", "conquête": "conquete", "échec": "echec",
    "célébration": "celebration", "répare": "repare", "joie": "content", "colere": "enerve", "tristesse": "triste"
  },

  // Petit mouvement associé à certaines expressions (voir style.css : .mood-<nom>)
  moods: ["rire", "peur", "enerve", "celebration", "victoire", "surpris", "impatient"]
};
