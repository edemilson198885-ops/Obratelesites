window.OBRAS = window.OBRAS || {};
OBRAS.obraDetalheScreen = {
  itemsByObra: function(list, obra){
    return (list || []).filter(function(x){
      return x.obraId === obra.id || x.os === obra.numeroOS;
    }).sort(function(a,b){
      var da = String(a.dataRecebimento || a.dataVencimento || a.dataDespesa || a.data || '');
      var db = String(b.dataRecebimento || b.dataVencimento || b.dataDespesa || b.data || '');
      return db.localeCompare(da);
    });
  },

  listRows: function(items, empty, kind){
    if (!items.length) return '<div class="empty-state">' + empty + '</div>';
    return '<div class="detail-list">' + items.map(function(item){
      var date = item.dataRecebimento || item.dataVencimento || item.dataDespesa || item.data || '';
      var obs = item.observacoes || item.observacao || item.descricao || '';
      var autoNf = item.origemLancamento === 'automatico_obra_nf' || item.geradaAutomaticamente === true;
      return '<div class="list-item launch-item">'
        + '<div><strong>' + OBRAS.helpers.money(item.valor) + '</strong><div class="muted">' + OBRAS.helpers.escape(date) + (obs ? ' · ' + OBRAS.helpers.escape(obs) : '') + '</div></div>'
        + '<div class="launch-actions">'
        + '<span class="badge badge-' + (autoNf ? 'warning' : 'info') + '">' + OBRAS.helpers.escape(item.status || item.tipoDespesa || item.tipo || 'lançado') + '</span>'
        + '<button class="small-btn btn-soft" data-action="edit-obra-lanc" data-kind="' + kind + '" data-id="' + item.id + '">Editar</button>'
        + (autoNf ? '' : '<button class="small-btn btn-danger" data-action="delete-obra-lanc" data-kind="' + kind + '" data-id="' + item.id + '">Excluir</button>')
        + '</div>'
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
    var recebimentos = this.itemsByObra(OBRAS.state.recebimentos, obra);
    var pagamentos = this.itemsByObra(OBRAS.state.pagamentosParceiros, obra);
    var despesas = this.itemsByObra(OBRAS.state.despesas, obra);
    var edit = (OBRAS.state.form && OBRAS.state.form.obraLancamentoEdit) || {};

    var html = ''
      + '<div class="screen-head">'
      + '  <div><h1 class="screen-title">Detalhe da obra</h1></div>'
      + '  <div class="actions-row"><button class="btn" data-go="obras">Voltar para central</button></div>'
      + '</div>'
      + '<div class="detail-hero">'
      + '  <div><div class="muted">OS ' + OBRAS.helpers.escape(obra.numeroOS) + '</div><h2>' + OBRAS.helpers.escape(obra.siteTorre || obra.nome || '-') + '</h2><div class="muted">' + OBRAS.helpers.escape(obra.cidade || '-') + ' · ' + OBRAS.helpers.escape(obra.parceiroNome || '-') + (obra.clienteNome ? ' · ' + OBRAS.helpers.escape(obra.clienteNome) : '') + '</div></div>'
      + '  <div class="detail-badges">' + OBRAS.ui.badge(obra.etapa || '-', 'info') + OBRAS.ui.badge(obra.statusObra || '-', OBRAS.ui.toneByStatus(obra.statusObra || '-')) + '</div>'
      + '</div>'
      + '<div class="kpi-grid">'
      + '  <div class="kpi-card"><div class="kpi-label">Valor da obra</div><div class="kpi-value">' + OBRAS.helpers.money(metric.valorObra) + '</div><div class="kpi-note">Contrato base</div></div>'
      + '  <div class="kpi-card"><div class="kpi-label">Recebido</div><div class="kpi-value">' + OBRAS.helpers.money(metric.totalRecebido) + '</div><div class="kpi-note">Entradas confirmadas</div></div>'
      + '  <div class="kpi-card"><div class="kpi-label">Repasse fechado</div><div class="kpi-value">' + OBRAS.helpers.money(metric.valorFechadoParceiro) + '</div><div class="kpi-note">Valor combinado com parceiro</div></div>'
      + '  <div class="kpi-card"><div class="kpi-label">Saldo líquido</div><div class="kpi-value">' + OBRAS.helpers.money(metric.resultadoLiquido) + '</div><div class="kpi-note">Recebido - pagamentos - despesas</div></div>'
      + '</div>'
      + '<div class="detail-grid">'
      + '  <div class="table-card"><h3 class="card-title">Recebimentos</h3>'
      + '    <div class="inline-form"><input id="det-rec-valor" placeholder="Valor" /><input id="det-rec-data" type="date" value="' + OBRAS.helpers.todayISO() + '" /><input id="det-rec-obs" placeholder="Observação" /><button class="btn btn-primary" id="det-rec-btn">' + (edit.kind === 'rec' ? 'Salvar edição' : 'Lançar') + '</button></div>'
      +       OBRAS.obraDetalheScreen.listRows(recebimentos, 'Nenhum recebimento lançado para esta obra.', 'rec')
      + '  </div>'
      + '  <div class="table-card"><h3 class="card-title">Pagamentos parceiros</h3>'
      + '    <div class="inline-form"><input id="det-pag-valor" placeholder="Valor" /><input id="det-pag-data" type="date" value="' + OBRAS.helpers.todayISO() + '" /><input id="det-pag-obs" placeholder="Observação" /><button class="btn btn-primary" id="det-pag-btn">' + (edit.kind === 'pag' ? 'Salvar edição' : 'Lançar') + '</button></div>'
      +       OBRAS.obraDetalheScreen.listRows(pagamentos, 'Nenhum pagamento parceiro lançado para esta obra.', 'pag')
      + '  </div>'
      + '</div>'
      + '<div class="content-grid section-space">'
      + '  <div class="table-card"><h3 class="card-title">Despesas da obra</h3>'
      + '    <div class="inline-form"><input id="det-desp-valor" placeholder="Valor" /><input id="det-desp-data" type="date" value="' + OBRAS.helpers.todayISO() + '" /><select id="det-desp-tipo"><option value="obra">Despesa obra</option><option value="mobilizacao">Mobilização</option><option value="material">Material</option><option value="viagem">Viagem</option><option value="Imposto NF">Imposto NF</option></select><input id="det-desp-obs" placeholder="Observação" /><label class="inline-check"><input id="det-desp-pago" type="checkbox" checked /> Pago</label><button class="btn btn-primary" id="det-desp-btn">' + (edit.kind === 'desp' ? 'Salvar edição' : 'Lançar') + '</button></div>'
      +       OBRAS.obraDetalheScreen.listRows(despesas, 'Nenhuma despesa lançada para esta obra.', 'desp')
      + '  </div>'
      + '  <div class="list-card"><h3 class="card-title">Resumo operacional</h3>'
      + '    <div class="inline-stat"><span class="muted">Parceiro</span><strong>' + OBRAS.helpers.escape(obra.parceiroNome || '-') + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Cliente</span><strong>' + OBRAS.helpers.escape(obra.clienteNome || '-') + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Repasse fechado</span><strong>' + OBRAS.helpers.money(metric.valorFechadoParceiro) + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Pagamentos</span><strong>' + OBRAS.helpers.money(metric.totalPagoParceiro) + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Saldo parceiro</span><strong>' + OBRAS.helpers.money(metric.saldoParceiro) + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Despesas</span><strong>' + OBRAS.helpers.money(metric.despesasPagas) + '</strong></div>'
      + '    <div class="top-alert">Agora a obra mostra e salva o repasse do parceiro direto no cadastro da OS.</div>'
      + '  </div>'
      + '</div>';

    OBRAS.ui.setHTML('screen-container', html);

    var despPagoDefault = document.getElementById('det-desp-pago');
    if (despPagoDefault && !(edit && edit.kind === 'desp')) despPagoDefault.checked = true;

    var collections = { rec: recebimentos, pag: pagamentos, desp: despesas };
    if (edit.kind && collections[edit.kind]) {
      var item = collections[edit.kind].find(function(x){ return x.id === edit.id; });
      if (item) {
        var prefix = edit.kind === 'rec' ? 'det-rec' : edit.kind === 'pag' ? 'det-pag' : 'det-desp';
        var date = item.dataRecebimento || item.dataVencimento || item.dataDespesa || item.data || OBRAS.helpers.todayISO();
        var obs = item.observacoes || item.observacao || item.descricao || '';
        var valEl = document.getElementById(prefix + '-valor');
        var dateEl = document.getElementById(prefix + '-data');
        var obsEl = document.getElementById(prefix + '-obs');
        if (valEl) valEl.value = Number(item.valor || 0);
        if (dateEl) dateEl.value = date;
        if (obsEl) obsEl.value = obs;
        if (edit.kind === 'desp') {
          var tipoEl = document.getElementById('det-desp-tipo');
          var pagoEl = document.getElementById('det-desp-pago');
          if (tipoEl) tipoEl.value = item.tipoDespesa || item.tipo || 'obra';
          if (pagoEl) pagoEl.checked = !!(item.dataPagamentoReal || item.status === 'pago');
        }
      }
    }
  }
};
