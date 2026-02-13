/**
 * Utility functions for converting between camelCase and snake_case
 * Used for Supabase operations where DB uses snake_case but code uses camelCase
 */

/**
 * Convert a camelCase string to snake_case
 * @param str - The camelCase string to convert
 * @returns The snake_case version of the string
 * 
 * @example
 * camelToSnake('userId') // 'user_id'
 * camelToSnake('createdAt') // 'created_at'
 * camelToSnake('totalQuestions') // 'total_questions'
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert an object with camelCase keys to snake_case keys
 * @param obj - The object to convert
 * @returns A new object with snake_case keys
 * 
 * @example
 * toSnakeCase({ userId: 1, createdAt: new Date() })
 * // { user_id: 1, created_at: Date }
 */
export function toSnakeCase<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = value;
  }

  return result;
}

/**
 * Convert a snake_case string to camelCase
 * @param str - The snake_case string to convert
 * @returns The camelCase version of the string
 * 
 * @example
 * snakeToCamel('user_id') // 'userId'
 * snakeToCamel('created_at') // 'createdAt'
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert an object with snake_case keys to camelCase keys
 * @param obj - The object to convert
 * @returns A new object with camelCase keys
 * 
 * @example
 * toCamelCase({ user_id: 1, created_at: new Date() })
 * // { userId: 1, createdAt: Date }
 */
export function toCamelCase<T extends Record<string, any>>(
  obj: T
): Record<string, any> {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = value;
  }

  return result;
}
