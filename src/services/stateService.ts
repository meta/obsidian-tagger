import fs from 'fs';
import { STATES_FILE } from '../config/constants.js';
import { StateRecord } from '../models/types.js';

/**
 * Loads the state record from states.json
 * If the file is corrupted or missing, returns a fresh state
 */
export function loadState(): StateRecord {
  try {
    if (!fs.existsSync(STATES_FILE)) {
      // Create empty state file if it doesn't exist
      const emptyState: StateRecord = { processedYamls: [] };
      saveState(emptyState);
      return emptyState;
    }

    const content = fs.readFileSync(STATES_FILE, 'utf-8');
    const state = JSON.parse(content) as StateRecord;

    // Validate structure
    if (!state.processedYamls || !Array.isArray(state.processedYamls)) {
      console.warn('Warning: states.json has invalid structure, resetting to empty state');
      return { processedYamls: [] };
    }

    return state;
  } catch (error) {
    console.warn('Warning: Failed to load states.json, resetting to empty state');
    return { processedYamls: [] };
  }
}

/**
 * Saves the state record to states.json
 */
export function saveState(state: StateRecord): void {
  try {
    const content = JSON.stringify(state, null, 2);
    fs.writeFileSync(STATES_FILE, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save state: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Checks if a YAML file has already been processed
 */
export function isProcessed(yamlFile: string, state: StateRecord): boolean {
  return state.processedYamls.includes(yamlFile);
}

/**
 * Marks a YAML file as processed and saves the state
 */
export function markProcessed(yamlFile: string, state: StateRecord): void {
  if (!state.processedYamls.includes(yamlFile)) {
    state.processedYamls.push(yamlFile);
    saveState(state);
  }
}
