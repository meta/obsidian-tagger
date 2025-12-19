import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { YAMLS_DIR } from '../config/constants.js';
import { YamlConfig, StateRecord } from '../models/types.js';
import { isProcessed } from './stateService.js';

/**
 * Lists all YAML files in the yamls directory
 */
export function listYamlFiles(): string[] {
  try {
    if (!fs.existsSync(YAMLS_DIR)) {
      console.warn(`Warning: yamls directory not found at ${YAMLS_DIR}`);
      return [];
    }

    const files = fs.readdirSync(YAMLS_DIR);
    return files.filter(file =>
      file.endsWith('.yaml') || file.endsWith('.yml')
    );
  } catch (error) {
    throw new Error(`Failed to list YAML files: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Filters YAML files to only return unprocessed ones
 */
export function getUnprocessedYamls(allYamls: string[], state: StateRecord): string[] {
  return allYamls.filter(yamlFile => !isProcessed(yamlFile, state));
}

/**
 * Parses a YAML file and returns the configuration
 */
export function parseYamlConfig(yamlFile: string): YamlConfig {
  try {
    const yamlPath = path.join(YAMLS_DIR, yamlFile);

    if (!fs.existsSync(yamlPath)) {
      throw new Error(`YAML file not found: ${yamlPath}`);
    }

    const content = fs.readFileSync(yamlPath, 'utf-8');
    const parsed = yaml.load(content) as any;

    if (!validateYamlConfig(parsed)) {
      throw new Error('Invalid YAML structure: missing "entries" array');
    }

    return parsed as YamlConfig;
  } catch (error) {
    throw new Error(`Failed to parse YAML file "${yamlFile}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validates that the parsed YAML has the correct structure
 */
export function validateYamlConfig(config: any): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }

  if (!Array.isArray(config.entries)) {
    return false;
  }

  // Validate each entry has required fields
  for (const entry of config.entries) {
    if (!entry.note || typeof entry.note !== 'string') {
      return false;
    }
    if (!Array.isArray(entry.tags)) {
      return false;
    }
  }

  return true;
}

/**
 * Counts the number of entries in a YAML file
 */
export function countYamlEntries(yamlFile: string): number {
  try {
    const config = parseYamlConfig(yamlFile);
    return config.entries.length;
  } catch {
    return 0;
  }
}
