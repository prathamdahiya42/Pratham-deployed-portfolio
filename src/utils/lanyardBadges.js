/**
 * Dynamic High-Resolution SVG Badge Generator for Lanyard 3D Cards
 * Generates custom front and back badge textures for each project with
 * unique cyber/GoT styling, project metadata, and House VibeCoders seals.
 */

function createFrontSvg(project) {
  const primaryTech = (project.tech || []).slice(0, 3).join(' · ');
  const categoryLabel = (project.category || 'PROJECT').toUpperCase();
  const idNumber = String(project.id || 1).padStart(3, '0');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f0c1b"/>
        <stop offset="50%" stop-color="#18122B"/>
        <stop offset="100%" stop-color="#090514"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#EA580C"/>
        <stop offset="100%" stop-color="#FB923C"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(234, 88, 12, 0.08)" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Card Background -->
    <rect width="600" height="900" rx="36" fill="url(#bg)"/>
    <rect width="600" height="900" rx="36" fill="url(#grid)"/>

    <!-- Subtle Tech Border -->
    <rect x="18" y="18" width="564" height="864" rx="26" fill="none" stroke="rgba(234, 88, 12, 0.35)" stroke-width="2"/>
    <rect x="28" y="28" width="544" height="844" rx="20" fill="none" stroke="rgba(255, 255, 255, 0.06)" stroke-width="1"/>

    <!-- Lanyard Punch Hole Marker -->
    <rect x="250" y="32" width="100" height="14" rx="7" fill="rgba(0,0,0,0.8)" stroke="rgba(234, 88, 12, 0.5)" stroke-width="1.5"/>

    <!-- Header Strip -->
    <g transform="translate(48, 85)">
      <rect x="0" y="0" width="150" height="26" rx="6" fill="rgba(234, 88, 12, 0.16)" stroke="rgba(234, 88, 12, 0.4)" stroke-width="1"/>
      <text x="14" y="18" fill="#FB923C" font-family="'Inter', sans-serif" font-size="11" font-weight="700" letter-spacing="1.5">HOUSE VIBECODERS</text>
      <text x="504" y="18" text-anchor="end" fill="#A1A1AA" font-family="'Inter', sans-serif" font-size="11" font-weight="600" letter-spacing="1">ID // #${idNumber}</text>
    </g>

    <!-- Project Avatar / Graphic Frame -->
    <g transform="translate(48, 140)">
      <rect width="504" height="280" rx="16" fill="rgba(10, 8, 18, 0.85)" stroke="rgba(234, 88, 12, 0.25)" stroke-width="1.5"/>
      <circle cx="252" cy="120" r="64" fill="rgba(234, 88, 12, 0.12)" stroke="url(#accent)" stroke-width="2"/>
      
      <!-- Center Emblem Icon -->
      <polygon points="252,80 292,105 292,145 252,170 212,145 212,105" fill="none" stroke="#FB923C" stroke-width="3"/>
      <circle cx="252" cy="125" r="14" fill="#EA580C"/>

      <text x="252" y="225" text-anchor="middle" fill="#FFFFFF" font-family="'Sora', sans-serif" font-size="13" font-weight="700" letter-spacing="2">DEV PASS // ACCESS GRANTED</text>
      <text x="252" y="248" text-anchor="middle" fill="#A1A1AA" font-family="'Inter', sans-serif" font-size="10" font-weight="500" letter-spacing="1">TAP &amp; DRAG TO TEST PHYSICS</text>
    </g>

    <!-- Project Details -->
    <g transform="translate(48, 460)">
      <!-- Category Badge -->
      <rect x="0" y="0" width="130" height="24" rx="4" fill="rgba(167, 139, 250, 0.18)" stroke="rgba(167, 139, 250, 0.4)" stroke-width="1"/>
      <text x="12" y="16" fill="#C084FC" font-family="'Inter', sans-serif" font-size="10" font-weight="700" letter-spacing="1">${categoryLabel}</text>

      <!-- Project Title -->
      <text x="0" y="65" fill="#FFFFFF" font-family="'Sora', sans-serif" font-size="28" font-weight="800">${escapeXml(project.name)}</text>

      <!-- Tagline -->
      <text x="0" y="105" fill="#D4D4D8" font-family="'Inter', sans-serif" font-size="14" font-weight="500" width="504">
        ${escapeXml(truncateText(project.tagline || project.desc, 60))}
      </text>

      <!-- Tech Stack Badges -->
      <rect x="0" y="140" width="504" height="42" rx="8" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
      <text x="16" y="166" fill="#FB923C" font-family="monospace" font-size="13" font-weight="600">${escapeXml(primaryTech)}</text>
    </g>

    <!-- Footer Barcode & Seal -->
    <g transform="translate(48, 730)">
      <line x1="0" y1="0" x2="504" y2="0" stroke="rgba(234, 88, 12, 0.2)" stroke-width="1"/>
      
      <!-- Fake Barcode -->
      <g fill="#A1A1AA" transform="translate(0, 20)">
        <rect x="0" y="0" width="4" height="48"/>
        <rect x="8" y="0" width="8" height="48"/>
        <rect x="20" y="0" width="3" height="48"/>
        <rect x="28" y="0" width="6" height="48"/>
        <rect x="38" y="0" width="12" height="48"/>
        <rect x="54" y="0" width="3" height="48"/>
        <rect x="62" y="0" width="9" height="48"/>
        <rect x="76" y="0" width="4" height="48"/>
        <rect x="85" y="0" width="10" height="48"/>
        <rect x="100" y="0" width="3" height="48"/>
        <rect x="110" y="0" width="7" height="48"/>
        <rect x="122" y="0" width="4" height="48"/>
        <rect x="132" y="0" width="14" height="48"/>
      </g>
      <text x="0" y="86" fill="#71717A" font-family="monospace" font-size="10">REF: PD-2026-${idNumber}-OK</text>

      <!-- Signature Stamp -->
      <text x="504" y="44" text-anchor="end" fill="#FB923C" font-family="'Sora', sans-serif" font-size="12" font-weight="700">PRATHAM DAHIYA</text>
      <text x="504" y="64" text-anchor="end" fill="#A1A1AA" font-family="'Inter', sans-serif" font-size="10">UIT RGPV · BHOPAL</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createBackSvg(project) {
  const idNumber = String(project.id || 1).padStart(3, '0');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
    <defs>
      <linearGradient id="bgBack" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0714"/>
        <stop offset="50%" stop-color="#120c22"/>
        <stop offset="100%" stop-color="#06030a"/>
      </linearGradient>
      <linearGradient id="hologram" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#a855f7"/>
        <stop offset="33%" stop-color="#06b6d4"/>
        <stop offset="66%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#ec4899"/>
      </linearGradient>
    </defs>

    <rect width="600" height="900" rx="36" fill="url(#bgBack)"/>
    <rect x="18" y="18" width="564" height="864" rx="26" fill="none" stroke="rgba(168, 85, 247, 0.3)" stroke-width="2"/>

    <!-- Holographic Magnetic Security Strip -->
    <rect x="0" y="110" width="600" height="70" fill="url(#hologram)" opacity="0.85"/>
    <rect x="0" y="110" width="600" height="70" fill="rgba(0,0,0,0.15)"/>

    <!-- Seal & Coat of Arms -->
    <g transform="translate(300, 360)">
      <circle cx="0" cy="0" r="110" fill="rgba(234, 88, 12, 0.08)" stroke="rgba(234, 88, 12, 0.35)" stroke-width="2"/>
      <circle cx="0" cy="0" r="95" fill="none" stroke="rgba(168, 85, 247, 0.4)" stroke-dasharray="6,4" stroke-width="1.5"/>

      <!-- Sigil / Geometric Motif -->
      <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="none" stroke="#FB923C" stroke-width="3"/>
      <polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="rgba(234, 88, 12, 0.2)" stroke="#C084FC" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="10" fill="#EA580C"/>

      <text x="0" y="145" text-anchor="middle" fill="#FFFFFF" font-family="'Sora', sans-serif" font-size="18" font-weight="800" letter-spacing="3">HOUSE VIBECODERS</text>
      <text x="0" y="172" text-anchor="middle" fill="#A1A1AA" font-family="'Inter', sans-serif" font-size="11" font-weight="600" letter-spacing="2">VERIFIED PRODUCTION DELIVERABLE</text>
    </g>

    <!-- Authenticity Notice -->
    <g transform="translate(60, 620)">
      <rect width="480" height="150" rx="12" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1"/>
      <text x="24" y="38" fill="#FB923C" font-family="'Sora', sans-serif" font-size="12" font-weight="700">SECURITY SPECIFICATION</text>
      <text x="24" y="65" fill="#A1A1AA" font-family="'Inter', sans-serif" font-size="11" font-weight="400">Authentic build artifact engineered by Pratham Dahiya.</text>
      <text x="24" y="85" fill="#A1A1AA" font-family="'Inter', sans-serif" font-size="11" font-weight="400">Deployed under VibeCoders standard engineering guidelines.</text>
      
      <line x1="24" y1="105" x2="456" y2="105" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1"/>
      <text x="24" y="128" fill="#71717A" font-family="monospace" font-size="10">AUTH HASH: 0x${idNumber}F9A · STATUS: VERIFIED</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

export function getProjectLanyardVisuals(project) {
  return {
    frontImage: createFrontSvg(project),
    backImage: createBackSvg(project),
  };
}
