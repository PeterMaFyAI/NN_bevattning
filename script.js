/***** Modellparametrar (2 decimaler) *****/
const W_IH = [
  [-0.12, 0.89, 0.64],
  [0.36, -0.85, -0.62]
];
const B_H = [-0.82, 0.71, 0.35];
const W_HO = [0.67, -1.08, 1.3];
const B_O = 0.91;

/***** Elementreferenser *****/
const svg = document.getElementById('connections');
const container = document.getElementById('network-container');
const inputEls = [
  document.getElementById('input0'),
  document.getElementById('input1')
];
const hiddenEls = [
  document.getElementById('hidden0'),
  document.getElementById('hidden1'),
  document.getElementById('hidden2')
];
const outputEl = document.getElementById('output-node');
const outputProb = document.getElementById('output-prob');
const hiddenLayerEl = document.getElementById('hidden-layer');
const outputLayerEl = document.getElementById('output-layer');
const ihLines = [];
const hoLines = [];

/***** Utility-funktioner *****/
const round2 = (x) => Math.round(x * 100) / 100;
const logistic = (x) => 1 / (1 + Math.exp(-x));

/* Returnera mitten på vänster/höger kant rel. container */
function edgeMid(el, side) {
  const r = el.getBoundingClientRect();
  const containerR = container.getBoundingClientRect();
  const x = (side === 'right' ? r.right : r.left) - containerR.left;
  const y = r.top + r.height / 2 - containerR.top;
  return { x, y };
}

/***** Rita linje + etikett *****/
function makeLine(x1, y1, x2, y2, label) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', '#9e9e9e');
  line.setAttribute('stroke-width', '2');
  svg.appendChild(line);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', (x1 + x2) / 2);
  text.setAttribute('y', (y1 + y2) / 2 - 6);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '0.85em');
  text.textContent = label;
  svg.appendChild(text);
  return { line, text };
}

/***** Centrera lager vertikalt *****/
function alignLayers() {
  const y0 = edgeMid(inputEls[0], 'right').y;
  const y1 = edgeMid(inputEls[1], 'right').y;
  const target = (y0 + y1) / 2;
  const hiddenMid = edgeMid(hiddenEls[1], 'left').y;
  const outMid = edgeMid(outputEl, 'left').y;
  hiddenLayerEl.style.transform = `translateY(${target - hiddenMid}px)`;
  outputLayerEl.style.transform = `translateY(${target - outMid}px)`;
}

/***** Bygg alla kopplingar *****/
function buildConnections() {
  svg.innerHTML = '';
  ihLines.length = 0;
  hoLines.length = 0;
  const inpR = inputEls.map((el) => edgeMid(el, 'right'));
  const hidL = hiddenEls.map((el) => edgeMid(el, 'left'));
  const hidR = hiddenEls.map((el) => edgeMid(el, 'right'));
  const outL = edgeMid(outputEl, 'left');
  for (let j = 0; j < 3; j += 1) {
    for (let i = 0; i < 2; i += 1) {
      ihLines.push(
        makeLine(
          inpR[i].x,
          inpR[i].y,
          hidL[j].x,
          hidL[j].y,
          W_IH[i][j].toFixed(2)
        )
      );
    }
  }
  for (let j = 0; j < 3; j += 1) {
    hoLines.push(
      makeLine(hidR[j].x, hidR[j].y, outL.x, outL.y, W_HO[j].toFixed(2))
    );
  }
  hideIH();
  hideHO();
}

/***** Visa/dölj in→hidden *****/
function hideIH() {
  ihLines.forEach((o) => {
    o.line.style.display = 'none';
    o.text.style.display = 'none';
  });
  hiddenEls.forEach((el) => el.querySelector('.bias-label').style.visibility = 'hidden');
}

function showIH(opt) {
  hideIH();
  if (opt === 'none') return;
  if (opt === 'all') {
    ihLines.forEach((o) => {
      o.line.style.display = 'block';
      o.text.style.display = 'block';
    });
    hiddenEls.forEach(
      (el) => (el.querySelector('.bias-label').style.visibility = 'visible')
    );
    return;
  }
  const idx = Number(opt.replace('h', ''));
  ihLines.forEach((o, k) => {
    if (Math.floor(k / 2) === idx) {
      o.line.style.display = 'block';
      o.text.style.display = 'block';
    }
  });
  hiddenEls[idx].querySelector('.bias-label').style.visibility = 'visible';
}

/***** Visa/dölj hidden→out *****/
function hideHO() {
  hoLines.forEach((o) => {
    o.line.style.display = 'none';
    o.text.style.display = 'none';
  });
  document.getElementById('bias-o').style.visibility = 'hidden';
}

function toggleHO(show) {
  if (show) {
    hoLines.forEach((o) => {
      o.line.style.display = 'block';
      o.text.style.display = 'block';
    });
    document.getElementById('bias-o').style.visibility = 'visible';
  } else {
    hideHO();
  }
}

/***** Beräkningar *****/
let hiddenOut = [0, 0, 0];
document.getElementById('calc-hidden').addEventListener('click', () => {
  const m = parseFloat(document.getElementById('moisture').value);
  const t = parseFloat(document.getElementById('temperature').value);
  const x = [m, t];
  hiddenOut = [0, 0, 0];
  for (let j = 0; j < 3; j += 1) {
    const pre = round2(x[0] * W_IH[0][j] + x[1] * W_IH[1][j] + B_H[j]);
    const post = round2(Math.max(0, pre));
    document.getElementById(`pre-h${j}`).textContent = pre;
    document.getElementById(`post-h${j}`).textContent = post;
    hiddenOut[j] = post;
  }
});

document.getElementById('calc-output').addEventListener('click', () => {
  const net = hiddenOut.reduce((s, h, j) => s + h * W_HO[j], 0) + B_O;
  const p = logistic(net);
  outputProb.textContent = round2(p);
  document.getElementById('prediction-text').textContent = `Bevattning startas: ${
    p >= 0.5 ? 'ja' : 'nej'
  }`;
});

/***** UI-kopplingar *****/
document.getElementById('show-ih').addEventListener('change', (e) =>
  showIH(e.target.value)
);
document.getElementById('show-ho').addEventListener('change', (e) =>
  toggleHO(e.target.checked)
);

/***** Init *****/
function refresh() {
  alignLayers();
  buildConnections();
}

window.addEventListener('load', refresh);
window.addEventListener('resize', refresh);
