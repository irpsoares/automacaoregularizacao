const campos = {
  tipoDocumento: document.getElementById('tipoDocumento'),
  condicaoPagamento: document.getElementById('condicaoPagamento'),
  centro: document.getElementById('centro'),
  centroCusto: document.getElementById('centroCusto'),
  fornecedor: document.getElementById('fornecedor'),
  deposito: document.getElementById('deposito'),
  grupoCompras: document.getElementById('grupoCompras'),
  frete: document.getElementById('frete'),
  material: document.getElementById('material'),
  classificacaoContabil: document.getElementById('classificacaoContabil'),
  destinacaoServico: document.getElementById('destinacaoServico'),
  tipoDistribuicao: document.getElementById('tipoDistribuicao'),
  utilizacao: document.getElementById('utilizacao'),
  usuario: document.getElementById('usuario'),
  dataHora: document.getElementById('dataHora'),
  observacao: document.getElementById('observacao'),
  descricaoServico: document.getElementById('descricaoServico'),
  quantidade: document.getElementById('quantidade'),
  valorMaterial: document.getElementById('valorMaterial'),
  valorServico: document.getElementById('valorServico')
};

const formMaterial = document.getElementById('blocoMaterial');
const formServico = document.getElementById('blocoServico');
const painelResultado = document.getElementById('painelResultado');

const mapaArquivos = {
  tipoDocumento: './politica.json',
  condicaoPagamento: './condicao_pagamento.json',
  centro: './centro.json',
  centroCusto: './centro_de_custo.json',
  fornecedor: './fornecedor.json',
  deposito: './deposito.json',
  grupoCompras: './grupo_de_compras.json',
  frete: './frete.json',
  material: './material.json',
  classificacaoContabil: './classificacao_contabil.json',
  destinacaoServico: './destinacao_servico.json',
  tipoDistribuicao: './tipo_de_distribuicao_contabil.json',
  utilizacao: './utilizacao.json',
  usuario: './usuario.json'
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

function normalizarTexto(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

function extrairValorLabel(item) {
  if (typeof item === 'string' || typeof item === 'number') {
    const texto = normalizarTexto(item);
    return { value: texto, label: texto };
  }

  if (!item || typeof item !== 'object') {
    return { value: '', label: '' };
  }

  if ('value' in item || 'label' in item) {
    return {
      value: normalizarTexto(item.value),
      label: normalizarTexto(item.label || item.value)
    };
  }

  const entries = Object.entries(item)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '');

  if (entries.length === 0) {
    return { value: '', label: '' };
  }

  if (entries.length === 1) {
    const unico = normalizarTexto(entries[0][1]);
    return { value: unico, label: unico };
  }

  const value = normalizarTexto(entries[0][1]);
  const resto = entries.slice(1).map(([, v]) => normalizarTexto(v)).filter(Boolean);
  const label = resto.length ? resto.join(' - ') : value;

  return { value, label };
}

function preencherSelect(select, dados, placeholder = 'Selecione') {
  select.innerHTML = `<option value="">${placeholder}</option>`;

  if (!Array.isArray(dados)) return;

  dados.forEach(item => {
    const { value, label } = extrairValorLabel(item);
    if (!value && !label) return;

    const option = document.createElement('option');
    option.value = value || label;
    option.textContent = label || value;
    select.appendChild(option);
  });
}

async function carregarJson(caminho) {
  const response = await fetch(caminho);
  if (!response.ok) {
    throw new Error(`Falha ao carregar: ${caminho}`);
  }
  return await response.json();
}

async function carregarListas() {
  for (const [campo, caminho] of Object.entries(mapaArquivos)) {
    try {
      const dados = await carregarJson(caminho);
      preencherSelect(campos[campo], dados);
    } catch (erro) {
      console.error(erro);
      preencherSelect(campos[campo], [], 'Erro ao carregar');
    }
  }
}

function atualizarBlocos() {
  const tipo = obterTipoSelecionado();

  formMaterial.classList.add('oculto');
  formServico.classList.add('oculto');

  if (tipo === 'material') {
    formMaterial.classList.remove('oculto');
  }

  if (tipo === 'servico') {
    formServico.classList.remove('oculto');
  }
}

function coletarDados() {
  return {
    tipoRegularizacao: obterTipoSelecionado(),
    tipoDocumento: campos.tipoDocumento.value,
    condicaoPagamento: campos.condicaoPagamento.value,
    centro: campos.centro.value,
    centroCusto: campos.centroCusto.value,
    fornecedor: campos.fornecedor.value,
    deposito: campos.deposito.value,
    grupoCompras: campos.grupoCompras.value,
    frete: campos.frete.value,
    material: campos.material.value,
    classificacaoContabil: campos.classificacaoContabil.value,
    destinacaoServico: campos.destinacaoServico.value,
    tipoDistribuicao: campos.tipoDistribuicao.value,
    utilizacao: campos.utilizacao.value,
    usuario: campos.usuario.value,
    dataHora: campos.dataHora.value,
    observacao: campos.observacao.value,
    descricaoServico: campos.descricaoServico.value,
    quantidade: campos.quantidade.value,
    valorMaterial: campos.valorMaterial.value,
    valorServico: campos.valorServico.value
  };
}

function validarRegras(dados) {
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

  if (!dados.centroCusto) {
    mensagens.push('Selecione o centro de custo.');
  }

  if (dados.tipoRegularizacao === 'material') {
    if (!dados.material) mensagens.push('Selecione o material.');
    if (!dados.quantidade) mensagens.push('Informe a quantidade.');
    if (!dados.valorMaterial) mensagens.push('Informe o valor do material.');

    if (Number(dados.valorMaterial || 0) >= 1500) {
      mensagens.push('Regra: valor igual ou superior a R$ 1.500 exige fluxo de regularização com acompanhamento.');
    }
  }

  if (dados.tipoRegularizacao === 'servico') {
    if (!dados.descricaoServico) mensagens.push('Informe a descrição do serviço.');
    if (!dados.valorServico) mensagens.push('Informe o valor do serviço.');
    if (!dados.destinacaoServico) mensagens.push('Selecione a destinação do serviço.');

    if (Number(dados.valorServico || 0) >= 1500) {
      mensagens.push('Regra: serviço com valor igual ou superior a R$ 1.500 deve seguir validação antes do lançamento.');
    }
  }

  if (mensagens.length === 0) {
    mensagens.push('Formulário validado com sucesso.');
    mensagens.push('Pronto para a próxima etapa do fluxo.');
  }

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
    campos.deposito.value = dados.deposito || '';
    campos.grupoCompras.value = dados.grupoCompras || '';
    campos.frete.value = dados.frete || '';
    campos.material.value = dados.material || '';
    campos.classificacaoContabil.value = dados.classificacaoContabil || '';
    campos.destinacaoServico.value = dados.destinacaoServico || '';
    campos.tipoDistribuicao.value = dados.tipoDistribuicao || '';
    campos.utilizacao.value = dados.utilizacao || '';
    campos.usuario.value = dados.usuario || '';
    campos.observacao.value = dados.observacao || '';
    campos.descricaoServico.value = dados.descricaoServico || '';
    campos.quantidade.value = dados.quantidade || '';
    campos.valorMaterial.value = dados.valorMaterial || '';
    campos.valorServico.value = dados.valorServico || '';
  } catch (erro) {
    console.error('Erro ao restaurar dados:', erro);
  }
}

function limparFormulario() {
  document.querySelectorAll('input[name="tipoRegularizacao"]').forEach(r => r.checked = false);
  document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  document.querySelectorAll('input[type="number"], input[type="text"], textarea').forEach(campo => {
    if (campo.id !== 'dataHora') campo.value = '';
  });

  formMaterial.classList.add('oculto');
  formServico.classList.add('oculto');
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

  document.getElementById('btnValidar').addEventListener('click', () => {
    const dados = coletarDados();
    const mensagens = validarRegras(dados);
    exibirResultado(mensagens);
  });

  document.getElementById('btnSalvar').addEventListener('click', salvarLocalmente);
  document.getElementById('btnLimpar').addEventListener('click', limparFormulario);
  document.getElementById('btnExportar').addEventListener('click', exportarJson);
}

async function iniciar() {
  campos.dataHora.value = formatarDataHora();
  await carregarListas();
  restaurarLocalmente();
  registrarEventos();
}

iniciar();
