/***** Modellparametrar (2 decimaler) *****/
const INITIAL_PARAMS = {
  W_IH: [
    [0.63, -0.92, 0.47],
    [-0.58, 0.31, -0.79]
  ],
  B_H: [0.28, -0.41, 0.22],
  W_HO: [1.17, -0.54, 0.83],
  B_O: -0.46
};

function cloneParams(src) {
  return {
    W_IH: src.W_IH.map((row) => row.slice()),
    B_H: src.B_H.slice(),
    W_HO: src.W_HO.slice(),
    B_O: src.B_O
  };
}

let params = cloneParams(INITIAL_PARAMS);
const LEARNING_RATE_MANUAL = 0.0008;
const LEARNING_RATE_AUTO = 0.0006;

/***** Dataset *****/
const trainingData = [
  { id: 1, moisture: 51, temperature: 19, label: 'nej' },
  { id: 2, moisture: 60, temperature: 35, label: 'ja' },
  { id: 3, moisture: 16, temperature: 17, label: 'ja' },
  { id: 4, moisture: 78, temperature: 18, label: 'nej' },
  { id: 5, moisture: 56, temperature: 33, label: 'ja' },
  { id: 6, moisture: 17, temperature: 31, label: 'ja' },
  { id: 7, moisture: 37, temperature: 16, label: 'nej' },
  { id: 8, moisture: 21, temperature: 28, label: 'ja' },
  { id: 9, moisture: 63, temperature: 17, label: 'nej' },
  { id: 10, moisture: 40, temperature: 17, label: 'nej' },
  { id: 11, moisture: 80, temperature: 28, label: 'nej' },
  { id: 12, moisture: 17, temperature: 33, label: 'ja' },
  { id: 13, moisture: 25, temperature: 22, label: 'ja' },
  { id: 14, moisture: 76, temperature: 28, label: 'nej' },
  { id: 15, moisture: 46, temperature: 20, label: 'nej' },
  { id: 16, moisture: 50, temperature: 24, label: 'nej' },
  { id: 17, moisture: 76, temperature: 28, label: 'nej' },
  { id: 18, moisture: 27, temperature: 17, label: 'ja' },
  { id: 19, moisture: 21, temperature: 19, label: 'ja' },
  { id: 20, moisture: 22, temperature: 23, label: 'ja' },
  { id: 21, moisture: 65, temperature: 20, label: 'nej' },
  { id: 22, moisture: 28, temperature: 23, label: 'ja' },
  { id: 23, moisture: 35, temperature: 34, label: 'ja' },
  { id: 24, moisture: 62, temperature: 26, label: 'nej' },
  { id: 25, moisture: 46, temperature: 31, label: 'ja' },
  { id: 26, moisture: 24, temperature: 21, label: 'ja' },
  { id: 27, moisture: 61, temperature: 24, label: 'nej' },
  { id: 28, moisture: 64, temperature: 25, label: 'nej' },
  { id: 29, moisture: 59, temperature: 21, label: 'nej' },
  { id: 30, moisture: 56, temperature: 34, label: 'ja' },
  { id: 31, moisture: 67, temperature: 21, label: 'nej' },
  { id: 32, moisture: 67, temperature: 17, label: 'nej' },
  { id: 33, moisture: 67, temperature: 23, label: 'nej' },
  { id: 34, moisture: 58, temperature: 34, label: 'ja' },
  { id: 35, moisture: 53, temperature: 19, label: 'nej' },
  { id: 36, moisture: 69, temperature: 30, label: 'nej' },
  { id: 37, moisture: 55, temperature: 17, label: 'nej' },
  { id: 38, moisture: 69, temperature: 30, label: 'nej' },
  { id: 39, moisture: 60, temperature: 24, label: 'nej' },
  { id: 40, moisture: 56, temperature: 20, label: 'nej' },
  { id: 41, moisture: 29, temperature: 34, label: 'ja' },
  { id: 42, moisture: 63, temperature: 20, label: 'nej' },
  { id: 43, moisture: 38, temperature: 22, label: 'nej' },
  { id: 44, moisture: 56, temperature: 18, label: 'nej' },
  { id: 45, moisture: 20, temperature: 15, label: 'ja' },
  { id: 46, moisture: 14, temperature: 16, label: 'ja' },
  { id: 47, moisture: 16, temperature: 35, label: 'ja' },
  { id: 48, moisture: 58, temperature: 27, label: 'ja' },
  { id: 49, moisture: 61, temperature: 32, label: 'ja' },
  { id: 50, moisture: 59, temperature: 26, label: 'ja' }
];

const testData = [
  { id: 1, moisture: 12, temperature: 29, label: 'ja' },
  { id: 2, moisture: 55, temperature: 20, label: 'nej' },
  { id: 3, moisture: 24, temperature: 30, label: 'ja' },
  { id: 4, moisture: 17, temperature: 21, label: 'ja' },
  { id: 5, moisture: 46, temperature: 19, label: 'nej' },
  { id: 6, moisture: 41, temperature: 27, label: 'ja' },
  { id: 7, moisture: 60, temperature: 30, label: 'ja' },
  { id: 8, moisture: 20, temperature: 20, label: 'ja' },
  { id: 9, moisture: 67, temperature: 27, label: 'nej' },
  { id: 10, moisture: 80, temperature: 23, label: 'nej' }
];

const LABEL_TO_TARGET = { ja: 1, nej: -1 };
const LABEL_FROM_OUTPUT = (out) => (out > 0 ? 'ja' : 'nej');

const NORMALIZATION_STATS = (() => {
  const mean = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;
  const variance = (arr, mu) =>
    arr.reduce((sum, val) => sum + (val - mu) * (val - mu), 0) / arr.length;
  const moistureValues = trainingData.map((example) => example.moisture);
  const temperatureValues = trainingData.map((example) => example.temperature);
  const moistureMean = mean(moistureValues);
  const temperatureMean = mean(temperatureValues);
  const moistureStd = Math.sqrt(variance(moistureValues, moistureMean)) || 1;
  const temperatureStd =
    Math.sqrt(variance(temperatureValues, temperatureMean)) || 1;
  return {
    moistureMean,
    moistureStd,
    temperatureMean,
    temperatureStd
  };
})();

function normalizeInputs([moisture, temperature]) {
  const {
    moistureMean,
    moistureStd,
    temperatureMean,
    temperatureStd
  } = NORMALIZATION_STATS;
  return [
    (moisture - moistureMean) / moistureStd,
    (temperature - temperatureMean) / temperatureStd
  ];
}

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
const predictionText = document.getElementById('prediction-text');
const showIHSelect = document.getElementById('show-ih');
const showHOCheckbox = document.getElementById('show-ho');
const manualControls = document.getElementById('manual-controls');
const loadNextBtn = document.getElementById('load-next-example');
const manualExampleInfo = document.getElementById('manual-example-info');
const backpropBtn = document.getElementById('backprop-btn');
const manualFeedback = document.getElementById('manual-feedback');
const manualStatus = document.getElementById('manual-status');
const autoStatus = document.getElementById('auto-status');
const manualTrainingBtn = document.getElementById('manual-training-btn');
const autoTrainBtn = document.getElementById('auto-train-btn');
const epochsInput = document.getElementById('epochs-input');
const batchInput = document.getElementById('batch-input');
const animateTrainingCheckbox = document.getElementById('animate-training');
const resetBtn = document.getElementById('reset-weights-btn');
const toggleTrainingBtn = document.getElementById('toggle-training-table');
const trainingTableContainer = document.getElementById('training-table-container');
const toggleTestBtn = document.getElementById('toggle-test-table');
const testTableContainer = document.getElementById('test-table-container');
const evaluateTestBtn = document.getElementById('evaluate-test-btn');
const evaluationResult = document.getElementById('evaluation-result');

const ihLines = [];
const hoLines = [];
let currentIHSelection = 'none';
let currentHOVisible = false;

let hiddenOut = [0, 0, 0];
let manualMode = false;
let manualPointer = 0;
let manualActiveExample = null;
let manualForwardCache = null;
let manualAnimating = false;
let autoRunning = false;
let storedIHSelection = 'none';
let storedHOVisible = false;
let autoAnimationEnabled = animateTrainingCheckbox.checked;

/***** Utility-funktioner *****/
const round2 = (x) => Math.round(x * 100) / 100;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function edgeMid(el, side) {
  const r = el.getBoundingClientRect();
  const containerR = container.getBoundingClientRect();
  const x = (side === 'right' ? r.right : r.left) - containerR.left;
  const y = r.top + r.height / 2 - containerR.top;
  return { x, y };
}

function getInputs() {
  const moisture = parseFloat(document.getElementById('moisture').value) || 0;
  const temperature = parseFloat(document.getElementById('temperature').value) || 0;
  return [moisture, temperature];
}

function resetHiddenDisplays() {
  hiddenEls.forEach((_, idx) => {
    document.getElementById(`pre-h${idx}`).textContent = '?';
    document.getElementById(`post-h${idx}`).textContent = '?';
  });
  outputProb.textContent = '?';
  predictionText.textContent = 'Bevattning startas: ?';
}

function setHiddenCell(idx, pre, post) {
  document.getElementById(`pre-h${idx}`).textContent = round2(pre);
  document.getElementById(`post-h${idx}`).textContent = round2(post);
}

function updatePrediction(value) {
  outputProb.textContent = round2(value);
  predictionText.textContent = `Bevattning startas: ${value > 0 ? 'ja' : 'nej'}`;
}

function highlightNode(el, className = 'pulse', duration = 800) {
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

function highlightBiasLabel(el, duration = 800) {
  const prevVisibility = el.style.visibility;
  el.style.visibility = 'visible';
  el.classList.add('update-flash');
  setTimeout(() => {
    el.classList.remove('update-flash');
    if (prevVisibility === 'hidden') {
      el.style.visibility = 'hidden';
    }
  }, duration);
}

function highlightLine(lineObj, lineClass, textClass, duration = 800) {
  if (!lineObj) return;
  const { line, text } = lineObj;
  const lineWasHidden = line.style.display === 'none';
  const textWasHidden = text.style.display === 'none';
  if (lineWasHidden) line.style.display = 'block';
  if (textWasHidden) text.style.display = 'block';
  line.classList.add(lineClass);
  text.classList.add(textClass);
  setTimeout(() => {
    line.classList.remove(lineClass);
    text.classList.remove(textClass);
    if (lineWasHidden) line.style.display = 'none';
    if (textWasHidden) text.style.display = 'none';
  }, duration);
}

function updateManualStatus(text) {
  manualStatus.textContent = text;
}

function updateControlStates() {
  manualTrainingBtn.disabled = autoRunning;
  autoTrainBtn.disabled = manualMode || autoRunning;
  loadNextBtn.disabled = autoRunning || manualAnimating;
  backpropBtn.disabled = autoRunning || manualAnimating;
  resetBtn.disabled = autoRunning || manualAnimating;
  epochsInput.disabled = autoRunning;
  batchInput.disabled = autoRunning;
}

animateTrainingCheckbox.addEventListener('change', () => {
  autoAnimationEnabled = animateTrainingCheckbox.checked;
});

function forwardPassCore(x, p = params) {
  const preHidden = [];
  const actHidden = [];
  for (let j = 0; j < 3; j += 1) {
    const pre = x[0] * p.W_IH[0][j] + x[1] * p.W_IH[1][j] + p.B_H[j];
    preHidden.push(pre);
    actHidden.push(Math.max(0, pre));
  }
  const output = actHidden.reduce((sum, h, j) => sum + h * p.W_HO[j], p.B_O);
  return { preHidden, actHidden, output };
}

function forwardPassModel(rawX, p = params) {
  const modelInputs = normalizeInputs(rawX);
  const forward = forwardPassCore(modelInputs, p);
  return { ...forward, modelInputs, rawInputs: rawX };
}

function forwardPassDisplay(rawX, p = params) {
  const forward = forwardPassCore(rawX, p);
  return { ...forward, modelInputs: rawX, rawInputs: rawX };
}

function computeGradients(forward, x, target, p = params) {
  const grads = {
    W_IH: [new Array(3).fill(0), new Array(3).fill(0)],
    B_H: new Array(3).fill(0),
    W_HO: new Array(3).fill(0),
    B_O: 0,
    loss: 0
  };
  const error = forward.output - target;
  grads.B_O = error;
  grads.loss = 0.5 * error * error;
  for (let j = 0; j < 3; j += 1) {
    grads.W_HO[j] = error * forward.actHidden[j];
    const reluDeriv = forward.preHidden[j] > 0 ? 1 : 0;
    const deltaH = error * p.W_HO[j] * reluDeriv;
    grads.B_H[j] = deltaH;
    grads.W_IH[0][j] = deltaH * x[0];
    grads.W_IH[1][j] = deltaH * x[1];
  }
  return grads;
}

function computeBatchGradients(batch) {
  const grads = {
    W_IH: [new Array(3).fill(0), new Array(3).fill(0)],
    B_H: new Array(3).fill(0),
    W_HO: new Array(3).fill(0),
    B_O: 0,
    lossSum: 0,
    batchSize: batch.length
  };
  if (batch.length === 0) return grads;
  batch.forEach((example) => {
    const rawX = [example.moisture, example.temperature];
    const forward = forwardPassModel(rawX, params);
    const target = LABEL_TO_TARGET[example.label];
    const localGrads = computeGradients(forward, forward.modelInputs, target, params);
    grads.B_O += localGrads.B_O;
    grads.lossSum += localGrads.loss;
    for (let j = 0; j < 3; j += 1) {
      grads.W_HO[j] += localGrads.W_HO[j];
      grads.B_H[j] += localGrads.B_H[j];
      grads.W_IH[0][j] += localGrads.W_IH[0][j];
      grads.W_IH[1][j] += localGrads.W_IH[1][j];
    }
  });
  const size = batch.length;
  grads.B_O /= size;
  grads.loss = grads.lossSum / size;
  for (let j = 0; j < 3; j += 1) {
    grads.W_HO[j] /= size;
    grads.B_H[j] /= size;
    grads.W_IH[0][j] /= size;
    grads.W_IH[1][j] /= size;
  }
  return grads;
}

function applyGradients(grads, lr) {
  params.B_O -= lr * grads.B_O;
  for (let j = 0; j < 3; j += 1) {
    params.W_HO[j] -= lr * grads.W_HO[j];
    params.B_H[j] -= lr * grads.B_H[j];
    params.W_IH[0][j] -= lr * grads.W_IH[0][j];
    params.W_IH[1][j] -= lr * grads.W_IH[1][j];
  }
}

function alignInputNodes() {
  if (!hiddenEls.length || inputEls.length < 2) return;
  const topTarget = edgeMid(hiddenEls[0], 'left').y;
  const bottomTarget = edgeMid(hiddenEls[hiddenEls.length - 1], 'left').y;
  const currentTop = edgeMid(inputEls[0], 'right').y;
  const currentBottom = edgeMid(inputEls[inputEls.length - 1], 'right').y;
  inputEls[0].style.transform = `translateY(${topTarget - currentTop}px)`;
  inputEls[1].style.transform = `translateY(${bottomTarget - currentBottom}px)`;
}

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
      const lineObj = makeLine(
        inpR[i].x,
        inpR[i].y,
        hidL[j].x,
        hidL[j].y,
        params.W_IH[i][j].toFixed(2),
        {
          labelRatio: 1 / 3,
          verticalOffset: -2,
          normalOffset: -6,
          align: true
        }
      );
      lineObj.from = i;
      lineObj.to = j;
      ihLines.push(lineObj);
    }
  }
  for (let j = 0; j < 3; j += 1) {
    const lineObj = makeLine(
      hidR[j].x,
      hidR[j].y,
      outL.x,
      outL.y,
      params.W_HO[j].toFixed(2),
      {
        labelRatio: 2 / 3,
        verticalOffset: -2,
        normalOffset: -6,
        align: true
      }
    );
    lineObj.index = j;
    hoLines.push(lineObj);
  }
  showIH(currentIHSelection);
  toggleHO(currentHOVisible);
}

function updateBiasLabels() {
  hiddenBiasEls.forEach((el, idx) => {
    el.textContent = `b=${params.B_H[idx].toFixed(2)}`;
  });
  outputBiasEl.textContent = `b=${params.B_O.toFixed(2)}`;
}

function updateWeightLabels() {
  ihLines.forEach((conn) => {
    conn.text.textContent = params.W_IH[conn.from][conn.to].toFixed(2);
  });
  hoLines.forEach((conn) => {
    conn.text.textContent = params.W_HO[conn.index].toFixed(2);
  });
}

function hideIH() {
  ihLines.forEach((o) => {
    o.line.style.display = 'none';
    o.text.style.display = 'none';
  });
  hiddenBiasEls.forEach((el) => {
    el.style.visibility = 'hidden';
  });
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
    hiddenBiasEls.forEach((el) => {
      el.style.visibility = 'visible';
    });
    return;
  }
  const idx = Number(opt.replace('h', ''));
  ihLines.forEach((o) => {
    if (o.to === idx) {
      o.line.style.display = 'block';
      o.text.style.display = 'block';
    }
  });
  hiddenBiasEls[idx].style.visibility = 'visible';
}

function hideHO() {
  hoLines.forEach((o) => {
    o.line.style.display = 'none';
    o.text.style.display = 'none';
  });
  outputBiasEl.style.visibility = 'hidden';
}

function toggleHO(show) {
  currentHOVisible = show;
  if (show) {
    hoLines.forEach((o) => {
      o.line.style.display = 'block';
      o.text.style.display = 'block';
    });
    outputBiasEl.style.visibility = 'visible';
  } else {
    hideHO();
  }
}

/***** UI-tabeller *****/
function createTableMarkup(data, title) {
  const rows = data
    .map(
      (row) => `
        <tr>
          <td>${row.id}</td>
          <td>${row.moisture}</td>
          <td>${row.temperature}</td>
          <td>${row.label}</td>
        </tr>`
    )
    .join('');
  return `
    <h3>${title}</h3>
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Jordfuktighet (%)</th>
            <th>Lufttemperatur (°C)</th>
            <th>Bevattna?</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function toggleTable(containerEl, buttonEl, data, title) {
  const isHidden = containerEl.classList.contains('hidden');
  if (isHidden) {
    if (!containerEl.dataset.rendered) {
      containerEl.innerHTML = createTableMarkup(data, title);
      containerEl.dataset.rendered = 'true';
    }
    containerEl.classList.remove('hidden');
    buttonEl.textContent = buttonEl.textContent.replace('Visa', 'Dölj');
  } else {
    containerEl.classList.add('hidden');
    buttonEl.textContent = buttonEl.textContent.replace('Dölj', 'Visa');
  }
}

/***** Manuell träning *****/
function setManualMode(active) {
  if (manualMode === active) return;
  manualMode = active;
  manualPointer = manualPointer % trainingData.length;
  manualActiveExample = null;
  manualForwardCache = null;
  manualFeedback.textContent = '';
  manualFeedback.classList.remove('result-correct', 'result-wrong');
  backpropBtn.classList.add('hidden');
  loadNextBtn.classList.remove('hidden');
  if (active) {
    storedIHSelection = currentIHSelection;
    storedHOVisible = currentHOVisible;
    showIH('all');
    showIHSelect.value = 'all';
    toggleHO(true);
    showHOCheckbox.checked = true;
    manualControls.classList.remove('hidden');
    manualExampleInfo.textContent =
      'Klicka på "Ladda nästa exempel" för att börja den manuella träningen.';
    updateManualStatus(
      `Nästa exempel i kön: ${trainingData[manualPointer].id}`
    );
    manualTrainingBtn.textContent = 'Avsluta manuell träning';
  } else {
    showIH(storedIHSelection);
    showIHSelect.value = storedIHSelection;
    toggleHO(storedHOVisible);
    showHOCheckbox.checked = storedHOVisible;
    manualControls.classList.add('hidden');
    manualExampleInfo.textContent = '';
    updateManualStatus('');
    manualTrainingBtn.textContent = 'Manuell träning';
  }
  updateControlStates();
}

async function runManualForward(example) {
  manualAnimating = true;
  updateControlStates();
  backpropBtn.classList.add('hidden');
  manualFeedback.textContent = '';
  manualFeedback.classList.remove('result-correct', 'result-wrong');
  manualExampleInfo.textContent = `Exempel ${example.id}: Jordfuktighet ${
    example.moisture
  } %, temperatur ${example.temperature} °C, mål: ${example.label}.`;
  updateManualStatus('Laddar indata i nätverket...');

  document.getElementById('moisture').value = example.moisture;
  document.getElementById('temperature').value = example.temperature;

  inputEls.forEach((el) => highlightNode(el));
  await wait(500);

  const x = [example.moisture, example.temperature];
  const displayForward = forwardPassDisplay(x);
  const modelForward = forwardPassModel(x);
  hiddenOut = displayForward.actHidden.slice();

  resetHiddenDisplays();

  for (let j = 0; j < hiddenEls.length; j += 1) {
    highlightNode(hiddenEls[j]);
    highlightBiasLabel(hiddenBiasEls[j]);
    ihLines
      .filter((line) => line.to === j)
      .forEach((line) => highlightLine(line, 'svg-forward', 'svg-forward-text'));
    setHiddenCell(j, displayForward.preHidden[j], displayForward.actHidden[j]);
    await wait(450);
  }

  updateManualStatus('Beräknar utmatningslagret...');
  highlightNode(outputEl);
  highlightBiasLabel(outputBiasEl);
  hoLines.forEach((line) =>
    highlightLine(line, 'svg-forward', 'svg-forward-text')
  );
  updatePrediction(modelForward.output);
  await wait(350);

  const predicted = LABEL_FROM_OUTPUT(modelForward.output);
  const target = example.label;
  manualFeedback.textContent =
    predicted === target
      ? `Rätt! Nätverket förutsåg ${predicted}.`
      : `Fel! Förväntat ${target}, men nätverket gav ${predicted}.`;
  manualFeedback.classList.add(
    predicted === target ? 'result-correct' : 'result-wrong'
  );
  manualForwardCache = {
    forward: modelForward,
    example
  };
  manualActiveExample = example;
  updateManualStatus('Klicka på "Bakåtpropagering" för att uppdatera vikterna.');
  backpropBtn.classList.remove('hidden');
  manualAnimating = false;
  updateControlStates();
}

function getNextExample() {
  const example = trainingData[manualPointer];
  manualPointer = (manualPointer + 1) % trainingData.length;
  return example;
}

async function handleLoadNextExample() {
  if (!manualMode || manualAnimating || autoRunning) return;
  loadNextBtn.classList.add('hidden');
  const example = getNextExample();
  await runManualForward(example);
}

function findIHLine(from, to) {
  return ihLines.find((line) => line.from === from && line.to === to);
}

async function handleBackprop() {
  if (!manualForwardCache || manualAnimating || autoRunning) return;
  manualAnimating = true;
  updateControlStates();
  backpropBtn.disabled = true;
  updateManualStatus('Uppdaterar parametrar med bakåtpropagering...');

  const snapshot = cloneParams(params);
  const grads = computeGradients(
    manualForwardCache.forward,
    manualForwardCache.forward.modelInputs,
    LABEL_TO_TARGET[manualForwardCache.example.label],
    snapshot
  );
  const lr = LEARNING_RATE_MANUAL;

  outputBiasEl.textContent = `b=${params.B_O.toFixed(2)}`;
  highlightBiasLabel(outputBiasEl, 900);
  params.B_O -= lr * grads.B_O;
  updateBiasLabels();
  await wait(500);

  for (let j = 0; j < hoLines.length; j += 1) {
    params.W_HO[j] -= lr * grads.W_HO[j];
    highlightLine(hoLines[j], 'svg-update', 'svg-update-text');
    updateWeightLabels();
    await wait(400);
  }

  for (let j = 0; j < hiddenBiasEls.length; j += 1) {
    params.B_H[j] -= lr * grads.B_H[j];
    highlightBiasLabel(hiddenBiasEls[j], 900);
    updateBiasLabels();
    await wait(400);
  }

  for (let j = 0; j < 3; j += 1) {
    for (let i = 0; i < 2; i += 1) {
      params.W_IH[i][j] -= lr * grads.W_IH[i][j];
      highlightLine(findIHLine(i, j), 'svg-update', 'svg-update-text');
      updateWeightLabels();
      await wait(320);
    }
  }

  manualFeedback.textContent += ` (fel=${round2(
    Math.abs(
      manualForwardCache.forward.output -
        LABEL_TO_TARGET[manualForwardCache.example.label]
    )
  )})`;
  manualForwardCache = null;
  manualActiveExample = null;
  backpropBtn.classList.add('hidden');
  loadNextBtn.classList.remove('hidden');
  updateManualStatus(
    `Nästa exempel i kön: ${trainingData[manualPointer].id}`
  );
  manualAnimating = false;
  updateControlStates();
}

/***** Automatisk träning *****/
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function runAutoTraining() {
  if (autoRunning) return;
  if (manualMode) {
    autoStatus.textContent = 'Avsluta den manuella träningen innan automatisk start.';
    return;
  }
  const epochs = Math.max(1, parseInt(epochsInput.value, 10) || 1);
  const batchSize = Math.max(1, parseInt(batchInput.value, 10) || 1);
  autoRunning = true;
  autoTrainBtn.textContent = 'Träning pågår...';
  autoStatus.textContent = 'Startar automatisk träning...';
  manualStatus.textContent = '';
  updateControlStates();

  for (let epoch = 1; epoch <= epochs; epoch += 1) {
    const shuffled = shuffle(trainingData);
    let epochLossSum = 0;
    let sampleCount = 0;
    for (let i = 0; i < shuffled.length; i += batchSize) {
      const batch = shuffled.slice(i, i + batchSize);
      const grads = computeBatchGradients(batch);
      applyGradients(grads, LEARNING_RATE_AUTO);
      updateBiasLabels();
      updateWeightLabels();
      epochLossSum += grads.loss * grads.batchSize;
      sampleCount += grads.batchSize;
      if (autoAnimationEnabled) {
        await wait(30);
      }
    }
    const avgLoss = sampleCount ? epochLossSum / sampleCount : 0;
    autoStatus.textContent = `Epok ${epoch}/${epochs} klar – medelfel: ${round2(
      avgLoss
    )}`;
  }

  autoStatus.textContent += ' ✓';
  autoTrainBtn.textContent = 'Automatisk träning';
  autoRunning = false;
  updateControlStates();
}

/***** Utvärdering *****/
function evaluateTestSet() {
  let totalError = 0;
  let correct = 0;
  testData.forEach((example) => {
    const forward = forwardPassModel([example.moisture, example.temperature]);
    const target = LABEL_TO_TARGET[example.label];
    const error = forward.output - target;
    totalError += error * error;
    const predicted = LABEL_FROM_OUTPUT(forward.output);
    if (predicted === example.label) correct += 1;
  });
  const mse = totalError / testData.length;
  const accuracy = (correct / testData.length) * 100;
  evaluationResult.textContent = `Medelkvadratiskt fel: ${round2(
    mse
  )} – Träffsäkerhet: ${round2(accuracy)} %`;
}

/***** Återställning *****/
function resetNetwork() {
  params = cloneParams(INITIAL_PARAMS);
  hiddenOut = [0, 0, 0];
  manualPointer = 0;
  manualActiveExample = null;
  manualForwardCache = null;
  manualFeedback.textContent = '';
  manualFeedback.classList.remove('result-correct', 'result-wrong');
  manualExampleInfo.textContent = '';
  manualStatus.textContent = manualMode
    ? `Nästa exempel i kön: ${trainingData[manualPointer].id}`
    : '';
  evaluationResult.textContent = '';
  autoStatus.textContent = '';
  resetHiddenDisplays();
  updateBiasLabels();
  updateWeightLabels();
}

/***** Event listeners *****/
document.getElementById('calc-hidden').addEventListener('click', () => {
  const x = getInputs();
  const displayForward = forwardPassDisplay(x);
  hiddenOut = displayForward.actHidden.slice();
  displayForward.preHidden.forEach((pre, idx) => {
    setHiddenCell(idx, pre, displayForward.actHidden[idx]);
  });
});

document.getElementById('calc-output').addEventListener('click', () => {
  const x = getInputs();
  const displayForward = forwardPassDisplay(x);
  hiddenOut = displayForward.actHidden.slice();
  displayForward.preHidden.forEach((pre, idx) => {
    setHiddenCell(idx, pre, displayForward.actHidden[idx]);
  });
  const modelForward = forwardPassModel(x);
  updatePrediction(modelForward.output);
});

showIHSelect.addEventListener('change', (e) => {
  currentIHSelection = e.target.value;
  showIH(currentIHSelection);
});

showHOCheckbox.addEventListener('change', (e) => toggleHO(e.target.checked));

manualTrainingBtn.addEventListener('click', () => {
  if (autoRunning) return;
  setManualMode(!manualMode);
});

loadNextBtn.addEventListener('click', handleLoadNextExample);

backpropBtn.addEventListener('click', handleBackprop);

autoTrainBtn.addEventListener('click', runAutoTraining);

resetBtn.addEventListener('click', resetNetwork);

toggleTrainingBtn.addEventListener('click', () =>
  toggleTable(trainingTableContainer, toggleTrainingBtn, trainingData, 'Träning (50 rader)')
);

toggleTestBtn.addEventListener('click', () =>
  toggleTable(testTableContainer, toggleTestBtn, testData, 'Test (10 rader)')
);

evaluateTestBtn.addEventListener('click', evaluateTestSet);

/***** Init *****/
function refresh() {
  window.requestAnimationFrame(() => {
    alignInputNodes();
    buildConnections();
    updateBiasLabels();
    updateWeightLabels();
  });
}

window.addEventListener('load', () => {
  refresh();
  resetHiddenDisplays();
  updateControlStates();
});
window.addEventListener('resize', refresh);
