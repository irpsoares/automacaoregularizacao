const campos = {
  tipoDocumento: document.getElementById('tipoDocumento'),
  condicaoPagamento: document.getElementById('condicaoPagamento'),
  centro: document.getElementById('centro'),
  centroCusto: document.getElementById('centroCusto'),
  fornecedor: document.getElementById('fornecedor'),
  usuario: document.getElementById('usuario'),
  utilizacao: document.getElementById('utilizacao'),
  observacao: document.getElementById('observacao'),
  dataHora: document.getElementById('dataHora'),
  numeroNf: document.getElementById('numeroNf'),
  serieNf: document.getElementById('serieNf'),
  dataNf: document.getElementById('dataNf'),
  valorNf: document.getElementById('valorNf'),
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

const bases = {
  centro: [],
  centroDeCusto: [],
  condicaoPagamento: [],
  fornecedor: [],
  usuario: [],
  utilizacao: [],
  politica: []
};

function valorSeguro(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

function formatarDataHora() {
  const agora = new Date();
  return `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

function obterTipoSelecionado() {
  return document.querySelector('input[name="tipoRegularizacao"]:checked')?.value || '';
}

async function carregarJson(caminho) {
  const response = await fetch(caminho);
  if (!response.ok) throw new Error(`Erro ao carregar ${caminho}`);
  return await response.json();
}

async function carregarBases() {
  const [
    centro,
    centroDeCusto,
    condicaoPagamento,
    fornecedor,
    usuario,
    utilizacao,
    politica
  ] = await Promise.all([
    carregarJson('./data/centro.json'),
    carregarJson('./data/centro_de_custo.json'),
    carregarJson('./data/condicao_pagamento.json'),
    carregarJson('./data/fornecedor.json'),
    carregarJson('./data/usuario.json'),
    carregarJson('./data/utilizacao.json'),
    carregarJson('./data/politica.json')
  ]);

  bases.centro = Array.isArray(centro) ? centro : [];
  bases.centroDeCusto = Array.isArray(centroDeCusto) ? centroDeCusto : [];
  bases.condicaoPagamento = Array.isArray(condicaoPagamento) ? condicaoPagamento : [];
  bases.fornecedor = Array.isArray(fornecedor) ? fornecedor : [];
  bases.usuario = Array.isArray(usuario) ? usuario : [];
  bases.utilizacao = Array.isArray(utilizacao) ? utilizacao : [];
  bases.politica = Array.isArray(politica) ? politica : [];
}

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
    label: item => `${valorSeguro(item.condicao)} - ${valorSeguro(item.descricao_prazo)}`
  });

  preencherSelect(campos.centro, bases.centro, {
    value: 'centro',
    label: item => `${valorSeguro(item.centro)} - ${valorSeguro(item.nome_centro)} - ${valorSeguro(item.cidade_2)}`
  });

  preencherSelect(campos.centroCusto, bases.centroDeCusto, {
    value: 'centro_custo',
    label: item => `${valorSeguro(item.centro_custo)} - ${valorSeguro(item.denominacao)}`
  });

  preencherSelect(campos.fornecedor, bases.fornecedor, {
    value: 'fornecedor',
    label: item => `${valorSeguro(item.fornecedor)} - ${valorSeguro(item.nome_1)}`
  });

  preencherSelect(campos.usuario, bases.usuario, {
    value: 'usuario_sap',
    label: item => `${valorSeguro(item.nome)} - ${valorSeguro(item.email)}`
  });

  preencherSelect(campos.utilizacao, bases.utilizacao, {
    value: 'utilizacao',
    label: item => valorSeguro(item.utilizacao)
  });
}

function atualizarAprovadores() {
  const cc = valorSeguro(campos.centroCusto.value);
  const registro = bases.centroDeCusto.find(item => valorSeguro(item.centro_custo) === cc);

  if (!registro) {
    campos.coordenador.value = '';
    campos.controladoria.value = '';
    campos.diretor.value = '';
    campos.emailCoordenador.value = '';
    campos.emailControladoria.value = '';
    campos.emailDiretor.value = '';
    campos.statusWorkflow.value = 'Não iniciado';
    campos.etapaAtual.value = '';
    campos.proximoAprovador.value = '';
    campos.tipoGovernanca.value = '';
    return;
  }

  campos.coordenador.value = valorSeguro(registro.coordenador);
  campos.controladoria.value = valorSeguro(registro.controladoria);
  campos.diretor.value = valorSeguro(registro.diretor);
  campos.emailCoordenador.value = valorSeguro(registro.email_coordenador || registro.coordenador_email);
  campos.emailControladoria.value = valorSeguro(registro.email_controladoria || registro.controladoria_email);
  campos.emailDiretor.value = valorSeguro(registro.email_diretor || registro.diretor_email);
  campos.statusWorkflow.value = 'Pendente';
  campos.etapaAtual.value = 'Aguardando aprovação da Coordenação';
  campos.proximoAprovador.value = valorSeguro(registro.coordenador);
  campos.tipoGovernanca.value = 'Coordenação -> Controladoria -> Diretor';
}

function validarPolitica() {
  const emergencial = document.getElementById('perguntaEmergencial').value;
  const notaFiscal = document.getElementById('perguntaNotaFiscal').value;
  const impedimento = document.getElementById('perguntaImpedimento').value;
  const justificativa = document.getElementById('perguntaJustificativa').value;

  const mensagens = [];

  if (!emergencial || !notaFiscal || !impedimento || !justificativa) {
    mensagens.push('Responda todas as perguntas da política.');
    return { ok: false, mensagens };
  }

  if (notaFiscal !== 'sim') {
    mensagens.push('A solicitação exige nota fiscal para continuar.');
    return { ok: false, mensagens };
  }

  if (justificativa !== 'sim') {
    mensagens.push('A justificativa detalhada é obrigatória para continuar.');
    return { ok: false, mensagens };
  }

  if (emergencial === 'nao' && impedimento === 'nao') {
    mensagens.push('Caso fora do cenário de emergência e sem impedimento do fluxo normal.');
    mensagens.push('Encaminhar para avaliação da Controladoria.');
    return { ok: false, mensagens };
  }

  mensagens.push('Triagem da política validada.');
  mensagens.push('Você pode prosseguir para o preenchimento da capa.');
  return { ok: true, mensagens };
}

function existeNaBase(base, chave, valor) {
  return base.some(item => valorSeguro(item[chave]) === valorSeguro(valor));
}

function coletarDadosCapa() {
  return {
    tipoRegularizacao: obterTipoSelecionado(),
    tipoDocumento: valorSeguro(campos.tipoDocumento.value),
    condicaoPagamento: valorSeguro(campos.condicaoPagamento.value),
    numeroNf: valorSeguro(campos.numeroNf.value),
    serieNf: valorSeguro(campos.serieNf.value),
    dataNf: valorSeguro(campos.dataNf.value),
    valorNf: valorSeguro(campos.valorNf.value),
    centro: valorSeguro(campos.centro.value),
    centroCusto: valorSeguro(campos.centroCusto.value),
    fornecedor: valorSeguro(campos.fornecedor.value),
    usuario: valorSeguro(campos.usuario.value),
    utilizacao: valorSeguro(campos.utilizacao.value),
    observacao: valorSeguro(campos.observacao.value),
    coordenador: valorSeguro(campos.coordenador.value),
    controladoria: valorSeguro(campos.controladoria.value),
    diretor: valorSeguro(campos.diretor.value),
    emailCoordenador: valorSeguro(campos.emailCoordenador.value),
    emailControladoria: valorSeguro(campos.emailControladoria.value),
    emailDiretor: valorSeguro(campos.emailDiretor.value),
    statusWorkflow: valorSeguro(campos.statusWorkflow.value),
    etapaAtual: valorSeguro(campos.etapaAtual.value),
    proximoAprovador: valorSeguro(campos.proximoAprovador.value),
    tipoGovernanca: valorSeguro(campos.tipoGovernanca.value),
    dataHora: valorSeguro(campos.dataHora.value)
  };
}

function validarCapa(dados) {
  const mensagens = [];

  if (!dados.tipoRegularizacao) mensagens.push('Selecione o tipo de regularização.');
  if (!dados.tipoDocumento) mensagens.push('Selecione o tipo de documento.');
  if (!dados.condicaoPagamento) mensagens.push('Selecione a condição de pagamento.');
  if (!dados.numeroNf) mensagens.push('Informe o número da nota fiscal.');
  if (!dados.serieNf) mensagens.push('Informe a série da nota fiscal.');
  if (!dados.dataNf) mensagens.push('Informe a data da nota fiscal.');
  if (!dados.valorNf) mensagens.push('Informe o valor total da nota fiscal.');

  if (!dados.centro) {
    mensagens.push('Selecione o centro.');
  } else if (!existeNaBase(bases.centro, 'centro', dados.centro)) {
    mensagens.push('Centro inválido.');
  }

  if (!dados.centroCusto) {
    mensagens.push('Selecione o centro de custo.');
  } else if (!existeNaBase(bases.centroDeCusto, 'centro_custo', dados.centroCusto)) {
    mensagens.push('Centro de custo inválido.');
  }

  if (!dados.fornecedor) {
    mensagens.push('Selecione o fornecedor.');
  } else if (!existeNaBase(bases.fornecedor, 'fornecedor', dados.fornecedor)) {
    mensagens.push('Fornecedor inválido.');
  }

  if (!dados.usuario) {
    mensagens.push('Selecione o usuário.');
  } else if (!existeNaBase(bases.usuario, 'usuario_sap', dados.usuario)) {
    mensagens.push('Usuário inválido.');
  }

  if (!dados.utilizacao) mensagens.push('Selecione a utilização.');
  if (!dados.observacao) mensagens.push('Informe a justificativa.');
  if (dados.observacao && dados.observacao.length < 15) {
    mensagens.push('A justificativa deve ter pelo menos 15 caracteres.');
  }

  if (!dados.coordenador || !dados.controladoria || !dados.diretor) {
    mensagens.push('O workflow de aprovação não foi encontrado para o centro de custo selecionado.');
  }

  return mensagens;
}

function salvarCapaLocalmente() {
  localStorage.setItem('regularizacao_capa', JSON.stringify(coletarDadosCapa()));
}

function irParaProximaEtapa() {
  const dados = coletarDadosCapa();
  const erros = validarCapa(dados);

  if (erros.length) {
    painelResultado.textContent = erros.join('\n');
    return;
  }

  salvarCapaLocalmente();

  if (dados.tipoRegularizacao === 'material') {
    window.location.href = './material.html';
    return;
  }

  if (dados.tipoRegularizacao === 'servico') {
    window.location.href = './servico.html';
    return;
  }
}

function limparFormulario() {
  document.querySelectorAll('input[name="tipoRegularizacao"]').forEach(r => r.checked = false);
  document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea').forEach(c => {
    if (c.id !== 'dataHora') c.value = '';
  });

  campos.coordenador.value = '';
  campos.controladoria.value = '';
  campos.diretor.value = '';
  campos.emailCoordenador.value = '';
  campos.emailControladoria.value = '';
  campos.emailDiretor.value = '';
  campos.statusWorkflow.value = 'Não iniciado';
  campos.etapaAtual.value = '';
  campos.proximoAprovador.value = '';
  campos.tipoGovernanca.value = '';
  painelResultado.textContent = 'Formulário limpo.';
}

function registrarEventos() {
  document.getElementById('btnContinuarPolitica').addEventListener('click', () => {
    const resultado = validarPolitica();
    resultadoPolitica.textContent = resultado.mensagens.join('\n');

    if (resultado.ok) {
      localStorage.setItem('politica_validada', 'sim');
      setTimeout(() => modalPolitica.classList.remove('aberto'), 400);
    }
  });

  campos.centroCusto.addEventListener('change', atualizarAprovadores);

  document.getElementById('btnValidarCapa').addEventListener('click', () => {
    const dados = coletarDadosCapa();
    const erros = validarCapa(dados);
    painelResultado.textContent = erros.length
      ? erros.join('\n')
      : 'Capa validada com sucesso. Pode seguir para a próxima etapa.';
  });

  document.getElementById('btnProximaEtapa').addEventListener('click', irParaProximaEtapa);
  document.getElementById('btnLimpar').addEventListener('click', limparFormulario);
}

async function iniciar() {
  campos.dataHora.value = formatarDataHora();
  await carregarBases();
  carregarDropdowns();
  registrarEventos();

  if (localStorage.getItem('politica_validada') === 'sim') {
    modalPolitica.classList.remove('aberto');
  }
}

iniciar();
