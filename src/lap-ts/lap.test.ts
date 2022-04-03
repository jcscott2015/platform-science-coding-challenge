import lap from './lap';

test('lap to return solution row of [0, 2, 1]', () => {
	const n = 3, costs = [[1, 2, 3], [4, 2, 1], [2, 2, 2]];
	const solution = lap(n, costs);
	const rowsol = solution.row;
	expect(rowsol[0]).toEqual(0);
	expect(rowsol[1]).toEqual(2);
	expect(rowsol[2]).toEqual(1);
});