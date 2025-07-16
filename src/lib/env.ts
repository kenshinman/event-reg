// src/lib/env.ts
// Centralized and type-safe environment variable loader for the project

/**
 * Loads and exports environment variables so you can import them directly instead of using process.env everywhere.
 * Throws an error if any required variable is missing.
 */

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but was not found.`);
  }
  return value;
}

export const GOOGLE_SHEET_ID = getEnvVar('GOOGLE_SHEET_ID');
export const GOOGLE_SERVICE_ACCOUNT_EMAIL = getEnvVar('GOOGLE_SERVICE_ACCOUNT_EMAIL');
export const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = getEnvVar('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
