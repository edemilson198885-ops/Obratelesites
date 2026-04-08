window.OBRAS = window.OBRAS || {};
OBRAS.dashboardScreen = {
  render: function(){
    var m = OBRAS.state.metricas;
    var obras = OBRAS.state.obras;
    var avisos = OBRAS.state.avisos;
    var rows = obras.map(function(obra){
      return '<tr><td>' + obra.id + '</td><td>' + obra.nome + '</td><td>' + obra.cidade + '</td><td><span class="badge badge-info">' + obra.etapa + '</span></td><td><span class="badge ' + (obra.status === 'Em andamento' ? 'badge-success' : 'badge-warning') + '">' + obra.status + '</span></td><td>' + OBRAS.helpers.money(obra.valor) + '</td></tr>';
    }).join('');
    var avisoHtml = avisos.map(function(item){
      return '<div class="list-item"><div><strong>' + item.titulo + '</strong><div class="muted">' + item.detalhe + '</div></div><div class="muted">Hoje</div></div>';
    }).join('');
    OBRAS.ui.setHTML('screen-container', '\
      <div class="screen-head">\
        <div>\
          <h1 class="screen-title">Dashboard</h1>\
          <div class="screen-subtitle">Visão geral da operação, com leitura mais limpa e estrutura pronta para a Fase 2.</div>\
        </div>\
        <div class="actions-row">\
          <button class="btn btn-primary" data-go="obras">Ver obras</button>\
          <button class="btn" data-go="financeiro">Abrir financeiro</button>\
        </div>\
      </div>\
      <div class="hero">\
        <h2>Painel financeiro e operacional</h2>\
        <p>Modelo baseado na navegação do MyMoney, porém adaptado para gestão de obras. Nesta fase, a base já abre local pelo index.html e mantém a estrutura em pastas.</p>\
      </div>\
      <div class="kpi-grid">\
        <div class="kpi-card"><div class="kpi-label">Receita contratada</div><div class="kpi-value">' + OBRAS.helpers.money(m.receitaContratada) + '</div><div class="kpi-note">Total previsto em contratos</div></div>\
        <div class="kpi-card"><div class="kpi-label">Receita recebida</div><div class="kpi-value">' + OBRAS.helpers.money(m.receitaRecebida) + '</div><div class="kpi-note">Entradas já confirmadas</div></div>\
        <div class="kpi-card"><div class="kpi-label">A receber</div><div class="kpi-value">' + OBRAS.helpers.money(m.aReceber) + '</div><div class="kpi-note">Cobranças abertas</div></div>\
        <div class="kpi-card"><div class="kpi-label">Saldo de caixa</div><div class="kpi-value">' + OBRAS.helpers.money(m.saldoCaixa) + '</div><div class="kpi-note">Posição atual do caixa</div></div>\
      </div>\
      <div class="content-grid">\
        <div class="table-card">\
          <h3 class="card-title">Obras em destaque</h3>\
          <table class="simple-table">\
            <thead><tr><th>ID</th><th>Obra</th><th>Cidade</th><th>Etapa</th><th>Status</th><th>Valor</th></tr></thead>\
            <tbody>' + rows + '</tbody>\
          </table>\
        </div>\
        <div class="list-card">\
          <h3 class="card-title">Alertas e próximos passos</h3>\
          ' + avisoHtml + '\
        </div>\
      </div>\
    ');
  }
};
