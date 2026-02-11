const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow: any = null;
let githubService: any = null;
let GitHubServiceClass: any;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 500,
    autoHideMenuBar: true,  // 隐藏菜单栏
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // 开发模式禁用沙箱（Linux 兼容性）
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  // 动态加载 GitHubService 避免编译时冲突
  const githubServiceModule = require('./github-service');
  GitHubServiceClass = githubServiceModule.GitHubService;
  
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-config', async () => {
  return store.get('github-config');
});

ipcMain.handle('save-config', async (_: any, config: any) => {
  store.set('github-config', config);
  githubService = new GitHubServiceClass(config);
  return { success: true };
});

ipcMain.handle('test-connection', async () => {
  if (!githubService) {
    const config = store.get('github-config') as any;
    if (!config) {
      return { success: false, error: '请先配置 GitHub 信息' };
    }
    githubService = new GitHubServiceClass(config);
  }
  
  try {
    await githubService.testConnection();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-today-report', async () => {
  if (!githubService) {
    const config = store.get('github-config') as any;
    if (!config) {
      return { success: false, error: '请先配置 GitHub 信息' };
    }
    githubService = new GitHubServiceClass(config);
  }
  
  try {
    const content = await githubService.getTodayReport();
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('submit-report', async (_: any, content: string) => {
  if (!githubService) {
    const config = store.get('github-config') as any;
    if (!config) {
      return { success: false, error: '请先配置 GitHub 信息' };
    }
    githubService = new GitHubServiceClass(config);
  }
  
  try {
    await githubService.submitReport(content);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
