window.OBRAS = window.OBRAS || {};
OBRAS.configuracoesScreen = {
  render: function(){
    OBRAS.ui.setHTML('screen-container', '\
      <div class="screen-head">\
        <div><h1 class="screen-title">Configurações</h1><div class="screen-subtitle">Backup, nuvem, preferências e dados do sistema.</div></div>\
      </div>\
      <div class="list-card">\
        <div class="list-item"><div><strong>Modo de abertura</strong><div class="muted">Index local sem servidor</div></div><div class="badge badge-success">OK</div></div>\
        <div class="list-item"><div><strong>Estrutura em pastas</strong><div class="muted">CSS, JS e telas separadas</div></div><div class="badge badge-success">OK</div></div>\
        <div class="list-item"><div><strong>Próxima fase</strong><div class="muted">Migrar banco, login real e dashboard real</div></div><div class="badge badge-warning">Pendente</div></div>\
      </div>\
    ');
  }
};
