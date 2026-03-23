# 🛡️ Safe Node.js Template

防止Node.js项目死循环的安全模板，提供超时保护、进程锁、性能监控等功能。

## ✨ 特性

- ✅ **进程锁** - 防止同一脚本多开
- ✅ **超时保护** - 2分钟后自动终止
- ✅ **目录验证** - 防止在错误目录运行
- ✅ **性能监控** - 实时监控CPU使用率
- ✅ **自动清理** - 异常退出时清理PID文件

## 🚀 快速开始

### 1. 安装

```bash
# Clone 本仓库
git clone https://github.com/your-username/safe-node-template.git my-project

# 进入项目目录
cd my-project

# 复制脚本到你的项目
cp -r .scripts /path/to/your/project/
```

### 2. 配置 package.json

在你的项目 `package.json` 中添加以下配置：

```json
{
  "scripts": {
    "predev": "node .scripts/verify-project.js",
    "dev": "node .scripts/safe-run.js \"npm run db:sync && next dev\"",
    "db:sync": "node .scripts/safe-run.js \"npx prisma generate && npx prisma db push\""
  }
}
```

### 3. 使用监控（推荐）

开发时在双终端模式下运行：

```bash
# 终端1：启动监控
node .scripts/monitor.js

# 终端2：运行开发命令
npm run dev
```

## 📖 文档

详细使用说明请查看：[`.scripts/AUTOMATION.md`](./.scripts/AUTOMATION.md)

## 🛠️ 脚本说明

| 脚本 | 功能 | 使用场景 |
|------|------|----------|
| `safe-run.js` | 安全执行包装器 | 包装任何命令，提供超时和进程锁 |
| `verify-project.js` | 项目目录验证 | 防止在错误目录运行命令 |
| `monitor.js` | 性能监控 | 开发时实时监控CPU使用率 |

## ⚠️ 重要规则

1. **绝不在子任务中调用父任务**
   - ❌ `db:sync` 中包含 `npm run dev`
   - ✅ `dev` 中包含 `npm run db:sync`

2. **始终使用 `&&` 顺序执行**
   - ✅ `npm run db:sync && next dev`
   - ❌ 使用 `predev`、`postdev` 生命周期钩子

3. **开发时开启监控**
   - 终端1：`node .scripts/monitor.js`
   - 终端2：`npm run dev`

## 🔧 故障排查

### 问题：提示"检测到可能正在运行的进程"

```bash
# 删除PID文件
del .scripts\.running.pid  # Windows
rm .scripts/.running.pid    # Linux/Mac
```

### 问题：CPU过高被强制终止

1. 检查是否有递归调用
2. 使用 `console.log` 追踪执行流程
3. 添加 `setTimeout` 避免同步阻塞

## 📋 快速自查清单

启动项目前，问自己三个问题：

- [ ] 我的子任务会间接调用父任务吗？
- [ ] 我在正确的项目目录吗？
- [ ] 我启动监控了吗？

只要这三点确认，基本可以避免99%的死循环问题。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

本模板旨在解决Node.js项目中常见的死循环问题，保护开发者的电脑不被"烧坏" 😄

---

**Happy Coding! 🚀**
