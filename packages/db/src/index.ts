// Re-export everything from schema
export * from './schema/index.js';

// Re-export database client
export { db, client } from './client.js';
export type { Database } from './client.js';

// Export drizzle utilities
export { eq, and, or, desc, asc, sql, inArray, notInArray, isNull, isNotNull, ilike, gte, lte, gt, lt, count } from 'drizzle-orm';
