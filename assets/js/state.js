
window.OBRAS = window.OBRAS || {};
OBRAS.state = {};
OBRAS.stateApi = {

  normalizeDB: function(db){
    db = db || OBRAS.models.createEmptyDB();
    db.meta = db.meta || { version: OBRAS.config.VERSION, updatedAt: new Date().toISOString(), seqOS: 0, importedFromLegacy: false };
    db.session = db.session || { loggedIn: false, userName: 'Edemilson' };
    db.empresa = db.empresa || { nome: 'TELESITES', titulo: 'Controle de Obras' };
    db.empresas = Array.isArray(db.empresas) ? db.empresas : [];
    db.parceiros = Array.isArray(db.parceiros) ? db.parceiros : [];
    db.clientes = Array.isArray(db.clientes) ? db.clientes : [];
    db.obras = Array.isArray(db.obras) ? db.obras : [];
    db.recebimentos = Array.isArray(db.recebimentos) ? db.recebimentos : [];
    db.repasses = Array.isArray(db.repasses) ? db.repasses : [];
    db.pagamentosParceiros = Array.isArray(db.pagamentosParceiros) ? db.pagamentosParceiros : [];
    db.despesas = Array.isArray(db.despesas) ? db.despesas : [];
    db.despesasGerais = Array.isArray(db.despesasGerais) ? db.despesasGerais : [];
    db.movimentosCaixa = Array.isArray(db.movimentosCaixa) ? db.movimentosCaixa : [];
    db.despesasFixas = Array.isArray(db.despesasFixas) ? db.despesasFixas : [];
    db.recurringIgnore = Array.isArray(db.recurringIgnore) ? db.recurringIgnore : [];
    db.form = db.form || {};
    db.ui = db.ui || {};
    db.ui.selectedObraId = db.ui.selectedObraId || null;
    db.ui.obrasFilters = db.ui.obrasFilters || { query:'', status:'todos', cidade:'', parceiro:'', cliente:'' };
    db.ui.financeFilters = db.ui.financeFilters || { query:'', tipo:'todos', status:'todos', obra:'' };
    db.cloud = db.cloud || { enabled:true, mode:'automatico', projectUrl: OBRAS.config.SUPABASE_URL, lastSyncAt:'', lastSyncStatus:'Não sincronizado', auto:true, online:false };
    db.cloudControl = db.cloudControl || { baseId:'', userId:(db.session && db.session.userId) || '', lastHash:'', lastSyncAt:'' };
    return db;
  },
  buildBaseState: function(forceSeed){
    if (forceSeed) return OBRAS.models.createSeedDB();
    var current = OBRAS.storage.load(OBRAS.config.STORAGE_KEY);
    if (current) return this.normalizeDB(current);

    var legacy = null;
    for (var i = 0; i < OBRAS.config.LEGACY_STORAGE_KEYS.length; i += 1) {
      legacy = OBRAS.storage.load(OBRAS.config.LEGACY_STORAGE_KEYS[i]);
      if (legacy) break;
    }
    if (legacy && legacy.obras && legacy.recebimentos) {
      return this.normalizeDB(this.migrateLegacy(legacy));
    }

    // V9.6: base totalmente limpa. Sem seed e sem cadastros padrão.
    return this.normalizeDB(OBRAS.models.createEmptyDB());
  },
  migrateLegacy: function(source){
    var db = OBRAS.models.createEmptyDB();
    db.meta.importedFromLegacy = true;
    db.meta.updatedAt = new Date().toISOString();
    db.meta.seqOS = Number(source.meta && source.meta.seqOS || 0);
    db.session = source.session || db.session;
    db.empresa = source.empresa || db.empresa;
    db.empresas = Array.isArray(source.empresas) ? source.empresas : db.empresas;
    db.parceiros = Array.isArray(source.parceiros) ? source.parceiros : db.parceiros;
    db.clientes = Array.isArray(source.clientes) ? source.clientes : db.clientes;
    db.obras = Array.isArray(source.obras) ? source.obras : [];
    db.recebimentos = Array.isArray(source.recebimentos) ? source.recebimentos : [];
    db.repasses = Array.isArray(source.repasses) ? source.repasses : [];
    db.pagamentosParceiros = Array.isArray(source.pagamentosParceiros) ? source.pagamentosParceiros : [];
    db.despesas = Array.isArray(source.despesas) ? source.despesas : [];
    db.despesasGerais = Array.isArray(source.despesasGerais) ? source.despesasGerais : [];
    db.movimentosCaixa = Array.isArray(source.movimentosCaixa) ? source.movimentosCaixa : [];
    db.despesasFixas = Array.isArray(source.despesasFixas) ? source.despesasFixas : [];
    db.recurringIgnore = Array.isArray(source.recurringIgnore) ? source.recurringIgnore : [];
    return db;
  },
  initialize: function(forceSeed){
    OBRAS.state = this.normalizeDB(this.buildBaseState(forceSeed));
    OBRAS.state.currentScreen = OBRAS.state.session && OBRAS.state.session.loggedIn ? OBRAS.config.SCREENS.DASHBOARD : OBRAS.config.SCREENS.LOGIN;
    OBRAS.state.form = OBRAS.state.form || {};
  },
  save: function(){
    OBRAS.state.meta = OBRAS.state.meta || {};
    OBRAS.state.meta.version = OBRAS.config.VERSION;
    OBRAS.state.meta.updatedAt = new Date().toISOString();
    OBRAS.storage.save(OBRAS.state, OBRAS.config.STORAGE_KEY);
  }
};
