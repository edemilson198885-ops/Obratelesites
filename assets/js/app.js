
window.OBRAS = window.OBRAS || {};
OBRAS.app = {
  registerScreens: function(){
    OBRAS.router.register(OBRAS.config.SCREENS.LOGIN, function(){ OBRAS.loginScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.DASHBOARD, function(){ OBRAS.dashboardScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.OBRAS, function(){ OBRAS.obrasScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.FINANCEIRO, function(){ OBRAS.financeiroScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.CADASTROS, function(){ OBRAS.cadastrosScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.CONFIGURACOES, function(){ OBRAS.configuracoesScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.OBRA_DETALHE, function(){ OBRAS.obraDetalheScreen.render(); });
    OBRAS.router.register(OBRAS.config.SCREENS.RELATORIOS, function(){ OBRAS.relatoriosScreen.render(); });
  },
  render: function(){
    document.title = OBRAS.config.APP_NAME;
    OBRAS.ui.renderSidebar();
    OBRAS.ui.renderTopbar();
    OBRAS.ui.renderBottomNav();
    OBRAS.router.renderCurrent();
  },
  boot: async function(){
    OBRAS.stateApi.initialize(false);
    OBRAS.services.enableAutoSaveSync();
    OBRAS.events.bindGlobal();
    this.registerScreens();
    var hasSession = await OBRAS.services.restoreSupabaseSession();
    if (!hasSession) {
      OBRAS.state.currentScreen = OBRAS.config.SCREENS.LOGIN;
    }
    this.render();
    if (hasSession) {
      OBRAS.services.bootstrapAutoSync();
    }
  }
};
window.addEventListener('DOMContentLoaded', function(){ OBRAS.app.boot(); });
