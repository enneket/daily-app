import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import { GitHubService } from './github-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();
let mainWindow: BrowserWindow | null = null;
let githubService: GitHubService | null = null;

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

  // 调试：打印 preload 路径
  console.log('Preload path:', path.join(__dirname, 'preload.js'));
  console.log('__dirname:', __dirname);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    // 生产环境也打开开发者工具用于调试
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
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

ipcMain.handle('save-config', async (_, config) => {
  store.set('github-config', config);
  githubService = new GitHubService(config);
  return { success: true };
});

ipcMain.handle('test-connection', async () => {
  if (!githubService) {
    const config = store.get('github-config') as any;
    if (!config) {
      return { success: false, error: '请先配置 GitHub 信息' };
    }
    githubService = new GitHubService(config);
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
    githubService = new GitHubService(config);
  }
  
  try {
    const content = await githubService.getTodayReport();
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('submit-report', async (_, content: string) => {
  if (!githubService) {
    const config = store.get('github-config') as any;
    if (!config) {
      return { success: false, error: '请先配置 GitHub 信息' };
    }
    githubService = new GitHubService(config);
  }
  
  try {
    await githubService.submitReport(content);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
