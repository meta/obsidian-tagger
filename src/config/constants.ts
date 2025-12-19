import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variable for Obsidian vault path
export const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH;

// Project directories
export const PROJECT_ROOT = path.join(__dirname, '../..');
export const YAMLS_DIR = path.join(PROJECT_ROOT, 'yamls');
export const STATES_FILE = path.join(PROJECT_ROOT, 'states.json');

/**
 * Normalizes a path by removing trailing slashes
 */
export function normalizePath(p: string): string {
  return p.replace(/\/+$/, '');
}

/**
 * Resolves the full path to a note file in the vault
 */
export function resolveNotePath(notePath: string): string {
  if (!VAULT_PATH) {
    throw new Error('OBSIDIAN_VAULT_PATH environment variable is not set');
  }
  return path.join(normalizePath(VAULT_PATH), notePath);
}
