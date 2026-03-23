/**
 * 项目目录验证脚本 - 防止在错误目录运行
 *
 * 功能：
 * 1. 检查当前目录是否有package.json
 * 2. 检测父级目录是否也有package.json（防止在子目录运行）
 * 3. 提供友好的警告信息
 *
 * 使用方法：
 * 在package.json中配置:
 * "predev": "node .scripts/verify-project.js"
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const expectedPackageJson = path.join(projectRoot, 'package.json');
const parentPackageJson = path.join(projectRoot, '..', 'package.json');

// 检查是否在正确目录
if (!fs.existsSync(expectedPackageJson)) {
  console.error('❌ 错误：当前目录没有package.json');
  console.error('当前目录:', projectRoot);
  console.error('');
  console.error('请确保你在正确的项目根目录运行命令');
  process.exit(1);
}

// 检查是否有父级package.json（防止在子目录运行）
if (fs.existsSync(parentPackageJson)) {
  const parentStat = fs.statSync(parentPackageJson);
  const currentStat = fs.statSync(expectedPackageJson);

  // 如果父级也是项目目录，警告用户
  if (parentStat.isFile() && currentStat.isFile()) {
    console.warn('⚠️  警告：检测到父级目录也有package.json');
    console.warn('请确认你在正确的项目根目录运行命令');
    console.warn('');
    console.warn('当前目录:', projectRoot);
    console.warn('父级目录:', path.dirname(parentPackageJson));
    console.warn('');

    // 等待3秒后继续
    console.log('3秒后将继续执行...');
    const wait = () => {
      return new Promise(resolve => setTimeout(resolve, 3000));
    };
    wait().then(() => {
      console.log('✅ 项目目录验证通过');
      process.exit(0);
    });
  } else {
    console.log('✅ 项目目录验证通过');
    process.exit(0);
  }
} else {
  console.log('✅ 项目目录验证通过');
  process.exit(0);
}
