/* ==========================================================================
   LES PERSONNAGES — Maître Givre, Dame Brume, Nox, Éloi, Mme Cannelle, Vieux Grelot,
   Dame Plume, Ancienne Aurore, le Veilleur des Neiges.

   Chaque personnage a une ou deux FORMES (Maître Givre : normale / spectrale ;
   le Veilleur des Neiges : ombre à capuche / homme aux cheveux blancs), et chaque forme
   a ses expressions, une image WebP transparente (720 × 660 px) par expression :
       assets/characters/<forme>/<expression>.webp

   Dans un dialogue (data/days.js) :  Givre('mefiance', "Texte"),  Givre.spectral('peur', "Texte"),
   Veilleur.ombre('mystere', "Texte"),  Nox('sarcasme', "Texte") …  (voir js/characters.js)

   Pour AJOUTER une expression : déposer l'image dans le dossier de la forme, puis ajouter une ligne
   « identifiant: "Libellé" » dans `expr` (l'identifiant = nom du fichier sans .webp, sans accent).
   `default` = l'expression utilisée quand on n'en précise pas (ou si on se trompe de nom).
   `tint` = couleurs de la petite plaque où s'affiche le nom.
   ========================================================================== */
Game.data.characters = {

  givre: {
    name: "Maître Givre", aliases: ["Givre", "Maitre Givre"], form: "normal",
    tint: { bg: ["#5b86d6", "#2f4f9b"], fg: "#ffffff", border: "#d7e5ff" },
    forms: {
      normal: { label: "forme normale", dir: "perso-givre-", default: "reserve",
        expr: { mefiance: "Méfiance", reserve: "Réserve", nervosite: "Nervosité", malaise: "Malaise", nostalgie: "Nostalgie", fierte: "Fierté", irritation: "Irritation", peur: "Peur", culpabilite: "Culpabilité", honte: "Honte", soulagement: "Soulagement", confiance: "Confiance", espoir: "Espoir" } },
      spectral: { label: "forme spectrale", dir: "perso-givre_spectral-", default: "reserve",
        expr: { mefiance: "Méfiance", reserve: "Réserve", nervosite: "Nervosité", malaise: "Malaise", nostalgie: "Nostalgie", fierte: "Fierté", irritation: "Irritation", peur: "Peur", culpabilite: "Culpabilité", honte: "Honte", soulagement: "Soulagement", confiance: "Confiance", espoir: "Espoir" } }
    }
  },

  brume: {
    name: "Dame Brume", aliases: ["Brume"], form: "normal",
    tint: { bg: ["#7a5fb5", "#4a3380"], fg: "#f3eaff", border: "#cdbcf0" },
    forms: {
      normal: { label: "", dir: "perso-brume-", default: "mystere",
        expr: { mystere: "Mystère", amusement: "Amusement", curiosite: "Curiosité", mefiance: "Méfiance", agacement: "Agacement", respect: "Respect", gravite: "Gravité", tristesse: "Tristesse", douleur: "Douleur", confiance: "Confiance", sagesse: "Sagesse", espoir: "Espoir" } }
    }
  },

  nox: {
    name: "Nox", aliases: [], form: "normal",
    tint: { bg: ["#3d3a52", "#1c1a2b"], fg: "#f2e7ff", border: "#8f7ac9" },
    forms: {
      normal: { label: "", dir: "perso-nox-", default: "sarcasme",
        expr: { amusement: "Amusement", curiosite: "Curiosité", sarcasme: "Sarcasme", satisfaction: "Satisfaction", ruse: "Ruse", arrogance: "Arrogance", irritation: "Irritation", mefiance: "Méfiance", malaise: "Malaise", surprise: "Surprise", conflit_interieur: "Conflit intérieur", loyaute: "Loyauté", soulagement: "Soulagement" } }
    }
  },

  eloi: {
    name: "Éloi", aliases: ["Eloi"], form: "normal",
    tint: { bg: ["#bfe0ff", "#7fb2e6"], fg: "#17365c", border: "#e9f6ff" },
    forms: {
      normal: { label: "", dir: "perso-eloi-", default: "solennite",
        expr: { solennite: "Solennité", mefiance: "Méfiance", irritation: "Irritation", inquietude: "Inquiétude", surprise: "Surprise", respect: "Respect", honte: "Honte", culpabilite: "Culpabilité", tristesse: "Tristesse", regret: "Regret", courage: "Courage", soulagement: "Soulagement", serenite: "Sérénité" } }
    }
  },

  cannelle: {
    name: "Mme Cannelle", aliases: ["Madame Cannelle", "Cannelle"], form: "normal",
    tint: { bg: ["#d4564a", "#9a2e26"], fg: "#fff1d6", border: "#ffd9a0" },
    forms: {
      normal: { label: "", dir: "perso-cannelle-", default: "chaleur",
        expr: { chaleur: "Chaleur", joie: "Joie", accueil: "Accueil", curiosite: "Curiosité", amusement: "Amusement", inquietude: "Inquiétude", nostalgie: "Nostalgie", surprise: "Surprise", indignation: "Indignation", tristesse: "Tristesse", generosite: "Générosité", fierte: "Fierté", confiance: "Confiance" } }
    }
  },

  grelot: {
    name: "Vieux Grelot", aliases: ["Le Vieux Grelot", "Grelot"], form: "normal",
    tint: { bg: ["#a83a3a", "#6e1f22"], fg: "#ffe9c4", border: "#e8b86a" },
    forms: {
      normal: { label: "", dir: "perso-grelot-", default: "bourru",
        expr: { bourru: "Bourru", mefiance: "Méfiance", impatience: "Impatience", agacement: "Agacement", perfectionnisme: "Perfectionnisme", fierte: "Fierté", nostalgie: "Nostalgie", tension: "Tension", regret: "Regret", tendresse: "Tendresse", determination: "Détermination", espoir: "Espoir" } }
    }
  },

  plume: {
    name: "Dame Plume", aliases: ["Plume"], form: "normal",
    tint: { bg: ["#8a5db8", "#55337f"], fg: "#fff3d6", border: "#e6c768" },
    forms: {
      normal: { label: "", dir: "perso-plume-", default: "calme",
        expr: { calme: "Calme", reserve: "Réserve", curiosite: "Curiosité", rigueur: "Rigueur", exasperation: "Exaspération", interet: "Intérêt", respect: "Respect", choc: "Choc", colere_froide: "Colère froide", culpabilite: "Culpabilité", tristesse: "Tristesse", determination: "Détermination", soulagement: "Soulagement" } }
    }
  },

  aurore: {
    name: "Ancienne Aurore", aliases: ["L'Ancienne Aurore", "Aurore"], form: "normal",
    tint: { bg: ["#b9a2e0", "#7d63b3"], fg: "#2e1f55", border: "#f1e0a0" },
    forms: {
      normal: { label: "", dir: "perso-aurore-", default: "douceur",
        expr: { douceur: "Douceur", sagesse: "Sagesse", tendresse: "Tendresse", curiosite: "Curiosité", melancolie: "Mélancolie", nostalgie: "Nostalgie", tristesse: "Tristesse", inquietude: "Inquiétude", espoir: "Espoir", gravite: "Gravité", soulagement: "Soulagement", emotion: "Émotion", fierte: "Fierté", paix: "Paix" } }
    }
  },

  veilleur: {
    name: "Le Veilleur des Neiges", aliases: ["Veilleur des Neiges", "Veilleur"], form: "ombre",
    tint: { bg: ["#26385f", "#0f1a33"], fg: "#cfe6ff", border: "#7fb4ff" },
    forms: {
      ombre: { label: "l'ombre à capuche", dir: "perso-veilleur_ombre-", default: "mystere",
        expr: { mystere: "Mystère", solitude: "Solitude", reserve: "Réserve", determination: "Détermination", mefiance: "Méfiance", inquietude: "Inquiétude", tristesse: "Tristesse", deception: "Déception", espoir: "Espoir", gravite: "Gravité", culpabilite: "Culpabilité", sincerite: "Sincérité", vulnerabilite: "Vulnérabilité", soulagement: "Soulagement", gratitude: "Gratitude", paix: "Paix" } },
      homme: { label: "l'homme aux cheveux blancs", dir: "perso-veilleur_homme-", default: "gravite",
        expr: { mystere: "Mystère", solitude: "Solitude", reserve: "Réserve", determination: "Détermination", mefiance: "Méfiance", inquietude: "Inquiétude", tristesse: "Tristesse", deception: "Déception", espoir: "Espoir", gravite: "Gravité", culpabilite: "Culpabilité", sincerite: "Sincérité", vulnerabilite: "Vulnérabilité", soulagement: "Soulagement", gratitude: "Gratitude", paix: "Paix" } }
    }
  }

};