window.OBRAS = window.OBRAS || {};
OBRAS.events = {
  bindGlobal: function(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-go]');
      if (btn) {
        OBRAS.router.goTo(btn.getAttribute('data-go'));
        return;
      }
      if (e.target.id === 'login-demo-btn') {
        var input = document.getElementById('login-name');
        OBRAS.services.loginDemo(input && input.value ? input.value : 'Edemilson');
        OBRAS.app.render();
        OBRAS.ui.toast('Login demo realizado.');
        return;
      }
      if (e.target.id === 'reset-demo-btn') {
        OBRAS.services.resetDemo();
        OBRAS.app.render();
        OBRAS.ui.toast('Base demo reiniciada.');
        return;
      }
      if (e.target.id === 'logout-btn') {
        OBRAS.services.logout();
        OBRAS.app.render();
        return;
      }
    });
  }
};
