window.OBRAS = window.OBRAS || {};
OBRAS.configuracoesScreen = {
  render: function(){
    var cloud = OBRAS.state.cloud || {};
    var projectUrl = cloud.projectUrl || OBRAS.config.SUPABASE_URL || '';

    OBRAS.ui.setHTML('screen-container',
      '<div class="screen-head compact-head">'
      + '  <div><h1 class="screen-title">Configurações</h1></div>'
      + '</div>'
      + '<div class="ops-grid">'
      + '  <div class="form-card ops-card">'
      + '    <h3 class="card-title">Backup</h3>'
      + '    <div class="form-actions ops-actions">'
      + '      <button class="btn btn-primary" id="backup-export-btn">Exportar backup</button>'
      + '      <button class="btn" id="backup-import-btn">Importar backup</button>'
      + '      <input type="file" id="backup-import-input" accept="application/json" style="display:none" />'
      + '    </div>'
      + '  </div>'
      + '  <div class="form-card ops-card">'
      + '    <h3 class="card-title">Sincronização</h3>'
      + '    <div class="ops-status">'
      + '      <div class="inline-stat"><span class="muted">Status</span><strong>' + OBRAS.helpers.escape(cloud.lastSyncStatus || 'Não sincronizado') + '</strong></div>'
      + '      <div class="inline-stat"><span class="muted">Projeto</span><strong class="ops-ellipsis">' + OBRAS.helpers.escape(projectUrl || 'Não configurado') + '</strong></div>'
      + '    </div>'
      + '    <div class="form-actions ops-actions">'
      + '      <button class="btn btn-primary" id="cloud-force-download-btn">Baixar nuvem</button>'
      + '      <button class="btn" id="cloud-force-upload-btn">Enviar nuvem</button>'
      + '    </div>'
      + '  </div>'
      + '</div>'
    );
  }
};
