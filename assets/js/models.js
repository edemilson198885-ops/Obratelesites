
window.OBRAS = window.OBRAS || {};
OBRAS.models = {
  createEmptyDB: function(){
    return {
      meta: { version: OBRAS.config.VERSION, updatedAt: new Date().toISOString(), seqOS: 0, importedFromLegacy: false },
      session: { loggedIn: false, userName: '' },
      empresa: { nome: 'TELESITES', titulo: 'Controle de Obras' },
      empresas: [],
      parceiros: [],
      clientes: [],
      obras: [],
      recebimentos: [],
      repasses: [],
      pagamentosParceiros: [],
      despesas: [],
      despesasGerais: [],
      movimentosCaixa: [],
      despesasFixas: [],
      recurringIgnore: []
    };
  },
  createSeedDB: function(){
    return this.createEmptyDB();
  }
};
