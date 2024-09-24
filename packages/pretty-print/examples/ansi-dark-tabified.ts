/* eslint-disable functional/no-expression-statements */
import { Options, Stringify } from '@parischap/pretty-print';

const ansiDarkSplitWhenTotalLengthExceeds40 = Stringify.asString(
	Options.ansiDarkSplitWhenTotalLengthExceeds40
);

const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: 'foo', y: 'bar' }, j: false } }, g: 'aa' }
};

console.log(ansiDarkSplitWhenTotalLengthExceeds40(toPrint));
