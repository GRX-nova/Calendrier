/* ==========================================================================
   DIALOGUE — une grande boîte de texte en bas de l'écran ; le personnage qui parle se tient
   debout derrière elle, sur le côté (sprite illustré), sans jamais flotter.
   • Un clic / Espace / Entrée : termine l'écriture, puis passe à la réplique suivante.
   • L'expression de Flocon suit la réplique (voir data/flocon.js) ; celle des autres personnages
     aussi (voir data/characters.js et js/characters.js). Flocon se met à gauche, l'autre
     personnage à droite ; les deux peuvent être à l'écran ensemble (celui qui se tait s'assombrit).
   • Au début du jeu, avant l'arrivée de Flocon, seul le narrateur parle (pas de personnage).
   • Une réplique peut changer de côté : F('content', "…", { side: 'right' }).
   ========================================================================== */
(function () {
  const G = window.Game;
  const { $, h } = G;
  let els = null, current = null, flocon = { expr: null, visible: false }, chr = { key: null, expr: null, visible: false }, sides = { flo: 'left', chr: 'right' }, moodTimer = null;

  function grab() {
    if (els) return els;
    els = {
      root: $('#dialogue'), shield: $('#dlg-shield'), sprite: $('#flocon-sprite'), char: $('#char-sprite'), box: $('#dlg-box'),
      name: $('#dlg-name'), text: $('#dlg-text'), choices: $('#dlg-choices'), skip: $('#dlg-skip'), next: $('#dlg-next')
    };
    return els;
  }

  function spriteSrc(expr) {
    const d = G.data.flocon, name = d.aliases[expr] || expr;
    const file = d.expressions[name];
    if (!file) { console.warn('[Flocon] expression inconnue :', expr, '→ « content » utilisée'); return d.dir + d.expressions.content; }
    return d.dir + file;
  }
  function preload() {
    const d = G.data.flocon;
    Object.values(d.expressions).forEach((f) => { const i = new Image(); i.src = d.dir + f; });
  }

  function setFlocon(expr, listening) {
    const e = grab();
    const name = G.data.flocon.aliases[expr] || expr;
    if (flocon.expr !== name || !flocon.visible) {
      e.sprite.src = spriteSrc(expr);
      e.sprite.alt = 'Flocon (' + name + ')';
      const wasHidden = !flocon.visible;
      flocon.expr = name; flocon.visible = true;
      e.sprite.classList.remove('hidden', 'swap');
      void e.sprite.offsetWidth;
      e.sprite.classList.add(wasHidden ? 'pop' : 'swap');
      setTimeout(() => e.sprite.classList.remove('pop', 'swap'), 600);
    }
    e.sprite.classList.toggle('listening', !!listening);
    // petit mouvement d'humeur
    [...e.sprite.classList].filter((c) => c.startsWith('mood-')).forEach((c) => e.sprite.classList.remove(c));
    if (G.data.flocon.moods.includes(name)) {
      void e.sprite.offsetWidth;
      e.sprite.classList.add('mood-' + name);
      clearTimeout(moodTimer); moodTimer = setTimeout(() => e.sprite.classList.remove('mood-' + name), 1100);
    }
  }
  function hideFlocon() {
    const e = grab();
    flocon.visible = false; flocon.expr = null;
    e.sprite.classList.add('hidden'); e.sprite.classList.remove('pop', 'swap', 'listening');
  }

  /** Affiche (ou change l'expression de) un personnage autre que Flocon. */
  function setChar(id, formKey, expr, listening) {
    const e = grab();
    const sp = G.chars.sprite(id, formKey, expr);
    if (!sp) return null;
    const key = sp.id + '/' + sp.form;
    const newcomer = !chr.visible || chr.key !== key;
    if (newcomer || chr.expr !== sp.expr) {
      e.char.src = sp.src;
      e.char.alt = sp.name + ' (' + sp.label + ')';
      chr = { key, expr: sp.expr, visible: true };
      e.char.classList.remove('hidden', 'swap', 'pop');
      void e.char.offsetWidth;
      e.char.classList.add(newcomer ? 'pop' : 'swap');
      setTimeout(() => e.char.classList.remove('pop', 'swap'), 600);
    }
    e.char.classList.toggle('listening', !!listening);
    return sp;
  }
  function hideChar() {
    const e = grab();
    chr = { key: null, expr: null, visible: false };
    e.char.classList.add('hidden'); e.char.classList.remove('pop', 'swap', 'listening');
  }
  /** Place chaque portrait de son côté (ils ne se chevauchent jamais). */
  function placeSides(speaker, side) {
    const e = grab();
    if (speaker === 'flocon') { sides.flo = side || sides.flo; sides.chr = sides.flo === 'left' ? 'right' : 'left'; }
    else { sides.chr = side || sides.chr; sides.flo = sides.chr === 'left' ? 'right' : 'left'; }
    e.root.classList.toggle('flo-right', sides.flo === 'right');
    e.root.classList.toggle('chr-left', sides.chr === 'left');
    return speaker === 'flocon' ? sides.flo : sides.chr;
  }

  function buildChars(html) {
    const wrap = document.createElement('div'); wrap.innerHTML = html;
    const chars = [];
    (function walk(node) {
      for (const c of Array.from(node.childNodes)) {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const ch of Array.from(c.textContent)) { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; frag.append(s); chars.push(s); }
          c.replaceWith(frag);
        } else walk(c);
      }
    })(wrap);
    return { wrap, chars };
  }

  function openBox() {
    const e = grab();
    e.root.hidden = false;
    document.body.classList.add('dlg-open');
    requestAnimationFrame(() => e.root.classList.add('open'));
  }
  function setSpeaker(line) {
    const e = grab();
    e.box.classList.remove('narrator', 'hero', 'npc', 'flocon', 'char');
    e.name.removeAttribute('style');
    const who = line.who || 'narrator';
    e.box.classList.add(who === 'char' ? 'npc' : who);
    if (who === 'char') e.box.classList.add('char');
    let speakerSide = null, hasSprite = false;
    if (who === 'flocon') {
      speakerSide = placeSides('flocon', line.side);
      e.name.textContent = line.name != null ? line.name : G.data.flocon.name;
      setFlocon(line.expr || 'content', false);
      if (line.jolt) {                                 // jolt: true → sursaut très marqué du sprite
        const sp = e.sprite; sp.classList.remove('fx-choc'); void sp.offsetWidth; sp.classList.add('fx-choc');
        setTimeout(() => sp.classList.remove('fx-choc'), 1400);
      }
      if (chr.visible) e.char.classList.add('listening');
      hasSprite = true;
    } else if (who === 'char') {
      speakerSide = placeSides('char', line.side);
      const sp = setChar(line.char, line.form, line.expr, false);
      const c = G.data.characters[line.char];
      e.name.textContent = line.name != null ? line.name : (c ? c.name : '');
      if (c && c.tint) {
        e.name.style.background = `linear-gradient(${c.tint.bg[0]}, ${c.tint.bg[1]})`;
        e.name.style.color = c.tint.fg; e.name.style.borderColor = c.tint.border;
      }
      if (flocon.visible) e.sprite.classList.add('listening');
      hasSprite = !!sp;
    } else {
      e.name.textContent = who === 'hero' ? G.config.heroName : who === 'npc' ? (line.name || '') : '';
      if (who === 'narrator') { hideFlocon(); hideChar(); }
      else {
        if (flocon.visible) e.sprite.classList.add('listening');
        if (chr.visible) e.char.classList.add('listening');
      }
    }
    e.root.classList.toggle('has-sprite', hasSprite);
    e.root.classList.toggle('name-right', hasSprite && speakerSide === 'right');
    e.name.hidden = !e.name.textContent;
  }

  /** La boîte est basse : si un texte est plus long que la place, on réduit un peu la police (jamais de barre de défilement). */
  function fit() {
    const e = grab(), t = e.text;
    t.style.fontSize = '';
    if (e.root.hidden) return;
    let size = parseFloat(getComputedStyle(t).fontSize), n = 0;
    const min = Math.max(13, size * 0.62);
    while (t.scrollHeight > t.clientHeight + 1 && size > min && n++ < 14) { size = Math.max(min, size * 0.95); t.style.fontSize = size.toFixed(1) + 'px'; }
  }
  window.addEventListener('resize', () => { if (els && !els.root.hidden) fit(); });

  function cleanup() { if (current) { current.cleanup(); current = null; } }

  /** Affiche une réplique ; résout à la fin ('next') ou si on passe le dialogue ('skip'). */
  function say(line, o) {
    o = o || {};
    const e = grab();
    cleanup();
    return G.makeWaiter((done) => {
      openBox();
      setSpeaker(line);
      e.choices.innerHTML = ''; e.choices.hidden = true;
      e.next.classList.remove('show');
      e.skip.hidden = !o.skippable;
      const { wrap, chars } = buildChars(G.rich(line.text));
      e.text.innerHTML = ''; e.text.append(...wrap.childNodes);
      e.root.classList.remove('asking'); fit();
      let i = 0, finished = false, timer = null;
      const fast = G.reduceMotion();
      const tick = () => {
        if (fast) { i = chars.length; }
        if (i < chars.length) {
          chars[i].classList.add('on');
          const ch = chars[i].textContent; i++;
          const slow = ('.!?…').includes(ch) ? 220 : (',;:').includes(ch) ? 110 : 17;
          timer = setTimeout(tick, slow);
        } else finish();
      };
      const finish = () => { clearTimeout(timer); G.audio.voice(false); chars.forEach((c) => c.classList.add('on')); finished = true; e.next.classList.add('show'); };
      const advance = (ev) => {
        if (ev && ev.target && ev.target.closest && ev.target.closest('#dlg-skip')) return;
        if (!finished) { finish(); return; }
        cleanup(); done('next');
      };
      const key = (ev) => {
        if (document.querySelector('#modal-root .modal, #puzzle-panel')) return;
        if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
        if (ev.key === ' ' || ev.key === 'Enter' || ev.key === 'ArrowRight') { ev.preventDefault(); advance(); }
      };
      const onSkip = (ev) => { ev.stopPropagation(); cleanup(); done('skip'); };
      e.shield.addEventListener('click', advance);
      e.box.addEventListener('click', advance);
      e.skip.addEventListener('click', onSkip);
      document.addEventListener('keydown', key);
      current = { cleanup() { clearTimeout(timer); G.audio.voice(false); e.shield.removeEventListener('click', advance); e.box.removeEventListener('click', advance); e.skip.removeEventListener('click', onSkip); document.removeEventListener('keydown', key); } };
      if (!fast) G.audio.voice(true);            // le petit babillage, très doux, pendant que la réplique s'écrit
      tick();
    });
  }

  /** Pose une question à choix dans la bulle ; résout avec l'index choisi. */
  function ask(line, options) {
    const e = grab();
    cleanup();
    return G.makeWaiter((done) => {
      openBox();
      setSpeaker(line);
      e.skip.hidden = true; e.next.classList.remove('show');
      e.text.innerHTML = G.rich(line.text);
      e.choices.innerHTML = ''; e.choices.hidden = false;
      e.root.classList.add('asking');
      options.forEach((label, idx) => e.choices.append(h('button', { class: 'btn choice', onclick: () => { e.choices.hidden = true; done(idx); } }, label)));
      fit();
      current = { cleanup() { e.choices.hidden = true; } };
    });
  }

  function hide() {
    const e = grab();
    cleanup();
    e.root.classList.remove('open');
    e.root.hidden = true;
    document.body.classList.remove('dlg-open');
    e.skip.hidden = true;
    hideFlocon(); hideChar();
    sides = { flo: 'left', chr: 'right' };
    e.root.classList.remove('has-sprite', 'name-right', 'flo-right', 'chr-left', 'asking');
  }
  const isOpen = () => !!(els && !els.root.hidden);

  G.dlg = { say, ask, hide, isOpen, setFlocon, hideFlocon, setChar, hideChar, preload, spriteSrc };
})();
