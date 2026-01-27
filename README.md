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
   - 默认从 `process.env.SSY_API_KEY` 读取。
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
              apiKey: process.env.SSY_API_KEY 
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
  apiKey: process.env.SSY_API_KEY 
});

const stream = await ai.models.generateContentStream({
  model: 'google/gemini-2.5-flash',
  contents: '解释量子计算的基本原理。',
  config: {
    temperature: 0.1  // 温度值：0.0-2.0，值越低输出越确定，值越高输出越随机
  }
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

> **温度值说明**：`temperature` 参数控制输出的随机性
> - `0.0-0.3`：更确定、更聚焦的输出，适合事实性任务
> - `0.4-0.7`：平衡的创造性和准确性
> - `0.8-2.0`：更随机、更有创造性的输出，适合创意任务

### 图像生成

使用 `google/gemini-2.5-flash-image` 或 `google/gemini-3-pro-image-preview` 模型生成图像：

```typescript
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

const ai = new ExtendedGoogleGenAI({ 
  apiKey: process.env.SSY_API_KEY 
});

// 基于 JSON 数据构建提示词
const data = {
  title: '数据可视化报告',
  subtitle: '2024 年度总结',
  colorTheme: '蓝色渐变'
};

const prompt = `Create a high-quality, flat-design infographic poster image based on this data structure. 
Style: Minimalist, professional, ${data.colorTheme} color scheme.
Title: ${data.title}
Subtitle: ${data.subtitle}
Content Summary: ${JSON.stringify(data).slice(0, 1000)}...`; // 截断以避免超出 token 限制

const response = await ai.models.generateContent({
  model: 'google/gemini-2.5-flash-image', // 确保使用正确的图像模型
  contents: {
    parts: [
      { text: prompt }
    ]
  },
  config: {
    responseModalities: ['IMAGE'],
    // tools: [{googleSearch: {}}],
  }
});

// 从响应中提取图像
if (response.candidates?.[0]?.content?.parts) {
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData && part.inlineData.data) {
      const imageDataUri = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      console.log('图像生成成功，数据 URI 长度:', imageDataUri.length);
      // 在浏览器中可以直接使用：<img src={imageDataUri} />
      return imageDataUri;
    }
  }
}
```

### JSON 输出

使用 `responseMimeType` 和 `responseSchema` 让模型返回结构化的 JSON 数据：

```typescript
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';
import { Type } from '@google/genai';

const ai = new ExtendedGoogleGenAI({ 
  apiKey: process.env.SSY_API_KEY 
});

const prompt = `分析用户的技术情报偏好。输入是用户最近的点击、复制和编辑记录：
[点击] React 性能优化
[复制] TypeScript 最佳实践
[编辑] Vue 3 组合式 API

任务：
1. 用一句话描述用户的"专业画像"（Persona）。
2. 提取 10 个用户最关心的"核心技术关键词（中文）"，用于未来的内容推荐。

仅返回 JSON 格式。`;

const response = await ai.models.generateContent({
  model: 'google/gemini-2.5-flash',
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        persona: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  }
});

const result = JSON.parse(response.text.trim() || "{}");
console.log(result);
// 输出示例: { persona: "前端开发工程师，专注于现代框架和性能优化", tags: ["React", "TypeScript", "Vue", ...] }
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

  const ai = new ExtendedGoogleGenAI({ apiKey: process.env.SSY_API_KEY });
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

import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const serverParams = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@philschmid/weather-mcp"]
});

const client = new Client({ name: "example-client", version: "1.0.0" });
const ai = new ExtendedGoogleGenAI({ apiKey: process.env.SSY_API_KEY });

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

#### Google 搜索工具

启用 Google 搜索工具，让模型可以搜索实时信息并返回来源链接：

```typescript
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

const ai = new ExtendedGoogleGenAI({ 
  apiKey: process.env.SSY_API_KEY 
});

const response = await ai.models.generateContent({
  model: 'google/gemini-2.5-flash',
  contents: '2024年最新的AI技术趋势是什么？',
  config: {
    tools: [{ googleSearch: {} }]
  }
});

const text = response.text || "";

// 从响应中提取搜索来源
const sources = [];
const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
if (chunks) {
  chunks.forEach((chunk: any) => {
    if (chunk.web) {
      sources.push({ 
        uri: chunk.web.uri, 
        title: chunk.web.title 
      });
    }
  });
}

console.log('回答:', text);
console.log('来源:', sources);
// 来源示例: [{ uri: 'https://example.com', title: 'Example Title' }]
```

---
### Token统计和计算

生成内容后，可以从响应对象的 `usageMetadata` 中获取实际的 token 使用统计：

```typescript
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

const ai = new ExtendedGoogleGenAI({ 
  apiKey: process.env.SSY_API_KEY 
});

const response = await ai.models.generateContent({
  model: 'google/gemini-2.5-flash',
  contents: '解释量子计算的基本原理。',
});

// 获取 token 使用统计
if (response.usageMetadata) {
  const totalTokens = response.usageMetadata.totalTokenCount;
  const promptTokenCount = response.usageMetadata.promptTokenCount;
  const candidatesTokenCount = response.usageMetadata.candidatesTokenCount;
  
  console.log(`总 Token 数: ${totalTokens}`);
  console.log(`输入 Token 数: ${promptTokenCount}`);
  console.log(`输出 Token 数: ${candidatesTokenCount}`);
}
```

---

### 错误处理

```typescript
 
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

const ai = new ExtendedGoogleGenAI({ apiKey: process.env.SSY_API_KEY });

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
- 默认值：`process.env.SSY_API_KEY`
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
import { ExtendedGoogleGenAI } from 'genai-shengsuanyun';

const ai = new ExtendedGoogleGenAI({
  apiKey: process.env.SSY_API_KEY
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
