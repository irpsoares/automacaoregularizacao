const resumoSolicitacao = document.getElementById('resumoSolicitacao');
const resultadoTributario = document.getElementById('resultadoTributario');
const resultadoWorkflow = document.getElementById('resultadoWorkflow');
const statusTributario = document.getElementById('statusTributario');
const enquadramentoFiscal = document.getElementById('enquadramentoFiscal');
const dataValidacaoTributaria = document.getElementById('dataValidacaoTributaria');
const tributarioResponsavel = document.getElementById('tributarioResponsavel');
const observacaoTributaria = document.getElementById('observacaoTributaria');
const wfCoordenacao = document.getElementById('wfCoordenacao');
const wfControladoria = document.getElementById('wfControladoria');
const wfDiretor = document.getElementById('wfDiretor');
const statusGovernancaFinal = document.getElementById('statusGovernancaFinal');
const proximaEtapaGovernanca = document.getElementById('proximaEtapaGovernanca');
const responsavelAtualGovernanca = document.getElementById('responsavelAtualGovernanca');
const tipoFluxoGovernanca = document.getElementById('tipoFluxoGovernanca');

let capa = {};
let detalhe = {};

function valorSeguro(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

function carregarDados() {
  capa = JSON.parse(localStorage.getItem('regularizacao_capa') || '{}');
  detalhe = capa.tipoRegularizacao === 'material'
    ? JSON.parse(localStorage.getItem('regularizacao_material') || '{}')
    : JSON.parse(localStorage.getItem('regularizacao_servico') || '{}');
}

function montarResumo() {
  if (!capa.tipoRegularizacao) {
    resumoSolicitacao.textContent = 'Nenhuma solicitação encontrada.';
    return;
  }

  const blocoDetalhe = capa.tipoRegularizacao === 'material'
    ? `Material: ${valorSeguro(detalhe.material)}\nQuantidade: ${valorSeguro(detalhe.quantidade)}\nValor Material: ${valorSeguro(detalhe.valorMaterial)}`
    : `Destinação Serviço: ${valorSeguro(detalhe.destinacaoServico)}\nDescrição Serviço: ${valorSeguro(detalhe.descricaoServico)}\nValor Serviço: ${valorSeguro(detalhe.valorServico)}`;

  resumoSolicitacao.textContent =
`Tipo de Regularização: ${valorSeguro(capa.tipoRegularizacao)}
NF: ${valorSeguro(capa.numeroNf)}
Série: ${valorSeguro(capa.serieNf)}
Valor NF: ${valorSeguro(capa.valorNf)}
Fornecedor: ${valorSeguro(capa.fornecedor)}
Centro: ${valorSeguro(capa.centro)}
Centro de Custo: ${valorSeguro(capa.centroCusto)}
Usuário: ${valorSeguro(capa.usuario)}
Tipo de Governança: ${valorSeguro(capa.tipoGovernanca)}
Próximo Aprovador Inicial: ${valorSeguro(capa.proximoAprovador)}

${blocoDetalhe}`;
}

function montarFluxoVisual() {
  const fluxo = valorSeguro(capa.tipoGovernanca);
  if (fluxo.includes('Head/Diretor')) {
    wfCoordenacao.textContent = 'Etapa substituída por fluxo direto ao Diretor / Head.';
    wfControladoria.textContent = 'Controladoria acompanha como apoio de governança.';
    wfDiretor.textContent = `Aprovação final e prioritária: ${valorSeguro(capa.diretor)} (${valorSeguro(capa.emailDiretor)})`;
    return;
  }
  if (fluxo.includes('Governança reforçada')) {
    wfCoordenacao.textContent = `Coordenação inicia a análise: ${valorSeguro(capa.coordenador)} (${valorSeguro(capa.emailCoordenador)})`;
    wfControladoria.textContent = `Controladoria valida risco / anomalia: ${valorSeguro(capa.controladoria)} (${valorSeguro(capa.emailControladoria)})`;
    wfDiretor.textContent = `Diretor / Head decide a aprovação final: ${valorSeguro(capa.diretor)} (${valorSeguro(capa.emailDiretor)})`;
    return;
  }
  wfCoordenacao.textContent = `Coordenação aprova primeiro: ${valorSeguro(capa.coordenador)} (${valorSeguro(capa.emailCoordenador)})`;
  wfControladoria.textContent = `Controladoria faz validação intermediária: ${valorSeguro(capa.controladoria)} (${valorSeguro(capa.emailControladoria)})`;
  wfDiretor.textContent = `Diretor / Head conclui o fluxo: ${valorSeguro(capa.diretor)} (${valorSeguro(capa.emailDiretor)})`;
}

function validarEtapaTributaria() {
  const mensagens = [];
  if (!statusTributario.value) mensagens.push('Selecione o status tributário.');
  if (!enquadramentoFiscal.value) mensagens.push('Selecione o enquadramento fiscal.');
  if (!dataValidacaoTributaria.value) mensagens.push('Informe a data da validação tributária.');
  if (!tributarioResponsavel.value) mensagens.push('Informe o responsável tributário.');
  if (!observacaoTributaria.value) mensagens.push('Informe a observação tributária.');
  else if (observacaoTributaria.value.trim().length < 15) mensagens.push('A observação tributária deve ter pelo menos 15 caracteres.');
  if (statusTributario.value === 'rejeitado') mensagens.push('Etapa tributária rejeitada. O workflow de aprovação não poderá seguir.');
  if (mensagens.length === 0) mensagens.push('Etapa tributária validada com sucesso.');
  resultadoTributario.textContent = mensagens.join('\n');
  return mensagens.length === 1;
}

function atualizarStatusGovernanca() {
  if (statusTributario.value === 'rejeitado') {
    statusGovernancaFinal.value = 'Bloqueado';
    proximaEtapaGovernanca.value = 'Ajuste tributário';
    responsavelAtualGovernanca.value = valorSeguro(tributarioResponsavel.value);
    tipoFluxoGovernanca.value = valorSeguro(capa.tipoGovernanca);
    resultadoWorkflow.textContent = 'Workflow bloqueado pela validação tributária.';
    return;
  }
  statusGovernancaFinal.value = 'Pendente';
  tipoFluxoGovernanca.value = valorSeguro(capa.tipoGovernanca);
  if (valorSeguro(capa.tipoGovernanca).includes('Head/Diretor')) {
    proximaEtapaGovernanca.value = 'Aprovação do Diretor / Head';
    responsavelAtualGovernanca.value = valorSeguro(capa.diretor);
    return;
  }
  proximaEtapaGovernanca.value = 'Aprovação da Coordenação';
  responsavelAtualGovernanca.value = valorSeguro(capa.coordenador);
}

function salvarWorkflowLocalmente() {
  const payload = {
    statusTributario: valorSeguro(statusTributario.value),
    enquadramentoFiscal: valorSeguro(enquadramentoFiscal.value),
    dataValidacaoTributaria: valorSeguro(dataValidacaoTributaria.value),
    tributarioResponsavel: valorSeguro(tributarioResponsavel.value),
    observacaoTributaria: valorSeguro(observacaoTributaria.value),
    statusGovernancaFinal: valorSeguro(statusGovernancaFinal.value),
    proximaEtapaGovernanca: valorSeguro(proximaEtapaGovernanca.value),
    responsavelAtualGovernanca: valorSeguro(responsavelAtualGovernanca.value),
    tipoFluxoGovernanca: valorSeguro(tipoFluxoGovernanca.value)
  };
  localStorage.setItem('regularizacao_workflow', JSON.stringify(payload));
}

function limparWorkflow() {
  statusTributario.value = '';
  enquadramentoFiscal.value = '';
  dataValidacaoTributaria.value = '';
  tributarioResponsavel.value = '';
  observacaoTributaria.value = '';
  statusGovernancaFinal.value = '';
  proximaEtapaGovernanca.value = '';
  responsavelAtualGovernanca.value = '';
  tipoFluxoGovernanca.value = '';
  resultadoTributario.textContent = 'Preencha e valide a etapa tributária.';
  resultadoWorkflow.textContent = 'A etapa de aprovação será liberada após a validação tributária.';
  localStorage.removeItem('regularizacao_workflow');
}

document.getElementById('btnValidarTributario').addEventListener('click', () => {
  const ok = validarEtapaTributaria();
  if (!ok) return;
  atualizarStatusGovernanca();
  resultadoWorkflow.textContent = `Fluxo pronto para seguir.\nTipo do fluxo: ${valorSeguro(tipoFluxoGovernanca.value)}\nPróxima etapa: ${valorSeguro(proximaEtapaGovernanca.value)}\nResponsável atual: ${valorSeguro(responsavelAtualGovernanca.value)}`;
});

document.getElementById('btnConcluirWorkflow').addEventListener('click', () => {
  const ok = validarEtapaTributaria();
  if (!ok) return;
  atualizarStatusGovernanca();
  salvarWorkflowLocalmente();
  resultadoWorkflow.textContent = `Workflow registrado localmente com sucesso.\nStatus: ${valorSeguro(statusGovernancaFinal.value)}\nPróxima etapa: Painel Final de Aprovação`;
  setTimeout(() => { window.location.href = './aprovacao.html'; }, 500);
});

document.getElementById('btnVoltarWorkflow').addEventListener('click', () => {
  if (capa.tipoRegularizacao === 'material') window.location.href = './material.html';
  else if (capa.tipoRegularizacao === 'servico') window.location.href = './servico.html';
  else window.location.href = './index.html';
});

document.getElementById('btnLimparWorkflow').addEventListener('click', limparWorkflow);

function iniciar() {
  carregarDados();
  montarResumo();
  montarFluxoVisual();
  atualizarStatusGovernanca();
}

iniciar();
