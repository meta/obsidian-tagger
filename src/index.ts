#!/usr/bin/env node

import fs from 'fs';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { VAULT_PATH, normalizePath } from './config/constants.js';
import { loadState, markProcessed } from './services/stateService.js';
import {
  listYamlFiles,
  getUnprocessedYamls,
  parseYamlConfig,
  countYamlEntries,
} from './services/yamlService.js';
import { updateMarkdownTags, getMarkdownTags } from './services/markdownService.js';
import { ProcessingResult } from './models/types.js';

/**
 * Validates the environment setup
 */
function validateEnvironment(): void {
  if (!VAULT_PATH) {
    console.error(chalk.red('Error: OBSIDIAN_VAULT_PATH environment variable is not set'));
    console.log(chalk.yellow('\nPlease set the environment variable:'));
    console.log(chalk.cyan('  export OBSIDIAN_VAULT_PATH=/path/to/your/obsidian/vault'));
    process.exit(1);
  }

  const normalizedPath = normalizePath(VAULT_PATH);
  if (!fs.existsSync(normalizedPath)) {
    console.error(chalk.red(`Error: Vault path does not exist: ${normalizedPath}`));
    process.exit(1);
  }

  if (!fs.statSync(normalizedPath).isDirectory()) {
    console.error(chalk.red(`Error: Vault path is not a directory: ${normalizedPath}`));
    process.exit(1);
  }
}

/**
 * Prompts user to select YAML files to process
 */
async function selectYamlFiles(unprocessedYamls: string[]): Promise<string[]> {
  const choices = unprocessedYamls.map(yamlFile => {
    const count = countYamlEntries(yamlFile);
    return {
      name: `${yamlFile} (${count} notes)`,
      value: yamlFile,
    };
  });

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'yamlFiles',
      message: 'Select YAML files to process:',
      choices,
      validate: (input: string[]) => {
        if (input.length === 0) {
          return 'Please select at least one YAML file';
        }
        return true;
      },
    },
  ]);

  return answers.yamlFiles;
}

/**
 * Processes a single YAML file
 */
async function processYamlFile(yamlFile: string): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    console.log(chalk.cyan(`\nProcessing ${yamlFile}...`));
    const config = parseYamlConfig(yamlFile);

    for (const entry of config.entries) {
      try {
        // Get existing tags before update
        const existingTags = getMarkdownTags(entry.note);
        const existingCount = existingTags.length;

        // Update the markdown file
        updateMarkdownTags(entry.note, entry.tags);

        // Get tags after update to show what changed
        const updatedTags = getMarkdownTags(entry.note);
        const newTagsCount = updatedTags.length - existingCount;

        if (existingCount === 0) {
          console.log(chalk.green(`  ✓ ${entry.note} - Added ${updatedTags.length} tags`));
        } else {
          console.log(
            chalk.green(
              `  ✓ ${entry.note} - Added ${newTagsCount} new tags (${existingCount} existing)`
            )
          );
        }

        result.success++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check if it's a "file not found" error
        if (errorMessage.includes('File not found')) {
          console.log(chalk.yellow(`  ! ${entry.note} - File not found, skipping`));
          result.skipped++;
        } else {
          console.log(chalk.red(`  ✗ ${entry.note} - ${errorMessage}`));
          result.failed++;
          result.errors.push({ note: entry.note, error: errorMessage });
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Failed to process ${yamlFile}: ${errorMessage}`));
    throw error;
  }

  return result;
}

/**
 * Displays a summary of processing results
 */
function displaySummary(results: ProcessingResult[]): void {
  const totals = results.reduce(
    (acc, result) => ({
      success: acc.success + result.success,
      failed: acc.failed + result.failed,
      skipped: acc.skipped + result.skipped,
      errors: [...acc.errors, ...result.errors],
    }),
    { success: 0, failed: 0, skipped: 0, errors: [] as Array<{ note: string; error: string }> }
  );

  console.log(chalk.bold('\n═══════════════════════════════════════'));
  console.log(chalk.bold('Summary:'));
  console.log(chalk.green(`  ✓ Success: ${totals.success} notes updated`));

  if (totals.skipped > 0) {
    console.log(chalk.yellow(`  ! Skipped: ${totals.skipped} notes (file not found)`));
  }

  if (totals.failed > 0) {
    console.log(chalk.red(`  ✗ Failed: ${totals.failed} notes`));

    if (totals.errors.length > 0) {
      console.log(chalk.red('\nErrors:'));
      totals.errors.forEach(({ note, error }) => {
        console.log(chalk.red(`  - ${note}: ${error}`));
      });
    }
  }

  console.log(chalk.bold('═══════════════════════════════════════\n'));
}

/**
 * Main entry point
 */
async function main() {
  try {
    console.log(chalk.bold.cyan('\n🏷️  Obsidian Tagger CLI\n'));

    // Validate environment
    validateEnvironment();

    // Load state
    const state = loadState();

    // List YAML files
    const allYamls = listYamlFiles();

    if (allYamls.length === 0) {
      console.log(chalk.yellow('No YAML files found in the yamls/ directory'));
      process.exit(0);
    }

    // Filter to unprocessed YAMLs
    const unprocessedYamls = getUnprocessedYamls(allYamls, state);

    if (unprocessedYamls.length === 0) {
      console.log(chalk.green('All YAML files have been processed!'));
      console.log(chalk.dim(`Total YAML files: ${allYamls.length}`));
      process.exit(0);
    }

    // Show info
    console.log(chalk.cyan(`Found ${unprocessedYamls.length} unprocessed YAML file(s):\n`));
    unprocessedYamls.forEach(yamlFile => {
      const count = countYamlEntries(yamlFile);
      console.log(chalk.dim(`  • ${yamlFile} (${count} notes)`));
    });
    console.log();

    // Select YAML files
    const selectedYamls = await selectYamlFiles(unprocessedYamls);

    if (selectedYamls.length === 0) {
      console.log(chalk.yellow('No YAML files selected'));
      process.exit(0);
    }

    // Process each selected YAML
    const results: ProcessingResult[] = [];

    for (const yamlFile of selectedYamls) {
      const result = await processYamlFile(yamlFile);
      results.push(result);

      // Mark as processed
      markProcessed(yamlFile, state);
    }

    // Display summary
    displaySummary(results);

    console.log(chalk.green('State saved. Run again to see only unprocessed YAML files.'));
  } catch (error) {
    console.error(chalk.red('An unexpected error occurred:'));
    console.error(error);
    process.exit(1);
  }
}

main();
