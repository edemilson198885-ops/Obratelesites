window.OBRAS = window.OBRAS || {};
OBRAS.configuracoesScreen = {
  render: function(){
    var imported = OBRAS.state.meta && OBRAS.state.meta.importedFromLegacy;
    var totalRegistros = (OBRAS.state.obras || []).length + (OBRAS.state.recebimentos || []).length + (OBRAS.state.pagamentosParceiros || []).length + (OBRAS.state.despesas || []).length + (OBRAS.state.despesasGerais || []).length;
    OBRAS.ui.setHTML('screen-container',
      '<div class="screen-head">'
      + '  <div><h1 class="screen-title">Configurações</h1><div class="screen-subtitle">Fase 3 com backup local, importação JSON e controle da base ativa.</div></div>'
      + '</div>'
      + '<div class="content-grid">'
      + '  <div class="list-card">'
      + '    <div class="list-item"><div><strong>Modo de abertura</strong><div class="muted">Index local sem servidor</div></div><div class="badge badge-success">OK</div></div>'
      + '    <div class="list-item"><div><strong>Estrutura em pastas</strong><div class="muted">CSS, JS e telas separadas</div></div><div class="badge badge-success">OK</div></div>'
      + '    <div class="list-item"><div><strong>Banco local ativo</strong><div class="muted">' + totalRegistros + ' registro(s) nesta base</div></div><div class="badge badge-info">Ativo</div></div>'
      + '    <div class="list-item"><div><strong>Migração legada</strong><div class="muted">' + (imported ? 'Dados antigos foram importados nesta base.' : 'Base atual está usando seed local ou nova gravação.') + '</div></div><div class="badge ' + (imported ? 'badge-success' : 'badge-warning') + '">' + (imported ? 'Importado' : 'Local') + '</div></div>'
      + '  </div>'
      + '  <div class="form-card">'
      + '    <h3 class="card-title">Backup da operação</h3>'
      + '    <div class="muted">Exporte um JSON para guardar a base atual ou importe um backup salvo anteriormente.</div>'
      + '    <div class="form-actions section-space">'
      + '      <button class="btn btn-primary" id="backup-export-btn">Exportar backup JSON</button>'
      + '      <button class="btn" id="backup-import-btn">Importar backup JSON</button>'
      + '      <input type="file" id="backup-import-input" accept="application/json" style="display:none" />'
      + '    </div>'
      + '    <div class="top-alert">Use exportação antes de resets maiores ou migrações.</div>'
      + '  </div>'
      + '</div>'
      + '<div class="form-actions section-space">'
      + '  <button class="btn" id="use-demo-btn">Recriar base exemplo</button>'
      + '  <button class="btn btn-danger" id="reset-phase2-btn">Resetar storage local</button>'
      + '</div>'
    );
  }
};
