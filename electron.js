// 简单的启动脚本，用于开发模式
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import electron from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mainPath = path.join(__dirname, 'dist/main/main.js');

const electronProcess = spawn(electron, [mainPath], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

electronProcess.on('close', (code) => {
  process.exit(code);
});
