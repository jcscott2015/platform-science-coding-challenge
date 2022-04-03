/**
 * @file Platform Science coding challenge starting file.
 * @author John C. Scott
 *
 * @requires     NPM:inquirer
 * @requires     ./bloc/score-assign
 * @requires     NPM:fs
 * @requires     NPM:readline
 * @requires     NPM:path
 */

import inquirer from 'inquirer';
import getScoreAndMakeAssignments from './bloc/score-assign';
import fs from 'fs';
import readline from 'readline';
import path from 'path';

/**
 * Collect text file data into objects.
 * @returns Promise<{ [key: string]: string[] }
 */
const collectDriversAddrs = async (
): Promise<{ [key: string]: string[] }> => {
	try {
		const input = await inquirer.prompt(
			[{
				name: 'addrsPath',
				message: 'Enter path to addresses file:'
			},
			{
				name: 'driversPath',
				message: 'Enter path to drivers file:'
			}]
		);

		const { addrsPath, driversPath } = input;

		// Support for full or relative paths...
		const addrs = await readLines(path.resolve(__dirname, addrsPath));
		const drivers = await readLines(path.resolve(__dirname, driversPath));
		return { drivers, addrs };
	} catch (error) {
		throw new Error(`${error}: Data text files required.`)
	}
};

/**
 * Read data lines from text file and return.
 * @param filepath string - relative paths are allowed
 * @returns Promise<string[]>
 */
const readLines = async (filepath: string
): Promise<string[]> => {
	const data = readline.createInterface({
		input: fs.createReadStream(filepath),
		crlfDelay: Infinity
	});

	const contents: string[] = [];
	for await (const item of data) {
		contents.push(item);
	}

	return contents;
};

/**
 * Collect all the pieces and output to console.
 */
collectDriversAddrs()
	.then(res => {
		const { drivers, addrs } = res;
		const { totalSS, assignments } =
			getScoreAndMakeAssignments(drivers, addrs);
		console.log(`total score: ${totalSS}`);
		console.log('assignments:');
		(assignments as Map<string, string>).forEach((addr, driver) => {
			console.log(`\tDriver: ${driver}`);
			console.log(`\tDestination: ${addr}\n`);
		});
	})
	.catch(err => console.error(err));
