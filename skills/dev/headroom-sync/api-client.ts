/**
 * Headroom API Client with timeout handling, retry logic, and error management
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  rateLimited?: boolean;
  remainingRetries?: number;
}

interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  remediationSteps?: string[];
}

interface Tab {
  id: string;
  title: string;
  url: string;
  groupId?: string;
  groupName?: string;
  lastAccessed: string; // ISO 8601
  isPinned: boolean;
  isInactive: boolean;
  tags?: string[];
}

interface TabGroup {
  id: string;
  name: string;
  tabIds: string[];
}

interface SyncPullResponse {
  success: boolean;
  syncedAt: string;
  tabs?: Tab[];
}

/**
 * API Client configuration
 */
interface ApiClientConfig {
  apiUrl: string;
  apiKey?: string;
  timeout?: number;
  maxRetries?: number;
  retryInterval?: number;
}

/**
 * Default configuration values
 */
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_RETRY_INTERVAL = 30000; // 30 seconds

/**
 * Headroom API Client class
 */
export class HeadroomApiClient {
  private apiUrl: string;
  private apiKey?: string;
  private timeout: number;
  private maxRetries: number;
  private retryInterval: number;

  constructor(config: ApiClientConfig) {
    this.apiUrl = config.apiUrl || 'http://localhost:4000';
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.maxRetries = config.maxRetries || DEFAULT_MAX_RETRIES;
    this.retryInterval = config.retryInterval || DEFAULT_RETRY_INTERVAL;
  }

  /**
   * Helper to create abort controller with timeout
   */
  private createTimeoutController() {
    return new AbortController();
  }

  /**
   * Add authorization header if API key is present
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  /**
   * Parse ISO 8601 timestamp from various formats
   */
  private normalizeTimestamp(timestamp: string | number): string {
    // If already a valid ISO 8601 string, return as is
    if (typeof timestamp === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(timestamp)) {
      return timestamp;
    }
    
    // Handle numeric timestamp (milliseconds since epoch)
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString();
    }
    
    // Handle date string
    try {
      return new Date(timestamp).toISOString();
    } catch {
      // Fallback to current time if parsing fails
      return new Date().toISOString();
    }
  }

  /**
   * Validate and normalize tab data
   */
  private normalizeTab(tab: any): Tab {
    return {
      id: String(tab.id),
      title: String(tab.title || ''),
      url: String(tab.url || ''),
      groupId: tab.groupId ? String(tab.groupId) : undefined,
      groupName: tab.groupName ? String(tab.groupName) : undefined,
      lastAccessed: this.normalizeTimestamp(tab.lastAccessed),
      isPinned: Boolean(tab.isPinned || false),
      isInactive: Boolean(tab.isInactive || false),
      tags: Array.isArray(tab.tags) ? tab.tags.map(t => String(t)) : undefined,
    };
  }

  /**
   * Validate and normalize tab group data
   */
  private normalizeTabGroup(group: any): TabGroup {
    return {
      id: String(group.id),
      name: String(group.name || ''),
      tabIds: Array.isArray(group.tabIds) ? group.tabIds.map((id: any) => String(id)) : [],
    };
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    signal?: AbortSignal
  ): Promise<Response> {
    const controller = signal ? undefined : this.createTimeoutController();
    const abortSignal = signal || controller?.signal;

    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
      signal: abortSignal,
    };

    // Set timeout if controller was created
    if (controller) {
      setTimeout(() => controller.abort(), this.timeout);
    }

    try {
      const response = await fetch(url, fetchOptions);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout: ${this.timeout}ms exceeded`);
        }
      }
      throw error;
    }
  }

  /**
   * Handle HTTP errors and extract error information
   */
  private async handleErrorResponse(response: Response, url: string): Promise<never> {
    let errorMessage = `HTTP ${response.status}`;
    let remediationSteps: string[] = [];

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Use response text if JSON parsing fails
      const errorText = await response.text();
      if (errorText) {
        errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`;
      }
    }

    // Add remediation steps based on status code
    if (response.status >= 500) {
      remediationSteps = [
        'Check Headroom service status',
        'Verify API key validity',
        'Check network connection',
        'Try restarting the Headroom server',
      ];
    } else if (response.status === 401 || response.status === 403) {
      remediationSteps = [
        'Verify your API key is correct',
        'Check if your API key has the necessary permissions',
      ];
    }

    throw new Error(errorMessage) as ApiError;
  }

  /**
   * Make GET request with retry logic for rate limiting
   */
  private async getWithRetry<T>(endpoint: string, maxRetries?: number): Promise<ApiResponse<T>> {
    const url = `${this.apiUrl}${endpoint}`;
    let retries = maxRetries ?? this.maxRetries;

    while (retries >= 0) {
      try {
        const response = await this.fetchWithTimeout(url);

        // Handle rate limiting (429)
        if (response.status === 429) {
          if (retries > 0) {
            console.log(`Rate Limited, waiting (remaining retries: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, this.retryInterval));
            retries--;
            continue;
          }
          
          return {
            success: false,
            error: {
              code: 'RATE_LIMITED',
              message: 'Max retries exceeded for rate-limited request',
              statusCode: 429,
              remediationSteps: [
                'Wait for rate limit to reset',
                'Reduce request frequency',
                'Check Headroom rate limiting policy',
              ],
            },
            rateLimited: true,
            remainingRetries: 0,
          };
        }

        // Handle server errors (5xx)
        if (response.status >= 500) {
          await this.handleErrorResponse(response, url);
        }

        // Handle other errors (4xx)
        if (!response.ok) {
          await this.handleErrorResponse(response, url);
        }

        // Success - parse response
        const data = await response.json();
        return { success: true, data };

      } catch (error) {
        if (error instanceof Error) {
          // Check if this is a timeout error
          if (error.message.includes('timeout') || error.message.includes('exceeded')) {
            return {
              success: false,
              error: {
                code: 'TIMEOUT',
                message: error.message,
                statusCode: 0,
                remediationSteps: [
                  'Check Headroom service status',
                  'Verify API key validity',
                  'Check network connection',
                  'Try increasing the timeout value',
                ],
              },
            };
          }

          // Check for network errors
          if (!navigator.onLine) {
            return {
              success: false,
              error: {
                code: 'NETWORK_ERROR',
                message: 'No internet connection',
                statusCode: 0,
                remediationSteps: [
                  'Check your network connection',
                  'Verify Headroom server is reachable',
                ],
              },
            };
          }
        }
        throw error;
      }
    }

    // Should not reach here
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Unexpected error occurred',
        statusCode: 0,
      },
    };
  }

  /**
   * Make POST request with retry logic
   */
  private async postWithRetry<T>(
    endpoint: string,
    body?: any,
    maxRetries?: number
  ): Promise<ApiResponse<T>> {
    const url = `${this.apiUrl}${endpoint}`;
    let retries = maxRetries ?? this.maxRetries;

    while (retries >= 0) {
      try {
        const response = await this.fetchWithTimeout(url, {
          method: 'POST',
          body: body ? JSON.stringify(body) : undefined,
        });

        // Handle rate limiting (429)
        if (response.status === 429) {
          if (retries > 0) {
            console.log(`Rate Limited, waiting (remaining retries: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, this.retryInterval));
            retries--;
            continue;
          }
          
          return {
            success: false,
            error: {
              code: 'RATE_LIMITED',
              message: 'Max retries exceeded for rate-limited request',
              statusCode: 429,
              remediationSteps: [
                'Wait for rate limit to reset',
                'Reduce request frequency',
                'Check Headroom rate limiting policy',
              ],
            },
            rateLimited: true,
            remainingRetries: 0,
          };
        }

        // Handle server errors (5xx)
        if (response.status >= 500) {
          await this.handleErrorResponse(response, url);
        }

        // Handle other errors (4xx)
        if (!response.ok) {
          await this.handleErrorResponse(response, url);
        }

        // Success - parse response
        const data = await response.json();
        return { success: true, data };

      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('timeout') || error.message.includes('exceeded')) {
            return {
              success: false,
              error: {
                code: 'TIMEOUT',
                message: error.message,
                statusCode: 0,
                remediationSteps: [
                  'Check Headroom service status',
                  'Verify API key validity',
                  'Check network connection',
                  'Try increasing the timeout value',
                ],
              },
            };
          }

          if (!navigator.onLine) {
            return {
              success: false,
              error: {
                code: 'NETWORK_ERROR',
                message: 'No internet connection',
                statusCode: 0,
                remediationSteps: [
                  'Check your network connection',
                  'Verify Headroom server is reachable',
                ],
              },
            };
          }
        }
        throw error;
      }
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Unexpected error occurred',
        statusCode: 0,
      },
    };
  }

  /**
   * GET /tabs - Fetch all tabs
   */
  async getTabs(): Promise<ApiResponse<{ tabs: Tab[] }>> {
    const result = await this.getWithRetry<{ tabs: any[] }>('/tabs');
    
    if (!result.success || !result.data) {
      return result as ApiResponse<{ tabs: Tab[] }>;
    }

    // Normalize tab data
    const tabs = result.data.tabs.map(tab => this.normalizeTab(tab));

    return {
      success: true,
      data: { tabs },
    };
  }

  /**
   * POST /tabs/close - Close specified tabs
   */
  async closeTabs(tabIds: string[]): Promise<ApiResponse<{ closedCount: number; failedTabIds: string[] }>> {
    const result = await this.postWithRetry<{ closedCount: number; failedTabIds: string[] }>('/tabs/close', {
      tab_ids: tabIds,
    });

    return result as ApiResponse<{ closedCount: number; failedTabIds: string[] }>;
  }

  /**
   * GET /groups - Fetch all tab groups
   */
  async getGroups(): Promise<ApiResponse<{ groups: TabGroup[] }>> {
    const result = await this.getWithRetry<{ groups: any[] }>('/groups');
    
    if (!result.success || !result.data) {
      return result as ApiResponse<{ groups: TabGroup[] }>;
    }

    // Normalize group data
    const groups = result.data.groups.map(group => this.normalizeTabGroup(group));

    return {
      success: true,
      data: { groups },
    };
  }

  /**
   * POST /sync/pull - Pull latest tabs from cloud
   */
  async syncPull(): Promise<ApiResponse<SyncPullResponse>> {
    const result = await this.postWithRetry<SyncPullResponse>('/sync/pull');

    if (!result.success || !result.data) {
      return result as ApiResponse<SyncPullResponse>;
    }

    // Normalize tab data if present
    if (result.data.tabs) {
      result.data.tabs = result.data.tabs.map(tab => this.normalizeTab(tab));
    }

    return result as ApiResponse<SyncPullResponse>;
  }
}

/**
 * Create API client instance
 */
export function createHeadroomApiClient(config: ApiClientConfig = {}): HeadroomApiClient {
  const apiKey = process.env.HEADROOM_API_KEY || config.apiKey;
  return new HeadroomApiClient({
    ...config,
    apiKey,
  });
}