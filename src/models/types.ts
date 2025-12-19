export interface YamlEntry {
  note: string;        // e.g., "Dailies/2025-11-03.md"
  tags: string[];      // e.g., ["work", "meetings"]
}

export interface YamlConfig {
  entries: YamlEntry[];
}

export interface StateRecord {
  processedYamls: string[];  // Filenames of processed YAML files
}

export interface ProcessingResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ note: string; error: string }>;
}
