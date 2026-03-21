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

function obterRespostasPolitica() {
  return {
    emergencial: document.getElementById('perguntaEmergencial').value,
    notaFiscal: document.getElementById('perguntaNotaFiscal').value,
    impedimento: document.getElementById('perguntaImpedimento').value,
    justificativa: document.getElementById('perguntaJustificativa').value
  };
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

function limparWorkflow() {
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
}

function atualizarWorkflowPorCentroCusto() {
  const cc = valorSeguro(campos.centroCusto.value);
  const registro = bases.centroDeCusto.find(item => valorSeguro(item.centro_custo) === cc);

  if (!registro) {
    limparWorkflow();
    return;
  }

  campos.coordenador.value = valorSeguro(registro.coordenador);
  campos.controladoria.value = valorSeguro(registro.controladoria);
  campos.diretor.value = valorSeguro(registro.diretor);
  campos.emailCoordenador.value = valorSeguro(registro.email_coordenador || registro.coordenador_email);
  campos.emailControladoria.value = valorSeguro(registro.email_controladoria || registro.controladoria_email);
  campos.emailDiretor.value = valorSeguro(registro.email_diretor || registro.diretor_email);

  campos.statusWorkflow.value = 'Pendente';
  campos.etapaAtual.value = 'Aguardando definição de governança';
  campos.proximoAprovador.value = valorSeguro(registro.coordenador);
  campos.tipoGovernanca.value = 'Coordenação -> Controladoria -> Diretor';
}

function politicaResumo() {
  const item = bases.politica[0];
  if (!item) return '';
  const texto = Object.values(item).find(v => typeof v === 'string' && v.trim());
  return valorSeguro(texto);
}

function validarPolitica() {
  const respostas = obterRespostasPolitica();
  const mensagens = [];

  if (!respostas.emergencial || !respostas.notaFiscal || !respostas.impedimento || !respostas.justificativa) {
    mensagens.push('Responda todas as perguntas da política.');
    return { ok: false, mensagens, governancaEspecial: false, diretoHead: false };
  }

  if (respostas.notaFiscal !== 'sim') {
    mensagens.push('Sem nota fiscal não é permitido continuar.');
    return { ok: false, mensagens, governancaEspecial: true, diretoHead: true };
  }

  if (respostas.justificativa !== 'sim') {
    mensagens.push('A justificativa detalhada é obrigatória para continuar.');
    return { ok: false, mensagens, governancaEspecial: true, diretoHead: true };
  }

  if (respostas.emergencial === 'nao') {
    mensagens.push('Solicitação sem emergência: a aprovação deve seguir diretamente para o Head/Diretor.');
    mensagens.push('O usuário deve ser comunicado explicitamente com referência à política de compras.');
    return { ok: true, mensagens, governancaEspecial: true, diretoHead: true };
  }

  if (respostas.impedimento === 'nao') {
    mensagens.push('Sem impedimento do fluxo normal, a solicitação entra em governança reforçada.');
    return { ok: true, mensagens, governancaEspecial: true, diretoHead: false };
  }

  mensagens.push('Triagem da política validada.');
  mensagens.push('Você pode prosseguir para o preenchimento da capa.');
  return { ok: true, mensagens, governancaEspecial: false, diretoHead: false };
}

function existeNaBase(base, chave, valor) {
  return base.some(item => valorSeguro(item[chave]) === valorSeguro(valor));
}

function validarArquivoNf() {
  const arquivos = campos.anexoNf.files;
  if (!arquivos || !arquivos.length) {
    return 'É obrigatório anexar a nota fiscal.';
  }

  const arquivo = arquivos[0];
  const nome = arquivo.name.toLowerCase();
  const extensoesValidas = ['.pdf', '.jpg', '.jpeg', '.png', '.xml'];
  const valido = extensoesValidas.some(ext => nome.endsWith(ext));

  if (!valido) {
    return 'Formato de anexo inválido. Use PDF, JPG, JPEG, PNG ou XML.';
  }

  return '';
}

function montarComunicadoPolitica() {
  const respostas = obterRespostasPolitica();

  if (respostas.emergencial === 'nao') {
    campos.comunicadoPolitica.value =
      'Solicitação fora de cenário emergencial. Aprovação seguirá diretamente para Head/Diretor. O usuário deve receber comunicação explícita com cópia da política de compras.';
    return;
  }

  if (respostas.impedimento === 'nao') {
    campos.comunicadoPolitica.value =
      'Solicitação sem impedimento do fluxo normal. Caso seguirá em governança reforçada e poderá ser tratado como anomalia.';
    return;
  }

  campos.comunicadoPolitica.value =
    'Solicitação enquadrada em fluxo regular de triagem, sujeita às aprovações previstas.';
}

function aplicarWorkflowGovernanca() {
  const respostas = obterRespostasPolitica();
  const diretor = valorSeguro(campos.diretor.value);
  const coordenador = valorSeguro(campos.coordenador.value);

  if (respostas.emergencial === 'nao') {
    campos.statusWorkflow.value = 'Pendente';
    campos.etapaAtual.value = 'Aguardando aprovação direta do Head/Diretor';
    campos.proximoAprovador.value = diretor || 'Head/Diretor';
    campos.tipoGovernanca.value = 'Aprovação direta do Head/Diretor';
    return;
  }

  if (respostas.impedimento === 'nao') {
    campos.statusWorkflow.value = 'Pendente';
    campos.etapaAtual.value = 'Aguardando validação de governança reforçada';
    campos.proximoAprovador.value = coordenador || diretor || 'Coordenação';
    campos.tipoGovernanca.value = 'Governança reforçada / possível anomalia';
    return;
  }

  campos.statusWorkflow.value = 'Pendente';
  campos.etapaAtual.value = 'Aguardando aprovação da Coordenação';
  campos.proximoAprovador.value = coordenador || 'Coordenação';
  campos.tipoGovernanca.value = 'Coordenação -> Controladoria -> Diretor';
}

function coletarDadosCapa() {
  const arquivo = campos.anexoNf.files && campos.anexoNf.files[0] ? campos.anexoNf.files[0] : null;

  return {
    politica: obterRespostasPolitica(),
    tipoRegularizacao: obterTipoSelecionado(),
    tipoDocumento: valorSeguro(campos.tipoDocumento.value),
    condicaoPagamento: valorSeguro(campos.condicaoPagamento.value),
    numeroNf: valorSeguro(campos.numeroNf.value),
    serieNf: valorSeguro(campos.serieNf.value),
    dataNf: valorSeguro(campos.dataNf.value),
    valorNf: valorSeguro(campos.valorNf.value),
    anexoNome: arquivo ? arquivo.name : '',
    centro: valorSeguro(campos.centro.value),
    centroCusto: valorSeguro(campos.centroCusto.value),
    fornecedor: valorSeguro(campos.fornecedor.value),
    usuario: valorSeguro(campos.usuario.value),
    utilizacao: valorSeguro(campos.utilizacao.value),
    observacao: valorSeguro(campos.observacao.value),
    comunicadoPolitica: valorSeguro(campos.comunicadoPolitica.value),
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
  const valorNumerico = Number(dados.valorNf || 0);

  if (!dados.tipoRegularizacao) mensagens.push('Selecione o tipo de regularização.');
  if (!dados.tipoDocumento) mensagens.push('Selecione o tipo de documento.');
  if (!dados.condicaoPagamento) mensagens.push('Selecione a condição de pagamento.');
  if (!dados.numeroNf) mensagens.push('Informe o número da nota fiscal.');
  if (!dados.serieNf) mensagens.push('Informe a série da nota fiscal.');
  if (!dados.dataNf) mensagens.push('Informe a data da nota fiscal.');
  if (!dados.valorNf) mensagens.push('Informe o valor total da nota fiscal.');

  if (dados.valorNf) {
    if (Number.isNaN(valorNumerico)) {
      mensagens.push('Valor da NF inválido.');
    } else if (valorNumerico <= 0) {
      mensagens.push('O valor da NF deve ser maior que zero.');
    } else if (valorNumerico > 200) {
      mensagens.push('Não é permitido seguir com valor superior a R$ 200,00.');
    }
  }

  const erroAnexo = validarArquivoNf();
  if (erroAnexo) mensagens.push(erroAnexo);

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

  if (!dados.observacao) {
    mensagens.push('Informe a justificativa.');
  } else {
    if (dados.observacao.length < 20) mensagens.push('A justificativa deve ter pelo menos 20 caracteres.');
    if (!/[a-zA-ZÀ-ÿ]/.test(dados.observacao)) mensagens.push('A justificativa parece inválida.');
  }

  if (!dados.coordenador || !dados.controladoria || !dados.diretor) {
    mensagens.push('O workflow de aprovação não foi encontrado corretamente para o centro de custo selecionado.');
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
  }
}

function limparFormulario() {
  document.querySelectorAll('input[name="tipoRegularizacao"]').forEach(r => (r.checked = false));
  document.querySelectorAll('select').forEach(s => (s.selectedIndex = 0));
  document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea, input[type="file"]').forEach(c => {
    if (c.id !== 'dataHora') c.value = '';
  });

  limparWorkflow();
  painelResultado.textContent = 'Formulário limpo.';
}

function registrarEventos() {
  document.getElementById('btnContinuarPolitica').addEventListener('click', () => {
    const resultado = validarPolitica();
    resultadoPolitica.textContent = resultado.mensagens.join('\n');

    if (resultado.ok) {
      localStorage.setItem('politica_validada', JSON.stringify(obterRespostasPolitica()));
      montarComunicadoPolitica();
      modalPolitica.classList.remove('aberto');
    }
  });

  campos.centroCusto.addEventListener('change', () => {
    atualizarWorkflowPorCentroCusto();
    montarComunicadoPolitica();
    aplicarWorkflowGovernanca();
  });

  document.getElementById('btnValidarCapa').addEventListener('click', () => {
    montarComunicadoPolitica();
    aplicarWorkflowGovernanca();

    const dados = coletarDadosCapa();
    const erros = validarCapa(dados);

    const mensagens = [];
    if (erros.length) {
      mensagens.push(...erros);
    } else {
      mensagens.push('Capa validada com sucesso.');
      mensagens.push(`Workflow: ${dados.tipoGovernanca}`);
      mensagens.push(`Próximo aprovador: ${dados.proximoAprovador}`);
    }

    const politicaTexto = politicaResumo();
    if (politicaTexto) {
      mensagens.push('');
      mensagens.push(`Resumo da política: ${politicaTexto}`);
    }

    painelResultado.textContent = mensagens.join('\n');
  });

  document.getElementById('btnProximaEtapa').addEventListener('click', irParaProximaEtapa);
  document.getElementById('btnLimpar').addEventListener('click', limparFormulario);
}

async function iniciar() {
  campos.dataHora.value = formatarDataHora();
  limparWorkflow();
  await carregarBases();
  carregarDropdowns();
  registrarEventos();

  const politicaSalva = localStorage.getItem('politica_validada');
  if (politicaSalva) {
    modalPolitica.classList.remove('aberto');
    montarComunicadoPolitica();
  }
}

iniciar();
