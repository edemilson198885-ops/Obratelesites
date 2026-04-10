window.OBRAS = window.OBRAS || {};
OBRAS.loginScreen = {
  render: function(){
    OBRAS.ui.setHTML('screen-container',
      '<div class="login-shell">'
      + '<div class="login-card login-card-compact">'
      + '<div class="login-brand">'
      + '<img src="./assets/img/logo-telesites.png" alt="Logo TELESITES" />'
      + '<div><h1 class="login-title">Controle de Obras</h1></div>'
      + '</div>'
      + '<div class="field"><label>Email</label><input id="login-email" type="email" value="" placeholder="Digite seu email" /></div>'
      + '<div class="field"><label>Senha</label><input id="login-password" type="password" value="" placeholder="Digite sua senha" /></div>'
      + '<div class="login-actions login-actions-column">'
      + '<button class="btn btn-primary" id="login-local-btn">Entrar</button>'
      + '<button class="btn btn-link" id="forgot-password-btn">Esqueci minha senha</button>'
      + '</div>'
      + '</div>'
      + '</div>'
    );
  }
};
