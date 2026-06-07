/**
 * Configuration loader for Headroom sync engine
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface SyncConfig {
  apiKey?: string;
  apiUrl: string;
  cloudSync: boolean;
  timeout?: number;
  maxRetries?: number;
  retryInterval?: number;
  useCacheIfOffline?: boolean;
  cacheTTL?: number;
}

/**
 * Load configuration from config.json file
 */
export function loadConfigFromFile(configPath: string): SyncConfig {
  if (!existsSync(configPath)) {
    console.warn(`Config file not found: ${configPath}, using defaults`);
    return getDefaultConfig();
  }

  try {
    const configContent = readFileSync(configPath, 'utf-8');
    // Remove comments for JSON parsing
    const cleanContent = configContent.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
    const parsedConfig = JSON.parse(cleanContent) as Partial<SyncConfig>;
    
    return {
      ...getDefaultConfig(),
      ...parsedConfig,
    };
  } catch (error) {
    console.warn(`Failed to parse config file: ${error}, using defaults`);
    return getDefaultConfig();
  }
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): SyncConfig {
  return {
    apiKey: undefined,
    apiUrl: 'http://localhost:4000',
    cloudSync: true,
    timeout: 30000,
    maxRetries: 5,
    retryInterval: 30000,
    useCacheIfOffline: true,
    cacheTTL: 30 * 60 * 1000, // 30 minutes
  };
}

/**
 * Apply environment variable overrides
 */
export function applyEnvOverrides(config: SyncConfig): SyncConfig {
  const envConfig: Partial<SyncConfig> = {};
  
  if (process.env.HEADROOM_API_KEY) {
    envConfig.apiKey = process.env.HEADROOM_API_KEY;
  }
  
  if (process.env.HEADROOM_API_URL) {
    envConfig.apiUrl = process.env.HEADROOM_API_URL;
  }
  
  if (process.env.HEADROOM_CLOUD_SYNC !== undefined) {
    envConfig.cloudSync = process.env.HEADROOM_CLOUD_SYNC === 'true';
  }
  
  if (process.env.HEADROOM_TIMEOUT) {
    const timeout = parseInt(process.env.HEADROOM_TIMEOUT, 10);
    if (!isNaN(timeout)) {
      envConfig.timeout = timeout;
    }
  }
  
  if (process.env.HEADROOM_MAX_RETRIES) {
    const maxRetries = parseInt(process.env.HEADROOM_MAX_RETRIES, 10);
    if (!isNaN(maxRetries)) {
      envConfig.maxRetries = maxRetries;
    }
  }
  
  if (process.env.HEADROOM_RETRY_INTERVAL) {
    const retryInterval = parseInt(process.env.HEADROOM_RETRY_INTERVAL, 10);
    if (!isNaN(retryInterval)) {
      envConfig.retryInterval = retryInterval;
    }
  }

  return {
    ...config,
    ...envConfig,
  };
}

/**
 * Load configuration with environment overrides
 */
export function loadConfig(configPath?: string): SyncConfig {
  const filePath = configPath || join(__dirname, '..', 'headroom-config', 'config.json');
  const fileConfig = loadConfigFromFile(filePath);
  return applyEnvOverrides(fileConfig);
}

/**
 * Validate configuration
 */
export function validateConfig(config: SyncConfig): boolean {
  const errors: string[] = [];
  
  if (!config.apiUrl) {
    errors.push('apiUrl is required');
  }
  
  if (config.maxRetries && config.maxRetries < 0) {
    errors.push('maxRetries must be non-negative');
  }
  
  if (config.retryInterval && config.retryInterval < 0) {
    errors.push('retryInterval must be non-negative');
  }
  
  if (config.timeout && config.timeout < 0) {
    errors.push('timeout must be non-negative');
  }

  if (errors.length > 0) {
    console.error('Configuration validation errors:', errors);
    return false;
  }

  return true;
}

/**
 * Get API key from config or environment
 */
export function getApiKey(config: SyncConfig): string | undefined {
  return config.apiKey || process.env.HEADROOM_API_KEY;
}

/**
 * Check if API key is valid
 */
export function isApiKeyValid(apiKey?: string): boolean {
  if (!apiKey) {
    return false;
  }
  
  // API key should be 8-64 alphanumeric characters
  const apiKeyPattern = /^[a-zA-Z0-9]{8,64}$/;
  return apiKeyPattern.test(apiKey);
}

/**
 * Validate API key format and return status
 */
export function validateApiKey(apiKey?: string): { valid: boolean; message?: string } {
  if (!apiKey) {
    return {
      valid: false,
      message: 'API key not set. Please set HEADROOM_API_KEY environment variable.',
    };
  }
  
  if (!isApiKeyValid(apiKey)) {
    return {
      valid: false,
      message: 'API key format invalid. Must be 8-64 alphanumeric characters.',
    };
  }
  
  return { valid: true };
}