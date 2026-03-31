import { app, BrowserWindow, ipcMain, nativeImage } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import { LocalConfig, AppStore } from './types';
import { GitHubService } from './github-service';
import { getGitHubService, resetGitHubService } from './service-locator';
import { saveToken } from './crypto';

const store: AppStore = new Store();
let mainWindow: BrowserWindow | null = null;
let githubService: GitHubService | null = null;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  const fs = require('fs');

  // 创建日志函数（仅写入文件，不输出到控制台）
  const logFile = path.join(app.getPath('userData'), 'icon-debug.log');
  const log = (msg: string) => {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    try {
      fs.appendFileSync(logFile, logMsg);
    } catch (e) {
      // 忽略写入错误
    }
  };

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
      path.join(process.resourcesPath || '', 'build', iconName),
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
      sandbox: true, // 启用沙箱提升安全性
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
  } else if (process.platform === 'win32') {
    // Windows 需要额外设置应用图标
    mainWindow.setIcon(icon);
  }


}

// 单实例锁定
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 如果获取锁失败，说明已有实例在运行，退出当前实例
  app.quit();
} else {
  // 当第二个实例尝试启动时触发
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app as any).on('second-instance', (_event: Electron.IpcMainEvent, commandLine: string[], workingDirectory: string) => {
    // 如果主窗口存在，聚焦它
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-config', async () => {
  return store.get('github-config');
});

ipcMain.handle('save-config', async (_event: IpcMainInvokeEvent, config: LocalConfig) => {
  if (config.githubToken) {
    saveToken(config.githubToken, store);
    const configWithoutToken = { ...config, githubToken: undefined };
    store.set('github-config', configWithoutToken);
  } else {
    store.set('github-config', config);
  }

  resetGitHubService();
  githubService = getGitHubService(store, config);

  try {
    const result = await githubService.testConnectionAndInitialize();
    return {
      success: true,
      initialized: result.initialized,
      skipped: result.skipped,
      updated: result.updated,
      updatedFiles: result.updatedFiles
    };
  } catch (error: unknown) {
    let errorMessage = '操作失败，请检查网络连接和权限';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('初始化/更新仓库失败:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
});

ipcMain.handle('test-connection', async () => {
  if (!githubService) {
    const config = store.get('github-config') as LocalConfig | undefined;
    if (!config) {
      return { success: false, error: '请先配置 GitHub 信息' };
    }
    githubService = getGitHubService(store, config);
  }

  try {
    await githubService.testConnection();
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '连接失败';
    return { success: false, error: errorMessage };
  }
});

// 获取提交状态
ipcMain.handle('get-commit-status', async () => {
  if (!githubService) {
    return { pendingCommits: 0, lastPushTime: 0, lastCommitTime: 0, nextPushTime: 0 };
  }
  return githubService.getCommitStatus();
});

// 手动提交到 GitHub
ipcMain.handle('manual-push', async () => {
  if (!githubService) {
    return { success: false, message: '请先配置 GitHub 信息', pushed: 0 };
  }
  return await githubService.manualPush();
});

// 定时检查是否需要自动提交
setInterval(async () => {
  if (githubService) {
    const status = githubService.getCommitStatus();
    const now = Date.now();

    // 检查是否需要自动提交（有未提交内容且超过 4 小时）
    if (status.pendingCommits > 0 && (now - status.lastPushTime) >= 4 * 60 * 60 * 1000) {
      await githubService.manualPush();
    }
  }
}, 60 * 60 * 1000); // 每小时检查一次

ipcMain.handle('get-today-report', async () => {
  if (!githubService) {
    const config = store.get('github-config') as LocalConfig | undefined;
    if (!config) {
      return { success: false, error: '请先配置 GitHub 信息' };
    }
    githubService = getGitHubService(store, config);
  }

  try {
    const content = await githubService.getTodayReport();
    return { success: true, content };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取日报失败';
    return { success: false, error: errorMessage };
  }
});

ipcMain.handle('submit-report', async (_event: IpcMainInvokeEvent, content: string) => {
  if (!githubService) {
    const config = store.get('github-config') as LocalConfig | undefined;
    if (!config) {
      return { success: false, error: '请先配置 GitHub 信息' };
    }
    githubService = getGitHubService(store, config);
  }

  try {
    await githubService.submitReport(content);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '提交失败';
    console.error('submitReport 失败:', errorMessage);
    return { success: false, error: errorMessage };
  }
});
