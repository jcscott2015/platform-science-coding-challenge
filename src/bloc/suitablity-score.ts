/**
 * @file Business logic for determining suitability score.
 * @author John C. Scott
 */

/**
 * Find just the street name from complete address.
 * Assumes address line is comma separated.
 * Return lowercase with no whitespace.
 * @param str string
 * @returns string
 */
const justStrName = (str: string): string => {
	const streetAddr = str.split(',');
	const m = streetAddr[0].match(/(?<=.)(\b\w+\b)(?![^\s]*$)/igm);
	return m === null ? '' : m.join('').toLocaleLowerCase();
};

/**
 * Find the number of vowels, or zero. Match is case insensitive.
 * @param str string
 * @returns number
 */
const howManyVowels = (str: string): number => {
	const m = str.match(/[aeiou]/gi);
	return m === null ? 0 : m.length;
};

/**
 * Find the number of consonants, or zero. Match is case insensitive.
 * @param str string
 * @returns number
 */
const howManyConsonants = (str: string): number => {
	const m = str.match(/[bcdfghjklmnpqrstvwxyz]/gi);
	return m === null ? 0 : m.length;
};

/**
 * Checks for common factors and returns boolean.
 * If the length of the shipment's destination street name shares any common factors
 * (besides 1) with the length of the driver's name, the suitability score is increased
 * by 50% above the base suitability score.
 * @param driver string
 * @param addr string
 * @returns boolean
 */
const commonFactors = (driver: string, addr: string): boolean => {
	const driverFactors = getFactors(driver.replace(/\s+/g, '').length);
	const addrFactors = getFactors(addr.replace(/\s+/g, '').length);
	return addrFactors.some(factor => driverFactors.includes(factor));
};

/**
 * Return all factors of N, except 1.
 * @param N number
 * @returns number[]
 */
const getFactors = (N: number): number[] => {
	if (N === 1) return [];

	// Use set as we only want unique values for a count.
	const factors: Set<number> = new Set();

	/**
	 * Optimally, we only need to find half of each factor tree
	 * pair. Modding by Math.floor(Math.sqrt(N)) gives us
	 * the first half. Dividing N by i gives us the other half.
	 * O(n) is reduced considerably.
	*/
	for (let i = 1; i <= Math.floor(Math.sqrt(N)); i++) {
		if ((N % i) === 0) {
			factors.add(i); // first pair half
			factors.add(N / i); // second pair half
		}
	}
	factors.delete(1); // exclude 1
	return [...factors];
};

/**
 * Calculate the base suitability score.
 * If the length of the shipment's destination street name is even, the base suitability
 * score (SS) is the number of vowels in the driver's name multiplied by 1.5.
 * If the length of the shipment's destination street name is odd, the base SS
 * is the number of consonants in the driver's name multiplied by 1.
 * @param driver string
 * @param addr string
 * @returns number
 */
const suitabilityScore = (driver: string, addr: string): number => {
	const score = justStrName(addr).length % 2 == 0 ?
		howManyVowels(driver) * 1.5 : howManyConsonants(driver);
	const adjustedScore = commonFactors(driver, addr) ? score * 1.5 : score;
	/**
	 * Convert score to reward so lap algorithm returns a maximum amount.
	 * Invert the score (multiply by -1), unless score is zero. If zero,
	 * replace with a very large number, say 100000.
	 * @see {@link https://medium.com/@rajneeshtiwari_22870/linear-assignment-problem-in-metric-learning-for-computer-vision-eba7d637c5d4}
	 */
	return adjustedScore == 0 ? 100000 : -1 * adjustedScore;
};

export default suitabilityScore;