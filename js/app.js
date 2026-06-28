/* ============================================================
   DreamDive — Shared App Logic (vanilla JS)
   Reusable implementations of the 7 specs' animation techniques.
   Pages opt in via classes / data-attributes:
     [data-blur-text]      word-by-word blur-in (file 3)
     [data-pull-up]        words pull-up stagger (file 2)
     [data-sr-words]       scroll-driven word color reveal (file 1)
     [data-sr-chars]       scroll-driven character reveal (file 2)
     [data-mask-reveal]    horizontal mask wipe on scroll (file 6)
     .reveal / .reveal-scale  fade/scale in on view
     [data-parallax]       translateY parallax
     [data-tilt]           3D tilt
     [data-magnetic]       magnetic hover
     .media-bg[data-frames="a.jpg,b.jpg"]  ken-burns crossfade bg
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Loader ---------- */
  const loader = $('#loader');
  if (loader) {
    document.body.style.overflow = 'hidden';
    window.addEventListener('load', () => {
      setTimeout(() => { loader.classList.add('hidden'); document.body.style.overflow = ''; fireHeroReveals(); }, 600);
    });
    // safety
    setTimeout(() => { loader.classList.add('hidden'); document.body.style.overflow = ''; fireHeroReveals(); }, 2600);
  } else { document.addEventListener('DOMContentLoaded', fireHeroReveals); }

  function fireHeroReveals() {
    $$('[data-hero] .word, [data-hero].word').forEach((w, i) => setTimeout(() => w.classList.add('in'), 120 + i * 60));
    $$('[data-hero] .reveal, [data-hero] .reveal-scale').forEach((el, i) => setTimeout(() => el.classList.add('in'), 200 + i * 120));
  }

  /* ---------- Custom Cursor ---------- */
  const dot = $('#cursorDot'), ring = $('#cursorRing');
  if (dot && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
    (function loop() { rx += (mx - rx) * .15; ry += (my - ry) * .15; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(loop); })();
    const hoverSel = 'a,button,[data-tilt],.media-card,.gallery-item,input,textarea,select';
    document.addEventListener('mouseover', e => { if (e.target.closest(hoverSel)) { ring.classList.add('hover'); dot.classList.add('hover'); } });
    document.addEventListener('mouseout', e => { if (e.target.closest(hoverSel)) { ring.classList.remove('hover'); dot.classList.remove('hover'); } });
  }

  /* ---------- Theme (auto day/night) ---------- */
  const html = document.documentElement, themeBtn = $('#themeToggle');
  const autoTheme = () => { const h = new Date().getHours(); return (h >= 6 && h < 19) ? 'light' : 'dark'; };
  const setTheme = t => { html.setAttribute('data-theme', t); localStorage.setItem('dd-theme', t); };
  setTheme(localStorage.getItem('dd-theme') || autoTheme());
  if (themeBtn) themeBtn.addEventListener('click', () => { setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); localStorage.setItem('dd-theme-manual', '1'); });
  setInterval(() => { if (!localStorage.getItem('dd-theme-manual')) setTheme(autoTheme()); }, 3600000);

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), mobile = $('#mobileMenu');
  if (burger && mobile) {
    burger.addEventListener('click', () => { burger.classList.toggle('active'); mobile.classList.toggle('active'); document.body.style.overflow = mobile.classList.contains('active') ? 'hidden' : ''; });
    $$('a', mobile).forEach(a => a.addEventListener('click', () => { burger.classList.remove('active'); mobile.classList.remove('active'); document.body.style.overflow = ''; }));
  }

  /* ---------- Smooth in-page scroll ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const el = $(id); if (!el) return; e.preventDefault();
    const start = scrollY, end = el.getBoundingClientRect().top + scrollY - 20, t0 = performance.now(), dur = 1100;
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    (function step(now) { const t = Math.min((now - t0) / dur, 1); scrollTo(0, start + (end - start) * ease(t)); if (t < 1) requestAnimationFrame(step); })(t0);
  }));

  /* ---------- Split text into words (blur-text + pull-up) ---------- */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    const segs = $$('[data-seg]', el);
    if (segs.length) {
      segs.forEach(seg => {
        const cls = seg.className;
        const words = seg.textContent.trim().split(/\s+/);
        seg.textContent = '';
        words.forEach(w => { const s = document.createElement('span'); s.className = 'word ' + cls; s.textContent = w; seg.appendChild(s); seg.appendChild(document.createTextNode(' ')); });
      });
    } else {
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach(w => { const s = document.createElement('span'); s.className = 'word'; s.textContent = w; el.appendChild(s); el.appendChild(document.createTextNode(' ')); });
    }
  }
  $$('[data-blur-text],[data-pull-up]').forEach(splitWords);

  const wordObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const words = $$('.word', en.target);
        const step = en.target.hasAttribute('data-pull-up') ? 80 : 90;
        words.forEach((w, i) => setTimeout(() => w.classList.add('in'), i * step));
        wordObs.unobserve(en.target);
      }
    });
  }, { threshold: .2 });
  $$('[data-blur-text],[data-pull-up]').forEach(el => { if (!el.closest('[data-hero]')) wordObs.observe(el); });

  /* ---------- Generic reveal on view ---------- */
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { const d = +(en.target.dataset.delay || 0); setTimeout(() => en.target.classList.add('in'), d); revObs.unobserve(en.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -50px 0px' });
  $$('.reveal,.reveal-scale').forEach(el => { if (!el.closest('[data-hero]')) revObs.observe(el); });

  /* ---------- Staggered grid children ---------- */
  const gridObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        $$(':scope > *', en.target).forEach((c, i) => { c.style.opacity = '0'; c.style.transform = 'translateY(30px)'; c.style.transition = 'opacity .6s var(--ease-out),transform .6s var(--ease-out)'; setTimeout(() => { c.style.opacity = '1'; c.style.transform = 'none'; }, i * 90); });
        gridObs.unobserve(en.target);
      }
    });
  }, { threshold: .1 });
  $$('[data-stagger]').forEach(g => gridObs.observe(g));

  /* ---------- Scroll-driven WORD reveal (file 1 testimonial) ---------- */
  function setupScrollWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(w => { const s = document.createElement('span'); s.className = 'sr-word'; s.textContent = w; el.appendChild(s); });
  }
  $$('[data-sr-words]').forEach(setupScrollWords);

  /* ---------- Scroll-driven CHARACTER reveal (file 2 about) ---------- */
  function setupScrollChars(el) {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach(ch => { const s = document.createElement('span'); s.className = 'sr-char'; s.textContent = ch; el.appendChild(s); });
  }
  $$('[data-sr-chars]').forEach(setupScrollChars);

  /* ---------- Ken Burns crossfade background & Background Video Loader ---------- */
  $$('.media-bg').forEach(bg => {
    const videoSrc = bg.dataset.video || '';
    if (videoSrc) {
      const v = document.createElement('video');
      v.autoplay = true;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.className = 'bg-video';

      const src = document.createElement('source');
      src.src = videoSrc;
      src.type = 'video/mp4';
      v.appendChild(src);
      bg.appendChild(v);

      v.addEventListener('canplay', () => {
        v.style.opacity = '1';
        const els = $$('.frame', bg);
        els.forEach(f => f.style.display = 'none');
      });
    }

    if (bg.dataset.frames) {
      const frames = bg.dataset.frames.split(',').map(s => s.trim()).filter(Boolean);
      frames.forEach((src, i) => { const f = document.createElement('div'); f.className = 'frame' + (i === 0 ? ' active' : ''); f.style.backgroundImage = `url('${src}')`; bg.appendChild(f); });
      const els = $$('.frame', bg);
      if (els.length > 1 && !videoSrc) {
        let idx = 0;
        setInterval(() => {
          els[idx].classList.remove('active');
          idx = (idx + 1) % els.length;
          els[idx].classList.add('active');
        }, 5000);
      }
    }
  });

  /* ---------- Particles ---------- */
  $$('.particles').forEach(box => {
    const n = innerWidth > 768 ? 26 : 12;
    for (let i = 0; i < n; i++) { const p = document.createElement('div'); p.className = 'particle'; const sz = Math.random() * 4 + 1; p.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}%;animation-duration:${Math.random() * 10 + 9}s;animation-delay:${Math.random() * 10}s;opacity:${Math.random() * .5 + .2}`; box.appendChild(p); }
  });

  /* ---------- Counters ---------- */
  const cntObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { const el = en.target, target = parseFloat(el.dataset.count), dec = (el.dataset.count.includes('.') ? 1 : 0); let cur = 0; const inc = target / 55; const t = setInterval(() => { cur += inc; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = (el.dataset.prefix || '') + cur.toFixed(dec) + (el.dataset.suffix || ''); }, 28); cntObs.unobserve(el); }
    });
  }, { threshold: .5 });
  $$('[data-count]').forEach(el => cntObs.observe(el));

  /* ---------- 3D tilt ---------- */
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(); const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -7; const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 7; card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`; });
    card.addEventListener('mouseleave', () => card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)');
  });

  /* ---------- Magnetic ---------- */
  $$('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', e => { const r = btn.getBoundingClientRect(); btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .2}px)`; });
    btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox'), lbc = $('#lbContent');
  if (lb) {
    $$('[data-lightbox]').forEach(it => it.addEventListener('click', () => { const img = it.querySelector('.img,.gallery-img,[style*="background-image"]') || it; lbc.style.backgroundImage = getComputedStyle(img).backgroundImage; lb.classList.add('active'); document.body.style.overflow = 'hidden'; }));
    const close = () => { lb.classList.remove('active'); document.body.style.overflow = ''; };
    $('#lbClose').addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- Concierge ---------- */
  const cBtn = $('#conciergeBtn'), cPanel = $('#conciergePanel');
  if (cBtn && cPanel) {
    cBtn.addEventListener('click', () => cPanel.classList.toggle('active'));
    $('#conciergeClose').addEventListener('click', () => cPanel.classList.remove('active'));
    const body = $('#conciergeBody'), input = $('#conciergeInput'), send = $('#conciergeSend');
    const R = {
      rooms: "We have 6 villa types — from the Ocean Suite ($850/night) to the Presidential Estate ($4,200/night). Want me to check availability?",
      dining: "12 venues await, including Michelin-starred Océan and the Aurora sky bar. Shall I reserve a table?",
      spa: "Our Spa Sanctuary offers a 90-minute signature ritual rooted in ancient traditions. Book one?",
      activities: "Sunrise dolphin safaris, rainforest treks, coral diving, island picnics, stargazing — which calls to you?",
      weather: "It's a beautiful 28°C with sunny skies today — perfect for the beach. Water is 26°C.",
      booking: "I'd love to help you book. Use the inquiry form, or I can connect you on WhatsApp. What dates?",
      default: "Wonderful question! Reach our concierge at concierge@dreamdive.com or use the booking form. Anything else?"
    };
    const reply = t => { const l = t.toLowerCase(); if (/room|villa|suite|stay/.test(l)) return R.rooms; if (/dining|food|eat|chef|restaurant/.test(l)) return R.dining; if (/spa|massage|wellness/.test(l)) return R.spa; if (/activit|experience|dive|dolphin|tour/.test(l)) return R.activities; if (/weather|temp|hot|cold/.test(l)) return R.weather; if (/book|reserv|price|rate|cost|availab/.test(l)) return R.booking; return R.default; };
    const sendMsg = () => { const t = input.value.trim(); if (!t) return; const u = document.createElement('div'); u.className = 'cmsg user'; u.textContent = t; body.appendChild(u); input.value = ''; body.scrollTop = body.scrollHeight; setTimeout(() => { const b = document.createElement('div'); b.className = 'cmsg bot'; b.textContent = reply(t); body.appendChild(b); body.scrollTop = body.scrollHeight; }, 700); };
    send.addEventListener('click', sendMsg);
    input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });
  }

  /* ---------- Forms ---------- */
  $$('[data-form]').forEach(form => {
    form.addEventListener('submit', e => { e.preventDefault(); const ok = form.querySelector('.form-ok'); if (ok) { ok.classList.add('show'); setTimeout(() => ok.classList.remove('show'), 5000); } form.reset(); });
  });
  const wa = $('#whatsappBtn');
  if (wa) wa.addEventListener('click', e => { e.preventDefault(); open('https://wa.me/10000000000?text=' + encodeURIComponent("Hello DreamDive! I'd like to inquire about booking."), '_blank'); });

  /* ---------- Weather (time-aware) ---------- */
  const wi = $('#wIcon');
  if (wi) { const h = new Date().getHours(); const wt = $('#wTemp'), wc = $('#wCond'); if (h >= 6 && h < 18) { wi.textContent = '☀️'; wt.textContent = '28°C'; wc.textContent = 'Sunny · Perfect for the beach'; } else if (h < 20) { wi.textContent = '🌅'; wt.textContent = '24°C'; wc.textContent = 'Golden hour · Breezy evening'; } else { wi.textContent = '🌙'; wt.textContent = '22°C'; wc.textContent = 'Clear night · Stargazing weather'; } }

  /* ---------- Horizontal wheel scroll (experiences track) ---------- */
  $$('[data-hscroll]').forEach(tr => tr.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; const atStart = tr.scrollLeft === 0, atEnd = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 1; if ((!atStart && e.deltaY < 0) || (!atEnd && e.deltaY > 0)) { e.preventDefault(); tr.scrollLeft += e.deltaY; } }, { passive: false }));

  /* ---------- Unified scroll handler (rAF) ---------- */
  const nav = $('#nav'), prog = $('#scrollProgress');
  const srWordEls = $$('[data-sr-words]'), srCharEls = $$('[data-sr-chars]'), maskEls = $$('[data-mask-reveal]'), parallaxEls = $$('[data-parallax]'), bgParallax = $$('[data-parallax-bg]');
  let ticking = false;
  function onScroll() {
    const y = scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 50);
    if (prog) { const dh = document.documentElement.scrollHeight - innerHeight; prog.style.width = (y / dh * 100) + '%'; }

    // active nav link
    let cur = '';
    $$('section[id]').forEach(s => { const r = s.getBoundingClientRect(); if (r.top <= 130 && r.bottom >= 130) cur = s.id; });
    $$('.nav-center a[href^="#"]').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));

    // element parallax
    parallaxEls.forEach(el => { const sp = parseFloat(el.dataset.parallax); const r = el.getBoundingClientRect(); const off = (r.top + r.height / 2 - innerHeight / 2) * sp * -0.1; el.style.transform = `translateY(${off}px)`; });
    bgParallax.forEach(el => { const sp = parseFloat(el.dataset.parallaxBg); const r = el.parentElement.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.style.transform = `translateY(${(r.top - innerHeight / 2) * sp}px) scale(1.1)`; });

    // scroll-driven word reveal (file 1): map progress start end -> end center
    srWordEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const prog = clamp((innerHeight - r.top) / (innerHeight + r.height * 0.5), 0, 1);
      const words = $$('.sr-word', el); const total = words.length;
      words.forEach((w, i) => { const a = i / total, b = (i + 1) / total; const local = clamp((prog - a) / (b - a), 0, 1); const light = 35 + local * 65; w.style.color = `hsl(0 0% ${light}%)`; w.style.opacity = (0.2 + local * 0.8).toFixed(2); });
    });
    // scroll-driven char reveal (file 2)
    srCharEls.forEach(el => {
      const r = el.getBoundingClientRect();
      const prog = clamp((innerHeight * 0.8 - r.top) / (innerHeight * 0.6 + r.height), 0, 1);
      const chars = $$('.sr-char', el); const total = chars.length;
      chars.forEach((c, i) => { const cp = i / total; const local = clamp((prog - (cp - 0.1)) / 0.15, 0, 1); c.style.opacity = (0.2 + local * 0.8).toFixed(2); c.style.color = local > 0.5 ? 'var(--cream-bright)' : 'var(--muted)'; });
    });
    // mask reveal (file 6)
    maskEls.forEach(el => { const r = el.getBoundingClientRect(); const prog = clamp((innerHeight - r.top) / (innerHeight * 0.8), 0, 1); const pct = prog * 100; const m = `linear-gradient(to right,#000 ${pct}%,transparent ${Math.min(pct + 12, 100)}%)`; el.style.webkitMaskImage = m; el.style.maskImage = m; });

    ticking = false;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Ripple on primary buttons ---------- */
  $$('.btn-primary,.btn-pill').forEach(b => b.addEventListener('click', function (e) { const r = this.getBoundingClientRect(); const sz = Math.max(r.width, r.height); const rip = document.createElement('span'); rip.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,.4);width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz / 2}px;top:${e.clientY - r.top - sz / 2}px;pointer-events:none;transform:scale(0);animation:rip .6s ease`; this.appendChild(rip); setTimeout(() => rip.remove(), 600); }));
  const st = document.createElement('style'); st.textContent = '@keyframes rip{to{transform:scale(2.5);opacity:0}}'; document.head.appendChild(st);

  /* ---------- 3D Card Flipping (Tap and Flip) ---------- */
  $$('.flip-card').forEach(card => {
    card.addEventListener('click', function() {
      this.classList.toggle('flipped');
    });
  });

  /* ---------- Magic Double Door Split Slider ---------- */
  $$('.door-container').forEach(container => {
    const images = (container.dataset.images || '').split(',').map(s => s.trim()).filter(Boolean);
    const captions = (container.dataset.captions || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!images.length) return;

    let idx = 0;

    // Create door panels
    const leftPanel = document.createElement('div');
    leftPanel.className = 'door-panel door-panel-left';
    const rightPanel = document.createElement('div');
    rightPanel.className = 'door-panel door-panel-right';

    // Handle at center
    const handle = document.createElement('div');
    handle.className = 'door-handle';
    handle.innerHTML = '✦';
    leftPanel.appendChild(handle);

    const bgImg = document.createElement('div');
    bgImg.className = 'door-bg-image';

    const caption = document.createElement('div');
    caption.className = 'door-caption';

    const overlayText = document.createElement('div');
    overlayText.className = 'door-overlay-text';
    overlayText.innerHTML = '✦ Click to Open Doors ✦';

    const setImages = (currIdx, nextIdx) => {
      leftPanel.style.backgroundImage = `url('${images[currIdx]}')`;
      rightPanel.style.backgroundImage = `url('${images[currIdx]}')`;
      bgImg.style.backgroundImage = `url('${images[nextIdx]}')`;
      caption.innerHTML = captions[nextIdx] || 'Misty Canopy Sanctuary';
    };

    // Initialize
    setImages(0, 1 % images.length);
    container.appendChild(bgImg);
    container.appendChild(caption);
    container.appendChild(leftPanel);
    container.appendChild(rightPanel);
    container.appendChild(overlayText);

    container.addEventListener('click', function(e) {
      if (container.classList.contains('door-open')) return;

      container.classList.add('door-open');
      container.classList.add('door-animating');

      setTimeout(() => {
        idx = (idx + 1) % images.length;
        const nextIdx = (idx + 1) % images.length;

        // Disable transitions temporarily to snap shut with new image
        leftPanel.style.transition = 'none';
        rightPanel.style.transition = 'none';
        bgImg.style.transition = 'none';

        container.classList.remove('door-open');
        container.classList.remove('door-animating');

        setImages(idx, nextIdx);

        // Force reflow
        leftPanel.offsetHeight;

        // Restore transitions
        leftPanel.style.transition = '';
        rightPanel.style.transition = '';
        bgImg.style.transition = '';
      }, 1200); // matches CSS duration
    });
  });

  /* ---------- Scroll Zoom Handler (Zoom like a video) ---------- */
  const zoomImgs = $$('.zoom-scroll-img');
  if (zoomImgs.length) {
    const onZoomScroll = () => {
      zoomImgs.forEach(img => {
        const r = img.getBoundingClientRect();
        const inView = r.top < innerHeight && r.bottom > 0;
        if (inView) {
          const progress = (innerHeight - r.top) / (innerHeight + r.height);
          // Smooth zoom from 1.25 to 1.05 based on scroll position
          const scale = 1.25 - progress * 0.2;
          img.style.transform = `scale(${scale})`;
        }
       });
    };
    addEventListener('scroll', onZoomScroll, { passive: true });
    onZoomScroll();
  }

  console.log('✦ Misty Canopy design system loaded');
})();