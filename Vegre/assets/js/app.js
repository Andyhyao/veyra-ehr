/* Veyra landing — smooth scrolling, header state, menus, reveals, counters, back to top */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* smooth scrolling ------------------------------------------------ */
  // Lenis eases wheel, touch and in-page anchor scrolls over the native scroll position, so scroll
  // events, the sticky header and Motion's scroll-linked effects keep working. Anchors land below the
  // fixed header through the CSS scroll-padding-top, which Lenis and native scrolling both honour;
  // reduced motion keeps plain native scrolling.
  const lenis = !reduced && window.Lenis
    ? new window.Lenis({ autoRaf: true, lerp: 0.09, anchors: true })
    : null;
  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  /* sticky header -------------------------------------------------- */
  const hdr = $('#hdr');
  const onScroll = () => hdr.classList.toggle('is-stuck', scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* desktop dropdowns ---------------------------------------------- */
  const items = $$('.nav__item.has-menu');
  const closeAll = except => items.forEach(it => {
    if (it === except) return;
    it.classList.remove('is-open');
    $('.nav__link', it).setAttribute('aria-expanded', 'false');
    $('.menu', it).hidden = true;
  });

  // the highlight springs between items under the cursor or focus; plain hover backgrounds without Motion
  const M = !reduced && window.Motion;
  const HL_SPRING = { type: 'spring', stiffness: 520, damping: 40, mass: 0.8 };

  items.forEach(it => {
    const btn = $('.nav__link', it), menu = $('.menu', it);
    let closeTimer = 0;
    const open = state => {
      clearTimeout(closeTimer);
      it.classList.toggle('is-open', state);
      btn.setAttribute('aria-expanded', String(state));
      menu.hidden = !state;
      if (state) closeAll(it);
      else if (hl) { hl.style.opacity = 0; placed = false; }
    };
    btn.addEventListener('click', e => { e.stopPropagation(); open(menu.hidden); });
    // open on hover, and close only after a short grace period so a diagonal path to a card
    // that briefly leaves the item does not snap the menu shut
    it.addEventListener('mouseenter', () => { if (innerWidth > 980) open(true); });
    it.addEventListener('mouseleave', () => {
      if (innerWidth > 980) closeTimer = setTimeout(() => open(false), 220);
    });
    it.addEventListener('focusout', e => {
      if (!it.contains(e.relatedTarget)) open(false);
    });

    let hl = null, placed = false;
    if (M) {
      hl = document.createElement('span');
      hl.className = 'menu__hl';
      hl.setAttribute('aria-hidden', 'true');
      menu.prepend(hl);
      menu.classList.add('has-hl');
      const to = el => {
        const box = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
        if (!placed) {           // first item: appear in place rather than fly in from the corner
          M.animate(hl, box, { duration: 0 });
          M.animate(hl, { opacity: 1 }, { duration: 0.18 });
          placed = true;
        } else M.animate(hl, { ...box, opacity: 1 }, HL_SPRING);
      };
      const links = $$('a', menu);
      links.forEach(a => {
        a.addEventListener('pointerenter', () => to(a));
        a.addEventListener('focus', () => to(a));
      });
      menu.addEventListener('pointerleave', () => { M.animate(hl, { opacity: 0 }, { duration: 0.18 }); placed = false; });
    }
  });
  document.addEventListener('click', () => closeAll(null));
  addEventListener('keydown', e => e.key === 'Escape' && closeAll(null));

  /* mobile menu ---------------------------------------------------- */
  const burger = $('#burger'), mobile = $('#mobile');
  burger.addEventListener('click', () => {
    const open = mobile.hidden;
    mobile.hidden = !open;
    hdr.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', mobile).forEach(a => a.addEventListener('click', () => {
    mobile.hidden = true;
    hdr.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* scroll reveals -------------------------------------------------- */
  const reveals = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const sibs = [...entry.target.parentElement.children].filter(n => n.classList.contains('reveal'));
        entry.target.style.transitionDelay = `${Math.min(sibs.indexOf(entry.target), 4) * 60}ms`;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  }

  /* pointer parallax — layers drift against the pointer -------------- */
  // layers: [element, x factor, y factor]; nearer layers move further
  const drift = (area, layers) => {
    layers = layers.filter(([el]) => el);
    if (!area || !layers.length || reduced || !matchMedia('(pointer: fine)').matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const frame = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach(([el, fx, fy]) => {
        el.style.translate = `${(cx * fx).toFixed(2)}px ${(cy * fy).toFixed(2)}px`;
      });
      raf = (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002)
        ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
    area.addEventListener('pointermove', e => {
      const r = area.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      kick();
    });
    area.addEventListener('pointerleave', () => { tx = ty = 0; kick(); });
  };
  drift($('.hero'), [[$('.floats'), 16, 11], [$('.stage__phone'), -12, -8], [$('.stage__mac'), 5, 4]]);

  /* animated counters ----------------------------------------------- */
  const fmt = n => n.toLocaleString('en-US');
  const run = el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = fmt(target) + suffix; return; }
    const dur = 1500, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => co.observe(el));
  } else counters.forEach(run);

  /* demo form ------------------------------------------------------- */
  const form = $('.cta__form');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('input', form), note = $('[data-note]', form);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    note.textContent = ok
      ? `Thanks — we'll be in touch at ${input.value.trim()} within one business day.`
      : 'Please enter a valid work email address.';
    note.style.color = ok ? 'var(--green)' : '#DC2626';
    if (ok) form.reset();
  });

  /* section 02 record panel — demo data, swapped on click ------------- */
  const recordRows = $('#record-rows');
  if (recordRows) {
    const RECORDS = {
      history: [
        ['Apr 28, 2026 \u00b7 Routine follow-up', 'Blood pressure stable. Continue current plan.'],
        ['Mar 12, 2026 \u00b7 Annual exam', 'Labs reviewed. No concerns noted.'],
        ['Jan 18, 2026 \u00b7 Blood pressure check', 'Within target range.']
      ],
      labs: [
        ['Apr 26, 2026 \u00b7 Lipid panel', 'LDL 98 mg/dL \u00b7 within reference range'],
        ['Apr 26, 2026 \u00b7 HbA1c', '5.4% \u00b7 within reference range'],
        ['Feb 02, 2026 \u00b7 Complete blood count', 'All values within reference range']
      ],
      meds: [
        ['Lisinopril 10 mg', 'Once daily \u00b7 refill due May 12'],
        ['Atorvastatin 20 mg', 'Once daily \u00b7 2 refills remaining'],
        ['Metformin 500 mg', 'Twice daily \u00b7 started Mar 2026']
      ]
    };

    // textContent only: demo strings are never interpolated as HTML
    const draw = key => {
      recordRows.textContent = '';
      (RECORDS[key] || []).forEach(([title, meta]) => {
        const li = document.createElement('li');
        li.className = 'record-row';
        const b = document.createElement('b');
        b.textContent = title;
        const span = document.createElement('span');
        span.textContent = meta;
        li.append(b, span);
        recordRows.append(li);
      });
    };

    $$('.record-tab').forEach(btn => btn.addEventListener('click', () => {
      const key = btn.dataset.recordTab;
      if (!RECORDS[key] || btn.classList.contains('is-on')) return;
      $$('.record-tab').forEach(other => {
        const on = other === btn;
        other.classList.toggle('is-on', on);
        other.setAttribute('aria-pressed', String(on));
      });
      draw(key);
    }));
    // menu links such as e-Prescribing open the matching record view on the way down
    $$('[data-record-open]').forEach(a => a.addEventListener('click', () => {
      const btn = $(`.record-tab[data-record-tab="${a.dataset.recordOpen}"]`);
      if (btn) btn.click();
    }));
  }

  /* section 03 platform — sidebar menus switch the working view ------- */
  const platNav = $('.plat-nav');
  if (platNav) {
    const tabs = $$('.plat-nav__item', platNav);
    const show = (tab, moveFocus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (moveFocus) tab.focus();
    };
    tabs.forEach(t => t.addEventListener('click', () => show(t, false)));
    // menu links such as Scheduling and Analytics open their screen on the way down
    $$('[data-plat-tab]').forEach(a => a.addEventListener('click', () => {
      const tab = $(`#plat-tab-${a.dataset.platTab}`);
      if (tab) show(tab, false);
    }));
    // roving tab stop: arrows move between menus, Home/End jump to the ends
    platNav.addEventListener('keydown', e => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const next = {
        ArrowDown: i + 1, ArrowRight: i + 1,
        ArrowUp: i - 1, ArrowLeft: i - 1,
        Home: 0, End: tabs.length - 1
      }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      show(tabs[(next + tabs.length) % tabs.length], true);
    });
  }

  /* rendered screen loops (hero devices, section 08): each plays only while on screen ---- */
  const loops = $$('.stage__screen, .bx__loop');
  if (loops.length && !reduced) {
    const play = v => { const p = v.play(); if (p) p.catch(() => {}); };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? play(e.target) : e.target.pause())), { threshold: .25 });
      loops.forEach(v => io.observe(v));
    } else loops.forEach(play);
  }

  /* section 08 "Everything in context": cards stage in, then a demo pointer tours them -- */
  const scene = $('.bx__scene');
  if (scene && !reduced && 'IntersectionObserver' in window) {
    scene.classList.add('is-staged');

    const cursor = $('.bx__cursor', scene);
    const chips = $$('.bx__chip', scene);
    // where the pointer rests, in order; each stop shows that card's hover state
    const stops = [chips[0], chips[1], chips[5], $('.bx__log', scene), $('.bx__who', scene)].filter(Boolean);
    const wide = matchMedia('(min-width: 681px)');
    let i = 0, timers = [], running = false, userHere = false;

    const clear = () => { timers.forEach(clearTimeout); timers = []; stops.forEach(el => el.classList.remove('is-hover')); };
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const place = (x, y) => { cursor.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; };
    const step = () => {
      const el = stops[i % stops.length], s = scene.getBoundingClientRect(), r = el.getBoundingClientRect();
      place(r.left - s.left + r.width * 0.6, r.top - s.top + r.height * 0.55);
      later(() => el.classList.add('is-hover'), 900);
      later(() => { el.classList.remove('is-hover'); i += 1; step(); }, 2500);
    };
    const start = () => {
      if (running || userHere || !wide.matches || !cursor) return;
      running = true;
      const s = scene.getBoundingClientRect();
      cursor.style.transition = 'none';
      place(s.width * 0.5, s.height * 0.9);
      void cursor.offsetWidth;
      cursor.style.transition = '';
      cursor.classList.add('is-on');
      later(step, 400);
    };
    const stop = () => { running = false; clear(); if (cursor) cursor.classList.remove('is-on'); };

    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { scene.classList.add('is-in'); later(start, 1200); }
      else stop();
    }, { threshold: .3 }).observe(scene);

    // a real mouse over the card takes over from the demo pointer
    scene.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { userHere = true; stop(); } });
    scene.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { userHere = false; later(start, 800); } });
    wide.addEventListener('change', () => (wide.matches ? start() : stop()));
  }

  /* back to top ------------------------------------------------------ */
  // shows once the first screen is behind you; its ring fills with how far down the page you are
  const totop = $('[data-totop]');
  if (totop) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      totop.classList.toggle('is-on', scrollY > innerHeight * 0.9);
      totop.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1).toFixed(4) : 0);
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
    totop.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation(); // Lenis's own anchor handling would start a second scroll
      scrollToTop();
      $('.hdr__logo').focus({ preventScroll: true });
    });
  }
})();
