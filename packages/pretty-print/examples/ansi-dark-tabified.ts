/* eslint-disable functional/no-expression-statements */
import { Options, Stringify } from '@parischap/pretty-print';
import { Array, Chunk, Equal, List } from 'effect';

console.log(Equal.equals(Array.of(1), Array.of(1)));
console.log(Equal.equals(Chunk.of(1), Chunk.of(1)));
console.log(Equal.equals(List.of(1), List.of(1)));

const ansiDarkTabifiedSplitWhenTotalLengthExceeds40 = Stringify.asString(
	Options.ansiDarkTabifiedSplitWhenTotalLengthExceeds40
);

const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: 'foo', y: 'bar' }, j: false } }, g: 'aa' }
};

console.log(ansiDarkTabifiedSplitWhenTotalLengthExceeds40(toPrint));
