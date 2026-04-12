window.OBRAS = window.OBRAS || {};
OBRAS.obrasScreen = {
  norm: function(value){
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  },

  matchValue: function(target, selected){
    if (!selected) return true;
    return this.norm(target) === this.norm(selected);
  },

  renderForm: function(){
    var current = OBRAS.state.form && OBRAS.state.form.obra ? OBRAS.state.form.obra : {};
    var metrics = OBRAS.state.obras.map(function(o){ return OBRAS.rules.obraMetrics(o, OBRAS.state); });
    var filtros = (OBRAS.state.ui && OBRAS.state.ui.obrasFilters) || { query:'', status:'todos', cidade:'', parceiro:'', cliente:'' };

    var parceirosLista = (OBRAS.state.parceiros || []).map(function(p){ return p.nome; }).filter(Boolean);
    var clientesLista = (OBRAS.state.clientes || []).map(function(c){ return c.nome; }).filter(Boolean);

    var parceirosOpt = parceirosLista.map(function(p){ return '<option value="' + OBRAS.helpers.escape(p) + '"></option>'; }).join('');
    var clientesOpt = clientesLista.map(function(c){ return '<option value="' + OBRAS.helpers.escape(c) + '"></option>'; }).join('');

    var cidades = Array.from(new Set(metrics.map(function(o){ return o.cidade; }).concat((OBRAS.state.obras || []).map(function(o){ return o.cidade; })).filter(Boolean))).sort();
    var parceiros = Array.from(new Set(metrics.map(function(o){ return o.parceiroNome; }).concat(parceirosLista).filter(function(v){ return v && v !== '-'; }))).sort();
    var clientes = Array.from(new Set(metrics.map(function(o){ return o.clienteNome; }).concat(clientesLista).filter(function(v){ return v && v !== '-'; }))).sort();
    var osList = this.sortByOS(Array.from(new Set(metrics.map(function(o){ return o.numeroOS; }).filter(Boolean))).map(function(numeroOS){ return { numeroOS: numeroOS }; })).map(function(item){ return item.numeroOS; });

    var self = this;
    var filtered = metrics.filter(function(obra){
      var blob = [obra.numeroOS, obra.nome, obra.cidade, obra.parceiroNome, obra.clienteNome, obra.etapa].join(' ').toLowerCase();
      var okQuery = !filtros.query || obra.numeroOS === filtros.query || blob.indexOf(String(filtros.query).toLowerCase()) >= 0;
      var okStatus = filtros.status === 'todos' || self.matchValue(obra.statusObra, filtros.status);
      var okCidade = self.matchValue(obra.cidade, filtros.cidade);
      var okParceiro = self.matchValue(obra.parceiroNome, filtros.parceiro);
      var okCliente = self.matchValue(obra.clienteNome, filtros.cliente);
      return okQuery && okStatus && okCidade && okParceiro && okCliente;
    });
    filtered = this.sortByOS(filtered);

    var countExec = metrics.filter(function(x){ return self.norm(x.statusObra) === self.norm('Em execução') || self.norm(x.statusObra) === self.norm('Em andamento'); }).length;
    var countPlanej = metrics.filter(function(x){ return self.norm(x.statusObra) === self.norm('Planejado') || self.norm(x.statusObra) === self.norm('Planejamento'); }).length;
    var countQuit = metrics.filter(function(x){ return self.norm(x.statusFinanceiro) === self.norm('Quitado'); }).length;
    var totalAberto = filtered.reduce(function(s,x){ return s + Number(x.saldoReceber || 0); }, 0);

    var rows = filtered.map(function(obra){
      return '<tr>'
        + '<td>' + OBRAS.helpers.escape(obra.numeroOS) + '</td>'
        + '<td><strong>' + OBRAS.helpers.escape(obra.nome) + '</strong><div class="muted">' + OBRAS.helpers.escape(obra.cidade) + ' · ' + OBRAS.helpers.escape(obra.parceiroNome || '-') + (obra.clienteNome ? ' · ' + OBRAS.helpers.escape(obra.clienteNome) : '') + '</div></td>'
        + '<td>' + OBRAS.ui.badge(obra.etapa || '-', 'info') + '</td>'
        + '<td>' + OBRAS.ui.badge(obra.statusObra || '-', OBRAS.ui.toneByStatus(obra.statusObra || '-')) + '</td>'
        + '<td>' + OBRAS.helpers.money(obra.valorObra) + '</td>'
        + '<td>' + OBRAS.helpers.money(obra.saldoReceber) + '</td>'
        + '<td class="table-actions"><div class="actions-inline"><button class="small-btn" data-action="open-obra" data-id="' + obra.id + '">Abrir</button><button class="small-btn" data-action="edit-obra" data-id="' + obra.id + '">Editar</button><button class="small-btn danger" data-action="delete-obra" data-id="' + obra.id + '">Excluir</button></div></td>'
        + '</tr>';
    }).join('');

    var osSelectOptions = '<option value="">Nova obra / manual</option>' + osList.map(function(os){
      var obraRef = metrics.find(function(m){ return m.numeroOS === os; });
      var label = os + (obraRef ? ' · ' + obraRef.nome : '');
      return '<option value="' + OBRAS.helpers.escape(os) + '" ' + (current.numeroOS === os ? 'selected' : '') + '>' + OBRAS.helpers.escape(label) + '</option>';
    }).join('');

    OBRAS.ui.setHTML('screen-container',
      '<div class="screen-head">'
      + '  <div><h1 class="screen-title">Obras</h1></div>'
      + '  <div class="actions-row"><button class="btn btn-primary" data-go="dashboard">Dashboard</button></div>'
      + '</div>'
      + '<div class="kpi-grid compact-kpi-grid">'
      + '  <div class="kpi-card"><div class="kpi-label">Obras cadastradas</div><div class="kpi-value">' + metrics.length + '</div><div class="kpi-note">Base operacional atual</div></div>'
      + '  <div class="kpi-card"><div class="kpi-label">Em execução</div><div class="kpi-value">' + countExec + '</div><div class="kpi-note">Frentes ativas</div></div>'
      + '  <div class="kpi-card"><div class="kpi-label">Planejadas</div><div class="kpi-value">' + countPlanej + '</div><div class="kpi-note">Pendentes de avanço</div></div>'
      + '  <div class="kpi-card"><div class="kpi-label">Saldo em aberto</div><div class="kpi-value">' + OBRAS.helpers.money(totalAberto) + '</div><div class="kpi-note">Filtrado na tela</div></div>'
      + '</div>'
      + '<div class="filter-bar panel">'
      + '  <div class="field"><label>OS</label><select id="obra-filtro-busca"><option value="">Todas as obras</option>' + osList.map(function(os){ return '<option value="' + OBRAS.helpers.escape(os) + '" ' + (filtros.query === os ? 'selected' : '') + '>' + OBRAS.helpers.escape(os) + '</option>'; }).join('') + '</select></div>'
      + '  <div class="field"><label>Status</label><select id="obra-filtro-status"><option value="todos">Todos</option><option value="Planejado" ' + (self.matchValue(filtros.status, 'Planejado') ? 'selected' : '') + '>Planejado</option><option value="Em execução" ' + (self.matchValue(filtros.status, 'Em execução') ? 'selected' : '') + '>Em execução</option><option value="Concluída" ' + (self.matchValue(filtros.status, 'Concluída') ? 'selected' : '') + '>Concluída</option></select></div>'
      + '  <div class="field"><label>Cidade</label><select id="obra-filtro-cidade"><option value="">Todas</option>' + cidades.map(function(c){ return '<option value="' + OBRAS.helpers.escape(c) + '" ' + (self.matchValue(filtros.cidade, c) ? 'selected' : '') + '>' + OBRAS.helpers.escape(c) + '</option>'; }).join('') + '</select></div>'
      + '  <div class="field"><label>Parceiro</label><select id="obra-filtro-parceiro"><option value="">Todos</option>' + parceiros.map(function(c){ return '<option value="' + OBRAS.helpers.escape(c) + '" ' + (self.matchValue(filtros.parceiro, c) ? 'selected' : '') + '>' + OBRAS.helpers.escape(c) + '</option>'; }).join('') + '</select></div>'
      + '  <div class="field"><label>Cliente</label><select id="obra-filtro-cliente"><option value="">Todos</option>' + clientes.map(function(c){ return '<option value="' + OBRAS.helpers.escape(c) + '" ' + (self.matchValue(filtros.cliente, c) ? 'selected' : '') + '>' + OBRAS.helpers.escape(c) + '</option>'; }).join('') + '</select></div>'
      + '  <div class="form-actions align-end"><button class="btn" id="obra-filtro-clear-btn">Limpar filtros</button></div>'
      + '</div>'
      + '<div class="split-card">'
      + '  <div class="form-card">'
      + '    <h3 class="card-title">' + (current.id ? 'Editar obra' : 'Nova obra') + '</h3>'
      + '    <form id="obra-form" data-edit-id="' + (current.id || '') + '" onsubmit="return false;">'
      + '      <div class="field-grid">'
      + '        <div class="field"><label>Número da OS</label><select id="obra-numero-os">' + osSelectOptions + '</select></div>'
      + '        <div class="field"><label>Nome da obra</label><input id="obra-nome" value="' + OBRAS.helpers.escape(current.siteTorre || '') + '" /></div>'
      + '        <div class="field"><label>Cidade</label><input id="obra-cidade" value="' + OBRAS.helpers.escape(current.cidade || '') + '" /></div>'
      + '        <div class="field"><label>Valor da obra</label><input id="obra-valor" type="number" step="0.01" value="' + OBRAS.helpers.escape(current.valorObra || '') + '" /></div>'
      + '        <div class="field"><label>Parceiro</label><input id="obra-parceiro" list="lista-parceiros" value="' + OBRAS.helpers.escape(current.parceiroNome || '') + '" /><datalist id="lista-parceiros">' + parceirosOpt + '</datalist></div>'
      + '        <div class="field"><label>Cliente</label><input id="obra-cliente" list="lista-clientes" value="' + OBRAS.helpers.escape(current.clienteNome || '') + '" /><datalist id="lista-clientes">' + clientesOpt + '</datalist></div>'
      + '        <div class="field"><label>Etapa</label><input id="obra-etapa" value="' + OBRAS.helpers.escape(current.etapa || '') + '" /></div>'
      + '        <div class="field"><label>Status</label><select id="obra-status"><option value="Planejado" ' + (self.matchValue(current.statusObra, 'Planejado') ? 'selected' : '') + '>Planejado</option><option value="Em execução" ' + (self.matchValue(current.statusObra, 'Em execução') ? 'selected' : '') + '>Em execução</option><option value="Concluída" ' + (self.matchValue(current.statusObra, 'Concluída') ? 'selected' : '') + '>Concluída</option></select></div>'
      + '        <div class="field"><label>Data de abertura</label><input id="obra-data" type="date" value="' + OBRAS.helpers.escape(current.dataAbertura || OBRAS.helpers.todayISO()) + '" /></div>'
      + '      </div>'
      + '      <div class="form-actions"><button class="btn btn-primary" id="obra-save-btn">' + (current.id ? 'Salvar obra' : 'Cadastrar obra') + '</button><button class="btn" id="obra-clear-btn">Limpar</button></div>'
      + '    </form>'
      + '  </div>'
      + '  <div class="list-card">'
      + '    <h3 class="card-title">Resumo filtrado</h3>'
      + '    <div class="inline-stat"><span class="muted">Resultado do filtro</span><strong>' + filtered.length + ' obra(s)</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Obras quitadas</span><strong>' + countQuit + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Clientes com obra</span><strong>' + clientes.filter(Boolean).length + '</strong></div>'
      + '    <div class="top-alert">Agora os filtros usam comparação real dos dados cadastrados. Ex.: ao escolher parceiro, aparecem as obras daquele parceiro.</div>'
      + '  </div>'
      + '</div>'
      + '<div class="table-card section-space">'
      + '  <h3 class="card-title">Lista de obras</h3>'
      +     (rows ? '<table class="simple-table"><thead><tr><th>OS</th><th>Obra</th><th>Etapa</th><th>Status</th><th>Valor</th><th>A receber</th><th>Ações</th></tr></thead><tbody>' + rows + '</tbody></table>' : '<div class="empty-state">Nenhuma obra encontrada com os filtros atuais.</div>')
      + '</div>'
    );
  },

  render: function(){
    try {
      this.renderForm();
    } catch (err) {
      OBRAS.ui.setHTML('screen-container', '<div class="panel"><h2>Erro ao abrir a central de obras</h2><div class="muted">' + OBRAS.helpers.escape(err && err.message ? err.message : 'Falha inesperada') + '</div></div>');
      if (window.console) console.error(err);
    }
  }
};
