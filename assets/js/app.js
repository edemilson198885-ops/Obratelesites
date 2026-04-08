window.OBRAS = window.OBRAS || {};
OBRAS.app = {
  registerScreens: function(){
    OBRAS.router.register(OBRAS.config.SCREENS.LOGIN, OBRAS.loginScreen.render);
    OBRAS.router.register(OBRAS.config.SCREENS.DASHBOARD, OBRAS.dashboardScreen.render);
    OBRAS.router.register(OBRAS.config.SCREENS.OBRAS, OBRAS.obrasScreen.render);
    OBRAS.router.register(OBRAS.config.SCREENS.FINANCEIRO, OBRAS.financeiroScreen.render);
    OBRAS.router.register(OBRAS.config.SCREENS.CADASTROS, OBRAS.cadastrosScreen.render);
    OBRAS.router.register(OBRAS.config.SCREENS.CONFIGURACOES, OBRAS.configuracoesScreen.render);
  },
  render: function(){
    document.title = OBRAS.config.APP_NAME;
    OBRAS.ui.renderSidebar();
    OBRAS.ui.renderTopbar();
    OBRAS.ui.renderBottomNav();
    OBRAS.router.renderCurrent();
  },
  boot: function(){
    OBRAS.stateApi.initialize();
    OBRAS.events.bindGlobal();
    this.registerScreens();
    this.render();
  }
};
window.addEventListener('DOMContentLoaded', function(){ OBRAS.app.boot(); });
