// A more robust implementation of the Hungarian (Munkres) algorithm.
// This version is based on a standard, well-documented step-by-step
// approach that is less prone to infinite loops.

interface Assignment {
  driver: number;
  passenger: number;
}

interface HungarianOutput {
  assignments: Assignment[];
  totalCost: number;
}

export const hungarian = (costMatrix: number[][]): HungarianOutput => {
  const originalCostMatrix = costMatrix.map(row => [...row]);
  const n = Math.max(costMatrix.length, costMatrix[0]?.length || 0);

  // Pad matrix to be square
  const matrix = Array(n).fill(0).map(() => Array(n).fill(Infinity));
  for (let i = 0; i < costMatrix.length; i++) {
    for (let j = 0; j < (costMatrix[0]?.length || 0); j++) {
      matrix[i][j] = costMatrix[i][j];
    }
  }

  // Step 1: Subtract row minima
  for (let i = 0; i < n; i++) {
    const min = Math.min(...matrix[i].filter(isFinite));
    if (isFinite(min)) {
      for (let j = 0; j < n; j++) {
        if (isFinite(matrix[i][j])) matrix[i][j] -= min;
      }
    }
  }

  // Step 2: Subtract column minima
  for (let j = 0; j < n; j++) {
    const col = matrix.map(row => row[j]);
    const min = Math.min(...col.filter(isFinite));
    if (isFinite(min)) {
      for (let i = 0; i < n; i++) {
        if (isFinite(matrix[i][j])) matrix[i][j] -= min;
      }
    }
  }

  const masks = Array(n).fill(0).map(() => Array(n).fill(0)); // 1 = starred, 2 = primed
  const rowCover = Array(n).fill(false);
  const colCover = Array(n).fill(false);
  let pathStart: { row: number, col: number } | null = null;

  // Initial starring of zeros
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 0 && !rowCover[i] && !colCover[j]) {
        masks[i][j] = 1;
        rowCover[i] = true;
        colCover[j] = true;
      }
    }
  }
  rowCover.fill(false);
  colCover.fill(false);

  let step = 1;
  while (step !== 0) {
    switch (step) {
      case 1:
        colCover.fill(false);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (masks[i][j] === 1) colCover[j] = true;
          }
        }
        const coveredCount = colCover.filter(c => c).length;
        step = coveredCount === n ? 0 : 2;
        break;
      
      case 2:
        let zero = findUncoveredZero(matrix, rowCover, colCover);
        if (!zero) {
          step = 6;
          break;
        }
        masks[zero.row][zero.col] = 2; // Prime the zero
        const starCol = findStarInRow(masks, zero.row);
        if (starCol !== -1) {
          rowCover[zero.row] = true;
          colCover[starCol] = false;
          step = 2;
        } else {
          pathStart = zero;
          step = 3;
        }
        break;

      case 3:
        const path = findAugmentingPath(masks, pathStart!);
        path.forEach(({ row, col }) => {
          masks[row][col] = masks[row][col] === 1 ? 0 : 1;
        });
        // Clear covers and primes
        rowCover.fill(false);
        colCover.fill(false);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (masks[i][j] === 2) masks[i][j] = 0;
          }
        }
        step = 1;
        break;

      case 6: // Note: This is step 4 in some literature
        const minVal = findMinUncoveredValue(matrix, rowCover, colCover);
        if (!isFinite(minVal)) {
            step = 0; // No more valid assignments
            break;
        }
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (rowCover[i]) matrix[i][j] += minVal;
            if (!colCover[j]) matrix[i][j] -= minVal;
          }
        }
        step = 2;
        break;
    }
  }

  const assignments: Assignment[] = [];
  let totalCost = 0;
  for (let i = 0; i < costMatrix.length; i++) {
    for (let j = 0; j < (costMatrix[0]?.length || 0); j++) {
      if (masks[i][j] === 1) {
        assignments.push({ driver: i, passenger: j });
        totalCost += originalCostMatrix[i][j];
      }
    }
  }

  return { assignments, totalCost };
};

// Helper functions for the algorithm
function findUncoveredZero(matrix: number[][], rowCover: boolean[], colCover: boolean[]): { row: number, col: number } | null {
  for (let i = 0; i < matrix.length; i++) {
    if (!rowCover[i]) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === 0 && !colCover[j]) {
          return { row: i, col: j };
        }
      }
    }
  }
  return null;
}

function findStarInRow(masks: number[][], row: number): number {
  return masks[row].indexOf(1);
}

function findStarInCol(masks: number[][], col: number): number {
    for (let i = 0; i < masks.length; i++) {
        if (masks[i][col] === 1) return i;
    }
    return -1;
}

function findPrimeInRow(masks: number[][], row: number): number {
    return masks[row].indexOf(2);
}

function findAugmentingPath(masks: number[][], start: { row: number, col: number }): { row: number, col: number }[] {
    const path = [start];
    let currentRow = start.row;
    let currentCol = start.col;

    while (true) {
        const starRow = findStarInCol(masks, currentCol);
        if (starRow === -1) break;
        path.push({ row: starRow, col: currentCol });
        currentRow = starRow;
        const primeCol = findPrimeInRow(masks, currentRow);
        path.push({ row: currentRow, col: primeCol });
        currentCol = primeCol;
    }
    return path;
}

function findMinUncoveredValue(matrix: number[][], rowCover: boolean[], colCover: boolean[]): number {
    let minVal = Infinity;
    for (let i = 0; i < matrix.length; i++) {
        if (!rowCover[i]) {
            for (let j = 0; j < matrix[i].length; j++) {
                if (!colCover[j]) {
                    minVal = Math.min(minVal, matrix[i][j]);
                }
            }
        }
    }
    return minVal;
}