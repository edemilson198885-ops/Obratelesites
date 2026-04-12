
window.OBRAS = window.OBRAS || {};
OBRAS.services = {
  readJSONFile: function(file, onSuccess){
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(evt){
      try {
        var parsed = JSON.parse(evt.target.result);
        onSuccess(parsed);
      } catch (err) {
        OBRAS.ui.toast('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file, 'utf-8');
  },

  downloadBackup: function(){
    try {
      var payload = JSON.stringify(OBRAS.state, null, 2);
      var blob = new Blob([payload], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'controle-obras-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      OBRAS.ui.toast('Backup exportado.');
    } catch (err) {
      OBRAS.ui.toast('Falha ao exportar backup.');
    }
  },

  importBackupObject: function(obj){
    if (!obj || typeof obj !== 'object') {
      OBRAS.ui.toast('Arquivo de backup inválido.');
      return;
    }
    if (!window.confirm('Importar este backup para a base atual?')) return;

    var normalized = OBRAS.stateApi.normalizeDB ? OBRAS.stateApi.normalizeDB(obj) : obj;

    normalized.session = normalized.session || {};
    normalized.session.loggedIn = true;
    normalized.session.userName = normalized.session.userName || (OBRAS.state.session && OBRAS.state.session.userName) || 'Edemilson';

    normalized.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
    normalized.form = {};
    normalized.ui = normalized.ui || {};
    normalized.ui.selectedObraId = null;
    normalized.ui.obrasFilters = { query:'', status:'todos', cidade:'', parceiro:'', cliente:'' };
    normalized.ui.financeFilters = { query:'', tipo:'todos', status:'todos', obra:'' };

    OBRAS.state = normalized;
    OBRAS.stateApi.save();

    OBRAS.stateApi.initialize(false);
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
    OBRAS.app.render();
    OBRAS.ui.toast('Backup importado com sucesso.');
  },

  openImportDialog: function(){
    var input = document.getElementById('backup-import-input');
    if (input) input.click();
  },

  submitCadastro: function(){
    var form = document.getElementById('cadastro-form');
    if (!form) return;
    var tipo = document.getElementById('cad-tipo').value;
    var nome = document.getElementById('cad-nome').value.trim();
    var contato = document.getElementById('cad-contato').value.trim();
    var telefone = document.getElementById('cad-telefone').value.trim();
    var cidade = document.getElementById('cad-cidade').value.trim();
    var id = form.getAttribute('data-edit-id');
    if (!tipo || !nome) {
      OBRAS.ui.toast('Preencha tipo e nome.');
      return;
    }
    var targetKey = tipo === 'empresa' ? 'empresas' : (tipo === 'parceiro' ? 'parceiros' : 'clientes');
    var payload = {
      id: id || OBRAS.helpers.uid(tipo),
      nome: nome,
      contato: contato,
      telefone: telefone,
      cidade: cidade
    };
    var list = OBRAS.state[targetKey];
    var idx = list.findIndex(function(x){ return x.id === payload.id; });
    if (idx >= 0) list[idx] = payload;
    else list.push(payload);
    OBRAS.state.form = {};
    OBRAS.stateApi.save();
    OBRAS.router.goTo(OBRAS.config.SCREENS.CADASTROS);
    OBRAS.ui.toast(idx >= 0 ? 'Cadastro atualizado.' : 'Cadastro criado.');
  },

  editCadastro: function(tipo, id){
    var key = tipo === 'empresa' ? 'empresas' : (tipo === 'parceiro' ? 'parceiros' : 'clientes');
    var item = (OBRAS.state[key] || []).find(function(x){ return x.id === id; });
    if (!item) return;
    OBRAS.state.form = { cadastro: { tipo: tipo, id: item.id, nome: item.nome, contato: item.contato || '', telefone: item.telefone || '', cidade: item.cidade || '' } };
    OBRAS.router.goTo(OBRAS.config.SCREENS.CADASTROS);
  },

  deleteCadastro: function(tipo, id){
    var key = tipo === 'empresa' ? 'empresas' : (tipo === 'parceiro' ? 'parceiros' : 'clientes');
    var list = OBRAS.state[key] || [];
    var item = list.find(function(x){ return x.id === id; });
    if (!item) return;
    if (!window.confirm('Excluir ' + item.nome + '?')) return;
    OBRAS.state[key] = list.filter(function(x){ return x.id !== id; });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Cadastro removido.');
  },

  clearCadastroForm: function(){
    OBRAS.state.form = {};
    OBRAS.router.goTo(OBRAS.config.SCREENS.CADASTROS);
  },

  setObrasFiltersFromDOM: function(){
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.obrasFilters = {
      query: (document.getElementById('obra-filtro-busca') || {}).value || '',
      status: (document.getElementById('obra-filtro-status') || {}).value || 'todos',
      cidade: (document.getElementById('obra-filtro-cidade') || {}).value || '',
      parceiro: (document.getElementById('obra-filtro-parceiro') || {}).value || '',
      cliente: (document.getElementById('obra-filtro-cliente') || {}).value || ''
    };
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },

  clearObrasFilters: function(){
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.obrasFilters = { query:'', status:'todos', cidade:'', parceiro:'', cliente:'' };
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },

  setFinanceFiltersFromDOM: function(){
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.financeFilters = {
      query: (document.getElementById('fin-filtro-busca') || {}).value || '',
      tipo: (document.getElementById('fin-filtro-tipo') || {}).value || 'todos',
      status: (document.getElementById('fin-filtro-status') || {}).value || 'todos',
      obra: (document.getElementById('fin-filtro-obra') || {}).value || ''
    };
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },

  clearFinanceFilters: function(){
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.financeFilters = { query:'', tipo:'todos', status:'todos', obra:'' };
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },


  autofillObraFromSelectedOS: function(){
    var osValue = (document.getElementById('obra-numero-os') || {}).value || '';
    if (!osValue) return;
    var obra = (OBRAS.state.obras || []).find(function(x){ return x.numeroOS === osValue; });
    if (!obra) return;
    var setVal = function(id, value){
      var el = document.getElementById(id);
      if (el && !el.value) el.value = value || '';
    };
    setVal('obra-nome', obra.siteTorre);
    setVal('obra-cidade', obra.cidade);
    setVal('obra-valor', obra.valorObra);
    setVal('obra-parceiro', obra.parceiroNome);
    setVal('obra-cliente', obra.clienteNome);
    setVal('obra-etapa', obra.etapa);
    var statusEl = document.getElementById('obra-status');
    if (statusEl && !statusEl.value) statusEl.value = obra.statusObra || 'Planejado';
    setVal('obra-data', obra.dataAbertura);
  },

  openObraDetail: function(id){
    var obra = (OBRAS.state.obras || []).find(function(x){ return x.id === id; });
    if (!obra) {
      OBRAS.ui.toast('Obra não encontrada.');
      return;
    }
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.selectedObraId = id;
    OBRAS.stateApi.save();
    OBRAS.router.goTo(OBRAS.config.SCREENS.OBRA_DETALHE);
  },

  getSelectedObra: function(){
    var id = OBRAS.state.ui && OBRAS.state.ui.selectedObraId;
    if (!id) return null;
    return (OBRAS.state.obras || []).find(function(x){ return x.id === id; }) || null;
  },

  submitObraRecebimento: function(){
    var obra = this.getSelectedObra();
    if (!obra) return;
    var valor = OBRAS.helpers.toNumber(document.getElementById('det-rec-valor').value);
    var data = document.getElementById('det-rec-data').value || OBRAS.helpers.todayISO();
    var obs = document.getElementById('det-rec-obs').value.trim();
    if (!valor) { OBRAS.ui.toast('Informe o valor do recebimento.'); return; }
    var edit = OBRAS.state.form && OBRAS.state.form.obraLancamentoEdit;
    if (edit && edit.kind === 'rec') {
      var rec = (OBRAS.state.recebimentos || []).find(function(x){ return x.id === edit.id; });
      if (!rec) { OBRAS.ui.toast('Recebimento não encontrado.'); return; }
      OBRAS.services.updateObraLancamento('rec', rec, valor, data, obs, '');
      delete OBRAS.state.form.obraLancamentoEdit;
      OBRAS.stateApi.save();
      OBRAS.app.render();
      OBRAS.ui.toast('Recebimento atualizado.');
      return;
    }
    OBRAS.state.recebimentos.push({
      id: OBRAS.helpers.uid('rec'),
      obraId: obra.id,
      os: obra.numeroOS,
      valor: valor,
      data: data,
      dataRecebimento: data,
      observacao: obs,
      observacoes: obs,
      descricao: obs || 'Recebimento',
      status: 'recebido'
    });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Recebimento lançado.');
  },

  submitObraPagamento: function(){
    var obra = this.getSelectedObra();
    if (!obra) return;
    var valor = OBRAS.helpers.toNumber(document.getElementById('det-pag-valor').value);
    var data = document.getElementById('det-pag-data').value || OBRAS.helpers.todayISO();
    var obs = document.getElementById('det-pag-obs').value.trim();
    if (!valor) { OBRAS.ui.toast('Informe o valor do pagamento.'); return; }
    var edit = OBRAS.state.form && OBRAS.state.form.obraLancamentoEdit;
    if (edit && edit.kind === 'pag') {
      var pag = (OBRAS.state.pagamentosParceiros || []).find(function(x){ return x.id === edit.id; });
      if (!pag) { OBRAS.ui.toast('Pagamento não encontrado.'); return; }
      OBRAS.services.updateObraLancamento('pag', pag, valor, data, obs, '');
      delete OBRAS.state.form.obraLancamentoEdit;
      OBRAS.stateApi.save();
      OBRAS.app.render();
      OBRAS.ui.toast('Pagamento parceiro atualizado.');
      return;
    }
    OBRAS.state.pagamentosParceiros.push({
      id: OBRAS.helpers.uid('pag'),
      obraId: obra.id,
      os: obra.numeroOS,
      valor: valor,
      data: data,
      dataVencimento: data,
      dataPagamentoReal: data,
      observacao: obs,
      observacoes: obs,
      descricao: obs || 'Pagamento parceiro',
      status: 'pago'
    });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Pagamento parceiro lançado.');
  },

  submitObraDespesa: function(){
    var obra = this.getSelectedObra();
    if (!obra) return;
    var valor = OBRAS.helpers.toNumber(document.getElementById('det-desp-valor').value);
    var data = document.getElementById('det-desp-data').value || OBRAS.helpers.todayISO();
    var tipo = document.getElementById('det-desp-tipo').value || 'obra';
    var obs = document.getElementById('det-desp-obs').value.trim();
    if (!valor) { OBRAS.ui.toast('Informe o valor da despesa.'); return; }
    var edit = OBRAS.state.form && OBRAS.state.form.obraLancamentoEdit;
    if (edit && edit.kind === 'desp') {
      var desp = (OBRAS.state.despesas || []).find(function(x){ return x.id === edit.id; });
      if (!desp) { OBRAS.ui.toast('Despesa não encontrada.'); return; }
      OBRAS.services.updateObraLancamento('desp', desp, valor, data, obs, tipo);
      delete OBRAS.state.form.obraLancamentoEdit;
      OBRAS.stateApi.save();
      OBRAS.app.render();
      OBRAS.ui.toast('Despesa atualizada.');
      return;
    }
    OBRAS.state.despesas.push({
      id: OBRAS.helpers.uid('desp'),
      obraId: obra.id,
      os: obra.numeroOS,
      valor: valor,
      data: data,
      dataDespesa: data,
      dataVencimento: data,
      dataPagamentoReal: data,
      tipo: tipo,
      tipoDespesa: tipo,
      observacao: obs,
      observacoes: obs,
      status: 'pago'
    });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Despesa da obra lançada.');
  },

  loginLocal: function(name, password){
    return this.loginSupabase(name, password);
  },
  logout: function(){
    return this.logoutSupabase();
  },

  loginSupabase: async function(email, password){
    try {
      if (!String(email || '').trim() || !String(password || '').trim()) {
        OBRAS.ui.toast('Informe email e senha.');
        return false;
      }
      var response = await OBRAS.services.getSupabaseClient().auth.signInWithPassword({
        email: String(email).trim(),
        password: String(password)
      });
      if (response.error) {
        OBRAS.ui.toast('Login inválido: ' + response.error.message);
        return false;
      }
      var user = response.data && response.data.user ? response.data.user : null;
      OBRAS.state.session.loggedIn = true;
      OBRAS.state.session.userName = (user && user.user_metadata && (user.user_metadata.nome || user.user_metadata.name)) || (user && user.email) || String(email).trim();
      OBRAS.state.session.userEmail = (user && user.email) || String(email).trim();
      OBRAS.state.session.userId = (user && user.id) || '';
      OBRAS.state.session.accessMode = 'supabase-auth';
      OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
      OBRAS.stateApi.save();
      try { await OBRAS.services.bootstrapAutoSync(); } catch (e) { console.error(e); }
      return true;
    } catch (err) {
      console.error(err);
      OBRAS.ui.toast('Erro ao entrar com Supabase.');
      return false;
    }
  },

  restoreSupabaseSession: async function(){
    try {
      var response = await OBRAS.services.getSupabaseClient().auth.getSession();
      if (response.error) {
        console.error(response.error);
        return false;
      }
      var session = response.data && response.data.session ? response.data.session : null;
      if (!session || !session.user) return false;
      var user = session.user;
      OBRAS.state.session.loggedIn = true;
      OBRAS.state.session.userName = (user.user_metadata && (user.user_metadata.nome || user.user_metadata.name)) || user.email || 'Usuário';
      OBRAS.state.session.userEmail = user.email || '';
      OBRAS.state.session.userId = user.id || '';
      OBRAS.state.session.accessMode = 'supabase-auth';
      OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
      OBRAS.stateApi.save();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  logoutSupabase: async function(){
    try {
      await OBRAS.services.getSupabaseClient().auth.signOut();
    } catch (err) {
      console.error(err);
    }
    OBRAS.state.session.loggedIn = false;
    OBRAS.state.session.userName = '';
    OBRAS.state.session.userEmail = '';
    OBRAS.state.session.userId = '';
    OBRAS.state.session.accessMode = '';
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.LOGIN;
    OBRAS.state.form = {};
    OBRAS.stateApi.save();
  },

  resetBase: function(){
    if (!window.confirm('Resetar a base local da Fase 2?')) return;
    OBRAS.storage.reset();
    OBRAS.stateApi.initialize(true);
    OBRAS.app.render();
    OBRAS.ui.toast('Base local zerada com sucesso.');
  },
  useDemoData: function(){
    OBRAS.state = OBRAS.models.createEmptyDB();
    OBRAS.state.session.loggedIn = true;
    OBRAS.state.session.userName = OBRAS.state.session.userName || '';
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
    OBRAS.state.form = {};
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },
  submitObra: function(){
    var form = document.getElementById('obra-form');
    if (!form) return;
    var id = form.getAttribute('data-edit-id');
    var numeroOS = document.getElementById('obra-numero-os').value.trim();
    var siteTorre = document.getElementById('obra-nome').value.trim();
    var cidade = document.getElementById('obra-cidade').value.trim();
    var valorObra = Number(document.getElementById('obra-valor').value || 0);
    var parceiroNome = document.getElementById('obra-parceiro').value.trim();
    var clienteNome = document.getElementById('obra-cliente') ? document.getElementById('obra-cliente').value.trim() : '';
    var etapa = document.getElementById('obra-etapa').value.trim();
    var statusObra = document.getElementById('obra-status').value;
    if (!siteTorre || !cidade || !valorObra) {
      OBRAS.ui.toast('Preencha obra, cidade e valor.');
      return;
    }
    var payload = {
      id: id || OBRAS.helpers.uid('obra'),
      numeroOS: numeroOS || OBRAS.rules.nextOS(OBRAS.state),
      siteTorre: siteTorre,
      cidade: cidade,
      valorObra: valorObra,
      parceiroNome: parceiroNome,
      clienteNome: clienteNome,
      etapa: etapa,
      statusObra: statusObra,
      statusCicloOS: 'Ativa',
      dataAbertura: document.getElementById('obra-data').value || OBRAS.helpers.todayISO()
    };
    var idx = OBRAS.state.obras.findIndex(function(x){ return x.id === payload.id; });
    if (idx >= 0) OBRAS.state.obras[idx] = payload;
    else OBRAS.state.obras.push(payload);
    OBRAS.services.syncAutoNfExpenses();
    OBRAS.state.form = {};
    OBRAS.stateApi.save();
    OBRAS.router.goTo(OBRAS.config.SCREENS.OBRAS);
    OBRAS.ui.toast(idx >= 0 ? 'Obra atualizada.' : 'Obra cadastrada.');
  },
  editObra: function(id){
    var obra = OBRAS.state.obras.find(function(x){ return x.id === id; });
    if (!obra) return;
    OBRAS.state.form = {
      obra: {
        id: obra.id,
        numeroOS: obra.numeroOS,
        siteTorre: obra.siteTorre,
        cidade: obra.cidade,
        valorObra: obra.valorObra,
        parceiroNome: obra.parceiroNome,
        clienteNome: obra.clienteNome || '',
        etapa: obra.etapa,
        statusObra: obra.statusObra,
        dataAbertura: obra.dataAbertura
      }
    };
    OBRAS.router.goTo(OBRAS.config.SCREENS.OBRAS);
  },
  deleteObra: function(id){
    var obra = OBRAS.state.obras.find(function(x){ return x.id === id; });
    if (!obra) return;
    if (!window.confirm('Excluir a obra ' + obra.numeroOS + '?')) return;
    OBRAS.state.obras = OBRAS.state.obras.filter(function(x){ return x.id !== id; });
    OBRAS.state.recebimentos = OBRAS.state.recebimentos.filter(function(x){ return x.os !== obra.numeroOS; });
    OBRAS.state.repasses = OBRAS.state.repasses.filter(function(x){ return x.os !== obra.numeroOS; });
    OBRAS.state.pagamentosParceiros = OBRAS.state.pagamentosParceiros.filter(function(x){ return x.os !== obra.numeroOS; });
    OBRAS.state.despesas = OBRAS.state.despesas.filter(function(x){ return x.os !== obra.numeroOS; });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Obra removida.');
  },
  submitRecebimento: function(){
    var os = document.getElementById('fin-os').value;
    var valor = Number(document.getElementById('fin-valor').value || 0);
    var data = document.getElementById('fin-data').value || OBRAS.helpers.todayISO();
    var tipo = document.getElementById('fin-tipo').value;
    var descricao = document.getElementById('fin-descricao').value.trim();
    if (!os || !valor) {
      OBRAS.ui.toast('Selecione a OS e o valor.');
      return;
    }
    if (tipo === 'recebimento') {
      OBRAS.state.recebimentos.push({ id: OBRAS.helpers.uid('rec'), os: os, descricao: descricao || 'Recebimento', dataRecebimento: data, valor: valor });
      OBRAS.ui.toast('Recebimento lançado.');
    } else if (tipo === 'pagamento') {
      OBRAS.state.pagamentosParceiros.push({ id: OBRAS.helpers.uid('pag'), os: os, descricao: descricao || 'Pagamento parceiro', dataVencimento: data, dataPagamentoReal: data, valor: valor, natureza:'pagamento' });
      OBRAS.ui.toast('Pagamento parceiro lançado.');
    } else {
      OBRAS.state.despesas.push({ id: OBRAS.helpers.uid('des'), os: os, tipoDespesa: descricao || 'Despesa da obra', dataVencimento: data, dataPagamentoReal: '', valor: valor, observacoes: descricao || '' });
      OBRAS.ui.toast('Despesa da obra lançada.');
    }
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },
  submitDespesaGeral: function(){
    var tipo = document.getElementById('geral-tipo').value.trim();
    var valor = Number(document.getElementById('geral-valor').value || 0);
    var venc = document.getElementById('geral-vencimento').value || OBRAS.helpers.todayISO();
    if (!tipo || !valor) {
      OBRAS.ui.toast('Preencha tipo e valor.');
      return;
    }
    OBRAS.state.despesasGerais.push({
      id: OBRAS.helpers.uid('ger'),
      tipoDespesa: tipo,
      dataVencimento: venc,
      dataPagamentoReal: document.getElementById('geral-paga').checked ? venc : '',
      valor: valor,
      observacoes: document.getElementById('geral-obs').value.trim()
    });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Despesa geral registrada.');
  },

  generateResumoRelatorio: function(){
    var m = OBRAS.rules.painelMetrics(OBRAS.state);
    var linhas = [];
    linhas.push('RELATÓRIO GERAL - CONTROLE DE OBRAS');
    linhas.push('Gerado em: ' + new Date().toLocaleString('pt-BR'));
    linhas.push('');
    linhas.push('Receita contratada: ' + OBRAS.helpers.money(m.receitaContratada));
    linhas.push('Receita recebida: ' + OBRAS.helpers.money(m.receitaRecebida));
    linhas.push('A receber: ' + OBRAS.helpers.money(m.aReceberObras));
    linhas.push('A pagar previsto: ' + OBRAS.helpers.money(m.aPagarPrevisto));
    linhas.push('Caixa realizado: ' + OBRAS.helpers.money(m.caixaRealizado));
    linhas.push('Caixa projetado: ' + OBRAS.helpers.money(m.caixaProjetado));
    linhas.push('');
    linhas.push('OBRAS:');
    (m.obras || []).forEach(function(o){
      linhas.push('- ' + o.numeroOS + ' | ' + o.nome + ' | Parceiro ' + (o.parceiroNome || '-') + ' | Cliente ' + (o.clienteNome || '-') + ' | Contrato ' + OBRAS.helpers.money(o.valorObra) + ' | Recebido ' + OBRAS.helpers.money(o.totalRecebido) + ' | A receber ' + OBRAS.helpers.money(o.saldoReceber) + ' | Resultado ' + OBRAS.helpers.money(o.resultadoLiquido));
    });
    return linhas.join('\n');
  },

  exportRelatorioTXT: function(){
    try {
      var content = this.generateResumoRelatorio();
      var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio-controle-obras.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      OBRAS.ui.toast('Relatório exportado em TXT.');
    } catch (err) {
      OBRAS.ui.toast('Falha ao exportar relatório.');
      if (window.console) console.error(err);
    }
  },



  getSupabaseClient: function(){
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Biblioteca Supabase não carregada.');
    }
    if (!OBRAS._supabaseClient) {
      OBRAS._supabaseClient = window.supabase.createClient(
        OBRAS.config.SUPABASE_URL,
        OBRAS.config.SUPABASE_ANON_KEY
      );
    }
    return OBRAS._supabaseClient;
  },

  cloudEnabled: function(){
    return !!(OBRAS.state.cloud && OBRAS.state.cloud.enabled !== false && OBRAS.config.AUTO_SYNC_ENABLED);
  },

  nextCode: function(prefix, index){
    return prefix + '-' + String(index + 1).padStart(3, '0');
  },

  sameName: function(a, b){
    return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
  },

  markCloudStatus: function(status){
    OBRAS.state.cloud = OBRAS.state.cloud || {};
    OBRAS.state.cloud.projectUrl = OBRAS.config.SUPABASE_URL;
    OBRAS.state.cloud.enabled = true;
    OBRAS.state.cloud.mode = 'automatico';
    OBRAS.state.cloud.auto = true;
    OBRAS.state.cloud.online = !!navigator.onLine;
    OBRAS.state.cloud.lastSyncAt = new Date().toISOString();
    OBRAS.state.cloud.lastSyncStatus = status;
  },

  maxRemoteUpdatedAt: function(snapshot){
    var dates = [];
    Object.keys(snapshot || {}).forEach(function(key){
      var rows = Array.isArray(snapshot[key]) ? snapshot[key] : [];
      rows.forEach(function(row){
        if (row && row.updated_at) dates.push(String(row.updated_at));
        if (row && row.created_at) dates.push(String(row.created_at));
      });
    });
    return dates.sort().slice(-1)[0] || '';
  },

  remoteHasData: function(snapshot){
    return Object.keys(snapshot || {}).some(function(key){
      var rows = Array.isArray(snapshot[key]) ? snapshot[key] : [];
      return rows.length > 0;
    });
  },



  hasMeaningfulLocalData: function(db){
    db = db || OBRAS.state || {};
    return [
      'empresas','clientes','parceiros','obras','recebimentos','repasses',
      'pagamentosParceiros','despesas','despesasGerais','movimentosCaixa',
      'despesasFixas','recurringIgnore'
    ].some(function(key){
      return Array.isArray(db[key]) && db[key].length > 0;
    });
  },

  normalizeRemoteSnapshot: function(snapshot){
    snapshot = snapshot || {};
    var keys = ['empresas','clientes','parceiros','obras','repasses','recebimentos','pagamentos_parceiros','despesas','despesas_gerais','movimentos_caixa','despesas_fixas','ignorados_recorrencia'];
    keys.forEach(function(key){
      if (!Array.isArray(snapshot[key])) snapshot[key] = [];
    });
    snapshot._cloudControl = snapshot._cloudControl || {};
    return snapshot;
  },

  inferSeqOS: function(obras){
    return (obras || []).reduce(function(max, item){
      var n = parseInt(String(item.numeroOS || item.numero_os || '').replace(/[^0-9]/g,''), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
  },

  buildSupabaseRows: function(){
    var db = OBRAS.state;
    var now = new Date().toISOString();

    var empresas = (db.empresas || []).map(function(item, i){
      return {
        id: item.id || OBRAS.helpers.uid('empresas'),
        codigo: item.codigo || OBRAS.services.nextCode('EO', i),
        nome: item.nome || '',
        observacoes: item.observacoes || item.contato || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var clientes = (db.clientes || []).map(function(item, i){
      return {
        id: item.id || OBRAS.helpers.uid('clientes'),
        codigo: item.codigo || OBRAS.services.nextCode('CL', i),
        nome: item.nome || '',
        observacoes: item.observacoes || item.contato || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var parceiros = (db.parceiros || []).map(function(item, i){
      return {
        id: item.id || OBRAS.helpers.uid('parceiros'),
        codigo: item.codigo || OBRAS.services.nextCode('PA', i),
        nome: item.nome || '',
        observacoes: item.observacoes || item.contato || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    function findEmpresaByName(name){
      return empresas.find(function(x){ return OBRAS.services.sameName(x.nome, name); }) || null;
    }
    function findClienteByName(name){
      return clientes.find(function(x){ return OBRAS.services.sameName(x.nome, name); }) || null;
    }
    function findParceiroByName(name){
      return parceiros.find(function(x){ return OBRAS.services.sameName(x.nome, name); }) || null;
    }

    var obras = (db.obras || []).map(function(item){
      var emp = findEmpresaByName(item.empresaNome || (db.empresa && db.empresa.nome) || '');
      var cli = findClienteByName(item.clienteNome || '');
      return {
        id: item.id || OBRAS.helpers.uid('obra'),
        numero_os: item.numeroOS || item.os || '',
        data_abertura: item.dataAbertura || OBRAS.helpers.todayISO(),
        empresa_id: item.empresaId || (emp ? emp.id : null),
        empresa_nome: item.empresaNome || (emp ? emp.nome : ((db.empresa && db.empresa.nome) || 'TELESITES')),
        cliente_id: item.clienteId || (cli ? cli.id : null),
        cliente_nome: item.clienteNome || (cli ? cli.nome : ''),
        site_torre: item.siteTorre || item.nome || '',
        cidade: item.cidade || '',
        status_obra: item.statusObra || 'Planejado',
        valor_obra: Number(item.valorObra || 0),
        observacoes: item.observacoes || '',
        status_ciclo_os: item.statusCicloOS || 'Ativa',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var repasses = (db.repasses || []).map(function(item){
      var par = findParceiroByName(item.parceiroNome || '');
      return {
        id: item.id || OBRAS.helpers.uid('rep'),
        os: item.os || '',
        parceiro_id: item.parceiroId || (par ? par.id : null),
        parceiro_nome: item.parceiroNome || (par ? par.nome : ''),
        valor_fechado_parceiro: Number(item.valorFechadoParceiro || 0),
        observacoes: item.observacoes || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var recebimentos = (db.recebimentos || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('rec'),
        os: item.os || '',
        data_recebimento: item.dataRecebimento || item.data || OBRAS.helpers.todayISO(),
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        observacoes: item.observacoes || item.observacao || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var pagamentos = (db.pagamentosParceiros || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('pag'),
        os: item.os || '',
        competencia: item.competencia || ((item.dataVencimento || OBRAS.helpers.todayISO()).slice(0,7)),
        data_vencimento: item.dataVencimento || item.data || OBRAS.helpers.todayISO(),
        data_pagamento_real: item.dataPagamentoReal || null,
        natureza: item.natureza || 'pagamento',
        valor: Number(item.valor || 0),
        descricao: item.descricao || '',
        observacoes: item.observacoes || item.observacao || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var despesas = (db.despesas || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('desp'),
        os: item.os || '',
        competencia: item.competencia || ((item.dataVencimento || OBRAS.helpers.todayISO()).slice(0,7)),
        data_despesa: item.dataDespesa || item.data_despesa || item.data || item.dataVencimento || OBRAS.helpers.todayISO(),
        tipo_despesa: item.tipoDespesa || item.tipo_despesa || 'Despesa obra',
        data_vencimento: item.dataVencimento || item.data_vencimento || item.data || OBRAS.helpers.todayISO(),
        data_pagamento_real: item.dataPagamentoReal || item.data_pagamento_real || null,
        valor: Number(item.valor || 0),
        origem_custo: item.origemCusto || item.origem_custo || '',
        obs_outras_despesas: item.obsOutrasDespesas || item.obs_outras_despesas || '',
        observacoes: item.observacoes || item.observacao || '',
        gerada_automaticamente: !!(item.geradaAutomaticamente || item.gerada_automaticamente),
        origem_lancamento: item.origemLancamento || item.origem_lancamento || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var despesasGerais = (db.despesasGerais || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('despgeral'),
        competencia: item.competencia || ((item.dataVencimento || OBRAS.helpers.todayISO()).slice(0,7)),
        data: item.data || item.dataVencimento || OBRAS.helpers.todayISO(),
        tipo_despesa: item.tipoDespesa || 'Despesa geral',
        data_vencimento: item.dataVencimento || OBRAS.helpers.todayISO(),
        data_pagamento_real: item.dataPagamentoReal || null,
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        origem: item.origem || '',
        observacoes: item.observacoes || '',
        gerada_automaticamente: !!item.geradaAutomaticamente,
        regra_fixa_id: item.regraFixaId || item.recorrenciaId || null,
        ignorada: !!item.ignorada,
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var movimentosCaixa = (db.movimentosCaixa || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('mov'),
        data_movimento: item.dataMovimento || item.data || OBRAS.helpers.todayISO(),
        tipo: item.tipo || 'movimento',
        natureza: item.natureza || '',
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        observacoes: item.observacoes || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var despesasFixas = (db.despesasFixas || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('fixa'),
        tipo_despesa: item.tipoDespesa || '',
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        dia_fixo: Number(item.diaFixo || 1),
        competencia_inicio: item.competenciaInicio || OBRAS.helpers.todayISO().slice(0,7),
        ativa: item.ativa !== false,
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var ignorados = (db.recurringIgnore || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('ign'),
        regra_fixa_id: item.regraFixaId || item.regra_fixa_id || item.recorrenciaId || '',
        competencia: item.competencia || '',
        user_id: (db.session && db.session.userId) || ''
      };
    });

    return {
      empresas: empresas,
      clientes: clientes,
      parceiros: parceiros,
      obras: obras,
      repasses: repasses,
      recebimentos: recebimentos,
      pagamentos_parceiros: pagamentos,
      despesas: despesas,
      despesas_gerais: despesasGerais,
      movimentos_caixa: movimentosCaixa,
      despesas_fixas: despesasFixas,
      ignorados_recorrencia: ignorados
    };
  },


  buildSyncPayload: function(){
    return {
      empresas: OBRAS.state.empresas || [],
      clientes: OBRAS.state.clientes || [],
      parceiros: OBRAS.state.parceiros || [],
      obras: OBRAS.state.obras || [],
      recebimentos: OBRAS.state.recebimentos || [],
      repasses: OBRAS.state.repasses || [],
      pagamentosParceiros: OBRAS.state.pagamentosParceiros || [],
      despesas: OBRAS.state.despesas || [],
      despesasGerais: OBRAS.state.despesasGerais || [],
      movimentosCaixa: OBRAS.state.movimentosCaixa || [],
      despesasFixas: OBRAS.state.despesasFixas || [],
      recurringIgnore: OBRAS.state.recurringIgnore || []
    };
  },

  computePayloadHash: function(payload){
    try {
      var json = JSON.stringify(payload || {});
      var hash = 0, i, chr;
      if (!json.length) return 'h0';
      for (i = 0; i < json.length; i += 1) {
        chr = json.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return 'h' + Math.abs(hash);
    } catch (err) {
      console.error(err);
      return 'h0';
    }
  },

  ensureCloudControl: function(){
    OBRAS.state.cloudControl = OBRAS.state.cloudControl || {};
    if (!OBRAS.state.cloudControl.baseId) {
      var email = (OBRAS.state.session && OBRAS.state.session.userEmail) || 'local';
      var safe = String(email).toLowerCase().replace(/[^a-z0-9]+/g, '_');
      OBRAS.state.cloudControl.baseId = 'base_' + safe;
    }
    if (!OBRAS.state.cloudControl.userId) {
      OBRAS.state.cloudControl.userId = (OBRAS.state.session && OBRAS.state.session.userId) || '';
    }
    var payload = this.buildSyncPayload();
    OBRAS.state.cloudControl.lastHash = this.computePayloadHash(payload);
    OBRAS.state.cloudControl.lastSyncAt = OBRAS.state.cloudControl.lastSyncAt || '';
    return OBRAS.state.cloudControl;
  },

  updateCloudControlAfterSave: function(){
    this.ensureCloudControl();
    OBRAS.state.cloudControl.lastHash = this.computePayloadHash(this.buildSyncPayload());
    OBRAS.state.cloudControl.lastSyncAt = new Date().toISOString();
    return OBRAS.state.cloudControl;
  },

  validateRemoteSnapshot: function(snapshot){
    var localCtl = this.ensureCloudControl();
    var remoteCtl = snapshot && snapshot._cloudControl ? snapshot._cloudControl : {};
    if (remoteCtl.userId && localCtl.userId && remoteCtl.userId !== localCtl.userId) {
      return { ok:false, reason:'Usuário da nuvem diferente do usuário local.' };
    }
    if (remoteCtl.baseId && localCtl.baseId && remoteCtl.baseId !== localCtl.baseId) {
      return { ok:false, reason:'Base da nuvem diferente da base local.' };
    }
    var localObras = (OBRAS.state.obras || []).length;
    var remoteObras = (snapshot.obras || []).length;
    if (localObras > 0 && remoteObras > 0 && remoteObras < localObras) {
      return { ok:false, reason:'Nuvem com menos obras que a base local. Download bloqueado.' };
    }
    return { ok:true, remote:remoteCtl, local:localCtl };
  },

  fetchRemoteSnapshot: async function(){
    var client = this.getSupabaseClient();
    var tables = ['empresas','clientes','parceiros','obras','repasses','recebimentos','pagamentos_parceiros','despesas','despesas_gerais','movimentos_caixa','despesas_fixas','ignorados_recorrencia'];
    var out = {};
    var userId = OBRAS.state && OBRAS.state.session ? (OBRAS.state.session.userId || '') : '';
    for (var i = 0; i < tables.length; i += 1) {
      var t = tables[i];
      var query = client.from(t).select('*');
      if (userId) query = query.eq('user_id', userId);
      var result = await query;
      if (result.error) {
        throw new Error('Tabela "' + t + '" sem coluna user_id. Corrija o banco antes de sincronizar.');
      }
      out[t] = Array.isArray(result.data) ? result.data : [];
    }
    out._cloudControl = {
      baseId: OBRAS.state.cloudControl && OBRAS.state.cloudControl.baseId ? OBRAS.state.cloudControl.baseId : '',
      userId: userId,
      lastHash: this.computePayloadHash({
        empresas: out.empresas || [],
        clientes: out.clientes || [],
        parceiros: out.parceiros || [],
        obras: out.obras || [],
        recebimentos: out.recebimentos || [],
        repasses: out.repasses || [],
        pagamentosParceiros: (out.pagamentos_parceiros || []),
        despesas: out.despesas || [],
        despesasGerais: (out.despesas_gerais || []),
        movimentosCaixa: (out.movimentos_caixa || []),
        despesasFixas: (out.despesas_fixas || []),
        recurringIgnore: (out.ignorados_recorrencia || [])
      }),
      lastSyncAt: new Date().toISOString()
    };
    return out;
  },

  hasRemoteData: function(snapshot){
    var keys = ['empresas','clientes','parceiros','obras','repasses','recebimentos','pagamentos_parceiros','despesas','despesas_gerais','movimentos_caixa','despesas_fixas','ignorados_recorrencia'];
    return keys.some(function(k){ return Array.isArray(snapshot[k]) && snapshot[k].length > 0; });
  },

  bootstrapAutoSync: async function(){
    if (!OBRAS.state.session || !OBRAS.state.session.loggedIn) return false;
    try {
      var snapshot = this.normalizeRemoteSnapshot(await this.fetchRemoteSnapshot());

      // Prioridade total para download. Nunca subir base vazia no boot.
      if (this.hasRemoteData(snapshot)) {
        var check = this.validateRemoteSnapshot(snapshot);
        if (!check.ok) {
          OBRAS.ui.toast(check.reason);
          return false;
        }
        OBRAS.state = this.applyRemoteSnapshot(snapshot);
        this.updateCloudControlAfterSave();
        OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
        OBRAS.stateApi.save();
        OBRAS.app.render();
        OBRAS.ui.toast('Dados carregados da nuvem.');
        return true;
      }

      // Se a nuvem estiver vazia, só mantém local. Não envia automaticamente.
      if (this.hasMeaningfulLocalData(OBRAS.state)) {
        OBRAS.ui.toast('Nuvem vazia. Use "Forçar envio agora" para publicar sua base.');
        return false;
      }

      OBRAS.ui.toast('Nuvem vazia e base local vazia.');
      return false;
    } catch (err) {
      console.error(err);
      OBRAS.ui.toast('Falha ao baixar dados da nuvem.');
      return false;
    }
  },

  forceCloudUpload: async function(){
    try {
      if (!this.hasMeaningfulLocalData(OBRAS.state)) {
        OBRAS.ui.toast('Upload bloqueado: base local vazia.');
        return false;
      }
      this.updateCloudControlAfterSave();
      await this.uploadAllToSupabase(true);
      OBRAS.state.cloud = OBRAS.state.cloud || {};
      OBRAS.state.cloud.online = true;
      OBRAS.state.cloud.lastSyncAt = new Date().toISOString();
      OBRAS.state.cloud.lastSyncStatus = 'Envio manual concluído';
      OBRAS.state.cloudControl.lastSyncAt = OBRAS.state.cloud.lastSyncAt;
      OBRAS.stateApi.save();
      OBRAS.ui.toast('Backup enviado para a nuvem.');
      return true;
    } catch (err) {
      console.error(err);
      OBRAS.ui.toast('Erro ao enviar para a nuvem.');
      return false;
    }
  },

  forceCloudDownload: async function(){
    try {
      var snapshot = this.normalizeRemoteSnapshot(await this.fetchRemoteSnapshot());
      if (!this.hasRemoteData(snapshot)) {
        OBRAS.ui.toast('A nuvem está vazia.');
        return false;
      }
      var check = this.validateRemoteSnapshot(snapshot);
      if (!check.ok) {
        OBRAS.ui.toast(check.reason);
        return false;
      }
      if (OBRAS.state.cloudControl && OBRAS.state.cloudControl.lastHash && check.remote && check.remote.lastHash && OBRAS.state.cloudControl.lastHash !== check.remote.lastHash) {
        var ok = window.confirm('A nuvem está diferente da base local. Deseja substituir os dados locais pela nuvem?');
        if (!ok) return false;
      }
      OBRAS.state = this.applyRemoteSnapshot(snapshot);
      this.updateCloudControlAfterSave();
      OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
      OBRAS.stateApi.save();
      OBRAS.app.render();
      OBRAS.ui.toast('Download da nuvem concluído.');
      return true;
    } catch (err) {
      console.error(err);
      OBRAS.ui.toast('Erro ao baixar dados da nuvem.');
      return false;
    }
  },

  openImportDialog: function(){
    var input = document.getElementById('backup-import-input');
    if (input) input.click();
  },

  submitCadastro: function(){
    var form = document.getElementById('cadastro-form');
    if (!form) return;
    var tipo = document.getElementById('cad-tipo').value;
    var nome = document.getElementById('cad-nome').value.trim();
    var contato = document.getElementById('cad-contato').value.trim();
    var telefone = document.getElementById('cad-telefone').value.trim();
    var cidade = document.getElementById('cad-cidade').value.trim();
    var id = form.getAttribute('data-edit-id');
    if (!tipo || !nome) {
      OBRAS.ui.toast('Preencha tipo e nome.');
      return;
    }
    var targetKey = tipo === 'empresa' ? 'empresas' : (tipo === 'parceiro' ? 'parceiros' : 'clientes');
    var payload = {
      id: id || OBRAS.helpers.uid(tipo),
      nome: nome,
      contato: contato,
      telefone: telefone,
      cidade: cidade
    };
    var list = OBRAS.state[targetKey];
    var idx = list.findIndex(function(x){ return x.id === payload.id; });
    if (idx >= 0) list[idx] = payload;
    else list.push(payload);
    OBRAS.state.form = {};
    OBRAS.stateApi.save();
    OBRAS.router.goTo(OBRAS.config.SCREENS.CADASTROS);
    OBRAS.ui.toast(idx >= 0 ? 'Cadastro atualizado.' : 'Cadastro criado.');
  },

  editCadastro: function(tipo, id){
    var key = tipo === 'empresa' ? 'empresas' : (tipo === 'parceiro' ? 'parceiros' : 'clientes');
    var item = (OBRAS.state[key] || []).find(function(x){ return x.id === id; });
    if (!item) return;
    OBRAS.state.form = { cadastro: { tipo: tipo, id: item.id, nome: item.nome, contato: item.contato || '', telefone: item.telefone || '', cidade: item.cidade || '' } };
    OBRAS.router.goTo(OBRAS.config.SCREENS.CADASTROS);
  },

  deleteCadastro: function(tipo, id){
    var key = tipo === 'empresa' ? 'empresas' : (tipo === 'parceiro' ? 'parceiros' : 'clientes');
    var list = OBRAS.state[key] || [];
    var item = list.find(function(x){ return x.id === id; });
    if (!item) return;
    if (!window.confirm('Excluir ' + item.nome + '?')) return;
    OBRAS.state[key] = list.filter(function(x){ return x.id !== id; });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Cadastro removido.');
  },

  clearCadastroForm: function(){
    OBRAS.state.form = {};
    OBRAS.router.goTo(OBRAS.config.SCREENS.CADASTROS);
  },

  setObrasFiltersFromDOM: function(){
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.obrasFilters = {
      query: (document.getElementById('obra-filtro-busca') || {}).value || '',
      status: (document.getElementById('obra-filtro-status') || {}).value || 'todos',
      cidade: (document.getElementById('obra-filtro-cidade') || {}).value || '',
      parceiro: (document.getElementById('obra-filtro-parceiro') || {}).value || '',
      cliente: (document.getElementById('obra-filtro-cliente') || {}).value || ''
    };
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },

  clearObrasFilters: function(){
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.obrasFilters = { query:'', status:'todos', cidade:'', parceiro:'', cliente:'' };
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },

  setFinanceFiltersFromDOM: function(){
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.financeFilters = {
      query: (document.getElementById('fin-filtro-busca') || {}).value || '',
      tipo: (document.getElementById('fin-filtro-tipo') || {}).value || 'todos',
      status: (document.getElementById('fin-filtro-status') || {}).value || 'todos',
      obra: (document.getElementById('fin-filtro-obra') || {}).value || ''
    };
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },

  clearFinanceFilters: function(){
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.financeFilters = { query:'', tipo:'todos', status:'todos', obra:'' };
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },


  autofillObraFromSelectedOS: function(){
    var osValue = (document.getElementById('obra-numero-os') || {}).value || '';
    if (!osValue) return;
    var obra = (OBRAS.state.obras || []).find(function(x){ return x.numeroOS === osValue; });
    if (!obra) return;
    var setVal = function(id, value){
      var el = document.getElementById(id);
      if (el && !el.value) el.value = value || '';
    };
    setVal('obra-nome', obra.siteTorre);
    setVal('obra-cidade', obra.cidade);
    setVal('obra-valor', obra.valorObra);
    setVal('obra-parceiro', obra.parceiroNome);
    setVal('obra-cliente', obra.clienteNome);
    setVal('obra-etapa', obra.etapa);
    var statusEl = document.getElementById('obra-status');
    if (statusEl && !statusEl.value) statusEl.value = obra.statusObra || 'Planejado';
    setVal('obra-data', obra.dataAbertura);
  },

  openObraDetail: function(id){
    var obra = (OBRAS.state.obras || []).find(function(x){ return x.id === id; });
    if (!obra) {
      OBRAS.ui.toast('Obra não encontrada.');
      return;
    }
    OBRAS.state.ui = OBRAS.state.ui || {};
    OBRAS.state.ui.selectedObraId = id;
    OBRAS.stateApi.save();
    OBRAS.router.goTo(OBRAS.config.SCREENS.OBRA_DETALHE);
  },

  getSelectedObra: function(){
    var id = OBRAS.state.ui && OBRAS.state.ui.selectedObraId;
    if (!id) return null;
    return (OBRAS.state.obras || []).find(function(x){ return x.id === id; }) || null;
  },

  submitObraRecebimento: function(){
    var obra = this.getSelectedObra();
    if (!obra) return;
    var valor = OBRAS.helpers.toNumber(document.getElementById('det-rec-valor').value);
    var data = document.getElementById('det-rec-data').value || OBRAS.helpers.todayISO();
    var obs = document.getElementById('det-rec-obs').value.trim();
    if (!valor) { OBRAS.ui.toast('Informe o valor do recebimento.'); return; }
    var edit = OBRAS.state.form && OBRAS.state.form.obraLancamentoEdit;
    if (edit && edit.kind === 'rec') {
      var rec = (OBRAS.state.recebimentos || []).find(function(x){ return x.id === edit.id; });
      if (!rec) { OBRAS.ui.toast('Recebimento não encontrado.'); return; }
      OBRAS.services.updateObraLancamento('rec', rec, valor, data, obs, '');
      delete OBRAS.state.form.obraLancamentoEdit;
      OBRAS.stateApi.save();
      OBRAS.app.render();
      OBRAS.ui.toast('Recebimento atualizado.');
      return;
    }
    OBRAS.state.recebimentos.push({
      id: OBRAS.helpers.uid('rec'),
      obraId: obra.id,
      os: obra.numeroOS,
      valor: valor,
      data: data,
      dataRecebimento: data,
      observacao: obs,
      observacoes: obs,
      descricao: obs || 'Recebimento',
      status: 'recebido'
    });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Recebimento lançado.');
  },

  submitObraPagamento: function(){
    var obra = this.getSelectedObra();
    if (!obra) return;
    var valor = OBRAS.helpers.toNumber(document.getElementById('det-pag-valor').value);
    var data = document.getElementById('det-pag-data').value || OBRAS.helpers.todayISO();
    var obs = document.getElementById('det-pag-obs').value.trim();
    if (!valor) { OBRAS.ui.toast('Informe o valor do pagamento.'); return; }
    var edit = OBRAS.state.form && OBRAS.state.form.obraLancamentoEdit;
    if (edit && edit.kind === 'pag') {
      var pag = (OBRAS.state.pagamentosParceiros || []).find(function(x){ return x.id === edit.id; });
      if (!pag) { OBRAS.ui.toast('Pagamento não encontrado.'); return; }
      OBRAS.services.updateObraLancamento('pag', pag, valor, data, obs, '');
      delete OBRAS.state.form.obraLancamentoEdit;
      OBRAS.stateApi.save();
      OBRAS.app.render();
      OBRAS.ui.toast('Pagamento parceiro atualizado.');
      return;
    }
    OBRAS.state.pagamentosParceiros.push({
      id: OBRAS.helpers.uid('pag'),
      obraId: obra.id,
      os: obra.numeroOS,
      valor: valor,
      data: data,
      dataVencimento: data,
      dataPagamentoReal: data,
      observacao: obs,
      observacoes: obs,
      descricao: obs || 'Pagamento parceiro',
      status: 'pago'
    });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Pagamento parceiro lançado.');
  },

  submitObraDespesa: function(){
    var obra = this.getSelectedObra();
    if (!obra) return;
    var valor = OBRAS.helpers.toNumber(document.getElementById('det-desp-valor').value);
    var data = document.getElementById('det-desp-data').value || OBRAS.helpers.todayISO();
    var tipo = document.getElementById('det-desp-tipo').value || 'obra';
    var obs = document.getElementById('det-desp-obs').value.trim();
    if (!valor) { OBRAS.ui.toast('Informe o valor da despesa.'); return; }
    var edit = OBRAS.state.form && OBRAS.state.form.obraLancamentoEdit;
    if (edit && edit.kind === 'desp') {
      var desp = (OBRAS.state.despesas || []).find(function(x){ return x.id === edit.id; });
      if (!desp) { OBRAS.ui.toast('Despesa não encontrada.'); return; }
      OBRAS.services.updateObraLancamento('desp', desp, valor, data, obs, tipo);
      delete OBRAS.state.form.obraLancamentoEdit;
      OBRAS.stateApi.save();
      OBRAS.app.render();
      OBRAS.ui.toast('Despesa atualizada.');
      return;
    }
    OBRAS.state.despesas.push({
      id: OBRAS.helpers.uid('desp'),
      obraId: obra.id,
      os: obra.numeroOS,
      valor: valor,
      data: data,
      dataDespesa: data,
      dataVencimento: data,
      dataPagamentoReal: data,
      tipo: tipo,
      tipoDespesa: tipo,
      observacao: obs,
      observacoes: obs,
      status: 'pago'
    });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Despesa da obra lançada.');
  },

  loginLocal: function(name, password){
    return this.loginSupabase(name, password);
  },
  logout: function(){
    return this.logoutSupabase();
  },

  loginSupabase: async function(email, password){
    try {
      if (!String(email || '').trim() || !String(password || '').trim()) {
        OBRAS.ui.toast('Informe email e senha.');
        return false;
      }
      var response = await OBRAS.services.getSupabaseClient().auth.signInWithPassword({
        email: String(email).trim(),
        password: String(password)
      });
      if (response.error) {
        OBRAS.ui.toast('Login inválido: ' + response.error.message);
        return false;
      }
      var user = response.data && response.data.user ? response.data.user : null;
      OBRAS.state.session.loggedIn = true;
      OBRAS.state.session.userName = (user && user.user_metadata && (user.user_metadata.nome || user.user_metadata.name)) || (user && user.email) || String(email).trim();
      OBRAS.state.session.userEmail = (user && user.email) || String(email).trim();
      OBRAS.state.session.userId = (user && user.id) || '';
      OBRAS.state.session.accessMode = 'supabase-auth';
      OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
      OBRAS.stateApi.save();
      try { await OBRAS.services.bootstrapAutoSync(); } catch (e) { console.error(e); }
      return true;
    } catch (err) {
      console.error(err);
      OBRAS.ui.toast('Erro ao entrar com Supabase.');
      return false;
    }
  },

  restoreSupabaseSession: async function(){
    try {
      var response = await OBRAS.services.getSupabaseClient().auth.getSession();
      if (response.error) {
        console.error(response.error);
        return false;
      }
      var session = response.data && response.data.session ? response.data.session : null;
      if (!session || !session.user) return false;
      var user = session.user;
      OBRAS.state.session.loggedIn = true;
      OBRAS.state.session.userName = (user.user_metadata && (user.user_metadata.nome || user.user_metadata.name)) || user.email || 'Usuário';
      OBRAS.state.session.userEmail = user.email || '';
      OBRAS.state.session.userId = user.id || '';
      OBRAS.state.session.accessMode = 'supabase-auth';
      OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
      OBRAS.stateApi.save();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  logoutSupabase: async function(){
    try {
      await OBRAS.services.getSupabaseClient().auth.signOut();
    } catch (err) {
      console.error(err);
    }
    OBRAS.state.session.loggedIn = false;
    OBRAS.state.session.userName = '';
    OBRAS.state.session.userEmail = '';
    OBRAS.state.session.userId = '';
    OBRAS.state.session.accessMode = '';
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.LOGIN;
    OBRAS.state.form = {};
    OBRAS.stateApi.save();
  },

  resetBase: function(){
    if (!window.confirm('Resetar a base local da Fase 2?')) return;
    OBRAS.storage.reset();
    OBRAS.stateApi.initialize(true);
    OBRAS.app.render();
    OBRAS.ui.toast('Base local zerada com sucesso.');
  },
  useDemoData: function(){
    OBRAS.state = OBRAS.models.createEmptyDB();
    OBRAS.state.session.loggedIn = true;
    OBRAS.state.session.userName = OBRAS.state.session.userName || '';
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
    OBRAS.state.form = {};
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },
  submitObra: function(){
    var form = document.getElementById('obra-form');
    if (!form) return;
    var id = form.getAttribute('data-edit-id');
    var numeroOS = document.getElementById('obra-numero-os').value.trim();
    var siteTorre = document.getElementById('obra-nome').value.trim();
    var cidade = document.getElementById('obra-cidade').value.trim();
    var valorObra = Number(document.getElementById('obra-valor').value || 0);
    var parceiroNome = document.getElementById('obra-parceiro').value.trim();
    var clienteNome = document.getElementById('obra-cliente') ? document.getElementById('obra-cliente').value.trim() : '';
    var etapa = document.getElementById('obra-etapa').value.trim();
    var statusObra = document.getElementById('obra-status').value;
    if (!siteTorre || !cidade || !valorObra) {
      OBRAS.ui.toast('Preencha obra, cidade e valor.');
      return;
    }
    var payload = {
      id: id || OBRAS.helpers.uid('obra'),
      numeroOS: numeroOS || OBRAS.rules.nextOS(OBRAS.state),
      siteTorre: siteTorre,
      cidade: cidade,
      valorObra: valorObra,
      parceiroNome: parceiroNome,
      clienteNome: clienteNome,
      etapa: etapa,
      statusObra: statusObra,
      statusCicloOS: 'Ativa',
      dataAbertura: document.getElementById('obra-data').value || OBRAS.helpers.todayISO()
    };
    var idx = OBRAS.state.obras.findIndex(function(x){ return x.id === payload.id; });
    if (idx >= 0) OBRAS.state.obras[idx] = payload;
    else OBRAS.state.obras.push(payload);
    OBRAS.services.syncAutoNfExpenses();
    OBRAS.state.form = {};
    OBRAS.stateApi.save();
    OBRAS.router.goTo(OBRAS.config.SCREENS.OBRAS);
    OBRAS.ui.toast(idx >= 0 ? 'Obra atualizada.' : 'Obra cadastrada.');
  },
  editObra: function(id){
    var obra = OBRAS.state.obras.find(function(x){ return x.id === id; });
    if (!obra) return;
    OBRAS.state.form = {
      obra: {
        id: obra.id,
        numeroOS: obra.numeroOS,
        siteTorre: obra.siteTorre,
        cidade: obra.cidade,
        valorObra: obra.valorObra,
        parceiroNome: obra.parceiroNome,
        clienteNome: obra.clienteNome || '',
        etapa: obra.etapa,
        statusObra: obra.statusObra,
        dataAbertura: obra.dataAbertura
      }
    };
    OBRAS.router.goTo(OBRAS.config.SCREENS.OBRAS);
  },
  deleteObra: function(id){
    var obra = OBRAS.state.obras.find(function(x){ return x.id === id; });
    if (!obra) return;
    if (!window.confirm('Excluir a obra ' + obra.numeroOS + '?')) return;
    OBRAS.state.obras = OBRAS.state.obras.filter(function(x){ return x.id !== id; });
    OBRAS.state.recebimentos = OBRAS.state.recebimentos.filter(function(x){ return x.os !== obra.numeroOS; });
    OBRAS.state.repasses = OBRAS.state.repasses.filter(function(x){ return x.os !== obra.numeroOS; });
    OBRAS.state.pagamentosParceiros = OBRAS.state.pagamentosParceiros.filter(function(x){ return x.os !== obra.numeroOS; });
    OBRAS.state.despesas = OBRAS.state.despesas.filter(function(x){ return x.os !== obra.numeroOS; });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Obra removida.');
  },
  submitRecebimento: function(){
    var os = document.getElementById('fin-os').value;
    var valor = Number(document.getElementById('fin-valor').value || 0);
    var data = document.getElementById('fin-data').value || OBRAS.helpers.todayISO();
    var tipo = document.getElementById('fin-tipo').value;
    var descricao = document.getElementById('fin-descricao').value.trim();
    if (!os || !valor) {
      OBRAS.ui.toast('Selecione a OS e o valor.');
      return;
    }
    if (tipo === 'recebimento') {
      OBRAS.state.recebimentos.push({ id: OBRAS.helpers.uid('rec'), os: os, descricao: descricao || 'Recebimento', dataRecebimento: data, valor: valor });
      OBRAS.ui.toast('Recebimento lançado.');
    } else if (tipo === 'pagamento') {
      OBRAS.state.pagamentosParceiros.push({ id: OBRAS.helpers.uid('pag'), os: os, descricao: descricao || 'Pagamento parceiro', dataVencimento: data, dataPagamentoReal: data, valor: valor, natureza:'pagamento' });
      OBRAS.ui.toast('Pagamento parceiro lançado.');
    } else {
      OBRAS.state.despesas.push({ id: OBRAS.helpers.uid('des'), os: os, tipoDespesa: descricao || 'Despesa da obra', dataVencimento: data, dataPagamentoReal: '', valor: valor, observacoes: descricao || '' });
      OBRAS.ui.toast('Despesa da obra lançada.');
    }
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },
  submitDespesaGeral: function(){
    var tipo = document.getElementById('geral-tipo').value.trim();
    var valor = Number(document.getElementById('geral-valor').value || 0);
    var venc = document.getElementById('geral-vencimento').value || OBRAS.helpers.todayISO();
    if (!tipo || !valor) {
      OBRAS.ui.toast('Preencha tipo e valor.');
      return;
    }
    OBRAS.state.despesasGerais.push({
      id: OBRAS.helpers.uid('ger'),
      tipoDespesa: tipo,
      dataVencimento: venc,
      dataPagamentoReal: document.getElementById('geral-paga').checked ? venc : '',
      valor: valor,
      observacoes: document.getElementById('geral-obs').value.trim()
    });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Despesa geral registrada.');
  },

  generateResumoRelatorio: function(){
    var m = OBRAS.rules.painelMetrics(OBRAS.state);
    var linhas = [];
    linhas.push('RELATÓRIO GERAL - CONTROLE DE OBRAS');
    linhas.push('Gerado em: ' + new Date().toLocaleString('pt-BR'));
    linhas.push('');
    linhas.push('Receita contratada: ' + OBRAS.helpers.money(m.receitaContratada));
    linhas.push('Receita recebida: ' + OBRAS.helpers.money(m.receitaRecebida));
    linhas.push('A receber: ' + OBRAS.helpers.money(m.aReceberObras));
    linhas.push('A pagar previsto: ' + OBRAS.helpers.money(m.aPagarPrevisto));
    linhas.push('Caixa realizado: ' + OBRAS.helpers.money(m.caixaRealizado));
    linhas.push('Caixa projetado: ' + OBRAS.helpers.money(m.caixaProjetado));
    linhas.push('');
    linhas.push('OBRAS:');
    (m.obras || []).forEach(function(o){
      linhas.push('- ' + o.numeroOS + ' | ' + o.nome + ' | Parceiro ' + (o.parceiroNome || '-') + ' | Cliente ' + (o.clienteNome || '-') + ' | Contrato ' + OBRAS.helpers.money(o.valorObra) + ' | Recebido ' + OBRAS.helpers.money(o.totalRecebido) + ' | A receber ' + OBRAS.helpers.money(o.saldoReceber) + ' | Resultado ' + OBRAS.helpers.money(o.resultadoLiquido));
    });
    return linhas.join('\n');
  },

  exportRelatorioTXT: function(){
    try {
      var content = this.generateResumoRelatorio();
      var blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio-controle-obras.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      OBRAS.ui.toast('Relatório exportado em TXT.');
    } catch (err) {
      OBRAS.ui.toast('Falha ao exportar relatório.');
      if (window.console) console.error(err);
    }
  },



  getSupabaseClient: function(){
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Biblioteca Supabase não carregada.');
    }
    if (!OBRAS._supabaseClient) {
      OBRAS._supabaseClient = window.supabase.createClient(
        OBRAS.config.SUPABASE_URL,
        OBRAS.config.SUPABASE_ANON_KEY
      );
    }
    return OBRAS._supabaseClient;
  },

  cloudEnabled: function(){
    return !!(OBRAS.state.cloud && OBRAS.state.cloud.enabled !== false && OBRAS.config.AUTO_SYNC_ENABLED);
  },

  nextCode: function(prefix, index){
    return prefix + '-' + String(index + 1).padStart(3, '0');
  },

  sameName: function(a, b){
    return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
  },

  markCloudStatus: function(status){
    OBRAS.state.cloud = OBRAS.state.cloud || {};
    OBRAS.state.cloud.projectUrl = OBRAS.config.SUPABASE_URL;
    OBRAS.state.cloud.enabled = true;
    OBRAS.state.cloud.mode = 'automatico';
    OBRAS.state.cloud.auto = true;
    OBRAS.state.cloud.online = !!navigator.onLine;
    OBRAS.state.cloud.lastSyncAt = new Date().toISOString();
    OBRAS.state.cloud.lastSyncStatus = status;
  },

  maxRemoteUpdatedAt: function(snapshot){
    var dates = [];
    Object.keys(snapshot || {}).forEach(function(key){
      var rows = Array.isArray(snapshot[key]) ? snapshot[key] : [];
      rows.forEach(function(row){
        if (row && row.updated_at) dates.push(String(row.updated_at));
        if (row && row.created_at) dates.push(String(row.created_at));
      });
    });
    return dates.sort().slice(-1)[0] || '';
  },

  remoteHasData: function(snapshot){
    return Object.keys(snapshot || {}).some(function(key){
      var rows = Array.isArray(snapshot[key]) ? snapshot[key] : [];
      return rows.length > 0;
    });
  },



  hasMeaningfulLocalData: function(db){
    db = db || OBRAS.state || {};
    return [
      'empresas','clientes','parceiros','obras','recebimentos','repasses',
      'pagamentosParceiros','despesas','despesasGerais','movimentosCaixa',
      'despesasFixas','recurringIgnore'
    ].some(function(key){
      return Array.isArray(db[key]) && db[key].length > 0;
    });
  },

  normalizeRemoteSnapshot: function(snapshot){
    snapshot = snapshot || {};
    var keys = ['empresas','clientes','parceiros','obras','repasses','recebimentos','pagamentos_parceiros','despesas','despesas_gerais','movimentos_caixa','despesas_fixas','ignorados_recorrencia'];
    keys.forEach(function(key){
      if (!Array.isArray(snapshot[key])) snapshot[key] = [];
    });
    snapshot._cloudControl = snapshot._cloudControl || {};
    return snapshot;
  },

  inferSeqOS: function(obras){
    return (obras || []).reduce(function(max, item){
      var n = parseInt(String(item.numeroOS || item.numero_os || '').replace(/[^0-9]/g,''), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
  },

  buildSupabaseRows: function(){
    var db = OBRAS.state;
    var now = new Date().toISOString();

    var empresas = (db.empresas || []).map(function(item, i){
      return {
        id: item.id || OBRAS.helpers.uid('empresas'),
        codigo: item.codigo || OBRAS.services.nextCode('EO', i),
        nome: item.nome || '',
        observacoes: item.observacoes || item.contato || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var clientes = (db.clientes || []).map(function(item, i){
      return {
        id: item.id || OBRAS.helpers.uid('clientes'),
        codigo: item.codigo || OBRAS.services.nextCode('CL', i),
        nome: item.nome || '',
        observacoes: item.observacoes || item.contato || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var parceiros = (db.parceiros || []).map(function(item, i){
      return {
        id: item.id || OBRAS.helpers.uid('parceiros'),
        codigo: item.codigo || OBRAS.services.nextCode('PA', i),
        nome: item.nome || '',
        observacoes: item.observacoes || item.contato || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    function findEmpresaByName(name){
      return empresas.find(function(x){ return OBRAS.services.sameName(x.nome, name); }) || null;
    }
    function findClienteByName(name){
      return clientes.find(function(x){ return OBRAS.services.sameName(x.nome, name); }) || null;
    }
    function findParceiroByName(name){
      return parceiros.find(function(x){ return OBRAS.services.sameName(x.nome, name); }) || null;
    }

    var obras = (db.obras || []).map(function(item){
      var emp = findEmpresaByName(item.empresaNome || (db.empresa && db.empresa.nome) || '');
      var cli = findClienteByName(item.clienteNome || '');
      return {
        id: item.id || OBRAS.helpers.uid('obra'),
        numero_os: item.numeroOS || item.os || '',
        data_abertura: item.dataAbertura || OBRAS.helpers.todayISO(),
        empresa_id: item.empresaId || (emp ? emp.id : null),
        empresa_nome: item.empresaNome || (emp ? emp.nome : ((db.empresa && db.empresa.nome) || 'TELESITES')),
        cliente_id: item.clienteId || (cli ? cli.id : null),
        cliente_nome: item.clienteNome || (cli ? cli.nome : ''),
        site_torre: item.siteTorre || item.nome || '',
        cidade: item.cidade || '',
        status_obra: item.statusObra || 'Planejado',
        valor_obra: Number(item.valorObra || 0),
        observacoes: item.observacoes || '',
        status_ciclo_os: item.statusCicloOS || 'Ativa',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var repasses = (db.repasses || []).map(function(item){
      var par = findParceiroByName(item.parceiroNome || '');
      return {
        id: item.id || OBRAS.helpers.uid('rep'),
        os: item.os || '',
        parceiro_id: item.parceiroId || (par ? par.id : null),
        parceiro_nome: item.parceiroNome || (par ? par.nome : ''),
        valor_fechado_parceiro: Number(item.valorFechadoParceiro || 0),
        observacoes: item.observacoes || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var recebimentos = (db.recebimentos || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('rec'),
        os: item.os || '',
        data_recebimento: item.dataRecebimento || item.data || OBRAS.helpers.todayISO(),
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        observacoes: item.observacoes || item.observacao || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var pagamentos = (db.pagamentosParceiros || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('pag'),
        os: item.os || '',
        competencia: item.competencia || ((item.dataVencimento || OBRAS.helpers.todayISO()).slice(0,7)),
        data_vencimento: item.dataVencimento || item.data || OBRAS.helpers.todayISO(),
        data_pagamento_real: item.dataPagamentoReal || null,
        natureza: item.natureza || 'pagamento',
        valor: Number(item.valor || 0),
        descricao: item.descricao || '',
        observacoes: item.observacoes || item.observacao || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var despesas = (db.despesas || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('desp'),
        os: item.os || '',
        competencia: item.competencia || ((item.dataVencimento || OBRAS.helpers.todayISO()).slice(0,7)),
        data_despesa: item.dataDespesa || item.data_despesa || item.data || item.dataVencimento || OBRAS.helpers.todayISO(),
        tipo_despesa: item.tipoDespesa || item.tipo_despesa || 'Despesa obra',
        data_vencimento: item.dataVencimento || item.data_vencimento || item.data || OBRAS.helpers.todayISO(),
        data_pagamento_real: item.dataPagamentoReal || item.data_pagamento_real || null,
        valor: Number(item.valor || 0),
        origem_custo: item.origemCusto || item.origem_custo || '',
        obs_outras_despesas: item.obsOutrasDespesas || item.obs_outras_despesas || '',
        observacoes: item.observacoes || item.observacao || '',
        gerada_automaticamente: !!(item.geradaAutomaticamente || item.gerada_automaticamente),
        origem_lancamento: item.origemLancamento || item.origem_lancamento || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var despesasGerais = (db.despesasGerais || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('despgeral'),
        competencia: item.competencia || ((item.dataVencimento || OBRAS.helpers.todayISO()).slice(0,7)),
        data: item.data || item.dataVencimento || OBRAS.helpers.todayISO(),
        tipo_despesa: item.tipoDespesa || 'Despesa geral',
        data_vencimento: item.dataVencimento || OBRAS.helpers.todayISO(),
        data_pagamento_real: item.dataPagamentoReal || null,
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        origem: item.origem || '',
        observacoes: item.observacoes || '',
        gerada_automaticamente: !!item.geradaAutomaticamente,
        regra_fixa_id: item.regraFixaId || item.recorrenciaId || null,
        ignorada: !!item.ignorada,
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var movimentosCaixa = (db.movimentosCaixa || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('mov'),
        data_movimento: item.dataMovimento || item.data || OBRAS.helpers.todayISO(),
        tipo: item.tipo || 'movimento',
        natureza: item.natureza || '',
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        observacoes: item.observacoes || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var despesasFixas = (db.despesasFixas || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('fixa'),
        tipo_despesa: item.tipoDespesa || '',
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        dia_fixo: Number(item.diaFixo || 1),
        competencia_inicio: item.competenciaInicio || OBRAS.helpers.todayISO().slice(0,7),
        ativa: item.ativa !== false,
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var ignorados = (db.recurringIgnore || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('ign'),
        regra_fixa_id: item.regraFixaId || item.regra_fixa_id || item.recorrenciaId || '',
        competencia: item.competencia || '',
        user_id: (db.session && db.session.userId) || ''
      };
    });

    return {
      empresas: empresas,
      clientes: clientes,
      parceiros: parceiros,
      obras: obras,
      repasses: repasses,
      recebimentos: recebimentos,
      pagamentos_parceiros: pagamentos,
      despesas: despesas,
      despesas_gerais: despesasGerais,
      movimentos_caixa: movimentosCaixa,
      despesas_fixas: despesasFixas,
      ignorados_recorrencia: ignorados
    };
  },


  buildSyncPayload: function(){
    return {
      empresas: OBRAS.state.empresas || [],
      clientes: OBRAS.state.clientes || [],
      parceiros: OBRAS.state.parceiros || [],
      obras: OBRAS.state.obras || [],
      recebimentos: OBRAS.state.recebimentos || [],
      repasses: OBRAS.state.repasses || [],
      pagamentosParceiros: OBRAS.state.pagamentosParceiros || [],
      despesas: OBRAS.state.despesas || [],
      despesasGerais: OBRAS.state.despesasGerais || [],
      movimentosCaixa: OBRAS.state.movimentosCaixa || [],
      despesasFixas: OBRAS.state.despesasFixas || [],
      recurringIgnore: OBRAS.state.recurringIgnore || []
    };
  },

  computePayloadHash: function(payload){
    try {
      var json = JSON.stringify(payload || {});
      var hash = 0, i, chr;
      if (!json.length) return 'h0';
      for (i = 0; i < json.length; i += 1) {
        chr = json.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return 'h' + Math.abs(hash);
    } catch (err) {
      console.error(err);
      return 'h0';
    }
  },

  ensureCloudControl: function(){
    OBRAS.state.cloudControl = OBRAS.state.cloudControl || {};
    if (!OBRAS.state.cloudControl.baseId) {
      var email = (OBRAS.state.session && OBRAS.state.session.userEmail) || 'local';
      var safe = String(email).toLowerCase().replace(/[^a-z0-9]+/g, '_');
      OBRAS.state.cloudControl.baseId = 'base_' + safe;
    }
    if (!OBRAS.state.cloudControl.userId) {
      OBRAS.state.cloudControl.userId = (OBRAS.state.session && OBRAS.state.session.userId) || '';
    }
    var payload = this.buildSyncPayload();
    OBRAS.state.cloudControl.lastHash = this.computePayloadHash(payload);
    OBRAS.state.cloudControl.lastSyncAt = OBRAS.state.cloudControl.lastSyncAt || '';
    return OBRAS.state.cloudControl;
  },

  updateCloudControlAfterSave: function(){
    this.ensureCloudControl();
    OBRAS.state.cloudControl.lastHash = this.computePayloadHash(this.buildSyncPayload());
    OBRAS.state.cloudControl.lastSyncAt = new Date().toISOString();
    return OBRAS.state.cloudControl;
  },

  validateRemoteSnapshot: function(snapshot){
    var localCtl = this.ensureCloudControl();
    var remoteCtl = snapshot && snapshot._cloudControl ? snapshot._cloudControl : {};
    if (remoteCtl.userId && localCtl.userId && remoteCtl.userId !== localCtl.userId) {
      return { ok:false, reason:'Usuário da nuvem diferente do usuário local.' };
    }
    if (remoteCtl.baseId && localCtl.baseId && remoteCtl.baseId !== localCtl.baseId) {
      return { ok:false, reason:'Base da nuvem diferente da base local.' };
    }
    var localObras = (OBRAS.state.obras || []).length;
    var remoteObras = (snapshot.obras || []).length;
    if (localObras > 0 && remoteObras > 0 && remoteObras < localObras) {
      return { ok:false, reason:'Nuvem com menos obras que a base local. Download bloqueado.' };
    }
    return { ok:true, remote:remoteCtl, local:localCtl };
  },

  fetchRemoteSnapshot: async function(){
    var client = this.getSupabaseClient();
    var tables = ['empresas','clientes','parceiros','obras','repasses','recebimentos','pagamentos_parceiros','despesas','despesas_gerais','movimentos_caixa','despesas_fixas','ignorados_recorrencia'];
    var out = {};
    var userId = OBRAS.state && OBRAS.state.session ? (OBRAS.state.session.userId || '') : '';
    for (var i = 0; i < tables.length; i += 1) {
      var t = tables[i];
      var query = client.from(t).select('*');
      if (userId) query = query.eq('user_id', userId);
      var result = await query;
      if (result.error) {
        throw new Error('Tabela "' + t + '" sem coluna user_id. Corrija o banco antes de sincronizar.');
      }
      out[t] = Array.isArray(result.data) ? result.data : [];
    }
    out._cloudControl = {
      baseId: OBRAS.state.cloudControl && OBRAS.state.cloudControl.baseId ? OBRAS.state.cloudControl.baseId : '',
      userId: userId,
      lastHash: this.computePayloadHash({
        empresas: out.empresas || [],
        clientes: out.clientes || [],
        parceiros: out.parceiros || [],
        obras: out.obras || [],
        recebimentos: out.recebimentos || [],
        repasses: out.repasses || [],
        pagamentosParceiros: (out.pagamentos_parceiros || []),
        despesas: out.despesas || [],
        despesasGerais: (out.despesas_gerais || []),
        movimentosCaixa: (out.movimentos_caixa || []),
        despesasFixas: (out.despesas_fixas || []),
        recurringIgnore: (out.ignorados_recorrencia || [])
      }),
      lastSyncAt: new Date().toISOString()
    };
    return out;
  },

  applyRemoteSnapshot: function(snapshot){
    var db = OBRAS.models.createEmptyDB();
    db.session = OBRAS.state.session || db.session;
    db.session.loggedIn = true;
    db.empresa = OBRAS.state.empresa || db.empresa;
    db.cloud = db.cloud || {};
    db.cloud.enabled = true;
    db.cloud.projectUrl = OBRAS.config.SUPABASE_URL;
    db.cloud.online = true;
    db.cloud.lastSyncAt = new Date().toISOString();
    db.cloud.lastSyncStatus = 'Download da nuvem concluído';

    db.empresas = (snapshot.empresas || []).map(function(r){
      return { id:r.id, codigo:r.codigo || '', nome:r.nome || '', observacoes:r.observacoes || '', createdAt:r.created_at || '', updatedAt:r.updated_at || '' };
    });

    db.clientes = (snapshot.clientes || []).map(function(r){
      return { id:r.id, codigo:r.codigo || '', nome:r.nome || '', observacoes:r.observacoes || '', createdAt:r.created_at || '', updatedAt:r.updated_at || '' };
    });

    db.parceiros = (snapshot.parceiros || []).map(function(r){
      return { id:r.id, codigo:r.codigo || '', nome:r.nome || '', observacoes:r.observacoes || '', createdAt:r.created_at || '', updatedAt:r.updated_at || '' };
    });

    var repassesByOS = {};
    (snapshot.repasses || []).forEach(function(r){ repassesByOS[r.os] = r; });

    db.obras = (snapshot.obras || []).map(function(r){
      var rep = repassesByOS[r.numero_os] || null;
      return {
        id: r.id,
        numeroOS: r.numero_os || '',
        dataAbertura: r.data_abertura || '',
        empresaId: r.empresa_id || '',
        empresaNome: r.empresa_nome || '',
        clienteId: r.cliente_id || '',
        clienteNome: r.cliente_nome || '',
        siteTorre: r.site_torre || '',
        cidade: r.cidade || '',
        statusObra: ((r.status_obra || 'Planejado') === 'Concluído' ? 'Concluída' : (r.status_obra || 'Planejado')),
        valorObra: Number(r.valor_obra || 0),
        observacoes: r.observacoes || '',
        statusCicloOS: r.status_ciclo_os || 'Ativa',
        parceiroNome: r.parceiro_nome || (rep ? (rep.parceiro_nome || '') : ''),
        etapa: r.etapa || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.repasses = (snapshot.repasses || []).map(function(r){
      return {
        id: r.id,
        os: r.os || '',
        parceiroId: r.parceiro_id || '',
        parceiroNome: r.parceiro_nome || '',
        responsavelTecnico: r.responsavel_tecnico || r.parceiro_nome || '',
        valorFechadoParceiro: Number(r.valor_fechado_parceiro || 0),
        observacoes: r.observacoes || '',
        origemLancamento: r.origem_lancamento || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.recebimentos = (snapshot.recebimentos || []).map(function(r){
      return {
        id: r.id,
        os: r.os || '',
        dataRecebimento: r.data_recebimento || '',
        descricao: r.descricao || '',
        valor: Number(r.valor || 0),
        observacoes: r.observacoes || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.pagamentosParceiros = (snapshot.pagamentos_parceiros || []).map(function(r){
      return {
        id: r.id,
        os: r.os || '',
        competencia: r.competencia || '',
        dataVencimento: r.data_vencimento || '',
        dataPagamentoReal: r.data_pagamento_real || '',
        natureza: r.natureza || '',
        valor: Number(r.valor || 0),
        descricao: r.descricao || '',
        observacoes: r.observacoes || '',
        origemLancamento: r.origem_lancamento || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.despesas = (snapshot.despesas || []).map(function(r){
      return {
        id: r.id,
        os: r.os || '',
        competencia: r.competencia || '',
        dataDespesa: r.data_despesa || '',
        tipoDespesa: r.tipo_despesa || '',
        dataVencimento: r.data_vencimento || '',
        dataPagamentoReal: r.data_pagamento_real || '',
        valor: Number(r.valor || 0),
        origemCusto: r.origem_custo || '',
        obsOutrasDespesas: r.obs_outras_despesas || '',
        observacoes: r.observacoes || '',
        geradaAutomaticamente: !!r.gerada_automaticamente,
        origemLancamento: r.origem_lancamento || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.despesasGerais = (snapshot.despesas_gerais || []).map(function(r){
      return {
        id: r.id,
        competencia: r.competencia || '',
        data: r.data || r.data_vencimento || '',
        tipoDespesa: r.tipo_despesa || '',
        dataVencimento: r.data_vencimento || '',
        dataPagamentoReal: r.data_pagamento_real || '',
        descricao: r.descricao || '',
        valor: Number(r.valor || 0),
        origem: r.origem || '',
        observacoes: r.observacoes || '',
        origemLancamento: r.origem_lancamento || '',
        recorrenciaId: r.recorrencia_id || r.regra_fixa_id || null,
        geradaAutomaticamente: !!r.gerada_automaticamente,
        regraFixaId: r.regra_fixa_id || '',
        ignorada: !!r.ignorada,
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.movimentosCaixa = (snapshot.movimentos_caixa || []).map(function(r){
      return {
        id: r.id,
        dataMovimento: r.data_movimento || r.data || '',
        data: r.data || r.data_movimento || '',
        tipo: r.tipo || '',
        natureza: r.natureza || '',
        descricao: r.descricao || '',
        valor: Number(r.valor || 0),
        observacoes: r.observacoes || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.despesasFixas = (snapshot.despesas_fixas || []).map(function(r){
      return {
        id: r.id,
        tipoDespesa: r.tipo_despesa || '',
        descricao: r.descricao || '',
        valor: Number(r.valor || 0),
        diaFixo: Number(r.dia_fixo || 0),
        competenciaInicio: r.competencia_inicio || '',
        origem: r.origem || '',
        ativa: r.ativa !== false,
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.recurringIgnore = (snapshot.ignorados_recorrencia || []).map(function(r){
      return {
        id: r.id,
        recorrenciaId: r.recorrencia_id || '',
        competencia: r.competencia || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.meta = db.meta || {};
    db.meta.seqOS = (db.obras || []).reduce(function(max, obra){
      var m = /OS-(\d+)/.exec(String(obra.numeroOS || ''));
      return Math.max(max, m ? Number(m[1]) : 0);
    }, 0);
    db.meta.importedFromLegacy = false;

    return OBRAS.stateApi.normalizeDB(db);
  },

  buildSupabaseRows: function(){
    var db = OBRAS.state;
    var now = new Date().toISOString();

    var empresas = (db.empresas || []).map(function(item, i){
      return {
        id: item.id || OBRAS.helpers.uid('empresas'),
        codigo: item.codigo || OBRAS.services.nextCode('EO', i),
        nome: item.nome || '',
        observacoes: item.observacoes || item.contato || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var clientes = (db.clientes || []).map(function(item, i){
      return {
        id: item.id || OBRAS.helpers.uid('clientes'),
        codigo: item.codigo || OBRAS.services.nextCode('CL', i),
        nome: item.nome || '',
        observacoes: item.observacoes || item.contato || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var parceiros = (db.parceiros || []).map(function(item, i){
      return {
        id: item.id || OBRAS.helpers.uid('parceiros'),
        codigo: item.codigo || OBRAS.services.nextCode('PA', i),
        nome: item.nome || '',
        observacoes: item.observacoes || item.contato || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    function findEmpresaByName(name){
      return empresas.find(function(x){ return OBRAS.services.sameName(x.nome, name); }) || null;
    }
    function findClienteByName(name){
      return clientes.find(function(x){ return OBRAS.services.sameName(x.nome, name); }) || null;
    }
    function findParceiroByName(name){
      return parceiros.find(function(x){ return OBRAS.services.sameName(x.nome, name); }) || null;
    }

    var obras = (db.obras || []).map(function(item){
      var emp = findEmpresaByName(item.empresaNome || (db.empresa && db.empresa.nome) || '');
      var cli = findClienteByName(item.clienteNome || '');
      return {
        id: item.id || OBRAS.helpers.uid('obra'),
        numero_os: item.numeroOS || item.os || '',
        data_abertura: item.dataAbertura || OBRAS.helpers.todayISO(),
        empresa_id: item.empresaId || (emp ? emp.id : null),
        empresa_nome: item.empresaNome || (emp ? emp.nome : ((db.empresa && db.empresa.nome) || 'TELESITES')),
        cliente_id: item.clienteId || (cli ? cli.id : null),
        cliente_nome: item.clienteNome || (cli ? cli.nome : ''),
        site_torre: item.siteTorre || item.nome || '',
        cidade: item.cidade || '',
        status_obra: item.statusObra || 'Planejado',
        valor_obra: Number(item.valorObra || 0),
        observacoes: item.observacoes || '',
        status_ciclo_os: item.statusCicloOS || 'Ativa',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var repasses = (db.repasses || []).map(function(item){
      var par = findParceiroByName(item.parceiroNome || '');
      return {
        id: item.id || OBRAS.helpers.uid('rep'),
        os: item.os || '',
        parceiro_id: item.parceiroId || (par ? par.id : null),
        parceiro_nome: item.parceiroNome || (par ? par.nome : ''),
        valor_fechado_parceiro: Number(item.valorFechadoParceiro || 0),
        observacoes: item.observacoes || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var recebimentos = (db.recebimentos || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('rec'),
        os: item.os || '',
        data_recebimento: item.dataRecebimento || item.data || OBRAS.helpers.todayISO(),
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        observacoes: item.observacoes || item.observacao || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var pagamentos = (db.pagamentosParceiros || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('pag'),
        os: item.os || '',
        competencia: item.competencia || ((item.dataVencimento || OBRAS.helpers.todayISO()).slice(0,7)),
        data_vencimento: item.dataVencimento || item.data || OBRAS.helpers.todayISO(),
        data_pagamento_real: item.dataPagamentoReal || null,
        natureza: item.natureza || 'pagamento',
        valor: Number(item.valor || 0),
        descricao: item.descricao || '',
        observacoes: item.observacoes || item.observacao || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var despesas = (db.despesas || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('desp'),
        os: item.os || '',
        competencia: item.competencia || ((item.dataVencimento || OBRAS.helpers.todayISO()).slice(0,7)),
        data_despesa: item.dataDespesa || item.data_despesa || item.data || item.dataVencimento || OBRAS.helpers.todayISO(),
        tipo_despesa: item.tipoDespesa || item.tipo_despesa || 'Despesa obra',
        data_vencimento: item.dataVencimento || item.data_vencimento || item.data || OBRAS.helpers.todayISO(),
        data_pagamento_real: item.dataPagamentoReal || item.data_pagamento_real || null,
        valor: Number(item.valor || 0),
        origem_custo: item.origemCusto || item.origem_custo || '',
        obs_outras_despesas: item.obsOutrasDespesas || item.obs_outras_despesas || '',
        observacoes: item.observacoes || item.observacao || '',
        gerada_automaticamente: !!(item.geradaAutomaticamente || item.gerada_automaticamente),
        origem_lancamento: item.origemLancamento || item.origem_lancamento || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var despesasGerais = (db.despesasGerais || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('despgeral'),
        competencia: item.competencia || ((item.dataVencimento || OBRAS.helpers.todayISO()).slice(0,7)),
        data: item.data || item.dataVencimento || OBRAS.helpers.todayISO(),
        tipo_despesa: item.tipoDespesa || 'Despesa geral',
        data_vencimento: item.dataVencimento || OBRAS.helpers.todayISO(),
        data_pagamento_real: item.dataPagamentoReal || null,
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        origem: item.origem || '',
        observacoes: item.observacoes || '',
        gerada_automaticamente: !!item.geradaAutomaticamente,
        regra_fixa_id: item.regraFixaId || item.recorrenciaId || null,
        ignorada: !!item.ignorada,
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var movimentosCaixa = (db.movimentosCaixa || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('mov'),
        data_movimento: item.dataMovimento || item.data || OBRAS.helpers.todayISO(),
        tipo: item.tipo || 'movimento',
        natureza: item.natureza || '',
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        observacoes: item.observacoes || '',
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var despesasFixas = (db.despesasFixas || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('fixa'),
        tipo_despesa: item.tipoDespesa || '',
        descricao: item.descricao || '',
        valor: Number(item.valor || 0),
        dia_fixo: Number(item.diaFixo || 1),
        competencia_inicio: item.competenciaInicio || OBRAS.helpers.todayISO().slice(0,7),
        ativa: item.ativa !== false,
        created_at: item.createdAt || item.created_at || now,
        updated_at: item.updatedAt || item.updated_at || now,
        user_id: (db.session && db.session.userId) || ''
      };
    });

    var ignorados = (db.recurringIgnore || []).map(function(item){
      return {
        id: item.id || OBRAS.helpers.uid('ign'),
        regra_fixa_id: item.regraFixaId || item.regra_fixa_id || item.recorrenciaId || '',
        competencia: item.competencia || '',
        user_id: (db.session && db.session.userId) || ''
      };
    });

    return {
      empresas: empresas,
      clientes: clientes,
      parceiros: parceiros,
      obras: obras,
      repasses: repasses,
      recebimentos: recebimentos,
      pagamentos_parceiros: pagamentos,
      despesas: despesas,
      despesas_gerais: despesasGerais,
      movimentos_caixa: movimentosCaixa,
      despesas_fixas: despesasFixas,
      ignorados_recorrencia: ignorados
    };
  },


  buildSyncPayload: function(){
    return {
      empresas: OBRAS.state.empresas || [],
      clientes: OBRAS.state.clientes || [],
      parceiros: OBRAS.state.parceiros || [],
      obras: OBRAS.state.obras || [],
      recebimentos: OBRAS.state.recebimentos || [],
      repasses: OBRAS.state.repasses || [],
      pagamentosParceiros: OBRAS.state.pagamentosParceiros || [],
      despesas: OBRAS.state.despesas || [],
      despesasGerais: OBRAS.state.despesasGerais || [],
      movimentosCaixa: OBRAS.state.movimentosCaixa || [],
      despesasFixas: OBRAS.state.despesasFixas || [],
      recurringIgnore: OBRAS.state.recurringIgnore || []
    };
  },

  computePayloadHash: function(payload){
    try {
      var json = JSON.stringify(payload || {});
      var hash = 0, i, chr;
      if (!json.length) return 'h0';
      for (i = 0; i < json.length; i += 1) {
        chr = json.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
      }
      return 'h' + Math.abs(hash);
    } catch (err) {
      console.error(err);
      return 'h0';
    }
  },

  ensureCloudControl: function(){
    OBRAS.state.cloudControl = OBRAS.state.cloudControl || {};
    if (!OBRAS.state.cloudControl.baseId) {
      var email = (OBRAS.state.session && OBRAS.state.session.userEmail) || 'local';
      var safe = String(email).toLowerCase().replace(/[^a-z0-9]+/g, '_');
      OBRAS.state.cloudControl.baseId = 'base_' + safe;
    }
    if (!OBRAS.state.cloudControl.userId) {
      OBRAS.state.cloudControl.userId = (OBRAS.state.session && OBRAS.state.session.userId) || '';
    }
    var payload = this.buildSyncPayload();
    OBRAS.state.cloudControl.lastHash = this.computePayloadHash(payload);
    OBRAS.state.cloudControl.lastSyncAt = OBRAS.state.cloudControl.lastSyncAt || '';
    return OBRAS.state.cloudControl;
  },

  updateCloudControlAfterSave: function(){
    this.ensureCloudControl();
    OBRAS.state.cloudControl.lastHash = this.computePayloadHash(this.buildSyncPayload());
    OBRAS.state.cloudControl.lastSyncAt = new Date().toISOString();
    return OBRAS.state.cloudControl;
  },

  validateRemoteSnapshot: function(snapshot){
    var localCtl = this.ensureCloudControl();
    var remoteCtl = snapshot && snapshot._cloudControl ? snapshot._cloudControl : {};
    if (remoteCtl.userId && localCtl.userId && remoteCtl.userId !== localCtl.userId) {
      return { ok:false, reason:'Usuário da nuvem diferente do usuário local.' };
    }
    if (remoteCtl.baseId && localCtl.baseId && remoteCtl.baseId !== localCtl.baseId) {
      return { ok:false, reason:'Base da nuvem diferente da base local.' };
    }
    var localObras = (OBRAS.state.obras || []).length;
    var remoteObras = (snapshot.obras || []).length;
    if (localObras > 0 && remoteObras > 0 && remoteObras < localObras) {
      return { ok:false, reason:'Nuvem com menos obras que a base local. Download bloqueado.' };
    }
    return { ok:true, remote:remoteCtl, local:localCtl };
  },

  fetchRemoteSnapshot: async function(){
    var client = this.getSupabaseClient();
    var tables = ['empresas','clientes','parceiros','obras','repasses','recebimentos','pagamentos_parceiros','despesas','despesas_gerais','movimentos_caixa','despesas_fixas','ignorados_recorrencia'];
    var out = {};
    var userId = OBRAS.state && OBRAS.state.session ? (OBRAS.state.session.userId || '') : '';
    for (var i = 0; i < tables.length; i += 1) {
      var t = tables[i];
      var query = client.from(t).select('*');
      if (userId) query = query.eq('user_id', userId);
      var result = await query;
      if (result.error) {
        throw new Error('Tabela "' + t + '" sem coluna user_id. Corrija o banco antes de sincronizar.');
      }
      out[t] = Array.isArray(result.data) ? result.data : [];
    }
    out._cloudControl = {
      baseId: OBRAS.state.cloudControl && OBRAS.state.cloudControl.baseId ? OBRAS.state.cloudControl.baseId : '',
      userId: userId,
      lastHash: this.computePayloadHash({
        empresas: out.empresas || [],
        clientes: out.clientes || [],
        parceiros: out.parceiros || [],
        obras: out.obras || [],
        recebimentos: out.recebimentos || [],
        repasses: out.repasses || [],
        pagamentosParceiros: (out.pagamentos_parceiros || []),
        despesas: out.despesas || [],
        despesasGerais: (out.despesas_gerais || []),
        movimentosCaixa: (out.movimentos_caixa || []),
        despesasFixas: (out.despesas_fixas || []),
        recurringIgnore: (out.ignorados_recorrencia || [])
      }),
      lastSyncAt: new Date().toISOString()
    };
    return out;
  },

  applyRemoteSnapshot: function(snapshot){
    var db = OBRAS.models.createEmptyDB();
    db.session = OBRAS.state.session || db.session;
    db.session.loggedIn = true;
    db.empresa = OBRAS.state.empresa || db.empresa;

    db.empresas = (snapshot.empresas || []).map(function(r){
      return { id:r.id, codigo:r.codigo || '', nome:r.nome || '', observacoes:r.observacoes || '', createdAt:r.created_at || '', updatedAt:r.updated_at || '' };
    });

    db.clientes = (snapshot.clientes || []).map(function(r){
      return { id:r.id, codigo:r.codigo || '', nome:r.nome || '', observacoes:r.observacoes || '', createdAt:r.created_at || '', updatedAt:r.updated_at || '' };
    });

    db.parceiros = (snapshot.parceiros || []).map(function(r){
      return { id:r.id, codigo:r.codigo || '', nome:r.nome || '', observacoes:r.observacoes || '', createdAt:r.created_at || '', updatedAt:r.updated_at || '' };
    });

    var repassesByOS = {};
    (snapshot.repasses || []).forEach(function(r){ repassesByOS[r.os] = r; });

    db.obras = (snapshot.obras || []).map(function(r){
      var rep = repassesByOS[r.numero_os] || null;
      return {
        id: r.id,
        numeroOS: r.numero_os,
        dataAbertura: r.data_abertura || '',
        empresaId: r.empresa_id || '',
        empresaNome: r.empresa_nome || '',
        clienteId: r.cliente_id || '',
        clienteNome: r.cliente_nome || '',
        siteTorre: r.site_torre || '',
        cidade: r.cidade || '',
        statusObra: ((r.status_obra || 'Planejado') === 'Concluído' ? 'Concluída' : (r.status_obra || 'Planejado')),
        valorObra: Number(r.valor_obra || 0),
        observacoes: r.observacoes || '',
        statusCicloOS: r.status_ciclo_os || 'Ativa',
        parceiroNome: rep ? (rep.parceiro_nome || '') : '',
        etapa: '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.repasses = (snapshot.repasses || []).map(function(r){
      return {
        id: r.id,
        os: r.os,
        parceiroId: r.parceiro_id || '',
        parceiroNome: r.parceiro_nome || '',
        valorFechadoParceiro: Number(r.valor_fechado_parceiro || 0),
        observacoes: r.observacoes || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.recebimentos = (snapshot.recebimentos || []).map(function(r){
      return {
        id: r.id,
        os: r.os,
        dataRecebimento: r.data_recebimento || '',
        descricao: r.descricao || '',
        valor: Number(r.valor || 0),
        observacoes: r.observacoes || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.pagamentosParceiros = (snapshot.pagamentos_parceiros || []).map(function(r){
      return {
        id: r.id,
        os: r.os,
        competencia: r.competencia || '',
        dataVencimento: r.data_vencimento || '',
        dataPagamentoReal: r.data_pagamento_real || '',
        natureza: r.natureza || 'pagamento',
        valor: Number(r.valor || 0),
        descricao: r.descricao || '',
        observacoes: r.observacoes || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.despesas = (snapshot.despesas || []).map(function(r){
      return {
        id: r.id,
        os: r.os,
        competencia: r.competencia || '',
        dataDespesa: r.data_despesa || '',
        tipoDespesa: r.tipo_despesa || '',
        dataVencimento: r.data_vencimento || '',
        dataPagamentoReal: r.data_pagamento_real || '',
        valor: Number(r.valor || 0),
        origemCusto: r.origem_custo || '',
        obsOutrasDespesas: r.obs_outras_despesas || '',
        observacoes: r.observacoes || '',
        geradaAutomaticamente: !!r.gerada_automaticamente,
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.despesasGerais = (snapshot.despesas_gerais || []).map(function(r){
      return {
        id: r.id,
        competencia: r.competencia || '',
        data: r.data || r.data_vencimento || '',
        tipoDespesa: r.tipo_despesa || '',
        dataVencimento: r.data_vencimento || '',
        dataPagamentoReal: r.data_pagamento_real || '',
        descricao: r.descricao || '',
        valor: Number(r.valor || 0),
        origem: r.origem || '',
        observacoes: r.observacoes || '',
        geradaAutomaticamente: !!r.gerada_automaticamente,
        regraFixaId: r.regra_fixa_id || '',
        ignorada: !!r.ignorada,
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.movimentosCaixa = (snapshot.movimentos_caixa || []).map(function(r){
      return {
        id: r.id,
        dataMovimento: r.data_movimento || '',
        data: r.data_movimento || '',
        tipo: r.tipo || '',
        natureza: r.natureza || '',
        descricao: r.descricao || '',
        valor: Number(r.valor || 0),
        observacoes: r.observacoes || '',
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.despesasFixas = (snapshot.despesas_fixas || []).map(function(r){
      return {
        id: r.id,
        tipoDespesa: r.tipo_despesa || '',
        descricao: r.descricao || '',
        valor: Number(r.valor || 0),
        diaFixo: Number(r.dia_fixo || 1),
        competenciaInicio: r.competencia_inicio || '',
        ativa: !!r.ativa,
        createdAt: r.created_at || '',
        updatedAt: r.updated_at || ''
      };
    });

    db.recurringIgnore = (snapshot.ignorados_recorrencia || []).map(function(r){
      return {
        id: r.id,
        regraFixaId: r.regra_fixa_id || '',
        competencia: r.competencia || ''
      };
    });

    db.meta.updatedAt = this.maxRemoteUpdatedAt(snapshot) || new Date().toISOString();
    db.meta.seqOS = this.inferSeqOS(db.obras);
    db.meta.importedFromLegacy = false;
    db.cloud = OBRAS.state.cloud || {};
    db.cloud.enabled = true;
    db.cloud.auto = true;
    db.cloud.mode = 'automatico';
    db.cloud.projectUrl = OBRAS.config.SUPABASE_URL;
    db.cloud.lastSyncAt = new Date().toISOString();
    db.cloud.lastSyncStatus = 'Base remota carregada';
    db.cloud.online = true;
    db.ui = OBRAS.state.ui || db.ui;
    db.form = {};
    db.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
    return OBRAS.stateApi.normalizeDB(db);
  },

  syncDeleteAndUpsert: async function(client, tableName, rows){
    var userId = (OBRAS.state && OBRAS.state.session && OBRAS.state.session.userId) || '';
    var query = client.from(tableName).select('id');
    if (userId) query = query.eq('user_id', userId);
    var existing = await query;
    if (existing.error) throw existing.error;

    var incomingIds = {};
    (rows || []).forEach(function(r){ incomingIds[r.id] = true; });

    var toDelete = (existing.data || []).map(function(r){ return r.id; }).filter(function(id){
      return !incomingIds[id];
    });

    if (toDelete.length) {
      var del = client.from(tableName).delete().in('id', toDelete);
      if (userId) del = del.eq('user_id', userId);
      del = await del;
      if (del.error) throw del.error;
    }

    if (rows && rows.length) {
      var prepared = rows.map(function(r){
        var row = Object.assign({}, r);
        if (userId) row.user_id = userId;
        return row;
      });
      var up = await client.from(tableName).upsert(prepared, { onConflict: 'id' });
      if (up.error) throw up.error;
    }
  },

  uploadAllToSupabase: async function(showToast){
    if (!this.cloudEnabled() || !navigator.onLine) return;
    if (!this.hasMeaningfulLocalData(OBRAS.state)) {
      throw new Error('Upload bloqueado: base local vazia.');
    }

    var client = this.getSupabaseClient();
    var rows = this.buildSupabaseRows();
    var userId = (OBRAS.state && OBRAS.state.session && OBRAS.state.session.userId) || '';
    if (!userId) {
      throw new Error('Usuário sem userId para sincronizar.');
    }

    await this.syncDeleteAndUpsert(client, 'despesas', rows.despesas || []);
    await this.syncDeleteAndUpsert(client, 'pagamentos_parceiros', rows.pagamentos_parceiros || []);
    await this.syncDeleteAndUpsert(client, 'recebimentos', rows.recebimentos || []);
    await this.syncDeleteAndUpsert(client, 'repasses', rows.repasses || []);
    await this.syncDeleteAndUpsert(client, 'movimentos_caixa', rows.movimentos_caixa || []);
    await this.syncDeleteAndUpsert(client, 'despesas_gerais', rows.despesas_gerais || []);
    await this.syncDeleteAndUpsert(client, 'despesas_fixas', rows.despesas_fixas || []);
    await this.syncDeleteAndUpsert(client, 'ignorados_recorrencia', rows.ignorados_recorrencia || []);
    await this.syncDeleteAndUpsert(client, 'obras', rows.obras || []);
    await this.syncDeleteAndUpsert(client, 'parceiros', rows.parceiros || []);
    await this.syncDeleteAndUpsert(client, 'clientes', rows.clientes || []);
    await this.syncDeleteAndUpsert(client, 'empresas', rows.empresas || []);

    this.markCloudStatus('Sync automática enviada');
    OBRAS.storage.save(OBRAS.state, OBRAS.config.STORAGE_KEY);
    if (showToast) OBRAS.ui.toast('Sincronizado com Supabase.');
  },

  bootstrapAutoSync: async function(){
    OBRAS.state.cloud = OBRAS.state.cloud || {};
    OBRAS.state.cloud.online = !!navigator.onLine;

    if (!this.cloudEnabled()) {
      OBRAS.state.cloud.lastSyncStatus = 'Sync desativada';
      OBRAS.storage.save(OBRAS.state, OBRAS.config.STORAGE_KEY);
      return;
    }
    if (!navigator.onLine) {
      OBRAS.state.cloud.lastSyncStatus = 'Offline';
      OBRAS.storage.save(OBRAS.state, OBRAS.config.STORAGE_KEY);
      return;
    }

    try {
      var snapshot = this.normalizeRemoteSnapshot(await this.fetchRemoteSnapshot());
      if (this.remoteHasData(snapshot)) {
        OBRAS.state = this.applyRemoteSnapshot(snapshot);
        OBRAS.stateApi.save();
        OBRAS.app.render();
        OBRAS.ui.toast('Base carregada do Supabase.');
        return;
      }

      if (this.hasMeaningfulLocalData(OBRAS.state)) {
        OBRAS.ui.toast('Nuvem vazia. Use "Forçar envio agora" para publicar sua base.');
      } else {
        OBRAS.state.cloud.lastSyncStatus = 'Nuvem vazia e base local vazia';
        OBRAS.storage.save(OBRAS.state, OBRAS.config.STORAGE_KEY);
      }
      OBRAS.app.render();
    } catch (err) {
      console.error(err);
      OBRAS.state.cloud = OBRAS.state.cloud || {};
      OBRAS.state.cloud.online = !!navigator.onLine;
      OBRAS.state.cloud.lastSyncStatus = 'Erro na sync: ' + (err.message || 'falha');
      OBRAS.storage.save(OBRAS.state, OBRAS.config.STORAGE_KEY);
      OBRAS.app.render();
    }
  },

  enableAutoSaveSync: function(){
    if (OBRAS._autoSaveSyncEnabled) return;
    OBRAS._autoSaveSyncEnabled = true;
    var originalSave = OBRAS.stateApi.save.bind(OBRAS.stateApi);
    OBRAS.stateApi.save = function(){
      originalSave();
      clearTimeout(OBRAS._cloudSyncDebounce);
      OBRAS._cloudSyncDebounce = setTimeout(function(){
        if (!OBRAS.services.hasMeaningfulLocalData(OBRAS.state)) return;
        OBRAS.services.uploadAllToSupabase(false).catch(function(err){
          console.error(err);
          OBRAS.state.cloud = OBRAS.state.cloud || {};
          OBRAS.state.cloud.lastSyncStatus = 'Erro ao enviar: ' + (err.message || 'falha');
          OBRAS.storage.save(OBRAS.state, OBRAS.config.STORAGE_KEY);
        });
      }, 900);
    };
  },

  forceCloudDownload: async function(){
    try {
      var snapshot = this.normalizeRemoteSnapshot(await this.fetchRemoteSnapshot());
      if (!this.remoteHasData(snapshot)) {
        OBRAS.ui.toast('Nenhum dado na nuvem.');
        return;
      }
      OBRAS.state = this.applyRemoteSnapshot(snapshot);
      OBRAS.stateApi.save();
      OBRAS.app.render();
      OBRAS.ui.toast('Base baixada da nuvem.');
    } catch (err) {
      console.error(err);
      OBRAS.ui.toast('Erro ao baixar da nuvem.');
    }
  },

  forceCloudUpload: async function(){
    try {
      await this.uploadAllToSupabase(true);
      OBRAS.app.render();
    } catch (err) {
      console.error(err);
      OBRAS.ui.toast('Erro ao enviar para a nuvem.');
    }
  },


  roundMoney: function(value){
    return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
  },

  nextMonthDueDate: function(baseDate){
    var d = String(baseDate || OBRAS.helpers.todayISO()).split('-');
    var y = Number(d[0] || new Date().getFullYear());
    var m = Number(d[1] || (new Date().getMonth()+1));
    m += 1;
    if (m > 12) { m = 1; y += 1; }
    return String(y) + '-' + String(m).padStart(2,'0') + '-20';
  },

  ensureAutoNfExpenseForObra: function(obra){
    OBRAS.state.despesas = Array.isArray(OBRAS.state.despesas) ? OBRAS.state.despesas : [];
    if (!obra || !obra.numeroOS) return;

    var existente = OBRAS.state.despesas.find(function(d){
      return (d.origemLancamento === 'automatico_obra_nf' || d.geradaAutomaticamente === true)
        && d.os === obra.numeroOS;
    });

    // V9.3.2 blindada:
    // se já existe NF automática para a obra, respeita exatamente o que foi salvo.
    if (existente) return existente;

    var valor = Number(obra.valorObra || 0) * 0.06;
    var competencia = String(obra.dataAbertura || OBRAS.helpers.todayISO()).slice(0, 7);
    var vencimento = competencia ? (competencia + '-20') : OBRAS.helpers.todayISO();

    var payload = {
      id: 'desp_nf_' + String(obra.id || obra.numeroOS).replace(/[^a-zA-Z0-9_-]/g, '_'),
      os: obra.numeroOS,
      competencia: competencia,
      dataDespesa: obra.dataAbertura || OBRAS.helpers.todayISO(),
      tipoDespesa: 'Imposto NF',
      dataVencimento: vencimento,
      dataPagamentoReal: '',
      valor: Number(valor.toFixed(2)),
      origemCusto: 'Caixa da Empresa',
      obsOutrasDespesas: '',
      observacoes: 'NF automática gerada pela obra',
      geradaAutomaticamente: true,
      origemLancamento: 'automatico_obra_nf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    OBRAS.state.despesas.push(payload);
    return payload;
  },

  syncAutoNfExpenses: function(){
    OBRAS.state.despesas = Array.isArray(OBRAS.state.despesas) ? OBRAS.state.despesas : [];
    (OBRAS.state.obras || []).forEach(function(obra){
      OBRAS.services.ensureAutoNfExpenseForObra(obra);
    });
    var validOS = {};
    (OBRAS.state.obras || []).forEach(function(obra){ validOS[obra.numeroOS] = true; });
    OBRAS.state.despesas = OBRAS.state.despesas.filter(function(d){
      if (d.origemLancamento !== 'automatico_obra_nf' && d.geradaAutomaticamente !== true) return true;
      return !!validOS[d.os];
    });
  },


  getObraLancamentoConfig: function(kind){
    var map = {
      rec: { key:'recebimentos', prefix:'det-rec', label:'Recebimento' },
      pag: { key:'pagamentosParceiros', prefix:'det-pag', label:'Pagamento parceiro' },
      desp: { key:'despesas', prefix:'det-desp', label:'Despesa da obra' }
    };
    return map[kind] || null;
  },

  beginEditObraLancamento: function(kind, id){
    var cfg = this.getObraLancamentoConfig(kind);
    if (!cfg) return;
    var item = (OBRAS.state[cfg.key] || []).find(function(x){ return x.id === id; });
    if (!item) {
      OBRAS.ui.toast('Lançamento não encontrado.');
      return;
    }
    OBRAS.state.form = OBRAS.state.form || {};
    OBRAS.state.form.obraLancamentoEdit = { kind: kind, id: id };
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast('Editando ' + cfg.label.toLowerCase() + '.');
  },

  updateObraLancamento: function(kind, item, valor, data, obs, tipo){
    item.valor = valor;
    item.data = data;
    item.observacao = obs;
    item.observacoes = obs;
    item.descricao = obs || item.descricao || (kind === 'rec' ? 'Recebimento' : kind === 'pag' ? 'Pagamento parceiro' : 'Despesa da obra');
    if (kind === 'rec') {
      item.dataRecebimento = data;
      item.status = 'recebido';
    } else if (kind === 'pag') {
      item.dataVencimento = data;
      item.dataPagamentoReal = data;
      item.status = 'pago';
    } else if (kind === 'desp') {
      item.dataDespesa = data;
      item.dataVencimento = data;
      item.dataPagamentoReal = data;
      item.tipo = tipo || item.tipo || 'obra';
      item.tipoDespesa = tipo || item.tipoDespesa || 'obra';
      item.status = 'pago';
    }
  },

  deleteObraLancamento: function(kind, id){
    var cfg = this.getObraLancamentoConfig(kind);
    if (!cfg) return;
    if (!window.confirm('Excluir este lançamento?')) return;
    OBRAS.state[cfg.key] = (OBRAS.state[cfg.key] || []).filter(function(x){ return x.id !== id; });
    if (OBRAS.state.form && OBRAS.state.form.obraLancamentoEdit && OBRAS.state.form.obraLancamentoEdit.id === id) {
      delete OBRAS.state.form.obraLancamentoEdit;
    }
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast(cfg.label + ' excluído.');
  },


  resetPasswordSupabase: async function(email){
    try {
      if (!String(email || '').trim()) {
        OBRAS.ui.toast('Informe o email para recuperar a senha.');
        return false;
      }
      var response = await OBRAS.services.getSupabaseClient().auth.resetPasswordForEmail(
        String(email).trim(),
        { redirectTo: window.location.href }
      );
      if (response.error) {
        OBRAS.ui.toast('Erro ao enviar recuperação: ' + response.error.message);
        return false;
      }
      OBRAS.ui.toast('Email de recuperação enviado.');
      return true;
    } catch (err) {
      console.error(err);
      OBRAS.ui.toast('Falha ao enviar recuperação.');
      return false;
    }
  },


  getFinanceEntryConfig: function(kind){
    return {
      recebimentos: { key:'recebimentos', label:'Recebimento' },
      pagamentosParceiros: { key:'pagamentosParceiros', label:'Pagamento parceiro' },
      despesas: { key:'despesas', label:'Despesa da obra' },
      despesasGerais: { key:'despesasGerais', label:'Despesa geral' }
    }[kind] || null;
  },

  getFinanceEntryById: function(kind, id){
    var cfg = this.getFinanceEntryConfig(kind);
    if (!cfg) return null;
    return (OBRAS.state[cfg.key] || []).find(function(item){ return item.id === id; }) || null;
  },

  editFinanceEntry: function(kind, id){
    var cfg = this.getFinanceEntryConfig(kind);
    if (!cfg) return;
    var item = this.getFinanceEntryById(kind, id);
    if (!item) {
      OBRAS.ui.toast('Lançamento não encontrado.');
      return;
    }

    var currentValue = Number(item.valor || 0);
    var rawValue = window.prompt('Novo valor para ' + cfg.label + ':', String(currentValue).replace('.', ','));
    if (rawValue === null) return;
    var parsedValue = OBRAS.helpers.toNumber ? OBRAS.helpers.toNumber(rawValue) : Number(String(rawValue).replace(',', '.'));
    if (!parsedValue) {
      OBRAS.ui.toast('Valor inválido.');
      return;
    }

    var dateField = kind === 'recebimentos' ? 'dataRecebimento' : (kind === 'despesas' ? 'dataVencimento' : 'dataVencimento');
    var currentDate = item[dateField] || item.dataDespesa || item.data || OBRAS.helpers.todayISO();
    var newDate = window.prompt('Nova data (AAAA-MM-DD):', currentDate);
    if (newDate === null) return;
    newDate = String(newDate || '').trim() || currentDate;

    var currentDesc = item.descricao || item.observacoes || item.observacao || item.tipoDespesa || '';
    var newDesc = window.prompt('Descrição / observação:', currentDesc);
    if (newDesc === null) return;

    item.valor = parsedValue;

    if (kind === 'recebimentos') {
      item.dataRecebimento = newDate;
      item.descricao = newDesc || item.descricao || 'Recebimento';
      item.observacoes = item.observacoes !== undefined ? newDesc : (item.observacoes || '');
    } else if (kind === 'pagamentosParceiros') {
      item.dataVencimento = newDate;
      item.descricao = newDesc || item.descricao || 'Pagamento parceiro';
      item.observacoes = item.observacoes !== undefined ? newDesc : (item.observacoes || '');
      if (item.dataPagamentoReal && item.dataPagamentoReal !== '') {
        var keepPaidDate = window.confirm('Manter a baixa como paga na nova data?');
        if (keepPaidDate) item.dataPagamentoReal = newDate;
      }
    } else if (kind === 'despesas') {
      var tipoAtual = item.tipoDespesa || 'Despesa obra';
      var novoTipo = window.prompt('Tipo da despesa:', tipoAtual);
      if (novoTipo === null) return;
      item.dataVencimento = newDate;
      item.dataDespesa = item.dataDespesa || newDate;
      item.tipoDespesa = novoTipo || tipoAtual;
      item.observacoes = newDesc || item.observacoes || '';
      if (item.dataPagamentoReal && item.dataPagamentoReal !== '') {
        var keepPaidDate2 = window.confirm('Manter a baixa como paga na nova data?');
        if (keepPaidDate2) item.dataPagamentoReal = newDate;
      }
    } else if (kind === 'despesasGerais') {
      var tipoAtualGeral = item.tipoDespesa || 'Despesa geral';
      var novoTipoGeral = window.prompt('Tipo da despesa geral:', tipoAtualGeral);
      if (novoTipoGeral === null) return;
      item.dataVencimento = newDate;
      item.tipoDespesa = novoTipoGeral || tipoAtualGeral;
      item.descricao = newDesc || item.descricao || 'Despesa geral';
      if (item.dataPagamentoReal && item.dataPagamentoReal !== '') {
        var keepPaidDate3 = window.confirm('Manter a baixa como paga na nova data?');
        if (keepPaidDate3) item.dataPagamentoReal = newDate;
      }
    }

    item.updatedAt = new Date().toISOString();
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast(cfg.label + ' atualizado.');
  },

  payFinanceEntry: function(kind, id){
    var cfg = this.getFinanceEntryConfig(kind);
    if (!cfg) return;
    var item = this.getFinanceEntryById(kind, id);
    if (!item) {
      OBRAS.ui.toast('Lançamento não encontrado.');
      return;
    }
    var current = item.dataPagamentoReal || OBRAS.helpers.todayISO();
    var paidAt = window.prompt('Confirmar data de pagamento (AAAA-MM-DD):', current);
    if (paidAt === null) return;
    paidAt = String(paidAt || '').trim() || OBRAS.helpers.todayISO();

    if (kind === 'recebimentos') {
      item.dataRecebimento = paidAt;
    } else {
      item.dataPagamentoReal = paidAt;
      if (!item.dataVencimento) item.dataVencimento = paidAt;
      if (kind === 'despesas' && !item.dataDespesa) item.dataDespesa = paidAt;
    }

    item.updatedAt = new Date().toISOString();
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast(cfg.label + ' marcado como pago.');
  },

  deleteFinanceEntry: function(kind, id){
    var cfg = this.getFinanceEntryConfig(kind);
    if (!cfg) return;
    var item = this.getFinanceEntryById(kind, id);
    if (!item) return;

    if (!window.confirm('Excluir ' + cfg.label.toLowerCase() + '?')) return;
    OBRAS.state[cfg.key] = (OBRAS.state[cfg.key] || []).filter(function(entry){ return entry.id !== id; });
    OBRAS.stateApi.save();
    OBRAS.app.render();
    OBRAS.ui.toast(cfg.label + ' excluído.');
  },

};
