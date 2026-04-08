window.OBRAS = window.OBRAS || {};
OBRAS.storage = {
  load: function(){
    try {
      var raw = localStorage.getItem(OBRAS.config.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Erro ao carregar storage', e);
      return null;
    }
  },
  save: function(data){
    try {
      localStorage.setItem(OBRAS.config.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Erro ao salvar storage', e);
      return false;
    }
  },
  reset: function(){
    localStorage.removeItem(OBRAS.config.STORAGE_KEY);
  }
};
