const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  savePdf: (pageSlices) => ipcRenderer.invoke('save-pdf', { pageSlices })
});
