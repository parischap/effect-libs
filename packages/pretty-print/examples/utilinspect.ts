/* eslint-disable functional/no-expression-statements */
import { inspect } from 'node:util';
const s = Symbol.for('foo');
const toPrint = {
	a: s,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: 'foo', y: 'bar' }, j: false } }, g: 'aa' },
	z: (n: number) => n + 1,
	y: BigInt(4)
};

console.log(inspect(toPrint));
