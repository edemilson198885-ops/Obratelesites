
window.OBRAS = window.OBRAS || {};
OBRAS.events = {
  bindGlobal: function(){
    document.addEventListener('change', function(e){
      if (e.target && e.target.id === 'backup-import-input' && e.target.files && e.target.files[0]) {
        OBRAS.services.readJSONFile(e.target.files[0], function(parsed){ OBRAS.services.importBackupObject(parsed); });
        e.target.value = '';
      }
    });
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-go]');
      if (btn) {
        OBRAS.router.goTo(btn.getAttribute('data-go'));
        return;
      }
      if (e.target.id === 'login-local-btn') {
        var input = document.getElementById('login-name');
        OBRAS.services.loginLocal(input && input.value ? input.value : 'Edemilson');
        OBRAS.app.render();
        OBRAS.ui.toast('Acesso local liberado.');
        return;
      }
      if (e.target.id === 'use-demo-btn') {
        OBRAS.services.useDemoData();
        return;
      }
      if (e.target.id === 'logout-btn') {
        OBRAS.services.logout();
        OBRAS.app.render();
        return;
      }
      if (e.target.id === 'reset-phase2-btn') {
        OBRAS.services.resetBase();
        return;
      }
      if (e.target.id === 'obra-save-btn') {
        OBRAS.services.submitObra();
        return;
      }
      if (e.target.id === 'obra-clear-btn') {
        OBRAS.state.form = {};
        OBRAS.app.render();
        return;
      }
      if (e.target.id === 'fin-submit-btn') {
        OBRAS.services.submitRecebimento();
        return;
      }
      if (e.target.id === 'geral-submit-btn') {
        OBRAS.services.submitDespesaGeral();
        return;
      }
      if (e.target.id === 'cadastro-save-btn') {
        OBRAS.services.submitCadastro();
        return;
      }
      if (e.target.id === 'cadastro-clear-btn') {
        OBRAS.services.clearCadastroForm();
        return;
      }
      if (e.target.id === 'backup-export-btn') {
        OBRAS.services.downloadBackup();
        return;
      }
      if (e.target.id === 'backup-import-btn') {
        OBRAS.services.openImportDialog();
        return;
      }
      var action = e.target.closest('[data-action]');
      if (!action) return;
      var act = action.getAttribute('data-action');
      var id = action.getAttribute('data-id');
      if (act === 'edit-obra') OBRAS.services.editObra(id);
      if (act === 'delete-obra') OBRAS.services.deleteObra(id);
      if (act === 'edit-cadastro') OBRAS.services.editCadastro(action.getAttribute('data-kind'), id);
      if (act === 'delete-cadastro') OBRAS.services.deleteCadastro(action.getAttribute('data-kind'), id);
    });
  }
};
