# Technical Specification & Project Summary: Portfolio Website

## 1. Project Overview

| Property | Value |
| :--- | :--- |
| **Project Name** | `001` (per `package.json`), Portfolio for Pratham Dahiya / House VibeCoders |
| **Project Type** | Personal developer portfolio website |
| **Purpose** | Showcases client builds, hackathon projects, technical capabilities, content creation, and provides an interactive AI chat agent |
| **Deployment Platform** | Netlify (configured via `netlify.toml` with Netlify Serverless Functions) |
| **Live URL** | Not found in repository codebase or configuration files |
| **Form Factor Support** | Responsive (both Desktop and Mobile supported via adaptive CSS Grid, Flexbox, touch event listeners, and media queries) |

---

## 2. Complete Tech Stack (with versions)

### Framework & Language
| Package / Technology | Declared Version | Installed Version | Usage |
| :--- | :--- | :--- | :--- |
| `react` | `^19.2.7` | `19.2.7` | UI library / runtime |
| `react-dom` | `^19.2.7` | `19.2.7` | DOM rendering entry point |
| `typescript` | `~6.0.2` | `6.0.3` | Type declarations and compiler checks (`tsconfig.json`) |
| JavaScript (ESM) | ES2023 | N/A | Primary language for components, animations, and scripts |

### Styling
| Technology / File | Details |
| :--- | :--- |
| **CSS Custom Properties** | Scoped theme variables (`--bg-primary`, `--bg-secondary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--accent-primary`, `--accent-secondary`, `--accent-glow`, `--border-subtle`, `--glass-bg`, `--glass-border`, `--glass-shadow`) |
| **Component CSS Files** | `src/index.css`, `src/components/Lanyard.css`, `src/components/PixelCard.css`, `src/components/SplitFlapText.css`, `src/components/TechText.css`, `src/animations/crtReveal.css`, `src/animations/rubberTear.css` |
| **Glassmorphism / Filters** | Hardware-accelerated CSS `backdrop-filter: blur(16px)` and `-webkit-backdrop-filter` |
| **Tailwind Configuration** | Referenced via `components.json` registry setup; core layouts authored using native CSS classes and inline style definitions |

### UI Component Libraries
| Library / Source | Adapted Components |
| :--- | :--- |
| **React Bits / React Bits Pro** | `TechText`, `PixelCard`, `SplitFlapText`, `DecryptedText`, `BlurText`, `AsciiTiles`, `GlassReveal`, `Lanyard` |
| **Native Custom Components** | `DualImageReveal`, `CustomCursor`, `TiltCard`, `StarField`, `SectionDivider`, `ScrollReveal`, `ProjectLanyardModal`, `AgentChat` |

### Animation & Motion
| Package | Declared Version | Installed Version | Usage |
| :--- | :--- | :--- | :--- |
| `framer-motion` | `^12.41.0` | `12.41.0` | Declarative UI animations, presence exits, view triggers (`motion.div`, `AnimatePresence`) |
| `gsap` | `^3.15.0` | `3.15.0` | Multi-step animation timelines, canvas membrane shatter physics in `rubberTear.js`, scanlines in `crtReveal.js` |
| `@studio-freight/lenis` | `^1.0.42` | `1.0.42` | Inertial smooth scroll hook in `src/App.jsx` (`useSmoothScroll`) |
| `lenis` | `^1.3.23` | `1.3.23` | Smooth scroll dependency |

### 3D / Graphics
| Package / Technology | Declared Version | Installed Version | Usage |
| :--- | :--- | :--- | :--- |
| `three` | `^0.184.0` | `0.184.0` | WebGL 3D core engine |
| `@react-three/fiber` | `^9.8.1` | `9.8.1` | React Three Fiber canvas wrapper |
| `@react-three/drei` | `^10.7.9` | `10.7.9` | Helpers: `PresentationControls`, `Float`, `useGLTF`, `useTexture`, `Environment`, `ContactShadows` |
| `@react-three/rapier` | `^2.2.0` | `2.2.0` | Physics engine dependency |
| `meshline` | `^3.3.1` | `3.3.1` | Mesh line geometry dependency |
| **Raw WebGL / GLSL Shaders** | Custom | N/A | Custom vertex & fragment shaders in `GlassReveal.jsx` (lens refraction & sketch) and `StarField.jsx` (particle field) |
| **3D Asset Models** | Binary GLTF | N/A | `/public/assets/lanyard/card.glb` and `/src/assets/lanyard/card.glb` |

### State & Data
| Technology | Scope | Purpose |
| :--- | :--- | :--- |
| **React Hooks** | Client | `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, `lazy`, `Suspense` |
| **Theme State** | Client | Scoped `themeMode` (`'Dim'` vs `'Daylight'`) |
| **Category State** | Client | Filter state for project tabs (`'All'`, `'Client Work'`, `'Hackathons'`, `'Personal Builds'`, `'For Fun'`) |
| **Modal State** | Client | `selectedLanyardProject` object tracking active 3D badge modal |
| **Static Data** | Client / Server | 11 project records, metric statistics, skill classifications, video embeds in `App.jsx`, knowledge base in `content/agent-context.md` |
| `@upstash/redis` | Server | `^1.39.0` (installed `1.39.0`) — Upstash Cloud Redis client for distributed rate limiting |
| `@upstash/ratelimit` | Server | `^2.2.0` (installed `2.2.0`) — Sliding window rate limiter (8 requests / min / IP) |

### Fonts
| Font Family | Weights | Delivery Method | Purpose |
| :--- | :--- | :--- | :--- |
| **Inter** | 300, 400, 500, 600 | Google Fonts CDN (`index.html`) | Primary UI body copy, badges, buttons, subtitles |
| **Sora** | 400, 600, 700, 800 | Google Fonts CDN (`index.html`) | Section headings, primary display titles, statistics counters |
| **System Monospace** | Regular | Native CSS fallback stack | `TechText` coordinate labels, code blocks, terminal chat |

### Build Tools & Package Manager
| Tool | Declared Version | Installed Version | Details |
| :--- | :--- | :--- | :--- |
| `vite` | `^8.0.12` | `8.0.16` | Build bundler, dev server, and asset optimizer |
| `@vitejs/plugin-react` | `^6.0.3` | `6.0.3` | React Fast Refresh and JSX transformation |
| `dotenv` | `^18.0.4` | `18.0.4` | Environment variable loader in `vite.config.js` |
| **npm** | lockfileVersion: 3 | N/A | Package manager (`package-lock.json`) |
| **Custom Vite Dev Plugin** | Custom | N/A | `agentDevApiPlugin()` in `vite.config.js` simulating `/api/agent` Netlify function locally |

### Deployment / Hosting
| Component | Details |
| :--- | :--- |
| **Platform** | Netlify |
| **Build Settings** | Command: `npm run build`, Publish directory: `dist` (`netlify.toml`) |
| **Serverless Functions** | `netlify/functions/agent.js` handling `/api/agent` redirect with status 200 |
| **Repository Remote** | `https://github.com/prathamdahiya42/Pratham-deployed-portfolio.git` (branch `main`) |

### APIs, Backend, & Third-Party Services
| Service | Package | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Groq Cloud API** | `groq-sdk` | `^1.6.0` (installed `1.6.0`) | LLM inference backend streaming `llama-3.1-8b-instant` / `qwen/qwen3.8-27b` |
| **Upstash Redis** | `@upstash/redis` | `^1.39.0` (installed `1.39.0`) | Serverless key-value store for API rate limiting |
| **YouTube Embed** | Iframe API | N/A | Embedded video player (`https://www.youtube.com/embed/B1ecCp3f2rU`) |

---

## 3. Architecture & Structure

### Folder Structure (Top 2 Levels)
```text
.
├── .env.local                    # Local environment secrets (excluded from Git)
├── .gitignore                    # Git ignore definitions
├── api/
│   └── agentHandler.js           # Core AI agent logic, Groq streaming, Upstash ratelimit
├── app/
│   └── api/                      # Next.js App Router compatible route definitions
├── components/
│   └── AgentChat.tsx             # Bridge export for AgentChat
├── components.json               # Shadcn / React Bits registry config
├── content/
│   └── agent-context.md          # AI agent system prompt knowledge base
├── index.html                    # Single-page HTML entry point
├── netlify/
│   └── functions/                # Netlify serverless functions (agent.js)
├── netlify.toml                  # Netlify deployment and redirect configurations
├── package-lock.json             # NPM lockfile (v3)
├── package.json                  # Dependencies and build scripts
├── public/
│   ├── assets/                   # Static 3D models and lanyard textures
│   ├── favicon.svg               # Site favicon
│   ├── icons.svg                 # SVG sprite definitions
│   └── images/                   # Compressed hero WebP / PNG layers
├── src/
│   ├── animations/               # CRT scanline and rubber tear animation modules
│   ├── assets/                   # Image assets (real.jpg, ghibli.png, SVGs)
│   ├── components/               # 18 React UI, WebGL, and canvas components
│   ├── utils/                    # Dynamic SVG badge generator for 3D cards
│   ├── App.jsx                   # Primary single-page portfolio layout
│   ├── index.css                 # Global CSS rules, animations, and theme classes
│   └── main.jsx                  # React 19 DOM entry mount point
├── tsconfig.json                 # TypeScript configuration for bundling and linting
└── vite.config.js                # Vite build config with GLB inclusion and dev API middleware
```

### Pages, Routes, and Sections
- **Client-Side Routes**: 1 SPA page route (`/`).
- **Backend / API Routes**: 1 API endpoint (`/api/agent`), handled via `netlify/functions/agent.js` in production and `agentDevApiPlugin` in `vite.config.js` in development.
- **Visual Sections in Layout**:
  1. `Navigation Bar`: Desktop/mobile links, brand identity, and theme toggle (`Dim` vs `Daylight`).
  2. `#hero` (`Introduction`): Interactive WebGL `StarField`, WebGL `GlassReveal` lens shader over `FRONT01`/`FRONT02`, brand pill, `TechText` interactive canvas wordmark, headline, CTA buttons, `SplitFlapText` departure ticker, animated statistics counter, bouncing scroll indicator.
  3. `Section Divider`: Glowing gradient border with centered glowing node.
  4. `.non-hero-container`: Themed container housing all subsequent sections with interactive `AsciiTiles` background.
  5. `#about` (`About me`): Narrative biography and `DualImageReveal` lens comparing real photography to anime artwork.
  6. `#stats` (`Key statistics`): 4 numerical metric cards driven by `StatCounter`.
  7. `#skills` (`Skills and technologies`): Categorized cards (Languages, Frontend, Backend & Database, AI & LLMs, Tools & DevOps) with skill tags.
  8. `#projects` (`Featured Projects`): Category filter bar (`All`, `Client Work`, `Hackathons`, `Personal Builds`, `For Fun`), `PixelCard` canvas grid on the `All` tab, `TiltCard` with CRT styling, `rubberTear.js` scratch overlay, and click-to-open 3D `ProjectLanyardModal`.
  9. `#content` (`Content and creation`): "Know Your Tech" channel spotlight, responsive 16:9 YouTube embed, and video card grid.
  10. `#ask-agent` (`Ask about Pratham AI Agent`): Interactive terminal chat interface (`AgentChat`) connected to the Groq streaming backend.
  11. `#contact` (`Contact`): Direct communication links (email, GitHub, YouTube, Instagram) and availability badge.
  12. `Footer`: House VibeCoders attribution, copyright, and smooth back-to-top anchor.
  13. `Global Overlay Layer`: Magnetic `CustomCursor` and lazy-loaded `ProjectLanyardModal`.

### Rendering Approach
- **Approach**: Client-Side Rendering (CSR).
- **Inference Proof**:
  1. `index.html` contains an empty `<div id="root"></div>` mount target without pre-rendered DOM markup.
  2. `src/main.jsx` initializes rendering strictly in the browser using `ReactDOM.createRoot(document.getElementById('root')).render(...)`.
  3. `vite.config.js` builds a client bundle to `dist/` rather than invoking server pre-rendering.
  4. Dynamic interactions rely on browser APIs (`window`, `document`, WebGL, `requestAnimationFrame`, `IntersectionObserver`, `canvas.getContext`).

---

## 4. Standout Technical Features

| Feature Name | Implementing File(s) | Exact Library / Technique | Technical Description |
| :--- | :--- | :--- | :--- |
| **GlassReveal Contrast Lens** | `src/components/GlassReveal.jsx` | Raw WebGL, GLSL Fragment/Vertex Shaders, `requestAnimationFrame` lerp | Renders an interactive circular lens revealing full-color imagery while the outer perimeter undergoes procedural graphite sketch edge detection, multi-tap blur, and horizontal glitch slices |
| **3D Interactive Card Badge** | `src/components/Lanyard.jsx`, `src/components/ProjectLanyardModal.jsx` | Three.js, `@react-three/fiber`, `@react-three/drei` (`PresentationControls`, `Float`, `useGLTF`) | Renders a 3D GLTF badge model in an interactive WebGL canvas allowing 360° drag rotation and idle floating physics |
| **Dynamic Vector Card Badges** | `src/utils/lanyardBadges.js` | Programmatic SVG generation, Canvas 2D texture compositing | Generates dynamic 600×900 SVG credential cards with project-specific IDs, tags, and seals, mapped onto 3D GLTF card UV coordinates |
| **Rubber Membrane Tear Reveal** | `src/animations/rubberTear.js`, `src/animations/rubberTear.css` | HTML5 2D Canvas, GSAP (`power3.out`), pointer event listeners (`mousedown`/`touchstart`) | Overlays project cards with an opaque canvas membrane that stretches with dynamic stress lines when dragged and shatters into 20 outward-flying shards |
| **CRT Scanline Flip Reveal** | `src/animations/crtReveal.js`, `src/animations/crtReveal.css` | GSAP (`gsap.timeline`), `IntersectionObserver`, CSS `clip-path` | Synchronizes a 3-phase retro CRT monitor sweep across grid rows with clip-path wipe, RGB color splitting, and phosphor flash |
| **Interactive ASCII Matrix** | `src/components/AsciiTiles.jsx`, `src/components/ascii-tiles.jsx` | HTML5 2D Canvas, custom glyph rendering grid, Euclidean distance tracking | Renders a responsive matrix of glowing ASCII characters with optical chromatic refraction that shifts based on mouse distance |
| **Dual-Image Masked Reveal** | `src/components/DualImageReveal.jsx` | CSS `mask-image: radial-gradient`, `requestAnimationFrame` lerp loop | Burns a feathered circular window through an upper anime layer to expose the real photograph beneath based on cursor coordinates |
| **TechText Interactive Wordmark** | `src/components/TechText.jsx`, `src/components/TechText.css` | HTML5 2D Canvas, spring-damping physics, procedural noise algorithms | Renders text with animated scanning light sweeps, spring-damped coordinate calipers, dashed vector lines, and floating particle specks |
| **SplitFlap Departure Board** | `src/components/SplitFlapText.jsx`, `src/components/SplitFlapText.css` | CSS 3D Transforms (`rotateX`, `preserve-3d`), timer interval sequencing | Simulates mechanical split-flap railway departure boards by cycling individual character tiles through randomized alphabets to target words |
| **Reactive Pixel Grid (PixelCard)** | `src/components/PixelCard.jsx`, `src/components/PixelCard.css` | HTML5 2D Canvas, object-oriented pixel particle lifecycle | Displays an interactive retro pixel grid on card faces that illuminates glowing colored square blocks around the visitor's cursor |
| **Pulsating WebGL StarField** | `src/components/StarField.jsx` | Raw WebGL, GLSL Fragment/Vertex Shaders, point attributes (`aPos`, `aSize`, `aSpeed`) | Renders hundreds of GPU-accelerated particle stars drifting with sinusoidal breathing brightness and radial smoothstep falloff |
| **Dual-Ring Magnetic Cursor** | `src/components/CustomCursor.jsx` | Vanilla JS `mousemove` + `requestAnimationFrame`, CSS `translate3d` | Replaces the system cursor on desktop with an instant center dot and an elastic, magnetic lagging outer ring that expands over click targets |
| **3D Perspective Tilt Card** | `src/components/TiltCard.jsx` | React mousemove tracking, CSS 3D transforms (`perspective`, `rotateX`, `rotateY`) | Tilts cards in 3D space based on mouse position relative to card center while sweeping an accent radial highlight across the surface |
| **Streaming AI Agent with Rate Limit** | `src/components/AgentChat.jsx`, `api/agentHandler.js`, `netlify/functions/agent.js` | `groq-sdk`, `@upstash/redis`, `@upstash/ratelimit`, Web Streams (`ReadableStream`) | Streams conversational answers from Groq cloud LLMs based on an embedded markdown system prompt, guarded by Upstash Redis IP rate limiting |
| **Scoped Dual Theme Switcher** | `src/App.jsx`, `src/index.css` | CSS Custom Properties, `.non-hero-container.theme-dim` / `.theme-daylight` | Toggles non-hero sections between OLED Black (`#000000`) and Daylight White (`#FFFFFF`) while preserving the hero's cinematic dark styling |
| **Inertial Momentum Smooth Scroll** | `src/App.jsx` | `@studio-freight/lenis`, `requestAnimationFrame` loop | Intercepts wheel events to provide inertia-based deceleration and smooth momentum scrolling throughout the layout |
| **Cipher Decryption & Focal Blur** | `src/components/DecryptedText.jsx`, `src/components/BlurText.jsx` | `framer-motion`, `IntersectionObserver`, character randomization | Scrambles text with random cyber glyphs until resolving, or applies focal blur transitions staggered per word/letter on scroll |

---

## 5. Custom Work vs Third-Party

### Custom-Coded Components & Modules
- `src/components/DualImageReveal.jsx`: Custom two-layer masked image comparison component using dynamic CSS radial-gradient masks and lerp tracking.
- `src/components/CustomCursor.jsx`: Custom desktop cursor implementation with trailing spring ring and magnetic hover listeners.
- `src/components/TiltCard.jsx`: Custom 3D tilt calculation component with interactive radial light tracking.
- `src/components/StarField.jsx`: Custom raw WebGL canvas shader managing animated star particles.
- `src/components/SectionDivider.jsx`: Custom styled layout divider with ambient glowing center node.
- `src/components/ScrollReveal.jsx`: Custom Framer Motion wrapper abstracting directional scroll triggers and viewport margins.
- `src/components/ProjectLanyardModal.jsx`: Custom modal presentation combining Three.js 3D viewport with project detail metadata.
- `src/animations/rubberTear.js` & `rubberTear.css`: Custom 541-line canvas physics simulation providing stress lines, tear hole punching, and a 20-shard GSAP particle shatter.
- `src/animations/crtReveal.js` & `crtReveal.css`: Custom 179-line GSAP animation module with viewport row clustering, clip-path reveals, and RGB scanline glitch snaps.
- `src/utils/lanyardBadges.js`: Custom SVG badge engine creating dynamic vector ID cards mapped to Three.js textures.
- `api/agentHandler.js`: Custom 255-line request router handling Groq streaming, error recovery, token truncation, and Upstash Redis rate limiting.
- `netlify/functions/agent.js`: Custom serverless wrapper for Netlify deployment.
- `vite.config.js` (`agentDevApiPlugin`): Custom Connect middleware enabling local streaming development.
- `content/agent-context.md`: Custom 209-line structured knowledge base governing the AI portfolio agent.
- `src/App.jsx`: Custom 1,433-line layout controller managing scoped theming, tab filtering, video showcase, and modal lifecycles.

### Adapted from Libraries / Templates
- **React Bits / React Bits Pro Component Patterns**:
  - `src/components/TechText.jsx`: Adapted from React Bits canvas wordmark component.
  - `src/components/PixelCard.jsx`: Adapted from React Bits retro canvas pixel hover card.
  - `src/components/SplitFlapText.jsx`: Adapted from React Bits mechanical departure-board flip ticker.
  - `src/components/DecryptedText.jsx`: Adapted from React Bits cyberpunk text decryptor.
  - `src/components/BlurText.jsx`: Adapted from React Bits stagger blur entrance.
  - `src/components/AsciiTiles.jsx`: Adapted from React Bits Pro interactive ASCII matrix background.
  - `src/components/GlassReveal.jsx`: Adapted from React Bits WebGL contrast lens shader.
  - `src/components/Lanyard.jsx`: Adapted from React Bits Three.js badge card (refactored to remove Rapier string physics in favor of Drei `PresentationControls` and `Float`).
- **External Dependencies**:
  - Three.js (`three`), React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`).
  - Framer Motion (`framer-motion`).
  - GreenSock Animation Platform (`gsap`).
  - Lenis (`@studio-freight/lenis`, `lenis`).
  - Groq SDK (`groq-sdk`).
  - Upstash (`@upstash/redis`, `@upstash/ratelimit`).

---

## 6. Assets & Media Pipeline

### Asset Inventory by Format
| Category | Formats | Paths & Files | Delivery & Loading |
| :--- | :--- | :--- | :--- |
| **3D Models** | `.glb` | `public/assets/lanyard/card.glb`, `src/assets/lanyard/card.glb` (binary GLTF) | Loaded asynchronously via Three.js `useGLTF` hook; configured via `assetsInclude: ['**/*.glb']` in `vite.config.js` |
| **Raster Images** | `.webp` | `public/images/hero/FRONT01.webp`, `public/images/hero/FRONT02.webp` | Compressed WebP format used as primary textures for WebGL `GlassReveal.jsx` |
| **Raster Images** | `.png` | `public/images/hero/FRONT01.png`, `public/images/hero/FRONT02.png`, `src/assets/hero.png`, `src/assets/ghibli.png`, `src/assets/lanyard/lanyard.png` | Fallback hero layers, About section anime layer, lanyard textures |
| **Raster Images** | `.jpg` | `src/assets/real.jpg` | Base photographic layer in `DualImageReveal.jsx` |
| **Vector Assets** | `.svg` | `public/favicon.svg`, `public/icons.svg`, `src/assets/vite.svg`, `src/assets/typescript.svg` | Static SVG icons |
| **Dynamic Vectors** | In-Memory SVG | Generated in `src/utils/lanyardBadges.js` | Procedural SVG templates rendered to base64 data URLs for dynamic 3D canvas textures |
| **Fonts** | WOFF2 / Webfonts | `Inter` and `Sora` | Loaded over HTTPS via Google Fonts CDN with preconnect headers |
| **Video Streams** | Iframe Embed | `https://www.youtube.com/embed/B1ecCp3f2rU` | Lazy iframe embed inside responsive 16:9 container |

---

## 7. Performance & Quality Details

### Performance Optimizations
- **Code Splitting & Dynamic Imports**: `ProjectLanyardModal` is loaded lazily via `React.lazy(() => import('./components/ProjectLanyardModal'))` inside `<Suspense fallback={null}>`. This keeps Three.js, `@react-three/fiber`, and `@react-three/drei` (~1.08 MB minified chunk) isolated from the initial critical page bundle (`dist/assets/index-*.js` is ~514 kB).
- **Device Pixel Ratio (DPR) Clamping**: WebGL and 2D canvas renderers clamp DPR using `Math.min(window.devicePixelRatio, 2)` or `[1, isMobile ? 1.5 : 2]` (in `GlassReveal`, `StarField`, `AsciiTiles`, `Lanyard`, `rubberTear`), preventing fill-rate bottlenecks on high-density displays.
- **Hardware Acceleration**: Transitions utilize GPU-accelerated CSS properties (`transform: translate3d(...)`, `rotateX`, `rotateY`, `opacity`, `clip-path`).
- **Observer De-registration**: `IntersectionObserver` instances in `crtReveal.js` and `ScrollReveal.jsx` immediately call `unobserve()` upon initial intersection to minimize CPU thread monitoring overhead.
- **Web Streaming**: The AI agent endpoint transfers text chunks using `ReadableStream` and `TextEncoder` over HTTP, providing sub-second time-to-first-token without buffering full completions.

### SEO & Metadata
- Base meta tags present in `index.html`:
  - `<meta charset="UTF-8" />`
  - `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
  - `<meta name="description" content="Pratham Dahiya (House VibeCoders) — Self-taught developer building web apps and AI-powered products for real clients. First-year EEE student at UIT RGPV, Bhopal." />`
  - `<title>Pratham Dahiya · House VibeCoders — Portfolio</title>`
- Open Graph / Twitter card tags: Not found in `index.html`.

### Accessibility (a11y)
- **Reduced Motion Support**: Strict `prefers-reduced-motion: reduce` media query checks implemented across `App.jsx`, `GlassReveal.jsx`, `AsciiTiles.jsx`, `SplitFlapText.jsx`, `BlurText.jsx`, `DecryptedText.jsx`, `crtReveal.js`, and `rubberTear.js` to replace intense animations with static views.
- **Coarse Pointer Adaptation**: `CustomCursor.jsx` verifies `(hover: hover) and (pointer: fine)` before running, preventing cursor rendering on mobile/touch interfaces.
- **Semantic HTML & ARIA**: Sections use semantic `<nav>`, `<section>`, `<h2>`, `<h3>`, `<footer>` tags, explicit `aria-label` attributes on navigation landmarks, and `aria-label` descriptions on outbound links.

### Responsiveness Strategy
- Fluid typography and spacing using CSS `clamp()` (`clamp(2rem, 4vw, 3.5rem)`, `clamp(5rem, 12vh, 10rem) 0`).
- Responsive grid templates: `grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))`.
- Breakpoint-specific media queries in `src/index.css`: `@media (max-width: 900px)`, `@media (max-width: 768px)`, `@media (max-width: 480px)`.
- Touch event support (`touchstart`, `touchmove`, `touchend`) implemented in interactive canvas modules (`rubberTear.js`, `Lanyard.jsx`).

---

## 8. Project Stats

| Metric | Exact Count |
| :--- | :--- |
| **Total Components** | 21 (18 in `src/components/`, 2 in `src/App.jsx`, 1 in `components/`) |
| **Total Pages / Client Routes** | 1 (`/`) |
| **Total API Endpoints** | 1 (`/api/agent`) |
| **Declared Production Dependencies** | 16 |
| **Declared Development Dependencies** | 2 |
| **Total Source Code Files (excluding lockfile & binaries)** | 41 |
| **Total Pure Source Lines of Code** | 7,849 lines |
| **Total Codebase Files (including assets & configs, excluding node_modules/git/Objects)** | 59 |
| **Total Text / File Lines (including raw GLTF & base64 assets)** | 62,198 lines |
| **Total Git Commits** | 3 |
| **First Git Commit Date** | `2026-09-26 14:28:23 +0000` |
| **Last Git Commit Date** | `2026-09-29 10:05:00 +0530` |
| **Total Development Span (from git history)** | 3 days |

### Source Code Breakdown by Extension
| Extension | File Count | Line Count |
| :--- | :--- | :--- |
| `.jsx` | 20 | 5,510 |
| `.js` | 6 | 1,241 |
| `.css` | 7 | 760 |
| `.md` | 1 | 209 |
| `.json` | 3 | 83 |
| `.html` | 1 | 26 |
| `.toml` | 1 | 9 |
| `.ts` | 1 | 9 |
| `.tsx` | 1 | 2 |
| **Total** | **41** | **7,849** |

---

## 9. Development Timeline (from git history)

| Date (UTC / Local) | Commit Hash | Author | Commit Message & Scope |
| :--- | :--- | :--- | :--- |
| `2026-09-26 14:28:23 +0000` | `814453a` | `netlify[bot]` | **Initial commit via Netlify [skip ci]**<br>Baseline repository initialization connected with Netlify hosting environment. |
| `2026-09-27 21:43:33 +0530` | `57a1e2f` | `kavita dahiya` | **feat: add AI chat agent, React Bits PixelCard, and interactive 3D project cards**<br>Comprehensive feature release adding:<br>1. AI agent streaming route (`api/agentHandler.js`, `netlify/functions/agent.js`, `content/agent-context.md`) powered by Groq and Upstash Redis rate limiting.<br>2. React Bits `PixelCard` on the "All" tab in the Featured Projects section.<br>3. 3D interactive project cards (`Lanyard.jsx`, `ProjectLanyardModal.jsx`, `card.glb`, `lanyardBadges.js`) with dynamic SVG texture generation.<br>4. Scoped dual theme system (Dim vs Daylight) and custom Vite dev server API middleware. |
| `2026-09-29 10:05:00 +0530` | `b9d7613` | `kavita dahiya` | **fix: prevent auto-scroll to AI agent on load and optimize mobile hero section**<br>Bug fix preventing initial page load from hijacking scroll position to the AI agent section (`AgentChat.jsx`), and responsive CSS enhancements for the mobile hero layout. |

---

## 10. Challenges Solved (evidence-based only)

1. **Eliminating Initial Viewport Scroll Hijacking in Chat Component**:
   - *Problem*: In `src/components/AgentChat.jsx`, the auto-scroll handler used `scrollIntoView()` on component mount, which inadvertently forced the visitor's browser down to `#ask-agent` upon initial page load.
   - *Solution*: Replaced window scroll targeting with container-scoped scrolling (`messagesContainerRef.current.scrollTo(...)`) and introduced an `isInitialMount` ref check to prevent any scroll execution before the user actively sends a message.

2. **Isolating Scoped Themes Without Corrupting the Hero Section**:
   - *Problem*: Switching between `Dim` (OLED black) and `Daylight` (crisp white) across portfolio sections threatened to break the visual contrast of the hero section, which requires a dark canvas for WebGL shaders (`StarField`, `GlassReveal`).
   - *Solution*: In `src/App.jsx` and `src/index.css`, the theme class (`.theme-dim` / `.theme-daylight`) is bound strictly to `.non-hero-container`. All CSS variables (`--bg-primary`, `--text-primary`, `--bg-card`) are scoped within that wrapper, leaving the hero section permanently unaffected.

3. **Dynamic Multi-Project 3D Badge UV Texture Generation**:
   - *Problem*: The 3D GLTF badge model (`card.glb`) requires distinct graphics mapped across the front UV coordinate box (`{ x: 0, y: 0, w: 0.5, h: 0.755 }`) and back UV coordinate box (`{ x: 0.5, y: 0, w: 0.5, h: 0.757 }`) for 11 distinct projects without shipping 22 static image files.
   - *Solution*: `src/utils/lanyardBadges.js` generates high-resolution SVG markup on the fly containing project metadata (ID, title, category, tech stack), converts the vector string to a base64 data URL, and composite-draws both faces onto a single HTML canvas texture loaded by Three.js.

4. **Bridging Streaming Serverless Functions Between Production and Local Vite Dev**:
   - *Problem*: The Groq AI agent streams tokens via SSE Web Streams, which Netlify handles natively via Netlify Functions, but standard Vite dev server does not provide serverless function execution out of the box.
   - *Solution*: Implemented `agentDevApiPlugin()` in `vite.config.js` using Connect middleware. It intercepts `POST /api/agent`, parses the request stream, executes `api/agentHandler.js` loaded with `.env.local` credentials via `dotenv`, and streams `ReadableStream` chunks back to the client identically to production Netlify.

5. **Rate Limiting & DoS Protection in Serverless Architectures**:
   - *Problem*: Exposing a cloud LLM endpoint (`/api/agent`) on a public portfolio invites token exhaustion and API key abuse.
   - *Solution*: In `api/agentHandler.js`, incoming requests are validated against a 500-character limit per message, and client IP addresses (`x-forwarded-for` / `x-real-ip`) are evaluated using `@upstash/ratelimit` with Redis sliding window algorithm (8 requests per minute). Requests exceeding the threshold are blocked with HTTP 429 and rate-limit headers before contacting Groq.

6. **Heavy 3D Engine Bundle Isolation (Code Splitting)**:
   - *Problem*: Importing Three.js, `@react-three/fiber`, and `@react-three/drei` inflates the JavaScript bundle by over 1 MB, severely penalizing initial page load speeds.
   - *Solution*: `ProjectLanyardModal` is loaded via `React.lazy(() => import('./components/ProjectLanyardModal'))` inside `<Suspense fallback={null}>` in `src/App.jsx`. The 3D rendering pipeline is only downloaded when a user clicks a project card.

7. **Vestibular Safety via Universal Reduced-Motion Fallbacks**:
   - *Problem*: Intensive visual effects (WebGL lens distortion, rubber canvas tearing, CRT glitching, ASCII refractions) can cause discomfort for users with vestibular motion sensitivities.
   - *Solution*: Every major animation module (`GlassReveal.jsx`, `AsciiTiles.jsx`, `rubberTear.js`, `crtReveal.js`, `SplitFlapText.jsx`, `BlurText.jsx`, `DecryptedText.jsx`, `App.jsx`) queries `window.matchMedia('(prefers-reduced-motion: reduce)')` and falls back to static rendering without motion.
