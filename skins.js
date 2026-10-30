// All skins for Medovik Tower. Loaded before the game script in index.html.
//
// Add a skin: write its pieces inside createSkins() and add an entry to the returned object (and its id to SKIN_ORDER).
// Each skin provides:
//   name, hint (shown in the Skins menu while locked), storeKey (localStorage key; null = always unlocked),
//   crumbs   - colours of the crumbs thrown when a layer lands
//   layer(x, w, y, seed, topping) - draws one stacked layer, LAYER tall, y = its top; topping = true on the top layer
//   tool(c, y)   - draws what carries the layer (c = hovering layer, y = its bottom); returns nothing, hides itself once c.knifeOff is large
//   background() - draws the whole backdrop
//   mascot(i)    - draws the flying thing(s) in the sky; i is unused for now
// E (from the game) supplies: ctx, W, H, LAYER, GROUND, rnd, rr, mix, and live E.t (seconds) and E.camY (camera).

const SKIN_ORDER = ['honey', 'tira', 'adam'];

function createSkins(E) {
  const { ctx, W, H, LAYER, GROUND, rnd, rr, mix } = E;

  // ---------- shared pieces ----------
  const pallet = gy => {                                   // the plate the stack sits on (honey / tiramisu)
    ctx.fillStyle = '#e9e6f2'; ctx.fillRect((W - 300) / 2, gy, 300, 8);
    ctx.fillStyle = '#b8b3cf'; ctx.fillRect((W - 300) / 2, gy + 8, 300, 4);
  };

  // layered cake with cream; pal = colours, dust = topping density divisor (smaller = thicker)
  const cake = (pal, dust) => function (x, w, y, seed, topping) {
    const cream = 11, bodyY = y + cream - 3, bodyH = LAYER - cream + 3;
    ctx.save();
    rr(x, bodyY, w, bodyH, 4);
    const gx = ctx.createLinearGradient(x, 0, x + w, 0);
    gx.addColorStop(0, pal.edge); gx.addColorStop(0.07, pal.mid); gx.addColorStop(0.5, pal.core);
    gx.addColorStop(0.93, pal.mid); gx.addColorStop(1, pal.edge);
    ctx.fillStyle = gx; ctx.fill();
    ctx.save();
    ctx.clip();
    const gy = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyH);
    gy.addColorStop(0, 'rgba(255,225,150,.12)'); gy.addColorStop(0.55, 'rgba(0,0,0,0)'); gy.addColorStop(1, 'rgba(50,20,0,.4)');
    ctx.fillStyle = gy; ctx.fillRect(x, bodyY, w, bodyH);
    const count = Math.max(4, Math.floor(w / 7));          // pores and crumb texture
    for (let i = 0; i < count; i++) {
      const px = x + 3 + rnd(seed + i * 1.3) * (w - 6), py = bodyY + 5 + rnd(seed * 3 + i) * (bodyH - 9);
      const s = 0.8 + rnd(seed + i * 5) * 1.6;
      ctx.fillStyle = pal.pore;
      ctx.beginPath(); ctx.ellipse(px, py, s * 1.3, s * 0.8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = pal.pore2;
      ctx.fillRect(px + s, py - s, 1.5, 1);
    }
    ctx.fillStyle = pal.base; ctx.fillRect(x, bodyY + bodyH - 3, w, 3);   // crumbly baked bottom edge
    for (let i = 0; i < w / 5; i++) {
      ctx.fillStyle = 'rgba(70,30,0,.5)';
      ctx.fillRect(x + i * 5 + rnd(seed + i) * 3, bodyY + bodyH - 4 - rnd(seed + i * 2) * 2, 2, 2);
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(60,25,0,.3)'; ctx.fillRect(x + 2, y + cream - 1, w - 4, 3);   // cream shadow on the cake just below
    ctx.fillStyle = pal.drip;                              // cream drips
    const drips = Math.max(2, Math.floor(w / 45));
    for (let i = 0; i < drips; i++) {
      const dx = x + 10 + rnd(seed * 2 + i) * (w - 24), dh = 3 + rnd(seed + i * 9) * 4;
      rr(dx, y + cream - 4, 7, dh + 4, 3); ctx.fill();
    }
    rr(x - 2, y, w + 4, cream, 5);                         // cream layer, slightly bulging past the cake
    const gc = ctx.createLinearGradient(0, y, 0, y + cream);
    gc.addColorStop(0, pal.cream0); gc.addColorStop(1, pal.cream1);
    ctx.fillStyle = gc; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.75)'; rr(x + 3, y + 1.5, w - 6, 2, 1); ctx.fill();
    ctx.fillStyle = 'rgba(200,160,90,.35)'; ctx.fillRect(x, y + cream - 2, w, 1.5);
    if (topping) {                                         // crumbs / cocoa on the top layer
      const n = Math.floor(w / dust);
      for (let i = 0; i < n; i++) {
        const px = x + 1 + rnd(seed * 4 + i * 1.7) * (w - 2), py = y - 1 + rnd(seed + i * 3.1) * 4;
        ctx.fillStyle = pal.top[(i + seed) & 3];
        ctx.fillRect(px, py, 2 + rnd(i + seed) * 2, 2 + rnd(i * 2 + seed) * 1.5);
      }
    }
    ctx.restore();
  };

  // cake server / palette knife carrying the layer; y = top of the blade
  function knife(c, y) {
    const hd = c.hd, off = c.knifeOff * hd;
    const tip = hd < 0 ? c.x + c.w + 12 : c.x - 12;        // blade tip, far from the handle
    const base = hd < 0 ? c.x - 4 : c.x + c.w + 4;         // where the blade meets the neck
    ctx.save();
    ctx.translate(off, 0);
    ctx.beginPath();
    ctx.moveTo(base, y); ctx.lineTo(tip - hd * 8, y);
    ctx.quadraticCurveTo(tip, y + 1, tip, y + 4);
    ctx.quadraticCurveTo(tip - hd * 6, y + 6, tip - hd * 14, y + 5);
    ctx.lineTo(base, y + 5); ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + 6);
    g.addColorStop(0, '#f4f7fb'); g.addColorStop(1, '#9aa3b3');
    ctx.fillStyle = g; ctx.fill();
    const nx = base + hd * 46;                             // neck and handle
    ctx.strokeStyle = '#aab2c0'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(base, y + 2.5); ctx.lineTo(nx, y + 2.5); ctx.stroke();
    const hx = hd > 0 ? nx : nx - 100;
    rr(hx, y - 4, 100, 12, 6);
    const gh = ctx.createLinearGradient(0, y - 4, 0, y + 8);
    gh.addColorStop(0, '#9b5b25'); gh.addColorStop(1, '#5b3213');
    ctx.fillStyle = gh; ctx.fill();
    ctx.fillStyle = '#d7b34a'; ctx.fillRect(hd > 0 ? nx : nx - 6, y - 4, 6, 12);   // brass ferrule
    ctx.restore();
  }

  // ---------- honey ----------
  const HONEY = {
    edge: '#7d4413', mid: '#b06f26', core: '#d09442', pore: 'rgba(85,42,8,.5)', pore2: 'rgba(255,220,150,.5)', base: 'rgba(70,30,0,.45)',
    cream0: '#fffdf4', cream1: '#f1dfb2', drip: '#f6e8c3', top: ['#b9772a', '#8a4f17', '#d9a257', '#a5651f']
  };

  function bee() {
    const t = E.t, x = W / 2 + Math.sin(t * 0.8) * 190, y = 190 + Math.sin(t * 1.7) * 30 + Math.cos(t * 0.5) * 20;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    const fl = Math.sin(t * 40) * 3;
    ctx.beginPath(); ctx.ellipse(-3, -7, 5, 3 + fl * 0.3, -0.5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -7, 5, 3 - fl * 0.3, 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#f7c21b'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 5.5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#222'; ctx.fillRect(-2, -5, 2.5, 10); ctx.fillRect(3, -4.5, 2.5, 9);
    ctx.beginPath(); ctx.arc(-8, 0, 3.2, 0, 7); ctx.fill();
    ctx.restore();
  }

  function honeyBackground() {
    const camY = E.camY, p = Math.min(1, camY / 1800);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix([58, 80, 160], [12, 10, 40], p));
    g.addColorStop(1, mix([255, 205, 120], [90, 60, 130], p));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + p * 0.8) + ')';
    for (let i = 0; i < 40; i++) {
      const x = rnd(i) * W, y = ((rnd(i + 99) * H * 1.4 + camY * 0.15) % H);
      ctx.fillRect(x, y, 2, 2);
    }
    const gy = GROUND + camY;
    if (gy < H + 100) {
      ctx.fillStyle = '#3d6b2e'; ctx.fillRect(0, gy + 14, W, H);
      for (let i = 0; i < 14; i++) {
        const fx = 20 + i * 36, fy = gy + 14, hh = 8 + rnd(i) * 10;
        ctx.strokeStyle = '#2d5a22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx, fy + 30); ctx.lineTo(fx, fy - hh + 2); ctx.stroke();
        ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(fx, fy - hh, 9, 0, 7); ctx.fill();
        ctx.fillStyle = '#5a3a14'; ctx.beginPath(); ctx.arc(fx, fy - hh, 4.5, 0, 7); ctx.fill();
      }
      pallet(gy);
    }
  }

  // ---------- tiramisu ----------
  const TIRA = {
    edge: '#2e1a0e', mid: '#5a3a22', core: '#7a5233', pore: 'rgba(25,10,0,.5)', pore2: 'rgba(230,190,140,.35)', base: 'rgba(25,10,0,.5)',
    cream0: '#fff8ea', cream1: '#ead9b6', drip: '#f4e8cc', top: ['#3a2010', '#4d2d16', '#2b170a', '#5e3a1f']
  };

  function cup(cx, cy, k) {                                // coffee cup on a saucer, bottom centre at cx, cy
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
    ctx.fillStyle = '#e9e2d6'; ctx.beginPath(); ctx.ellipse(0, 0, 26, 5, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#f4efe6'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(17, -13, 7, -1.3, 1.4); ctx.stroke();
    rr(-16, -27, 32, 25, 9); ctx.fillStyle = '#f4efe6'; ctx.fill();
    ctx.fillStyle = '#3b2212'; ctx.beginPath(); ctx.ellipse(0, -27, 16, 3.5, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let j = -1; j <= 1; j += 2) {
      ctx.beginPath(); ctx.moveTo(j * 6, -31);
      ctx.bezierCurveTo(j * 6 + Math.sin(E.t * 2 + j) * 5, -38, j * 6 - Math.sin(E.t * 2 + j) * 5, -44, j * 6, -52); ctx.stroke();
    }
    ctx.restore();
  }

  function flyingCup() {
    const t = E.t;
    cup(W / 2 + Math.sin(t * 0.8) * 190, 190 + Math.sin(t * 1.7) * 30 + Math.cos(t * 0.5) * 20 + 12, 0.8);
  }

  function coffeeBackground() {
    const camY = E.camY, t = E.t, p = Math.min(1, camY / 1800);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix([46, 28, 20], [14, 8, 6], p));
    g.addColorStop(1, mix([196, 140, 92], [84, 52, 34], p));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 24; i++) {                         // drifting coffee beans
      const x = rnd(i) * W, y = (rnd(i + 99) * H * 1.4 + camY * 0.15 + t * 8 * (0.4 + rnd(i + 7))) % H;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rnd(i + 3) * 6.3 + t * 0.3);
      ctx.fillStyle = 'rgba(30,16,8,.6)'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 4, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(210,160,110,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(0, -2.5, 5, 0); ctx.stroke();
      ctx.restore();
    }
    const gy = GROUND + camY;
    if (gy < H + 100) {
      ctx.fillStyle = '#5b3a24'; ctx.fillRect(0, gy + 14, W, H);
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      for (let i = 0; i < 8; i++) ctx.fillRect(0, gy + 36 + i * 22, W, 2);
      cup(42, gy + 52, 1); cup(W - 42, gy + 52, 1);
      pallet(gy);
    }
  }

  // ---------- Adam(b) person: a garbage pile held in two hands, flies, a dump ----------
  function garbage(x, w, y, seed, topping) {               // one slice of the pile, LAYER tall
    const bags = ['#161a16', '#222b22', '#2c382c', '#1d2230', '#33332a'];
    const junk = ['#c94b3a', '#d8d2b8', '#4a7bc2', '#e0c04a', '#9a9a9a', '#7a4a2a'];
    ctx.save();
    rr(x - 1, y + 2, w + 2, LAYER - 2, 9); ctx.clip();
    ctx.fillStyle = '#10130f'; ctx.fillRect(x - 2, y, w + 4, LAYER);
    const n = Math.max(2, Math.ceil(w / 30));
    for (let i = 0; i < n; i++) {                          // lumpy bin bags
      const cx = x + (i + 0.5) * w / n + (rnd(seed + i) - 0.5) * 8, cy = y + LAYER / 2 + (rnd(seed * 2 + i) - 0.5) * 8;
      const rx = w / n * 0.8 + 4, ry = 15 + rnd(seed + i * 3) * 4;
      ctx.fillStyle = bags[((seed + i) | 0) % 5];
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, (rnd(seed + i * 7) - 0.5) * 0.4, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.16)';             // plastic shine
      ctx.beginPath(); ctx.ellipse(cx - rx * 0.25, cy - ry * 0.45, rx * 0.45, ry * 0.22, -0.3, 0, 7); ctx.fill();
    }
    const m = Math.max(3, Math.floor(w / 14));             // scraps poking out
    for (let i = 0; i < m; i++) {
      const px = x + 3 + rnd(seed * 5 + i * 1.9) * (w - 8), py = y + 4 + rnd(seed * 3 + i * 2.3) * (LAYER - 10);
      ctx.save(); ctx.translate(px, py); ctx.rotate(rnd(seed + i * 6) * 3);
      ctx.fillStyle = junk[(rnd(seed + i * 4) * 6) | 0]; ctx.fillRect(-3, -2, 6 + rnd(i + seed) * 4, 3);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x - 2, y + LAYER - 6, w + 4, 6);
    ctx.restore();
    if (topping) {                                         // tied-off bag knots on the very top
      ctx.fillStyle = '#222b22';
      for (let k = 0; k < Math.max(1, Math.floor(w / 70)); k++) {
        const kx = x + 14 + rnd(seed + k * 8) * Math.max(1, w - 28);
        ctx.beginPath(); ctx.moveTo(kx - 5, y + 5); ctx.lineTo(kx + rnd(k + seed) * 4 - 2, y - 9); ctx.lineTo(kx + 5, y + 5); ctx.closePath(); ctx.fill();
      }
    }
  }

  function hands(c, y) {                                   // two hands cup the pile, then open to let it drop; y = layer bottom
    const off = c.knifeOff * 1.6, o = Math.min(1, off / (c.w * 0.5 + 1)), inner = Math.min(30, c.w / 2);
    for (const d of [-1, 1]) {
      const edge = d < 0 ? c.x : c.x + c.w, ax = edge + d * 6;
      ctx.save(); ctx.translate(d * off, 0);
      ctx.fillStyle = '#3d4a5c'; rr(d < 0 ? ax - 170 : ax + 60, y - 1, 110, 15, 6); ctx.fill();   // sleeve
      ctx.fillStyle = '#e8b48a'; rr(d < 0 ? ax - 110 : ax, y + 1, 110, 11, 5); ctx.fill();        // forearm
      rr(d < 0 ? edge - 6 : edge - inner, y, inner + 6, 9, 4); ctx.fill();                          // palm under the pile
      ctx.save(); ctx.translate(edge + d * 2, y + 6); ctx.rotate(d * o * 0.9);                      // fingers curl up the side, splay open
      rr(-3.5, -22, 7, 26, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(120,70,40,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, -12); ctx.lineTo(3, -12); ctx.moveTo(-3, -5); ctx.lineTo(3, -5); ctx.stroke();
      ctx.restore(); ctx.restore();
    }
  }

  function fly(x, y, tt) {
    ctx.save(); ctx.translate(x + Math.sin(tt * 23) * 1.2, y + Math.cos(tt * 29) * 1.2);
    const fl = Math.sin(tt * 60) * 2;
    ctx.fillStyle = 'rgba(210,230,255,.6)';
    ctx.beginPath(); ctx.ellipse(-3, -5, 6, 2.5 + fl * 0.3, -0.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(3, -5, 6, 2.5 - fl * 0.3, 0.4, 0, 7); ctx.fill();
    ctx.fillStyle = '#1b1b1b'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 3.8, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#b22'; ctx.beginPath(); ctx.arc(-6, -1, 2.2, 0, 7); ctx.fill();
    ctx.restore();
  }

  function flies() {
    const t = E.t;
    for (let i = 0; i < 3; i++) {
      fly(W / 2 + Math.sin(t * (0.7 + i * 0.4) + i * 2) * 180 + Math.sin(t * 9 + i) * 10,
        190 + i * 55 + Math.sin(t * (1.5 + i) + i) * 28 + Math.cos(t * 8 + i) * 6, t + i);
    }
  }

  function dumpBackground() {
    const camY = E.camY, t = E.t, p = Math.min(1, camY / 1800);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix([112, 108, 92], [18, 18, 16], p));
    g.addColorStop(1, mix([170, 150, 104], [60, 52, 40], p));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const lit = ['rgba(220,215,195,.55)', 'rgba(120,150,170,.5)', 'rgba(200,90,70,.5)'];
    for (let i = 0; i < 26; i++) {                         // litter blowing past
      const x = (rnd(i) * W + t * 12 * (0.4 + rnd(i + 5))) % W, y = (rnd(i + 99) * H * 1.4 + camY * 0.15) % H;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rnd(i + 3) * 6.3 + t * 0.8);
      ctx.fillStyle = lit[i % 3]; ctx.fillRect(-4, -2.5, 8, 5); ctx.restore();
    }
    const gy = GROUND + camY;
    if (gy < H + 100) {
      for (const [mx, rx, ry] of [[40, 110, 55], [190, 90, 38], [330, 120, 62], [450, 90, 44]]) {   // heaps behind
        ctx.fillStyle = '#262b23'; ctx.beginPath(); ctx.ellipse(mx, gy + 14, rx, ry, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#323a2e'; ctx.beginPath(); ctx.ellipse(mx - rx * 0.2, gy + 14 - ry * 0.15, rx * 0.6, ry * 0.6, 0, 0, 7); ctx.fill();
      }
      ctx.fillStyle = '#4a3d2c'; ctx.fillRect(0, gy + 14, W, H);
      for (let i = 0; i < 12; i++) {                       // cans, bottles and paper on the dirt
        const fx = 10 + i * 40 + rnd(i) * 14, fy = gy + 22 + rnd(i + 20) * 40;
        if (i % 3 === 0) { ctx.fillStyle = '#9aa0a8'; rr(fx, fy, 8, 12, 2); ctx.fill(); }
        else if (i % 3 === 1) { ctx.fillStyle = '#3b7a3b'; rr(fx, fy - 2, 6, 14, 2); ctx.fill(); }
        else { ctx.fillStyle = '#e6e1cc'; ctx.save(); ctx.translate(fx, fy); ctx.rotate(rnd(i) * 2); ctx.fillRect(0, 0, 11, 7); ctx.restore(); }
      }
      ctx.fillStyle = '#7a6140'; ctx.fillRect((W - 300) / 2, gy, 300, 8);                  // wooden pallet
      ctx.fillStyle = '#5a4630'; ctx.fillRect((W - 300) / 2, gy + 8, 300, 4);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; for (let i = 1; i < 6; i++) ctx.fillRect((W - 300) / 2 + i * 50, gy, 2, 8);
    }
  }

  // ---------- the list ----------
  return {
    honey: {
      name: 'Honey', hint: '', storeKey: null,
      crumbs: ['#c98a3a', '#a5651f', '#8a4f17', '#e0a850', '#fff3d6', '#f0dba8'],
      layer: cake(HONEY, 3.5), tool: knife, background: honeyBackground, mascot: bee
    },
    tira: {
      name: 'Tiramisu', hint: 'Tiramisu unlocks at layer 24.', storeKey: 'medovikTira',
      crumbs: ['#5a3a22', '#3b2212', '#2b170a', '#8a6a48', '#fff3d6', '#f0dba8'],
      layer: cake(TIRA, 2), tool: knife, background: coffeeBackground, mascot: flyingCup
    },
    adam: {
      name: 'Adam(b) person', hint: 'Adam(b) person is a secret.', storeKey: 'medovikAdam',
      crumbs: ['#222b22', '#c94b3a', '#d8d2b8', '#4a7bc2', '#e0c04a', '#9a9a9a'],
      layer: garbage, tool: hands, background: dumpBackground, mascot: flies
    }
  };
}
