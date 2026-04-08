window.OBRAS = window.OBRAS || {};
OBRAS.state = {};
OBRAS.stateApi = {
  initialize: function(){
    var data = OBRAS.storage.load();
    OBRAS.state = data || OBRAS.models.createDemoState();
    OBRAS.state.currentScreen = OBRAS.state.session.loggedIn ? OBRAS.config.SCREENS.DASHBOARD : OBRAS.config.SCREENS.LOGIN;
  },
  save: function(){
    OBRAS.storage.save(OBRAS.state);
  }
};
