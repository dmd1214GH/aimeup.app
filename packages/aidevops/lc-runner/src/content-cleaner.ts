/**
 * Utility functions for cleaning content before uploading to Linear
 */

/**
 * Removes metadata sections and duplicate title headers from issue body content
 * @param content The raw issue body content
 * @returns The cleaned content with metadata and duplicate titles removed
 */
export function cleanIssueBody(content: string): string {
  if (!content) {
    return content;
  }

  let cleaned = content;

  // Remove all metadata sections (can appear multiple times)
  // Split into lines and process line by line
  const lines = content.split('\n');
  const resultLines: string[] = [];
  let inMetadataSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check if we're entering a metadata section
    if (trimmedLine.match(/^##\s+Metadata\s*$/i)) {
      inMetadataSection = true;
      continue;
    }

    // Check if we're entering a new section (exits metadata)
    if (inMetadataSection && trimmedLine.match(/^##\s+/)) {
      inMetadataSection = false;
      // Don't continue - we want to include this line
    }

    // Add line if not in metadata section
    if (!inMetadataSection) {
      resultLines.push(line);
    }
  }

  cleaned = resultLines.join('\n');

  // Remove the first title header (# Title) since Linear displays it separately
  // Also remove any duplicate title headers
  const cleanedLines = cleaned.split('\n');
  const filteredLines: string[] = [];
  let removedLineIndices = new Set<number>();
  let foundFirstTitle = false;

  for (let i = 0; i < cleanedLines.length; i++) {
    const line = cleanedLines[i];
    const trimmedLine = line.trim();

    // Check if this line is a level-1 heading (# Title)
    if (trimmedLine.match(/^#\s+.+/)) {
      if (!foundFirstTitle) {
        // This is the first title - remove it
        foundFirstTitle = true;
        removedLineIndices.add(i);
        // Also remove trailing empty lines after the title
        let j = i + 1;
        while (j < cleanedLines.length && cleanedLines[j].trim() === '') {
          removedLineIndices.add(j);
          j++;
        }
      } else {
        // This is a duplicate title - also remove it
        removedLineIndices.add(i);
        // Also remove trailing empty lines after the duplicate
        let j = i + 1;
        while (j < cleanedLines.length && cleanedLines[j].trim() === '') {
          removedLineIndices.add(j);
          j++;
        }
      }
    }
  }

  // Filter out removed lines
  for (let i = 0; i < cleanedLines.length; i++) {
    if (!removedLineIndices.has(i)) {
      filteredLines.push(cleanedLines[i]);
    }
  }

  cleaned = filteredLines.join('\n');

  // Trim any excessive whitespace at the end
  cleaned = cleaned.trimEnd();

  return cleaned;
}

/**
 * Removes operation header lines from comment content
 * @param content The raw comment content
 * @returns The cleaned content with operation headers removed
 */
export function cleanCommentContent(content: string): string {
  if (!content) {
    return content;
  }

  // Split content into lines
  const lines = content.split('\n');
  const filteredLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    // Check if we're entering or leaving a code block
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      filteredLines.push(line);
      continue;
    }

    // If we're in a code block, keep the line as-is
    if (inCodeBlock) {
      filteredLines.push(line);
      continue;
    }

    // Check if the line starts with "# Operation Log for" (with optional whitespace)
    if (!line.trim().match(/^#\s+Operation\s+Log\s+for\s+/i)) {
      filteredLines.push(line);
    }
  }

  // Join lines and trim trailing whitespace
  let result = filteredLines.join('\n').trimEnd();

  // Clean up any leading blank lines that may have been left after removing headers
  while (result.startsWith('\n')) {
    result = result.substring(1);
  }

  return result;
}
