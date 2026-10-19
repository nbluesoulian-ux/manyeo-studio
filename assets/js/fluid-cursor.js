/**
 * Manyeo Studio - Fluid Cursor Interaction
 * High-performance WebGL fluid ripple simulation matching Works page ScreenPaint
 */
(function() {
  // Disable on mobile/touch devices to preserve 100% mobile performance & stability
  if (typeof window === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

  function initFluidCanvas() {
    const canvas = document.getElementById('manyeo-fluid-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const simRes = 256;

    function createShader(gl, type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    }

    function createProgram(gl, vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, createShader(gl, gl.VERTEX_SHADER, vs));
      gl.attachShader(p, createShader(gl, gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      return p;
    }

    const baseVS = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    // Ping-pong sim shader with curl noise and advection matching ScreenPaint
    const simFS = `
      precision highp float;
      uniform sampler2D u_tex;
      uniform vec2 u_mouse;
      uniform vec2 u_prevMouse;
      uniform vec2 u_res;
      uniform float u_dissipation;
      uniform float u_time;
      varying vec2 v_uv;

      vec2 hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.xx + p3.yz) * p3.zy) * 2.0 - 1.0;
      }

      vec3 noised(in vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
        vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
        vec2 ga = hash(i + vec2(0.0, 0.0));
        vec2 gb = hash(i + vec2(1.0, 0.0));
        vec2 gc = hash(i + vec2(0.0, 1.0));
        vec2 gd = hash(i + vec2(1.0, 1.0));
        float va = dot(ga, f - vec2(0.0, 0.0));
        float vb = dot(gb, f - vec2(1.0, 0.0));
        float vc = dot(gc, f - vec2(0.0, 1.0));
        float vd = dot(gd, f - vec2(1.0, 1.0));
        return vec3(va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * (va - vb - vc + vd),
                    ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) +
                    du * (u.yx * (va - vb - vc + vd) + vec2(vb, vc) - va));
      }

      void main() {
        vec2 uv = v_uv;
        vec4 prev = texture2D(u_tex, uv);
        vec2 vel = prev.xy;
        float strength = prev.z;

        // Curl noise advection
        vec3 n = noised(uv * 12.0 + u_time * 0.2);
        vec2 curl = vec2(n.y, -n.z) * 0.0035;

        vec2 advectCoord = uv - (vel * 0.015 + curl);
        vec4 advected = texture2D(u_tex, advectCoord);
        
        vel = mix(vel, advected.xy, 0.75) * u_dissipation;
        strength = advected.z * u_dissipation;

        // Mouse stroke calculation
        vec2 p = uv * u_res;
        vec2 a = u_prevMouse * u_res;
        vec2 b = u_mouse * u_res;
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
        float d = length(pa - ba * h);

        float radius = 55.0;
        float mouseSpeed = length(b - a);
        if (d < radius && mouseSpeed > 0.05) {
          float factor = exp(-d * d / (radius * radius * 0.45));
          vec2 mouseDir = normalize(b - a + 1e-4) * min(mouseSpeed * 0.08, 1.5);
          vel += mouseDir * factor;
          strength = clamp(strength + factor * 0.7, 0.0, 1.0);
        }

        gl_FragColor = vec4(vel, strength, 1.0);
      }
    `;

    // Render pass with silky iridescent liquid sheen
    const renderFS = `
      precision highp float;
      uniform sampler2D u_tex;
      uniform vec2 u_res;
      varying vec2 v_uv;

      void main() {
        vec4 data = texture2D(u_tex, v_uv);
        vec2 vel = data.xy;
        float strength = data.z;

        float speed = length(vel);
        if (speed < 0.0005 && strength < 0.0005) {
          discard;
        }

        // Manyeo ScreenPaint color formula:
        // sin(vec3(vel.x + vel.y) * 42.0 + vec3(0.0, 2.0, 4.0) * 0.85)
        float wave = (vel.x + vel.y) * 42.0;
        vec3 iridescent = sin(vec3(wave) + vec3(0.0, 2.0, 4.0) * 0.85) * 0.5 + 0.5;

        vec3 baseTone = vec3(0.988, 0.702, 0.310); // Butterscotch (#FCB34F)
        vec3 fluidColor = mix(baseTone, iridescent, 0.65);

        float sheen = smoothstep(0.02, 0.4, speed) * 0.65;
        fluidColor += vec3(sheen * 0.35);

        float alpha = smoothstep(0.002, 0.15, strength) * 0.48;

        gl_FragColor = vec4(fluidColor * alpha, alpha);
      }
    `;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    function createFBO(w, h) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { fb, tex, w, h };
    }

    let fboA = createFBO(simRes, simRes);
    let fboB = createFBO(simRes, simRes);

    const simProg = createProgram(gl, baseVS, simFS);
    const renderProg = createProgram(gl, baseVS, renderFS);

    let mouse = { x: 0.5, y: 0.5 };
    let prevMouse = { x: 0.5, y: 0.5 };
    let hasMoved = false;
    let startTime = performance.now();
    let isTicking = false;

    window.addEventListener('mousemove', (e) => {
      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = 1.0 - (e.clientY / window.innerHeight);
      hasMoved = true;
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(step);
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    let idleFrames = 0;

    function step() {
      const elapsed = (performance.now() - startTime) * 0.001;

      // 1. Sim pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.fb);
      gl.viewport(0, 0, simRes, simRes);
      gl.useProgram(simProg);

      const posLoc = gl.getAttribLocation(simProg, 'a_pos');
      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
      gl.uniform1i(gl.getUniformLocation(simProg, 'u_tex'), 0);
      gl.uniform2f(gl.getUniformLocation(simProg, 'u_mouse'), mouse.x, mouse.y);
      gl.uniform2f(gl.getUniformLocation(simProg, 'u_prevMouse'), hasMoved ? prevMouse.x : mouse.x, hasMoved ? prevMouse.y : mouse.y);
      gl.uniform2f(gl.getUniformLocation(simProg, 'u_res'), window.innerWidth, window.innerHeight);
      gl.uniform1f(gl.getUniformLocation(simProg, 'u_dissipation'), 0.968);
      gl.uniform1f(gl.getUniformLocation(simProg, 'u_time'), elapsed);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Swap
      let tmp = fboA; fboA = fboB; fboB = tmp;

      prevMouse.x = mouse.x;
      prevMouse.y = mouse.y;

      // 2. Render pass to canvas
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(renderProg);
      const rPosLoc = gl.getAttribLocation(renderProg, 'a_pos');
      gl.enableVertexAttribArray(rPosLoc);
      gl.vertexAttribPointer(rPosLoc, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboA.tex);
      gl.uniform1i(gl.getUniformLocation(renderProg, 'u_tex'), 0);
      gl.uniform2f(gl.getUniformLocation(renderProg, 'u_res'), width, height);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Continue animating until fluid completely dissipates to save GPU cycles
      idleFrames++;
      if (idleFrames < 140) {
        requestAnimationFrame(step);
      } else {
        isTicking = false;
        idleFrames = 0;
      }
    }

    // Wake up on mouse move
    window.addEventListener('mousemove', () => {
      idleFrames = 0;
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFluidCanvas);
  } else {
    initFluidCanvas();
  }
})();
