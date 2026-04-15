const ELEMENTOS = {
  1: "Hidrogénio",
  2: "Hélio",
  3: "Lítio",
  4: "Berílio",
  5: "Boro",
  6: "Carbono",
  7: "Azoto",
  8: "Oxigénio",
  9: "Flúor",
  10: "Néon",
  11: "Sódio",
  12: "Magnésio",
  13: "Alumínio",
  14: "Silício",
  15: "Fósforo",
  16: "Enxofre",
  17: "Cloro",
  18: "Árgon",
  19: "Potássio",
  20: "Cálcio"
};

const SIMBOLOS = {
  1: "H", 2: "He", 3: "Li", 4: "Be", 5: "B", 6: "C", 7: "N", 8: "O", 9: "F", 10: "Ne",
  11: "Na", 12: "Mg", 13: "Al", 14: "Si", 15: "P", 16: "S", 17: "Cl", 18: "Ar", 19: "K", 20: "Ca"
};

const CAPACIDADES = [2, 8, 8, 2];
const NíveisDeEnergia = ["1.º nível", "2.º nível", "3.º nível", "4.º nível"];
const SVG_NS = "http://www.w3.org/2000/svg";

const NIVEIS_INFO = [
  {
    nivel: "1.º nível",
    n: 1,
    maximoTeorico: 2,
    regraPratica: "até 2 eletrões",
    explicacao: "É o nível mais próximo do núcleo e o de menor energia."
  },
  {
    nivel: "2.º nível",
    n: 2,
    maximoTeorico: 8,
    regraPratica: "até 8 eletrões",
    explicacao: "Tem mais energia do que o 1.º e fica mais afastado do núcleo."
  },
  {
    nivel: "3.º nível",
    n: 3,
    maximoTeorico: 18,
    regraPratica: "nesta app usamos até 8 nos primeiros 20 elementos",
    explicacao: "Para os primeiros 20 elementos, usamos a regra prática ensinada no 9.º ano."
  },
  {
    nivel: "4.º nível",
    n: 4,
    maximoTeorico: 32,
    regraPratica: "aparece no K e no Ca com 1 ou 2 eletrões",
    explicacao: "É o mais energético nesta sequência e surge depois de 2-8-8."
  }
];

const PERGUNTAS_QUIZ = [
  {
    id: 1,
    tema: "Iões e distribuição eletrónica",
    pergunta: "O átomo de cloro tem distribuição eletrónica 2 – 8 – 7. Se ganhar 1 eletrão, qual passa a ser a distribuição do ião formado?",
    opcoes: ["2 – 8 – 8", "2 – 7 – 8", "2 – 8 – 7 – 1"],
    correta: 0,
    explicacao: "Ao ganhar 1 eletrão, o cloro forma um ião negativo e fica com 18 eletrões: 2 – 8 – 8."
  },
  {
    id: 2,
    tema: "Princípio da energia mínima",
    pergunta: "O que significa o princípio da energia mínima no estado normal de um átomo?",
    opcoes: [
      "Os eletrões ocupam primeiro os níveis de maior energia.",
      "Os eletrões distribuem-se pelos níveis de modo a terem a energia mais baixa possível.",
      "Todos os níveis de energia ficam sempre com o mesmo número de eletrões."
    ],
    correta: 1,
    explicacao: "No estado normal, os eletrões ocupam primeiro os níveis de menor energia."
  },
  {
    id: 3,
    tema: "Eletrões de valência",
    pergunta: "O magnésio tem distribuição eletrónica 2 – 8 – 2. Quantos eletrões de valência tem?",
    opcoes: ["2", "8", "12"],
    correta: 0,
    explicacao: "Os eletrões de valência são os do último nível. Em 2 – 8 – 2, o último nível tem 2 eletrões."
  }
];

const state = {
  numeroAtomico: 11,
  modo: "explorar",
  tentativa: [0, 0, 0, 0],
  feedback: "",
  mostrarSolucao: false,
  acertosTreino: 0,
  totalTreino: 0,
  acertosAvaliacao: 0,
  totalAvaliacao: 0,
  respostasQuiz: {},
  mostrarCorrecaoQuiz: false
};

function distribuirEletrons(numeroAtomico) {
  let restantes = numeroAtomico;
  return CAPACIDADES.map((cap) => {
    const usados = Math.min(restantes, cap);
    restantes -= usados;
    return usados;
  });
}

function clampAtomicNumber(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 1;
  return Math.max(1, Math.min(20, Math.floor(n)));
}

function compareArrays(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function getZ() {
  return clampAtomicNumber(state.numeroAtomico);
}

function getDistribuicaoCerta() {
  return distribuirEletrons(getZ());
}

function getSomaTentativa() {
  return state.tentativa.reduce((a, b) => a + b, 0);
}

function getPontuacaoQuiz() {
  return PERGUNTAS_QUIZ.reduce((total, questao) => {
    return total + (state.respostasQuiz[questao.id] === questao.correta ? 1 : 0);
  }, 0);
}

function setMode(modo) {
  state.modo = modo;
  state.feedback = "";
  state.mostrarSolucao = false;
  if (modo === "treino" || modo === "avaliacao") {
    state.tentativa = [0, 0, 0, 0];
  }
  render();
}

function novaTentativa(modo = state.modo === "avaliacao" ? "avaliacao" : "treino") {
  state.numeroAtomico = Math.floor(Math.random() * 20) + 1;
  state.tentativa = [0, 0, 0, 0];
  state.feedback = "";
  state.mostrarSolucao = false;
  state.modo = modo;
  render();
}

function limpar() {
  state.tentativa = [0, 0, 0, 0];
  state.feedback = "";
  state.mostrarSolucao = false;
  render();
}

function iniciarAvaliacao() {
  state.modo = "avaliacao";
  state.tentativa = [0, 0, 0, 0];
  state.feedback = "";
  state.mostrarSolucao = false;
  render();
}

function reiniciarAvaliacao() {
  state.acertosAvaliacao = 0;
  state.totalAvaliacao = 0;
  state.tentativa = [0, 0, 0, 0];
  state.feedback = "";
  state.mostrarSolucao = false;
  render();
}

function atualizar(index, valor) {
  state.tentativa[index] = valor;
  state.feedback = "";
  state.mostrarSolucao = false;
  render();
}

function verificar() {
  const z = getZ();
  const distribuicaoCerta = getDistribuicaoCerta();
  const somaTentativa = getSomaTentativa();
  const certo = somaTentativa === z && compareArrays(state.tentativa, distribuicaoCerta);

  if (state.modo === "treino") {
    state.totalTreino += 1;
    if (certo) state.acertosTreino += 1;
  }

  if (state.modo === "avaliacao") {
    state.totalAvaliacao += 1;
    if (certo) state.acertosAvaliacao += 1;
  }

  if (somaTentativa !== z) {
    state.feedback = `Ainda não está certo: usaste ${somaTentativa} eletrões, mas este átomo precisa de ${z}.`;
    render();
    return;
  }

  if (certo) {
    state.feedback = state.modo === "avaliacao"
      ? "Resposta registada na avaliação: distribuição eletrónica correta."
      : "Muito bem! A distribuição eletrónica está correta.";
  } else {
    state.feedback = state.modo === "avaliacao"
      ? "Resposta registada na avaliação: o número total está certo, mas a distribuição por níveis de energia não está correta."
      : "Quase! O número total de eletrões está certo, mas a distribuição por níveis de energia ainda não está correta.";
  }

  render();
}

function selecionarRespostaQuiz(idQuestao, indiceOpcao) {
  state.respostasQuiz[idQuestao] = indiceOpcao;
  state.mostrarCorrecaoQuiz = false;
  renderQuiz();
}

function corrigirQuiz() {
  state.mostrarCorrecaoQuiz = true;
  renderQuiz();
}

function limparQuiz() {
  state.respostasQuiz = {};
  state.mostrarCorrecaoQuiz = false;
  renderQuiz();
}

function renderExplorarArea() {
  const z = getZ();
  const distribuicao = getDistribuicaoCerta();
  const area = document.getElementById("explorar-area");

  area.innerHTML = `
    <div class="rule-card">
      <div><strong>Regra simples</strong></div>
      <div>Distribuímos os eletrões por níveis de energia : primeiro a 1.ª camada, depois a 2.ª, depois a 3.ª e só depois a 4.ª. Para os primeiros 20 elementos, trabalhamos com a regra prática 2 – 8 – 8 – 2.</div>
    </div>

    <div class="distribution-list">
      ${distribuicao.map((valor, i) => `
        <div class="distribution-item">
          <span><strong>${NOMES_NíveisDeEnergia [i]}</strong></span>
          <span class="distribution-pill">${valor} ${valor === 1 ? "eletrão" : "eletrões"}</span>
        </div>
      `).join("")}
    </div>

    <div class="note-card top-space">
      <strong>Níveis de energia e eletrões que os ocupam</strong>
      <div class="levels-grid two-col">
        ${NIVEIS_INFO.map((info) => `
          <div class="level-card">
            <div class="level-head">
              <span class="level-title">${info.nivel}</span>
              <span class="mini-badge">n = ${info.n}</span>
            </div>
            <div class="level-text">Capacidade teórica: <strong>${info.maximoTeorico}</strong> eletrões</div>
            <div class="level-text">Na prática nesta app: <strong>${info.regraPratica}</strong></div>
            <div class="level-text">${info.explicacao}</div>
          </div>
        `).join("")}
      </div>
      <div class="note-card top-space">
        <strong>Ideia-chave:</strong> quanto maior for o valor de <em>n</em>, maior é a distância ao núcleo e maior é a energia do nível.
      </div>
      <div class="note-card top-space">
        <strong>Princípio da energia mínima:</strong> no estado normal, os eletrões ocupam primeiro os níveis de menor energia. É por isso que o preenchimento começa no 1.º nível.
      </div>
    </div>
  `;
}

function renderInterativoArea() {
  const z = getZ();
  const distribuicao = getDistribuicaoCerta();
  const area = document.getElementById("interativo-area");
  const soma = getSomaTentativa();
  const isAvaliacao = state.modo === "avaliacao";
  let feedbackClass = "warning";
  if (state.feedback.includes("Muito bem") || state.feedback.includes("correta")) feedbackClass = "success";
  if (state.feedback.includes("Ainda não")) feedbackClass = "error";

  const statusText = isAvaliacao
    ? `Modo avaliação: as respostas verificadas aqui contam para o painel de avaliação. Este átomo precisa de ${z} eletrões.`
    : `Modo treino livre: aqui os alunos podem experimentar sem isso contar para a avaliação. Este átomo precisa de ${z} eletrões.`;

  area.innerHTML = `
    <div class="mode-status ${isAvaliacao ? "warning" : ""}">${statusText}</div>

    <div class="layers">
      ${state.tentativa.map((valor, i) => `
        <div class="layer-card">
          <div class="layer-row">
            <div>
              <div class="layer-title">${NíveisDeEnergia[i]}</div>
              <div class="layer-subtitle">Máximo nesta app: ${CAPACIDADES[i]} eletrões</div>
            </div>
            <div class="layer-controls">
              <button class="stepper" data-action="dec" data-index="${i}">−</button>
              <div class="layer-value">${valor}</div>
              <button class="stepper" data-action="inc" data-index="${i}">+</button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="action-row">
      <button id="btn-verificar" class="action primary">Verificar</button>
      <button id="btn-limpar" class="action outline">↺ Limpar</button>
      ${!isAvaliacao ? '<button id="btn-solucao" class="action outline">Mostrar solução</button>' : ''}
      <button id="btn-novo-atomo" class="action outline">🔀 Novo átomo</button>
    </div>

    <div class="total-box">Total colocado: <strong>${soma}</strong> / ${z}</div>
    ${state.feedback ? `<div class="message ${feedbackClass}">${state.feedback}</div>` : ""}
    ${(state.mostrarSolucao && !isAvaliacao) ? `<div class="solution-box">Solução: ${distribuicao.join(" – ")}</div>` : ""}
  `;

  area.querySelectorAll(".stepper").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const current = state.tentativa[index];
      const next = button.dataset.action === "inc"
        ? Math.min(CAPACIDADES[index], current + 1)
        : Math.max(0, current - 1);
      atualizarNiveisDeEnergia(index, next);
    });
  });

  area.querySelector("#btn-verificar").addEventListener("click", verificar);
  area.querySelector("#btn-limpar").addEventListener("click", limpar);
  area.querySelector("#btn-novo-atomo").addEventListener("click", () => novaTentativa(state.modo));

  const solucaoBtn = area.querySelector("#btn-solucao");
  if (solucaoBtn) {
    solucaoBtn.addEventListener("click", () => {
      state.mostrarSolucao = true;
      render();
    });
  }
}

function svgEl(name, attrs = {}) {
  const el = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function drawShell(svg, radius, count, maxDots) {
  svg.appendChild(svgEl("circle", { cx: 200, cy: 200, r: radius, class: "orbit" }));

  for (let i = 0; i < maxDots; i += 1) {
    const angle = (2 * Math.PI * i) / Math.max(maxDots, 1) - Math.PI / 2;
    const x = 200 + Math.cos(angle) * radius;
    const y = 200 + Math.sin(angle) * radius;
    svg.appendChild(svgEl("circle", {
      cx: x,
      cy: y,
      r: 7,
      class: i < count ? "dot-full" : "dot-empty"
    }));
  }
}

function renderAtom() {
  const z = getZ();
  const distribuicao = ((state.modo === "treino" || state.modo === "avaliacao") && !state.mostrarSolucao)
    ? state.tentativa
    : getDistribuicaoCerta();

  const svg = document.getElementById("atom-svg");
  svg.innerHTML = "";

  drawShell(svg, 55, distribuicao[0], 2);
  drawShell(svg, 95, distribuicao[1], 8);
  drawShell(svg, 135, distribuicao[2], 8);
  drawShell(svg, 175, distribuicao[3], 2);

  svg.appendChild(svgEl("circle", { cx: 200, cy: 200, r: 34, class: "nucleus" }));

  const symbol = svgEl("text", { x: 200, y: 193, class: "nucleus-text" });
  symbol.textContent = SIMBOLOS[z];
  svg.appendChild(symbol);

  const sub = svgEl("text", { x: 200, y: 216, class: "nucleus-subtext" });
  sub.textContent = `Z = ${z}`;
  svg.appendChild(sub);
}

function renderTeacherPanel() {
  const treinoPct = state.totalTreino > 0 ? Math.round((state.acertosTreino / state.totalTreino) * 100) : 0;
  const avaliacaoPct = state.totalAvaliacao > 0 ? Math.round((state.acertosAvaliacao / state.totalAvaliacao) * 100) : 0;

  document.getElementById("progresso-treino").textContent = `${treinoPct}%`;
  document.getElementById("progresso-avaliacao").textContent = `${avaliacaoPct}%`;
  document.getElementById("bar-treino").style.width = `${treinoPct}%`;
  document.getElementById("bar-avaliacao").style.width = `${avaliacaoPct}%`;
  document.getElementById("acertos-treino").textContent = state.acertosTreino;
  document.getElementById("total-treino").textContent = state.totalTreino;
  document.getElementById("acertos-avaliacao").textContent = state.acertosAvaliacao;
  document.getElementById("total-avaliacao").textContent = state.totalAvaliacao;
}

function renderStaticFields() {
  const z = getZ();
  document.getElementById("numeroAtomico").value = z;
  document.getElementById("info-elemento").textContent = ELEMENTOS[z];
  document.getElementById("info-simbolo").textContent = SIMBOLOS[z];
  document.getElementById("info-protoes").textContent = z;
  document.getElementById("info-eletrons").textContent = z;
  document.getElementById("visual-title").textContent = `${ELEMENTOS[z]} (${SIMBOLOS[z]})`;
  document.getElementById("visual-z").textContent = `Z = ${z}`;
  document.getElementById("tip-ler").textContent = `Ex.: ${ELEMENTOS[z].toLowerCase()} (Z = ${z}) → ${getDistribuicaoCerta().join(" – ")}.`;

  document.getElementById("btn-explorar").classList.toggle("active", state.modo === "explorar");
  document.getElementById("btn-treino").classList.toggle("active", state.modo === "treino");
  document.getElementById("btn-avaliacao").classList.toggle("active", state.modo === "avaliacao");

  document.getElementById("explorar-area").classList.toggle("hidden", state.modo !== "explorar");
  document.getElementById("interativo-area").classList.toggle("hidden", state.modo === "explorar");
}

function renderQuiz() {
  const grid = document.getElementById("quiz-grid");
  grid.innerHTML = PERGUNTAS_QUIZ.map((questao) => {
    const respostaSelecionada = state.respostasQuiz[questao.id];
    const acertou = respostaSelecionada === questao.correta;

    return `
      <article class="quiz-question">
        <div class="quiz-theme-row">
          <span class="badge outline">${questao.tema}</span>
        </div>

        <div class="quiz-text">${questao.pergunta}</div>

        <div class="quiz-options">
          ${questao.opcoes.map((opcao, index) => `
            <button class="quiz-option ${respostaSelecionada === index ? "selected" : ""}" data-qid="${questao.id}" data-option="${index}">
              ${opcao}
            </button>
          `).join("")}
        </div>

        ${state.mostrarCorrecaoQuiz ? `
          <div class="quiz-feedback ${acertou ? "correct" : "incorrect"}">
            <strong>${acertou ? "Certo." : "Ainda não."}</strong> ${questao.explicacao}
          </div>
        ` : ""}
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".quiz-option").forEach((button) => {
    button.addEventListener("click", () => {
      selecionarRespostaQuiz(Number(button.dataset.qid), Number(button.dataset.option));
    });
  });

  const resultado = document.getElementById("quiz-resultado");
  if (state.mostrarCorrecaoQuiz) {
    resultado.classList.remove("hidden");
    resultado.innerHTML = `<strong>Resultado:</strong> ${getPontuacaoQuiz()} / ${PERGUNTAS_QUIZ.length} respostas certas.`;
  } else {
    resultado.classList.add("hidden");
    resultado.innerHTML = "";
  }
}

function render() {
  renderStaticFields();
  if (state.modo === "explorar") {
    renderExplorarArea();
  } else {
    renderInterativoArea();
  }
  renderAtom();
  renderTeacherPanel();
  renderQuiz();
}

function attachEvents() {
  document.getElementById("numeroAtomico").addEventListener("input", (event) => {
    state.numeroAtomico = clampAtomicNumber(event.target.value);
    state.feedback = "";
    state.mostrarSolucao = false;
    render();
  });

  document.getElementById("btn-explorar").addEventListener("click", () => setMode("explorar"));
  document.getElementById("btn-treino").addEventListener("click", () => setMode("treino"));
  document.getElementById("btn-avaliacao").addEventListener("click", iniciarAvaliacao);
  document.getElementById("btn-aleatorio").addEventListener("click", () => novaTentativa());
  document.getElementById("btn-reiniciar-avaliacao").addEventListener("click", reiniciarAvaliacao);
  document.getElementById("btn-corrigir-quiz").addEventListener("click", corrigirQuiz);
  document.getElementById("btn-limpar-quiz").addEventListener("click", limparQuiz);
}

attachEvents();
render();
