window.OBRAS = window.OBRAS || {};
OBRAS.financeiroScreen = {
  buildMovimentos: function(){
    var entradas = (OBRAS.state.recebimentos || []).map(function(r){
      return {
        tipo: 'Recebimento',
        os: r.os || ((OBRAS.state.obras || []).find(function(o){ return o.id === r.obraId; }) || {}).numeroOS || 'GERAL',
        descricao: r.descricao || r.observacao || 'Recebimento',
        data: r.dataRecebimento || r.data || '',
        valor: Number(r.valor || 0),
        status: 'Recebido',
        natureza: 'entrada'
      };
    });

    var pagParceiros = (OBRAS.state.pagamentosParceiros || []).map(function(p){
      return {
        tipo: 'Pagamento parceiro',
        os: p.os || ((OBRAS.state.obras || []).find(function(o){ return o.id === p.obraId; }) || {}).numeroOS || 'GERAL',
        descricao: p.descricao || p.observacao || 'Pagamento parceiro',
        data: p.dataVencimento || p.data || '',
        valor: Number(p.valor || 0),
        status: p.dataPagamentoReal || p.status === 'pago' ? 'Pago' : OBRAS.helpers.statusVencimento(p.dataVencimento || p.data, ''),
        natureza: 'saida'
      };
    });

    var despesasObra = (OBRAS.state.despesas || []).map(function(d){
      return {
        tipo: 'Despesa obra',
        os: d.os || ((OBRAS.state.obras || []).find(function(o){ return o.id === d.obraId; }) || {}).numeroOS || 'GERAL',
        descricao: d.tipoDespesa || d.observacoes || d.observacao || 'Despesa obra',
        data: d.dataVencimento || d.data || '',
        valor: Number(d.valor || 0),
        status: d.dataPagamentoReal || d.status === 'pago' ? 'Pago' : OBRAS.helpers.statusVencimento(d.dataVencimento || d.data, ''),
        natureza: 'saida'
      };
    });

    var despesasGerais = (OBRAS.state.despesasGerais || []).map(function(d){
      return {
        tipo: 'Despesa geral',
        os: 'GERAL',
        descricao: d.tipoDespesa || d.observacoes || 'Despesa geral',
        data: d.dataVencimento || '',
        valor: Number(d.valor || 0),
        status: d.dataPagamentoReal || d.status === 'pago' ? 'Pago' : OBRAS.helpers.statusVencimento(d.dataVencimento, ''),
        natureza: 'saida'
      };
    });

    return entradas.concat(pagParceiros, despesasObra, despesasGerais).sort(function(a,b){
      return String(b.data || '').localeCompare(String(a.data || ''));
    });
  },

  render: function(){
    try {
      var m = OBRAS.rules.painelMetrics(OBRAS.state);
      var filtros = (OBRAS.state.ui && OBRAS.state.ui.financeFilters) || { query:'', tipo:'todos', status:'todos', obra:'' };
      var obrasOpt = (OBRAS.state.obras || []).map(function(o){
        return '<option value="' + OBRAS.helpers.escape(o.numeroOS) + '">' + OBRAS.helpers.escape(o.numeroOS + ' · ' + o.siteTorre) + '</option>';
      }).join('');

      var movimentos = this.buildMovimentos();
      var filtrados = movimentos.filter(function(item){
        var blob = [item.tipo, item.os, item.descricao, item.status].join(' ').toLowerCase();
        var okQuery = !filtros.query || blob.indexOf(String(filtros.query).toLowerCase()) >= 0;
        var okTipo = filtros.tipo === 'todos' || item.tipo === filtros.tipo;
        var okStatus = filtros.status === 'todos' || item.status === filtros.status;
        var okObra = !filtros.obra || item.os === filtros.obra;
        return okQuery && okTipo && okStatus && okObra;
      });

      var contasReceber = m.obras.filter(function(o){ return o.saldoReceber > 0; }).map(function(o){
        return '<div class="list-item"><div><strong>' + OBRAS.helpers.escape(o.numeroOS + ' · ' + o.nome) + '</strong><div class="muted">' + OBRAS.helpers.escape(o.cidade) + ' · ' + OBRAS.helpers.escape(o.statusObra) + '</div></div><div><strong>' + OBRAS.helpers.money(o.saldoReceber) + '</strong></div></div>';
      }).join('');

      var contasPagar = filtrados.filter(function(i){
        return i.natureza === 'saida' && i.status !== 'Pago';
      }).slice(0, 8).map(function(i){
        return '<div class="list-item"><div><strong>' + OBRAS.helpers.escape(i.os) + '</strong><div class="muted">' + OBRAS.helpers.escape(i.descricao) + ' · ' + OBRAS.helpers.escape(i.status) + '</div></div><div><strong>' + OBRAS.helpers.money(i.valor) + '</strong></div></div>';
      }).join('');

      var movRows = filtrados.slice(0, 12).map(function(i){
        return '<tr>'
          + '<td>' + OBRAS.helpers.escape(i.data ? OBRAS.helpers.formatDate(i.data) : '-') + '</td>'
          + '<td>' + OBRAS.helpers.escape(i.os) + '</td>'
          + '<td>' + OBRAS.helpers.escape(i.tipo) + '</td>'
          + '<td>' + OBRAS.helpers.escape(i.descricao) + '</td>'
          + '<td>' + OBRAS.ui.badge(i.status, i.status === 'Pago' || i.status === 'Recebido' ? 'success' : (i.status === 'Atrasado' ? 'danger' : 'warning')) + '</td>'
          + '<td>' + OBRAS.helpers.money(i.valor) + '</td>'
          + '</tr>';
      }).join('');

      var obraRows = m.obras.map(function(o){
        return '<tr>'
          + '<td>' + OBRAS.helpers.escape(o.numeroOS) + '</td>'
          + '<td>' + OBRAS.helpers.escape(o.nome) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.totalRecebido) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.saldoParceiro + o.despesasPendentes) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.resultadoLiquido) + '</td>'
          + '<td><button class="small-btn" data-action="open-obra" data-id="' + o.id + '">Abrir</button></td>'
          + '</tr>';
      }).join('');

      OBRAS.ui.setHTML('screen-container',
        '<div class="screen-head">'
        + '  <div><h1 class="screen-title">Financeiro</h1><div class="screen-subtitle">Fases 5 e 6 juntas: filtros, fluxo de caixa, contas a pagar e leitura consolidada por obra.</div></div>'
        + '  <div class="actions-row"><button class="btn" data-go="dashboard">Voltar ao painel</button></div>'
        + '</div>'
        + '<div class="kpi-grid compact-kpi-grid">'
        + '  <div class="kpi-card"><div class="kpi-label">A receber</div><div class="kpi-value">' + OBRAS.helpers.money(m.aReceberObras) + '</div><div class="kpi-note">Cobranças abertas</div></div>'
        + '  <div class="kpi-card"><div class="kpi-label">A pagar</div><div class="kpi-value">' + OBRAS.helpers.money(m.aPagarPrevisto) + '</div><div class="kpi-note">Parceiros e despesas</div></div>'
        + '  <div class="kpi-card"><div class="kpi-label">Caixa realizado</div><div class="kpi-value">' + OBRAS.helpers.money(m.caixaRealizado) + '</div><div class="kpi-note">Posição atual</div></div>'
        + '  <div class="kpi-card"><div class="kpi-label">Caixa projetado</div><div class="kpi-value">' + OBRAS.helpers.money(m.caixaProjetado) + '</div><div class="kpi-note">Projeção líquida</div></div>'
        + '</div>'
        + '<div class="split-card">'
        + '  <div class="form-card">'
        + '    <h3 class="card-title">Lançamento rápido por obra</h3>'
        + '    <div class="field-grid">'
        + '      <div class="field"><label>OS</label><select id="fin-os"><option value="">Selecione</option>' + obrasOpt + '</select></div>'
        + '      <div class="field"><label>Tipo</label><select id="fin-tipo"><option value="recebimento">Recebimento</option><option value="pagamento">Pagamento parceiro</option><option value="despesa">Despesa da obra</option></select></div>'
        + '      <div class="field"><label>Data</label><input id="fin-data" type="date" value="' + OBRAS.helpers.todayISO() + '" /></div>'
        + '      <div class="field"><label>Valor</label><input id="fin-valor" type="number" step="0.01" /></div>'
        + '      <div class="field" style="grid-column:1/-1"><label>Descrição</label><input id="fin-descricao" /></div>'
        + '    </div>'
        + '    <div class="form-actions"><button class="btn btn-primary" id="fin-submit-btn">Salvar lançamento</button></div>'
        + '  </div>'
        + '  <div class="form-card">'
        + '    <h3 class="card-title">Despesa geral</h3>'
        + '    <div class="field-grid">'
        + '      <div class="field"><label>Tipo</label><input id="geral-tipo" placeholder="Ex: Ferramental" /></div>'
        + '      <div class="field"><label>Valor</label><input id="geral-valor" type="number" step="0.01" /></div>'
        + '      <div class="field"><label>Vencimento</label><input id="geral-vencimento" type="date" value="' + OBRAS.helpers.todayISO() + '" /></div>'
        + '      <div class="field"><label>Marcar como paga</label><div style="padding-top:11px"><input id="geral-paga" type="checkbox" /></div></div>'
        + '      <div class="field" style="grid-column:1/-1"><label>Observações</label><textarea id="geral-obs"></textarea></div>'
        + '    </div>'
        + '    <div class="form-actions"><button class="btn" id="geral-submit-btn">Salvar despesa geral</button></div>'
        + '  </div>'
        + '</div>'
        + '<div class="filter-bar panel">'
        + '  <div class="field"><label>Busca</label><input id="fin-filtro-busca" value="' + OBRAS.helpers.escape(filtros.query || '') + '" placeholder="OS, descrição, tipo..." /></div>'
        + '  <div class="field"><label>Tipo</label><select id="fin-filtro-tipo"><option value="todos">Todos</option><option value="Recebimento" ' + (filtros.tipo === 'Recebimento' ? 'selected' : '') + '>Recebimento</option><option value="Pagamento parceiro" ' + (filtros.tipo === 'Pagamento parceiro' ? 'selected' : '') + '>Pagamento parceiro</option><option value="Despesa obra" ' + (filtros.tipo === 'Despesa obra' ? 'selected' : '') + '>Despesa obra</option><option value="Despesa geral" ' + (filtros.tipo === 'Despesa geral' ? 'selected' : '') + '>Despesa geral</option></select></div>'
        + '  <div class="field"><label>Status</label><select id="fin-filtro-status"><option value="todos">Todos</option><option value="Recebido" ' + (filtros.status === 'Recebido' ? 'selected' : '') + '>Recebido</option><option value="Pago" ' + (filtros.status === 'Pago' ? 'selected' : '') + '>Pago</option><option value="A vencer" ' + (filtros.status === 'A vencer' ? 'selected' : '') + '>A vencer</option><option value="Atrasado" ' + (filtros.status === 'Atrasado' ? 'selected' : '') + '>Atrasado</option><option value="Vence hoje" ' + (filtros.status === 'Vence hoje' ? 'selected' : '') + '>Vence hoje</option></select></div>'
        + '  <div class="field"><label>Obra</label><select id="fin-filtro-obra"><option value="">Todas</option>' + obrasOpt.replace(/<option value="">Selecione<\/option>/,'') + '</select></div>'
        + '  <div class="form-actions align-end"><button class="btn" id="fin-filtro-clear-btn">Limpar filtros</button></div>'
        + '</div>'
        + '<div class="content-grid">'
        + '  <div class="list-card"><h3 class="card-title">Contas a receber</h3>' + (contasReceber || '<div class="empty-state">Nenhuma obra com saldo a receber.</div>') + '</div>'
        + '  <div class="list-card"><h3 class="card-title">Contas a pagar</h3>' + (contasPagar || '<div class="empty-state">Nenhum compromisso em aberto com os filtros atuais.</div>') + '</div>'
        + '</div>'
        + '<div class="table-card section-space"><h3 class="card-title">Fluxo financeiro</h3>' + (movRows ? '<table class="simple-table"><thead><tr><th>Data</th><th>OS</th><th>Tipo</th><th>Descrição</th><th>Status</th><th>Valor</th></tr></thead><tbody>' + movRows + '</tbody></table>' : '<div class="empty-state">Nenhum movimento encontrado.</div>') + '</div>'
        + '<div class="table-card section-space"><h3 class="card-title">Fechamento por obra</h3>' + (obraRows ? '<table class="simple-table"><thead><tr><th>OS</th><th>Obra</th><th>Recebido</th><th>Pendente</th><th>Resultado líquido</th><th>Abrir</th></tr></thead><tbody>' + obraRows + '</tbody></table>' : '<div class="empty-state">Nenhuma obra cadastrada.</div>') + '</div>'
      );
    } catch (err) {
      OBRAS.ui.setHTML('screen-container', '<div class="panel"><h2>Erro ao abrir o financeiro</h2><div class="muted">' + OBRAS.helpers.escape(err && err.message ? err.message : 'Falha inesperada') + '</div></div>');
      if (window.console) console.error(err);
    }
  }
};
