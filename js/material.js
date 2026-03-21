const campoMaterial = document.getElementById('material');
const campoDeposito = document.getElementById('deposito');
const campoGrupoCompras = document.getElementById('grupoCompras');
const campoFrete = document.getElementById('frete');
const campoQuantidade = document.getElementById('quantidade');
const campoValorMaterial = document.getElementById('valorMaterial');
const resultadoMaterial = document.getElementById('resultadoMaterial');
const resumoCapaMaterial = document.getElementById('resumoCapaMaterial');

let baseMaterial = [];
let baseDeposito = [];
let baseGrupoCompras = [];
let baseFrete = [];

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
    resumoCapaMaterial.textContent = 'Nenhum dado da capa encontrado.';
    return;
  }

  resumoCapaMaterial.textContent =
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
  baseMaterial = await carregarJson('./data/material.json');
  baseDeposito = await carregarJson('./data/deposito.json');
  baseGrupoCompras = await carregarJson('./data/grupo_de_compras.json');
  baseFrete = await carregarJson('./data/frete.json');

  preencherSelect(campoMaterial, baseMaterial, {
    value: 'material',
    label: item => `${valorSeguro(item.material)} - ${valorSeguro(item.texto_breve_material)}`
  });

  preencherSelect(campoDeposito, baseDeposito, {
    value: Object.keys(baseDeposito[0] || {})[0] || 'deposito',
    label: item => Object.values(item).filter(v => v !== null && v !== '').join(' - ')
  });

  preencherSelect(campoGrupoCompras, baseGrupoCompras, {
    value: Object.keys(baseGrupoCompras[0] || {})[0] || 'grupo_de_compras',
    label: item => Object.values(item).filter(v => v !== null && v !== '').join(' - ')
  });

  preencherSelect(campoFrete, baseFrete, {
    value: Object.keys(baseFrete[0] || {})[0] || 'frete',
    label: item => Object.values(item).filter(v => v !== null && v !== '').join(' - ')
  });

  carregarResumoCapa();
}

function validarMaterial() {
  const mensagens = [];
  const valor = Number(campoValorMaterial.value || 0);

  if (!campoMaterial.value) mensagens.push('Selecione o material.');
  if (!campoDeposito.value) mensagens.push('Selecione o depósito.');
  if (!campoGrupoCompras.value) mensagens.push('Selecione o grupo de compras.');
  if (!campoFrete.value) mensagens.push('Selecione o frete.');
  if (!campoQuantidade.value) mensagens.push('Informe a quantidade.');
  if (!campoValorMaterial.value) mensagens.push('Informe o valor do material.');

  if (campoQuantidade.value && Number(campoQuantidade.value) <= 0) {
    mensagens.push('A quantidade deve ser maior que zero.');
  }

  if (campoValorMaterial.value) {
    if (Number.isNaN(valor) || valor <= 0) {
      mensagens.push('Valor do material inválido.');
    } else if (valor > 200) {
      mensagens.push('O valor do material não pode ser maior que R$ 200,00.');
    }
  }

  if (mensagens.length === 0) {
    mensagens.push('Dados de material validados com sucesso.');
  }

  resultadoMaterial.textContent = mensagens.join('\n');
  return mensagens.length === 1;
}

document.getElementById('btnValidarMaterial').addEventListener('click', validarMaterial);

document.getElementById('btnSalvarMaterial').addEventListener('click', () => {
  const ok = validarMaterial();
  if (!ok) return;

  const dados = {
    material: campoMaterial.value,
    deposito: campoDeposito.value,
    grupoCompras: campoGrupoCompras.value,
    frete: campoFrete.value,
    quantidade: campoQuantidade.value,
    valorMaterial: campoValorMaterial.value
  };

  localStorage.setItem('regularizacao_material', JSON.stringify(dados));
  resultadoMaterial.textContent = 'Dados de material salvos com sucesso.';
});

document.getElementById('btnVoltar').addEventListener('click', () => {
  window.location.href = './index.html';
});

iniciar();
