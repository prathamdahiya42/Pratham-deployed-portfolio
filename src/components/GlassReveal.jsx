import { useEffect, useRef, useState } from 'react';

/**
 * GlassReveal — Interactive contrast lens shader
 *
 * Inside circle: Perfect, razor-sharp, vibrant full color image.
 * Outside circle: Blurry, black-and-white, sketchy pencil drawing with glitch scanlines.
 * Border: Sleek light gray / silver glowing rim.
 *
 * Props:
 * - image: URL of colorful image revealed inside circle (FRONT01)
 * - backgroundImage: URL of base background image for outside sketch (FRONT02)
 * - shape: 'circle' | 'portal' | 'blob' | 'square' (default: 'circle')
 * - size: fraction of container scale (default: 0.44)
 * - blurStrength: radius of outside multi-tap blur (default: 3.5)
 * - glitchStrength: horizontal slice jitter intensity outside (default: 0.025)
 * - glitchSpeed: step rate of glitch slice changes per second (default: 4.0)
 * - sketchStrength: graphite edge and hatching intensity outside (default: 1.0)
 * - distortion: subtle optical lens depth (default: 0.08)
 * - softness: edge feather (default: 0.006)
 * - glowColor: [r, g, b] array normalized 0-1 for silver/light gray rim
 */
export default function GlassReveal({
  image = '/images/hero/FRONT01.webp',
  backgroundImage = '/images/hero/FRONT02.webp',
  shape = 'circle',
  size = 0.44,
  blurStrength = 3.5,
  glitchStrength = 0.025,
  glitchSpeed = 4.0,
  sketchStrength = 1.0,
  distortion = 0.08,
  softness = 0.006,
  glowColor = [0.85, 0.86, 0.90], // Light gray / silver palette
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [glReady, setGlReady] = useState(false);

  // Mouse & ambient animation state
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const lastMoveTimeRef = useRef(Date.now());
  const isInteractingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Init WebGL
    const gl =
      canvas.getContext('webgl', { alpha: false, antialias: true }) ||
      canvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('[GlassReveal] WebGL not supported. Fallback to background.');
      return;
    }

    // Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;

      uniform sampler2D u_image;          // FRONT01 (perfect, colorful inner image)
      uniform sampler2D u_bg_image;       // FRONT02 (blurry, B&W, sketchy outside base)
      uniform vec2 u_resolution;          // Screen dimensions
      uniform vec2 u_image_res;           // Natural image dimensions
      uniform vec2 u_mouse;               // Current mouse [0, 1]
      uniform float u_time;
      uniform float u_size;
      uniform float u_distortion;
      uniform float u_softness;
      uniform int u_shape;                // 0: square, 1: circle, 2: blob, 3: portal
      uniform vec3 u_glow_color;          // Light gray / silver rim highlight
      uniform float u_blur_strength;      // Outside blur strength
      uniform float u_glitch_strength;    // Outside glitch displacement
      uniform float u_glitch_speed;       // Outside glitch update rate
      uniform float u_sketch_strength;    // Outside sketch line & crosshatch intensity

      // Fast hash for glitch & grain
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      // Organic value noise for pencil texture
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Cover projection mapping so images maintain 16:9 ratio with zero stretching
      vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 imgRes) {
        float screenRatio = screenRes.x / screenRes.y;
        float imgRatio = imgRes.x / imgRes.y;
        vec2 sUv = uv;
        if (screenRatio > imgRatio) {
          float s = screenRatio / imgRatio;
          sUv.y = (uv.y - 0.5) / s + 0.5;
        } else {
          float s = imgRatio / screenRatio;
          sUv.x = (uv.x - 0.5) / s + 0.5;
        }
        return sUv;
      }

      void main() {
        vec2 uv = v_uv;
        vec2 screenUv = vec2(uv.x, 1.0 - uv.y);
        vec2 targetUv = getCoverUv(screenUv, u_resolution, u_image_res);

        // Aspect-corrected space for distance calculations centered around mouse
        float minRes = min(u_resolution.x, u_resolution.y);
        vec2 p = (gl_FragCoord.xy - (u_mouse * u_resolution)) / minRes;
        float dist = length(p);
        float angle = atan(p.y, p.x);

        // Calculate base lens radius
        float r = u_size * 0.5;

        // Outline shape calculations
        if (u_shape == 0) { // square
          vec2 b = abs(p);
          dist = max(b.x, b.y);
        } else if (u_shape == 2) { // blob
          float harmonic = sin(angle * 3.0 + u_time * 1.5) * 0.05
                         + cos(angle * 5.0 - u_time * 1.2) * 0.03;
          r += r * 0.15 * harmonic;
        } else if (u_shape == 3) { // portal
          float harmonic = sin(angle * 4.0 + u_time * 1.2) * 0.04
                         + cos(angle * 6.0 - u_time * 0.9) * 0.02;
          r += r * 0.12 * harmonic;
        }
        // u_shape == 1 is pure circle (dist = length(p), r = u_size * 0.5)

        // ═════════════════════════════════════════════════════════════
        // 1. OUTSIDE THE CIRCLE: Blurry, Black-and-White, Sketchy, Glitchy
        // ═════════════════════════════════════════════════════════════

        // (a) Glitch displacement: horizontal slicing & scan jumps (controlled by u_glitch_speed)
        float glitchBlock = floor(targetUv.y * 36.0);
        float glitchStep = floor(u_time * u_glitch_speed);
        float glitchRand = hash(vec2(glitchBlock, glitchStep));
        vec2 glitchOffset = vec2(0.0);
        if (glitchRand > 0.85) {
          glitchOffset.x = (hash(vec2(glitchStep, glitchBlock)) - 0.5) * u_glitch_strength * 2.5;
        }

        vec2 outsideUv = targetUv + glitchOffset;

        // (b) Multi-tap disc blur on the outside
        vec2 texel = 1.0 / u_resolution;
        float bSpread = max(u_blur_strength, 1.0);

        vec4 colCenter = texture2D(u_bg_image, outsideUv);
        vec4 colR = texture2D(u_bg_image, outsideUv + vec2( 1.0,  0.0) * texel * bSpread);
        vec4 colL = texture2D(u_bg_image, outsideUv + vec2(-1.0,  0.0) * texel * bSpread);
        vec4 colU = texture2D(u_bg_image, outsideUv + vec2( 0.0,  1.0) * texel * bSpread);
        vec4 colD = texture2D(u_bg_image, outsideUv + vec2( 0.0, -1.0) * texel * bSpread);
        vec4 colUR = texture2D(u_bg_image, outsideUv + vec2( 0.707,  0.707) * texel * bSpread * 1.4);
        vec4 colUL = texture2D(u_bg_image, outsideUv + vec2(-0.707,  0.707) * texel * bSpread * 1.4);
        vec4 colDR = texture2D(u_bg_image, outsideUv + vec2( 0.707, -0.707) * texel * bSpread * 1.4);
        vec4 colDL = texture2D(u_bg_image, outsideUv + vec2(-0.707, -0.707) * texel * bSpread * 1.4);

        vec4 blurredBg = (colCenter * 2.0 + (colR + colL + colU + colD) * 1.25 + (colUR + colUL + colDR + colDL) * 0.75) / 10.0;

        // (c) Black-and-white conversion (monochrome luminance)
        float lumBlurred = dot(blurredBg.rgb, vec3(0.299, 0.587, 0.114));
        float lumR = dot(colR.rgb, vec3(0.299, 0.587, 0.114));
        float lumL = dot(colL.rgb, vec3(0.299, 0.587, 0.114));
        float lumU = dot(colU.rgb, vec3(0.299, 0.587, 0.114));
        float lumD = dot(colD.rgb, vec3(0.299, 0.587, 0.114));

        // (d) Sketchy effect: Pencil outlines + Graphite crosshatching + Paper grain
        float dX = abs(lumR - lumL);
        float dY = abs(lumU - lumD);
        float edgeOutline = clamp(sqrt(dX * dX + dY * dY) * 5.0 * u_sketch_strength, 0.0, 1.0);
        float pencilLine = 1.0 - edgeOutline;

        // Diagonal graphite pencil strokes
        vec2 sc = gl_FragCoord.xy;
        float n = noise(sc * 0.08 + u_time * 0.08);
        float hatch1 = clamp(sin((sc.x + sc.y) * 0.75 + n * 3.5) * 1.8 + 0.2, 0.0, 1.0);
        float hatch2 = clamp(sin((sc.x - sc.y) * 0.75 - n * 3.5) * 1.8 + 0.2, 0.0, 1.0);

        float hatchTone = 1.0;
        if (lumBlurred < 0.60) {
          hatchTone = mix(hatchTone, hatch1, (0.60 - lumBlurred) / 0.60 * 0.65 * u_sketch_strength);
        }
        if (lumBlurred < 0.30) {
          hatchTone = mix(hatchTone, hatch2, (0.30 - lumBlurred) / 0.30 * 0.75 * u_sketch_strength);
        }

        // Fine graphite paper grain
        float paperGrain = (hash(gl_FragCoord.xy + fract(u_time * 0.01) * 70.0) - 0.5) * 0.08;

        // Combine B&W blur with sketchy drawing
        float bwSketch = clamp((lumBlurred * 0.52 + hatchTone * 0.44) * pencilLine + paperGrain, 0.0, 1.0);

        // Subtle glitch scanline flicker outside (scales with glitch speed)
        float scanline = sin(gl_FragCoord.y * 1.5 + u_time * (u_glitch_speed * 1.25)) * 0.025 * u_glitch_strength * 20.0;
        bwSketch = clamp(bwSketch + scanline, 0.0, 1.0);

        vec3 outsideColor = vec3(bwSketch);

        // ═════════════════════════════════════════════════════════════
        // 2. INSIDE THE CIRCLE: Perfect, Colorful, Sharp, Pristine
        // ═════════════════════════════════════════════════════════════
        vec2 dir = (dist > 0.0001) ? normalize(p) : vec2(0.0);
        float nd = clamp(dist / max(r, 0.001), 0.0, 1.0);
        float warp = pow(nd, 3.0) * u_distortion * 0.02;
        vec2 insideUv = targetUv - dir * warp;

        vec4 insideTex = texture2D(u_image, insideUv);
        vec3 insideColor = insideTex.rgb;

        // ═════════════════════════════════════════════════════════════
        // 3. TRANSITION & SILVER / LIGHT GRAY CIRCLE RIM
        // ═════════════════════════════════════════════════════════════
        float feather = max(u_softness, 0.002);
        float mask = smoothstep(r - feather, r + feather, dist);

        vec3 blended = mix(insideColor, outsideColor, mask);

        float edgeDist = abs(dist - r);
        float rim = smoothstep(0.016, 0.0, edgeDist);
        float specular = pow(smoothstep(0.75, 1.0, nd), 3.0) * 0.14;

        vec3 rimHighlight = mix(u_glow_color, vec3(1.0, 1.0, 1.0), sin(u_time * 2.0 + angle * 2.0) * 0.5 + 0.5);
        float outerAura = smoothstep(0.05, 0.0, dist - r) * 0.15;

        vec3 finalRgb = blended
                      + (rimHighlight * rim * 0.85)
                      + (u_glow_color * outerAura * (1.0 - rim))
                      + (vec3(specular) * (1.0 - mask));

        gl_FragColor = vec4(finalRgb, 1.0);
      }
    `;

    // Compile shader helper
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('[GlassReveal] Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[GlassReveal] Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full screen quad buffer
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uImageRes = gl.getUniformLocation(program, 'u_image_res');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uSize = gl.getUniformLocation(program, 'u_size');
    const uDistortion = gl.getUniformLocation(program, 'u_distortion');
    const uSoftness = gl.getUniformLocation(program, 'u_softness');
    const uShape = gl.getUniformLocation(program, 'u_shape');
    const uGlowColor = gl.getUniformLocation(program, 'u_glow_color');
    const uBlurStrength = gl.getUniformLocation(program, 'u_blur_strength');
    const uGlitchStrength = gl.getUniformLocation(program, 'u_glitch_strength');
    const uGlitchSpeed = gl.getUniformLocation(program, 'u_glitch_speed');
    const uSketchStrength = gl.getUniformLocation(program, 'u_sketch_strength');
    const uImage = gl.getUniformLocation(program, 'u_image');
    const uBgImage = gl.getUniformLocation(program, 'u_bg_image');

    // Create textures
    function createTexture(imageSrc, unit) {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Temporary 1x1 placeholder
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([20, 10, 35, 255])
      );

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        naturalImageRes = { w: img.naturalWidth || 2730, h: img.naturalHeight || 1536 };
      };
      img.onerror = () => {
        // Fallback to png if webp failed
        if (imageSrc.endsWith('.webp')) {
          img.src = imageSrc.replace('.webp', '.png');
        }
      };
      img.src = imageSrc;
      return texture;
    }

    let naturalImageRes = { w: 2730, h: 1536 };
    const fgTexture = createTexture(image, 0);
    const bgTexture = createTexture(backgroundImage, 1);

    gl.uniform1i(uImage, 0);
    gl.uniform1i(uBgImage, 1);

    // Map shape prop to integer
    const shapeMap = { square: 0, circle: 1, blob: 2, portal: 3 };
    const shapeCode = shapeMap[shape] !== undefined ? shapeMap[shape] : 3;

    // Handle Resize
    let width = 0;
    let height = 0;
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.round(rect.width * dpr);
      height = Math.round(rect.height * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };
    updateSize();

    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(container);

    // Pointer Event Listeners
    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, 1.0 - (e.clientY - rect.top) / rect.height)); // WebGL bottom-left
      targetMouseRef.current = { x, y };
      lastMoveTimeRef.current = Date.now();
      isInteractingRef.current = true;
    };

    const onPointerLeave = () => {
      isInteractingRef.current = false;
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, 1.0 - (touch.clientY - rect.top) / rect.height));
        targetMouseRef.current = { x, y };
        lastMoveTimeRef.current = Date.now();
        isInteractingRef.current = true;
      }
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    container.addEventListener('mouseleave', onPointerLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchMove, { passive: true });

    setGlReady(true);

    // Animation Loop
    let animationFrameId;
    const startTime = performance.now();

    const render = (now) => {
      const elapsed = prefersReducedMotion ? 0 : (now - startTime) / 1000;

      // Ambient idle drift if no mouse movement for 1.8 seconds (great for mobile & idle desktop)
      const timeSinceMove = Date.now() - lastMoveTimeRef.current;
      if (!isInteractingRef.current || timeSinceMove > 1800) {
        const ambientX = 0.5 + Math.cos(elapsed * 0.55) * 0.18 + Math.sin(elapsed * 0.25) * 0.08;
        const ambientY = 0.5 + Math.sin(elapsed * 0.65) * 0.16;
        targetMouseRef.current = {
          x: Math.max(0.15, Math.min(0.85, ambientX)),
          y: Math.max(0.15, Math.min(0.85, ambientY)),
        };
      }

      // Smooth exponential lerp
      const lerp = 0.065;
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * lerp;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * lerp;

      // Set Uniforms
      gl.uniform2f(uResolution, width, height);
      gl.uniform2f(uImageRes, naturalImageRes.w, naturalImageRes.h);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      const isMobileView = width > 0 && (width / dpr) < 768;
      const effectiveSize = isMobileView ? Math.max(size, 0.52) : size;
      gl.uniform1f(uSize, effectiveSize);
      gl.uniform1f(uDistortion, distortion);
      gl.uniform1f(uSoftness, softness);
      gl.uniform1i(uShape, shapeCode);
      gl.uniform3f(uGlowColor, glowColor[0], glowColor[1], glowColor[2]);
      gl.uniform1f(uBlurStrength, blurStrength);
      gl.uniform1f(uGlitchStrength, prefersReducedMotion ? 0 : glitchStrength);
      gl.uniform1f(uGlitchSpeed, prefersReducedMotion ? 0 : glitchSpeed);
      gl.uniform1f(uSketchStrength, sketchStrength);

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchMove);

      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteTexture(fgTexture);
      gl.deleteTexture(bgTexture);
    };
  }, [
    image,
    backgroundImage,
    shape,
    size,
    distortion,
    softness,
    glowColor,
    blurStrength,
    glitchStrength,
    glitchSpeed,
    sketchStrength,
  ]);

  return (
    <div
      ref={containerRef}
      className={`glass-reveal-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none', // Allows clicking through to hero buttons & interactive elements
        ...style,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
