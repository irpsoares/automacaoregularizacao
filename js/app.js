const campos = {
  tipoDocumento: document.getElementById('tipoDocumento'),
  condicaoPagamento: document.getElementById('condicaoPagamento'),
  centro: document.getElementById('centro'),
  centroCusto: document.getElementById('centroCusto'),
  fornecedor: document.getElementById('fornecedor'),
  usuario: document.getElementById('usuario'),
  utilizacao: document.getElementById('utilizacao'),
  observacao: document.getElementById('observacao'),

  coordenador: document.getElementById('coordenador'),
  controladoria: document.getElementById('controladoria'),
  diretor: document.getElementById('diretor'),
  emailCoordenador: document.getElementById('emailCoordenador'),
  emailControladoria: document.getElementById('emailControladoria'),
  emailDiretor: document.getElementById('emailDiretor'),

  material: document.getElementById('material'),
  deposito: document.getElementById('deposito'),
  grupoCompras: document.getElementById('grupoCompras'),
  frete: document.getElementById('frete'),
  quantidade: document.getElementById('quantidade'),
  valorMaterial: document.getElementById('valorMaterial'),

  destinacaoServico: document.getElementById('destinacaoServico'),
  classificacaoContabil: document.getElementById('classificacaoContabil'),
  tipoDistribuicao: document.getElementById('tipoDistribuicao'),
  descricaoServico: document.getElementById('descricaoServico'),
  valorServico: document.getElementById('valorServico'),

  dataHora: document.getElementById('dataHora'),
  statusWorkflow: document.getElementById('statusWorkflow'),
  etapaAtual: document.getElementById('etapaAtual'),
  proximoAprovador: document.getElementById('proximoAprovador'),
  tipoGovernanca: document.getElementById('tipoGovernanca')
};

const blocoMaterial = document.getElementById('blocoMaterial');
const blocoServico = document.getElementById('blocoServico');
const painelResultado = document.getElementById('painelResultado');

const bases = {
  centro: [],
  centroDeCusto: [],
  classificacaoContabil: [],
  condicaoPagamento: [],
  deposito: [],
  destinacaoServico: [],
  fornecedor: [],
  frete: [],
  grupoDeCompras: [],
  material: [],
  politica: [],
  tipoDeDistribuicaoContabil: [],
  usuario: [],
  utilizacao: []
};

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

function valorSeguro(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

async function carregarJson(caminho) {
  const response = await fetch(caminho);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${caminho}`);
  }
  return await response.json();
}

async function carregarBases() {
  const [
    centro,
    centroDeCusto,
    classificacaoContabil,
    condicaoPagamento,
    deposito,
    destinacaoServico,
    fornecedor,
    frete,
    grupoDeCompras,
    material,
    politica,
    tipoDeDistribuicaoContabil,
    usuario,
    utilizacao
  ] = await Promise.all([
    carregarJson('./data/centro.json'),
    carregarJson('./data/centro_de_custo.json'),
    carregarJson('./data/classificacao_contabil.json'),
    carregarJson('./data/condicao_pagamento.json'),
    carregarJson('./data/deposito.json'),
    carregarJson('./data/destinacao_servico.json'),
    carregarJson('./data/fornecedor.json'),
    carregarJson('./data/frete.json'),
    carregarJson('./data/grupo_de_compras.json'),
    carregarJson('./data/material.json'),
    carregarJson('./data/politica.json'),
    carregarJson('./data/tipo_de_distribuicao_contabil.json'),
    carregarJson('./data/usuario.json'),
    carregarJson('./data/utilizacao.json')
  ]);

  bases.centro = Array.isArray(centro) ? centro : [];
  bases.centroDeCusto = Array.isArray(centroDeCusto) ? centroDeCusto : [];
  bases.classificacaoContabil = Array.isArray(classificacaoContabil) ? classificacaoContabil : [];
  bases.condicaoPagamento = Array.isArray(condicaoPagamento) ? condicaoPagamento : [];
  bases.deposito = Array.isArray(deposito) ? deposito : [];
  bases.destinacaoServico = Array.isArray(destinacaoServico) ? destinacaoServico : [];
  bases.fornecedor = Array.isArray(fornecedor) ? fornecedor : [];
  bases.frete = Array.isArray(frete) ? frete : [];
  bases.grupoDeCompras = Array.isArray(grupoDeCompras) ? grupoDeCompras : [];
  bases.material = Array.isArray(material) ? material : [];
  bases.politica = Array.isArray(politica) ? politica : [];
  bases.tipoDeDistribuicaoContabil = Array.isArray(tipoDeDistribuicaoContabil) ? tipoDeDistribuicaoContabil : [];
  bases.usuario = Array.isArray(usuario) ? usuario : [];
  bases.utilizacao = Array.isArray(utilizacao) ? utilizacao : [];
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
  preencherSelect(
    campos.condicaoPagamento,
    bases.condicaoPagamento,
    {
      value: 'condicao',
      label: item => `${valorSeguro(item.condicao)} - ${valorSeguro(item.descricao_prazo)}`
    }
  );

  preencherSelect(
    campos.centro,
    bases.centro,
    {
      value: 'centro',
      label: item => `${valorSeguro(item.centro)} - ${valorSeguro(item.nome_centro)} - ${valorSeguro(item.cidade_2)}`
    }
  );

  preencherSelect(
    campos.centroCusto,
    bases.centroDeCusto,
    {
      value: 'centro_custo',
      label: item => `${valorSeguro(item.centro_custo)} - ${valorSeguro(item.denominacao)}`
    }
  );

  preencherSelect(
    campos.fornecedor,
    bases.fornecedor,
    {
      value: 'fornecedor',
      label: item => `${valorSeguro(item.fornecedor)} - ${valorSeguro(item.nome_1)}`
    }
  );

  preencherSelect(
    campos.usuario,
    bases.usuario,
    {
      value: 'usuario_sap',
      label: item => `${valorSeguro(item.nome)} - ${valorSeguro(item.email)}`
    }
  );

  preencherSelect(
    campos.utilizacao,
    bases.utilizacao,
    {
      value: 'utilizacao',
      label: item => valorSeguro(item.utilizacao)
    }
  );

  preencherSelect(
    campos.deposito,
    bases.deposito,
    {
      value: Object.keys(bases.deposito[0] || {})[0] || 'deposito',
      label: item => Object.values(item).filter(v => v !== null && v !== '').join(' - ')
    }
  );

  preencherSelect(
    campos.grupoCompras,
    bases.grupoDeCompras,
    {
      value: Object.keys(bases.grupoDeCompras[0] || {})[0] || 'grupo_de_compras',
      label: item => Object.values(item).filter(v => v !== null && v !== '').join(' - ')
    }
  );

  preencherSelect(
    campos.frete,
    bases.frete,
    {
      value: Object.keys(bases.frete[0] || {})[0] || 'frete',
      label: item => Object.values(item).filter(v => v !== null && v !== '').join(' - ')
    }
  );

  preencherSelect(
    campos.destinacaoServico,
    bases.destinacaoServico,
    {
      value: 'tipos_servicos',
      label: item => valorSeguro(item.tipos_servicos)
    }
  );

  preencherSelect(
    campos.classificacaoContabil,
    bases.classificacaoContabil,
    {
      value: 'codigo',
      label: item => `${valorSeguro(item.codigo)} - ${valorSeguro(item.descricao_classificacao_contabil)}`
    }
  );

  preencherSelect(
    campos.tipoDistribuicao,
    bases.tipoDeDistribuicaoContabil,
    {
      value: 'tipo_distribuicao_contabil',
      label: item => valorSeguro(item.tipo_distribuicao_contabil)
    }
  );

  preencherSelect(
    campos.material,
    bases.material,
    {
      value: 'material',
      label: item => `${valorSeguro(item.material)} - ${valorSeguro(item.texto_breve_material)}`
    }
  );
}

function atualizarBlocos() {
  const tipo = obterTipoSelecionado();
  blocoMaterial.classList.add('oculto');
  blocoServico.classList.add('oculto');

  if (tipo === 'material') blocoMaterial.classList.remove('oculto');
  if (tipo === 'servico') blocoServico.classList.remove('oculto');
}

function limparAprovadores() {
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

function encontrarCentroCustoSelecionado() {
  const valor = valorSeguro(campos.centroCusto.value);
  return bases.centroDeCusto.find(item => valorSeguro(item.centro_custo) === valor);
}

function atualizarAprovadoresPorCentroCusto() {
  const registro = encontrarCentroCustoSelecionado();

  if (!registro) {
    limparAprovadores();
    return;
  }

  campos.coordenador.value = valorSeguro(registro.coordenador);
  campos.controladoria.value = valorSeguro(registro.controladoria);
  campos.diretor.value = valorSeguro(registro.diretor);
  campos.emailCoordenador.value = valorSeguro(registro.email_coordenador);
  campos.emailControladoria.value = valorSeguro(registro.email_controladoria);
  campos.emailDiretor.value = valorSeguro(registro.email_diretor);

  campos.statusWorkflow.value = 'Pendente';
  campos.etapaAtual.value = 'Aguardando aprovação da Coordenação';
  campos.proximoAprovador.value = valorSeguro(registro.coordenador);
  campos.tipoGovernanca.value = 'Coordenação -> Controladoria -> Diretor';
}

function existeNaBase(base, chave, valor) {
  if (!valor) return false;
  return base.some(item => valorSeguro(item[chave]) === valorSeguro(valor));
}

function coletarDados() {
  return {
    tipoRegularizacao: obterTipoSelecionado(),
    tipoDocumento: valorSeguro(campos.tipoDocumento.value),
    dataHora: valorSeguro(campos.dataHora.value),
    condicaoPagamento: valorSeguro(campos.condicaoPagamento.value),
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

    material: valorSeguro(campos.material.value),
    deposito: valorSeguro(campos.deposito.value),
    grupoCompras: valorSeguro(campos.grupoCompras.value),
    frete: valorSeguro(campos.frete.value),
    quantidade: valorSeguro(campos.quantidade.value),
    valorMaterial: valorSeguro(campos.valorMaterial.value),

    destinacaoServico: valorSeguro(campos.destinacaoServico.value),
    classificacaoContabil: valorSeguro(campos.classificacaoContabil.value),
    tipoDistribuicao: valorSeguro(campos.tipoDistribuicao.value),
    descricaoServico: valorSeguro(campos.descricaoServico.value),
    valorServico: valorSeguro(campos.valorServico.value)
  };
}

function calcularTipoGovernanca(dados) {
  const valor = Number(
    dados.tipoRegularizacao === 'material'
      ? dados.valorMaterial || 0
      : dados.valorServico || 0
  );

  if (valor >= 1500) {
    return 'Fluxo formal de aprovação';
  }

  return 'Fluxo simplificado com validação';
}

function textoPoliticaResumo() {
  const politica = bases.politica[0]?.politica || '';
  if (!politica) return '';
  return `Política: ${politica}`;
}

function validarFormulario(dados) {
  const mensagens = [];

  if (!dados.tipoRegularizacao) {
    mensagens.push('Selecione o tipo de regularização.');
  }

  if (!dados.tipoDocumento) {
    mensagens.push('Selecione o tipo de documento.');
  }

  if (!dados.condicaoPagamento) {
    mensagens.push('Selecione a condição de pagamento.');
  }

  if (!dados.centro) {
    mensagens.push('Selecione o centro.');
  } else if (!existeNaBase(bases.centro, 'centro', dados.centro)) {
    mensagens.push('Centro inválido: não consta na base cadastrada.');
  }

  if (!dados.centroCusto) {
    mensagens.push('Selecione o centro de custo.');
  } else if (!existeNaBase(bases.centroDeCusto, 'centro_custo', dados.centroCusto)) {
    mensagens.push('Centro de custo inválido: não consta na base cadastrada.');
  }

  if (!dados.fornecedor) {
    mensagens.push('Selecione o fornecedor.');
  } else if (!existeNaBase(bases.fornecedor, 'fornecedor', dados.fornecedor)) {
    mensagens.push('Fornecedor inválido: não consta na base cadastrada.');
  }

  if (!dados.usuario) {
    mensagens.push('Selecione o usuário.');
  } else if (!existeNaBase(bases.usuario, 'usuario_sap', dados.usuario)) {
    mensagens.push('Usuário inválido: não consta na base cadastrada.');
  }

  if (!dados.utilizacao) {
    mensagens.push('Selecione a utilização.');
  }

  if (!dados.observacao) {
    mensagens.push('Informe a justificativa / observação.');
  }

  if (dados.tipoRegularizacao === 'material') {
    if (!dados.material) {
      mensagens.push('Selecione o material.');
    } else if (!existeNaBase(bases.material, 'material', dados.material)) {
      mensagens.push('Material inválido: não consta na base cadastrada.');
    }

    if (!dados.deposito) mensagens.push('Selecione o depósito.');
    if (!dados.grupoCompras) mensagens.push('Selecione o grupo de compras.');
    if (!dados.frete) mensagens.push('Selecione o frete.');
    if (!dados.quantidade) mensagens.push('Informe a quantidade.');
    if (!dados.valorMaterial) mensagens.push('Informe o valor do material.');

    if (Number(dados.valorMaterial || 0) >= 1500) {
      mensagens.push('Regra: material com valor igual ou superior a R$ 1.500 exige fluxo formal de aprovação.');
    }
  }

  if (dados.tipoRegularizacao === 'servico') {
    if (!dados.destinacaoServico) mensagens.push('Selecione a destinação do serviço.');
    if (!dados.classificacaoContabil) mensagens.push('Selecione a classificação contábil.');
    if (!dados.tipoDistribuicao) mensagens.push('Selecione o tipo de distribuição contábil.');
    if (!dados.descricaoServico) mensagens.push('Informe a descrição do serviço.');
    if (!dados.valorServico) mensagens.push('Informe o valor do serviço.');

    if (Number(dados.valorServico || 0) >= 1500) {
      mensagens.push('Regra: serviço com valor igual ou superior a R$ 1.500 exige fluxo formal de aprovação.');
    }
  }

  const workflow = encontrarCentroCustoSelecionado();

  if (workflow) {
    campos.statusWorkflow.value = 'Pendente';
    campos.etapaAtual.value = 'Aguardando aprovação da Coordenação';
    campos.proximoAprovador.value = valorSeguro(workflow.coordenador);
    campos.tipoGovernanca.value = calcularTipoGovernanca(dados);

    mensagens.push(`Workflow: Coordenação -> ${valorSeguro(workflow.coordenador)}`);
    mensagens.push(`Workflow: Controladoria -> ${valorSeguro(workflow.controladoria)}`);
    mensagens.push(`Workflow: Diretor -> ${valorSeguro(workflow.diretor)}`);
  } else {
    campos.statusWorkflow.value = 'Inconsistente';
    campos.etapaAtual.value = 'Centro de custo não localizado';
    campos.proximoAprovador.value = '';
    campos.tipoGovernanca.value = '';
  }

  if (dados.observacao && dados.observacao.length < 15) {
    mensagens.push('A justificativa está muito curta. Descreva melhor o motivo da regularização.');
  }

  if (mensagens.length === 0) {
    mensagens.push('Formulário validado com sucesso.');
    mensagens.push('Dados coerentes com as bases cadastradas.');
  }

  const politica = textoPoliticaResumo();
  if (politica) mensagens.push('');
  if (politica) mensagens.push(politica);

  return mensagens;
}

function exibirResultado(mensagens) {
  painelResultado.textContent = mensagens.join('\n');
}

function salvarLocalmente() {
  const dados = coletarDados();
  localStorage.setItem('regularizacao_formulario', JSON.stringify(dados));
  alert('Formulário salvo no navegador.');
}

function restaurarLocalmente() {
  const bruto = localStorage.getItem('regularizacao_formulario');
  if (!bruto) return;

  try {
    const dados = JSON.parse(bruto);

    if (dados.tipoRegularizacao) {
      const radio = document.querySelector(`input[name="tipoRegularizacao"][value="${dados.tipoRegularizacao}"]`);
      if (radio) radio.checked = true;
    }

    atualizarBlocos();

    campos.tipoDocumento.value = dados.tipoDocumento || '';
    campos.condicaoPagamento.value = dados.condicaoPagamento || '';
    campos.centro.value = dados.centro || '';
    campos.centroCusto.value = dados.centroCusto || '';
    campos.fornecedor.value = dados.fornecedor || '';
    campos.usuario.value = dados.usuario || '';
    campos.utilizacao.value = dados.utilizacao || '';
    campos.observacao.value = dados.observacao || '';

    campos.material.value = dados.material || '';
    campos.deposito.value = dados.deposito || '';
    campos.grupoCompras.value = dados.grupoCompras || '';
    campos.frete.value = dados.frete || '';
    campos.quantidade.value = dados.quantidade || '';
    campos.valorMaterial.value = dados.valorMaterial || '';

    campos.destinacaoServico.value = dados.destinacaoServico || '';
    campos.classificacaoContabil.value = dados.classificacaoContabil || '';
    campos.tipoDistribuicao.value = dados.tipoDistribuicao || '';
    campos.descricaoServico.value = dados.descricaoServico || '';
    campos.valorServico.value = dados.valorServico || '';

    atualizarAprovadoresPorCentroCusto();
  } catch (erro) {
    console.error('Erro ao restaurar dados', erro);
  }
}

function limparFormulario() {
  document.querySelectorAll('input[name="tipoRegularizacao"]').forEach(r => r.checked = false);
  document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  document.querySelectorAll('input[type="number"], input[type="text"], textarea').forEach(campo => {
    if (campo.id !== 'dataHora') campo.value = '';
  });

  blocoMaterial.classList.add('oculto');
  blocoServico.classList.add('oculto');
  limparAprovadores();
  campos.dataHora.value = formatarDataHora();
  painelResultado.textContent = 'Preencha os campos e clique em Validar.';
}

function exportarJson() {
  const dados = coletarDados();
  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'regularizacao_formulario.json';
  a.click();
  URL.revokeObjectURL(url);
}

function registrarEventos() {
  document.querySelectorAll('input[name="tipoRegularizacao"]').forEach(radio => {
    radio.addEventListener('change', atualizarBlocos);
  });

  campos.centroCusto.addEventListener('change', atualizarAprovadoresPorCentroCusto);

  document.getElementById('btnValidar').addEventListener('click', () => {
    const dados = coletarDados();
    const mensagens = validarFormulario(dados);
    exibirResultado(mensagens);
  });

  document.getElementById('btnSalvar').addEventListener('click', salvarLocalmente);
  document.getElementById('btnLimpar').addEventListener('click', limparFormulario);
  document.getElementById('btnExportar').addEventListener('click', exportarJson);
}

async function iniciar() {
  campos.dataHora.value = formatarDataHora();
  limparAprovadores();
  await carregarBases();
  carregarDropdowns();
  restaurarLocalmente();
  registrarEventos();
}

iniciar();
