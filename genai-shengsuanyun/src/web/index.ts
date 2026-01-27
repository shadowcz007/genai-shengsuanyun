/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Export Web/Browser specific ExtendedGoogleGenAI
export {ExtendedGoogleGenAI} from './extended-web-client.js';

// Export GoogleGenAI as alias for ExtendedGoogleGenAI (for compatibility with documentation)
export {ExtendedGoogleGenAI as GoogleGenAI} from './extended-web-client.js';

// Export Quota and types
export {Quota, type QuotaInfo, type ApiClientLike} from '../quota.js';

// Re-export GoogleGenAIOptions and other types for convenience
export type {GoogleGenAIOptions} from '@google/genai';
export type {FunctionDeclaration, FunctionCallingConfigMode} from '@google/genai';
