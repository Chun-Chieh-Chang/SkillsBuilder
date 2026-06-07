/**
 * Headroom API Parameter Validators
 * 
 * This module provides validation functions for all Headroom API operations.
 * Each validator checks required parameters and returns descriptive error messages
 * with parameter format examples.
 * 
 * @module headroom-api/validators
 */

/**
 * Close operation validation
 * 
 * Either tab_ids OR group must be provided (but not both)
 */
export function validateCloseParams(params: { tab_ids?: string[]; group?: string }): string | null {
  // Check if both are provided
  if (params.tab_ids && params.group) {
    return `Error: Cannot provide both 'tab_ids' and 'group'. Please provide either:\n` +
      `  - tab_ids: string[]  (e.g., ["tab-123", "tab-456"])\n` +
      `  - group: string      (e.g., "Development")`;
  }

  // Check if neither is provided
  if (!params.tab_ids && !params.group) {
    return `Error: Either 'tab_ids' or 'group' is required. Please provide one of:\n` +
      `  - tab_ids: string[]  (e.g., ["tab-123", "tab-456"])\n` +
      `  - group: string      (e.g., "Development")`;
  }

  // Validate tab_ids type if provided
  if (params.tab_ids && !Array.isArray(params.tab_ids)) {
    return `Error: 'tab_ids' must be an array of strings. Example: ["tab-123", "tab-456"]`;
  }

  // Validate tab_ids array elements if provided
  if (params.tab_ids && params.tab_ids.length > 0) {
    const invalidElements = params.tab_ids.filter(item => typeof item !== 'string');
    if (invalidElements.length > 0) {
      return `Error: All elements in 'tab_ids' must be strings. Found invalid elements: ${JSON.stringify(invalidElements)}`;
    }
  }

  // Validate group type if provided
  if (params.group && typeof params.group !== 'string') {
    return `Error: 'group' must be a string. Example: "Development"`;
  }

  return null;
}

/**
 * Group operation validation
 * 
 * Both tab_ids AND target_group are required
 */
export function validateGroupParams(params: { tab_ids: string[]; target_group: string }): string | null {
  // Check if tab_ids is missing or not an array
  if (!params.tab_ids || !Array.isArray(params.tab_ids)) {
    return `Error: 'tab_ids' is required and must be an array of strings. Example: ["tab-123", "tab-456"]`;
  }

  // Validate tab_ids array elements
  if (params.tab_ids.length > 0) {
    const invalidElements = params.tab_ids.filter(item => typeof item !== 'string');
    if (invalidElements.length > 0) {
      return `Error: All elements in 'tab_ids' must be strings. Found invalid elements: ${JSON.stringify(invalidElements)}`;
    }
  }

  // Check if target_group is missing
  if (!params.target_group) {
    return `Error: 'target_group' is required. Example: "Research"`;
  }

  // Validate target_group type
  if (typeof params.target_group !== 'string') {
    return `Error: 'target_group' must be a string. Example: "Research"`;
  }

  return null;
}

/**
 * Tag operation validation
 * 
 * tab_ids is required AND either tags OR remove_tags must be provided
 */
export function validateTagParams(params: { tab_ids: string[]; tags?: string[]; remove_tags?: string[] }): string | null {
  // Check if tab_ids is missing or not an array
  if (!params.tab_ids || !Array.isArray(params.tab_ids)) {
    return `Error: 'tab_ids' is required and must be an array of strings. Example: ["tab-123", "tab-456"]`;
  }

  // Validate tab_ids array elements
  if (params.tab_ids.length > 0) {
    const invalidElements = params.tab_ids.filter(item => typeof item !== 'string');
    if (invalidElements.length > 0) {
      return `Error: All elements in 'tab_ids' must be strings. Found invalid elements: ${JSON.stringify(invalidElements)}`;
    }
  }

  // Check if neither tags nor remove_tags is provided
  if (!params.tags && !params.remove_tags) {
    return `Error: Either 'tags' or 'remove_tags' must be provided. Please specify one of:\n` +
      `  - tags: string[]      (e.g., ["important", "work"])\n` +
      `  - remove_tags: string[] (e.g., ["archive"])`;
  }

  // Check if both tags and remove_tags are provided (not allowed)
  if (params.tags && params.remove_tags) {
    return `Error: Cannot provide both 'tags' and 'remove_tags'. Please specify only one:\n` +
      `  - tags: string[]      (e.g., ["important", "work"])\n` +
      `  - remove_tags: string[] (e.g., ["archive"])`;
  }

  // Validate tags type if provided
  if (params.tags && !Array.isArray(params.tags)) {
    return `Error: 'tags' must be an array of strings. Example: ["important", "work"]`;
  }

  // Validate tags array elements if provided
  if (params.tags && params.tags.length > 0) {
    const invalidElements = params.tags.filter(item => typeof item !== 'string');
    if (invalidElements.length > 0) {
      return `Error: All elements in 'tags' must be strings. Found invalid elements: ${JSON.stringify(invalidElements)}`;
    }
  }

  // Validate remove_tags type if provided
  if (params.remove_tags && !Array.isArray(params.remove_tags)) {
    return `Error: 'remove_tags' must be an array of strings. Example: ["archive"]`;
  }

  // Validate remove_tags array elements if provided
  if (params.remove_tags && params.remove_tags.length > 0) {
    const invalidElements = params.remove_tags.filter(item => typeof item !== 'string');
    if (invalidElements.length > 0) {
      return `Error: All elements in 'remove_tags' must be strings. Found invalid elements: ${JSON.stringify(invalidElements)}`;
    }
  }

  return null;
}

/**
 * Validate action type parameter
 */
export function validateAction(action: string): string | null {
  const validActions = ['close', 'group', 'tag'];
  
  if (!action) {
    return `Error: 'action' parameter is required. Valid actions: ${validActions.join(', ')}`;
  }

  if (!validActions.includes(action)) {
    return `Error: Invalid action '${action}'. Valid actions: ${validActions.join(', ')}`;
  }

  return null;
}