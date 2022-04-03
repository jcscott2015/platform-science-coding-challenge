/**
 * @file Score and assign drivers to addr.
 * @author John C. Scott
 *
 * @requires     ../lap-ts/lap
 * @requires     ../lap-ts/lap.ILap
 * @requires     ./suitability-score
 * @requires     ./suitability-score.totalSuitabilityScore
 * @requires     ./make-matrix
 * @requires     ./make-matrix.IMatrix
 */

import lap from '../lap-ts/lap';
import suitabilityScore, { totalSuitabilityScore } from './suitablity-score';
import makeMatrix, { IMatrix } from './make-matrix';

/**
 * Create Reward and Cost matrices to map and convert Costs to Rewards.
 * @param drivers string[]
 * @param addrs  string[]
 * @param matrix  IMatrix[][]
 * @returns [key: string]: number[][]
 */
const createRewardAndCostMatrices = (
	drivers: string[],
	addrs: string[],
	daMatrix: IMatrix[][]
): { [key: string]: number[][] } => {
	// Initialize the n x n reward matrix with zeros
	const n = addrs.length;
	const rewardMatrix = <number[][]>makeMatrix(n, 0);

	/**
	 * Construct reward matrix, as well as fill mapping of all pairs of driver
	 * names to destination addresses. This will be used to make the assignments.
	 */
	drivers.forEach((name, row) => {
		addrs.forEach((address, column) => {
			rewardMatrix[row][column] = suitabilityScore(name, address);
			daMatrix[row][column] = { driver: name, addr: address };
		});
	});

	/**
	 * Convert cost matrix to reward matrix. Invert the score (multiply by -1),
	 * unless score is zero. If zero, replace with a very large number, say 100000.
	 * @see {@link https://medium.com/@rajneeshtiwari_22870/linear-assignment-problem-in-metric-learning-for-computer-vision-eba7d637c5d4}
	 */
	const costMatrix = rewardMatrix
		.map(row => row.map(score => score == 0 ? 100000 : -1 * score));

	return { rewards: rewardMatrix, costs: costMatrix };
};

/**
 * Returns total score and driver street assignments.
 * Create reward and cost matrices. The reward matrix is generated from
 * using the suitability score algorithm provided. The cost matrix is
 * derived from the reward matrix.
 * @param drivers string[]
 * @param addrs string[]
 * @returns [key: string]: number | Map<string, string>
 */
const getScoreAndMakeAssignments = (
	drivers: string[],
	addrs: string[]
): { [key: string]: number | Map<string, string> } => {
	// Initialize the n x n cost matrix with zeros
	const n = drivers.length;
	const driversAddrsMatrix = <IMatrix[][]>makeMatrix(n, {});
	const { rewards, costs } = createRewardAndCostMatrices(
		drivers, addrs, driversAddrsMatrix
	);

	/**
	 * Use cost matrix to obtain the optimized driver/destination
	 * pairings in the form of an array of all matrix positions (i.e. [i,j])
	 * that correspond to optimized pairings. These correspond to the optimized
	 * reward pairings in the original reward matrix, so the assignments will
	 * work for maximization problem
	 */
	const solution = lap(n, costs);
	const totalSS = totalSuitabilityScore(rewards, solution.row, solution.col);
	const assignments = mapDriversAndAddrs(
		solution.row, solution.col, driversAddrsMatrix
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