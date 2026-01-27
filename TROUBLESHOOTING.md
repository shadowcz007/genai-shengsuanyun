# 故障排除指南

## 常见错误及解决方案

### 1. `Failed to resolve module specifier "@google/genai"`

**错误信息:**
```
Uncaught TypeError: Failed to resolve module specifier "@google/genai". 
Relative references must start with either "/", "./", or "../".
```

**原因:**
浏览器无法直接解析 npm 包的模块路径（如 `@google/genai`）。

**解决方案:**
1. 确保 HTML 文件中包含 `importmap`（已在 example.html 中添加）
2. 确保使用本地服务器运行，不能直接双击打开文件
3. 确保 `node_modules/@google/genai/dist/web/index.mjs` 文件存在

**验证步骤:**
```bash
# 检查文件是否存在
ls -la node_modules/@google/genai/dist/web/index.mjs

# 使用本地服务器
python3 -m http.server 8000
# 或
npx http-server -p 8000
```

### 2. `saveApiKey is not defined` 或 `getSupportedModels is not defined`

**错误信息:**
```
Uncaught ReferenceError: saveApiKey is not defined
    at HTMLButtonElement.onclick
```

**原因:**
函数在模块作用域中定义，但 `onclick` 属性在全局作用域中执行。

**解决方案:**
已在代码中将所有函数挂载到 `window` 对象：
- `window.saveApiKey`
- `window.getSupportedModels`
- `window.getQuota`
- `window.generateContent`
- `window.checkBaseUrl`

**如果仍然出现错误:**
1. 检查浏览器控制台，确认模块是否成功加载
2. 确保 `importmap` 在 `<script type="module">` 之前
3. 检查是否有其他 JavaScript 错误阻止模块执行

### 3. CORS 错误

**错误信息:**
```
Access to script at 'file:///...' from origin 'null' has been blocked by CORS policy
```

**原因:**
直接打开 HTML 文件（file:// 协议）会触发 CORS 限制。

**解决方案:**
必须使用本地服务器：
```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

然后访问: http://localhost:8000/example.html

### 4. 模块加载失败

**错误信息:**
```
Failed to load module script: The server responded with a non-JavaScript MIME type
```

**原因:**
服务器没有正确设置 MIME 类型。

**解决方案:**
使用支持 ES modules 的服务器：
- `http-server` (推荐)
- `python3 -m http.server` (Python 3.7+)
- VS Code Live Server

### 5. API Key 相关错误

**错误信息:**
```
API key must be set when using the Gemini API
```

**解决方案:**
1. 确保在输入框中输入了有效的 API Key
2. 点击"保存 API Key"按钮
3. 检查浏览器控制台是否有其他错误

### 6. 配额查询失败

**错误信息:**
```
Error: API Key is required to query quota
```

**可能原因:**
1. API Key 未正确设置
2. API 端点 `/v1/key` 不可用
3. 网络连接问题

**解决方案:**
1. 确认 API Key 已保存
2. 检查网络连接
3. 查看浏览器控制台的详细错误信息

## 调试技巧

### 1. 检查模块是否加载

在浏览器控制台中运行：
```javascript
console.log(window.saveApiKey); // 应该显示函数
console.log(window.getSupportedModels); // 应该显示函数
```

### 2. 检查 importmap

在浏览器开发者工具的 Network 标签中，查看是否有失败的请求。

### 3. 检查构建文件

确保已运行构建：
```bash
npm run build
```

检查 dist 目录：
```bash
ls -la dist/web/
```

### 4. 使用浏览器开发者工具

1. 打开开发者工具 (F12)
2. 查看 Console 标签的错误信息
3. 查看 Network 标签的请求状态
4. 查看 Sources 标签确认文件加载

## 推荐的测试流程

1. **确保依赖已安装:**
   ```bash
   npm install
   ```

2. **构建项目:**
   ```bash
   npm run build
   ```

3. **启动本地服务器:**
   ```bash
   python3 -m http.server 8000
   ```

4. **打开浏览器:**
   - 访问 http://localhost:8000/example.html
   - 打开开发者工具 (F12)
   - 查看控制台是否有错误

5. **测试功能:**
   - 输入 API Key
   - 点击各个测试按钮
   - 查看输出结果

## 如果问题仍然存在

1. 检查浏览器版本（需要支持 ES modules 和 importmap）
2. 清除浏览器缓存
3. 检查防火墙/代理设置
4. 查看完整的错误堆栈信息
