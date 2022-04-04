/**
 * @file lap-ts
 * @description Typescript version of Jonker-Volgenant Algorithm.
 * @author John C. Scott
 * @version 1.0.0
 *
 * @example
 * const n = 3, costs = [[1, 2, 3], [4, 2, 1], [2, 2, 2]];
 * let solution = lap(n, costs);
 * console.info(solution);
 * /**
 * * {
 * *   cost: 4,
 * *   row: Int32Array(3) [ 0, 2, 1 ],
 * *   col: Int32Array(3) [ 0, 2, 1 ],
 * *   u: Float64Array(3) [
 * *     2.0006333333333335,
 * *     2.0006333333333335,
 * *     3.001266666666667
 * *   ],
 * *   v: Float64Array(3) [
 * *     -1.0006333333333335,
 * *     -1.001266666666667,
 * *     -1.0006333333333335
 * *   ]
 * * }
 * *\/
 *
 * lap.cpp
 * version 1.0 - 4 September 1996
 * author: Roy Jonker @ MagicLogic Optimization Inc.
 * e-mail: roy_jonker@magiclogic.com
 * Code for Linear Assignment Problem, according to
 * "A Shortest Augmenting Path Algorithm for Dense and Sparse Linear Assignment Problems," Computing 38, 325-340, 1987 by R. Jonker and A. Volgenant, University of Amsterdam.
 *
 * PORTED TO JAVASCRIPT 2017-01-02 by Philippe Riviere(fil@rezo.net).
 * CHANGED 2016-05-13 by Yong Yang(yongyanglink@gmail.com) in column reduction
 * part according to
 * matlab version of LAPJV algorithm(Copyright (c) 2010, Yi Cao All rights reserved)--
 * https://www.mathworks.com/matlabcentral/fileexchange/26836-lapjv-jonker-volgenant-algorithm-for-linear-assignment-problem-v3-0:
 */

/**
 * @description Interface for ILap
 * cost: number;
 * row: Int32Array;
 * col: Int32Array;
 * u: Float64Array;
 * v: Float64Array;
 */
interface ILap {
	cost: number;
	row: Int32Array;
	col: Int32Array;
	u: Float64Array;
	v: Float64Array;
};

/**
 * Sum up the costMatrix. Returns floating point numbers; a C++ BIG equivalent and
 * an "epsilon" to reverse BIG for math and comparisons.
 * @param dim number - dimension of the matrix
 * @param costMatrix number[][] - matrix to store all the costs from vertex i to vertex j
 * @returns number[]
 */
const sumUp = (
	dim: number,
	costMatrix: number[][]
): number[] => {
	let sum = 0;
	for (let i = 0; i < dim; i++) {
		for (let j = 0; j < dim; j++) {
			sum += costMatrix[i][j];
		}
	}
	return [10000 * (sum / dim), (sum / dim) / 10000];
};

/**
 * This function is the Jonker-Volgenant shortest augmenting path algorithm to solve the assignment problem.
 * It's O(n^2), where Hungarian Algorithm, the most common algorithm for assignment problems, is O(n^3).
 * @param dim number - dimension of the matrix
 * @param costMatrix number[][] - matrix to store all the costs from vertex i to vertex j
 * @returns ILap
 */
const lap = (
	dim: number,
	costMatrix: number[][]
): ILap => {
	const [BIG, epsilon] = sumUp(dim, costMatrix);
	const colsol = new Int32Array(dim), // column assigned to row in solution
		rowsol = new Int32Array(dim), // row assigned to column in solution
		u = new Float64Array(dim), // dual variables, row reduction numbers
		v = new Float64Array(dim); // dual variables, column reduction numbers
	let unassignedfound;

	// row variables
	let i, imin, numfree = 0, prvnumfree, f, i0, k, freerow;

	// col variables
	let j, j1, j2 = 0, endofpath, last = 0, low, up;

	// cost variables.
	let min, usubmin, h, umin, v2;

	// list of unassigned rows.
	let free = new Array(dim);
	// list of columns to be scanned in various ways.
	let collist = new Array(dim);
	// counts how many times a row could be assigned. Pre-fill '0'.
	let matches = new Array(dim).fill(0);
	// 'cost-distance' in augmenting path calculation.
	let d = new Array(dim);
	// row-predecessor of column in augmenting/alternating path.
	let pred = new Array(dim);

	// COLUMN REDUCTION
	// reverse order gives better results.
	for (j = dim - 1; j >= 0; j--) {
		// find minimum cost over rows.
		min = costMatrix[0][j];
		min = 0;
		imin = 0;
		for (i = 1; i < dim; i++) {
			if (costMatrix[i][j] < min) {
				min = costMatrix[i][j];
				imin = i;
			}
		}
		v[j] = min;
		if (++matches[imin] == 1) {
			// init assignment if minimum row assigned for first time.
			rowsol[imin] = j;
			colsol[j] = imin;
		} else if (v[j] < v[rowsol[imin]]) {
			j1 = rowsol[imin];
			rowsol[imin] = j;
			colsol[j] = imin;
			colsol[j1] = -1;
		} else {
			// row already assigned, column not assigned.
			colsol[j] = -1;
		}
	}
	// REDUCTION TRANSFER
	for (i = 0; i < dim; i++) {
		// fill list of unassigned 'free' rows.
		if (matches[i] == 0) {
			free[numfree++] = i;
		} else if (matches[i] == 1) {
			// transfer reduction from rows that are assigned once.
			j1 = rowsol[i];
			min = BIG;
			for (j = 0; j < dim; j++) {
				if (j != j1) {
					if (costMatrix[i][j] - v[j] < min + epsilon) {
						min = costMatrix[i][j] - v[j];
					}
				}
			}
			v[j1] = v[j1] - min;
		}
	}

	// AUGMENTING ROW REDUCTION
	// do-loop to be done twice.
	let loopcnt = 0;
	do {
		loopcnt++;

		// scan all free rows.
		// in some cases, a free row may be replaced with another one to be scanned next.
		k = 0;
		prvnumfree = numfree;
		// start list of rows still free after augmenting row reduction.
		numfree = 0;
		while (k < prvnumfree) {
			i = free[k];
			k++;

			// find minimum and second minimum reduced cost over columns.
			umin = costMatrix[i][0] - v[0];
			usubmin = BIG;
			j1 = 0;
			for (j = 1; j < dim; j++) {
				h = costMatrix[i][j] - v[j];
				if (h < usubmin) {
					if (h >= umin) {
						usubmin = h;
						j2 = j;
					} else {
						usubmin = umin;
						umin = h;
						j2 = j1;
						j1 = j;
					}
				}
			}

			i0 = colsol[j1];
			if (umin < usubmin + epsilon) {
				// change the reduction of the minimum column to increase the minimum
				// reduced cost in the row to the subminimum.
				v[j1] = v[j1] - (usubmin + epsilon - umin);
			} else if (i0 > -1) {
				// minimum and subminimum equal.
				// minimum column j1 is assigned.
				// swap columns j1 and j2, as j2 may be unassigned.
				j1 = j2;
				i0 = colsol[j2];
			}

			// (re-)assign i to j1, possibly de-assigning an i0.
			rowsol[i] = j1;
			colsol[j1] = i;

			// minimum column j1 assigned earlier.
			if (i0 > -1) {
				if (umin < usubmin) {
					// put in current k, and go back to that k.
					// continue augmenting path i - j1 with i0.
					free[--k] = i0;
				} else {
					// no further augmenting reduction possible.
					// store i0 in list of free rows for next phase.
					free[numfree++] = i0;
				}
			}
		}
	} while (loopcnt < 2); // repeat once.

	// AUGMENT SOLUTION for each free row.
	for (f = 0; f < numfree; f++) {
		freerow = free[f]; // start row of augmenting path.

		// Dijkstra shortest path algorithm.
		// runs until unassigned column added to shortest path tree.
		for (j = dim; j >= 0; j--) {
			d[j] = costMatrix[freerow][j] - v[j];
			pred[j] = freerow;
			collist[j] = j; // init column list.
		}

		low = 0; // columns in 0...low - 1 are ready, now none.
		up = 0; // columns in low...up - 1 are to be scanned for current minimum, now none.
		// columns in up...dim - 1 are to be considered later to find new minimum,
		// at this stage the list simply contains all columns
		unassignedfound = false;
		do {
			if (up == low) {
				// no more columns to be scanned for current minimum.
				last = low - 1;

				// scan columns for up...dim - 1 to find all indices for which new minimum occurs.
				// store these indices between low...up - 1 (increasing up).
				min = d[collist[up++]];
				for (k = up; k < dim; k++) {
					j = collist[k];
					h = d[j];
					if (h <= min) {
						if (h < min) { // new minimum.
							up = low; // restart list at index low.
							min = h;
						}
						// new index with same minimum, put on index up, and extend list.
						collist[k] = collist[up];
						collist[up++] = j;
					}
				}
				// check if any of the minimum columns happens to be unassigned.
				// if so, we have an augmenting path right away.
				for (k = low; k < up; k++) {
					if (colsol[collist[k]] < 0) {
						endofpath = collist[k];
						unassignedfound = true;
						break;
					}
				}
			}

			if (!unassignedfound) {
				// update 'distances' between freerow and all unscanned columns, via next scanned column.
				j1 = collist[low];
				low++;
				i = colsol[j1];
				h = costMatrix[i][j1] - v[j1] - min;

				for (k = up; k < dim; k++) {
					j = collist[k];
					v2 = costMatrix[i][j] - v[j] - h;
					if (v2 < d[j]) {
						pred[j] = i;
						// new column found at same minimum value
						if (v2 == min) {
							if (colsol[j] < 0) {
								// if unassigned, shortest augmenting path is complete.
								endofpath = j;
								unassignedfound = true;
								break;
							} else {
								// else add to list to be scanned right away.
								collist[k] = collist[up];
								collist[up++] = j;
							}
						}
						d[j] = v2;
					}
				}
			}
		} while (!unassignedfound);

		// update column prices.
		for (k = last + 1; k--;) {
			j1 = collist[k];
			v[j1] = v[j1] + d[j1] - min;
		}

		// reset row and column assignments along the alternating path.
		do {
			i = pred[endofpath];
			colsol[endofpath] = i;
			j1 = endofpath;
			endofpath = rowsol[i];
			rowsol[i] = j1;
		} while (i != freerow);
	}

	// calculate optimal (minimal) cost.
	let lapcost = 0;
	for (i = dim - 1; i >= 0; i--) {
		j = rowsol[i];
		u[i] = costMatrix[i][j] - v[j];
		lapcost += costMatrix[i][j];
	}

	return {
		cost: lapcost,
		row: rowsol,
		col: colsol,
		u: u,
		v: v
	};
};

export default lap;