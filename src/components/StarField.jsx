import { useEffect, useRef } from 'react';

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const dpr = Math.min(window.devicePixelRatio, 2);

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    // Vertex shader
    const vsSource = `
      attribute vec2 aPos;
      attribute float aSize;
      attribute float aSpeed;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        float t = uTime * aSpeed;
        vAlpha = 0.3 + 0.7 * (0.5 + 0.5 * sin(t));
        gl_Position = vec4(aPos, 0.0, 1.0);
        gl_PointSize = aSize * (0.6 + 0.4 * sin(t));
      }
    `;

    // Fragment shader — smoothstep glow
    const fsSource = `
      precision mediump float;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        float glow = smoothstep(0.5, 0.05, d);
        vec3 color = mix(vec3(0.92, 0.35, 0.05), vec3(0.98, 0.60, 0.20), d * 2.0);
        gl_FragColor = vec4(color, glow * vAlpha * 0.45);
      }
    `;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // 200 twinkling points
    const N = 200;
    const pos = new Float32Array(N * 2);
    const sizes = new Float32Array(N);
    const speeds = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      pos[i * 2] = Math.random() * 2 - 1;          // x: -1 to 1
      pos[i * 2 + 1] = Math.random() * 1.4 - 0.4;  // upper 70% of canvas
      sizes[i] = 1.0 + Math.random() * 3.0;
      speeds[i] = (Math.PI * 2) / (0.5 + Math.random() * 1.5); // 0.5–2s cycle
    }

    function bindAttr(data, name, size) {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }

    bindAttr(pos, 'aPos', 2);
    bindAttr(sizes, 'aSize', 1);
    bindAttr(speeds, 'aSpeed', 1);

    const uTime = gl.getUniformLocation(prog, 'uTime');

    // Additive blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // Pause when off-screen with IntersectionObserver
    let visible = true;
    const obs = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    obs.observe(canvas);

    // Render loop
    let raf;
    const t0 = performance.now();
    function loop() {
      if (visible) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, (performance.now() - t0) / 1000);
        gl.drawArrays(gl.POINTS, 0, N);
      }
      raf = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    />
  );
}
