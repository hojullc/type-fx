/*!
 * type-fx v1.0.0
 * Lightweight text animation library — typewriter, scramble, word rotation,
 * number counters, gradient text, and reveal effects.
 * Zero dependencies. MIT License — https://github.com/hojullc/type-fx
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory)
    : (global.TypeFx = factory());
}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────────────── */
  const el = s => typeof s === 'string' ? document.querySelector(s) : s;
  const raf = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame.bind(window) : f => setTimeout(f, 16);
  const noop = () => {};
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  /* ══════════════════════════════════════════════════════════════════
     1. TYPEWRITER — types text character by character with a cursor
  ══════════════════════════════════════════════════════════════════ */
  function typewriter(target, text, opts = {}) {
    const node = el(target);
    if (!node) return { stop: noop, replay: noop };

    const {
      speed      = 60,
      cursor     = true,
      cursorChar = '|',
      deleteSpeed = 40,
      loop       = false,
      loopDelay  = 1500,
      onDone     = noop,
    } = opts;

    let i = 0, deleting = false, timer = null;
    let cursorEl = null;

    if (cursor) {
      cursorEl = document.createElement('span');
      cursorEl.textContent = cursorChar;
      cursorEl.setAttribute('aria-hidden', 'true');
      cursorEl.style.cssText = 'display:inline-block;animation:type-fx-blink .75s step-end infinite;';
      if (!document.getElementById('type-fx-style')) {
        const st = document.createElement('style');
        st.id = 'type-fx-style';
        st.textContent = '@keyframes type-fx-blink{0%,100%{opacity:1}50%{opacity:0}}';
        document.head.appendChild(st);
      }
    }

    node.textContent = '';
    node.setAttribute('aria-label', text);
    if (cursorEl) node.appendChild(cursorEl);

    function tick() {
      const textNode = document.createTextNode('');
      if (!deleting) {
        const slice = text.slice(0, ++i);
        node.childNodes[0]
          ? (node.childNodes[0].textContent = slice)
          : node.insertBefore(document.createTextNode(slice), cursorEl || null);
      } else {
        const cur = node.childNodes[0];
        if (cur) cur.textContent = text.slice(0, --i);
      }

      if (!deleting && i === text.length) {
        if (loop) timer = setTimeout(() => { deleting = true; tick(); }, loopDelay);
        else { onDone(); return; }
      } else if (deleting && i === 0) {
        deleting = false;
        timer = setTimeout(tick, speed * 2);
      } else {
        timer = setTimeout(tick, deleting ? deleteSpeed : speed);
      }
    }

    timer = setTimeout(tick, speed);

    return {
      stop:   () => clearTimeout(timer),
      replay: () => { clearTimeout(timer); i = 0; deleting = false;
                      if (node.childNodes[0]) node.childNodes[0].textContent = '';
                      timer = setTimeout(tick, speed); },
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     2. SCRAMBLE — reveals text through random character noise
  ══════════════════════════════════════════════════════════════════ */
  function scramble(target, text, opts = {}) {
    const node = el(target);
    if (!node) return { stop: noop, replay: noop };

    const {
      duration  = 1000,
      chars     = CHARS,
      onDone    = noop,
    } = opts;

    const original = text || node.textContent || '';
    const start = performance.now();
    let frame;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const revealCount = Math.floor(progress * original.length);

      let out = '';
      for (let i = 0; i < original.length; i++) {
        if (original[i] === ' ') { out += ' '; continue; }
        if (i < revealCount) {
          out += original[i];
        } else {
          out += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      node.textContent = out;

      if (progress < 1) {
        frame = raf(() => tick(performance.now()));
      } else {
        node.textContent = original;
        onDone();
      }
    }

    frame = raf(() => tick(performance.now()));
    return {
      stop:   () => cancelAnimationFrame(frame),
      replay: () => { cancelAnimationFrame(frame); frame = raf(() => { tick(performance.now() - start + 0); }); },
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     3. ROTATE — cycles through a list of words with a crossfade
  ══════════════════════════════════════════════════════════════════ */
  function rotate(target, words, opts = {}) {
    const node = el(target);
    if (!node || !words || !words.length) return { stop: noop };

    const {
      interval  = 2500,
      fadeDur   = 400,
      separator = '',
    } = opts;

    let idx = 0, timer;

    function show(w) {
      node.style.transition = `opacity ${fadeDur}ms ease`;
      node.style.opacity = '0';
      setTimeout(() => {
        node.textContent = w;
        node.style.opacity = '1';
      }, fadeDur);
    }

    node.textContent = words[0];

    timer = setInterval(() => {
      idx = (idx + 1) % words.length;
      show(words[idx]);
    }, interval);

    return { stop: () => clearInterval(timer) };
  }

  /* ══════════════════════════════════════════════════════════════════
     4. COUNTER — animates a number from start to end
  ══════════════════════════════════════════════════════════════════ */
  function counter(target, to, opts = {}) {
    const node = el(target);
    if (!node) return { stop: noop };

    const {
      from      = 0,
      duration  = 1500,
      decimals  = 0,
      prefix    = '',
      suffix    = '',
      separator = ',',
      easing    = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,  // easeInOutQuad
      onDone    = noop,
    } = opts;

    const start = performance.now();
    let frame;

    function format(n) {
      const fixed = n.toFixed(decimals);
      if (!separator) return prefix + fixed + suffix;
      const [int, dec] = fixed.split('.');
      const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return prefix + (dec !== undefined ? `${intFmt}.${dec}` : intFmt) + suffix;
    }

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const v = from + (to - from) * easing(t);
      node.textContent = format(v);
      if (t < 1) frame = raf(() => tick(performance.now()));
      else { node.textContent = format(to); onDone(); }
    }

    frame = raf(() => tick(performance.now()));
    return { stop: () => cancelAnimationFrame(frame) };
  }

  /* ══════════════════════════════════════════════════════════════════
     5. REVEAL — splits text into spans and animates them in
  ══════════════════════════════════════════════════════════════════ */
  function reveal(target, opts = {}) {
    const node = el(target);
    if (!node) return { stop: noop };

    const {
      by        = 'word',   // 'word' | 'char' | 'line'
      animation = 'fadeUp', // 'fadeUp' | 'fadeIn' | 'zoom'
      stagger   = 60,
      duration  = 500,
      easing    = 'cubic-bezier(.4,0,.2,1)',
      threshold = 0.1,
      onDone    = noop,
    } = opts;

    const text = node.textContent;
    const parts = by === 'char' ? [...text] : text.split(/\s+/);
    const keyframes = {
      fadeUp: 'translate(0,20px)',
      fadeIn: 'translate(0,0)',
      zoom:   'scale(.8)',
    };
    const startTransform = keyframes[animation] || keyframes.fadeUp;

    node.innerHTML = parts.map((p, i) => {
      const sp = document.createElement('span');
      sp.textContent = by === 'word' ? p + ' ' : p;
      sp.style.cssText = `display:inline-block;opacity:0;transform:${startTransform};
        transition:opacity ${duration}ms ${easing} ${i * stagger}ms,
                   transform ${duration}ms ${easing} ${i * stagger}ms;`;
      return sp.outerHTML;
    }).join('');

    let done = false;
    function play() {
      if (done) return;
      done = true;
      const spans = node.querySelectorAll('span');
      requestAnimationFrame(() => {
        spans.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; });
        const last = parts.length - 1;
        setTimeout(onDone, last * stagger + duration);
      });
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { play(); io.disconnect(); }
      }, { threshold });
      io.observe(node);
      return { stop: () => io.disconnect() };
    } else {
      play();
      return { stop: noop };
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     6. GRADIENT — applies animated gradient to text
  ══════════════════════════════════════════════════════════════════ */
  function gradient(target, colors, opts = {}) {
    const node = el(target);
    if (!node) return { stop: noop };

    const {
      angle    = 90,
      animate  = true,
      duration = 4,  // seconds
    } = opts;

    const palette = colors && colors.length >= 2 ? colors : ['#7064ff', '#ff6b9d', '#06b6d4'];
    const grad = `linear-gradient(${angle}deg, ${palette.join(', ')})`;

    node.style.backgroundImage = grad;
    node.style.webkitBackgroundClip = 'text';
    node.style.backgroundClip = 'text';
    node.style.webkitTextFillColor = 'transparent';
    node.style.color = 'transparent';
    node.style.backgroundSize = animate ? '200% 200%' : '100% 100%';

    if (animate) {
      if (!document.getElementById('type-fx-grad-style')) {
        const st = document.createElement('style');
        st.id = 'type-fx-grad-style';
        st.textContent = `@keyframes type-fx-grad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`;
        document.head.appendChild(st);
      }
      node.style.animation = `type-fx-grad ${duration}s ease infinite`;
    }

    return {
      stop: () => { node.style.animation = ''; },
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     7. AUTO-INIT — data attributes: data-type-fx="typewriter|scramble|..."
  ══════════════════════════════════════════════════════════════════ */
  function autoInit() {
    document.querySelectorAll('[data-type-fx]').forEach(node => {
      const type = node.getAttribute('data-type-fx');
      const opts = {};
      try { Object.assign(opts, JSON.parse(node.getAttribute('data-type-fx-opts') || '{}')); } catch (e) {}
      switch (type) {
        case 'typewriter': typewriter(node, node.textContent, opts); break;
        case 'scramble':   scramble(node, node.textContent, opts); break;
        case 'counter':    counter(node, Number(node.getAttribute('data-to') || 0), opts); break;
        case 'gradient':   gradient(node, null, opts); break;
        case 'reveal':     reveal(node, opts); break;
      }
    });
  }

  /* ── Public API ──────────────────────────────────────────────────── */
  const TypeFx = { typewriter, scramble, rotate, counter, reveal, gradient, autoInit };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoInit);
    } else {
      autoInit();
    }
  }

  return TypeFx;
}));
