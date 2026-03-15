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
  20: "Cálcio",
};

const SIMBOLOS = {
  1: "H", 2: "He", 3: "Li", 4: "Be", 5: "B", 6: "C", 7: "N", 8: "O", 9: "F", 10: "Ne",
  11: "Na", 12: "Mg", 13: "Al", 14: "Si", 15: "P", 16: "S", 17: "Cl", 18: "Ar", 19: "K", 20: "Ca",
};

const CAPACIDADES = [2, 8, 8, 2];
const NOMES_CAMADAS = ["1.ª camada", "2.ª camada", "3.ª camada", "4.ª camada"];

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

function modoInterativo() {
  return state.modo === "treino" || state.modo === "avaliacao";
}

function exemploLeitura(z, distribuicao) {
  const partes = distribuicao.filter(v => v > 0);
  return `Ex.: ${ELEMENTOS[z].toLowerCase()} (Z = ${z}) → ${partes.map((valor, i) => `${valor} eletrão${valor === 1 ? "" : "s"} na ${NOMES_CAMADAS[i].toLowerCase()}`).join(", ").replace(/,([^,]*)$/, " e$1")}.`;
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

function novaTentativa(modo = state.modo) {
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

function reiniciarAvaliacao() {
  state.acertosAvaliacao = 0;
  state.totalAvaliacao = 0;
  state.tentativa = [0, 0, 0, 0];
  state.feedback = "";
  state.mostrarSolucao = false;
  render();
}

function atualizarCamada(index, novoValor) {
  state.tentativa[index] = Math.max(0, Math.min(CAPACIDADES[index], novoValor));
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
      ? "Resposta registada na avaliação: o número total está certo, mas a distribuição pelas camadas não está correta."
      : "Quase! O número total de eletrões está certo, mas a distribuição pelas camadas ainda não está correta.";
  }

  render();
}

function renderExplorarBox(z, distribuicaoCerta) {
  const box = document.getElementById("explorarBox");
  box.innerHTML = `
    <div class="rule-box">
      <div><strong>Regra simples</strong></div>
      <p>Distribuímos os eletrões por camadas: primeiro a 1.ª camada (máximo 2), depois a 2.ª (máximo 8), depois a 3.ª (máximo 8) e depois a 4.ª (máximo 2), apenas para os primeiros 20 elementos.</p>
    </div>
    <div class="dist-list">
      ${distribuicaoCerta.map((valor, i) => `
        <div class="dist-item">
          <span><strong>${NOMES_CAMADAS[i]}</strong></span>
          <span class="dist-pill">${valor} eletrão${valor === 1 ? "" : "s"}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderLayerEditors() {
  const layerEditors = document.getElementById("layerEditors");
  layerEditors.innerHTML = state.tentativa.map((valor, i) => `
    <div class="layer-editor">
      <div>
        <div><strong>${NOMES_CAMADAS[i]}</strong></div>
        <div class="small-label">Máximo: ${CAPACIDADES[i]} eletrões</div>
      </div>
      <div class="layer-controls">
        <button class="icon-btn" data-action="decrease" data-index="${i}">−</button>
        <div class="layer-value">${valor}</div>
        <button class="icon-btn" data-action="increase" data-index="${i}">+</button>
      </div>
    </div>
  `).join("");

  layerEditors.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      const action = btn.dataset.action;
      const current = state.tentativa[index];
      if (action === "decrease") atualizarCamada(index, current - 1);
      if (action === "increase") atualizarCamada(index, current + 1);
    });
  });
}

function drawAtom(z, distribuicao) {
  const svg = document.getElementById("atomSvg");
  const radii = [55, 95, 135, 175];
  const maxDots = [2, 8, 8, 2];

  const circles = radii.map((radius, shellIndex) => {
    const orbit = `<circle cx="200" cy="200" r="${radius}" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="2"></circle>`;
    const ghosts = Array.from({ length: maxDots[shellIndex] }, (_, i) => {
      const angle = (2 * Math.PI * i) / Math.max(maxDots[shellIndex], 1) - Math.PI / 2;
      const x = 200 + Math.cos(angle) * radius;
      const y = 200 + Math.sin(angle) * radius;
      const filled = i < distribuicao[shellIndex];
      return `<circle cx="${x}" cy="${y}" r="7" fill="${filled ? "currentColor" : "transparent"}" stroke="currentColor" stroke-opacity="${filled ? 1 : 0.25}" opacity="${filled ? 1 : 0.55}"></circle>`;
    }).join("");
    return orbit + ghosts;
  }).join("");

  svg.innerHTML = `
    ${circles}
    <circle cx="200" cy="200" r="34" fill="#0f172a"></circle>
    <text x="200" y="193" text-anchor="middle" fill="white" font-size="22" font-weight="700">${SIMBOLOS[z]}</text>
    <text x="200" y="216" text-anchor="middle" fill="white" font-size="11">Z = ${z}</text>
  `;
}

function render() {
  const z = getZ();
  const distribuicaoCerta = getDistribuicaoCerta();
  const somaTentativa = getSomaTentativa();
  const distribuicaoVisual = (modoInterativo() && !state.mostrarSolucao) ? state.tentativa : distribuicaoCerta;

  document.getElementById("numeroAtomico").value = z;
  document.getElementById("elementoNome").textContent = ELEMENTOS[z];
  document.getElementById("elementoSimbolo").textContent = SIMBOLOS[z];
  document.getElementById("protones").textContent = z;
  document.getElementById("eletrones").textContent = z;
  document.getElementById("visualNome").textContent = ELEMENTOS[z];
  document.getElementById("visualSimbolo").textContent = SIMBOLOS[z];
  document.getElementById("visualZ").textContent = `Z = ${z}`;
  document.getElementById("lerAssim").textContent = exemploLeitura(z, distribuicaoCerta);

  document.getElementById("somaTentativa").textContent = somaTentativa;
  document.getElementById("totalNecessario").textContent = z;

  renderExplorarBox(z, distribuicaoCerta);
  renderLayerEditors();
  drawAtom(z, distribuicaoVisual);

  document.getElementById("explorarBox").classList.toggle("hidden", state.modo !== "explorar");
  document.getElementById("interacaoBox").classList.toggle("hidden", !modoInterativo());

  const modoMensagem = document.getElementById("modoMensagem");
  if (state.modo === "avaliacao") {
    modoMensagem.className = "message-box avaliacao";
    modoMensagem.textContent = `Modo avaliação: as respostas verificadas aqui contam para o painel de avaliação. Este átomo precisa de ${z} eletrões.`;
  } else {
    modoMensagem.className = "message-box";
    modoMensagem.textContent = `Modo treino livre: aqui os alunos podem experimentar sem isso contar para a avaliação. Este átomo precisa de ${z} eletrões.`;
  }

  const feedback = document.getElementById("feedback");
  if (state.feedback) {
    feedback.textContent = state.feedback;
    feedback.classList.remove("hidden");
  } else {
    feedback.textContent = "";
    feedback.classList.add("hidden");
  }

  const solucao = document.getElementById("solucao");
  const mostrarSolucao = state.mostrarSolucao && state.modo !== "avaliacao";
  solucao.classList.toggle("hidden", !mostrarSolucao);
  solucao.textContent = `Solução: ${distribuicaoCerta[0]} – ${distribuicaoCerta[1]} – ${distribuicaoCerta[2]} – ${distribuicaoCerta[3]}`;
  document.getElementById("btnMostrarSolucao").classList.toggle("hidden", state.modo === "avaliacao");

  document.getElementById("btnExplorar").classList.toggle("btn-primary", state.modo === "explorar");
  document.getElementById("btnExplorar").classList.toggle("btn-secondary", state.modo !== "explorar");
  document.getElementById("btnTreino").classList.toggle("btn-primary", state.modo === "treino");
  document.getElementById("btnTreino").classList.toggle("btn-secondary", state.modo !== "treino");
  document.getElementById("btnAvaliacao").classList.toggle("btn-primary", state.modo === "avaliacao");
  document.getElementById("btnAvaliacao").classList.toggle("btn-secondary", state.modo !== "avaliacao");

  const progressoTreino = state.totalTreino > 0 ? Math.round((state.acertosTreino / state.totalTreino) * 100) : 0;
  const progressoAvaliacao = state.totalAvaliacao > 0 ? Math.round((state.acertosAvaliacao / state.totalAvaliacao) * 100) : 0;

  document.getElementById("progressoTreinoPct").textContent = `${progressoTreino}%`;
  document.getElementById("progressoAvaliacaoPct").textContent = `${progressoAvaliacao}%`;
  document.getElementById("barTreino").style.width = `${progressoTreino}%`;
  document.getElementById("barAvaliacao").style.width = `${progressoAvaliacao}%`;
  document.getElementById("acertosTreino").textContent = state.acertosTreino;
  document.getElementById("totalTreino").textContent = state.totalTreino;
  document.getElementById("acertosAvaliacao").textContent = state.acertosAvaliacao;
  document.getElementById("totalAvaliacao").textContent = state.totalAvaliacao;
}

function bindEvents() {
  document.getElementById("numeroAtomico").addEventListener("input", (e) => {
    state.numeroAtomico = clampAtomicNumber(e.target.value);
    state.feedback = "";
    state.mostrarSolucao = false;
    render();
  });

  document.getElementById("btnExplorar").addEventListener("click", () => setMode("explorar"));
  document.getElementById("btnTreino").addEventListener("click", () => setMode("treino"));
  document.getElementById("btnAvaliacao").addEventListener("click", () => setMode("avaliacao"));
  document.getElementById("btnAleatorio").addEventListener("click", () => novaTentativa(state.modo === "avaliacao" ? "avaliacao" : state.modo === "treino" ? "treino" : "explorar"));
  document.getElementById("btnVerificar").addEventListener("click", verificar);
  document.getElementById("btnLimpar").addEventListener("click", limpar);
  document.getElementById("btnMostrarSolucao").addEventListener("click", () => {
    state.mostrarSolucao = true;
    render();
  });
  document.getElementById("btnNovoAtomo").addEventListener("click", () => novaTentativa(state.modo));
  document.getElementById("btnReiniciarAvaliacao").addEventListener("click", reiniciarAvaliacao);
}

bindEvents();
render();
