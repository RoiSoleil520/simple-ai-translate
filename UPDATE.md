# 🔄 如何更新插件

## 问题已修复！✅

你遇到的 **'AUTO' IS AN INVALID SOURCE LANGUAGE** 错误已经在 v1.0.1 版本中修复。

---

## 快速更新步骤（30秒）

### 方法 1：重新加载插件（推荐）

1. 打开浏览器扩展管理页面：
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. 找到「**Simple AI Translate**」插件

3. 点击刷新按钮 🔄（或点击「重新加载」）

4. 完成！✨

### 方法 2：完全重新安装

1. 在扩展管理页面卸载旧插件
2. 重新加载 `simple-ai-translate` 文件夹
3. 完成！

---

## 🆕 v1.0.1 更新内容

### 核心修复
✅ **修复了 'auto' 语言检测错误**
- 添加了智能语言识别功能
- 自动识别中文、日文、韩文、俄文等语言
- MyMemory API 现在能正确处理自动检测

### 改进功能
✅ **优化了翻译 API 优先级**
- Google Translate（首选，最准确）
- LibreTranslate（备选）
- MyMemory（最后）

✅ **更好的错误处理**
- 更清晰的中文错误提示
- API 失败时自动切换到下一个服务

---

## ✨ 现在你可以：

1. ✅ 在任何网页选中文字进行翻译（支持所有语言）
2. ✅ 在弹出窗口使用"自动检测"功能
3. ✅ 无需担心语言识别问题

---

## 🧪 测试更新

更新后，打开测试页面验证：

```bash
打开文件：simple-ai-translate/test.html
```

在测试页面选中不同语言的文字，确认翻译功能正常工作。

---

## 💡 如何确认版本号

1. 打开 `chrome://extensions/`
2. 找到「Simple AI Translate」
3. 查看版本号，应该显示 **v1.0.1** 或更高

---

## 📚 更多信息

- **完整更新日志**: [CHANGELOG.md](CHANGELOG.md)
- **故障排除**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **使用指南**: [README.md](README.md)

---

**更新后就可以正常使用了！** 🎉

