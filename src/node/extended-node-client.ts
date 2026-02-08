/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Import from main package - the node/web variants are runtime-specific
// but TypeScript types are the same
import {GoogleGenAI as BaseGoogleGenAI, GoogleGenAIOptions, Type} from '@google/genai';
import {Quota} from '../quota.js';

/**
 * Supported models list
 */
const SUPPORTED_MODELS = [  
  'google/gemini-3-pro-preview',
  'google/gemini-3-flash', 
  'google/gemini-3-pro-image-preview',
] as const;

/**
 * Default base URL for shengsuanyun router
 */
const DEFAULT_BASE_URL = 'https://router.shengsuanyun.com/api/';

/**
 * Extended Google GenAI SDK for Node.js with custom baseURL and additional methods.
 * 
 * @example
 * ```ts
 * import {ExtendedGoogleGenAI} from 'genai-shengsuanyun/node';
 * 
 * const ai = new ExtendedGoogleGenAI({
 *   apiKey: 'YOUR_API_KEY'
 * });
 * 
 * // Get supported models
 * const models = ai.getSupportedModels();
 * 
 * // Query quota
 * const quota = await ai.quota.getQuota();
 * ```
 */
export class ExtendedGoogleGenAI extends BaseGoogleGenAI {
  readonly quota: Quota;

  constructor(options: GoogleGenAIOptions) {
    // Set default baseURL if not provided
    const defaultBaseUrl = DEFAULT_BASE_URL;
    const httpOptions = options.httpOptions || {};
    
    // Only set default baseURL if user hasn't provided one
    if (!httpOptions.baseUrl) {
      httpOptions.baseUrl = defaultBaseUrl;
    }

    // Call parent constructor with modified options
    super({
      ...options,
      httpOptions,
    });

    // Initialize Quota with access to protected apiClient
    // Use type assertion to access protected member
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.quota = new Quota((this as any)['apiClient']);
  }

  /**
   * Returns the list of supported models.
   * 
   * @returns Array of supported model names
   * 
   * @example
   * ```ts
   * const models = ai.getSupportedModels();
   * console.log(models); // ['google/gemini-2.0-flash', ...]
   * ```
   */
  getSupportedModels(): string[] {
    return [...SUPPORTED_MODELS];
  }

  /**
   * 文生图（单图生成）- 简便方法
   * 
   * @param model - 图像生成模型，如 'google/gemini-2.5-flash-image' 或 'google/gemini-3-pro-image-preview'
   * @param prompt - 图像生成提示词
   * @param options - 可选配置，如 thinkingBudget 等
   * @returns 返回图像的 base64 数据 URI 和 token 消耗统计
   * 
   * @example
   * ```ts
   * const result = await ai.generateImage(
   *   'google/gemini-2.5-flash-image',
   *   'Create a high-quality, flat-design infographic poster'
   * );
   * console.log('图像数据 URI:', result.imageBase64);
   * console.log('Token 消耗:', result.usage);
   * ```
   */
  async generateImage(
    model: string,
    prompt: string,
    options?: {
      thinkingBudget?: number;
      [key: string]: any;
    }
  ): Promise<{
    imageBase64: string;
    usage: {
      totalTokenCount?: number;
      promptTokenCount?: number;
      candidatesTokenCount?: number;
    };
  }> {
    const config: any = {
      responseModalities: ['IMAGE'],
    };

    if (options?.thinkingBudget) {
      config.thinkingConfig = {
        thinkingBudget: options.thinkingBudget,
      };
    }

    // 合并其他配置选项
    if (options) {
      Object.keys(options).forEach((key) => {
        if (key !== 'thinkingBudget') {
          config[key] = options[key];
        }
      });
    }

    const response = await this.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }],
      },
      config,
    });

    // 从响应中提取图像
    let imageBase64 = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageBase64) {
      throw new Error('未能从响应中提取图像数据');
    }

    // 提取 token 使用统计
    const usage = {
      totalTokenCount: response.usageMetadata?.totalTokenCount,
      promptTokenCount: response.usageMetadata?.promptTokenCount,
      candidatesTokenCount: response.usageMetadata?.candidatesTokenCount,
    };

    return {
      imageBase64,
      usage,
    };
  }

  /**
   * 文生JSON - 简便方法
   * 
   * @param model - 模型名称，如 'google/gemini-2.5-flash'
   * @param prompt - 提示词
   * @param schema - JSON schema 定义，使用 Type 枚举定义结构
   * @param options - 可选配置，如 thinkingBudget 等
   * @returns 返回解析后的 JSON 对象和 token 消耗统计
   * 
   * @example
   * ```ts
   * const result = await ai.generateJson(
   *   'google/gemini-2.5-flash',
   *   '分析用户的技术偏好',
   *   {
   *     type: Type.OBJECT,
   *     properties: {
   *       persona: { type: Type.STRING },
   *       tags: { type: Type.ARRAY, items: { type: Type.STRING } }
   *     }
   *   }
   * );
   * console.log('JSON 结果:', result.json);
   * console.log('Token 消耗:', result.usage);
   * ```
   */
  async generateJson(
    model: string,
    prompt: string,
    schema: any,
    options?: {
      thinkingBudget?: number;
      [key: string]: any;
    }
  ): Promise<{
    json: any;
    usage: {
      totalTokenCount?: number;
      promptTokenCount?: number;
      candidatesTokenCount?: number;
    };
  }> {
    const config: any = {
      responseMimeType: 'application/json',
      responseSchema: schema,
    };

    if (options?.thinkingBudget) {
      config.thinkingConfig = {
        thinkingBudget: options.thinkingBudget,
      };
    }

    // 合并其他配置选项
    if (options) {
      Object.keys(options).forEach((key) => {
        if (key !== 'thinkingBudget') {
          config[key] = options[key];
        }
      });
    }

    const response = await this.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    // 解析 JSON
    const jsonText = response.text?.trim() || '{}';
    let json: any;
    try {
      json = JSON.parse(jsonText);
    } catch (error) {
      throw new Error(`JSON 解析失败: ${error instanceof Error ? error.message : String(error)}。原始文本: ${jsonText}`);
    }

    // 提取 token 使用统计
    const usage = {
      totalTokenCount: response.usageMetadata?.totalTokenCount,
      promptTokenCount: response.usageMetadata?.promptTokenCount,
      candidatesTokenCount: response.usageMetadata?.candidatesTokenCount,
    };

    return {
      json,
      usage,
    };
  }
}
