window.OBRAS = window.OBRAS || {};
OBRAS.obraDetalheScreen = {
  listRows: function(items, empty){
    if (!items.length) return '<div class="empty-state">' + empty + '</div>';
    return '<div class="detail-list">' + items.map(function(item){
      return '<div class="list-item">'
        + '<div><strong>' + OBRAS.helpers.money(item.valor) + '</strong><div class="muted">' + OBRAS.helpers.escape(item.data || '') + (item.observacao ? ' · ' + OBRAS.helpers.escape(item.observacao) : '') + '</div></div>'
        + '<div class="badge badge-info">' + OBRAS.helpers.escape(item.status || item.tipo || 'lançado') + '</div>'
        + '</div>';
    }).join('') + '</div>';
  },

  render: function(){
    var obra = OBRAS.services.getSelectedObra();
    if (!obra) {
      OBRAS.ui.setHTML('screen-container', '<div class="panel"><h2>Nenhuma obra selecionada</h2><div class="muted">Volte para a central de obras e abra uma obra.</div></div>');
      return;
    }

    var metric = OBRAS.rules.obraMetrics(obra, OBRAS.state);
    var recebimentos = (OBRAS.state.recebimentos || []).filter(function(x){ return x.obraId === obra.id; }).sort(function(a,b){ return (b.data||'').localeCompare(a.data||''); });
    var pagamentos = (OBRAS.state.pagamentosParceiros || []).filter(function(x){ return x.obraId === obra.id; }).sort(function(a,b){ return (b.data||'').localeCompare(a.data||''); });
    var despesas = (OBRAS.state.despesas || []).filter(function(x){ return x.obraId === obra.id; }).sort(function(a,b){ return (b.data||'').localeCompare(a.data||''); });

    var html = ''
      + '<div class="screen-head">'
      + '  <div><h1 class="screen-title">Detalhe da obra</h1><div class="screen-subtitle">Resumo completo da obra, com lançamentos e visão financeira por OS.</div></div>'
      + '  <div class="actions-row"><button class="btn" data-go="obras">Voltar para central</button></div>'
      + '</div>'
      + '<div class="detail-hero">'
      + '  <div><div class="muted">OS ' + OBRAS.helpers.escape(obra.numeroOS) + '</div><h2>' + OBRAS.helpers.escape(obra.nome) + '</h2><div class="muted">' + OBRAS.helpers.escape(obra.cidade || '-') + ' · ' + OBRAS.helpers.escape(obra.parceiroNome || '-') + (obra.clienteNome ? ' · ' + OBRAS.helpers.escape(obra.clienteNome) : '') + '</div></div>'
      + '  <div class="detail-badges">' + OBRAS.ui.badge(obra.etapa || '-', 'info') + OBRAS.ui.badge(obra.statusObra || '-', OBRAS.ui.toneByStatus(obra.statusObra || '-')) + '</div>'
      + '</div>'
      + '<div class="kpi-grid">'
      + '  <div class="kpi-card"><div class="kpi-label">Valor da obra</div><div class="kpi-value">' + OBRAS.helpers.money(metric.valorObra) + '</div><div class="kpi-note">Contrato base</div></div>'
      + '  <div class="kpi-card"><div class="kpi-label">Recebido</div><div class="kpi-value">' + OBRAS.helpers.money(metric.totalRecebido) + '</div><div class="kpi-note">Entradas confirmadas</div></div>'
      + '  <div class="kpi-card"><div class="kpi-label">A receber</div><div class="kpi-value">' + OBRAS.helpers.money(metric.saldoReceber) + '</div><div class="kpi-note">Saldo em aberto</div></div>'
      + '  <div class="kpi-card"><div class="kpi-label">Saldo líquido</div><div class="kpi-value">' + OBRAS.helpers.money(metric.resultadoLiquido) + '</div><div class="kpi-note">Recebido - pagamentos - despesas</div></div>'
      + '</div>'
      + '<div class="detail-grid">'
      + '  <div class="table-card"><h3 class="card-title">Recebimentos</h3>'
      + '    <div class="inline-form"><input id="det-rec-valor" placeholder="Valor" /><input id="det-rec-data" type="date" value="' + OBRAS.helpers.todayISO() + '" /><input id="det-rec-obs" placeholder="Observação" /><button class="btn btn-primary" id="det-rec-btn">Lançar</button></div>'
      +       OBRAS.obraDetalheScreen.listRows(recebimentos, 'Nenhum recebimento lançado para esta obra.')
      + '  </div>'
      + '  <div class="table-card"><h3 class="card-title">Pagamentos parceiros</h3>'
      + '    <div class="inline-form"><input id="det-pag-valor" placeholder="Valor" /><input id="det-pag-data" type="date" value="' + OBRAS.helpers.todayISO() + '" /><input id="det-pag-obs" placeholder="Observação" /><button class="btn btn-primary" id="det-pag-btn">Lançar</button></div>'
      +       OBRAS.obraDetalheScreen.listRows(pagamentos, 'Nenhum pagamento parceiro lançado para esta obra.')
      + '  </div>'
      + '</div>'
      + '<div class="content-grid section-space">'
      + '  <div class="table-card"><h3 class="card-title">Despesas da obra</h3>'
      + '    <div class="inline-form"><input id="det-desp-valor" placeholder="Valor" /><input id="det-desp-data" type="date" value="' + OBRAS.helpers.todayISO() + '" /><select id="det-desp-tipo"><option value="obra">Despesa obra</option><option value="mobilizacao">Mobilização</option><option value="material">Material</option><option value="viagem">Viagem</option></select><input id="det-desp-obs" placeholder="Observação" /><button class="btn btn-primary" id="det-desp-btn">Lançar</button></div>'
      +       OBRAS.obraDetalheScreen.listRows(despesas, 'Nenhuma despesa lançada para esta obra.')
      + '  </div>'
      + '  <div class="list-card"><h3 class="card-title">Resumo operacional</h3>'
      + '    <div class="inline-stat"><span class="muted">Parceiro</span><strong>' + OBRAS.helpers.escape(obra.parceiroNome || '-') + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Cliente</span><strong>' + OBRAS.helpers.escape(obra.clienteNome || '-') + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Pagamentos</span><strong>' + OBRAS.helpers.money(metric.pagoParceiros) + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Despesas</span><strong>' + OBRAS.helpers.money(metric.despesasPagas) + '</strong></div>'
      + '    <div class="top-alert">Tela própria da obra com visão rápida da OS.</div>'
      + '  </div>'
      + '</div>';

    OBRAS.ui.setHTML('screen-container', html);
  }
};
