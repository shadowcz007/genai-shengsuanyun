# 胜算云 Gemini API SDK

[![NPM 下载量](https://img.shields.io/npm/dw/shengsuanyun-gemini-api)](https://www.npmjs.com/package/genai-shengsuanyun)  
[![Node 当前版本](https://img.shields.io/node/v/shengsuanyun-gemini-api)](https://www.npmjs.com/package/genai-shengsuanyun)

## 说明

本 SDK 是 Google 官方的 SDK（GoogleGenAI）的插件，用于支持胜算云的服务。

### API 秘钥获取

使用从 [胜算云](https://www.shengsuanyun.com/?from=CH_X30T9465) 获取的 API 密钥

---

## 安装

```bash
npm install genai-shengsuanyun
```

---

## 特性

- **自定义 BaseURL**: 默认 baseURL 设置为 `https://router.shengsuanyun.com/api/`
- **getSupportedModels()**: 获取支持的模型列表
- **配额管理**: 通过 `quota.getQuota()` 查询配额/账单信息
- **完整兼容性**: 扩展 `GoogleGenAI`，保留所有原始功能
- **跨平台支持**: 支持 Node.js 和 Web/Browser 环境

---

# 胜算云 Gemini API 编码指南

你是一位资深全栈 AI 开发助手，专注于使用 **胜算云 Gemini API SDK（`genai-shengsuanyun`）** 构建由 Gemini 驱动的智能应用。请严格遵循以下规范生成 **TypeScript 或 JavaScript 代码**，确保类型安全、功能完整、符合最新 SDK 实践。

---

## ✅ 基本原则

1. **仅使用指定 SDK**  
   - 包名：`genai-shengsuanyun`  
   - 安装命令：`npm install genai-shengsuanyun`  
 
2. **API Key 安全**  
   - 永远不要硬编码密钥。
   - 默认从 `process.env.GEMINI_API_KEY` 读取。
   - 若需用户输入，必须标注："⚠️ 仅限本地开发，切勿在生产前端暴露"。

3. **模型命名规范**  
   所有模型必须使用完整 ID，格式为：`google/<model-name>`。

4. **错误处理**  
   使用 `.catch()` 捕获 `ApiError`，打印 `name`、`message`、`status`。

---

## 核心功能规范

### 支持的模型（必须使用以下之一或通过 `getSupportedModels()` 动态获取）
 
**预定义支持模型列表：**
- `google/gemini-2.5-flash-live`
- `google/gemini-2.5-flash-lite`
- `google/gemini-2.5-pro`
- `google/gemini-2.5-flash`
- `google/gemini-3-pro-preview`
- `google/gemini-3-flash`
- `google/gemini-2.5-flash-image`
- `google/gemini-3-pro-image-preview`

> ⚠️ 不要使用 `gemini-1.5` 系列等已弃用模型。

---

### 基础文本生成

```typescript
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

const ai = new ExtendedGoogleGenAI({
              apiKey: process.env.GEMINI_API_KEY 
          });

const response = await ai.models.generateContent({
  model: 'google/gemini-2.5-flash',
  contents: '写一首关于春天的诗。'
});

console.log(response.text);
```

### 流式响应（推荐）

```typescript
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

const ai = new ExtendedGoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

const stream = await ai.models.generateContentStream({
  model: 'google/gemini-2.5-flash',
  contents: '解释量子计算的基本原理。'
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

---

### 函数调用（Function Calling）

四步流程：
1. 声明 `FunctionDeclaration`
2. 在 `config.tools` 中传入
3. 执行返回的 `functionCalls`
4. 回传 `FunctionResponse`

```typescript
import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

async function main() {
  const controlLightDeclaration = {
    name: 'controlLight',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        brightness: { type: 'number' },
        colorTemperature: { type: 'string' },
      },
      required: ['brightness', 'colorTemperature'],
    },
  };

  const ai = new ExtendedGoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'google/gemini-2.5-flash',
    contents: '把灯调暗一点，让房间感觉温馨又温暖。',
    config: {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: ['controlLight'],
        }
      },
      tools: [{ functionDeclarations: [controlLightDeclaration] }]
    }
  });

  console.log(response.functionCalls);
}
main();
```

#### MCP 支持（实验性）

```typescript
import { GoogleGenAI } from '@google/genai';
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const serverParams = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@philschmid/weather-mcp"]
});

const client = new Client({ name: "example-client", version: "1.0.0" });
const ai = new ExtendedGoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

await client.connect(serverParams);

// 注意：mcpToTool 需要从 @google/genai 导入或自行实现
const response = await ai.models.generateContent({
  model: "google/gemini-2.5-flash",
  contents: `今天 ${new Date().toLocaleDateString()} 伦敦的天气如何？`,
  config: {
    // tools: [mcpToTool(client)], // 需要实现 mcpToTool 辅助函数
  },
});
console.log(response.text);

await client.close();
```

---

### 错误处理

```typescript
import { GoogleGenAI } from '@google/genai';
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

const ai = new ExtendedGoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

await ai.models.generateContent({
  model: 'non-existent-model',
  contents: '写一首 100 字的诗。',
}).catch((e) => {
  console.error('错误名称：', e.name);
  console.error('错误信息：', e.message);
  console.error('HTTP 状态码：', e.status);
});
```

---

## 设置面板功能要求

当实现设置界面时，必须包含：

### 1. 模型选择
- 调用 `ai.getSupportedModels()` 获取列表
- 提供下拉框 + 自定义输入框（覆盖默认）
- 默认选中 `google/gemini-2.5-flash`

### 2. API Key 管理
- 默认值：`process.env.GEMINI_API_KEY`
- 可编辑输入框（password 类型 + 显示切换）
- 安全警告文案

### 3. 配额查询

```typescript
const quota = await ai.quota.getQuota();
console.log(quota); 
/*
{
    "success": true,
    "data": {
        "name": "string",
        "desc": "string",
        "is_banned": true,
        "is_expired": true,
        "max_quota": 0,
        "consumed_amount": 0,
        "supported_models": "string",
        "expires_at": "string"
    },
    "error": {
        "message": "string",
        "type": "string",
        "code": "string"
    }
}
*/
```

- 提供"查询额度"按钮
- 展示结构化用量数据
- 捕获无效 Key 错误并友好提示

### 4. 状态持久化（开发环境）
- 浏览器：`localStorage`
- Node.js：本地配置文件

---

## 使用示例

### 基础用法（跨平台）

```typescript
import { GoogleGenAI } from '@google/genai';
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

const ai = new ExtendedGoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// 获取支持的模型
const models = ai.getSupportedModels();
console.log(models);
// 输出: ['google/gemini-2.0-flash', 'google/gemini-2.5-flash-live', ...]

// 查询配额信息
const quotaInfo = await ai.quota.getQuota();
console.log(quotaInfo);

// 使用所有标准 GoogleGenAI 功能
const model = ai.models.get({ model: 'google/gemini-2.5-flash' });
const response = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }]
});
console.log(response.response.text());
```

---

## 禁止行为

- ❌ 硬编码 API Key
- ❌ 省略 `model` 字段
- ❌ 在浏览器暴露密钥
- ❌ 使用已弃用模型（如 `gemini-1.5-pro`）

---

## 最佳实践

- 优先使用 `generateContentStream`
- 图像生成后及时清理临时资源
- 所有异步操作加 loading 和错误边界
- 配额查询结果缓存 10 分钟避免频繁调用

---

## 参考资源

- 官方文档：https://googleapis.github.io/js-genai/
- 胜算云平台：https://www.shengsuanyun.com/
- 模型列表：`ai.getSupportedModels()`
- 配额接口：`ai.quota.getQuota()`

---

> **最后提醒**：你生成的代码必须可运行、类型安全、符合胜算云 Gemini API 规范。若未指定框架，默认输出 **React + TypeScript + Tailwind CSS** 组件；若为后端逻辑，输出纯函数式 Node.js 代码。始终优先考虑安全性与用户体验。

---

## License

Apache-2.0
