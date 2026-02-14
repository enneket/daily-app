const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow: any = null;
let githubService: any = null;
let GitHubServiceClass: any;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('=== Debug Info ===');
  console.log('__dirname:', __dirname);
  console.log('preload path:', preloadPath);
  console.log('preload exists:', require('fs').existsSync(preloadPath));
  console.log('==================');
  
  // 设置窗口图标
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '../../build/icon.ico')
    : path.join(__dirname, '../../build/icon.png');
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 500,
    autoHideMenuBar: true,  // 隐藏菜单栏
    icon: iconPath,  // 设置窗口图标
    webPreferences: {
      preload: preloadPath,
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
  
  // 监听 preload 脚本错误
  mainWindow.webContents.on('console-message', (_event: any, _level: any, message: any) => {
    console.log('Renderer console:', message);
  });
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
  
  // 保存配置后自动初始化/更新仓库
  try {
    const result = await githubService.testConnectionAndInitialize();
    return { 
      success: true, 
      initialized: result.initialized,
      skipped: result.skipped,
      updated: result.updated,
      updatedFiles: result.updatedFiles
    };
  } catch (error: any) {
    console.error('初始化/更新仓库失败:', error);
    // 如果是初始化/更新失败，返回错误
    return { 
      success: false, 
      error: error.message || '操作失败，请检查网络连接和权限'
    };
  }
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
