import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, CheckCircle2, Sparkles, Atom, Shuffle, ClipboardCheck } from "lucide-react";

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

function ShellDots({ radius, count, maxDots }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / Math.max(count, 1) - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y, i };
  });

  return (
    <>
      <circle cx="200" cy="200" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      {Array.from({ length: maxDots }, (_, i) => {
        const angle = (2 * Math.PI * i) / Math.max(maxDots, 1) - Math.PI / 2;
        const x = 200 + Math.cos(angle) * radius;
        const y = 200 + Math.sin(angle) * radius;
        const filled = i < count;
        return (
          <circle
            key={`ghost-${radius}-${i}`}
            cx={x}
            cy={y}
            r="7"
            fill={filled ? "currentColor" : "transparent"}
            stroke="currentColor"
            strokeOpacity={filled ? 1 : 0.25}
            opacity={filled ? 1 : 0.55}
          />
        );
      })}
      {dots.map((dot) => (
        <circle key={`real-${radius}-${dot.i}`} cx={200 + dot.x} cy={200 + dot.y} r="7" fill="currentColor" />
      ))}
    </>
  );
}

function AtomPreview({ z, distribuicao }) {
  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="w-full max-w-[420px] text-slate-700">
        <ShellDots radius={55} count={distribuicao[0]} maxDots={2} />
        <ShellDots radius={95} count={distribuicao[1]} maxDots={8} />
        <ShellDots radius={135} count={distribuicao[2]} maxDots={8} />
        <ShellDots radius={175} count={distribuicao[3]} maxDots={2} />

        <circle cx="200" cy="200" r="34" className="fill-slate-800" />
        <text x="200" y="193" textAnchor="middle" className="fill-white text-[22px] font-bold">
          {SIMBOLOS[z]}
        </text>
        <text x="200" y="216" textAnchor="middle" className="fill-white text-[11px]">
          Z = {z}
        </text>
      </svg>
    </div>
  );
}

function LayerEditor({ value, onChange, label, cap }) {
  const decrease = () => onChange(Math.max(0, value - 1));
  const increase = () => onChange(Math.min(cap, value + 1));

  return (
    <div className="rounded-2xl border p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-sm text-slate-500">Máximo: {cap} eletrões</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={decrease}>−</Button>
          <div className="w-10 text-center text-lg font-semibold">{value}</div>
          <Button variant="outline" onClick={increase}>+</Button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [numeroAtomico, setNumeroAtomico] = useState(11);
  const [modo, setModo] = useState("explorar");
  const [tentativa, setTentativa] = useState([0, 0, 0, 0]);
  const [feedback, setFeedback] = useState("");
  const [mostrarSolucao, setMostrarSolucao] = useState(false);
  const [acertosTreino, setAcertosTreino] = useState(0);
  const [totalTreino, setTotalTreino] = useState(0);
  const [acertosAvaliacao, setAcertosAvaliacao] = useState(0);
  const [totalAvaliacao, setTotalAvaliacao] = useState(0);

  const z = clampAtomicNumber(numeroAtomico);
  const distribuicaoCerta = useMemo(() => distribuirEletrons(z), [z]);
  const somaTentativa = tentativa.reduce((a, b) => a + b, 0);

  function atualizarCamada(index, novoValor) {
    setTentativa((prev) => prev.map((v, i) => (i === index ? novoValor : v)));
    setFeedback("");
    setMostrarSolucao(false);
  }

  function verificar() {
    const certo = somaTentativa === z && compareArrays(tentativa, distribuicaoCerta);

    if (modo === "treino") {
      setTotalTreino((t) => t + 1);
      if (certo) {
        setAcertosTreino((a) => a + 1);
      }
    }

    if (modo === "avaliacao") {
      setTotalAvaliacao((t) => t + 1);
      if (certo) {
        setAcertosAvaliacao((a) => a + 1);
      }
    }

    if (somaTentativa !== z) {
      setFeedback(`Ainda não está certo: usaste ${somaTentativa} eletrões, mas este átomo precisa de ${z}.`);
      return;
    }

    if (certo) {
      setFeedback(
        modo === "avaliacao"
          ? "Resposta registada na avaliação: distribuição eletrónica correta."
          : "Muito bem! A distribuição eletrónica está correta."
      );
    } else {
      setFeedback(
        modo === "avaliacao"
          ? "Resposta registada na avaliação: o número total está certo, mas a distribuição pelas camadas não está correta."
          : "Quase! O número total de eletrões está certo, mas a distribuição pelas camadas ainda não está correta."
      );
    }
  }

  function novaTentativa(novoModo = modo === "avaliacao" ? "avaliacao" : "treino") {
    const novo = Math.floor(Math.random() * 20) + 1;
    setNumeroAtomico(novo);
    setTentativa([0, 0, 0, 0]);
    setFeedback("");
    setMostrarSolucao(false);
    setModo(novoModo);
  }

  function limpar() {
    setTentativa([0, 0, 0, 0]);
    setFeedback("");
    setMostrarSolucao(false);
  }

  function iniciarAvaliacao() {
    setModo("avaliacao");
    setTentativa([0, 0, 0, 0]);
    setFeedback("");
    setMostrarSolucao(false);
  }

  function reiniciarAvaliacao() {
    setAcertosAvaliacao(0);
    setTotalAvaliacao(0);
    setTentativa([0, 0, 0, 0]);
    setFeedback("");
    setMostrarSolucao(false);
  }

  const progressoTreino = totalTreino > 0 ? Math.round((acertosTreino / totalTreino) * 100) : 0;
  const progressoAvaliacao = totalAvaliacao > 0 ? Math.round((acertosAvaliacao / totalAvaliacao) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]"
        >
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full px-3 py-1 text-sm">9.º ano</Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">sem orbitais</Badge>
              </div>
              <CardTitle className="mt-2 flex items-center gap-2 text-2xl md:text-3xl">
                <Atom className="h-7 w-7" />
                Distribuição eletrónica por camadas
              </CardTitle>
              <p className="text-sm leading-6 text-slate-600 md:text-base">
                Explora átomos neutros dos primeiros 20 elementos e treina a distribuição de eletrões pelas camadas.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-4">
                <Button
                  className="rounded-2xl"
                  variant={modo === "explorar" ? "default" : "outline"}
                  onClick={() => {
                    setModo("explorar");
                    setFeedback("");
                    setMostrarSolucao(false);
                  }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Explorar
                </Button>
                <Button
                  className="rounded-2xl"
                  variant={modo === "treino" ? "default" : "outline"}
                  onClick={() => {
                    setModo("treino");
                    setFeedback("");
                    setTentativa([0, 0, 0, 0]);
                    setMostrarSolucao(false);
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Treino
                </Button>
                <Button
                  className="rounded-2xl"
                  variant={modo === "avaliacao" ? "default" : "outline"}
                  onClick={iniciarAvaliacao}
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Avaliação
                </Button>
                <Button className="rounded-2xl" variant="outline" onClick={() => novaTentativa()}>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Átomo aleatório
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-3xl border bg-white p-4">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Número atómico (1 a 20)</label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={numeroAtomico}
                    onChange={(e) => setNumeroAtomico(clampAtomicNumber(e.target.value))}
                    className="rounded-2xl"
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-sm text-slate-500">Elemento</div>
                      <div className="text-lg font-semibold">{ELEMENTOS[z]}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-sm text-slate-500">Símbolo</div>
                      <div className="text-lg font-semibold">{SIMBOLOS[z]}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-sm text-slate-500">Protões</div>
                      <div className="text-lg font-semibold">{z}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-sm text-slate-500">Eletrões (átomo neutro)</div>
                      <div className="text-lg font-semibold">{z}</div>
                    </div>
                  </div>

                  {modo === "explorar" ? (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border bg-slate-50 p-4">
                        <div className="mb-2 text-sm font-medium text-slate-700">Regra simples</div>
                        <p className="text-sm leading-6 text-slate-600">
                          Distribuímos os eletrões por camadas: primeiro a 1.ª camada (máximo 2), depois a 2.ª (máximo 8), depois a 3.ª (máximo 8) e depois a 4.ª (máximo 2), apenas para os primeiros 20 elementos.
                        </p>
                      </div>
                      <div className="grid gap-3">
                        {distribuicaoCerta.map((valor, i) => (
                          <div key={i} className="flex items-center justify-between rounded-2xl border p-3">
                            <span className="font-medium">{NOMES_CAMADAS[i]}</span>
                            <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
                              {valor} eletrão{valor === 1 ? "" : "s"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className={`rounded-2xl border p-4 text-sm leading-6 ${modo === "avaliacao" ? "border-amber-200 bg-amber-50 text-amber-900" : "bg-slate-50 text-slate-600"}`}>
                        {modo === "avaliacao"
                          ? `Modo avaliação: as respostas verificadas aqui contam para o painel de avaliação. Este átomo precisa de ${z} eletrões.`
                          : `Modo treino livre: aqui os alunos podem experimentar sem isso contar para a avaliação. Este átomo precisa de ${z} eletrões.`}
                      </div>

                      {tentativa.map((valor, i) => (
                        <LayerEditor
                          key={i}
                          value={valor}
                          onChange={(novo) => atualizarCamada(i, novo)}
                          label={NOMES_CAMADAS[i]}
                          cap={CAPACIDADES[i]}
                        />
                      ))}

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Button className="rounded-2xl" onClick={verificar}>Verificar</Button>
                        <Button className="rounded-2xl" variant="outline" onClick={limpar}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Limpar
                        </Button>
                        {modo !== "avaliacao" && (
                          <Button className="rounded-2xl" variant="outline" onClick={() => setMostrarSolucao(true)}>
                            Mostrar solução
                          </Button>
                        )}
                        <Button className="rounded-2xl" variant="outline" onClick={() => novaTentativa(modo)}>
                          <Shuffle className="mr-2 h-4 w-4" />
                          Novo átomo
                        </Button>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                        Total colocado: <strong>{somaTentativa}</strong> / {z}
                      </div>

                      {feedback && (
                        <div className="rounded-2xl border p-3 text-sm leading-6">
                          {feedback}
                        </div>
                      )}

                      {mostrarSolucao && modo !== "avaliacao" && (
                        <div className="rounded-2xl border bg-emerald-50 p-3 text-sm leading-6">
                          Solução: {distribuicaoCerta[0]} – {distribuicaoCerta[1]} – {distribuicaoCerta[2]} – {distribuicaoCerta[3]}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm text-slate-500">Visualização do átomo</div>
                      <div className="text-lg font-semibold">{ELEMENTOS[z]} ({SIMBOLOS[z]})</div>
                    </div>
                    <Badge className="rounded-full px-3 py-1">Z = {z}</Badge>
                  </div>

                  <AtomPreview z={z} distribuicao={(modo === "treino" || modo === "avaliacao") && !mostrarSolucao ? tentativa : distribuicaoCerta} />

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                      <strong>Número atómico</strong>
                      <div className="mt-1 text-slate-600">É o número de protões. Num átomo neutro, também é o número de eletrões.</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                      <strong>Lê assim</strong>
                      <div className="mt-1 text-slate-600">Ex.: sódio (Z = 11) → 2 eletrões na 1.ª camada, 8 na 2.ª e 1 na 3.ª.</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Painel do professor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <strong>Separação dos modos</strong>
                <div className="mt-2">
                  O modo <em>Treino</em> serve para experimentar. O modo <em>Avaliação</em> é o único que alimenta o painel de avaliação.
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Desempenho no treino</span>
                  <span className="font-semibold">{progressoTreino}%</span>
                </div>
                <Progress value={progressoTreino} />
                <div className="mt-3 text-sm text-slate-600">
                  Acertos: <strong>{acertosTreino}</strong> | Tentativas: <strong>{totalTreino}</strong>
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Avaliação</span>
                  <span className="font-semibold">{progressoAvaliacao}%</span>
                </div>
                <Progress value={progressoAvaliacao} />
                <div className="mt-3 text-sm text-slate-600">
                  Acertos: <strong>{acertosAvaliacao}</strong> | Respostas registadas: <strong>{totalAvaliacao}</strong>
                </div>
                <div className="mt-3">
                  <Button className="rounded-2xl" variant="outline" onClick={reiniciarAvaliacao}>
                    Reiniciar avaliação
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <strong>Limite didático desta app</strong>
                <div className="mt-2">
                  Esta versão foi feita para o 9.º ano e trabalha apenas a distribuição por camadas nos primeiros 20 elementos. Não aborda orbitais nem configuração eletrónica avançada.
                </div>
              </div>

              <div className="rounded-2xl border bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                <strong>Sugestão de uso em aula</strong>
                <div className="mt-2">
                  Primeiro usa o modo <em>Explorar</em>. Depois deixa os alunos mexerem no <em>Treino</em>. Só no fim passas para <em>Avaliação</em>, com respostas registadas em separado.
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
