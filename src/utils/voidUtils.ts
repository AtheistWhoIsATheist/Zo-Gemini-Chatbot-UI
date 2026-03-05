
import { Node, VoidBlock } from '../data/corpus';

/**
 * MIGRATION UTILITY
 * Wraps existing string content into a default text block.
 */
export function migrateContentToBlocks(content: string | undefined): VoidBlock[] {
  if (!content) return [];
  
  // If it looks like it's already JSON blocks (unlikely given previous type, but good for safety)
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed[0]?.type) {
      return parsed as VoidBlock[];
    }
  } catch (e) {
    // Not JSON, proceed as string
  }

  return [
    {
      id: `block_${Date.now()}_migration`,
      type: 'text',
      content: content,
      metadata: {
        lastEdited: Date.now(),
        sentiment: 'neutral'
      }
    }
  ];
}

/**
 * Helper to extract plain text from blocks for indexing/display.
 */
export function blocksToString(blocks: VoidBlock[] | undefined): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.map(b => b.content).join('\n\n');
}

/**
 * Helper to generate a unique ID for blocks
 */
export function generateBlockId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
