/* ==========================================================================
   LES PHRASES DE FLOCON — ce qu'il dit tout seul, depuis son coin de l'écran
   (et dans l'inventaire). Chaque phrase = { t: texte, e: expression }.

   Elles sont rangées par situation :
     idle     : quand on prend son temps dans un lieu (Noël, magie, pensées spontanées)
     map      : quand on ouvre la carte du royaume (l'aventurier autoproclamé)
     bag      : quand on fouille dans le sac (curiosité et maladresse)
     danger   : dans les zones dangereuses (peur et courage — voir `danger: true` dans data/zones.js)
     progress : un peu après un chapitre terminé (complicité ; les autres phrases de ce genre sont dites à la fin de chaque jour : data/days.js → dayClosings)
   Pour en ajouter : une ligne de plus dans la bonne liste. Les expressions sont celles de data/flocon.js.
   {nom} = le prénom de l'héroïne (sauf dans « bag », affiché sans mise en forme).
   ========================================================================== */
(function () {
  const p = (t, e) => ({ t, e });

  Game.data.phrases = {

    /* ---------- Attente / inactivité : Noël et la magie (1–10) + pensées spontanées (41–49) ---------- */
    idle: [
      p("Tu crois que Noël peut sentir si quelqu'un n'a pas encore décoré son sapin ?", 'reflexion'),
      p("Je me demande combien de flocons tombent chaque année… Il faudrait que je les compte !", 'determine'),
      p("Ah, l'odeur du pain d'épices ! Enfin… je crois que c'est du pain d'épices.", 'serein'),
      p("Est-ce qu'un bonhomme de neige peut avoir un Noël préféré ? Parce que moi, je crois que c'est celui-ci !", 'content'),
      p("La magie de Noël est partout ! Enfin… sauf peut-être dans cette vieille chaussette.", 'malicieux'),
      p("Tu crois que les étoiles font des vœux quand personne ne les regarde ?", 'reflexion'),
      p("J'aimerais bien rencontrer le Père Noël un jour. J'aurais tellement de questions !", 'emerveille'),
      p("Pourquoi les humains mettent-ils des guirlandes partout ? …Bon, c'est très joli, alors je valide.", 'fier'),
      p("Si je pouvais offrir un cadeau à tout le royaume, je donnerais une montagne de chocolat chaud !", 'rire'),
      p("Je crois que Noël est la meilleure invention de l'univers. Qui a inventé Noël, d'ailleurs ?", 'reflechit'),
      p("Tu crois que les poissons sous la glace savent que c'est Noël ?", 'reflexion'),
      p("Si je mange une carotte, est-ce que mon nez devient plus puissant ?", 'reflechit'),
      p("Je me demande si les nuages sont faits de neige qui n'a pas encore décidé de tomber.", 'serein'),
      p("J'aimerais bien savoir pourquoi les humains aiment tant les chaussettes. C'est un mystère fascinant.", 'cherche'),
      p("Si je ferme les yeux très fort, est-ce que je peux rêver en étant réveillé ?", 'serein'),
      p("Je viens de penser à quelque chose de très important… J'ai oublié quoi.", 'surpris'),
      p("Tu crois que les sapins discutent entre eux quand personne ne les regarde ?", 'malicieux'),
      p("J'espère qu'on trouvera du chocolat chaud après cette aventure. C'est une question de survie.", 'impatient'),
      p("C'est étrange… Je crois que je commence à aimer les aventures encore plus que les décorations de Noël.", 'emerveille')
    ],

    /* ---------- Carte du royaume : l'aventurier autoproclamé (11–20) ---------- */
    map: [
      p("Une nouvelle journée d'exploration ! Je suis prêt. Enfin, presque.", 'explore'),
      p("J'ai toujours rêvé de découvrir un endroit que personne n'a jamais visité… même pas moi !", 'decouvre'),
      p("Tu penses que mon nez me donne un air plus héroïque ?", 'courage'),
      p("Un grand aventurier doit toujours garder son calme. AAAAAH ! …Pardon, un petit bruit.", 'peur'),
      p("Je suis sûr que cette carte est facile à lire. Pourquoi elle est à l'envers ?", 'guide'),
      p("Je vais noter ça dans mon journal d'aventurier. Quelqu'un devra raconter mes exploits !", 'fier'),
      p("Tu crois que je pourrais avoir une statue un jour ? Une toute petite, peut-être.", 'conquete'),
      p("Je n'ai jamais été perdu ! J'ai simplement exploré une direction inattendue.", 'malicieux'),
      p("Une mission dangereuse ? Parfait ! …Elle est vraiment dangereuse ?", 'determine'),
      p("Je me demande si les grands aventuriers ont toujours froid aux pieds.", 'reflexion')
    ],

    /* ---------- Inventaire : curiosité et maladresse (21–30) ---------- */
    bag: [
      p("Oh ! Qu'est-ce que c'est ? Et ça ? Et… oh, j'ai oublié ce que je cherchais.", 'cherche'),
      p("Je me demande ce qu'il y a derrière cette montagne. Et derrière celle-là. Et derrière…", 'explore'),
      p("Est-ce que les stalactites poussent plus vite quand on les regarde ?", 'reflechit'),
      p("J'ai entendu un bruit bizarre. Tu l'as entendu aussi ? Dis-moi que tu l'as entendu.", 'peur'),
      p("Oups… Je crois que j'ai touché quelque chose. C'était important ?", 'surpris'),
      p("Pourquoi les portes sont-elles toujours si grandes ? Elles pourraient penser aux petits bonhommes de neige !", 'impatient'),
      p("Je me demande si je peux grimper là-dessus. …Oui. Oui, je peux.", 'escalade'),
      p("J'avais une idée géniale il y a deux secondes. Elle a dû glisser dans la neige.", 'decu'),
      p("Ne bouge pas ! Je vais examiner ce mystérieux objet. Avec mes yeux. De très près.", 'cherche'),
      p("Est-ce que tu crois qu'un bonhomme de neige peut avoir le vertige ? Je demande pour un ami.", 'cachette')
    ],

    /* ---------- Zones dangereuses : peur et courage (31–40) ---------- */
    danger: [
      p("Je n'ai pas peur du tout ! Je vérifie simplement si tu es toujours derrière moi.", 'peur'),
      p("Ce tunnel est très sombre… Heureusement, je suis un aventurier courageux. Très courageux. Très… près de toi.", 'cachette'),
      p("Si quelque chose surgit, je ferai face au danger ! Après avoir réfléchi à une stratégie.", 'courage'),
      p("Tu crois que les fantômes ont froid ? Ce serait vraiment triste pour eux.", 'triste'),
      p("Je suis sûr que ce bruit n'était rien. Probablement un monstre minuscule.", 'peur'),
      p("Bon… je vais peut-être rester ici quelques secondes. Pour surveiller les arrières.", 'cachette'),
      p("Le courage, c'est ne pas avoir peur… ou avancer même quand on a peur. Je préfère la deuxième définition.", 'determine'),
      p("Je protégerai le royaume ! Même si je dois… demander un peu d'aide.", 'courage'),
      p("Ce n'est pas la peur qui me fait trembler. C'est le froid. Et peut-être un peu la peur.", 'peur'),
      p("Un grand aventurier ne recule jamais ! Sauf pour prendre un peu d'élan.", 'determine')
    ],

    /* ---------- Après un chapitre : moments de progression, plus chaleureux ---------- */
    progress: [
      p("Je ne sais pas ce qui nous attend demain… mais je suis vraiment content de vivre cette aventure avec toi.", 'amoureux'),
      p("Tu sais, {nom}… Je crois que je n'aurais pas pu rêver d'une meilleure partenaire d'aventure. Et pourtant, je suis un expert en rêves grandioses !", 'amoureux'),
      p("Tu sais ce qui est mieux que Noël ? Noël avec une amie comme toi !", 'content'),
      p("Je suis fier de toi, {nom}. Et je ne dis pas ça juste parce que tu portes notre équipe depuis le début !", 'celebration'),
      p("Peu importe ce qui nous attend, je suis heureux d'être ici avec toi. C'est peut-être ça, le plus beau cadeau de cette aventure.", 'amoureux')
    ]
  };
})();
