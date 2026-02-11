const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: any) => ipcRenderer.invoke('save-config', config),
  testConnection: () => ipcRenderer.invoke('test-connection'),
  getTodayReport: () => ipcRenderer.invoke('get-today-report'),
  submitReport: (content: string) => ipcRenderer.invoke('submit-report', content),
});
