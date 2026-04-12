window.OBRAS = window.OBRAS || {};
OBRAS.dashboardScreen = {
  donutSVG: function(values){
    var total = values.reduce(function(s, v){ return s + (Number(v) || 0); }, 0);
    if (!total) return '<div class="mini-chart-empty">Sem dados suficientes para o gráfico.</div>';

    var colors = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444'];
    var r = 42;
    var c = 2 * Math.PI * r;
    var offset = 0;

    var parts = values.map(function(v, i){
      var pct = (Number(v) || 0) / total;
      var dash = (pct * c).toFixed(2) + ' ' + (c - pct * c).toFixed(2);
      var html = '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="' + colors[i] + '" stroke-width="16" stroke-dasharray="' + dash + '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 60 60)"></circle>';
      offset += pct * c;
      return html;
    }).join('');

    return ''
      + '<svg viewBox="0 0 120 120" class="mini-chart-svg" aria-label="Distribuição financeira">'
      + '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#e5e7eb" stroke-width="16"></circle>'
      + parts
      + '<circle cx="60" cy="60" r="24" fill="white"></circle>'
      + '<text x="60" y="56" text-anchor="middle" class="mini-chart-center-label">Total</text>'
      + '<text x="60" y="72" text-anchor="middle" class="mini-chart-center-value">' + OBRAS.helpers.money(total).replace('R$ ', '') + '</text>'
      + '</svg>';
  },

  render: function(){
    try {
      var db = OBRAS.stateApi.normalizeDB ? OBRAS.stateApi.normalizeDB(OBRAS.state) : OBRAS.state;

      if (!OBRAS.rules || !OBRAS.rules.painelMetrics || !OBRAS.rules.avisos) {
        OBRAS.ui.setHTML('screen-container',
          '<div class="panel"><h2>Erro ao montar o dashboard</h2><div class="muted">As regras financeiras não foram carregadas corretamente.</div></div>'
        );
        return;
      }

      var m = OBRAS.rules.painelMetrics(db);
      var avisos = OBRAS.rules.avisos(db, m);

      var rows = m.obras.slice(0, 5).map(function(obra){
        return '<tr class="click-row" data-action="open-obra" data-id="' + obra.id + '">'
          + '<td>' + OBRAS.helpers.escape(obra.numeroOS) + '</td>'
          + '<td>' + OBRAS.helpers.escape(obra.nome) + '</td>'
          + '<td>' + OBRAS.helpers.escape(obra.cidade) + '</td>'
          + '<td>' + OBRAS.ui.badge(obra.etapa || "-", "info") + '</td>'
          + '<td>' + OBRAS.ui.badge(obra.statusObra || "-", OBRAS.ui.toneByStatus(obra.statusObra || "-")) + '</td>'
          + '<td>' + OBRAS.helpers.money(obra.valorObra) + '</td>'
          + '</tr>';
      }).join('');

      var avisoHtml = avisos.map(function(item){
        return '<div class="list-item"><div><strong>' + OBRAS.helpers.escape(item.titulo) + '</strong><div class="muted">' + OBRAS.helpers.escape(item.detalhe) + '</div></div><div class="muted">Hoje</div></div>';
      }).join('');

      var smallStats = ''
        + '<div class="mini-stat"><span class="muted">Parceiros a pagar</span><strong>' + OBRAS.helpers.money(m.saldoParceirosAPagar) + '</strong></div>'
        + '<div class="mini-stat"><span class="muted">Despesas pagas</span><strong>' + OBRAS.helpers.money(m.despesasPagas) + '</strong></div>'
        + '<div class="mini-stat"><span class="muted">Despesas a vencer</span><strong>' + OBRAS.helpers.money(m.despesasAVencer) + '</strong></div>'
        + '<div class="mini-stat"><span class="muted">A receber líquido</span><strong>' + OBRAS.helpers.money(m.caixaProjetado) + '</strong></div>';

      var chartLegend = ''
        + '<div class="legend-item"><span class="legend-dot legend-blue"></span>Recebido</div>'
        + '<div class="legend-item"><span class="legend-dot legend-green"></span>A receber</div>'
        + '<div class="legend-item"><span class="legend-dot legend-amber"></span>A pagar</div>'
        + '<div class="legend-item"><span class="legend-dot legend-red"></span>Despesa a vencer</div>';

      var html = ''
        + '<div class="screen-head">'
        + '  <div><h1 class="screen-title">Dashboard</h1></div>'
        + '  <div class="actions-row"><button class="btn btn-primary" data-go="obras">Obras</button><button class="btn" data-go="financeiro">Financeiro</button></div>'
        + '</div>'
                + '<div class="kpi-grid">'
        + '  <button class="kpi-card kpi-click" data-go="financeiro"><div class="kpi-label">Contratado</div><div class="kpi-value">' + OBRAS.helpers.money(m.receitaContratada) + '</div><div class="kpi-note"> </div></button>'
        + '  <button class="kpi-card kpi-click" data-go="financeiro"><div class="kpi-label">Recebido</div><div class="kpi-value">' + OBRAS.helpers.money(m.receitaRecebida) + '</div><div class="kpi-note"> </div></button>'
        + '  <button class="kpi-card kpi-click" data-go="obras"><div class="kpi-label">A receber</div><div class="kpi-value">' + OBRAS.helpers.money(m.aReceberObras) + '</div><div class="kpi-note"> </div></button>'
        + '  <button class="kpi-card kpi-click" data-go="financeiro"><div class="kpi-label">Caixa</div><div class="kpi-value">' + OBRAS.helpers.money(m.caixaRealizado) + '</div><div class="kpi-note"> </div></button>'
        + '</div>'
        + '<div class="content-grid">'
        + '  <div class="table-card">'
        + '    <h3 class="card-title">Obras em destaque</h3>'
        +      (m.obras.length
                  ? '<table class="simple-table"><thead><tr><th>ID</th><th>Obra</th><th>Cidade</th><th>Etapa</th><th>Status</th><th>Valor</th></tr></thead><tbody>' + rows + '</tbody></table>'
                  : '<div class="empty-state">Nenhuma obra cadastrada ainda.</div>')
        + '  </div>'
        + '  <div class="list-card"><h3 class="card-title">Alertas</h3>' + avisoHtml + '</div>'
        + '</div>'
        + '<div class="clean-bottom-grid">'
        + '  <div class="table-card"><h3 class="card-title">Resumo financeiro</h3><div class="mini-stats-grid">' + smallStats + '</div></div>'
        + '  <div class="list-card"><h3 class="card-title">Distribuição</h3><div class="mini-chart-wrap">' + OBRAS.dashboardScreen.donutSVG([m.receitaRecebida, m.aReceberObras, m.saldoParceirosAPagar, m.despesasAVencer]) + '<div class="mini-chart-legend">' + chartLegend + '</div></div></div>'
        + '</div>';

      OBRAS.ui.setHTML('screen-container', html);
    } catch (err) {
      OBRAS.ui.setHTML('screen-container',
        '<div class="panel"><h2>Erro ao montar o dashboard</h2><div class="muted">' + OBRAS.helpers.escape(err && err.message ? err.message : 'Falha inesperada') + '</div></div>'
      );
      if (window.console) console.error(err);
    }
  }
};
