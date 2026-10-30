/**
 * Generates an SVG 2D QR-style data matrix pattern for electronic component bin & drawer labels
 */

export function generateQrMatrix(text: string, size: number = 21): boolean[][] {
  const matrix: boolean[][] = Array(size)
    .fill(false)
    .map(() => Array(size).fill(false));

  // Helper to place finder pattern (7x7) at (row, col)
  function placeFinder(r: number, c: number) {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 ||
          i === 6 ||
          j === 0 ||
          j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          matrix[r + i][c + j] = true;
        } else {
          matrix[r + i][c + j] = false;
        }
      }
    }
  }

  // Place 3 standard finder patterns
  placeFinder(0, 0); // Top-left
  placeFinder(0, size - 7); // Top-right
  placeFinder(size - 7, 0); // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Hash the text string to deterministically fill data modules
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Deterministic pseudo-random fill based on hash
  let seed = Math.abs(hash) || 12345;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (inTopLeft || inTopRight || inBottomLeft || inTiming) continue;

      seed = (seed * 9301 + 49297) % 233280;
      matrix[r][c] = seed / 233280 > 0.48;
    }
  }

  return matrix;
}
