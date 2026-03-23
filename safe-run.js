/**
 * 安全执行脚本 - 防止死循环和进程冲突
 *
 * 功能：
 * 1. 进程锁 - 防止同一脚本多开
 * 2. 超时熔断 - 超时自动终止
 * 3. 清理机制 - 异常退出时自动清理PID文件
 *
 * 使用方法：
 * node .scripts/safe-run.js "npm run db:sync && next dev"
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_EXEC_TIME = 120000; // 2分钟超时
const PID_FILE = path.join(__dirname, '.running.pid');

// 如果已有进程在运行，直接退出
if (fs.existsSync(PID_FILE)) {
  console.error('⚠️  检测到可能正在运行的进程，为安全起见已终止');
  console.error('如果确定没有进程运行，请删除文件后重试:', PID_FILE);
  process.exit(1);
}

// 写入PID文件
fs.writeFileSync(PID_FILE, process.pid.toString());

// 清理PID文件的函数
const cleanup = () => {
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
};

// 注册清理钩子
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// 超时保护
const timeout = setTimeout(() => {
  console.error(`⏰ 命令执行超过${MAX_EXEC_TIME/1000}秒，强制终止！`);
  cleanup();
  process.exit(1);
}, MAX_EXEC_TIME);

// 执行原始命令
const [,, ...args] = process.argv;

if (args.length === 0) {
  console.error('❌ 错误：请指定要执行的命令');
  console.error('用法: node safe-run.js "your command here"');
  cleanup();
  process.exit(1);
}

const cmd = args.join(' ');
console.log(`🚀 开始执行: ${cmd}`);

const child = spawn(cmd, [], {
  shell: true,
  stdio: 'inherit'
});

child.on('close', (code) => {
  clearTimeout(timeout);
  cleanup();
  if (code === 0) {
    console.log('✅ 命令执行成功');
  } else {
    console.log(`⚠️  命令执行结束，退出码: ${code}`);
  }
  process.exit(code);
});

child.on('error', (err) => {
  clearTimeout(timeout);
  cleanup();
  console.error('❌ 执行命令时出错:', err.message);
  process.exit(1);
});
