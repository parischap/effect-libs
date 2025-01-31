/* eslint-disable functional/no-expression-statements */
import { inspect } from 'node:util';
const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: 'foo', y: 'bar' }, j: false } }, g: 'aa' },
	z: null,
	y: undefined
};

// Inspect by basic method
console.log(inspect(toPrint, { colors: true }));

/*const map1 = new Map();

map1.set({ a: 'a', b: 'b' }, 1);
map1.set({ a: 'a1', b: 'b' }, 2);
map1.set({ a: 'a2', b: 'b', c: 'c', d: 'd', e: 'e', jetaimemonamour: 'jetaimemonamour' }, 3);*/

/*const set1 = new WeakSet();
set1.add({ a: 'a', b: 'b' });
set1.add({ a: 'a1', b: 'b' });*/

const typedArray1 = new Int8Array(8);
typedArray1[0] = 32;

console.log(inspect(typedArray1));
