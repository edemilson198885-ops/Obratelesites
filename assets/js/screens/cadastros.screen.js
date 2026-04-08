window.OBRAS = window.OBRAS || {};
OBRAS.cadastrosScreen = {
  renderList: function(title, items, kind, badgeClass){
    var html = (items || []).map(function(item){
      return '<div class="list-item">'
        + '<div><strong>' + OBRAS.helpers.escape(item.nome) + '</strong>'
        + '<div class="muted">' + OBRAS.helpers.escape((item.cidade || 'Sem cidade') + ' · ' + (item.contato || 'Sem contato')) + '</div></div>'
        + '<div class="actions-inline">'
        +   '<span class="badge ' + badgeClass + '">' + OBRAS.helpers.escape(kind.charAt(0).toUpperCase() + kind.slice(1)) + '</span>'
        +   '<button class="small-btn" data-action="edit-cadastro" data-kind="' + kind + '" data-id="' + item.id + '">Editar</button>'
        +   '<button class="small-btn danger" data-action="delete-cadastro" data-kind="' + kind + '" data-id="' + item.id + '">Excluir</button>'
        + '</div></div>';
    }).join('');
    return '<div class="list-card"><h3 class="card-title">' + title + '</h3>' + (html || '<div class="empty-state">Nenhum registro cadastrado.</div>') + '</div>';
  },

  render: function(){
    var current = OBRAS.state.form && OBRAS.state.form.cadastro ? OBRAS.state.form.cadastro : {};
    OBRAS.ui.setHTML('screen-container',
      '<div class="screen-head">'
      + '  <div><h1 class="screen-title">Cadastros</h1><div class="screen-subtitle">Fase 3 com cadastro real de empresas, parceiros e clientes, sem quebrar o layout aprovado.</div></div>'
      + '</div>'
      + '<div class="split-card">'
      + '  <div class="form-card">'
      + '    <h3 class="card-title">' + (current.id ? 'Editar cadastro' : 'Novo cadastro') + '</h3>'
      + '    <form id="cadastro-form" data-edit-id="' + (current.id || '') + '" onsubmit="return false;">'
      + '      <div class="field-grid">'
      + '        <div class="field"><label>Tipo</label><select id="cad-tipo">'
      + '          <option value="empresa" ' + ((current.tipo || '') === 'empresa' ? 'selected' : '') + '>Empresa</option>'
      + '          <option value="parceiro" ' + ((current.tipo || '') === 'parceiro' ? 'selected' : '') + '>Parceiro</option>'
      + '          <option value="cliente" ' + ((current.tipo || '') === 'cliente' ? 'selected' : '') + '>Cliente</option>'
      + '        </select></div>'
      + '        <div class="field"><label>Nome</label><input id="cad-nome" value="' + OBRAS.helpers.escape(current.nome || '') + '" /></div>'
      + '        <div class="field"><label>Contato</label><input id="cad-contato" value="' + OBRAS.helpers.escape(current.contato || '') + '" /></div>'
      + '        <div class="field"><label>Telefone</label><input id="cad-telefone" value="' + OBRAS.helpers.escape(current.telefone || '') + '" /></div>'
      + '        <div class="field"><label>Cidade</label><input id="cad-cidade" value="' + OBRAS.helpers.escape(current.cidade || '') + '" /></div>'
      + '      </div>'
      + '      <div class="form-actions">'
      + '        <button class="btn btn-primary" id="cadastro-save-btn">' + (current.id ? 'Salvar cadastro' : 'Cadastrar') + '</button>'
      + '        <button class="btn" id="cadastro-clear-btn">Limpar</button>'
      + '      </div>'
      + '    </form>'
      + '  </div>'
      + '  <div class="list-card">'
      + '    <h3 class="card-title">Resumo</h3>'
      + '    <div class="inline-stat"><span class="muted">Empresas</span><strong>' + (OBRAS.state.empresas || []).length + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Parceiros</span><strong>' + (OBRAS.state.parceiros || []).length + '</strong></div>'
      + '    <div class="inline-stat"><span class="muted">Clientes</span><strong>' + (OBRAS.state.clientes || []).length + '</strong></div>'
      + '    <div class="top-alert">Os cadastros agora alimentam a operação e podem ser usados no formulário de obras.</div>'
      + '  </div>'
      + '</div>'
      + '<div class="content-grid section-space">'
      + this.renderList('Empresas', OBRAS.state.empresas, 'empresa', 'badge-info')
      + this.renderList('Parceiros', OBRAS.state.parceiros, 'parceiro', 'badge-warning')
      + '</div>'
      + '<div class="section-space">'
      + this.renderList('Clientes', OBRAS.state.clientes, 'cliente', 'badge-success')
      + '</div>'
    );
  }
};
