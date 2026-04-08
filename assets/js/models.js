window.OBRAS = window.OBRAS || {};
OBRAS.models = {
  createDemoState: function(){
    return {
      session: { loggedIn: false, userName: 'Edemilson' },
      empresa: { nome: 'TELESITES', titulo: 'Controle de Obras' },
      metricas: {
        receitaContratada: 80300,
        receitaRecebida: 16500,
        aReceber: 63800,
        parceirosPagar: 32250,
        saldoCaixa: 593.26,
        despesasVencer: 5246.31,
        despesasPagas: 1626.74,
        receberLiquido: 26896.95
      },
      obras: [
        { id:'OBR-001', nome:'Modernização Torre Artemis', cidade:'Campinas/SP', status:'Em andamento', valor:25800, parceiro:'Alfa', etapa:'Estrutura' },
        { id:'OBR-002', nome:'Vistoria Site Delta', cidade:'Sumaré/SP', status:'A receber', valor:18400, parceiro:'Nexus', etapa:'Recebimento' },
        { id:'OBR-003', nome:'Reforço Estrutural Atlas', cidade:'Piracicaba/SP', status:'Planejamento', valor:36100, parceiro:'Prime', etapa:'Mobilização' }
      ],
      avisos: [
        { titulo:'2 despesas vencem em 5 dias', detalhe:'Revisar fornecedores e agenda de pagamento.' },
        { titulo:'1 obra com recebimento pendente', detalhe:'Conferir medição e liberar cobrança.' },
        { titulo:'Backup local recomendado', detalhe:'Gerar arquivo antes da próxima migração.' }
      ]
    };
  }
};
