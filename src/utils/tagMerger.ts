/**
 * Merges existing tags with new tags, removing duplicates
 * Preserves order: existing tags first, then new tags
 * Uses case-sensitive comparison
 */
export function mergeTags(existingTags: string[], newTags: string[]): string[] {
  // Handle empty arrays
  if (!existingTags || existingTags.length === 0) {
    return deduplicateTags(newTags || []);
  }

  if (!newTags || newTags.length === 0) {
    return deduplicateTags(existingTags);
  }

  // Create a Set for fast lookup
  const existingSet = new Set(existingTags);

  // Add only new tags that don't exist yet
  const uniqueNewTags = newTags.filter(tag => !existingSet.has(tag));

  // Combine existing tags with unique new tags
  return [...existingTags, ...uniqueNewTags];
}

/**
 * Removes duplicate tags from an array (case-sensitive)
 * Preserves the order of first occurrence
 */
export function deduplicateTags(tags: string[]): string[] {
  if (!tags || tags.length === 0) {
    return [];
  }

  return Array.from(new Set(tags));
}
