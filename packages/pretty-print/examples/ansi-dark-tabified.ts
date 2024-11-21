/* eslint-disable functional/no-expression-statements */
import { PPOption, PPStringify } from '@parischap/pretty-print';

const stringify = PPStringify.asString(PPOption.ansiDarkSplitWhenTotalLengthExceeds40);

const toPrint = {
	a: 1,
	b: { a: 5, c: 8 },
	d: { e: true, f: { a: { k: { z: 'foo', y: 'bar' }, j: false } }, g: 'aa' }
};

console.log(stringify(toPrint));
