
window.OBRAS = window.OBRAS || {};
OBRAS.app = {
  registerScreens: function(){
    OBRAS.router.register(OBRAS.config.SCREENS.LOGIN, function(){ OBRAS.loginScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.DASHBOARD, function(){ OBRAS.dashboardScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.OBRAS, function(){ OBRAS.obrasScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.FINANCEIRO, function(){ OBRAS.financeiroScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.CADASTROS, function(){ OBRAS.cadastrosScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.CONFIGURACOES, function(){ OBRAS.configuracoesScreen.render(); });
  },
  render: function(){
    document.title = OBRAS.config.APP_NAME;
    OBRAS.ui.renderSidebar();
    OBRAS.ui.renderTopbar();
    OBRAS.ui.renderBottomNav();
    OBRAS.router.renderCurrent();
  },
  boot: function(){
    OBRAS.stateApi.initialize(false);
    OBRAS.events.bindGlobal();
    this.registerScreens();
    this.render();
  }
};
window.addEventListener('DOMContentLoaded', function(){ OBRAS.app.boot(); });
