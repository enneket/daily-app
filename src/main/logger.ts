import log from 'electron-log';
import { app } from 'electron';
import * as path from 'path';

// 配置日志文件路径
log.transports.file.resolvePathFn = () =>
  path.join(app.getPath('userData'), 'logs', 'main.log');

log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// 格式化
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

export default log;
