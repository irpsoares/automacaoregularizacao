let politicaValidada = false;

const campos = {
  tipoDocumento: document.getElementById('tipoDocumento'),
  condicaoPagamento: document.getElementById('condicaoPagamento'),
  centro: document.getElementById('centro'),
  centroCusto: document.getElementById('centroCusto'),
  fornecedor: document.getElementById('fornecedor'),
  usuario: document.getElementById('usuario'),
  utilizacao: document.getElementById('utilizacao'),
  observacao: document.getElementById('observacao'),
  comunicadoPolitica: document.getElementById('comunicadoPolitica'),
  dataHora: document.getElementById('dataHora'),
  numeroNf: document.getElementById('numeroNf'),
  serieNf: document.getElementById('serieNf'),
  dataNf: document.getElementById('dataNf'),
  valorNf: document.getElementById('valorNf'),
  anexoNf: document.getElementById('anexoNf'),
  coordenador: document.getElementById('coordenador'),
  controladoria: document.getElementById('controladoria'),
  diretor: document.getElementById('diretor'),
  emailCoordenador: document.getElementById('emailCoordenador'),
  emailControladoria: document.getElementById('emailControladoria'),
  emailDiretor: document.getElementById('emailDiretor'),
  statusWorkflow: document.getElementById('statusWorkflow'),
  etapaAtual: document.getElementById('etapaAtual'),
  proximoAprovador: document.getElementById('proximoAprovador'),
  tipoGovernanca: document.getElementById('tipoGovernanca')
};

const modalPolitica = document.getElementById('modalPolitica');
const resultadoPolitica = document.getElementById('resultadoPolitica');
const painelResultado = document.getElementById('painelResultado');

// =========================
// BASES
// =========================
const bases = {
  centro: [],
  centroDeCusto: [],
  condicaoPagamento: [],
  fornecedor: [],
  usuario: [],
  utilizacao: [],
  politica: []
};

// =========================
// UTIL
// =========================
function valorSeguro(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

function formatarDataHora() {
  const agora = new Date();
  return `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit'
  })}`;
}

function obterTipoSelecionado() {
  return document.querySelector('input[name="tipoRegularizacao"]:checked')?.value || '';
}

function obterRespostasPolitica() {
  return {
    emergencial: document.getElementById('perguntaEmergencial').value,
    notaFiscal: document.getElementById('perguntaNotaFiscal').value,
    impedimento: document.getElementById('perguntaImpedimento').value,
    justificativa: document.getElementById('perguntaJustificativa').value
  };
}

// =========================
// CARREGAMENTO
// =========================
async function carregarJson(caminho) {
  const response = await fetch(caminho);
  if (!response.ok) throw new Error(`Erro ao carregar ${caminho}`);
  return await response.json();
}

async function carregarBases() {
  const [centro, centroDeCusto, condicaoPagamento, fornecedor, usuario, utilizacao] = await Promise.all([
    carregarJson('./data/centro.json'),
    carregarJson('./data/centro_de_custo.json'),
    carregarJson('./data/condicao_pagamento.json'),
    carregarJson('./data/fornecedor.json'),
    carregarJson('./data/usuario.json'),
    carregarJson('./data/utilizacao.json')
  ]);

  bases.centro = centro || [];
  bases.centroDeCusto = centroDeCusto || [];
  bases.condicaoPagamento = condicaoPagamento || [];
  bases.fornecedor = fornecedor || [];
  bases.usuario = usuario || [];
  bases.utilizacao = utilizacao || [];
}

// =========================
// DROPDOWNS
// =========================
function preencherSelect(select, dados, config, placeholder = 'Selecione') {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  dados.forEach(item => {
    const option = document.createElement('option');
    option.value = valorSeguro(item[config.value]);
    option.textContent = config.label(item);
    select.appendChild(option);
  });
}

function carregarDropdowns() {
  preencherSelect(campos.condicaoPagamento, bases.condicaoPagamento, {
    value: 'condicao',
    label: i => `${i.condicao} - ${i.descricao_prazo}`
  });

  preencherSelect(campos.centro, bases.centro, {
    value: 'centro',
    label: i => `${i.centro} - ${i.nome_centro}`
  });

  preencherSelect(campos.centroCusto, bases.centroDeCusto, {
    value: 'centro_custo',
    label: i => `${i.centro_custo} - ${i.denominacao}`
  });

  preencherSelect(campos.fornecedor, bases.fornecedor, {
    value: 'fornecedor',
    label: i => `${i.fornecedor} - ${i.nome_1}`
  });

  preencherSelect(campos.usuario, bases.usuario, {
    value: 'usuario_sap',
    label: i => `${i.nome} - ${i.email}`
  });

  preencherSelect(campos.utilizacao, bases.utilizacao, {
    value: 'utilizacao',
    label: i => i.utilizacao
  });
}

// =========================
// POLÍTICA
// =========================
function validarPolitica() {
  const r = obterRespostasPolitica();
  const msg = [];

  if (!r.emergencial || !r.notaFiscal || !r.impedimento || !r.justificativa) {
    msg.push('Responda todas as perguntas.');
    return { ok: false, mensagens: msg };
  }

  if (r.notaFiscal !== 'sim') {
    msg.push('Sem nota fiscal não pode continuar.');
    return { ok: false, mensagens: msg };
  }

  if (r.justificativa !== 'sim') {
    msg.push('Justificativa obrigatória.');
    return { ok: false, mensagens: msg };
  }

  msg.push('Política validada.');
  return { ok: true, mensagens: msg };
}

// =========================
// EVENTOS
// =========================
function registrarEventos() {

  document.getElementById('btnContinuarPolitica').addEventListener('click', () => {
    const resultado = validarPolitica();
    resultadoPolitica.textContent = resultado.mensagens.join('\n');

    if (resultado.ok) {
      politicaValidada = true;
      modalPolitica.classList.remove('aberto');
    }
  });

  document.getElementById('btnValidarCapa').addEventListener('click', () => {

    if (!politicaValidada) {
      painelResultado.textContent = 'Valide a política antes de continuar.';
      modalPolitica.classList.add('aberto');
      return;
    }

    painelResultado.textContent = 'Capa validada com sucesso.';
  });

  document.getElementById('btnProximaEtapa').addEventListener('click', () => {

    if (!politicaValidada) {
      painelResultado.textContent = 'Valide a política antes de continuar.';
      modalPolitica.classList.add('aberto');
      return;
    }

    const tipo = obterTipoSelecionado();

    if (tipo === 'material') window.location.href = './material.html';
    if (tipo === 'servico') window.location.href = './servico.html';
  });

  document.getElementById('btnLimpar').addEventListener('click', () => {
    politicaValidada = false;
    modalPolitica.classList.add('aberto');
    painelResultado.textContent = 'Formulário reiniciado.';
  });
}

// =========================
// INIT
// =========================
async function iniciar() {
  politicaValidada = false;
  modalPolitica.classList.add('aberto');

  campos.dataHora.value = formatarDataHora();

  await carregarBases();
  carregarDropdowns();
  registrarEventos();
}

iniciar();
