/* eslint-disable functional/no-expression-statements */
import { inspect } from 'node:util';
const target = {
	array1: [1, 2, 3],
	array2: [3, 4, 5]
};

const handler2 = {
	get() {
		return 'world';
	}
};

const proxy2 = new Proxy(target, handler2);

const map1 = new Map();

map1.set('a', 1);
map1.set('b', 2);
map1.set('c', 3);

// Inspect by basic method
console.log(inspect(map1));
