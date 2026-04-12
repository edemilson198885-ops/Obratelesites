
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
    return '<button class="nav-btn ' + (current === key ? 'active' : '') + '" data-go="' + key + '"><span class="nav-icon">' + OBRAS.ui.icon(key) + '</span><span class="nav-copy"><span class="nav-title">' + title + '</span>' + (subtitle ? '<span class="nav-subtitle">' + subtitle + '</span>' : '') + '</span></button>';
  },
  renderSidebar: function(){
    if (!OBRAS.state.session.loggedIn) {
      this.setHTML('sidebar', '');
      return;
    }
    this.setHTML('sidebar', '      <div class="brand-box">        <img src="./assets/img/logo-telesites.png" alt="Logo TELESITES" />        <div>          <div class="brand-title">TELESITES</div>          <div class="brand-sub">Controle operacional</div>        </div>      </div>      <div class="nav-section">        <div class="nav-label">Menu</div>        ' + this.navItem(OBRAS.state.currentScreen, 'dashboard', 'Dashboard', '') + '        ' + this.navItem(OBRAS.state.currentScreen, 'obras', 'Obras', '') + '        ' + this.navItem(OBRAS.state.currentScreen, 'financeiro', 'Financeiro', '') + '        ' + this.navItem(OBRAS.state.currentScreen, 'cadastros', 'Cadastros', '') + '        ' + this.navItem(OBRAS.state.currentScreen, 'configuracoes', 'Config', '') + '      </div>    ');
  },
  renderTopbar: function(){
    if (!OBRAS.state.session.loggedIn) {
      this.setHTML('topbar', '');
      return;
    }
    this.setHTML('topbar', '      <div class="panel topbar">        <div class="topbar-left">          <img class="topbar-logo" src="./assets/img/logo-telesites.png" alt="Logo" />          <div>            <div class="topbar-title">Controle de Obras</div>            <div class="topbar-sub">' + OBRAS.helpers.todayLabel() + '</div>          </div>        </div>        <div class="topbar-right">          <div class="pill"><span class="pill-dot"></span>Local</div>          <div class="pill">' + OBRAS.helpers.escape(OBRAS.state.session.userName || 'Local') + '</div>          <button class="btn btn-soft" id="logout-btn">Sair</button>        </div>      </div>    ');
  },
  renderBottomNav: function(){
    if (!OBRAS.state.session.loggedIn) {
      this.setHTML('bottom-nav', '');
      return;
    }
    var items = [
      { key:'dashboard', title:'Início' },
      { key:'obras', title:'Obras' },
      { key:'financeiro', title:'Financeiro' },
      { key:'cadastros', title:'Base' },
      { key:'configuracoes', title:'Ajustes' }
    ];
    var html = '<div class="mobile-bottom-nav panel">' + items.map(function(item){
      var active = OBRAS.state.currentScreen === item.key ? 'active' : '';
      return '<button class="mobile-nav-btn ' + active + '" data-go="' + item.key + '"><span class="mobile-nav-icon">' + OBRAS.ui.icon(item.key) + '</span><span class="mobile-nav-label">' + item.title + '</span></button>';
    }).join('') + '</div>';
    this.setHTML('bottom-nav', html);
  }
};
