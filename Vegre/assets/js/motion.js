/* Veyra landing — motion layer: staggered reveals, split-word headlines, scroll-linked scenes and
   spring interactions, on Motion (vendor/motion.js, the framework-free build of Framer Motion).
   Timing follows Apple's product-page stagger: items 0.15 s apart, opacity over 0.9 s, a 30 px rise
   over 0.7 s, starting when a group's top reaches 70% of the viewport. */
(() => {
  'use strict';
  const root = document.documentElement;
  const M = window.Motion;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // No Motion or reduced motion: drop the `js:` pre-reveal state so everything shows as-is.
  if (!M || reduced) { root.classList.add('no-motion'); return; }

  const { animate, inView, scroll, stagger, hover, press } = M;
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const EASE = [0.22, 1, 0.36, 1];
  const STEP = 0.15;
  const SPRING = { type: 'spring', stiffness: 320, damping: 24 };

  /* split a heading into word spans; a gradient-clipped span stays whole so its gradient survives */
  const split = el => {
    const words = [];
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement('span');
            w.className = 'tw:inline-block tw:will-change-[transform,opacity,filter]';
            w.textContent = part;
            frag.append(w);
            words.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.classList.contains('grad')) {
            n.classList.add('tw:inline-block', 'tw:will-change-[transform,opacity,filter]');
            words.push(n);
          } else walk(n);
        }
      });
    };
    walk(el);
    return words;
  };

  const settle = els => els.forEach(e => { e.style.filter = ''; e.style.willChange = 'auto'; });

  /* a heading's words rise, fade in and sharpen one after another */
  const revealWords = (el, delay) => {
    const words = split(el);
    animate(el, { opacity: 1 }, { duration: 0.01, delay });
    animate(words,
      { opacity: [0, 1], y: ['0.42em', '0em'], filter: ['blur(8px)', 'blur(0px)'] },
      { duration: 0.9, ease: EASE, delay: stagger(0.055, { startDelay: delay }) }
    ).then(() => settle(words));
  };

  /* one group: its items in document order, the group itself first when it is also an item */
  const run = group => {
    const items = group.matches('[data-stagger-item]') ? [group] : [];
    items.push(...$$('[data-stagger-item]', group));
    items.forEach((el, i) => {
      const delay = i * STEP;
      if (el.hasAttribute('data-split')) { revealWords(el, delay); return; }
      animate(el, { opacity: [0, 1] }, { duration: 0.9, delay, ease: 'easeOut' });
      animate(el, { y: [30, 0] }, { duration: 0.7, delay, ease: EASE });
    });
  };

  $$('[data-stagger]').forEach(group => {
    if (group.dataset.stagger === 'load') run(group);
    else inView(group, () => run(group), { margin: '0px 0px -30% 0px' });
  });

  /* scroll-linked: the statement lights up word by word as it passes through the viewport */
  $$('[data-scrub]').forEach(el => {
    const words = split(el);
    const n = words.length;
    words.forEach(w => { w.style.opacity = 0.18; });
    scroll(progress => {
      words.forEach((w, i) => {
        const t = Math.min(Math.max(progress * (n + 2) - i, 0), 1);
        w.style.opacity = (0.18 + 0.82 * t).toFixed(3);
      });
    }, { target: el, offset: ['start 0.85', 'end 0.45'] });
  });

  /* scroll-linked: the hero devices separate in depth as the hero scrolls away */
  const hero = document.querySelector('.hero');
  const mac = document.querySelector('.stage__mac');
  const phone = document.querySelector('.stage__phone');
  if (hero && mac) scroll(animate(mac, { y: [0, -40] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
  if (hero && phone) scroll(animate(phone, { y: [0, -110] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });

  /* scroll-linked: a wide scene grows into place as it enters */
  $$('[data-scroll-scale]').forEach(el => {
    scroll(animate(el, { scale: [0.92, 1] }, { ease: 'linear' }), { target: el, offset: ['start end', 'start 0.4'] });
  });

  /* spring interactions: cards lift on hover, buttons give under a press */
  if (matchMedia('(hover: hover)').matches) {
    hover('[data-lift]', el => {
      animate(el, { '--lift': -6, '--lift-s': 1.012 }, SPRING);
      return () => animate(el, { '--lift': 0, '--lift-s': 1 }, SPRING);
    });
  }
  press('[data-press]', el => {
    animate(el, { '--press': 0.96 }, { type: 'spring', stiffness: 600, damping: 30 });
    return () => animate(el, { '--press': 1 }, { type: 'spring', stiffness: 500, damping: 18 });
  });
})();
