
window.OBRAS = window.OBRAS || {};
OBRAS.configuracoesScreen = {
  render: function(){
    var imported = OBRAS.state.meta && OBRAS.state.meta.importedFromLegacy;
    var totalRegistros = (OBRAS.state.obras || []).length + (OBRAS.state.recebimentos || []).length + (OBRAS.state.pagamentosParceiros || []).length + (OBRAS.state.despesas || []).length + (OBRAS.state.despesasGerais || []).length;
    var cloud = OBRAS.state.cloud || {};
    var lastSync = cloud.lastSyncAt ? new Date(cloud.lastSyncAt).toLocaleString('pt-BR') : 'Nunca sincronizado';

    OBRAS.ui.setHTML('screen-container',
      '<div class="screen-head">'
      + '  <div><h1 class="screen-title">Configurações</h1><div class="screen-subtitle">Fase 8.2 automática: sincronização com Supabase ao abrir e ao salvar, no padrão do MyMoney.</div></div>'
      + '</div>'

      + '<div class="content-grid">'
      + '  <div class="list-card">'
      + '    <div class="list-item"><div><strong>Modo de abertura</strong><div class="muted">Index local sem servidor</div></div><div class="badge badge-success">OK</div></div>'
      + '    <div class="list-item"><div><strong>Estrutura em pastas</strong><div class="muted">CSS, JS e telas separadas</div></div><div class="badge badge-success">OK</div></div>'
      + '    <div class="list-item"><div><strong>Banco local ativo</strong><div class="muted">' + totalRegistros + ' registro(s) nesta base</div></div><div class="badge badge-info">Ativo</div></div>'
      + '    <div class="list-item"><div><strong>Migração legada</strong><div class="muted">' + (imported ? 'Dados antigos foram importados nesta base.' : 'Base atual está usando seed local ou nova gravação.') + '</div></div><div class="badge ' + (imported ? 'badge-success' : 'badge-warning') + '">' + (imported ? 'Importado' : 'Local') + '</div></div>'
      + '    <div class="list-item"><div><strong>Última sync</strong><div class="muted">' + OBRAS.helpers.escape(lastSync) + '</div></div><div class="badge ' + (cloud.online ? 'badge-success' : 'badge-warning') + '">' + OBRAS.helpers.escape(cloud.lastSyncStatus || 'Não sincronizado') + '</div></div>'
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

      + '<div class="split-card section-space">'
      + '  <div class="form-card">'
      + '    <h3 class="card-title">Supabase automático</h3>'
      + '    <div class="list-item"><div><strong>Project URL</strong><div class="muted">' + OBRAS.helpers.escape(cloud.projectUrl || OBRAS.config.SUPABASE_URL) + '</div></div><div class="badge badge-info">Ativo</div></div>'
      + '    <div class="list-item"><div><strong>Modo</strong><div class="muted">Automático ao abrir e ao salvar</div></div><div class="badge badge-success">Auto</div></div>'
      + '    <div class="list-item"><div><strong>Tabelas sincronizadas</strong><div class="muted">obras, clientes, parceiros, recebimentos, pagamentos, despesas, despesas gerais, empresas, caixa e repasses.</div></div><div class="badge badge-info">Real</div></div>'
      + '    <div class="form-actions section-space">'
      + '      <button class="btn btn-primary" id="cloud-force-upload-btn">Forçar envio agora</button>'
      + '      <button class="btn" id="cloud-force-download-btn">Forçar download agora</button>'
      + '    </div>'
      + '  </div>'
      + '  <div class="list-card">'
      + '    <h3 class="card-title">Como funciona</h3>'
      + '    <div class="list-item"><div><strong>Ao abrir o sistema</strong><div class="muted">A base mais recente é carregada automaticamente.</div></div><div class="badge badge-success">Boot</div></div>'
      + '    <div class="list-item"><div><strong>Ao salvar qualquer alteração</strong><div class="muted">O app envia sozinho para o Supabase em segundo plano.</div></div><div class="badge badge-info">Auto save</div></div>'
      + '    <div class="list-item"><div><strong>Se estiver offline</strong><div class="muted">Continua salvando local e tenta sincronizar quando houver conexão.</div></div><div class="badge badge-warning">Fallback</div></div>'
      + '    <div class="top-alert">Nesta versão o comportamento já fica automático, igual ao MyMoney, mas mantendo backup local como segurança.</div>'
      + '  </div>'
      + '</div>'

      + '<div class="form-actions section-space">'
      + '  <button class="btn" id="use-demo-btn">Recriar base exemplo</button>'
      + '  <button class="btn btn-danger" id="reset-phase2-btn">Resetar storage local</button>'
      + '</div>'
    );
  }
};
