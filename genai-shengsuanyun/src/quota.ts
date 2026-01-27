/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Note: BaseModule and ApiClient are not publicly exported from @google/genai
// We'll need to access ApiClient through the protected apiClient property
// For now, we'll define a minimal BaseModule and use a type for ApiClient

/**
 * Base module class (minimal implementation)
 */
export class BaseModule {}

/**
 * Quota information interface.
 */
export interface QuotaInfo {
  quota?: number;
  usage?: number;
  billing?: {
    plan?: string;
    status?: string;
  };
  [key: string]: unknown; // Allow other fields
}

/**
 * ApiClient interface for type checking
 * This matches the ApiClient from @google/genai
 */
export interface ApiClientLike {
  getApiKey(): string | undefined;
  request(request: {
    path: string;
    httpMethod: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    httpOptions?: {
      apiVersion?: string;
      headers?: Record<string, string>;
    };
  }): Promise<{
    json(): Promise<unknown>;
  }>;
}

/**
 * Class to query quota/billing information.
 */
export class Quota extends BaseModule {
  constructor(private readonly apiClient: ApiClientLike) {
    super();
  }

  /**
   * Retrieves the quota/key information.
   * Uses the /v1/key endpoint with Bearer authentication.
   *
   * @param params Optional parameters.
   * @returns A promise that resolves to the quota information.
   */
  async getQuota(params?: {
    /** Override the endpoint path. Default: 'v1/key' */
    path?: string;
  }): Promise<QuotaInfo> {
    const path = params?.path ?? 'v1/key';
    const apiKey = this.apiClient.getApiKey();

    if (!apiKey) {
      throw new Error('API Key is required to query quota.');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`
    };

    // Use httpOptions to bypass versioning
    const response = await this.apiClient.request({
      path: path,
      httpMethod: 'GET',
      httpOptions: {
        // Empty string to prevent appending version
        apiVersion: '', 
        headers: headers
      }
    });
    
    return response.json() as Promise<QuotaInfo>;
  }
}
