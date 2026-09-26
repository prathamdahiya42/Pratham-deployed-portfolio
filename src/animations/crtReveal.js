/**
 * CRT Scanline Flip Reveal — Animation Module
 *
 * Exports `initCRTReveal()` which:
 *   1. Finds all `.crt-card` elements inside `.projects-grid`
 *   2. Sets up a shared IntersectionObserver (threshold 0.15)
 *   3. On intersection fires a 3-phase GSAP timeline:
 *        Phase 1 — Scanline sweep + clip-path reveal  (0.6 s)
 *        Phase 2 — RGB glitch snap (0.28 s, starts at 70 % of Phase 1)
 *        Phase 3 — Phosphor fade-in (0.2 s, starts at end of Phase 1)
 *   4. Staggers same-row cards by 0.12 s left→right
 *   5. Unobserves each card after firing so it only plays once
 */
import gsap from 'gsap';

/* ───────────────────────────── helpers ─────────────────────────── */

/** Group card elements into rows based on their visual top offset */
function groupIntoRows(cards) {
  /** Map<roundedTop, Card[]> */
  const map = new Map();
  cards.forEach((card) => {
    const top = Math.round(card.getBoundingClientRect().top);
    // Cluster elements within 8 px of each other into the same row
    let matched = false;
    for (const [key] of map) {
      if (Math.abs(key - top) < 8) {
        map.get(key).push(card);
        matched = true;
        break;
      }
    }
    if (!matched) map.set(top, [card]);
  });
  return map;
}

/** Returns the 0-based column index of a card within its visual row */
function getColumnIndex(card, rowMap) {
  for (const [, row] of rowMap) {
    const idx = row.indexOf(card);
    if (idx !== -1) return idx;
  }
  return 0;
}

/* ───────────────────────────── main ───────────────────────────── */

export function initCRTReveal() {
  /* ─ reduced-motion bail-out ─ */
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const cards = Array.from(
    document.querySelectorAll('.projects-grid .crt-card')
  );
  if (!cards.length) return;

  if (prefersReduced) {
    cards.forEach((card) => {
      card.style.opacity = '1';
      card.style.clipPath = 'none';
      card.classList.add('crt-revealed');
    });
    return;
  }

  /* Pre-compute row grouping so stagger offsets are known up-front */
  const rowMap = groupIntoRows(cards);

  /* ─ shared observer ─ */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        observer.unobserve(card); // fire once

        const colIdx = getColumnIndex(card, rowMap);
        const staggerDelay = colIdx * 0.12; // left → right within row

        animateCard(card, staggerDelay);
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach((card) => observer.observe(card));
}

/* ───────────────────────── card animation ─────────────────────── */

function animateCard(card, delay) {
  const tl = gsap.timeline({ delay });

  /* ── inject scanline bar ── */
  const scanline = document.createElement('div');
  scanline.className = 'crt-scanline';
  card.appendChild(scanline);

  /* ── inject hover overlay (once, stays after reveal) ── */
  if (!card.querySelector('.crt-hover-overlay')) {
    const overlay = document.createElement('div');
    overlay.className = 'crt-hover-overlay';
    card.appendChild(overlay);
  }

  /* ─ Phase 1 — Scanline sweep + clip-path open (0.6 s) ─ */
  tl.to(
    card,
    {
      clipPath: 'inset(0 0 0% 0)',
      opacity: 1,
      duration: 0.6,
      ease: 'power2.inOut',
    },
    0
  );
  tl.fromTo(
    scanline,
    { top: '0%' },
    {
      top: '100%',
      duration: 0.6,
      ease: 'power2.inOut',
    },
    0
  );

  /* ─ Phase 2 — RGB glitch snap (0.28 s, fires at 70 % of Phase 1 = 0.42 s) ─ */
  tl.call(
    () => card.classList.add('crt-glitch'),
    [],
    0.42
  );
  tl.call(
    () => card.classList.remove('crt-glitch'),
    [],
    0.42 + 0.28
  );

  /* ─ Phase 3 — Phosphor fade-in (starts at end of Phase 1 = 0.6 s) ─ */
  const contentEl = card.querySelector('.crt-card-content');
  if (contentEl) {
    tl.to(
      contentEl,
      {
        opacity: 1,
        duration: 0.2,
        ease: 'power1.out',
      },
      0.6
    );
  }

  /* Phosphor flash — brief brightness+hue pop */
  tl.call(
    () => card.classList.add('crt-phosphor'),
    [],
    0.6
  );
  tl.call(
    () => card.classList.remove('crt-phosphor'),
    [],
    0.68 // 0.08 s flash
  );

  /* ─ Clean-up — remove scanline, mark revealed ─ */
  tl.call(
    () => {
      scanline.style.display = 'none';
      card.classList.add('crt-revealed');
    },
    [],
    0.82 // slightly after everything settles
  );
}
