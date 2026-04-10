window.OBRAS = window.OBRAS || {};
OBRAS.loginScreen = {
  render: function(){
    OBRAS.ui.setHTML('screen-container',
      '<div class="login-shell">'
      + '<div class="login-card">'
      + '<div class="login-brand"><img src="./assets/img/logo-telesites.png" alt="Logo TELESITES" /><div><h1 class="login-title">Controle de Obras</h1><p class="login-sub">V9 com login real via Supabase usando email e senha do cadastro já existente.</p></div></div>'
      + '<div class="field"><label>Email</label><input id="login-email" type="email" value="" placeholder="Digite seu email" /></div>'
      + '<div class="field"><label>Senha</label><input id="login-password" type="password" value="" placeholder="Digite sua senha" /></div>'
      + '<div class="field"><label>Modo</label><input type="text" value="Supabase Auth + sync automática" disabled /></div>'
      + '<div class="top-alert">Entre com o email e a senha já cadastrados no Supabase. Se a sessão ainda estiver válida, o sistema entra direto no painel.</div>'
      + '<div class="login-actions"><button class="btn btn-primary" id="login-local-btn">Entrar</button></div>'
      + '</div>'
      + '</div>'
    );
  }
};
