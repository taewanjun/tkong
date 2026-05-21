/* ═══════════════════════════════════════════════════════════
   VINTAGE JOURNAL HISTORY ARCHIVE — script.js
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── Constants ──────────────────────────────────────────── */
const TIMELINE_SECTIONS = ['era-1910', 'era-1930', 'era-1945', 'era-1960', 'era-1970'];
const TIMELINE_YEARS    = ['1910', '1930', '1945', '1960', '1970'];

/* ─── DOM References ─────────────────────────────────────── */
const timelineNav  = document.getElementById('timelineNav');
const timelineItems = timelineNav ? timelineNav.querySelectorAll('.timeline-nav__item') : [];

/* ══════════════════════════════════════════════════════════
   1. INTERSECTION OBSERVER — scroll-reveal for articles & sections
   ══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  /* Reveal: archive-era wrappers, section-dividers */
  document.querySelectorAll('.archive-era, .section-divider').forEach((el) => {
    revealObserver.observe(el);
  });

  /* Staggered cards */
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = entry.target.closest('.newspaper-grid')
          ? [...entry.target.closest('.newspaper-grid').querySelectorAll('.news-article')]
          : [entry.target];
        siblings.forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 120);
        });
        cardObserver.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.08 });

  /* Observe only first card in each grid to trigger the stagger */
  document.querySelectorAll('.newspaper-grid').forEach((grid) => {
    const first = grid.querySelector('.news-article');
    if (first) cardObserver.observe(first);
  });
}

/* ══════════════════════════════════════════════════════════
   2. TIMELINE NAV — active year tracking
   ══════════════════════════════════════════════════════════ */
function initTimelineNav() {
  if (!timelineNav) return;

  const sectionEls = TIMELINE_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const yearAttr = id.replace('era-', '');
          setActiveYear(yearAttr);
        }
      });
    },
    { root: null, rootMargin: '-30% 0px -60% 0px', threshold: 0 }
  );

  sectionEls.forEach((el) => sectionObserver.observe(el));
}

function setActiveYear(year) {
  timelineItems.forEach((item) => {
    const itemYear = item.dataset.year;
    item.classList.toggle('active', itemYear === year);
  });
}

/* ══════════════════════════════════════════════════════════
   3. SMOOTH SCROLL — timeline nav links
   ══════════════════════════════════════════════════════════ */
function initTimelineLinks() {
  document.querySelectorAll('.timeline-nav__link').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   4. PAGE FLIP — subtle slide + fade on scroll sections
      Creates a "book page turn" feel using CSS class toggling
   ══════════════════════════════════════════════════════════ */
function initPageFlipEffect() {
  let lastScrollY = window.scrollY;
  let ticking = false;

  const eras = document.querySelectorAll('.archive-era');

  function applyFlipOnScroll() {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    lastScrollY = currentScrollY;

    eras.forEach((era) => {
      const rect = era.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.85 && rect.bottom > 0;

      if (inView) {
        era.classList.add('in-view');
        era.style.setProperty(
          '--flip-offset',
          scrollingDown ? '0px' : '-6px'
        );
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyFlipOnScroll);
      ticking = true;
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   5. TYPEWRITER CURSOR — masthead subtitle blink
   ══════════════════════════════════════════════════════════ */
function initTypewriterCursor() {
  const subtitle = document.querySelector('.masthead__subtitle');
  if (!subtitle) return;

  const originalText = subtitle.textContent;
  let displayed = '';
  let i = 0;
  subtitle.textContent = '';
  subtitle.style.borderRight = '2px solid #4A3F35';
  subtitle.style.paddingRight = '2px';
  subtitle.style.animation = 'cursorblink 0.9s step-end infinite';

  /* inject cursor blink keyframes once */
  if (!document.getElementById('cursor-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'cursor-style';
    styleEl.textContent = `
      @keyframes cursorblink {
        0%, 100% { border-color: transparent; }
        50%       { border-color: #4A3F35; }
      }
    `;
    document.head.appendChild(styleEl);
  }

  function typeChar() {
    if (i < originalText.length) {
      displayed += originalText[i];
      subtitle.textContent = displayed;
      i++;
      setTimeout(typeChar, 50 + Math.random() * 40);
    } else {
      /* stop blinking after done */
      setTimeout(() => {
        subtitle.style.borderRight = 'none';
        subtitle.style.animation = 'none';
      }, 1800);
    }
  }

  setTimeout(typeChar, 700);
}

/* ══════════════════════════════════════════════════════════
   6. STAMP TILT — randomise stamp rotation slightly per card
   ══════════════════════════════════════════════════════════ */
function initStampTilt() {
  document.querySelectorAll('.stamp').forEach((stamp) => {
    const base = 12 + Math.random() * 8; /* 12–20 deg */
    const sign = Math.random() > 0.5 ? 1 : -1;
    stamp.style.transform = `rotate(${sign * base}deg)`;
    stamp.style.setProperty('--stamp-rot', `${sign * base}deg`);
  });
}

/* ══════════════════════════════════════════════════════════
   7. PARALLAX — hero photo subtle depth shift
   ══════════════════════════════════════════════════════════ */
function initHeroParallax() {
  const heroPhoto = document.getElementById('heroPhoto');
  if (!heroPhoto) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const rate = scrolled * 0.28;
    heroPhoto.style.transform = `translateY(${rate}px)`;
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   8. ARTICLE HOVER SOUND HINT — subtle visual "crinkle" effect
   ══════════════════════════════════════════════════════════ */
function initCardCrinkle() {
  document.querySelectorAll('.news-article').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.style.backgroundImage =
        `radial-gradient(ellipse at ${30 + Math.random() * 40}% ${20 + Math.random() * 60}%, rgba(255,255,240,0.18) 0%, transparent 70%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.backgroundImage = '';
    });
  });
}

/* ══════════════════════════════════════════════════════════
   9. MASTHEAD DATE — live formatted date overlay
   ══════════════════════════════════════════════════════════ */
function initMastheadDate() {
  const dateEl = document.querySelector('.masthead__date');
  if (!dateEl) return;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  /* Keep historical date but append archive date in brackets */
  dateEl.innerHTML = dateEl.innerHTML + ` &nbsp;[ARCHIVED: ${y}.${m}.${d}]`;
}

/* ══════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initTimelineNav();
  initTimelineLinks();
  initPageFlipEffect();
  initTypewriterCursor();
  initStampTilt();
  initHeroParallax();
  initCardCrinkle();
  initMastheadDate();
});
