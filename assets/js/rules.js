window.OBRAS = window.OBRAS || {};
OBRAS.rules = {
  nextOS: function(db){
    db.meta = db.meta || {};
    db.meta.seqOS = Number(db.meta.seqOS || 0) + 1;
    return 'OS-' + String(db.meta.seqOS).padStart(3,'0');
  },

  itemMatchesObra: function(item, obra){
    if (!item || !obra) return false;
    return item.obraId === obra.id || item.os === obra.numeroOS;
  },

  valueFechadoParceiro: function(obra, db){
    var repasse = (db.repasses || []).find(function(r){
      return r.obraId === obra.id || r.os === obra.numeroOS;
    });
    return Number(repasse && repasse.valorFechadoParceiro || 0);
  },

  obraMetrics: function(obra, db){
    var recebimentos = (db.recebimentos || []).filter(function(r){ return OBRAS.rules.itemMatchesObra(r, obra); });
    var pagamentos = (db.pagamentosParceiros || []).filter(function(p){ return OBRAS.rules.itemMatchesObra(p, obra); });
    var despesasObra = (db.despesas || []).filter(function(d){ return OBRAS.rules.itemMatchesObra(d, obra); });

    var totalRecebido = recebimentos.reduce(function(s,r){ return s + Number(r.valor || 0); }, 0);
    var valorFechadoParceiro = OBRAS.rules.valueFechadoParceiro(obra, db);
    var totalPagoParceiro = pagamentos.filter(function(p){ return p.dataPagamentoReal || p.status === 'pago'; }).reduce(function(s,p){ return s + Number(p.valor || 0); }, 0);
    var totalPrevistoParceiro = pagamentos.reduce(function(s,p){ return s + Number(p.valor || 0); }, 0);
    var totalDespesasObra = despesasObra.reduce(function(s,d){ return s + Number(d.valor || 0); }, 0);
    var despesasPagas = despesasObra.filter(function(d){ return d.dataPagamentoReal || d.status === 'pago'; }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0);
    var despesasPendentes = despesasObra.filter(function(d){ return !(d.dataPagamentoReal || d.status === 'pago'); }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0);

    var saldoReceber = Math.max(0, Number(obra.valorObra || 0) - totalRecebido);
    var baseParceiro = Math.max(valorFechadoParceiro, totalPrevistoParceiro);
    var saldoParceiro = Math.max(0, baseParceiro - totalPagoParceiro);
    var statusFinanceiro = saldoReceber === 0 ? 'Quitado' : (totalRecebido > 0 ? 'Recebido parcial' : 'A receber');

    return {
      id: obra.id,
      numeroOS: obra.numeroOS,
      nome: obra.siteTorre,
      cidade: obra.cidade,
      etapa: obra.etapa || '-',
      parceiroNome: obra.parceiroNome || '-',
      clienteNome: obra.clienteNome || '',
      valorObra: Number(obra.valorObra || 0),
      statusObra: obra.statusObra || '-',
      statusCicloOS: obra.statusCicloOS || 'Ativa',
      totalRecebido: totalRecebido,
      saldoReceber: saldoReceber,
      valorFechadoParceiro: valorFechadoParceiro,
      totalPagoParceiro: totalPagoParceiro,
      saldoParceiro: saldoParceiro,
      totalDespesasObra: totalDespesasObra,
      despesasPagas: despesasPagas,
      despesasPendentes: despesasPendentes,
      statusFinanceiro: statusFinanceiro,
      resultadoLiquido: totalRecebido - totalPagoParceiro - despesasPagas,
      dataAbertura: obra.dataAbertura || ''
    };
  },

  painelMetrics: function(db){
    var obras = (db.obras || []).map(function(o){ return OBRAS.rules.obraMetrics(o, db); });
    var receitaContratada = obras.reduce(function(s,o){ return s + Number(o.valorObra || 0); }, 0);
    var receitaRecebida = (db.recebimentos || []).reduce(function(s,r){ return s + Number(r.valor || 0); }, 0);
    var aReceberObras = obras.reduce(function(s,o){ return s + Number(o.saldoReceber || 0); }, 0);
    var valorFechadoParceiros = obras.reduce(function(s,o){ return s + Number(Math.max(o.valorFechadoParceiro || 0, o.totalPagoParceiro || 0, (o.totalPagoParceiro || 0) + (o.saldoParceiro || 0))); }, 0);
    var valorPagoParceiros = (db.pagamentosParceiros || []).filter(function(p){ return p.dataPagamentoReal || p.status === 'pago'; }).reduce(function(s,p){ return s + Number(p.valor || 0); }, 0);
    var saldoParceirosAPagar = obras.reduce(function(s,o){ return s + Number(o.saldoParceiro || 0); }, 0);

    var despesasObraPagas = (db.despesas || []).filter(function(d){ return d.dataPagamentoReal || d.status === 'pago'; }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0);
    var despesasObraPendentes = (db.despesas || []).filter(function(d){ return !(d.dataPagamentoReal || d.status === 'pago'); }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0);
    var despesasGeraisPagas = (db.despesasGerais || []).filter(function(d){ return d.dataPagamentoReal || d.status === 'pago'; }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0);
    var despesasGeraisPendentes = (db.despesasGerais || []).filter(function(d){ return !(d.dataPagamentoReal || d.status === 'pago'); }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0);

    var entradasMovCaixa = (db.movimentosCaixa || []).filter(function(m){ return m.natureza === 'entrada'; }).reduce(function(s,m){ return s + Number(m.valor || 0); }, 0);
    var saidasMovCaixa = (db.movimentosCaixa || []).filter(function(m){ return m.natureza === 'saida'; }).reduce(function(s,m){ return s + Number(m.valor || 0); }, 0);
    var capitalAportado = (db.movimentosCaixa || []).filter(function(m){ return m.tipo === 'aporte'; }).reduce(function(s,m){ return s + Number(m.valor || 0); }, 0);

    var caixaRealizado = receitaRecebida + entradasMovCaixa - valorPagoParceiros - despesasObraPagas - despesasGeraisPagas - saidasMovCaixa;
    var aPagarPrevisto = saldoParceirosAPagar + despesasObraPendentes + despesasGeraisPendentes;
    var caixaProjetado = caixaRealizado + aReceberObras - aPagarPrevisto;
    var despesasPagas = despesasObraPagas + despesasGeraisPagas;
    var despesasAVencer = (db.despesas || []).filter(function(d){ return !(d.dataPagamentoReal || d.status === 'pago') && OBRAS.helpers.statusVencimento(d.dataVencimento,'') !== 'Atrasado'; }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0) +
      (db.despesasGerais || []).filter(function(d){ return !(d.dataPagamentoReal || d.status === 'pago') && OBRAS.helpers.statusVencimento(d.dataVencimento,'') !== 'Atrasado'; }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0);
    var despesasAtrasadas = (db.despesas || []).filter(function(d){ return !(d.dataPagamentoReal || d.status === 'pago') && OBRAS.helpers.statusVencimento(d.dataVencimento,'') === 'Atrasado'; }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0) +
      (db.despesasGerais || []).filter(function(d){ return !(d.dataPagamentoReal || d.status === 'pago') && OBRAS.helpers.statusVencimento(d.dataVencimento,'') === 'Atrasado'; }).reduce(function(s,d){ return s + Number(d.valor || 0); }, 0);

    return {
      obras: obras,
      receitaContratada: receitaContratada,
      receitaRecebida: receitaRecebida,
      aReceberObras: aReceberObras,
      valorFechadoParceiros: valorFechadoParceiros,
      valorPagoParceiros: valorPagoParceiros,
      saldoParceirosAPagar: saldoParceirosAPagar,
      despesasPagas: despesasPagas,
      despesasAVencer: despesasAVencer,
      despesasAtrasadas: despesasAtrasadas,
      capitalAportado: capitalAportado,
      caixaRealizado: caixaRealizado,
      aPagarPrevisto: aPagarPrevisto,
      caixaProjetado: caixaProjetado
    };
  },

  avisos: function(db, m){
    var avisos = [];
    var hoje = OBRAS.helpers.todayISO();
    var vencendo = (db.despesas || []).concat(db.despesasGerais || []).filter(function(item){
      return !(item.dataPagamentoReal || item.status === 'pago') && item.dataVencimento && OBRAS.helpers.compareISODate(item.dataVencimento, hoje) >= 0;
    });
    if (vencendo.length) avisos.push({ titulo: vencendo.length + ' despesa(s) a vencer', detalhe: 'Revisar pagamentos programados dos próximos dias.' });
    var pendentes = m.obras.filter(function(o){ return o.saldoReceber > 0; });
    if (pendentes.length) avisos.push({ titulo: pendentes.length + ' obra(s) com saldo a receber', detalhe: 'Conferir medição, boleto e programação de cobrança.' });
    if (m.saldoParceirosAPagar > 0) avisos.push({ titulo: 'Parceiros com saldo em aberto', detalhe: 'Saldo previsto para parceiros: ' + OBRAS.helpers.money(m.saldoParceirosAPagar) + '.' });
    if (m.despesasAtrasadas > 0) avisos.push({ titulo: 'Despesas atrasadas', detalhe: 'Há ' + OBRAS.helpers.money(m.despesasAtrasadas) + ' em despesas atrasadas.' });
    if (!avisos.length) avisos.push({ titulo: 'Painel em dia', detalhe: 'Sem alertas críticos na base atual.' });
    return avisos;
  }
};
