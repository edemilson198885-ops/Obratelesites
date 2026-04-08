window.OBRAS = window.OBRAS || {};
OBRAS.loginScreen = {
  render: function(){
    OBRAS.ui.setHTML('screen-container', '\
      <div class="login-shell">\
        <div class="login-card">\
          <div class="login-brand">\
            <img src="./assets/img/logo-telesites.png" alt="Logo TELESITES" />\
            <div>\
              <h1 class="login-title">Controle de Obras</h1>\
              <p class="login-sub">Base fase 1 no padrão do MyMoney, pronta para migrar o sistema real.</p>\
            </div>\
          </div>\
          <div class="field">\
            <label>Nome do usuário</label>\
            <input id="login-name" type="text" value="Edemilson" placeholder="Digite seu nome" />\
          </div>\
          <div class="field">\
            <label>Modo desta fase</label>\
            <input type="text" value="Demonstração local sem servidor" disabled />\
          </div>\
          <div class="login-actions">\
            <button class="btn btn-primary" id="login-demo-btn">Entrar</button>\
            <button class="btn" id="reset-demo-btn">Resetar demo</button>\
          </div>\
        </div>\
      </div>\
    ');
  }
};
