/**
 * Converts a camelCase string to snake_case
 * @example
 * camelToSnakeCase('firstName') // returns 'first_name'
 * camelToSnakeCase('userId123') // returns 'user_id_123'
 */
export function camelToSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "");
}

/**
 * Converts a snake_case string to camelCase
 * @example
 * snakeToCamelCase('first_name') // returns 'firstName'
 * snakeToCamelCase('user_id_123') // returns 'userId123'
 */
export function snakeToCamelCase(str: string): string {
  return str.replace(/_([a-z0-9])/g, (match, char) => char.toUpperCase());
}

/**
 * Recursively converts all object keys from camelCase to snake_case
 */
export function convertKeysToSnakeCase<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === "object" && item !== null) {
        return convertKeysToSnakeCase(item);
      }
      return item;
    });
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnakeCase(key);
    const val = obj[key as keyof T];

    acc[snakeKey] =
      typeof val === "object" && val !== null
        ? convertKeysToSnakeCase(val)
        : val;

    return acc;
  }, {} as Record<string, any>);
}

/**
 * Recursively converts all object keys from snake_case to camelCase
 */
export function convertKeysToCamelCase<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === "object" && item !== null) {
        return convertKeysToCamelCase(item);
      }
      return item;
    });
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = snakeToCamelCase(key);
    const val = obj[key as keyof T];

    acc[camelKey] =
      typeof val === "object" && val !== null
        ? convertKeysToCamelCase(val)
        : val;

    return acc;
  }, {} as Record<string, any>);
}
