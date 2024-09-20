/* eslint-disable functional/no-expression-statements */
import { Stringify } from '@parischap/pretty-print';
//import { Options } from '@parischap/pretty-print';

// Options.uncoloredTabifiedSplitWhenTotalLengthExceeds40 is the default option so you could also write Stringify.asString(Options.uncoloredTabifiedSplitWhenTotalLengthExceeds40);
const uncoloredTabifiedSplitWhenTotalLengthExceeds40 = Stringify.asString();

const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: 'foo', y: 'bar' }, j: false } }, g: 'aa' }
};

console.log(uncoloredTabifiedSplitWhenTotalLengthExceeds40(toPrint));
