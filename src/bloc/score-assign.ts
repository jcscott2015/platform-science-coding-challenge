/**
 * @file Score and assign drivers to addr.
 * @author John C. Scott
 *
 * @requires     ../lap-ts/lap
 * @requires     ../lap-ts/lap.ILap
 * @requires     ./suitability-score
 * @requires     ./make-matrix
 * @requires     ./make-matrix.IMatrix
 */

import lap from '../lap-ts/lap';
import suitabilityScore from './suitablity-score';
import makeMatrix, { IMatrix } from './make-matrix';

/**
 * Create reward matrix and driver/addresses assignment matrix.
 * @param drivers string[]
 * @param addrs  string[]
 * @returns number[][]
 */
const createMatrices = (
	drivers: string[],
	addrs: string[],
): { [key: string]: number[][] | IMatrix[][] } => {
	// Initialize the n x n reward matrix with zeros
	const rewardMatrix = <number[][]>makeMatrix(addrs.length, 0);

	// Initialize the n x n assignment matrix with empty object
	const driversAddrsMatrix = <IMatrix[][]>makeMatrix(drivers.length, {});

	/**
	 * Construct reward matrix, as well as fill mapping of all pairs of driver
	 * names to destination addresses. This will be used to make the assignments.
	 */
	drivers.forEach((name, row) => {
		addrs.forEach((address, column) => {
			rewardMatrix[row][column] = suitabilityScore(name, address);
			driversAddrsMatrix[row][column] = { driver: name, addr: address };
		});
	});

	return { rewards: rewardMatrix, driversAddrs: driversAddrsMatrix };
};

/**
 * Create reward and assignment matrices.
 * Returns total score and driver street assignments.
 * @param drivers string[]
 * @param addrs string[]
 * @returns [key: string]: number | Map<string, string>
 */
const getScoreAndMakeAssignments = (
	drivers: string[],
	addrs: string[]
): { [key: string]: number | Map<string, string> } => {
	const { rewards, driversAddrs } = createMatrices( drivers, addrs);
	const solution = lap(drivers.length, rewards as number[][]);
	const totalSS = Math.abs(solution.cost);
	const assignments = mapDriversAndAddrs(
		solution.row, solution.col, driversAddrs as IMatrix[][]
	);
	return { totalSS, assignments };
};

/**
 * Return Map of drivers and addresses that match lap solution indices.
 * @param rowIndices Int32Array
 * @param colIndices Int32Array
 * @param mapping IMatrix[][]
 * @returns Map<string, string>
 */
const mapDriversAndAddrs = (
	rowIndices: Int32Array,
	colIndices: Int32Array,
	mapping: IMatrix[][]
): Map<string, string> => {
	const driversAddrs: Map<string, string> = new Map();
	for (let i = 0; i < rowIndices.length; i++) {
		const j = rowIndices[i];
		const driverAddr = mapping[colIndices[i]][j];
		driversAddrs.set(driverAddr['driver'], driverAddr['addr']);
	}
	return driversAddrs;
};

export default getScoreAndMakeAssignments;