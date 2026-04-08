
window.OBRAS = window.OBRAS || {};
OBRAS.storage = {
  load: function(key){
    try {
      var raw = localStorage.getItem(key || OBRAS.config.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Erro ao carregar storage', e);
      return null;
    }
  },
  save: function(data, key){
    try {
      localStorage.setItem(key || OBRAS.config.STORAGE_KEY, JSON.stringify(data));
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
