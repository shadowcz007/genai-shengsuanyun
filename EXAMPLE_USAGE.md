# 示例文件使用说明

## 文件说明

- `example.html` - 完整功能测试页面，包含所有功能的测试界面
- `example-simple.html` - 简化版测试页面，快速测试核心功能

## 使用方法

### 方法 1: 使用本地服务器（推荐）

由于浏览器的 CORS 限制，直接打开 HTML 文件可能无法正常工作。建议使用本地服务器：

```bash
# 使用 Python 3
python3 -m http.server 8000

# 或使用 Node.js (需要先安装 http-server)
npx http-server -p 8000

# 或使用 PHP
php -S localhost:8000
```

然后在浏览器中访问：
- http://localhost:8000/example.html
- http://localhost:8000/example-simple.html

### 方法 2: 使用 VS Code Live Server

1. 在 VS Code 中安装 "Live Server" 扩展
2. 右键点击 `example.html` 或 `example-simple.html`
3. 选择 "Open with Live Server"

### 方法 3: 使用浏览器开发者工具

如果直接打开文件，可能需要：
1. 打开浏览器开发者工具 (F12)
2. 在控制台中可能会看到 CORS 错误
3. 需要启动本地服务器才能正常工作

## 测试步骤

1. **输入 API Key**
   - 在页面上输入您的 API Key
   - 点击"保存 API Key"按钮

2. **测试 getSupportedModels()**
   - 点击"获取支持的模型"按钮
   - 查看返回的模型列表

3. **测试 getQuota()**
   - 点击"查询配额"按钮
   - 查看配额信息（需要 API 支持此端点）

4. **测试生成内容**
   - 输入提示词
   - 选择模型（可选）
   - 点击"生成内容"按钮

5. **验证 BaseURL**
   - 点击"检查 BaseURL"按钮
   - 确认 baseURL 是否正确设置为 `https://router.shengsuanyun.com/api/`

## 注意事项

1. **API Key 安全**: 
   - 示例文件会将 API Key 保存到 localStorage
   - 仅用于测试，生产环境请勿使用

2. **网络请求**:
   - 确保网络可以访问 `https://router.shengsuanyun.com/api/`
   - 某些功能需要 API 端点支持

3. **浏览器兼容性**:
   - 需要支持 ES Modules 的现代浏览器
   - 推荐使用 Chrome、Firefox、Edge 最新版本

4. **构建文件**:
   - 确保已运行 `npm run build` 生成 dist 目录
   - HTML 文件会从 `./dist/web/index.js` 导入模块

## 故障排除

### 问题: 无法导入模块

**解决方案**: 
- 确保已运行 `npm run build`
- 使用本地服务器而不是直接打开文件
- 检查浏览器控制台的错误信息

### 问题: CORS 错误

**解决方案**:
- 必须使用本地服务器
- 不能直接双击打开 HTML 文件

### 问题: API Key 错误

**解决方案**:
- 检查 API Key 是否正确
- 确认 API Key 有相应的权限

### 问题: 配额查询失败

**解决方案**:
- 确认 API 端点 `/v1/key` 是否可用
- 检查网络连接
- 查看浏览器控制台的详细错误信息
