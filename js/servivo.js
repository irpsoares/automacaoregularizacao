const campoDestinacaoServico = document.getElementById('destinacaoServico');
const campoClassificacaoContabil = document.getElementById('classificacaoContabil');
const campoTipoDistribuicao = document.getElementById('tipoDistribuicao');
const campoDescricaoServico = document.getElementById('descricaoServico');
const campoValorServico = document.getElementById('valorServico');
const resultadoServico = document.getElementById('resultadoServico');
const resumoCapaServico = document.getElementById('resumoCapaServico');

let baseDestinacaoServico = [];
let baseClassificacaoContabil = [];
let baseTipoDistribuicao = [];

function valorSeguro(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

async function carregarJson(caminho) {
  const response = await fetch(caminho);
  if (!response.ok) throw new Error(`Erro ao carregar ${caminho}`);
  return await response.json();
}

function preencherSelect(select, dados, config) {
  select.innerHTML = '<option value="">Selecione</option>';

  dados.forEach(item => {
    const option = document.createElement('option');
    option.value = valorSeguro(item[config.value]);
    option.textContent = config.label(item);
    select.appendChild(option);
  });
}

function carregarResumoCapa() {
  const capa = JSON.parse(localStorage.getItem('regularizacao_capa') || '{}');

  if (!capa.tipoRegularizacao) {
    resumoCapaServico.textContent = 'Nenhum dado da capa encontrado.';
    return;
  }

  resumoCapaServico.textContent =
`Tipo: ${valorSeguro(capa.tipoRegularizacao)}
NF: ${valorSeguro(capa.numeroNf)}
Série: ${valorSeguro(capa.serieNf)}
Valor NF: ${valorSeguro(capa.valorNf)}
Fornecedor: ${valorSeguro(capa.fornecedor)}
Centro: ${valorSeguro(capa.centro)}
Centro de Custo: ${valorSeguro(capa.centroCusto)}
Workflow: ${valorSeguro(capa.tipoGovernanca)}
Próximo aprovador: ${valorSeguro(capa.proximoAprovador)}`;
}

async function iniciar() {
  baseDestinacaoServico = await carregarJson('./data/destinacao_servico.json');
  baseClassificacaoContabil = await carregarJson('./data/classificacao_contabil.json');
  baseTipoDistribuicao = await carregarJson('./data/tipo_de_distribuicao_contabil.json');

  preencherSelect(campoDestinacaoServico, baseDestinacaoServico, {
    value: 'tipos_servicos',
    label: item => valorSeguro(item.tipos_servicos)
  });

  preencherSelect(campoClassificacaoContabil, baseClassificacaoContabil, {
    value: 'codigo',
    label: item => `${valorSeguro(item.codigo)} - ${valorSeguro(item.descricao_classificacao_contabil)}`
  });

  preencherSelect(campoTipoDistribuicao, baseTipoDistribuicao, {
    value: 'tipo_distribuicao_contabil',
    label: item => valorSeguro(item.tipo_distribuicao_contabil)
  });

  carregarResumoCapa();
}

function validarServico() {
  const mensagens = [];
  const valor = Number(campoValorServico.value || 0);

  if (!campoDestinacaoServico.value) mensagens.push('Selecione a destinação do serviço.');
  if (!campoClassificacaoContabil.value) mensagens.push('Selecione a classificação contábil.');
  if (!campoTipoDistribuicao.value) mensagens.push('Selecione o tipo de distribuição contábil.');
  if (!campoDescricaoServico.value) mensagens.push('Informe a descrição do serviço.');
  if (!campoValorServico.value) mensagens.push('Informe o valor do serviço.');

  if (campoDescricaoServico.value && campoDescricaoServico.value.trim().length < 10) {
    mensagens.push('A descrição do serviço deve ter pelo menos 10 caracteres.');
  }

  if (campoValorServico.value) {
    if (Number.isNaN(valor) || valor <= 0) {
      mensagens.push('Valor do serviço inválido.');
    } else if (valor > 200) {
      mensagens.push('O valor do serviço não pode ser maior que R$ 200,00.');
    }
  }

  if (mensagens.length === 0) {
    mensagens.push('Dados de serviço validados com sucesso.');
  }

  resultadoServico.textContent = mensagens.join('\n');
  return mensagens.length === 1;
}

document.getElementById('btnValidarServico').addEventListener('click', validarServico);

document.getElementById('btnSalvarServico').addEventListener('click', () => {
  const ok = validarServico();
  if (!ok) return;

  const dados = {
    destinacaoServico: campoDestinacaoServico.value,
    classificacaoContabil: campoClassificacaoContabil.value,
    tipoDistribuicao: campoTipoDistribuicao.value,
    descricaoServico: campoDescricaoServico.value,
    valorServico: campoValorServico.value
  };

  localStorage.setItem('regularizacao_servico', JSON.stringify(dados));
  resultadoServico.textContent = 'Dados de serviço salvos com sucesso.';
});

document.getElementById('btnVoltar').addEventListener('click', () => {
  window.location.href = './index.html';
});

iniciar();
