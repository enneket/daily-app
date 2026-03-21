const { contextBridge, ipcRenderer } = require('electron');

interface ElectronAPI {
  getConfig: () => Promise<unknown>;
  saveConfig: (config: unknown) => Promise<unknown>;
  testConnection: () => Promise<unknown>;
  getTodayReport: () => Promise<unknown>;
  submitReport: (content: string) => Promise<unknown>;
  getCommitStatus: () => Promise<unknown>;
  manualPush: () => Promise<unknown>;
}

const api: ElectronAPI = {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  testConnection: () => ipcRenderer.invoke('test-connection'),
  getTodayReport: () => ipcRenderer.invoke('get-today-report'),
  submitReport: (content: string) => ipcRenderer.invoke('submit-report', content),
  getCommitStatus: () => ipcRenderer.invoke('get-commit-status'),
  manualPush: () => ipcRenderer.invoke('manual-push'),
};

contextBridge.exposeInMainWorld('electronAPI', api);
