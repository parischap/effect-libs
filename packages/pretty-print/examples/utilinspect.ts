/* eslint-disable functional/no-expression-statements */
import { inspect } from 'node:util';
const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: 'foo', y: 'bar' }, j: false } }, g: 'aa' },
	z: (n: number) => n + 1,
	y: BigInt(4)
};

const map1 = new Set();
map1.add(1);
map1.add(2);
map1.add(3);
// Inspect by basic method
console.log(inspect(map1, { colors: true, maxArrayLength: 2 }));
