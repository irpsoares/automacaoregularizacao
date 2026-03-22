const statusSolicitacao = document.getElementById('statusSolicitacao');
const statusTributarioResumo = document.getElementById('statusTributarioResumo');
const tipoGovernancaResumo = document.getElementById('tipoGovernancaResumo');
const responsavelAtualResumo = document.getElementById('responsavelAtualResumo');
const resumoCapaFinal = document.getElementById('resumoCapaFinal');
const resumoDetalheFinal = document.getElementById('resumoDetalheFinal');
const aprovacaoTributaria = document.getElementById('aprovacaoTributaria');
const aprovacaoCoordenacao = document.getElementById('aprovacaoCoordenacao');
const aprovacaoControladoria = document.getElementById('aprovacaoControladoria');
const aprovacaoDiretor = document.getElementById('aprovacaoDiretor');
const decisaoFinal = document.getElementById('decisaoFinal');
const responsavelDecisao = document.getElementById('responsavelDecisao');
const dataDecisao = document.getElementById('dataDecisao');
const observacaoFinal = document.getElementById('observacaoFinal');
const resultadoAprovacaoFinal = document.getElementById('resultadoAprovacaoFinal');

let capa = {};
let detalhe = {};
let workflow = {};

function valorSeguro(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
}

function carregarDados() {
  capa = JSON.parse(localStorage.getItem('regularizacao_capa') || '{}');
  workflow = JSON.parse(localStorage.getItem('regularizacao_workflow') || '{}');
  detalhe = capa.tipoRegularizacao === 'material'
    ? JSON.parse(localStorage.getItem('regularizacao_material') || '{}')
    : JSON.parse(localStorage.getItem('regularizacao_servico') || '{}');
}

function montarStatusGeral() {
  statusSolicitacao.textContent = valorSeguro(workflow.statusGovernancaFinal) || 'Pendente';
  statusTributarioResumo.textContent = valorSeguro(workflow.statusTributario) || 'Não informado';
  tipoGovernancaResumo.textContent = valorSeguro(workflow.tipoFluxoGovernanca || capa.tipoGovernanca) || 'Não informado';
  responsavelAtualResumo.textContent = valorSeguro(workflow.responsavelAtualGovernanca || capa.proximoAprovador) || 'Não informado';
}

function montarResumoCapa() {
  resumoCapaFinal.textContent =
`Tipo de Regularização: ${valorSeguro(capa.tipoRegularizacao)}
NF: ${valorSeguro(capa.numeroNf)}
Série: ${valorSeguro(capa.serieNf)}
Data NF: ${valorSeguro(capa.dataNf)}
Valor NF: ${valorSeguro(capa.valorNf)}
Fornecedor: ${valorSeguro(capa.fornecedor)}
Centro: ${valorSeguro(capa.centro)}
Centro de Custo: ${valorSeguro(capa.centroCusto)}
Usuário: ${valorSeguro(capa.usuario)}
Utilização: ${valorSeguro(capa.utilizacao)}
Justificativa: ${valorSeguro(capa.observacao)}`;
}

function montarResumoDetalhe() {
  if (capa.tipoRegularizacao === 'material') {
    resumoDetalheFinal.textContent =
`Material: ${valorSeguro(detalhe.material)}
Depósito: ${valorSeguro(detalhe.deposito)}
Grupo de Compras: ${valorSeguro(detalhe.grupoCompras)}
Frete: ${valorSeguro(detalhe.frete)}
Quantidade: ${valorSeguro(detalhe.quantidade)}
Valor Material: ${valorSeguro(detalhe.valorMaterial)}`;
    return;
  }
  resumoDetalheFinal.textContent =
`Destinação Serviço: ${valorSeguro(detalhe.destinacaoServico)}
Classificação Contábil: ${valorSeguro(detalhe.classificacaoContabil)}
Tipo de Distribuição: ${valorSeguro(detalhe.tipoDistribuicao)}
Descrição do Serviço: ${valorSeguro(detalhe.descricaoServico)}
Valor Serviço: ${valorSeguro(detalhe.valorServico)}`;
}

function montarTrilha() {
  aprovacaoTributaria.textContent = `Status: ${valorSeguro(workflow.statusTributario)} | Enquadramento: ${valorSeguro(workflow.enquadramentoFiscal)} | Responsável: ${valorSeguro(workflow.tributarioResponsavel)}`;
  const fluxo = valorSeguro(workflow.tipoFluxoGovernanca || capa.tipoGovernanca);

  if (fluxo.includes('Head/Diretor')) {
    aprovacaoCoordenacao.textContent = 'Etapa substituída por aprovação direta do Diretor / Head.';
    aprovacaoControladoria.textContent = 'Controladoria acompanha a governança e riscos.';
    aprovacaoDiretor.textContent = `Aprovação prioritária do Diretor / Head: ${valorSeguro(capa.diretor)}`;
    return;
  }

  if (fluxo.includes('Governança reforçada')) {
    aprovacaoCoordenacao.textContent = `Coordenação inicia a análise: ${valorSeguro(capa.coordenador)}`;
    aprovacaoControladoria.textContent = `Controladoria reforça a avaliação: ${valorSeguro(capa.controladoria)}`;
    aprovacaoDiretor.textContent = `Diretor / Head conclui a decisão: ${valorSeguro(capa.diretor)}`;
    return;
  }

  aprovacaoCoordenacao.textContent = `Primeira aprovação: ${valorSeguro(capa.coordenador)}`;
  aprovacaoControladoria.textContent = `Validação intermediária: ${valorSeguro(capa.controladoria)}`;
  aprovacaoDiretor.textContent = `Aprovação final: ${valorSeguro(capa.diretor)}`;
}

function validarDecisaoFinal() {
  const mensagens = [];
  if (!decisaoFinal.value) mensagens.push('Selecione a decisão final.');
  if (!responsavelDecisao.value) mensagens.push('Informe o responsável pela decisão.');
  if (!dataDecisao.value) mensagens.push('Informe a data da decisão.');
  if (!observacaoFinal.value) mensagens.push('Informe a observação final.');
  else if (observacaoFinal.value.trim().length < 15) mensagens.push('A observação final deve ter pelo menos 15 caracteres.');
  if (mensagens.length === 0) mensagens.push('Decisão final validada com sucesso.');
  resultadoAprovacaoFinal.textContent = mensagens.join('\n');
  return mensagens.length === 1;
}

function atualizarStatusVisualDecisao() {
  const valor = decisaoFinal.value;
  statusSolicitacao.parentElement.classList.remove('status-pendente','status-analise','status-info','status-aprovado','status-rejeitado');

  if (valor === 'aprovado') {
    statusSolicitacao.parentElement.classList.add('status-aprovado');
    statusSolicitacao.textContent = 'Aprovado';
    return;
  }
  if (valor === 'rejeitado') {
    statusSolicitacao.parentElement.classList.add('status-rejeitado');
    statusSolicitacao.textContent = 'Rejeitado';
    return;
  }
  if (valor === 'ajuste') {
    statusSolicitacao.parentElement.classList.add('status-analise');
    statusSolicitacao.textContent = 'Necessita Ajuste';
    return;
  }
  statusSolicitacao.parentElement.classList.add('status-pendente');
  statusSolicitacao.textContent = 'Pendente';
}

function salvarPainelFinal() {
  const payload = {
    decisaoFinal: valorSeguro(decisaoFinal.value),
    responsavelDecisao: valorSeguro(responsavelDecisao.value),
    dataDecisao: valorSeguro(dataDecisao.value),
    observacaoFinal: valorSeguro(observacaoFinal.value)
  };
  localStorage.setItem('regularizacao_aprovacao_final', JSON.stringify(payload));
}

function limparPainelFinal() {
  decisaoFinal.value = '';
  responsavelDecisao.value = '';
  dataDecisao.value = '';
  observacaoFinal.value = '';
  resultadoAprovacaoFinal.textContent = 'Preencha a decisão final para concluir a apresentação da governança.';
}

document.getElementById('btnValidarDecisao').addEventListener('click', () => {
  const ok = validarDecisaoFinal();
  if (!ok) return;
  atualizarStatusVisualDecisao();
});

document.getElementById('btnSalvarDecisao').addEventListener('click', () => {
  const ok = validarDecisaoFinal();
  if (!ok) return;
  atualizarStatusVisualDecisao();
  salvarPainelFinal();
  resultadoAprovacaoFinal.textContent = `Painel final salvo com sucesso.\nDecisão: ${valorSeguro(decisaoFinal.value)}\nResponsável: ${valorSeguro(responsavelDecisao.value)}`;
});

document.getElementById('btnVoltarAprovacao').addEventListener('click', () => {
  window.location.href = './workflow.html';
});

document.getElementById('btnLimparAprovacao').addEventListener('click', limparPainelFinal);

function iniciar() {
  carregarDados();
  montarStatusGeral();
  montarResumoCapa();
  montarResumoDetalhe();
  montarTrilha();
}

iniciar();
