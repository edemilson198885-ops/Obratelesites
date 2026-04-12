window.OBRAS = window.OBRAS || {};
OBRAS.relatoriosScreen = {
  render: function(){
    try {
      var m = OBRAS.rules.painelMetrics(OBRAS.state);
      var obras = m.obras || [];

      var obrasRows = obras.map(function(o){
        return '<tr>'
          + '<td>' + OBRAS.helpers.escape(o.numeroOS) + '</td>'
          + '<td>' + OBRAS.helpers.escape(o.nome) + '</td>'
          + '<td>' + OBRAS.helpers.escape(o.parceiroNome || '-') + '</td>'
          + '<td>' + OBRAS.helpers.escape(o.clienteNome || '-') + '</td>'
          + '<td>' + OBRAS.helpers.money(o.valorObra) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.totalRecebido) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.saldoReceber) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.resultadoLiquido) + '</td>'
          + '</tr>';
      }).join('');

      var parceirosMap = {};
      var clientesMap = {};
      obras.forEach(function(o){
        var pk = o.parceiroNome || '-';
        if (!parceirosMap[pk]) parceirosMap[pk] = { nome: pk, obras: 0, contratado: 0, recebido: 0, aberto: 0 };
        parceirosMap[pk].obras += 1;
        parceirosMap[pk].contratado += Number(o.valorObra || 0);
        parceirosMap[pk].recebido += Number(o.totalRecebido || 0);
        parceirosMap[pk].aberto += Number(o.saldoReceber || 0);

        var ck = o.clienteNome || '-';
        if (!clientesMap[ck]) clientesMap[ck] = { nome: ck, obras: 0, contratado: 0, recebido: 0, aberto: 0 };
        clientesMap[ck].obras += 1;
        clientesMap[ck].contratado += Number(o.valorObra || 0);
        clientesMap[ck].recebido += Number(o.totalRecebido || 0);
        clientesMap[ck].aberto += Number(o.saldoReceber || 0);
      });

      var parceirosRows = Object.keys(parceirosMap).sort().map(function(k){
        var p = parceirosMap[k];
        return '<tr>'
          + '<td>' + OBRAS.helpers.escape(p.nome) + '</td>'
          + '<td>' + p.obras + '</td>'
          + '<td>' + OBRAS.helpers.money(p.contratado) + '</td>'
          + '<td>' + OBRAS.helpers.money(p.recebido) + '</td>'
          + '<td>' + OBRAS.helpers.money(p.aberto) + '</td>'
          + '</tr>';
      }).join('');

      var clientesRows = Object.keys(clientesMap).sort().map(function(k){
        var c = clientesMap[k];
        return '<tr>'
          + '<td>' + OBRAS.helpers.escape(c.nome) + '</td>'
          + '<td>' + c.obras + '</td>'
          + '<td>' + OBRAS.helpers.money(c.contratado) + '</td>'
          + '<td>' + OBRAS.helpers.money(c.recebido) + '</td>'
          + '<td>' + OBRAS.helpers.money(c.aberto) + '</td>'
          + '</tr>';
      }).join('');

      OBRAS.ui.setHTML('screen-container',
        '<div class="screen-head">'
        + '  <div><h1 class="screen-title">Relatórios</h1></div>'
        + '  <div class="actions-row"><button class="btn btn-primary" id="relatorio-export-btn">Exportar TXT</button><button class="btn" data-go="dashboard">Dashboard</button></div>'
        + '</div>'
        + '<div class="kpi-grid compact-kpi-grid">'
        + '  <div class="kpi-card"><div class="kpi-label">Contratado</div><div class="kpi-value">' + OBRAS.helpers.money(m.receitaContratada) + '</div><div class="kpi-note">Total contratado</div></div>'
        + '  <div class="kpi-card"><div class="kpi-label">Recebido</div><div class="kpi-value">' + OBRAS.helpers.money(m.receitaRecebida) + '</div><div class="kpi-note">Entradas confirmadas</div></div>'
        + '  <div class="kpi-card"><div class="kpi-label">A receber</div><div class="kpi-value">' + OBRAS.helpers.money(m.aReceberObras) + '</div><div class="kpi-note">Saldo de cobrança</div></div>'
        + '  <div class="kpi-card"><div class="kpi-label">Caixa projetado</div><div class="kpi-value">' + OBRAS.helpers.money(m.caixaProjetado) + '</div><div class="kpi-note">Leitura consolidada</div></div>'
        + '</div>'
        + '<div class="table-card section-space"><h3 class="card-title">Resumo por obra</h3>'
        + (obrasRows ? '<table class="simple-table"><thead><tr><th>OS</th><th>Obra</th><th>Parceiro</th><th>Cliente</th><th>Contrato</th><th>Recebido</th><th>A receber</th><th>Resultado</th></tr></thead><tbody>' + obrasRows + '</tbody></table>' : '<div class="empty-state">Nenhuma obra encontrada para relatório.</div>')
        + '</div>'
        + '<div class="content-grid section-space">'
        + '  <div class="table-card"><h3 class="card-title">Resumo por parceiro</h3>'
        + (parceirosRows ? '<table class="simple-table"><thead><tr><th>Parceiro</th><th>Obras</th><th>Contratado</th><th>Recebido</th><th>A receber</th></tr></thead><tbody>' + parceirosRows + '</tbody></table>' : '<div class="empty-state">Sem parceiros no relatório.</div>')
        + '  </div>'
        + '  <div class="table-card"><h3 class="card-title">Resumo por cliente</h3>'
        + (clientesRows ? '<table class="simple-table"><thead><tr><th>Cliente</th><th>Obras</th><th>Contratado</th><th>Recebido</th><th>A receber</th></tr></thead><tbody>' + clientesRows + '</tbody></table>' : '<div class="empty-state">Sem clientes no relatório.</div>')
        + '  </div>'
        + '</div>'
      );
    } catch (err) {
      OBRAS.ui.setHTML('screen-container', '<div class="panel"><h2>Erro ao abrir relatórios</h2><div class="muted">' + OBRAS.helpers.escape(err && err.message ? err.message : 'Falha inesperada') + '</div></div>');
      if (window.console) console.error(err);
    }
  }
};
