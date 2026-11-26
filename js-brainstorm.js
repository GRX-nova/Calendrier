/* ==========================================================================
   LE GRAND POINT AVEC FLOCON (data/brainstorm.js)
   Entre le jour 23 et le jour 24 : Flocon brille en bas de l'écran ; on le touche pour lancer
   une vraie discussion dans la boîte de dialogue : l'aventurière et Flocon reprennent l'histoire
   et s'entraident sur ce que chacun a mal compris.
   Le jour 24 ne s'ouvre qu'une fois cette discussion terminée (S.brainstorm).
   ========================================================================== */
(function () {
  const G = window.Game;
  const D = () => G.data.brainstorm;
  const F = ([expr, text]) => ({ who: 'flocon', expr, text });
  const Me = (text) => ({ who: 'hero', text });

  const done = () => !!G.store.get().brainstorm;
  const needed = () => !!D() && G.store.isDone(23) && !G.store.isDone(24) && !done();

  let running = false;
  const say = async (line) => { await G.dlg.say(line, { skippable: false }); };
  const sayAll = async (lines) => { for (const l of lines || []) await say(F(l)); };

  async function explain(x) {
    let opts = x.options.slice();
    let q = F(x.q);
    for (;;) {
      const i = await G.dlg.ask(q, opts.map((o) => o.t));
      const o = opts[i];
      await say(Me(o.t));
      if (o.ok) { G.audio.sfx('success'); await sayAll(x.good); return; }
      G.audio.sfx('soft_error');
      await say(F(o.reply));
      opts = opts.filter((y) => y !== o);
      q = F(['reflechit', "Alors… d’après toi ?"]);
    }
  }

  async function doubt(line, asked) {
    const pool = D().doubts.filter((d) => !asked.has(d));
    if (!pool.length) return;
    const i = await G.dlg.ask(F(line), pool.map((d) => d.t));
    const d = pool[i]; asked.add(d);
    G.audio.sfx('click');
    await say(Me(d.t));
    await sayAll(d.a);
  }

  async function open() {
    if (running || !needed() || G.chapter.isActive() || G.panels.isOpen()) return;
    running = true;
    document.body.classList.add('bs-talking');
    const asked = new Set();
    try {
      G.audio.brainstorm(true);                                     // la musique du grand point
      await G.scene.showPlace(D().scene || 'lieu-reflexion.webp');   // les lieux déjà visités, en souvenirs
      for (const step of D().script) {
        if (step.flocon) await sayAll(step.flocon);
        else if (step.explain) await explain(step.explain);
        else if (step.doubt) await doubt(step.doubt, asked);
      }
      G.store.get().brainstorm = { at: G.time.iso() };
      G.store.save();
      G.audio.sfx('magic');
    } catch (e) {
      if (!(e instanceof G.Cancel)) console.error(e);
    } finally {
      G.dlg.hide();
      G.audio.brainstorm(false);
      G.scene.leavePlace();
      document.body.classList.remove('bs-talking');
      running = false;
      G.hud.refresh();
      if (G.scene && G.scene.renderSpots) G.scene.renderSpots();
    }
  }

  G.brainstorm = { needed, done, open, isRunning: () => running, blockedLine: () => D() && D().blocked };
})();
