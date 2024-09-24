/* eslint-disable functional/no-expression-statements */
import { Stringify } from '@parischap/pretty-print';

const uncoloredSplitWhenTotalLengthExceeds40 = Stringify.asString();

const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: 'foo', y: 'bar' }, j: false } }, g: 'aa' }
};

console.log(uncoloredSplitWhenTotalLengthExceeds40(toPrint));
