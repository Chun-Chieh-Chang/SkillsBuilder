/**
 * Headroom API Error Handler
 * 
 * This module provides error handling utilities for Headroom API responses.
 * It maps HTTP status codes to error types, parses error response bodies,
 * and generates actionable error messages with remediation steps.
 * 
 * @module headroom-api/error-handler
 */

/**
 * Error types for API responses
 */
export type ErrorType = 'client_error' | 'server_error' | 'rate_limited' | 'timeout' | 'authentication' | 'unknown';

/**
 * Error information structure
 */
export interface ErrorInfo {
  type: ErrorType;
  status: number;
  message: string;
  details?: string;
}

/**
 * Map HTTP status codes to error types
 * 
 * @param statusCode - HTTP status code
 * @returns ErrorType for the status code
 */
export function mapStatusCodeToErrorType(statusCode: number): ErrorType {
  if (statusCode === 429) {
    return 'rate_limited';
  }
  if (statusCode === 408) {
    return 'timeout';
  }
  if (statusCode === 401 || statusCode === 403) {
    return 'authentication';
  }
  if (statusCode >= 500) {
    return 'server_error';
  }
  if (statusCode >= 400) {
    return 'client_error';
  }
  return 'unknown';
}

/**
 * Parse error response body
 * 
 * Attempts to parse JSON error responses, falls back to plain text
 * 
 * @param responseBody - Raw response body text
 * @returns ErrorInfo object with parsed message
 */
export function parseErrorResponse(responseBody: string): { message: string; details?: string } {
  try {
    const errorObj = JSON.parse(responseBody);
    
    // Try to extract message from common error formats
    if (errorObj.message) {
      return { message: errorObj.message, details: errorObj.error || undefined };
    }
    
    if (errorObj.error) {
      return { message: errorObj.error, details: errorObj.details || undefined };
    }
    
    // If JSON parsed but no recognizable structure
    return { message: responseBody, details: JSON.stringify(errorObj, null, 2) };
    
  } catch (e) {
    // Fallback to plain text if JSON parsing fails
    return { message: responseBody };
  }
}

/**
 * Generate actionable error message with remediation steps
 * 
 * @param statusCode - HTTP status code
 * @param errorType - Type of error
 * @param message - Error message from response
 * @returns Formatted error message with remediation steps
 */
export function generateErrorWithRemediation(
  statusCode: number,
  errorType: ErrorType,
  message: string
): string {
  const header = `API Request Failed`;
  const statusInfo = `Status: ${statusCode} (${errorType})`;
  const messagePart = `Message: ${message}`;
  
  // Generate remediation steps based on error type
  const remediation = getRemediationSteps(errorType, statusCode);
  
  return `${header}\n\n${statusInfo}\n\n${messagePart}\n\nRemediation Steps:\n${remediation}`;
}

/**
 * Get remediation steps for a given error type
 * 
 * @param errorType - Type of error
 * @param statusCode - HTTP status code (optional)
 * @returns Formatted remediation steps
 */
export function getRemediationSteps(
  errorType: ErrorType,
  statusCode?: number
): string {
  switch (errorType) {
    case 'rate_limited':
      return `1. Wait 30 seconds before retrying\n` +
             `2. Implement exponential backoff for subsequent requests\n` +
             `3. Check your request frequency (max: 100 requests/minute)\n` +
             `4. If using batch operations, reduce batch size`;
    
    case 'timeout':
      return `1. Check your network connection\n` +
             `2. Verify Headroom API is running and accessible\n` +
             `3. Try increasing the timeout setting\n` +
             `4. Check if API server is under heavy load`;
    
    case 'authentication':
      return `1. Verify HEADROOM_API_KEY environment variable is set\n` +
             `2. Check that your API key is valid and not expired\n` +
             `3. Ensure the API key has the required permissions\n` +
             `4. Try generating a new API key from Headroom settings`;
    
    case 'client_error':
      if (statusCode === 400) {
        return `1. Check that all required parameters are provided\n` +
               `2. Verify parameter formats match the API specification\n` +
               `3. Ensure tab IDs are valid strings\n` +
               `4. Check for invalid or unsupported parameter values`;
      }
      if (statusCode === 404) {
        return `1. Verify the endpoint URL is correct\n` +
               `2. Check that the requested resource exists\n` +
               `3. Confirm API version compatibility`;
      }
      return `1. Review your request parameters\n` +
             `2. Check the API documentation for correct usage\n` +
             `3. Verify all required fields are present and correctly formatted`;
    
    case 'server_error':
      return `1. Check Headroom API server status\n` +
             `2. Review server logs for detailed error information\n` +
             `3. Try the request again with exponential backoff\n` +
             `4. If issue persists, report to Headroom maintainers`;
    
    case 'unknown':
    default:
      return `1. Review the error message above\n` +
             `2. Check network connectivity\n` +
             `3. Verify API configuration\n` +
             `4. Consult Headroom documentation for troubleshooting`;
  }
}

/**
 * Handle API error and return formatted error object
 * 
 * @param statusCode - HTTP status code
 * @param errorType - Type of error
 * @param message - Error message
 * @returns Formatted error message with remediation
 */
export function handleApiError(
  statusCode: number,
  errorType: ErrorType,
  message: string
): Error {
  const fullMessage = generateErrorWithRemediation(statusCode, errorType, message);
  const error = new Error(fullMessage);
  error.name = 'HeadroomApiError';
  return error;
}

/**
 * Error handling utility class
 */
export class HeadroomApiError extends Error {
  constructor(
    public statusCode: number,
    public errorType: ErrorType,
    message: string,
    public details?: string
  ) {
    super(generateErrorWithRemediation(statusCode, errorType, message));
    this.name = 'HeadroomApiError';
  }

  /**
   * Create error from response
   */
  static fromResponse(statusCode: number, responseBody: string): HeadroomApiError {
    const errorInfo = parseErrorResponse(responseBody);
    const errorType = mapStatusCodeToErrorType(statusCode);
    return new HeadroomApiError(statusCode, errorType, errorInfo.message, errorInfo.details);
  }

  /**
   * Create rate limited error
   */
  static rateLimited(message?: string): HeadroomApiError {
    return new HeadroomApiError(429, 'rate_limited', message || 'Rate limit exceeded');
  }

  /**
   * Create timeout error
   */
  static timeout(message?: string): HeadroomApiError {
    return new HeadroomApiError(408, 'timeout', message || 'Request timeout');
  }

  /**
   * Create authentication error
   */
  static authentication(message?: string): HeadroomApiError {
    return new HeadroomApiError(401, 'authentication', message || 'Authentication failed');
  }
}

// Re-export for convenience
export { parseErrorResponse, mapStatusCodeToErrorType, generateErrorWithRemediation, getRemediationSteps };