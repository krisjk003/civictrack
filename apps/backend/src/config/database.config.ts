// src/config/database.config.ts

/**
 * Centralized Firestore collection name constants.
 * Never hardcode collection names inline — always import from here.
 */
export const Collections = {
  USERS: 'users',
  HAZARDS: 'hazards',
  ADMINS: 'admins',
  AUDIT_LOGS: 'audit_logs',
} as const;

export type CollectionName = (typeof Collections)[keyof typeof Collections];