window.OBRAS = window.OBRAS || {};
OBRAS.helpers = {
  money: function(value){
    return Number(value || 0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  },
  todayLabel: function(){
    return new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  },
  uid: function(){
    return 'id_' + Math.random().toString(36).slice(2, 10);
  }
};
