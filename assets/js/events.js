window.OBRAS = window.OBRAS || {};
OBRAS.events = {
  bindGlobal: function(){
    document.addEventListener('change', function(e){
      if (e.target && e.target.id === 'backup-import-input' && e.target.files && e.target.files[0]) {
        OBRAS.services.readJSONFile(e.target.files[0], function(parsed){ OBRAS.services.importBackupObject(parsed); });
        e.target.value = '';
        return;
      }
      if (e.target && e.target.matches('#obra-filtro-busca, #obra-filtro-status, #obra-filtro-cidade, #obra-filtro-parceiro, #obra-filtro-cliente')) {
        OBRAS.services.setObrasFiltersFromDOM();
        return;
      }
      if (e.target && e.target.id === 'obra-numero-os') {
        OBRAS.services.autofillObraFromSelectedOS();
        return;
      }
      if (e.target && e.target.matches('#fin-filtro-tipo, #fin-filtro-status, #fin-filtro-obra')) {
        OBRAS.services.setFinanceFiltersFromDOM();
        return;
      }
    });

    document.addEventListener('input', function(e){
      if (e.target && e.target.id === 'fin-filtro-busca') {
        OBRAS.services.setFinanceFiltersFromDOM();
        return;
      }
    });

    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-go]');
      if (btn) {
        OBRAS.router.goTo(btn.getAttribute('data-go'));
        return;
      }

      if (e.target.id === 'login-local-btn') {
        var input = document.getElementById('login-email');
        var pass = document.getElementById('login-password');
        OBRAS.services.loginSupabase(input && input.value ? input.value : '', pass && pass.value ? pass.value : '').then(function(ok){
          if (ok) {
            OBRAS.app.render();
            OBRAS.ui.toast('Login realizado com sucesso.');
          }
        });
        return;
      }
      if (e.target.id === 'use-demo-btn') { OBRAS.services.useDemoData(); return; }
      if (e.target.id === 'logout-btn') {
        OBRAS.services.logoutSupabase().then(function(){ OBRAS.app.render(); });
        return;
      }
      if (e.target.id === 'reset-phase2-btn') { OBRAS.services.resetBase(); return; }

      if (e.target.id === 'obra-save-btn') { OBRAS.services.submitObra(); return; }
      if (e.target.id === 'obra-clear-btn') { OBRAS.state.form = {}; OBRAS.app.render(); return; }
      if (e.target.id === 'obra-filtro-clear-btn') { OBRAS.services.clearObrasFilters(); return; }

      if (e.target.id === 'fin-submit-btn') { OBRAS.services.submitRecebimento(); return; }
      if (e.target.id === 'geral-submit-btn') { OBRAS.services.submitDespesaGeral(); return; }
      if (e.target.id === 'fin-filtro-clear-btn') { OBRAS.services.clearFinanceFilters(); return; }

      if (e.target.id === 'cadastro-save-btn') { OBRAS.services.submitCadastro(); return; }
      if (e.target.id === 'cadastro-clear-btn') { OBRAS.services.clearCadastroForm(); return; }

      if (e.target.id === 'backup-export-btn') { OBRAS.services.downloadBackup(); return; }
      if (e.target.id === 'backup-import-btn') { OBRAS.services.openImportDialog(); return; }
      if (e.target.id === 'relatorio-export-btn') { OBRAS.services.exportRelatorioTXT(); return; }
      if (e.target.id === 'cloud-force-upload-btn') { OBRAS.services.forceCloudUpload(); return; }
      if (e.target.id === 'cloud-force-download-btn') { OBRAS.services.forceCloudDownload(); return; }

      if (e.target.id === 'det-rec-btn') { OBRAS.services.submitObraRecebimento(); return; }
      if (e.target.id === 'det-pag-btn') { OBRAS.services.submitObraPagamento(); return; }
      if (e.target.id === 'det-desp-btn') { OBRAS.services.submitObraDespesa(); return; }

      var action = e.target.closest('[data-action]');
      if (!action) return;
      var act = action.getAttribute('data-action');
      var id = action.getAttribute('data-id');

      if (act === 'open-obra') OBRAS.services.openObraDetail(id);
      if (act === 'edit-obra') OBRAS.services.editObra(id);
      if (act === 'delete-obra') OBRAS.services.deleteObra(id);
      if (act === 'edit-cadastro') OBRAS.services.editCadastro(action.getAttribute('data-kind'), id);
      if (act === 'delete-cadastro') OBRAS.services.deleteCadastro(action.getAttribute('data-kind'), id);
      if (act === 'edit-obra-lanc') OBRAS.services.beginEditObraLancamento(action.getAttribute('data-kind'), id);
      if (act === 'delete-obra-lanc') OBRAS.services.deleteObraLancamento(action.getAttribute('data-kind'), id);
    });
  }
};
