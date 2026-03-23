/**
 * 性能监控脚本 - 检测CPU/内存异常
 *
 * 功能：
 * 1. 实时监控CPU使用率
 * 2. CPU持续过高时自动终止进程
 * 3. 防止死循环导致系统崩溃
 *
 * 使用方法：
 * 在一个终端运行：node .scripts/monitor.js
 * 在另一个终端运行你的开发命令
 */

const os = require('os');
const { exec } = require('child_process');

const MAX_CPU = 80; // CPU使用率阈值80%
const CHECK_INTERVAL = 5000; // 每5秒检查一次
let highCpuCount = 0;

console.log('🔍 监控已启动，将检测CPU异常');
console.log(`   阈值：${MAX_CPU}%`);
console.log(`   检查间隔：${CHECK_INTERVAL/1000}秒`);
console.log(`   高CPU触发终止次数：3次`);
console.log('');

const checkInterval = setInterval(() => {
  const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;

  if (cpuUsage > MAX_CPU) {
    highCpuCount++;
    console.warn(`⚠️  CPU使用率过高: ${cpuUsage.toFixed(1)}% (第${highCpuCount}次)`);

    if (highCpuCount >= 3) {
      console.error('🚨 CPU持续过高，可能存在死循环！');
      console.error('正在终止所有Node.js进程...');

      // 检测操作系统
      const isWindows = process.platform === 'win32';

      if (isWindows) {
        // Windows下终止进程
        exec('taskkill /F /IM node.exe', (error) => {
          if (error) {
            console.error('终止进程失败:', error);
          } else {
            console.log('✅ 已终止所有Node.js进程');
          }
          clearInterval(checkInterval);
          process.exit(1);
        });
      } else {
        // Linux/Mac下终止进程
        exec('pkill -9 node', (error) => {
          if (error) {
            console.error('终止进程失败:', error);
          } else {
            console.log('✅ 已终止所有Node.js进程');
          }
          clearInterval(checkInterval);
          process.exit(1);
        });
      }
    }
  } else {
    // 重置计数
    if (highCpuCount > 0) {
      console.log(`✅ CPU已恢复正常: ${cpuUsage.toFixed(1)}%`);
      highCpuCount = 0;
    }
  }
}, CHECK_INTERVAL);

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n👋 监控已停止');
  clearInterval(checkInterval);
  process.exit(0);
});
