
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
    OBRAS.state = OBRAS.stateApi.normalizeDB ? OBRAS.stateApi.normalizeDB(obj) : obj;
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.CONFIGURACOES;
    OBRAS.stateApi.save();
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

  loginLocal: function(name){
    OBRAS.state.session.loggedIn = true;
    OBRAS.state.session.userName = name || 'Edemilson';
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
    OBRAS.stateApi.save();
  },
  logout: function(){
    OBRAS.state.session.loggedIn = false;
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.LOGIN;
    OBRAS.state.form = {};
    OBRAS.stateApi.save();
  },
  resetBase: function(){
    if (!window.confirm('Resetar a base local da Fase 2?')) return;
    OBRAS.storage.reset();
    OBRAS.stateApi.initialize(true);
    OBRAS.app.render();
    OBRAS.ui.toast('Base local recriada com sucesso.');
  },
  useDemoData: function(){
    OBRAS.state = OBRAS.models.createSeedDB();
    OBRAS.state.session.loggedIn = true;
    OBRAS.state.session.userName = OBRAS.state.session.userName || 'Edemilson';
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
  }
};
