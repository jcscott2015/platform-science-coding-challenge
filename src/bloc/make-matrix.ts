/**
 * @file Business logic for creating matices.
 * @author John C. Scott
 */

export interface IMatrix {
	[key: string]: string;
};

/**
 * Create a matrix of `size`, filled with zeros.
 * @param size number
 * @param init number | IMatrix
 * @returns number[][] | IMatrix[][]
 */
const makeMatrix = (
	size: number,
	init: number | IMatrix
): number[][] | IMatrix[][] => {
	return new Array(size).fill(0)
		.map(() => new Array(size).fill(init));
};

export default makeMatrix;