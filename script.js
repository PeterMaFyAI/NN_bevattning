/***** Modellparametrar (2 decimaler) *****/
const W_IH = [
  [0.63, -0.92, 0.47],
  [-0.58, 0.31, -0.79]
];
const B_H = [0.28, -0.41, 0.22];
const W_HO = [1.17, -0.54, 0.83];
const B_O = -0.46;

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
const hiddenBiasEls = hiddenEls.map((el) => el.querySelector('.bias-label'));
const outputBiasEl = document.getElementById('bias-o');
const outputEl = document.getElementById('output-node');
const outputProb = document.getElementById('output-prob');
const ihLines = [];
const hoLines = [];
let currentIHSelection = 'none';
let currentHOVisible = false;

/***** Utility-funktioner *****/
const round2 = (x) => Math.round(x * 100) / 100;

/* Returnera mitten på vänster/höger kant rel. container */
function edgeMid(el, side) {
  const r = el.getBoundingClientRect();
  const containerR = container.getBoundingClientRect();
  const x = (side === 'right' ? r.right : r.left) - containerR.left;
  const y = r.top + r.height / 2 - containerR.top;
  return { x, y };
}

/***** Justera indatanoder *****/
function alignInputNodes() {
  if (!hiddenEls.length || inputEls.length < 2) return;
  const topTarget = edgeMid(hiddenEls[0], 'left').y;
  const bottomTarget = edgeMid(hiddenEls[hiddenEls.length - 1], 'left').y;
  const currentTop = edgeMid(inputEls[0], 'right').y;
  const currentBottom = edgeMid(inputEls[inputEls.length - 1], 'right').y;
  inputEls[0].style.transform = `translateY(${topTarget - currentTop}px)`;
  inputEls[1].style.transform = `translateY(${bottomTarget - currentBottom}px)`;
}

/***** Rita linje + etikett *****/
function makeLine(x1, y1, x2, y2, label, options = {}) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', '#9e9e9e');
  line.setAttribute('stroke-width', '2');
  svg.appendChild(line);

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const {
    labelRatio = 0.5,
    verticalOffset = -6,
    normalOffset = 0,
    align = false
  } = options;
  const baseX = x1 + dx * labelRatio;
  const baseY = y1 + dy * labelRatio;
  const normalX = (-dy / length) * normalOffset;
  const normalY = (dx / length) * normalOffset;
  const textX = baseX + normalX;
  const textY = baseY + normalY + verticalOffset;
  text.setAttribute('x', textX);
  text.setAttribute('y', textY);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.setAttribute('font-size', '0.85em');
  if (align) {
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    text.setAttribute('transform', `rotate(${angle}, ${textX}, ${textY})`);
  }
  text.textContent = label;
  svg.appendChild(text);
  return { line, text };
}

/***** Bygg alla kopplingar *****/
function buildConnections() {
  const { width, height } = container.getBoundingClientRect();
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
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
          W_IH[i][j].toFixed(2),
          {
            labelRatio: 1 / 3,
            verticalOffset: -2,
            normalOffset: -6,
            align: true
          }
        )
      );
    }
  }
  for (let j = 0; j < 3; j += 1) {
    hoLines.push(
      makeLine(
        hidR[j].x,
        hidR[j].y,
        outL.x,
        outL.y,
        W_HO[j].toFixed(2),
        {
          normalOffset: -10
        }
      )
    );
  }
  showIH(currentIHSelection);
  toggleHO(currentHOVisible);
}

function updateBiasLabels() {
  hiddenBiasEls.forEach((el, idx) => {
    el.textContent = `b=${B_H[idx].toFixed(2)}`;
  });
  outputBiasEl.textContent = `b=${B_O.toFixed(2)}`;
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
  currentIHSelection = opt;
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
  currentHOVisible = show;
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
  outputProb.textContent = round2(net);
  document.getElementById('prediction-text').textContent = `Bevattning startas: ${
    net > 0 ? 'ja' : 'nej'
  }`;
});

/***** UI-kopplingar *****/
document.getElementById('show-ih').addEventListener('change', (e) =>
  {
    currentIHSelection = e.target.value;
    showIH(currentIHSelection);
  }
);
document.getElementById('show-ho').addEventListener('change', (e) =>
  toggleHO(e.target.checked)
);

/***** Init *****/
function refresh() {
  window.requestAnimationFrame(() => {
    alignInputNodes();
    buildConnections();
    updateBiasLabels();
  });
}

window.addEventListener('load', refresh);
window.addEventListener('resize', refresh);
