/**
 * Headroom API Client
 * 
 * This module provides a TypeScript client for interacting with the Headroom API.
 * It handles close, group, and tag operations with proper parameter validation
 * and error handling.
 * 
 * @module headroom-api/api-client
 */

import { validateCloseParams, validateGroupParams, validateTagParams } from './validators';
import { handleApiError, parseErrorResponse, mapStatusCodeToErrorType } from './error-handler';

/**
 * Headroom API Client configuration
 */
interface ApiConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * API response types
 */
interface CloseResponse {
  closedCount: number;
  failedTabIds: string[];
}

interface GroupResponse {
  movedCount: number;
  targetGroup: string;
}

interface TagResponse {
  updatedCount: number;
  operation: 'add' | 'remove';
}

interface Tab {
  id: string;
  title: string;
  url: string;
  groupId?: string;
  groupName?: string;
  lastAccessed: string;
  isPinned: boolean;
  isInactive: boolean;
  tags?: string[];
}

interface TabsResponse {
  tabs: Tab[];
}

interface GroupsResponse {
  groups: {
    id: string;
    name: string;
    tabCount: number;
    color: string;
  }[];
}

interface SyncPullResponse {
  success: boolean;
  tabsSynced: number;
  lastSync: string;
}

/**
 * Headroom API Client class
 */
export class HeadroomApiClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;

  /**
   * Create a new Headroom API Client
   * @param config API configuration
   */
  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:8080/api/v1';
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Build request headers with authentication
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Execute API request with error handling
   */
  private async executeRequest<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        headers: this.buildHeaders(),
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorInfo = parseErrorResponse(await response.text());
        const errorType = mapStatusCodeToErrorType(response.status);
        throw handleApiError(response.status, errorType, errorInfo.message);
      }

      const data = await response.json();
      return data as T;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw handleApiError(408, 'client_error', 'Request timeout');
        }
        throw handleApiError(0, 'client_error', error.message);
      }

      throw handleApiError(0, 'server_error', 'Unknown error occurred');
    }
  }

  /**
   * Get all tabs from Headroom
   */
  async getTabs(): Promise<TabsResponse> {
    return this.executeRequest<TabsResponse>(`${this.baseUrl}/tabs`);
  }

  /**
   * Close tabs by ID or group
   * 
   * @param params - Close parameters (tab_ids OR group)
   * @returns CloseResult with closedCount and failedTabIds
   */
  async closeTabs(params: { tab_ids?: string[]; group?: string }): Promise<CloseResponse> {
    // Validate parameters
    const validationError = validateCloseParams(params);
    if (validationError) {
      throw new Error(validationError);
    }

    const body: { tab_ids?: string[]; group?: string } = {};
    if (params.tab_ids) body.tab_ids = params.tab_ids;
    if (params.group) body.group = params.group;

    const response = await this.executeRequest<CloseResponse>(
      `${this.baseUrl}/tabs/close`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    return response;
  }

  /**
   * Get all groups from Headroom
   */
  async getGroups(): Promise<GroupsResponse> {
    return this.executeRequest<GroupsResponse>(`${this.baseUrl}/groups`);
  }

  /**
   * Move tabs to a target group
   * 
   * @param params - Group parameters (tab_ids AND target_group)
   * @returns GroupResult with movedCount and targetGroup
   */
  async moveTabsToGroup(params: { tab_ids: string[]; target_group: string }): Promise<GroupResponse> {
    // Validate parameters
    const validationError = validateGroupParams(params);
    if (validationError) {
      throw new Error(validationError);
    }

    const response = await this.executeRequest<GroupResponse>(
      `${this.baseUrl}/groups`,
      {
        method: 'POST',
        body: JSON.stringify({
          tab_ids: params.tab_ids,
          target_group: params.target_group,
        }),
      }
    );

    return response;
  }

  /**
   * Add or remove tags from tabs
   * 
   * @param params - Tag parameters (tab_ids AND either tags OR remove_tags)
   * @returns TagResult with updatedCount and operation type
   */
  async modifyTags(params: { tab_ids: string[]; tags?: string[]; remove_tags?: string[] }): Promise<TagResponse> {
    // Validate parameters
    const validationError = validateTagParams(params);
    if (validationError) {
      throw new Error(validationError);
    }

    const body: { tab_ids: string[]; tags?: string[]; remove_tags?: string[] } = {
      tab_ids: params.tab_ids,
    };

    if (params.tags) body.tags = params.tags;
    if (params.remove_tags) body.remove_tags = params.remove_tags;

    const operation: 'add' | 'remove' = params.tags ? 'add' : 'remove';

    const response = await this.executeRequest<TagResponse>(
      `${this.baseUrl}/tags`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    return { ...response, operation };
  }

  /**
   * Pull latest tabs from cloud sync
   */
  async pullFromCloud(): Promise<SyncPullResponse> {
    return this.executeRequest<SyncPullResponse>(
      `${this.baseUrl}/sync/pull`,
      {
        method: 'POST',
      }
    );
  }
}

// Export default for easy usage
export default HeadroomApiClient;