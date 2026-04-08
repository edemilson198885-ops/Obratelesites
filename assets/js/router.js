
window.OBRAS = window.OBRAS || {};
OBRAS.router = {
  screens: {},
  register: function(name, renderFn){ this.screens[name] = renderFn; },
  goTo: function(name){
    OBRAS.state.currentScreen = name;
    OBRAS.stateApi.save();
    OBRAS.app.render();
  },
  renderCurrent: function(){
    var renderFn = this.screens[OBRAS.state.currentScreen];
    if (renderFn) renderFn();
  }
};
