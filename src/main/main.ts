const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow: any = null;
let githubService: any = null;
let GitHubServiceClass: any;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  const fs = require('fs');
  
  // 创建日志函数
  const logFile = path.join(app.getPath('userData'), 'icon-debug.log');
  const log = (msg: string) => {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    console.log(msg);
    try {
      fs.appendFileSync(logFile, logMsg);
    } catch (e) {
      // 忽略写入错误
    }
  };
  
  log('=== Debug Info ===');
  log('__dirname: ' + __dirname);
  log('app.getAppPath(): ' + app.getAppPath());
  log('app.getPath(userData): ' + app.getPath('userData'));
  log('preload path: ' + preloadPath);
  log('preload exists: ' + fs.existsSync(preloadPath));
  log('Log file: ' + logFile);
  log('==================');
  
  // 设置窗口图标
  let iconPath: string;
  
  if (process.env.NODE_ENV === 'development') {
    // 开发模式：使用 app.getAppPath() 获取应用根目录
    const appPath = app.getAppPath();
    iconPath = process.platform === 'win32'
      ? path.join(appPath, 'build/icon.ico')
      : process.platform === 'darwin'
      ? path.join(appPath, 'build/icon.icns')
      : path.join(appPath, 'build/icon.png');
  } else {
    // 生产模式：尝试多个可能的路径
    const iconName = process.platform === 'win32' ? 'icon.ico'
      : process.platform === 'darwin' ? 'icon.icns'
      : 'icon.png';
    
    const possiblePaths = [
      // 方式1：从 resources 目录
      path.join((process as any).resourcesPath || '', 'build', iconName),
      // 方式2：从 app.asar 同级目录
      path.join(path.dirname(app.getPath('exe')), 'resources', 'build', iconName),
      // 方式3：从 app.getAppPath()
      path.join(app.getAppPath(), 'build', iconName),
      // 方式4：相对于 __dirname
      path.join(__dirname, '../../build', iconName),
    ];
    
    // 尝试找到存在的图标文件
    iconPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
    log('Tried paths: ' + JSON.stringify(possiblePaths, null, 2));
    log('Selected path: ' + iconPath);
  }
  
  log('Platform: ' + process.platform);
  log('Icon path: ' + iconPath);
  log('Icon exists: ' + fs.existsSync(iconPath));
  
  // 使用 nativeImage 加载图标
  const icon = nativeImage.createFromPath(iconPath);
  log('Icon loaded: ' + !icon.isEmpty());
  if (!icon.isEmpty()) {
    log('Icon size: ' + JSON.stringify(icon.getSize()));
  }
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 500,
    autoHideMenuBar: true,  // 隐藏菜单栏
    icon: icon,  // 使用 nativeImage 对象
    title: '日报助手',  // 设置窗口标题
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
  
  // 平台特殊处理
  if (process.platform === 'linux') {
    // Linux/WSL 需要额外设置图标
    mainWindow.setIcon(icon);
    // 尝试设置应用级图标
    if (!icon.isEmpty()) {
      try {
        app.setIcon(icon);
      } catch (e) {
        console.log('Failed to set app icon:', e);
      }
    }
  } else if (process.platform === 'win32') {
    // Windows 需要额外设置应用图标
    mainWindow.setIcon(icon);
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
