
window.OBRAS = window.OBRAS || {};
OBRAS.helpers = {
  money: function(value){
    return Number(value || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  },
  toNumber: function(value){
    return Number(String(value == null ? '' : value).replace(/\./g,'').replace(',', '.').replace(/[^0-9.-]/g,'')) || 0;
  },
  uid: function(prefix){
    return (prefix || 'id') + '_' + Math.random().toString(36).slice(2, 10);
  },
  todayISO: function(){
    return new Date().toISOString().slice(0,10);
  },
  todayLabel: function(){
    return new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  },
  escape: function(v){
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  },
  compareISODate: function(a,b){
    return String(a || '').localeCompare(String(b || ''));
  },
  statusVencimento: function(dataVencimento, dataPagamentoReal){
    var hoje = OBRAS.helpers.todayISO();
    if (dataPagamentoReal) return 'Pago';
    if (!dataVencimento) return 'A vencer';
    if (OBRAS.helpers.compareISODate(dataVencimento, hoje) < 0) return 'Atrasado';
    if (OBRAS.helpers.compareISODate(dataVencimento, hoje) === 0) return 'Vence hoje';
    return 'A vencer';
  },
  formatDate: function(value){
    if (!value) return '-';
    var parts = String(value).split('-');
    if (parts.length !== 3) return value;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
};
