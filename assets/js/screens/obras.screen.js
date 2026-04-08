window.OBRAS = window.OBRAS || {};
OBRAS.obrasScreen = {
  render: function(){
    var cards = OBRAS.state.obras.map(function(obra){
      return '<div class="kpi-card"><div class="kpi-label">' + obra.id + '</div><div class="kpi-value">' + obra.nome + '</div><div class="kpi-note">' + obra.cidade + ' · ' + obra.parceiro + ' · ' + obra.status + '</div></div>';
    }).join('');
    OBRAS.ui.setHTML('screen-container', '\
      <div class="screen-head">\
        <div><h1 class="screen-title">Central de obras</h1><div class="screen-subtitle">Base de obras da fase 1. Na fase 2 entram cadastro, filtros, edição e dados reais.</div></div>\
        <div class="actions-row"><button class="btn btn-primary">Nova obra</button><button class="btn" data-go="dashboard">Voltar</button></div>\
      </div>\
      <div class="kpi-grid">' + cards + '</div>\
    ');
  }
};
