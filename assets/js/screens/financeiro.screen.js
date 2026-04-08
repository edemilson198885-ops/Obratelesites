window.OBRAS = window.OBRAS || {};
OBRAS.financeiroScreen = {
  render: function(){
    var m = OBRAS.state.metricas;
    OBRAS.ui.setHTML('screen-container', '\
      <div class="screen-head">\
        <div><h1 class="screen-title">Financeiro</h1><div class="screen-subtitle">Resumo inicial para separar o módulo financeiro da operação.</div></div>\
        <div class="actions-row"><button class="btn" data-go="dashboard">Voltar ao painel</button></div>\
      </div>\
      <div class="kpi-grid">\
        <div class="kpi-card"><div class="kpi-label">Parceiros a pagar</div><div class="kpi-value">' + OBRAS.helpers.money(m.parceirosPagar) + '</div><div class="kpi-note">Compromissos com parceiros</div></div>\
        <div class="kpi-card"><div class="kpi-label">Despesas a vencer</div><div class="kpi-value">' + OBRAS.helpers.money(m.despesasVencer) + '</div><div class="kpi-note">Próximas saídas</div></div>\
        <div class="kpi-card"><div class="kpi-label">Despesas pagas</div><div class="kpi-value">' + OBRAS.helpers.money(m.despesasPagas) + '</div><div class="kpi-note">Baixadas no período</div></div>\
        <div class="kpi-card"><div class="kpi-label">A receber líquido</div><div class="kpi-value">' + OBRAS.helpers.money(m.receberLiquido) + '</div><div class="kpi-note">Projeção líquida</div></div>\
      </div>\
      <div class="empty-card section-space"><h3 class="card-title">Próxima etapa</h3><div class="muted">Na Fase 2, este módulo recebe o motor do seu painel atual: repasses, pagamentos, despesas, fluxo de caixa e sincronização.</div></div>\
    ');
  }
};
