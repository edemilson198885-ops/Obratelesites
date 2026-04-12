window.OBRAS = window.OBRAS || {};
OBRAS.financeiroScreen = {
  buildMovimentos: function(){
    var entradas = (OBRAS.state.recebimentos || []).map(function(r){
      return {
        entryId: r.id,
        sourceKey: 'recebimentos',
        tipo: 'Recebimento',
        os: r.os || ((OBRAS.state.obras || []).find(function(o){ return o.id === r.obraId; }) || {}).numeroOS || 'GERAL',
        descricao: r.descricao || r.observacao || 'Recebimento',
        data: r.dataRecebimento || r.data || '',
        valor: Number(r.valor || 0),
        status: 'Recebido',
        natureza: 'entrada',
        canPay: false,
        canDelete: true
      };
    });

    var pagParceiros = (OBRAS.state.pagamentosParceiros || []).map(function(p){
      var pago = !!(p.dataPagamentoReal || p.status === 'pago');
      return {
        entryId: p.id,
        sourceKey: 'pagamentosParceiros',
        tipo: 'Pagamento parceiro',
        os: p.os || ((OBRAS.state.obras || []).find(function(o){ return o.id === p.obraId; }) || {}).numeroOS || 'GERAL',
        descricao: p.descricao || p.observacao || 'Pagamento parceiro',
        data: p.dataVencimento || p.data || '',
        valor: Number(p.valor || 0),
        status: pago ? 'Pago' : OBRAS.helpers.statusVencimento(p.dataVencimento || p.data, ''),
        natureza: 'saida',
        canPay: !pago,
        canDelete: true
      };
    });

    var despesasObra = (OBRAS.state.despesas || []).map(function(d){
      var pago = !!(d.dataPagamentoReal || d.status === 'pago');
      var autoNf = d.origemLancamento === 'automatico_obra_nf' || d.geradaAutomaticamente === true;
      return {
        entryId: d.id,
        sourceKey: 'despesas',
        tipo: 'Despesa obra',
        os: d.os || ((OBRAS.state.obras || []).find(function(o){ return o.id === d.obraId; }) || {}).numeroOS || 'GERAL',
        descricao: d.tipoDespesa || d.observacoes || d.observacao || 'Despesa obra',
        data: d.dataVencimento || d.dataDespesa || d.data || '',
        valor: Number(d.valor || 0),
        status: pago ? 'Pago' : OBRAS.helpers.statusVencimento(d.dataVencimento || d.dataDespesa || d.data, ''),
        natureza: 'saida',
        canPay: !pago,
        canDelete: !autoNf,
        autoNf: autoNf
      };
    });

    var despesasGerais = (OBRAS.state.despesasGerais || []).map(function(d){
      var pago = !!(d.dataPagamentoReal || d.status === 'pago');
      return {
        entryId: d.id,
        sourceKey: 'despesasGerais',
        tipo: 'Despesa geral',
        os: 'GERAL',
        descricao: d.tipoDespesa || d.descricao || d.observacoes || 'Despesa geral',
        data: d.dataVencimento || d.data || '',
        valor: Number(d.valor || 0),
        status: pago ? 'Pago' : OBRAS.helpers.statusVencimento(d.dataVencimento || d.data, ''),
        natureza: 'saida',
        canPay: !pago,
        canDelete: true
      };
    });

    return entradas.concat(pagParceiros, despesasObra, despesasGerais).sort(function(a,b){
      return String(b.data || '').localeCompare(String(a.data || ''));
    });
  },

  actionButtons: function(item){
    var html = '<div class="table-actions actions-inline">'
      + '<button class="small-btn btn-soft" data-action="edit-finance-entry" data-kind="' + item.sourceKey + '" data-id="' + item.entryId + '">Editar</button>';
    if (item.canPay) {
      html += '<button class="small-btn btn-primary-lite" data-action="pay-finance-entry" data-kind="' + item.sourceKey + '" data-id="' + item.entryId + '">Pagar</button>';
    }
    if (item.canDelete) {
      html += '<button class="small-btn btn-danger" data-action="delete-finance-entry" data-kind="' + item.sourceKey + '" data-id="' + item.entryId + '">Excluir</button>';
    }
    html += '</div>';
    return html;
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
        var overdueClass = i.status === 'Atrasado' ? ' overdue-item' : '';
        var statusClass = i.status === 'Atrasado' ? ' status-overdue' : '';
        return '<div class="list-item' + overdueClass + '"><div><strong>' + OBRAS.helpers.escape(i.os) + '</strong><div class="muted' + statusClass + '">' + OBRAS.helpers.escape(i.descricao) + ' · ' + OBRAS.helpers.escape(i.status) + '</div></div><div><strong>' + OBRAS.helpers.money(i.valor) + '</strong></div></div>';
      }).join('');

      var fluxoOrdenado = filtrados.slice().sort(function(a, b){
        var prioridade = function(item){
          if (item.natureza === 'saida' && item.status === 'Atrasado') return 0;
          if (item.natureza === 'saida' && item.status === 'Vence hoje') return 1;
          if (item.natureza === 'saida' && item.status === 'A vencer') return 2;
          if (item.status === 'Recebido') return 3;
          if (item.status === 'Pago') return 4;
          return 5;
        };
        var pa = prioridade(a);
        var pb = prioridade(b);
        if (pa !== pb) return pa - pb;
        if (pa <= 2) {
          return String(a.data || '').localeCompare(String(b.data || ''));
        }
        return String(b.data || '').localeCompare(String(a.data || ''));
      });

      var movRows = fluxoOrdenado.slice(0, 30).map(function(i){
        var rowClass = i.status === 'Atrasado' ? ' class="row-overdue"' : '';
        return '<tr' + rowClass + '>'
          + '<td>' + OBRAS.helpers.escape(i.data ? OBRAS.helpers.formatDate(i.data) : '-') + '</td>'
          + '<td>' + OBRAS.helpers.escape(i.os) + '</td>'
          + '<td>' + OBRAS.helpers.escape(i.tipo) + '</td>'
          + '<td>' + OBRAS.helpers.escape(i.descricao) + '</td>'
          + '<td>' + OBRAS.ui.badge(i.status, i.status === 'Pago' || i.status === 'Recebido' ? 'success' : (i.status === 'Atrasado' ? 'danger' : 'warning')) + '</td>'
          + '<td>' + OBRAS.helpers.money(i.valor) + '</td>'
          + '<td>' + OBRAS.financeiroScreen.actionButtons(i) + '</td>'
          + '</tr>';
      }).join('');

      var obraRows = m.obras.map(function(o){
        return '<tr>'
          + '<td>' + OBRAS.helpers.escape(o.numeroOS) + '</td>'
          + '<td>' + OBRAS.helpers.escape(o.nome) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.totalRecebido) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.despesasPendentes) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.saldoParceiro) + '</td>'
          + '<td>' + OBRAS.helpers.money(o.resultadoLiquido) + '</td>'
          + '<td><div class="table-actions actions-inline"><button class="small-btn" data-action="open-obra" data-id="' + o.id + '">Abrir</button><button class="small-btn btn-soft" data-action="edit-obra" data-id="' + o.id + '">Editar</button><button class="small-btn btn-danger" data-action="delete-obra" data-id="' + o.id + '">Excluir</button></div></td>'
          + '</tr>';
      }).join('');

      OBRAS.ui.setHTML('screen-container',
        '<div class="screen-head">'
        + '  <div><h1 class="screen-title">Financeiro</h1></div>'
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
        + '<div class="table-card section-space"><h3 class="card-title">Fluxo financeiro</h3>'
        + '<div class="top-alert">Agora você pode pagar, editar valor e excluir lançamentos direto nesta tela. NF automática pode ser paga e editada, mas não apagada por engano.</div>'
        + (movRows ? '<table class="simple-table"><thead><tr><th>Data</th><th>OS</th><th>Tipo</th><th>Descrição</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead><tbody>' + movRows + '</tbody></table>' : '<div class="empty-state">Nenhum movimento encontrado.</div>')
        + '</div>'
        + '<div class="table-card section-space"><h3 class="card-title">Fechamento por obra</h3>' + (obraRows ? '<table class="simple-table"><thead><tr><th>OS</th><th>Obra</th><th>Recebido</th><th>NF pendente</th><th>Parceiro pendente</th><th>Resultado líquido</th><th>Ações</th></tr></thead><tbody>' + obraRows + '</tbody></table>' : '<div class="empty-state">Nenhuma obra cadastrada.</div>') + '</div>'
      );

      var filtroObra = document.getElementById('fin-filtro-obra');
      if (filtroObra) filtroObra.value = filtros.obra || '';
    } catch (err) {
      console.error(err);
      OBRAS.ui.setHTML('screen-container', '<div class="panel" style="padding:22px"><h2>Erro ao montar financeiro</h2><div class="muted">Revise o console e recarregue a base.</div></div>');
    }
  }
};
