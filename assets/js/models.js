
window.OBRAS = window.OBRAS || {};
OBRAS.models = {
  createEmptyDB: function(){
    return {
      meta: { version: OBRAS.config.VERSION, updatedAt: new Date().toISOString(), seqOS: 0, importedFromLegacy: false },
      session: { loggedIn: false, userName: 'Edemilson' },
      empresa: { nome: 'TELESITES', titulo: 'Controle de Obras' },
      empresas: [
        { id:'emp_1', nome:'TELESITES' },
        { id:'emp_2', nome:'Metal Alfa' }
      ],
      parceiros: [
        { id:'par_1', nome:'Alfa' },
        { id:'par_2', nome:'Nexus' },
        { id:'par_3', nome:'Prime' }
      ],
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
    var db = this.createEmptyDB();
    db.meta.seqOS = 3;
    db.obras = [
      { id:'obra_1', numeroOS:'OS-001', siteTorre:'Modernização Torre Artemis', cidade:'Campinas/SP', statusObra:'Em execução', statusCicloOS:'Ativa', valorObra:25800, parceiroNome:'Alfa', etapa:'Estrutura', dataAbertura:'2026-04-02' },
      { id:'obra_2', numeroOS:'OS-002', siteTorre:'Vistoria Site Delta', cidade:'Sumaré/SP', statusObra:'Planejado', statusCicloOS:'Ativa', valorObra:18400, parceiroNome:'Nexus', etapa:'Recebimento', dataAbertura:'2026-04-04' },
      { id:'obra_3', numeroOS:'OS-003', siteTorre:'Reforço Estrutural Atlas', cidade:'Piracicaba/SP', statusObra:'Planejado', statusCicloOS:'Ativa', valorObra:36100, parceiroNome:'Prime', etapa:'Mobilização', dataAbertura:'2026-04-08' }
    ];
    db.recebimentos = [
      { id:'rec_1', os:'OS-001', descricao:'Medição inicial', dataRecebimento:'2026-04-05', valor:10500 },
      { id:'rec_2', os:'OS-002', descricao:'Sinal de vistoria', dataRecebimento:'2026-04-06', valor:6000 }
    ];
    db.repasses = [
      { id:'rep_1', os:'OS-001', parceiroNome:'Alfa', valorFechadoParceiro:9800 },
      { id:'rep_2', os:'OS-002', parceiroNome:'Nexus', valorFechadoParceiro:7200 },
      { id:'rep_3', os:'OS-003', parceiroNome:'Prime', valorFechadoParceiro:15250 }
    ];
    db.pagamentosParceiros = [
      { id:'pag_1', os:'OS-001', descricao:'Adiantamento equipe Alfa', dataVencimento:'2026-04-09', dataPagamentoReal:'2026-04-09', valor:4830, natureza:'pagamento' },
      { id:'pag_2', os:'OS-003', descricao:'Mobilização Prime', dataVencimento:'2026-04-12', dataPagamentoReal:'', valor:6500, natureza:'pagamento' }
    ];
    db.despesas = [
      { id:'des_1', os:'OS-001', tipoDespesa:'Combustível', dataVencimento:'2026-04-15', dataPagamentoReal:'2026-04-10', valor:626.74, observacoes:'Equipe campo' },
      { id:'des_2', os:'OS-002', tipoDespesa:'Hospedagem', dataVencimento:'2026-04-18', dataPagamentoReal:'', valor:1246.31, observacoes:'Equipe vistoria' },
      { id:'des_3', os:'OS-003', tipoDespesa:'Frete', dataVencimento:'2026-04-20', dataPagamentoReal:'', valor:1500, observacoes:'Estrutura metálica' }
    ];
    db.despesasGerais = [
      { id:'ger_1', tipoDespesa:'Internet / Sistemas', dataVencimento:'2026-04-14', dataPagamentoReal:'2026-04-11', valor:1000, observacoes:'Plataformas' },
      { id:'ger_2', tipoDespesa:'Ferramental', dataVencimento:'2026-04-17', dataPagamentoReal:'', valor:2500, observacoes:'Reposição' }
    ];
    db.movimentosCaixa = [
      { id:'mov_1', tipo:'aporte', natureza:'entrada', data:'2026-04-01', valor:550, descricao:'Capital inicial do período' }
    ];
    return db;
  }
};
