/* Moonwish — maintenance page scripts */

/* =========================================================
   CONFIG — edit these to update the page
   ========================================================= */
const PROGRESS = 76;
const STEPS = [
  { name: "Design",  desc: "UI/UX and visual assets are ready",   done: true  },
  { name: "Coding",  desc: "Website development is in progress",  done: true  },
  { name: "Content", desc: "Adding and polishing site content",   done: true  },
  { name: "Launch",  desc: "Final testing and going live soon",   done: false },
];

/* ---------- Progress + steps ---------- */
const NEXT = STEPS.findIndex(s => !s.done);   // first unfinished step gets the icy "next" ring
const dot = (done, next) => `<div class="dot ${done ? "done" : next ? "next" : ""}"><svg viewBox="0 0 16 16"><use href="#check"/></svg></div>`;
document.getElementById("steps").innerHTML =
  STEPS.map((s, i) => `<div class="step">${dot(s.done, i === NEXT)}${s.name}</div>`).join("");

const half = Math.ceil(STEPS.length / 2);
const statusHTML = s => `<div class="status-item">${dot(s.done, STEPS.indexOf(s) === NEXT)}<div><h3>${s.name}</h3><p>${s.desc}</p></div></div>`;
document.getElementById("statusLeft").innerHTML  = STEPS.slice(0, half).map(statusHTML).join("");
document.getElementById("statusRight").innerHTML = STEPS.slice(half).map(statusHTML).join("");

// Animate bar + counter up to PROGRESS
requestAnimationFrame(() => {
  document.getElementById("barFill").style.width = PROGRESS + "%";
  document.querySelector(".bar").setAttribute("aria-valuenow", PROGRESS);
  const pct = document.getElementById("pct"), start = performance.now();
  (function tick(now) {
    const t = Math.min((now - start) / 1600, 1), e = 1 - Math.pow(1 - t, 3);
    pct.textContent = Math.round(PROGRESS * e) + "%";
    if (t < 1) requestAnimationFrame(tick);
  })(start);
});

/* ---------- Notify form (wire this to your mailing service) ---------- */
document.getElementById("notifyForm").addEventListener("submit", e => {
  e.preventDefault();
  const input = e.target.email, msg = document.getElementById("formMsg");
  if (!input.checkValidity()) { msg.textContent = "Please enter a valid email address."; return; }
  // TODO: send input.value to your newsletter / form endpoint here
  msg.textContent = "Thank you! We’ll let you know when we’re back. ✦";
  input.value = "";
});

/* ---------- Social badges: scalloped frame + icons ---------- */
function scallopPath(n = 10, R = 46, r = 6) {
  let d = "";
  for (let i = 0; i <= n * 8; i++) {
    const a = (i / (n * 8)) * Math.PI * 2;
    const rad = R + r * Math.abs(Math.cos((a * n) / 2));
    d += (i ? "L" : "M") + (50 + rad * Math.cos(a)).toFixed(2) + " " + (50 + rad * Math.sin(a)).toFixed(2);
  }
  return d + "Z";
}
const SCALLOP = `<svg class="scallop" viewBox="-4 -4 108 108">
  <path d="${scallopPath()}" fill="rgba(60,25,90,.6)" stroke="#f7b3e4" stroke-width="2.5"/>
  <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,200,240,.35)"/></svg>`;
// Brand icons, coloured white via CSS mask.
//  - Plain slug  -> Simple Icons (simpleicons.org, CC0), solid logos: data-icon="bluesky"
//  - "tabler:"   -> Tabler Icons (tabler.io, MIT), outline logos:  data-icon="tabler:brand-codepen"
//  - "fa:"       -> Font Awesome Free brands (fontawesome.com, CC BY 4.0), solid logos: data-icon="fa:github-alt"
const ICON_URL = icon =>
  icon.startsWith("tabler:") ? `https://cdn.jsdelivr.net/npm/@tabler/icons@3/icons/outline/${icon.slice(7)}.svg`
: icon.startsWith("fa:")     ? `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6/svgs/brands/${icon.slice(3)}.svg`
:                              `https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${icon}.svg`;
document.querySelectorAll(".social").forEach(a => {
  a.innerHTML = SCALLOP + `<span class="icon${a.dataset.icon.startsWith("tabler:") ? " outline" : ""}" aria-hidden="true" style="--icon: url('${ICON_URL(a.dataset.icon)}')"></span>`;
});

/* ---------- Spiral galaxy (GPU point stars, masked to the dress) ----------
   Look inspired by Chema Alfonso's galaxy pen (codepen.io/ChemaAlfonso/pen/VwzrwGx):
   lots of tiny additive points with bright centres, coloured inner -> outer.
   Drawn with WebGL into a hidden canvas, then clipped to galaxy-mask.png. */
(function galaxy() {
  const GALAXY = {
    count: 90000,          // number of stars
    branches: 4,           // spiral arms
    spin: 2.8,             // how much the arms curl (higher = more spirally)
    randomness: 0.5,       // how far stars stray from the arms
    randomnessPower: 3.2,  // higher = tighter arms with a few strays
    size: 10,              // star size
    innerColor: "#9fd4ff",     // ice blue core (was purple #a340b7)
    outerColor: "#5f6fd6",     // deeper periwinkle at the edges
    speed: 0.05,           // rotation speed
    centerX: 0.17, centerY: 0.86,  // centre, as fractions of the banner (under her feet)
    radius: 0.6,           // radius as a fraction of the banner width
    viewAngle: 58,         // 0 = seen from above, 90 = edge-on
    roll: -7,              // tilt of the disc on screen (degrees)
  };

  const out = document.getElementById("galaxy"), ctx = out.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mask = new Image(); mask.src = "galaxy-mask.png";        // white = where the galaxy shows

  const glc = document.createElement("canvas");
  const gl = glc.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: true });
  if (!gl) return;

  // --- build the stars ---
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const inner = hex(GALAXY.innerColor), outer = hex(GALAXY.outerColor);
  const N = GALAXY.count, data = new Float32Array(N * 8);   // r, angle, offX, offY, offZ, scale, colourMix, spare
  const stray = r => Math.pow(Math.random(), GALAXY.randomnessPower) * (Math.random() < .5 ? -1 : 1) * GALAXY.randomness * r;
  for (let i = 0; i < N; i++) {
    const r = Math.random();
    const angle = (i % GALAXY.branches) / GALAXY.branches * Math.PI * 2 + r * GALAXY.spin * Math.PI;
    data.set([r, angle, stray(r), stray(r) * .35, stray(r), Math.random(), r, 0], i * 8);
  }

  const vs = `
    attribute vec2 aPolar; attribute vec3 aOffset; attribute float aScale; attribute float aMix;
    uniform float uTime, uSize, uCos, uSin, uRollC, uRollS, uRadius;
    uniform vec2 uCenter; uniform vec3 uInner, uOuter;
    varying vec3 vColor;
    void main() {
      float a = aPolar.y + uTime;
      vec3 p = vec3(cos(a) * aPolar.x, 0.0, sin(a) * aPolar.x) + aOffset;   // disc in the x-z plane
      // tip the disc towards the viewer
      vec3 t = vec3(p.x, p.y * uCos - p.z * uSin, p.y * uSin + p.z * uCos);
      float persp = 3.0 / (3.0 + t.z);                                       // simple perspective
      vec2 s = t.xy * persp * uRadius * 2.0;
      s = vec2(s.x * uRollC - s.y * uRollS, s.x * uRollS + s.y * uRollC);
      gl_Position = vec4(uCenter + s, 0.0, 1.0);
      gl_PointSize = uSize * aScale * persp;
      vColor = mix(uInner, uOuter, aMix);
    }`;
  const fs = `
    precision mediump float; varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      float glow = pow(max(1.0 - d * 2.0, 0.0), 5.0);   // bright centre, fast falloff
      gl_FragColor = vec4(vColor * glow, glow);           // transparent background, glow builds up
    }`;
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  [["aPolar", 2, 0], ["aOffset", 3, 2], ["aScale", 1, 5], ["aMix", 1, 6]].forEach(([n, k, off]) => {
    const l = gl.getAttribLocation(prog, n); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, k, gl.FLOAT, false, 32, off * 4);
  });
  const U = n => gl.getUniformLocation(prog, n);
  const va = GALAXY.viewAngle * Math.PI / 180, ro = GALAXY.roll * Math.PI / 180;
  gl.uniform1f(U("uCos"), Math.cos(va)); gl.uniform1f(U("uSin"), Math.sin(va));
  gl.uniform1f(U("uRollC"), Math.cos(ro)); gl.uniform1f(U("uRollS"), Math.sin(ro));
  gl.uniform1f(U("uRadius"), GALAXY.radius);
  gl.uniform2f(U("uCenter"), GALAXY.centerX * 2 - 1, 1 - GALAXY.centerY * 2);
  gl.uniform3fv(U("uInner"), inner); gl.uniform3fv(U("uOuter"), outer);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);                   // additive: dense areas glow

  // offsetWidth ignores the banner's rotate(), so the canvas matches the image exactly
  function size() {
    const q = Math.min((devicePixelRatio || 1) * 1.25, 2.5);
    out.width = glc.width = Math.round(out.offsetWidth * q);
    out.height = glc.height = Math.round(out.offsetHeight * q);
    gl.viewport(0, 0, glc.width, glc.height);
    gl.uniform1f(U("uSize"), GALAXY.size * glc.width / 1000);
  }
  function draw(t) {
    gl.uniform1f(U("uTime"), reduce ? 0 : t / 1000 * GALAXY.speed);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, N);
    const w = out.width, h = out.height;
    ctx.clearRect(0, 0, w, h);
    if (mask.complete && mask.naturalWidth) {
      ctx.drawImage(glc, 0, 0, w, h);
      ctx.globalCompositeOperation = "destination-in";      // keep only the starry fabric + gaps
      ctx.drawImage(mask, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  addEventListener("resize", size); size(); requestAnimationFrame(draw);
})();

/* ---------- Twinkling starfield ---------- */
(function starfield() {
  const canvas = document.getElementById("stars"), ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [], w, h, dpr;

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr; h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
    const count = Math.round((innerWidth * innerHeight) / 2200);
    stars = Array.from({ length: count }, () => {
      const big = Math.random() < 0.035;
      return {
        x: Math.random() * w, y: Math.random() * h,
        r: (big ? 1.6 + Math.random() * 1.6 : 0.3 + Math.random() * 1.1) * dpr,
        big, phase: Math.random() * Math.PI * 2, speed: 0.6 + Math.random() * 2,
        tint: Math.random() < 0.35 ? "255,190,240" : "255,255,255",
      };
    });
  }

  function sparkle(x, y, s, a) {           // 4-point star with glow
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 3);
    g.addColorStop(0, "rgba(255,210,245,.6)"); g.addColorStop(1, "rgba(255,210,245,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, s * 3, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath();
    ctx.moveTo(0, -s * 4); ctx.quadraticCurveTo(0, 0, s * 4, 0); ctx.quadraticCurveTo(0, 0, 0, s * 4);
    ctx.quadraticCurveTo(0, 0, -s * 4, 0); ctx.quadraticCurveTo(0, 0, 0, -s * 4); ctx.fill();
    ctx.restore();
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const a = reduce ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(t / 1000 * s.speed + s.phase));
      if (s.big) sparkle(s.x, s.y, s.r, a);
      else { ctx.globalAlpha = a; ctx.fillStyle = `rgb(${s.tint})`; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(draw);
  }
  addEventListener("resize", resize);
  resize(); requestAnimationFrame(draw);
})();
