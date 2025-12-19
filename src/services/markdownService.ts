import fs from 'fs';
import matter from 'gray-matter';
import { resolveNotePath } from '../config/constants.js';
import { mergeTags } from '../utils/tagMerger.js';

/**
 * Reads a markdown file from the vault
 */
export function readMarkdownFile(notePath: string): string {
  const fullPath = resolveNotePath(notePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${notePath}`);
  }

  return fs.readFileSync(fullPath, 'utf-8');
}

/**
 * Parses markdown frontmatter and content
 */
export function parseMarkdownFrontmatter(content: string): { data: any; content: string } {
  try {
    return matter(content);
  } catch (error) {
    throw new Error(`Failed to parse frontmatter: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Updates a markdown file with new tags, merging with existing tags
 */
export function updateMarkdownTags(notePath: string, newTags: string[]): void {
  try {
    // Read the markdown file
    const content = readMarkdownFile(notePath);

    // Parse frontmatter
    const parsed = parseMarkdownFrontmatter(content);

    // Get existing tags
    const existingTags = Array.isArray(parsed.data.tags) ? parsed.data.tags : [];

    // Merge tags
    const mergedTags = mergeTags(existingTags, newTags);

    // Update frontmatter with merged tags
    parsed.data.tags = mergedTags;

    // Write back to file
    const fullPath = resolveNotePath(notePath);
    const updatedContent = matter.stringify(parsed.content, parsed.data);
    fs.writeFileSync(fullPath, updatedContent, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to update tags for "${notePath}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the current tags from a markdown file
 */
export function getMarkdownTags(notePath: string): string[] {
  try {
    const content = readMarkdownFile(notePath);
    const parsed = parseMarkdownFrontmatter(content);
    return Array.isArray(parsed.data.tags) ? parsed.data.tags : [];
  } catch {
    return [];
  }
}
