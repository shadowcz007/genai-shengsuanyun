/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Import from main package - the node/web variants are runtime-specific
// but TypeScript types are the same
import {GoogleGenAI as BaseGoogleGenAI, GoogleGenAIOptions} from '@google/genai';
import {Quota} from '../quota.js';

/**
 * Supported models list
 */
const SUPPORTED_MODELS = [
  'google/gemini-2.0-flash',
  'google/gemini-2.5-flash-live',
  'google/gemini-2.5-flash-lite',
  'google/gemini-2.5-pro',
  'google/gemini-2.5-flash',
  'google/gemini-3-pro-preview',
  'google/gemini-3-flash',
  'google/gemini-2.5-flash-image',
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
}
