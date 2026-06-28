/* ============================================================
   DreamDive — Shared Chrome Injector
   Injects nav, mobile menu, cursor, loader, concierge, lightbox,
   footer into every page from ONE config.
   ►► EDIT NAV_LINKS / FOOTER / BRAND here to change all pages. ◄◄
   Load this BEFORE app.js.
   ============================================================ */
(function () {
  const BRAND = 'Misty Canopy';
  // page key -> set on <body data-page="home"> to highlight active link
  const NAV_LINKS = [
    { label: 'Home', href: 'index.html', key: 'home' },
    { label: 'Rooms', href: 'rooms.html', key: 'rooms' },
    { label: 'Dining', href: 'dining.html', key: 'dining' },
    { label: 'Experiences', href: 'experiences.html', key: 'experiences' },
    { label: 'Gallery', href: 'gallery.html', key: 'gallery' },
    { label: 'Story', href: 'story.html', key: 'story' },
    { label: 'Book', href: 'booking.html', key: 'booking' },
  ];
  const FOOTER = {
    tagline: 'Where high-range forests meet cascading waterfalls and rolling tea estates. A premium sanctuary wrapped in mist and mountain fog.',
    social: ['Instagram', 'Facebook', 'Twitter', 'YouTube'],
    cols: [
      { h: 'Explore', links: [['Our Story', 'story.html'], ['Rooms & Villas', 'rooms.html'], ['Dining', 'dining.html'], ['Experiences', 'experiences.html']] },
      { h: 'Discover', links: [['Gallery', 'gallery.html'], ['Book a Stay', 'booking.html'], ['Packages', 'booking.html'], ['Seasonal Offers', 'booking.html']] },
      { h: 'Contact', links: [['concierge@mistycanopy.com', 'mailto:concierge@mistycanopy.com'], ['+91 4862 200 300', 'tel:+914862200300'], ['Idukki Forest Corridor', '#'], ['Kerala Western Ghats', '#']] },
    ],
  };

  const page = document.body.dataset.page || '';

  /* Cursor + loader + progress (prepended) */
  const top = document.createElement('div');
  top.innerHTML = `
    <div class="cursor-dot" id="cursorDot"></div>
    <div class="cursor-ring" id="cursorRing"></div>
    <div class="loader" id="loader"><div class="loader-logo">${[...'Misty Canopy'].map((c, i) => `<span class="loader-letter" style="animation-delay:${.1 + i * .05}s">${c}</span>`).join('')}</div></div>
    <div class="scroll-progress" id="scrollProgress"></div>`;
  document.body.prepend(top);

  /* Navbar */
  const nav = document.createElement('nav');
  nav.className = 'nav'; nav.id = 'nav';
  nav.innerHTML = `
    <div class="nav-inner">
      <a href="index.html" class="nav-pill liquid-glass"><span class="nav-brand"><span class="mark">✦</span>${BRAND}</span></a>
      <div class="nav-center liquid-glass">
        ${NAV_LINKS.map(l => `<a href="${l.href}" class="${l.key === page ? 'active' : ''}">${l.label}</a>`).join('')}
      </div>
      <div class="nav-actions">
        <button class="theme-toggle liquid-glass" id="themeToggle" aria-label="Theme">
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
        </button>
        <a href="booking.html" class="btn-pill desktop">Reserve</a>
        <button class="burger" id="burger" aria-label="Menu"><span></span><span></span><span></span></button>
      </div>
    </div>`;
  document.body.prepend(nav);

  /* Mobile menu */
  const mm = document.createElement('div');
  mm.className = 'mobile-menu'; mm.id = 'mobileMenu';
  mm.innerHTML = `<nav>${NAV_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}</nav>`;
  document.body.appendChild(mm);

  /* Concierge */
  const con = document.createElement('div');
  con.innerHTML = `
    <button class="concierge-btn" id="conciergeBtn" aria-label="AI Concierge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9.01"/><line x1="15" y1="9" x2="15.01" y2="9.01"/></svg>
      <span class="concierge-pulse"></span>
    </button>
    <div class="concierge-panel liquid-glass" id="conciergePanel">
      <div class="concierge-head"><div><h4>Aria · AI Concierge</h4><span class="cstatus"><span class="cdot"></span> Online</span></div><button id="conciergeClose">✕</button></div>
      <div class="concierge-body" id="conciergeBody"><div class="cmsg bot">Welcome to Misty Canopy Forest Resort ✦ I'm Aria, your high-range companion. How may I help you explore the misty valleys of Idukki today?</div></div>
      <div class="concierge-input"><input id="conciergeInput" placeholder="Ask me anything…"/><button id="conciergeSend">➤</button></div>
    </div>`;
  document.body.appendChild(con);

  /* Lightbox */
  const lb = document.createElement('div');
  lb.className = 'lightbox'; lb.id = 'lightbox';
  lb.innerHTML = `<button class="lb-close" id="lbClose">✕</button><div class="lb-content" id="lbContent"></div>`;
  document.body.appendChild(lb);

  /* Footer */
  const f = document.createElement('footer');
  f.className = 'footer';
  f.innerHTML = `
    <div class="footer-glow"></div>
    <div class="container">
      <div class="footer-top">
        <div>
          <a href="index.html" class="nav-brand"><span class="mark">✦</span>${BRAND}</a>
          <p class="tagline">${FOOTER.tagline}</p>
          <div class="fsocial">${FOOTER.social.map(s => `<a href="#">${s}</a>`).join('')}</div>
        </div>
        <div class="fcols">
          ${FOOTER.cols.map(c => `<div class="fcol"><h4>${c.h}</h4>${c.links.map(l => `<a href="${l[1]}">${l[0]}</a>`).join('')}</div>`).join('')}
        </div>
      </div>
      <div class="footer-bottom"><span>© 2026 ${BRAND} Signature Resort. All rights reserved.</span><div class="fb-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div></div>
    </div>`;
  document.body.appendChild(f);
})();