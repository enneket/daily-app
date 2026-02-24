#!/usr/bin/env node

const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  const iconPath = path.join(__dirname, '../build/icon.ico');
  console.log('Testing icon loading...');
  console.log('Icon path:', iconPath);
  console.log('Icon exists:', require('fs').existsSync(iconPath));
  
  const icon = nativeImage.createFromPath(iconPath);
  console.log('Icon isEmpty:', icon.isEmpty());
  console.log('Icon size:', icon.getSize());
  console.log('Icon aspect ratio:', icon.getAspectRatio());
  
  const win = new BrowserWindow({
    width: 400,
    height: 300,
    icon: icon,
    title: '图标测试'
  });
  
  win.setIcon(icon);
  win.loadURL('data:text/html,<h1>图标测试窗口</h1>');
  
  setTimeout(() => {
    console.log('Window icon test completed');
  }, 2000);
});

app.on('window-all-closed', () => {
  app.quit();
});
