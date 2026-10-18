// @ts-nocheck
/*
 * Retro site engine: the 3D monitor hero, the scroll zoom into the screen, the Project Hunt maze game,
 * the CRT glitch/shutter transition and the waving figure in About.
 *
 * It drives the DOM rendered by components/RetroSite.tsx (looked up by id) and returns a destroy()
 * function so React can tear it down cleanly, including StrictMode's double mount in development.
 */
import * as THREE from 'three';
import Lenis from 'lenis';

export function initRetroSite(works) {
  var offs = [], alive = true, renderer;
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    offs.push(function () { target.removeEventListener(type, fn, opts); });
  }
  function destroy() {
    alive = false;
    offs.forEach(function (off) { off(); });
    offs = [];
    try { if (renderer) renderer.dispose(); } catch (e) { /* ignore */ }
    document.documentElement.style.overflow = '';
  }

  var stageEl = document.getElementById('hero');
  var track = document.getElementById('track');
  var canvas = document.getElementById('stage');
  var copyEl = document.getElementById('copy');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); } catch (e) { return destroy; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.autoClear = false;

  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  var fullQuad = new THREE.PlaneGeometry(2, 2);
  var quadVS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';

  /* =========================================================
     1. HERO: smoke + retro computer
     ========================================================= */
  var bgScene = new THREE.Scene();
  var orthoCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  var bgUniforms = { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uFocus: { value: new THREE.Vector2(.7, .35) }, uMouse: { value: new THREE.Vector2(.5, .5) } };
  bgScene.add(new THREE.Mesh(fullQuad, new THREE.ShaderMaterial({
    uniforms: bgUniforms, depthWrite: false, depthTest: false, vertexShader: quadVS,
    fragmentShader: [
      'precision highp float; varying vec2 vUv;',
      'uniform float uTime; uniform vec2 uRes; uniform vec2 uFocus; uniform vec2 uMouse;',
      'float h(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }',
      'float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }',
      'float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<6;i++){ v+=a*n(p); p=p*2.03+vec2(3.1,1.7); a*=.5; } return v; }',
      'void main(){',
      '  vec2 uv = vUv; vec2 p = uv; p.x *= uRes.x/uRes.y;',
      '  float t = uTime*.035;',
      '  vec2 q = vec2(fbm(p*1.6 + vec2(t, -t*.6)), fbm(p*1.6 + vec2(4.2, 1.3) - t));',
      '  float f = fbm(p*1.9 + 2.2*q + vec2(t*.8, 0.) + (uMouse-.5)*.25);',
      '  vec2 fp = uFocus; fp.x *= uRes.x/uRes.y;',
      '  float d = length((p - fp)*vec2(.75, 1.25));',
      '  float halo = exp(-d*1.6);',
      '  vec3 col = vec3(.035,.022,.02);',
      '  vec3 maroon = vec3(.24,.11,.12); vec3 mauve = vec3(.62,.42,.52); vec3 peach = vec3(.95,.62,.48);',
      '  float smoke = smoothstep(.35,.95,f);',
      '  col = mix(col, maroon, smoke*(.35 + .9*halo));',
      '  col = mix(col, mauve, smoothstep(.55,1.,f)*halo*.75);',
      '  col += peach * pow(halo, 3.)*.18;',
      '  float floorBand = exp(-pow((uv.y - (uFocus.y - .18))*5.5, 2.)) * smoothstep(.15,.9,uv.x);',
      '  col += mauve * floorBand * smoke * .35;',
      '  col *= .55 + .45*smoothstep(1.25, .2, length(uv-vec2(.6,.45)));',
      '  col += (h(uv*uRes + uTime) - .5)*.025;',
      '  gl_FragColor = vec4(col, 1.);',
      '}'
    ].join('\n')
  })));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(28, 1, 0.05, 100);

  scene.add(new THREE.HemisphereLight(0xffd9c4, 0x2a1418, 0.35));
  var key = new THREE.DirectionalLight(0xffe2c6, 1.0); key.position.set(-4, 6, 6); scene.add(key);
  var rim = new THREE.DirectionalLight(0xff8fb0, 1.1); rim.position.set(5, 3, -4); scene.add(rim);
  var under = new THREE.PointLight(0xff9a7a, 0.9, 6); under.position.set(0.5, -0.6, 1.5); scene.add(under);

  var beige = new THREE.MeshStandardMaterial({ color: 0x9c8a7c, roughness: 0.6, metalness: 0.02 });
  var beigeDark = new THREE.MeshStandardMaterial({ color: 0x8f8076, roughness: 0.7 });
  var black = new THREE.MeshStandardMaterial({ color: 0x141012, roughness: 0.55 });
  var keyMat = new THREE.MeshStandardMaterial({ color: 0x0e0b0c, roughness: 0.5 });

  var pc = new THREE.Group();
  scene.add(pc);

  function prism(points, width, mat) {
    var s = new THREE.Shape();
    s.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) s.lineTo(points[i][0], points[i][1]);
    s.closePath();
    var g = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 });
    g.rotateY(-Math.PI / 2);
    g.translate(width / 2, 0, 0);
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  }

  var baseW = 2.7;
  pc.add(prism([[0.85, 0], [0.85, 0.12], [-0.05, 0.38], [-0.85, 0.38], [-0.85, 0]], baseW, beige));
  var foot = new THREE.Mesh(new THREE.BoxGeometry(baseW - 0.1, 0.05, 1.6), black); foot.position.set(0, -0.02, 0); pc.add(foot);

  var kb = new THREE.Group();
  kb.position.set(0, 0.25 + 0.012, 0.4);
  kb.rotation.x = Math.atan2(0.26, 0.9);
  pc.add(kb);
  kb.add(new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.02, 0.72), black));
  var keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.105, 0.05, 0.105), keyMat, 120);
  var m4 = new THREE.Matrix4(), idx = 0;
  function addKey(x, z, sx) { m4.makeScale(sx || 1, 1, 1); m4.setPosition(x, 0.03, z); keys.setMatrixAt(idx++, m4); }
  for (var r = 0; r < 5; r++) {
    var off = [0, .04, .07, .1, 0][r];
    for (var c = 0; c < 13; c++) { if (r === 4 && c > 0) break; addKey(-1.1 + off + c * 0.128, -0.28 + r * 0.135); }
  }
  addKey(-0.25, 0.26, 6.2);
  for (var r2 = 0; r2 < 5; r2++) for (var c2 = 0; c2 < 4; c2++) addKey(0.68 + c2 * 0.128, -0.28 + r2 * 0.135);
  keys.count = idx;
  kb.add(keys);

  (function strip() {
    var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 96;
    var x = cv.getContext('2d');
    x.fillStyle = '#121014'; x.fillRect(0, 0, 1024, 96);
    ['#ff4d6d', '#ff9f43', '#ffd166', '#4cc9f0'].forEach(function (cl, i) { x.fillStyle = cl; x.fillRect(28, 26 + i * 12, 54, 7); });
    x.fillStyle = '#9fb4ff'; x.font = 'italic 600 44px Georgia, serif'; x.fillText('NIVED', 100, 64);
    x.fillStyle = '#d8d0c8'; x.font = '600 22px Menlo, monospace'; x.fillText('READY.', 600, 58);
    x.font = 'italic 700 40px Georgia, serif'; x.fillText('Freelance', 760, 62);
    x.font = '14px Menlo, monospace'; x.fillText('MODEL NV-1987', 812, 84);
    var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    var m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.22), new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 }));
    m.rotation.x = -Math.PI / 2; m.position.set(0, 0.405, -0.22); pc.add(m);
  })();

  var mon = new THREE.Group(); mon.position.set(0, 0.38, 0); pc.add(mon);
  mon.add(prism([[-0.38, 0.05], [-0.38, 1.72], [-0.6, 1.78], [-1.55, 1.5], [-1.55, 0.55], [-0.75, 0.05]], 2.15, beige));
  var neck = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.7), beigeDark); neck.position.set(0, 0.02, -0.9); mon.add(neck);
  var bezel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.38, 0.06), black); bezel.position.set(0, 0.93, -0.36); mon.add(bezel);

  /* CRT screen: mixes the globe program (A) with a live render of the showcase (B) */
  var SCREEN_W = 1.62, SCREEN_H = 1.2, SCREEN_Y = 0.93, SCREEN_Z = -0.34, BULGE = 0.07;
  var SW = 640, SH = 480;
  var scv = document.createElement('canvas'); scv.width = SW; scv.height = SH;
  var sx = scv.getContext('2d');
  var globeTex = new THREE.CanvasTexture(scv);
  var gameTex = new THREE.CanvasTexture(document.createElement('canvas'));
  var screenUniforms = { tA: { value: globeTex }, tB: { value: gameTex }, uMix: { value: 0 }, uFlat: { value: 0 } };
  var screenGeo = new THREE.PlaneGeometry(SCREEN_W, SCREEN_H, 24, 18);
  var pos = screenGeo.attributes.position;
  for (var i = 0; i < pos.count; i++) {
    var px = pos.getX(i) / (SCREEN_W / 2), py = pos.getY(i) / (SCREEN_H / 2);
    pos.setZ(i, BULGE * (1 - (px * px * 0.5 + py * py * 0.5)));
  }
  var screen = new THREE.Mesh(screenGeo, new THREE.ShaderMaterial({
    uniforms: screenUniforms, toneMapped: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: [
      'precision highp float; varying vec2 vUv; uniform sampler2D tA; uniform sampler2D tB; uniform float uMix; uniform float uFlat;',
      'void main(){',
      '  vec3 a = texture2D(tA, vUv).rgb;',
      '  vec3 b = texture2D(tB, vUv).rgb;',
      '  float vig = smoothstep(.78, .3, length((vUv-.5)*vec2(1., 1.15)));',
      '  b *= mix((.9 + .1*sin(vUv.y*950.)) * mix(.6, 1., vig), 1., uFlat);',
      '  vec3 c = mix(a, b, uMix);',
      '  gl_FragColor = vec4(c, 1.);',
      '}'
    ].join('\n')
  }));
  screen.position.set(0, SCREEN_Y, SCREEN_Z); mon.add(screen);
  var glowLight = new THREE.PointLight(0x7f9cff, 1.4, 4.5); glowLight.position.set(0, 0.95, 0.6); mon.add(glowLight);

  (function contactShadow() {
    var cv = document.createElement('canvas'); cv.width = cv.height = 128;
    var x = cv.getContext('2d'); var g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    var m = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.y = -0.04; pc.add(m);
  })();

  /* screen program: a brick-built figure waving at whoever is looking at the monitor */
  var GREETS = ['HI THERE!', 'WELCOME IN :)', 'SCROLL DOWN!'];
  function capsule(c, x1, y1, x2, y2, w) {
    c.lineCap = 'round'; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function drawHand(c, x, y, ang) {
    /* C-shaped clip hand */
    c.save(); c.translate(x, y); c.rotate(ang);
    c.strokeStyle = '#f2b81f'; c.lineWidth = 14; c.lineCap = 'round';
    c.beginPath(); c.arc(0, 0, 15, 0.9, Math.PI * 2 - 0.9); c.stroke();
    c.strokeStyle = 'rgba(255,240,170,.55)'; c.lineWidth = 4;
    c.beginPath(); c.arc(0, 0, 17, 2.2, 3.6); c.stroke();
    c.restore();
  }
  function drawBuddy(c, t, crt, greets) {
    var W = SW, H = SH, cx = W / 2;
    if (crt) {
    /* backdrop: the same blue as the boot screen, with a faint pixel floor */
    var g = c.createRadialGradient(cx, H * 0.42, 20, cx, H * 0.5, W * 0.72);
    g.addColorStop(0, '#3a3ac0'); g.addColorStop(0.55, '#2a2a9c'); g.addColorStop(1, '#0d0f4c');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(160,170,255,.12)'; c.lineWidth = 1;
    for (var gx = -12; gx <= 12; gx++) { c.beginPath(); c.moveTo(cx + gx * 26, H * 0.78); c.lineTo(cx + gx * 80, H); c.stroke(); }
    for (var gy = 0; gy < 5; gy++) { var yy = H * 0.78 + Math.pow(gy / 4, 1.8) * H * 0.22; c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); }
    }

    /* wave rhythm: ~2.6s of waving, then a short rest */
    var cyc = t % 3.6, waving = cyc < 2.6 ? Math.sin(Math.PI * Math.min(1, cyc / 2.6)) : 0;
    var wave = Math.sin(t * 9) * 0.42 * waving;
    var breathe = Math.sin(t * 2) * 2;
    var tiltHead = Math.sin(t * 9 + 0.6) * 0.05 * waving;
    var by = 18 + breathe;   /* body offset */

    c.save(); c.translate(0, by);

    /* lowered arm (viewer's left) */
    var shL = { x: cx - 92, y: 312 }, aL = 1.75 + Math.sin(t * 2) * 0.04;
    var elL = { x: shL.x + Math.cos(aL) * 92, y: shL.y + Math.sin(aL) * 92 };
    c.strokeStyle = '#b52a1d'; capsule(c, shL.x, shL.y, elL.x, elL.y, 50);
    c.strokeStyle = '#d93a2b'; capsule(c, shL.x - 3, shL.y, elL.x - 3, elL.y, 40);
    drawHand(c, elL.x - 2, elL.y + 26, Math.PI / 2);

    /* torso: trapezoid with a printed logo */
    c.beginPath(); c.moveTo(cx - 92, 292); c.lineTo(cx + 92, 292); c.lineTo(cx + 118, H + 20); c.lineTo(cx - 118, H + 20); c.closePath();
    var tg = c.createLinearGradient(cx - 120, 0, cx + 120, 0);
    tg.addColorStop(0, '#f04a39'); tg.addColorStop(0.6, '#d93a2b'); tg.addColorStop(1, '#a8251a');
    c.fillStyle = tg; c.fill();
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(cx - 118, 455, 236, 12);
    /* chest print: the striped disc */
    c.save(); c.beginPath(); c.ellipse(cx, 372, 38, 22, 0, 0, 7); c.clip();
    ['#ff4d6d', '#ff9f43', '#ffd166', '#4cc9f0', '#efe6d2'].forEach(function (cl, i) { c.fillStyle = cl; c.fillRect(cx - 40 + (i % 2) * 6, 350 + i * 9, 80, 6); });
    c.restore();

    /* neck */
    c.fillStyle = '#e0a816'; roundRect(c, cx - 26, 276, 52, 22, 4); c.fill();

    /* head with stud on top */
    c.save(); c.translate(cx, 222); c.rotate(tiltHead);
    var hg = c.createLinearGradient(-64, 0, 64, 0);
    hg.addColorStop(0, '#ffe066'); hg.addColorStop(0.55, '#ffcc33'); hg.addColorStop(1, '#e0a816');
    c.fillStyle = '#e0a816'; roundRect(c, -32, -86, 64, 26, 6); c.fill();
    c.fillStyle = '#ffd84d'; c.beginPath(); c.ellipse(0, -86, 32, 8, 0, 0, 7); c.fill();
    c.fillStyle = hg; roundRect(c, -64, -66, 128, 122, 26); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)'; roundRect(c, -52, -58, 18, 90, 9); c.fill();
    /* face */
    var blink = (t % 4.1) < 0.12;
    c.fillStyle = '#1b1410';
    if (blink) { c.fillRect(-32, -10, 18, 4); c.fillRect(14, -10, 18, 4); }
    else { c.beginPath(); c.ellipse(-23, -8, 7, 10, 0, 0, 7); c.ellipse(23, -8, 7, 10, 0, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(-21, -12, 2.6, 0, 7); c.arc(25, -12, 2.6, 0, 7); c.fill(); }
    c.strokeStyle = '#1b1410'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-34, -26 - waving * 5); c.lineTo(-14, -28 - waving * 6); c.moveTo(14, -28 - waving * 6); c.lineTo(34, -26 - waving * 5); c.stroke();
    c.beginPath(); c.arc(0, 14, 24, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
    c.fillStyle = 'rgba(255,120,90,.35)'; c.beginPath(); c.ellipse(-40, 16, 9, 6, 0, 0, 7); c.ellipse(40, 16, 9, 6, 0, 0, 7); c.fill();
    c.restore();

    /* waving arm (viewer's right), drawn last so it sits in front */
    var shR = { x: cx + 92, y: 312 }, aR = -1.15 + wave * 0.35;
    var elR = { x: shR.x + Math.cos(aR) * 70, y: shR.y + Math.sin(aR) * 70 };
    var aF = aR - 0.35 + wave;
    var wrR = { x: elR.x + Math.cos(aF) * 62, y: elR.y + Math.sin(aF) * 62 };
    c.strokeStyle = '#b52a1d'; capsule(c, shR.x, shR.y, elR.x, elR.y, 50); capsule(c, elR.x, elR.y, wrR.x, wrR.y, 46);
    c.strokeStyle = '#e8473a'; capsule(c, shR.x - 2, shR.y - 2, elR.x - 2, elR.y - 2, 40); capsule(c, elR.x - 2, elR.y - 2, wrR.x - 2, wrR.y - 2, 36);
    drawHand(c, wrR.x + Math.cos(aF) * 16, wrR.y + Math.sin(aF) * 16, aF + Math.PI);
    /* motion ticks beside the hand while waving */
    if (waving > 0.3) {
      c.strokeStyle = 'rgba(239,230,210,' + (0.6 * waving) + ')'; c.lineWidth = 4;
      var hx = wrR.x + Math.cos(aF) * 20, hy = wrR.y + Math.sin(aF) * 20, sd = wave > 0 ? 1 : -1;
      for (var m = 0; m < 3; m++) { c.beginPath(); c.moveTo(hx + sd * (34 + m * 3), hy - 26 + m * 18); c.lineTo(hx + sd * (50 + m * 3), hy - 30 + m * 18); c.stroke(); }
    }
    c.restore();

    /* speech bubble that types a greeting */
    var gi = Math.floor(t / 4.5) % (greets || GREETS).length, gt = (t % 4.5);
    var msg = (greets || GREETS)[gi].slice(0, Math.min((greets || GREETS)[gi].length, Math.floor(gt * 14)));
    if (msg.length) {
      c.font = '700 30px Menlo, "Courier New", monospace';
      var mw = Math.max(c.measureText((greets || GREETS)[gi]).width, 120) + 36, bx = 46, byy = 70;
      c.fillStyle = '#efe6d2'; roundRect(c, bx, byy, mw, 58, 10); c.fill();
      c.beginPath(); c.moveTo(bx + mw - 70, byy + 56); c.lineTo(bx + mw - 30, byy + 56); c.lineTo(bx + mw - 10, byy + 90); c.closePath(); c.fill();
      c.fillStyle = '#16166a'; c.fillText(msg + (Math.floor(t * 3) % 2 && msg.length < (greets || GREETS)[gi].length ? '_' : ''), bx + 18, byy + 39);
    }
    if (crt) {
    c.fillStyle = '#c9d6ff'; c.font = '600 16px Menlo, monospace';
    c.fillText('NIVED OS  //  VISITOR DETECTED', 34, 40);
    c.fillText('> SAY HELLO' + (Math.floor(t * 2) % 2 ? ' _' : ''), 34, H - 30);

    /* CRT treatment */
    c.fillStyle = 'rgba(0,0,0,.2)';
    for (var y = 0; y < H; y += 3) c.fillRect(0, y, W, 1);
    var band = (t * 90) % (H + 120) - 60;
    var bg = c.createLinearGradient(0, band - 40, 0, band + 40);
    bg.addColorStop(0, 'rgba(255,255,255,0)'); bg.addColorStop(.5, 'rgba(200,220,255,.08)'); bg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = bg; c.fillRect(0, band - 40, W, 80);
    var vg = c.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.62);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.8)');
    c.fillStyle = vg; c.fillRect(0, 0, W, H);
    }
  }
  function drawGlobe(t) { drawBuddy(sx, t, true); globeTex.needsUpdate = true; }

  /* =========================================================
     2. PROJECT HUNT: maze game that lives on the CRT
     ========================================================= */
  var WORKS = works;
  var gameCanvas = document.getElementById('gameCanvas');
  var game = createGame(gameCanvas, WORKS, function (kind, i) { openCard(kind, i); });
  gameTex.image = gameCanvas;

  function createGame(cv, works, onCard) {
    var ctx = cv.getContext('2d');
    var T = 44, HUD = 64;
    var DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    var LAYOUTS = { landscape: { W: 25, H: 17, seed: 2026 }, portrait: { W: 15, H: 21, seed: 1987 } };
    var L = null, g, W, H, wallCache, items, itemList, start, spawn, corners;
    var player, bugs, state = 'attract', prevState = null, score = 0, lives = 3, level = 1, found = [];
    var scaredT = 0, modeT = 0, deadT = 0, time = 0, popups = [], banner = '', bannerT = 0, combo = 1;

    function rng(seed) { return function () { seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

    /* symmetric maze with loops and no dead ends */
    function makeMaze(W, H, seed) {
      var R = rng(seed), g = [], x, y, i;
      for (y = 0; y < H; y++) { g.push([]); for (x = 0; x < W; x++) g[y].push(1); }
      var half = Math.floor((W - 1) / 2);
      var seen = {}, stack = [[1, 1]]; g[1][1] = 0; seen['1,1'] = 1;
      while (stack.length) {
        var c = stack[stack.length - 1], nb = [];
        for (i = 0; i < 4; i++) {
          var nx = c[0] + DIRS[i][0] * 2, ny = c[1] + DIRS[i][1] * 2;
          if (nx >= 1 && nx <= half && ny >= 1 && ny <= H - 2 && !seen[nx + ',' + ny]) nb.push([nx, ny, DIRS[i]]);
        }
        if (!nb.length) { stack.pop(); continue; }
        var n = nb[Math.floor(R() * nb.length)];
        g[c[1] + n[2][1]][c[0] + n[2][0]] = 0; g[n[1]][n[0]] = 0; seen[n[0] + ',' + n[1]] = 1; stack.push([n[0], n[1]]);
      }
      for (y = 1; y < H - 1; y++) for (x = 1; x < half; x++) {
        var between = (x % 2 === 0 && y % 2 === 1) || (x % 2 === 1 && y % 2 === 0);
        if (between && g[y][x] === 1 && R() < 0.22) g[y][x] = 0;
      }
      if (half % 2 === 0) { /* center column is a wall column: punch doors through it */
        for (y = 1; y < H - 1; y += 2) if (y === 1 || y === H - 2 || R() < 0.4) g[y][half] = 0;
      }
      for (var pass = 0; pass < 3; pass++) {
        for (y = 1; y < H - 1; y += 2) for (x = 1; x <= half; x += 2) {
          var openN = 0, cands = [];
          for (i = 0; i < 4; i++) {
            var wx = x + DIRS[i][0], wy = y + DIRS[i][1];
            if (g[wy][wx] === 0) openN++;
            else if (x + DIRS[i][0] * 2 >= 1 && x + DIRS[i][0] * 2 <= W - 2 && y + DIRS[i][1] * 2 >= 1 && y + DIRS[i][1] * 2 <= H - 2 && !(half % 2 === 1 && x === half && DIRS[i][0] !== 0)) cands.push([wx, wy]);
          }
          if (openN <= 1 && cands.length) { var w = cands[Math.floor(R() * cands.length)]; g[w[1]][w[0]] = 0; }
        }
      }
      for (y = 0; y < H; y++) for (x = half + 1; x < W; x++) g[y][x] = g[y][W - 1 - x];
      return g;
    }

    function open(x, y) { return y >= 0 && y < H && x >= 0 && x < W && g[y][x] === 0; }
    function nearestOpen(tx, ty) {
      var best = null, bd = 1e9;
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) if (g[y][x] === 0) {
        var d = (x - tx) * (x - tx) + (y - ty) * (y - ty); if (d < bd) { bd = d; best = { x: x, y: y }; }
      }
      return best;
    }

    function buildWalls() {
      wallCache = document.createElement('canvas'); wallCache.width = W * T; wallCache.height = H * T;
      var c = wallCache.getContext('2d');
      c.fillStyle = '#0d1046';
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) if (g[y][x] === 1) c.fillRect(x * T, y * T, T, T);
      function edges(width, style) {
        c.strokeStyle = style; c.lineWidth = width; c.lineCap = 'round'; c.beginPath();
        var k = 7;
        for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
          if (g[y][x] !== 1) continue;
          var X = x * T, Y = y * T;
          if (open(x, y - 1)) { c.moveTo(X + (open(x - 1, y) ? k : 0), Y + k); c.lineTo(X + T - (open(x + 1, y) ? k : 0), Y + k); }
          if (open(x, y + 1)) { c.moveTo(X + (open(x - 1, y) ? k : 0), Y + T - k); c.lineTo(X + T - (open(x + 1, y) ? k : 0), Y + T - k); }
          if (open(x - 1, y)) { c.moveTo(X + k, Y + (open(x, y - 1) ? k : 0)); c.lineTo(X + k, Y + T - (open(x, y + 1) ? k : 0)); }
          if (open(x + 1, y)) { c.moveTo(X + T - k, Y + (open(x, y - 1) ? k : 0)); c.lineTo(X + T - k, Y + T - (open(x, y + 1) ? k : 0)); }
        }
        c.stroke();
      }
      edges(10, 'rgba(110,125,255,.18)');
      edges(3, '#8593ff');
    }

    function setLayout(name) {
      if (L && L.name === name) return;
      L = LAYOUTS[name]; L.name = name;
      if (!L.g) L.g = makeMaze(L.W, L.H, L.seed);
      g = L.g; W = L.W; H = L.H;
      cv.width = W * T; cv.height = H * T + HUD;
      start = nearestOpen(Math.floor(W / 2), Math.round(H * 0.74));
      spawn = nearestOpen(Math.floor(W / 2), Math.round(H * 0.3));
      corners = [{ x: 1, y: 1 }, { x: W - 2, y: 1 }, { x: 1, y: H - 2 }, { x: W - 2, y: H - 2 }];
      buildWalls();
      fillItems(true);
      resetPositions();
    }

    function fillItems(withProjects) {
      items = {};
      var k;
      for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) if (g[y][x] === 0) items[x + ',' + y] = { x: x, y: y, type: 'dot' };
      corners.forEach(function (c) { var o = nearestOpen(c.x, c.y); items[o.x + ',' + o.y] = { x: o.x, y: o.y, type: 'coffee' }; });
      if (withProjects) {
        /* spread folders out with farthest-point sampling (deterministic) */
        var picked = [start, spawn];
        var open_ = Object.keys(items).map(function (q) { return items[q]; }).filter(function (it) { return it.type === 'dot'; });
        for (var i = 0; i < works.length; i++) {
          var best = null, bd = -1;
          open_.forEach(function (it) {
            var md = 1e9; picked.forEach(function (p) { var d = Math.abs(p.x - it.x) + Math.abs(p.y - it.y); if (d < md) md = d; });
            if (md > bd) { bd = md; best = it; }
          });
          picked.push(best);
          if (found.indexOf(i) === -1) items[best.x + ',' + best.y] = { x: best.x, y: best.y, type: 'proj', i: i };
        }
      } else {
        for (k in itemList) if (itemList[k].type === 'proj') items[k] = itemList[k];
      }
      delete items[start.x + ',' + start.y]; delete items[spawn.x + ',' + spawn.y];
      itemList = items;
    }
    function dotsLeft() { for (var k in items) if (items[k].type === 'dot') return true; return false; }

    function resetPositions() {
      player = { x: start.x, y: start.y, dx: 0, dy: 0, t: 0, want: null, face: [1, 0] };
      var cols = ['#ff4d6d', '#ff9f43', '#3fcf8e'];
      bugs = cols.map(function (col, i) { return { i: i, color: col, x: spawn.x, y: spawn.y, dx: 0, dy: 0, t: 0, state: 'wait', waitT: 0.8 + i * 2.2 }; });
      scaredT = 0; modeT = 0;
    }

    function newGame() {
      score = 0; lives = 3; level = 1; found = []; combo = 1;
      fillItems(true); resetPositions();
      state = 'play'; banner = 'READY'; bannerT = 1.2;
    }

    /* ---------- movement ---------- */
    function speedP() { return 6.2 + level * 0.15; }
    function speedB(b) { return b.state === 'eyes' ? 11 : b.state === 'scared' ? 3.2 : 4.5 + level * 0.25 + found.length * 0.12; }

    function choosePlayer() {
      var p = player;
      if (state === 'attract') {
        var opts = [], dotOpts = [];
        DIRS.forEach(function (d) {
          if (!open(p.x + d[0], p.y + d[1])) return;
          if ((p.dx || p.dy) && d[0] === -p.dx && d[1] === -p.dy) return;
          opts.push(d); if (items[(p.x + d[0]) + ',' + (p.y + d[1])]) dotOpts.push(d);
        });
        if (!opts.length) opts = [[-p.dx, -p.dy]];
        var pool = dotOpts.length && Math.random() < 0.85 ? dotOpts : opts;
        p.want = pool[Math.floor(Math.random() * pool.length)];
      }
      if (p.want && open(p.x + p.want[0], p.y + p.want[1])) { p.dx = p.want[0]; p.dy = p.want[1]; }
      else if (!open(p.x + p.dx, p.y + p.dy)) { p.dx = 0; p.dy = 0; }
      if (p.dx || p.dy) p.face = [p.dx, p.dy];
    }
    function stepPlayer(dt) {
      var p = player;
      if (p.want && (p.dx || p.dy) && p.want[0] === -p.dx && p.want[1] === -p.dy) {
        p.x += p.dx; p.y += p.dy; p.dx = -p.dx; p.dy = -p.dy; p.t = 1 - p.t; p.face = [p.dx, p.dy];
      }
      if (!p.dx && !p.dy) { choosePlayer(); if (!p.dx && !p.dy) return; }
      p.t += speedP() * dt;
      while (p.t >= 1) {
        p.x += p.dx; p.y += p.dy; p.t -= 1;
        arrive(p.x, p.y);
        if (state !== 'play' && state !== 'attract') { p.t = 0; break; }
        choosePlayer();
        if (!p.dx && !p.dy) { p.t = 0; break; }
      }
    }

    function bugTarget(b) {
      if (b.state === 'eyes') return spawn;
      var chase = (modeT % 27) > 7;
      if (!chase) return corners[b.i % 4];
      if (b.i === 0) return player;
      if (b.i === 1) return { x: player.x + player.face[0] * 4, y: player.y + player.face[1] * 4 };
      var d = Math.abs(b.x - player.x) + Math.abs(b.y - player.y);
      return d < 6 ? corners[2] : player;
    }
    function chooseBug(b) {
      var opts = [];
      DIRS.forEach(function (d) {
        if (!open(b.x + d[0], b.y + d[1])) return;
        if ((b.dx || b.dy) && d[0] === -b.dx && d[1] === -b.dy) return;
        opts.push(d);
      });
      if (!opts.length) { b.dx = -b.dx; b.dy = -b.dy; if (!b.dx && !b.dy) { b.dx = 0; b.dy = 0; } return; }
      var pick;
      if (b.state === 'scared') pick = opts[Math.floor(Math.random() * opts.length)];
      else {
        var tg = bugTarget(b), bd = 1e9;
        opts.forEach(function (d) {
          var nx = b.x + d[0], ny = b.y + d[1];
          var dd = (nx - tg.x) * (nx - tg.x) + (ny - tg.y) * (ny - tg.y) + Math.random() * 0.8;
          if (dd < bd) { bd = dd; pick = d; }
        });
      }
      b.dx = pick[0]; b.dy = pick[1];
    }
    function stepBug(b, dt) {
      if (b.state === 'wait') { b.waitT -= dt; if (b.waitT > 0) return; b.state = scaredT > 0 ? 'scared' : 'normal'; }
      if (!b.dx && !b.dy) chooseBug(b);
      b.t += speedB(b) * dt;
      while (b.t >= 1) {
        b.x += b.dx; b.y += b.dy; b.t -= 1;
        if (b.state === 'eyes' && b.x === spawn.x && b.y === spawn.y) { b.state = 'wait'; b.waitT = 1.2; b.t = 0; b.dx = b.dy = 0; return; }
        chooseBug(b);
      }
    }

    function arrive(x, y) {
      var k = x + ',' + y, it = items[k];
      if (!it) return;
      if (state === 'attract') {
        if (it.type === 'proj') return;
        delete items[k];
        if (!dotsLeft()) fillItems(false);
        return;
      }
      delete items[k];
      if (it.type === 'dot') score += 10;
      else if (it.type === 'coffee') {
        score += 50; scaredT = 7; combo = 1;
        bugs.forEach(function (b) { if (b.state === 'normal') { b.state = 'scared'; b.dx = -b.dx; b.dy = -b.dy; b.t = 1 - b.t; b.x -= b.dx; b.y -= b.dy; } });
        banner = 'DEBUG MODE'; bannerT = 1.4;
      } else if (it.type === 'proj') {
        score += 500; found.push(it.i);
        popups.push({ x: x, y: y, text: '+500', t: 1.2 });
        state = 'card'; onCard('project', it.i);
        return;
      }
      if (!dotsLeft()) { level++; fillItems(false); banner = 'LEVEL ' + level; bannerT = 1.6; }
    }

    function collide() {
      var px = player.x + player.dx * player.t, py = player.y + player.dy * player.t;
      bugs.forEach(function (b) {
        if (b.state !== 'normal' && b.state !== 'scared') return;
        var bx = b.x + b.dx * b.t, by = b.y + b.dy * b.t;
        if (Math.abs(bx - px) + Math.abs(by - py) > 0.7) return;
        if (b.state === 'scared') {
          b.state = 'eyes'; var pts = 200 * combo; combo *= 2;
          if (state === 'play') { score += pts; popups.push({ x: bx, y: by, text: 'FIXED +' + pts, t: 1.1 }); }
        } else if (state === 'play') {
          state = 'dead'; deadT = 1.5; lives--; banner = 'SEGFAULT'; bannerT = 1.5;
        }
      });
    }

    function update(dt) {
      time += dt;
      if (bannerT > 0) bannerT -= dt;
      popups.forEach(function (p) { p.t -= dt; }); popups = popups.filter(function (p) { return p.t > 0; });
      if (state === 'card' || state === 'paused' || state === 'over' || state === 'win') return;
      if (state === 'dead') {
        deadT -= dt;
        if (deadT <= 0) {
          if (lives > 0) { resetPositions(); state = 'play'; banner = 'READY'; bannerT = 1; }
          else { state = 'over'; onCard('over'); }
        }
        return;
      }
      if (state === 'play' && bannerT > 0 && banner === 'READY') return;
      modeT += dt;
      if (scaredT > 0) { scaredT -= dt; if (scaredT <= 0) bugs.forEach(function (b) { if (b.state === 'scared') b.state = 'normal'; }); }
      stepPlayer(dt);
      bugs.forEach(function (b) { stepBug(b, dt); });
      collide();
    }

    /* ---------- drawing ---------- */
    function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function pad(n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; }

    function drawPlayer(px, py, dying) {
      var cx = (px + 0.5) * T, cy = (py + 0.5) * T, s = T * 0.8;
      var moving = player.dx || player.dy;
      var bob = moving ? Math.sin(time * 18) * 1.5 : 0;
      ctx.save(); ctx.translate(cx, cy + bob);
      if (dying) { var k = Math.max(0, deadT / 1.5); ctx.scale(1, k); ctx.rotate((1 - k) * 2); }
      ctx.fillStyle = '#efe6d2'; rrect(-s / 2, -s / 2, s, s * 0.8, 7); ctx.fill();
      ctx.fillStyle = '#bfb3a0'; ctx.fillRect(-7, s * 0.3, 14, 5); ctx.fillRect(-12, s * 0.38, 24, 4);
      ctx.fillStyle = '#2a2a9c'; rrect(-s / 2 + 5, -s / 2 + 5, s - 10, s * 0.8 - 12, 4); ctx.fill();
      var f = player.face, ex = f[0] * 4, ey = f[1] * 3;
      ctx.fillStyle = '#efe6d2';
      var blink = (time % 3.2) < 0.12 ? 2 : 8;
      ctx.fillRect(-9 + ex, -9 + ey + (8 - blink) / 2, 5, blink); ctx.fillRect(4 + ex, -9 + ey + (8 - blink) / 2, 5, blink);
      var mouth = moving ? 2 + Math.abs(Math.sin(time * 16)) * 5 : 2;
      ctx.fillRect(-5 + ex, 3 + ey, 10, mouth);
      ctx.restore();
    }

    function drawBug(b) {
      var bx = b.x + b.dx * b.t, by = b.y + b.dy * b.t;
      var cx = (bx + 0.5) * T, cy = (by + 0.5) * T, r = T * 0.32;
      var col = b.color;
      if (b.state === 'scared') col = (scaredT < 2 && Math.floor(time * 8) % 2) ? '#ffffff' : '#93a5ff';
      ctx.save(); ctx.translate(cx, cy);
      if (b.state !== 'eyes') {
        ctx.strokeStyle = b.state === 'scared' ? '#5c6bd6' : '#1a0d14'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (var s = -1; s <= 1; s += 2) for (var k = 0; k < 3; k++) {
          var wig = Math.sin(time * 20 + k * 2 + (s > 0 ? 1 : 0)) * 0.25;
          var a = (k - 1) * 0.6 + wig;
          ctx.beginPath(); ctx.moveTo(s * r * 0.5, (k - 1) * r * 0.55);
          ctx.lineTo(s * (r * 0.5 + Math.cos(a) * r * 0.75), (k - 1) * r * 0.55 + Math.sin(a) * r * 0.6); ctx.stroke();
        }
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, r * 0.15, r * 0.82, r * 0.95, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -r * 0.3); ctx.lineTo(0, r * 1.05); ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.arc(-r * 0.38, r * 0.35, r * 0.14, 0, 7); ctx.arc(r * 0.38, r * 0.1, r * 0.12, 0, 7); ctx.fill();
        ctx.fillStyle = b.state === 'scared' ? '#5c6bd6' : '#2a1420'; ctx.beginPath(); ctx.arc(0, -r * 0.62, r * 0.48, 0, 7); ctx.fill();
        ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-r * 0.2, -r * 0.95); ctx.lineTo(-r * 0.45, -r * 1.35); ctx.moveTo(r * 0.2, -r * 0.95); ctx.lineTo(r * 0.45, -r * 1.35); ctx.stroke();
      }
      var lx = b.dx * 2.5, ly = b.dy * 2.5;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-r * 0.22, -r * 0.66, 4.5, 0, 7); ctx.arc(r * 0.22, -r * 0.66, 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = b.state === 'scared' ? '#ff4d6d' : '#111';
      ctx.beginPath(); ctx.arc(-r * 0.22 + lx, -r * 0.66 + ly, 2.2, 0, 7); ctx.arc(r * 0.22 + lx, -r * 0.66 + ly, 2.2, 0, 7); ctx.fill();
      ctx.restore();
    }

    function drawFolder(it) {
      var cx = (it.x + 0.5) * T, cy = (it.y + 0.5) * T + Math.sin(time * 3 + it.i) * 2.5;
      var col = works[it.i].color;
      var gr = ctx.createRadialGradient(cx, cy, 2, cx, cy, T * 0.8);
      gr.addColorStop(0, 'rgba(255,214,102,.55)'); gr.addColorStop(1, 'rgba(255,214,102,0)');
      ctx.fillStyle = gr; ctx.fillRect(cx - T, cy - T, T * 2, T * 2);
      var w = T * 0.78, h = T * 0.58, x = cx - w / 2, y = cy - h / 2 + 2;
      /* back panel + tab */
      ctx.fillStyle = '#d99a1e'; rrect(x, y - 5, w * 0.42, 9, 3); ctx.fill();
      ctx.fillStyle = '#e8ad2e'; rrect(x, y, w, h, 3); ctx.fill();
      /* a sheet of paper peeking out */
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 4, y + 2, w - 8, h * 0.5);
      ctx.fillStyle = '#c9d3e6'; ctx.fillRect(x + 7, y + 6, w * 0.5, 2); ctx.fillRect(x + 7, y + 10, w * 0.35, 2);
      /* front flap, slightly skewed open */
      ctx.beginPath(); ctx.moveTo(x + 2, y + h * 0.32); ctx.lineTo(x + w + 1, y + h * 0.26); ctx.lineTo(x + w - 2, y + h); ctx.lineTo(x, y + h); ctx.closePath();
      var fg = ctx.createLinearGradient(0, y + h * 0.3, 0, y + h); fg.addColorStop(0, '#ffe08a'); fg.addColorStop(1, '#f5bf3f');
      ctx.fillStyle = fg; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x + 4, y + h * 0.36, w - 10, 2);
      /* project colour sticker */
      ctx.fillStyle = col; rrect(cx - 7, y + h * 0.55, 14, 9, 2); ctx.fill();
    }
    function drawCoffee(it) {
      var cx = (it.x + 0.5) * T, cy = (it.y + 0.5) * T, p = 1 + Math.sin(time * 6) * 0.08;
      ctx.save(); ctx.translate(cx, cy + 3); ctx.scale(p, p);
      ctx.strokeStyle = 'rgba(239,230,210,.7)'; ctx.lineWidth = 2;
      for (var k = -1; k <= 1; k += 2) { ctx.beginPath(); ctx.moveTo(k * 4, -10); ctx.quadraticCurveTo(k * 4 + Math.sin(time * 5 + k) * 4, -15, k * 4, -20); ctx.stroke(); }
      ctx.fillStyle = '#ffb347'; rrect(-9, -8, 16, 15, 3); ctx.fill();
      ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(8, -1, 4, -1.4, 1.4); ctx.stroke();
      ctx.fillStyle = '#5a2e12'; ctx.fillRect(-7, -6, 12, 3);
      ctx.restore();
    }

    function draw() {
      ctx.fillStyle = '#080a2a'; ctx.fillRect(0, 0, cv.width, cv.height);
      /* HUD */
      var compact = cv.width < 800;
      ctx.fillStyle = '#efe6d2'; ctx.font = (compact ? 32 : 36) + 'px VT323, "Courier New", monospace'; ctx.textBaseline = 'middle';
      ctx.fillText('SCORE ' + pad(score, 6), 18, HUD / 2);
      if (compact) { ctx.textAlign = 'right'; ctx.fillText('PROJ ' + found.length + '/' + works.length, cv.width - 128, HUD / 2); }
      else { ctx.textAlign = 'center'; ctx.fillText('PROJECTS ' + found.length + '/' + works.length, cv.width / 2, HUD / 2); }
      ctx.textAlign = 'right';
      for (var l = 0; l < 3; l++) {
        ctx.globalAlpha = l < lives ? 1 : 0.2;
        var lx = cv.width - 26 - l * 34, ly = HUD / 2;
        ctx.fillStyle = '#efe6d2'; rrect(lx - 12, ly - 11, 24, 19, 3); ctx.fill();
        ctx.fillStyle = '#2a2a9c'; ctx.fillRect(lx - 9, ly - 8, 18, 13);
      }
      ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'rgba(133,147,255,.35)'; ctx.fillRect(0, HUD - 2, cv.width, 2);

      ctx.save(); ctx.translate(0, HUD);
      ctx.drawImage(wallCache, 0, 0);
      for (var k in items) {
        var it = items[k];
        if (it.type === 'dot') { ctx.fillStyle = '#efe6d2'; ctx.fillRect(it.x * T + T / 2 - 3, it.y * T + T / 2 - 3, 6, 6); }
        else if (it.type === 'coffee') drawCoffee(it);
      }
      for (k in items) if (items[k].type === 'proj') drawFolder(items[k]);
      bugs.forEach(drawBug);
      var px = player.x + player.dx * player.t, py = player.y + player.dy * player.t;
      drawPlayer(px, py, state === 'dead');
      ctx.font = '28px VT323, monospace'; ctx.textAlign = 'center';
      popups.forEach(function (p) {
        ctx.globalAlpha = Math.min(1, p.t * 2); ctx.fillStyle = '#ffd166';
        ctx.fillText(p.text, (p.x + 0.5) * T, (p.y + 0.2) * T - (1.2 - p.t) * 20);
      });
      ctx.globalAlpha = 1;
      ctx.restore();

      ctx.textAlign = 'center';
      if (bannerT > 0 && state !== 'attract') {
        ctx.font = '64px VT323, monospace';
        ctx.fillStyle = 'rgba(8,10,42,.75)'; var bw = ctx.measureText(banner).width + 40;
        ctx.fillRect(cv.width / 2 - bw / 2, cv.height / 2 - 42, bw, 70);
        ctx.fillStyle = banner === 'SEGFAULT' ? '#ff4d6d' : '#ffd166';
        ctx.fillText(banner, cv.width / 2, cv.height / 2 + 14);
      }
      if (state === 'attract' || state === 'paused') {
        var lines = state === 'paused'
          ? [['PAUSED', 64, '#efe6d2', 'VT323'], ['PRESS ENTER OR TAP TO RESUME', 30, '#efe6d2', 'VT323', true]]
          : [['Project Hunt', 64, '#efe6d2', 'serif'], ['Eat the bits. Dodge the bugs.', 30, '#efe6d2', 'VT323'],
             ['Open all ' + works.length + ' project folders.', 30, '#efe6d2', 'VT323'],
             ['Coffee = debug mode: bugs become fixable', 30, '#ffb347', 'VT323'], ['PRESS ENTER OR TAP TO START', 30, '#efe6d2', 'VT323', true]];
        function fontOf(l, k) { return l[3] === 'serif' ? 'italic ' + Math.round(l[1] * k) + 'px Newsreader, Georgia, serif' : Math.round(l[1] * k) + 'px VT323, "Courier New", monospace'; }
        /* shrink the whole panel until the widest line fits the maze */
        var k = 1, maxW = cv.width - 48, widest;
        for (var tries = 0; tries < 8; tries++) {
          widest = 0;
          lines.forEach(function (l) { ctx.font = fontOf(l, k); widest = Math.max(widest, ctx.measureText(l[0]).width); });
          if (widest + 56 <= maxW) break;
          k *= 0.9;
        }
        var lh = function (l) { return l[1] * k * 1.12; };
        var ph = 36 * k + lines.reduce(function (s, l) { return s + lh(l); }, 0), pw = widest + 56;
        var x0 = cv.width / 2 - pw / 2, y0 = cv.height / 2 - ph / 2 + HUD / 2;
        ctx.fillStyle = 'rgba(8,10,42,.9)'; ctx.fillRect(x0, y0, pw, ph);
        ctx.strokeStyle = '#efe6d2'; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, pw, ph);
        var yy = y0 + 18 * k;
        lines.forEach(function (l) {
          yy += lh(l);
          if (l[4] && !(Math.floor(time * 2) % 2)) return;
          ctx.font = fontOf(l, k); ctx.fillStyle = l[2]; ctx.fillText(l[0], cv.width / 2, yy - l[1] * k * 0.22);
        });
      }
      ctx.textAlign = 'left';
    }

    return {
      canvas: cv,
      setLayout: setLayout,
      tick: function (dt) { update(dt); draw(); },
      draw: draw,
      start: newGame,
      get state() { return state; },
      get found() { return found.slice(); },
      get score() { return score; },
      aspect: function () { return cv.width / cv.height; },
      steer: function (name) {
        var m = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }[name];
        if (m) player.want = m;
      },
      pause: function () { if (state === 'play') { state = 'paused'; } },
      resume: function () { if (state === 'paused') { state = 'play'; } },
      hold: function () { if (state === 'play' || state === 'paused') { prevState = state; state = 'card'; } else prevState = null; },
      release: function () {
        if (state !== 'card') return;
        if (prevState) { state = prevState === 'play' ? 'paused' : prevState; prevState = null; return; }
        if (found.length >= works.length) { state = 'win'; onCard('win'); }
        else { state = 'play'; banner = 'GO'; bannerT = 0.6; }
      },
      toAttract: function () { state = 'attract'; score = 0; lives = 3; found = []; level = 1; fillItems(true); resetPositions(); }
    };
  }
  game.setLayout('landscape');

  /* ---------- game UI: cards, buttons, input ---------- */
  var gameEl = document.getElementById('work'), gameBox = document.getElementById('gameBox');
  var gCard = document.getElementById('gCard'), gStart = document.getElementById('gStart'), gList = document.getElementById('gList');
  var cardKind = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var FOLDER_SVG = function (col, dim) {
    return '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M3 6a3 3 0 0 1 3-3h12l4 4h20a3 3 0 0 1 3 3v4H3z" fill="' + (dim ? '#b9b39f' : '#e0a22a') + '"/>' +
      '<rect x="6" y="9" width="36" height="14" fill="#fff"/><rect x="9" y="12" width="18" height="2" fill="#c9d3e6"/>' +
      '<path d="M3 15l42-2-2 24H3z" fill="' + (dim ? '#d8d3c1' : '#ffd25e') + '"/><path d="M4 16.5l40-1.9" stroke="#fff" stroke-opacity=".6"/>' +
      (col ? '<rect x="19" y="25" width="10" height="6" rx="1.5" fill="' + col + '"/>' : '') + '</svg>';
  };
  var FILE_SVG = function (kind) {
    var c = { code: '#3d7bd9', img: '#2f9b6f', txt: '#8a8a8a' }[kind];
    return '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M12 2h18l8 8v28H12z" fill="#fff" stroke="#8a97ab"/><path d="M30 2v8h8" fill="#e6ebf3" stroke="#8a97ab"/>' +
      '<rect x="15" y="22" width="20" height="11" rx="1.5" fill="' + c + '"/><rect x="16" y="14" width="12" height="2" fill="#c9d3e6"/><rect x="16" y="18" width="16" height="2" fill="#c9d3e6"/></svg>';
  };
  var WARN_SVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3l18 33H2z" fill="#ffcc33" stroke="#9a6b00" stroke-width="1.5" stroke-linejoin="round"/><rect x="18.3" y="13" width="3.4" height="13" rx="1.5" fill="#1a1a1a"/><circle cx="20" cy="31" r="2" fill="#1a1a1a"/></svg>';
  var INFO_SVG = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#2f6be0" stroke="#163f9e" stroke-width="1.5"/><circle cx="20" cy="12" r="2.4" fill="#fff"/><rect x="18" y="17" width="4" height="13" rx="1.5" fill="#fff"/></svg>';
  function slug(t) { return t.replace(/[^A-Za-z0-9 ]/g, '').replace(/ /g, '_'); }
  function windowHTML(title, path, body, status, closeAct) {
    return '<div class="wbar">' + FOLDER_SVG(null) + '<span class="wtitle" id="gCardTitle">' + esc(title) + '</span>' +
      '<span class="wbtns" aria-hidden="false"><i aria-hidden="true">_</i><i aria-hidden="true">□</i><button type="button" data-act="' + closeAct + '" aria-label="Close window">×</button></span></div>' +
      (path ? '<div class="wmenu" aria-hidden="true"><span>File</span><span>Edit</span><span>View</span><span>Favorites</span><span>Tools</span><span>Help</span></div>' +
        '<div class="waddr"><span>Address</span><div class="wpath">' + esc(path) + '</div></div>' : '') +
      body + (status ? '<div class="wstatus">' + esc(status) + '</div>' : '');
  }
  function listHTML() {
    var f = game.found;
    return '<ul class="icons">' + WORKS.map(function (w, i) {
      var got = f.indexOf(i) > -1;
      return '<li class="' + (got ? '' : 'dim') + '"><a href="' + esc(w.href) + '" target="_blank" rel="noopener noreferrer" title="' + esc(w.type) + '">' + FOLDER_SVG(got ? w.color : null, !got) + '<span>' + esc(w.title) + '</span></a></li>';
    }).join('') + '</ul>';
  }
  function openCard(kind, i) {
    cardKind = kind;
    var html = '', n = WORKS.length, f = game.found;
    if (kind === 'project') {
      var w = WORKS[i], sl = slug(w.title).toLowerCase();
      html = windowHTML(w.title, 'C:\\Projects\\' + w.title,
        '<div class="wmain"><aside class="wside">' +
          '<section><h4>Project tasks</h4><div><a href="' + esc(w.href) + '" target="_blank" rel="noopener noreferrer">Open the live site</a></div></section>' +
          '<section><h4>Details</h4><div><b>' + esc(w.title) + '</b><br>' + esc(w.type) + '<br>Folder ' + f.length + ' of ' + n + ' opened</div></section>' +
        '</aside><div class="wfiles"><h3>' + esc(w.title) + '</h3><p class="wsub">' + esc(w.type) + '</p>' +
          '<ul class="icons">' +
            '<li><span class="f">' + FILE_SVG('code') + '<span>' + esc(sl) + '.tsx</span></span></li>' +
            '<li><span class="f">' + FILE_SVG('img') + '<span>screenshot.png</span></span></li>' +
            '<li><span class="f">' + FILE_SVG('txt') + '<span>README.txt</span></span></li>' +
          '</ul>' +
          '<div class="wact"><a class="xbtn" href="' + esc(w.href) + '" target="_blank" rel="noopener noreferrer">Open project</a><button class="xbtn primary" type="button" data-act="go">Continue</button></div>' +
        '</div></div>',
        '3 object(s) · ' + f.length + ' of ' + n + ' project folders opened', 'go');
    } else if (kind === 'win') {
      html = windowHTML('All folders opened', null,
        '<div class="dlg">' + INFO_SVG + '<div><p><b>You opened every project folder.</b></p><p>Final score: ' + game.score + '. Thanks for playing.</p></div></div>' +
        '<div class="dlg-list">' + listHTML() + '<div class="wact"><button class="xbtn" type="button" data-act="again">Play again</button><a class="xbtn primary" href="#contact" data-act="contact">Book a call</a></div></div>',
        null, 'close');
    } else if (kind === 'over') {
      html = windowHTML('Fatal bug', null,
        '<div class="dlg">' + WARN_SVG + '<div><p><b>The bugs got you.</b></p><p>You opened ' + f.length + ' of ' + n + ' folders. Here are all of them anyway:</p></div></div>' +
        '<div class="dlg-list">' + listHTML() + '<div class="wact"><button class="xbtn" type="button" data-act="close">Close</button><button class="xbtn primary" type="button" data-act="again">Try again</button></div></div>',
        null, 'close');
    } else {
      html = windowHTML('My Projects', 'C:\\Projects',
        '<div class="wfiles">' + listHTML() + '<div class="wact"><button class="xbtn primary" type="button" data-act="close">Close</button></div></div>',
        n + ' object(s) · ' + f.length + ' opened in the game', 'close');
    }
    gCard.innerHTML = html;
    gCard.hidden = false;
    var first = gCard.querySelector('.xbtn.primary') || gCard.querySelector('[data-act]'); if (first) first.focus({ preventScroll: true });
    syncButtons();
  }
  function closeCard() {
    if (gCard.hidden) return;
    gCard.hidden = true;
    var kind = cardKind; cardKind = null;
    if (kind === 'project' || kind === 'list') game.release();
    else if (kind === 'over' || kind === 'win') game.toAttract();
    syncButtons();
  }
  on(gCard, 'click', function (e) {
    var a = e.target.closest('[data-act]'); if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'go' || act === 'close') closeCard();
    else if (act === 'again') { gCard.hidden = true; cardKind = null; game.start(); syncButtons(); }
    else if (act === 'contact') { gCard.hidden = true; cardKind = null; game.toAttract(); syncButtons(); }
  });
  function syncButtons() {
    var s = game.state;
    gStart.textContent = s === 'play' ? 'Pause' : s === 'paused' ? 'Resume' : 'Start';
    gameEl.classList.toggle('playing', s === 'play');
  }
  function primary() {
    var s = game.state;
    if (!gCard.hidden) return closeCard();
    if (s === 'attract' || s === 'over' || s === 'win') game.start();
    else if (s === 'play') game.pause();
    else if (s === 'paused') game.resume();
    syncButtons();
  }
  on(gStart, 'click', primary);
  on(gList, 'click', function () { if (!gCard.hidden) closeCard(); game.hold(); openCard('list'); });

  var KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  on(window, 'keydown', function (e) {
    if (!gameEl.classList.contains('live')) return;
    if (!gCard.hidden) { if (e.key === 'Escape') { closeCard(); e.preventDefault(); } return; }
    var s = game.state;
    if (s === 'play' && KEYS[e.key]) { game.steer(KEYS[e.key]); e.preventDefault(); return; }
    if (e.key === 'Enter' || e.key === ' ') { if (document.activeElement && document.activeElement.closest && document.activeElement.closest('button, a')) return; primary(); e.preventDefault(); return; }
    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && (s === 'play' || s === 'paused')) { primary(); e.preventDefault(); }
  });
  var swipe = null;
  on(gameCanvas, 'pointerdown', function (e) { swipe = { x: e.clientX, y: e.clientY, moved: false }; });
  on(gameCanvas, 'pointermove', function (e) {
    if (!swipe || game.state !== 'play') return;
    var dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    game.steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    swipe = { x: e.clientX, y: e.clientY, moved: true };
  });
  on(gameCanvas, 'pointerup', function () {
    if (swipe && !swipe.moved && game.state !== 'play') primary();
    swipe = null;
  });
  Array.prototype.forEach.call(document.querySelectorAll('.dpad button'), function (b) {
    on(b, 'pointerdown', function (e) { e.preventDefault(); if (game.state === 'play') game.steer(b.getAttribute('data-dir')); else if (game.state !== 'card') primary(); });
  });
  function sizeGameBox() {
    var a = game.aspect();
    gameEl.style.setProperty('--ga', a.toFixed(4));
  }
  sizeGameBox();

  /* =========================================================
     3. Scroll: one scroll on the hero zooms straight into the game
     ========================================================= */
  var heroPose = {}, narrow = false, baseRotY = -0.62, aspect = 1, stageH = 1, fit = { h: 1, dy: 0 };
  function measureFit() {
    /* where the playable canvas sits on screen, so the 3D screen can land exactly on it */
    var sr = stageEl.getBoundingClientRect(), cr = gameCanvas.getBoundingClientRect();
    stageH = sr.height || 1;
    fit.h = cr.height || stageH * 0.7;
    fit.dy = (cr.top + cr.height / 2) - (sr.top + sr.height / 2);
  }
  function resize() {
    var r = stageEl.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    aspect = r.width / r.height;
    camera.aspect = aspect; camera.updateProjectionMatrix();
    narrow = aspect < 0.95;
    if (narrow) heroPose = { pos: new THREE.Vector3(0.1, -2.6, 0), scale: 0.7, cam: new THREE.Vector3(0, 0.6, 11), look: new THREE.Vector3(0, -0.4, 0) };
    else heroPose = { pos: new THREE.Vector3(Math.min(2.2, 0.9 + aspect * 0.65), -0.95, 0), scale: 1, cam: new THREE.Vector3(0, 1.4, 9.5), look: new THREE.Vector3(0, 0.35, 0) };
    bgUniforms.uFocus.value.set(narrow ? .55 : .72, narrow ? .14 : .32);
    bgUniforms.uRes.value.set(r.width, r.height);
    gameEl.classList.toggle('solid', narrow);
    game.setLayout(narrow && mode === 'game' ? 'portrait' : 'landscape');
    sizeGameBox();
    measureFit();
    dirty = true;
  }

  /* ---- mode machine: hero <-> game, driven by scroll intent ---- */
  var mode = 'hero', a = 0, tween = null, dirty = true;
  var DUR_IN = reduce ? 0.01 : 1.15, DUR_OUT = reduce ? 0.01 : 0.9;
  function gameY() { return track.offsetTop + track.offsetHeight - window.innerHeight; }
  function heroY() { return track.offsetTop; }
  function lockScroll(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }
  /* Lenis smooths the wheel only in the about / contact stretch; the hero and game keep native scroll so
     one notch still triggers the zoom. jump() cancels any glide in flight before the engine teleports. */
  var lenis = reduce ? null : new Lenis({ autoRaf: true, virtualScroll: function () { return mode === 'about'; } });
  if (lenis) offs.push(function () { lenis.destroy(); });
  function jump(y) { if (lenis) lenis.reset(); window.scrollTo({ top: y, behavior: 'instant' }); }
  function animateTo(target, dur, done) {
    tween = { from: a, to: target, t0: performance.now(), dur: dur * 1000 * Math.abs(target - a || 1), done: done };
  }
  function goGame() {
    if (mode === 'game' || mode === 'in') return;
    mode = 'in'; lockScroll(true);
    jump(gameY());
    animateTo(1, DUR_IN, function () {
      mode = 'game'; lockScroll(false);
      if (narrow) { game.setLayout('portrait'); sizeGameBox(); }
      setLive(true);
    });
  }
  function goHero() {
    if (mode === 'hero' || mode === 'out') return;
    mode = 'out'; lockScroll(true); setLive(false);
    if (game.state === 'play') game.pause();
    syncButtons();
    jump(heroY());
    game.setLayout('landscape'); sizeGameBox(); measureFit();
    animateTo(0, DUR_OUT, function () { mode = 'hero'; lockScroll(false); });
  }
  var navHome = document.getElementById('navHome'), navWork = document.getElementById('navWork');
  function setLive(on) {
    gameEl.classList.toggle('live', on);
    gameEl.setAttribute('aria-hidden', on ? 'false' : 'true');
    if (on) { navWork.setAttribute('aria-current', 'page'); navHome.removeAttribute('aria-current'); }
    else { navHome.setAttribute('aria-current', 'page'); navWork.removeAttribute('aria-current'); }
  }
  /* ---- CRT signal glitch + shutter: the screen tears, snaps shut to a line, then the next channel turns on ---- */
  var wipe = (function () {
    var cv = document.getElementById('brickWipe'), c = cv.getContext('2d');
    var W, H, noise, phase = null, t0 = 0, cb = null, raf = 0, fromEl = null, toEl = null, bands = [];
    var OUT = 0.42, SHUT = 0.34, HOLD = 0.12, ON = 0.32, SETTLE = 0.38;
    function makeNoise() {
      noise = document.createElement('canvas'); noise.width = noise.height = 192;
      var x = noise.getContext('2d'), img = x.createImageData(192, 192);
      for (var i = 0; i < img.data.length; i += 4) {
        var v = Math.random() * 255; img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v * 1.08; img.data[i + 3] = 255;
      }
      x.putImageData(img, 0, 0);
    }
    function setup() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.ceil(W); cv.height = Math.ceil(H);   /* 1x is plenty for noise and bars */
      if (!noise) makeNoise();
    }
    function rollBands(n, maxH) {
      bands = [];
      for (var i = 0; i < n; i++) bands.push({ y: Math.random() * H, h: 2 + Math.random() * maxH, dx: (Math.random() - 0.5) * W * 0.25, kind: Math.random() });
    }
    function staticLayer(alpha) {
      if (alpha <= 0) return;
      c.globalAlpha = alpha;
      var ox = -Math.random() * 192, oy = -Math.random() * 192;
      for (var y = oy; y < H; y += 192) for (var x = ox; x < W; x += 192) c.drawImage(noise, x, y);
      c.globalAlpha = 1;
    }
    function tearLayer(strength) {
      if (strength <= 0) return;
      if (Math.random() < 0.55) rollBands(Math.round(4 + strength * 14), 10 + strength * 46);
      bands.forEach(function (b) {
        var col = b.kind < 0.33 ? 'rgba(255,40,120,' : b.kind < 0.66 ? 'rgba(40,230,255,' : 'rgba(239,230,210,';
        c.fillStyle = col + (0.18 + 0.4 * strength) + ')';
        c.fillRect(b.dx * strength, b.y, W, b.h);
        if (b.kind > 0.8) { c.globalAlpha = 0.7 * strength; c.drawImage(noise, 0, 0, 192, 8, 0, b.y, W, b.h); c.globalAlpha = 1; }
      });
      /* scanlines */
      c.fillStyle = 'rgba(0,0,0,' + (0.25 * strength) + ')';
      for (var y = 0; y < H; y += 3) c.fillRect(0, y, W, 1);
    }
    function shutter(k) {   /* k: 0 open .. 1 fully shut to a dot */
      var mid = H / 2;
      var v = clamp(k / 0.72, 0, 1), ve = v * v * (3 - 2 * v);
      var gap = Math.max(2, (H / 2) * (1 - ve));
      c.fillStyle = '#000';
      c.fillRect(0, 0, W, mid - gap); c.fillRect(0, mid + gap, W, H - mid - gap);
      if (ve > 0.15) {
        /* glowing beam that the picture collapses into */
        var h2 = clamp((k - 0.72) / 0.28, 0, 1), w = W * (1 - h2 * h2) + 6;
        var bright = 0.35 + 0.65 * ve;
        if (h2 > 0) { c.fillRect(0, mid - gap - 1, W, gap * 2 + 2); }
        var g = c.createLinearGradient(0, mid - 14, 0, mid + 14);
        g.addColorStop(0, 'rgba(140,160,255,0)'); g.addColorStop(0.5, 'rgba(230,236,255,' + bright + ')'); g.addColorStop(1, 'rgba(140,160,255,0)');
        c.fillStyle = g; c.fillRect(W / 2 - w / 2, mid - 14, w, 28);
        c.fillStyle = 'rgba(255,255,255,' + bright + ')'; c.fillRect(W / 2 - w / 2, mid - 1, w, 2);
      }
    }
    function draw(now) {
      if (!alive) return;
      var t = (now - t0) / 1000;
      c.clearRect(0, 0, W, H);
      if (phase === 'out') {
        var k = clamp(t / OUT, 0, 1);
        staticLayer(0.08 + 0.3 * k);
        tearLayer(0.3 + 0.7 * k);
        if (k >= 1) { phase = 'shut'; t0 = now; }
      } else if (phase === 'shut') {
        var s = clamp(t / SHUT, 0, 1);
        staticLayer(0.38 * (1 - s));
        tearLayer(0.8 * (1 - s));
        shutter(s);
        if (s >= 1) {
          c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
          phase = 'hold'; if (fromEl) fromEl.classList.remove('sig-out'); if (cb.covered) cb.covered();
          if (toEl) toEl.classList.add('sig-in');
          setTimeout(function () { phase = 'on'; t0 = performance.now(); }, HOLD * 1000);
        }
      } else if (phase === 'hold') {
        c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      } else if (phase === 'on') {
        var o = clamp(t / ON, 0, 1);
        shutter(1 - o);
        staticLayer(0.4 * (1 - o) + 0.1);
        tearLayer(0.6 * (1 - o) + 0.2);
        if (o >= 1) { phase = 'settle'; t0 = now; }
      } else if (phase === 'settle') {
        var q = clamp(t / SETTLE, 0, 1);
        staticLayer(0.1 * (1 - q));
        tearLayer(0.2 * (1 - q) * (Math.random() < 0.5 ? 1 : 0));
        if (q >= 1) {
          phase = null; cv.hidden = true; c.clearRect(0, 0, W, H);
          if (toEl) toEl.classList.remove('sig-in');
          if (cb.done) cb.done();
          return;
        }
      }
      raf = requestAnimationFrame(draw);
    }
    return {
      busy: function () { return phase !== null; },
      run: function (covered, done, from, to) {
        if (reduce) { covered(); done(); return; }
        setup(); cb = { covered: covered, done: done }; fromEl = from || null; toEl = to || null;
        if (fromEl) { fromEl.classList.remove('sig-out'); void fromEl.offsetWidth; fromEl.classList.add('sig-out'); }
        rollBands(6, 20);
        cv.hidden = false; phase = 'out'; t0 = performance.now();
        cancelAnimationFrame(raf); raf = requestAnimationFrame(draw);
      }
    };
  })();

  /* ---- about: entrance + the brick figure, waving again ---- */
  var aboutEl = document.getElementById('about');
  function yOf(el) { return el.getBoundingClientRect().top + window.scrollY; }
  function aboutY() { return yOf(aboutEl); }
  function enterAbout() { aboutEl.classList.remove('enter'); void aboutEl.offsetWidth; aboutEl.classList.add('enter'); }
  /* game and about are neighbours on the page, so moving between them is one continuous glide: the stage
     slides up and away while about rises in (and back). The CRT wipe is kept for the long jumps from the hero. */
  var GLIDE = 1.15;
  function glide(y, done) {
    if (!lenis) { jump(y); done(); return; }
    lenis.scrollTo(y, { duration: GLIDE, easing: easeInOut, lock: true, force: true, onComplete: done });
  }
  /* land: optional element below the track to arrive at instead of the top of about */
  function goAbout(land) {
    if (mode === 'about' || busyMode()) return;
    var wasGame = mode === 'game';
    mode = 'wipe'; lockScroll(true);
    if (game.state === 'play') game.pause();
    setLive(false); syncButtons();
    if (wasGame) {
      enterAbout();
      glide(land ? yOf(land) : aboutY(), function () { mode = 'about'; lockScroll(false); });
      return;
    }
    wipe.run(function () {
      a = 1; dirty = true;   /* so coming back up lands in the game */
      jump(land ? yOf(land) : aboutY());
      enterAbout();
    }, function () { mode = 'about'; lockScroll(false); }, stageEl, aboutEl);
  }
  function backToGame() {
    if (busyMode()) return;
    mode = 'wipe'; lockScroll(true);
    a = 1; dirty = true;
    if (narrow) { game.setLayout('portrait'); sizeGameBox(); }
    glide(gameY(), function () { mode = 'game'; lockScroll(false); setLive(true); });
  }
  function busyMode() { return mode === 'in' || mode === 'out' || mode === 'wipe'; }

  (function aboutFigure() {
    var fc = document.getElementById('aboutFig'); if (!fc) return;
    var fx = fc.getContext('2d'), visible = false, rafA = 0, greets = ["THAT'S ME!", "HI, I'M NIVED", "LET'S BUILD"];
    function tickA(now) {
      if (!alive) return;
      fx.clearRect(0, 0, fc.width, fc.height);
      drawBuddy(fx, reduce ? 1 : now / 1000, false, greets);
      if (visible && !reduce) rafA = requestAnimationFrame(tickA);
    }
    tickA(1000);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        cancelAnimationFrame(rafA);
        if (visible) rafA = requestAnimationFrame(tickA);
      });
      io.observe(fc);
      offs.push(function () { io.disconnect(); cancelAnimationFrame(rafA); });
    }
  })();

  on(window, 'scroll', function () {
    if (busyMode()) return;
    var y = window.scrollY;
    if (mode === 'hero' && y > heroY() + 6 && y < gameY() + 10) goGame();
    else if (mode === 'game') {
      if (y < gameY() - 40) goHero();
      else if (y > gameY() + 40) goAbout();
    }
    else if (mode === 'about' && y < aboutY() - 40) backToGame();
  }, { passive: true });
  Array.prototype.forEach.call(document.querySelectorAll('[data-go]'), function (el) {
    on(el, 'click', function (e) {
      e.preventDefault();
      var where = el.getAttribute('data-go');
      if (where === '1') {
        if (mode === 'game') return;
        if (mode === 'about') backToGame(); else goGame();
      } else if (where === '2') {
        goAbout();
      } else {
        if (mode === 'hero') window.scrollTo({ top: heroY(), behavior: 'smooth' });
        else if (mode === 'about') {
          mode = 'wipe'; lockScroll(true);
          wipe.run(function () { a = 0; dirty = true; jump(heroY()); },
                   function () { mode = 'hero'; lockScroll(false); }, aboutEl, stageEl);
        } else goHero();
      }
    });
  });

  /* links to anything below the track (services, faq, contact...): glide there from the about stretch,
     or take the CRT wipe from the hero / game. A native hash jump would leave the stage out of sync. */
  on(document, 'click', function (e) {
    var el = e.target.closest && e.target.closest('a[href^="#"]');
    if (!el || el.hasAttribute('data-go')) return;
    var dest = document.getElementById(el.getAttribute('href').slice(1));
    if (!dest || !(dest === aboutEl || aboutEl.compareDocumentPosition(dest) & Node.DOCUMENT_POSITION_FOLLOWING)) return;
    e.preventDefault();
    if (busyMode()) return;
    if (mode === 'about') { if (lenis) lenis.scrollTo(yOf(dest)); else jump(yOf(dest)); }
    else goAbout(dest);
  });

  var mouse = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  on(window, 'pointermove', function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  var tmpV = new THREE.Vector3(), endCam = new THREE.Vector3(), endLook = new THREE.Vector3(), lookV = new THREE.Vector3();
  var lastGlobe = -1, lastT = null, last3D = -1;
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function frame(t) {
    var dt = lastT === null ? 0 : clamp(t - lastT, 0, 0.05); lastT = t;
    if (tween) {
      var k = clamp((performance.now() - tween.t0) / Math.max(1, tween.dur), 0, 1);
      a = lerp(tween.from, tween.to, easeInOut(k));
      if (k >= 1) { var d = tween.done; tween = null; a = Math.round(a); if (d) d(); }
      dirty = true;
    }
    if (mode === 'about') return;   /* the stage is scrolled away; save the work */

    /* screen switches to the game the moment the zoom starts */
    var mix = sstep(0, 0.22, a);
    copyEl.style.opacity = String(1 - sstep(0, 0.3, a));
    copyEl.style.transform = 'translate3d(0,' + (-50 * sstep(0, 0.4, a)) + 'px,0)';
    /* wide screens: the 3D screen lands exactly under the DOM canvas, so the hand-off is invisible.
       phones: the maze changes shape, so fade over the last stretch instead. */
    var domOn = narrow ? sstep(0.75, 1, a) : (a >= 0.999 ? 1 : 0);
    gameEl.style.opacity = String(domOn);

    var inGame = a >= 0.999;
    if (mix > 0 || inGame) game.tick(dt);
    if (!inGame && mix > 0) gameTex.needsUpdate = true;

    /* once inside, the monitor is just a frame: redraw it rarely */
    if (inGame && (narrow || (!dirty && t - last3D < 0.1))) return;
    last3D = t; dirty = false;

    var ein = a;
    pc.scale.setScalar(lerp(heroPose.scale, 1, ein));
    pc.position.set(lerp(heroPose.pos.x, 0, ein), heroPose.pos.y, 0);
    pc.rotation.y = lerp(baseRotY + cur.x * 0.18 + (reduce ? 0 : Math.sin(t * 0.3) * 0.04), 0, ein);
    pc.rotation.x = cur.y * 0.05 * (1 - ein);
    pc.updateMatrixWorld(true);

    screen.getWorldPosition(tmpV);
    var plane = tmpV.z + BULGE * 0.55;
    var visH, upp, dist;
    if (narrow) {
      visH = Math.min(SCREEN_H, SCREEN_W / aspect) * 0.8; upp = 0;
    } else {
      visH = SCREEN_H * stageH / fit.h;   /* screen height in world == canvas height in px */
      upp = visH / stageH;
    }
    dist = (visH / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    var lift = fit.dy * upp;              /* camera rises so the screen sits where the canvas sits */
    endLook.set(tmpV.x, tmpV.y + lift, plane);
    endCam.set(tmpV.x, tmpV.y + lift, plane + dist);
    camera.position.lerpVectors(heroPose.cam, endCam, ein);
    lookV.lerpVectors(heroPose.look, endLook, ein);
    camera.lookAt(lookV);

    glowLight.intensity = 1.25 + Math.sin(t * 9) * 0.05 + Math.random() * 0.05 + mix * 0.4;
    bgUniforms.uTime.value = t;
    bgUniforms.uMouse.value.set((cur.x + 1) / 2, (1 - cur.y) / 2);
    screenUniforms.uMix.value = mix;
    screenUniforms.uFlat.value = sstep(0.6, 1, a);

    if (mix < 1 && (t - lastGlobe > 0.033 || t < lastGlobe)) { drawGlobe(t); lastGlobe = t; }

    renderer.clear();
    renderer.render(bgScene, orthoCam);
    renderer.clearDepth();
    renderer.render(scene, camera);
  }

  /* start in the right place if the browser restored a scroll position */
  resize();
  if (window.scrollY >= aboutY() - 40) { mode = 'about'; a = 1; }
  else if (window.scrollY >= gameY() - 40) {
    mode = 'game'; a = 1; setLive(true);
    if (narrow) { game.setLayout('portrait'); sizeGameBox(); }
  }

  /* warm-up while the boot screen covers everything */
  game.draw(); gameTex.needsUpdate = true;
  renderer.compile(scene, camera);
  frame(4);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { game.draw(); gameTex.needsUpdate = true; measureFit(); dirty = true; });

  var t0 = performance.now() - 4000, last = performance.now(), running = false, started = false;
  on(window, 'resize', function () { resize(); if (!started) frame(4); });
  function begin() {
    if (started) return; started = true;
    running = !document.hidden;
    last = performance.now();
    measureFit();
    if (running) requestAnimationFrame(loop);
  }
  var bootEl = document.getElementById('boot');
  if (!bootEl || bootEl.hidden || window.__bootDone) begin();
  else on(window, 'boot:off', begin, { once: true });

  function loop(now) {
    if (!alive || !running) return;
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var mx = mode === 'hero' ? mouse.x : 0, my = mode === 'hero' ? mouse.y : 0;
    var nx = cur.x + (mx - cur.x) * Math.min(1, dt * 3), ny = cur.y + (my - cur.y) * Math.min(1, dt * 3);
    if (Math.abs(nx - cur.x) + Math.abs(ny - cur.y) > 1e-4) dirty = true;
    cur.x = nx; cur.y = ny;
    frame((now - t0) / 1000);
    requestAnimationFrame(loop);
  }
  on(document, 'visibilitychange', function () {
    if (!started) return;
    running = !document.hidden;
    if (running) { last = performance.now(); lastT = null; requestAnimationFrame(loop); }
    else if (game.state === 'play') { game.pause(); syncButtons(); }
  });

  return destroy;
}
