
window.OBRAS = window.OBRAS || {};
OBRAS.ui = {
  setHTML: function(id, html){
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  },
  toast: function(message){
    var root = document.getElementById('toast-root');
    if (!root) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    root.appendChild(el);
    setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, 2200);
  },
  icon: function(name){
    var map = { dashboard:'📊', obras:'🏗️', financeiro:'💰', cadastros:'📁', configuracoes:'⚙️' };
    return map[name] || '•';
  },
  badge: function(text, tone){
    return '<span class="badge badge-' + tone + '">' + OBRAS.helpers.escape(text) + '</span>';
  },
  toneByStatus: function(status){
    if (['Quitado','Pago','Encerrada'].indexOf(status) >= 0) return 'success';
    if (['Atrasado'].indexOf(status) >= 0) return 'danger';
    if (['Em execução','Em andamento','Ativa','Recebido parcial','Vence hoje'].indexOf(status) >= 0) return 'info';
    return 'warning';
  },
  navItem: function(current, key, title, subtitle){
    return '<button class="nav-btn ' + (current === key ? 'active' : '') + '" data-go="' + key + '"><span class="nav-icon">' + OBRAS.ui.icon(key) + '</span><span class="nav-copy"><span class="nav-title">' + title + '</span><span class="nav-subtitle">' + subtitle + '</span></span></button>';
  },
  renderSidebar: function(){
    if (!OBRAS.state.session.loggedIn) {
      this.setHTML('sidebar', '');
      return;
    }
    this.setHTML('sidebar', '      <div class="brand-box">        <img src="./assets/img/logo-telesites.png" alt="Logo TELESITES" />        <div>          <div class="brand-title">TELESITES</div>          <div class="brand-sub">Gestão de obras e financeiro</div>        </div>      </div>      <div class="nav-section">        <div class="nav-label">Gestão</div>        ' + this.navItem(OBRAS.state.currentScreen, 'dashboard', 'Dashboard', 'Visão geral') + '        ' + this.navItem(OBRAS.state.currentScreen, 'obras', 'Central de obras', 'Cadastro e status') + '        ' + this.navItem(OBRAS.state.currentScreen, 'financeiro', 'Financeiro', 'Receitas e despesas') + '      </div>      <div class="nav-section">        <div class="nav-label">Base</div>        ' + this.navItem(OBRAS.state.currentScreen, 'cadastros', 'Cadastros', 'Empresas e parceiros') + '        ' + this.navItem(OBRAS.state.currentScreen, 'configuracoes', 'Configurações', 'Backup e preferências') + '      </div>      <div class="sidebar-footer">Fase 3: cadastros reais, backup JSON e base local evoluída.</div>    ');
  },
  renderTopbar: function(){
    if (!OBRAS.state.session.loggedIn) {
      this.setHTML('topbar', '');
      return;
    }
    var imported = OBRAS.state.meta && OBRAS.state.meta.importedFromLegacy;
    this.setHTML('topbar', '      <div class="panel topbar">        <div class="topbar-left">          <img class="topbar-logo" src="./assets/img/logo-telesites.png" alt="Logo" />          <div>            <div class="topbar-title">Controle de Obras</div>            <div class="topbar-sub">TELESITES · Fase 2 local com banco ativo · ' + OBRAS.helpers.todayLabel() + (imported ? ' · dados legados importados' : '') + '</div>          </div>        </div>        <div class="topbar-right">          <div class="pill"><span class="pill-dot"></span>Modo local ativo</div>          <div class="pill">Usuário: ' + OBRAS.helpers.escape(OBRAS.state.session.userName || 'Local') + '</div>          <button class="btn btn-soft" id="logout-btn">Sair</button>        </div>      </div>    ');
  },
  renderBottomNav: function(){ this.setHTML('bottom-nav', ''); }
};
