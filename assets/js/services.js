window.OBRAS = window.OBRAS || {};
OBRAS.services = {
  loginDemo: function(name){
    OBRAS.state.session.loggedIn = true;
    OBRAS.state.session.userName = name || 'Edemilson';
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.DASHBOARD;
    OBRAS.stateApi.save();
  },
  logout: function(){
    OBRAS.state.session.loggedIn = false;
    OBRAS.state.currentScreen = OBRAS.config.SCREENS.LOGIN;
    OBRAS.stateApi.save();
  },
  resetDemo: function(){
    OBRAS.storage.reset();
    OBRAS.stateApi.initialize();
  }
};
