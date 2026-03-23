# 安全自动化脚本使用指南

本模板提供了一套防止Node.js项目死循环的安全方案。

## 📦 脚本说明

### 1. `safe-run.js` - 安全执行脚本

**功能：**
- ✅ 进程锁：防止同一脚本多开
- ✅ 超时熔断：2分钟后自动终止
- ✅ 自动清理：异常退出时删除PID文件

**使用方法：**
```bash
# 单个命令
node .scripts/safe-run.js "npm run db:sync"

# 多个命令顺序执行
node .scripts/safe-run.js "npm run db:sync && next dev"
```

**在package.json中配置：**
```json
{
  "scripts": {
    "dev": "node .scripts/safe-run.js \"npm run db:sync && next dev\"",
    "db:sync": "node .scripts/safe-run.js \"npx prisma generate && npx prisma db push\""
  }
}
```

---

### 2. `verify-project.js` - 项目验证脚本

**功能：**
- ✅ 检查当前目录是否有package.json
- ✅ 检测父级目录是否也有package.json
- ✅ 防止在子目录运行命令

**使用方法：**
```bash
node .scripts/verify-project.js
```

**在package.json中配置：**
```json
{
  "scripts": {
    "predev": "node .scripts/verify-project.js",
    "dev": "npm run db:sync && next dev"
  }
}
```

---

### 3. `monitor.js` - 性能监控脚本

**功能：**
- ✅ 实时监控CPU使用率
- ✅ CPU持续过高时自动终止进程
- ✅ 防止死循环导致系统崩溃

**使用方法：**
```bash
# 终端1：启动监控
node .scripts/monitor.js

# 终端2：运行开发命令
npm run dev
```

**监控参数（可在脚本中修改）：**
- `MAX_CPU`：CPU阈值（默认80%）
- `CHECK_INTERVAL`：检查间隔（默认5秒）
- `highCpuCount`：高CPU触发终止次数（默认3次）

---

## 🛡️ 安全防护层级

| 层级 | 脚本 | 防护内容 | 重要程度 |
|------|------|----------|----------|
| 第1层 | safe-run.js | 进程锁、超时保护 | 🔴 致命 |
| 第2层 | verify-project.js | 目录检查 | 🟡 重要 |
| 第3层 | monitor.js | 实时监控 | 🟠 中等 |

---

## ⚠️ 注意事项

1. **绝对不要在子任务中调用父任务**
   - ❌ 错误：`db:sync` 中包含 `npm run dev`
   - ✅ 正确：`dev` 中包含 `npm run db:sync`

2. **始终使用 `&&` 顺序执行**
   - ✅ 正确：`npm run db:sync && next dev`
   - ❌ 错误：使用 `predev`、`postdev` 生命周期钩子

3. **开发时开启监控**
   - 在一个终端运行 `monitor.js`
   - 在另一个终端运行 `npm run dev`

---

## 🔧 故障排查

### 问题：提示"检测到可能正在运行的进程"

**原因：** PID文件未清理完成

**解决：**
```bash
# 删除PID文件
del .scripts\.running.pid  # Windows
rm .scripts/.running.pid    # Linux/Mac
```

---

### 问题：CPU过高被强制终止

**原因：** 可能有死循环或性能问题

**解决：**
1. 检查是否有递归调用
2. 使用 `console.log` 追踪执行流程
3. 使用 `setTimeout` 添加延迟，避免同步阻塞

---

## 📚 最佳实践

1. **启动项目前检查**
   ```bash
   # 确认在正确目录
   pwd  # Linux/Mac
   cd   # Windows

   # 确认没有残留进程
   tasklist | findstr node    # Windows
   ps aux | grep node         # Linux/Mac
   ```

2. **开发时双终端模式**
   - 终端1：`node .scripts/monitor.js`
   - 终端2：`npm run dev`

3. **使用进程管理工具（生产环境）**
   ```bash
   npm install -g pm2
   pm2 start npm --name "my-app" -- run dev
   ```

---

## 🎯 快速自查清单

启动项目前，问自己三个问题：

- [ ] 我的子任务会间接调用父任务吗？
- [ ] 我在正确的项目目录吗？
- [ ] 我启动监控了吗？

只要这三点确认，基本可以避免99%的死循环问题。

---

## 📞 问题反馈

如果遇到问题，请检查：

1. Node.js版本是否 >= 14.x
2. package.json中的脚本配置是否正确
3. 是否在正确的项目目录运行

---

**祝开发愉快！🚀**
