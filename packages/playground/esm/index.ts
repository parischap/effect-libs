/* eslint-disable functional/no-expression-statements */
import { PPOption, PPStringify } from '@parischap/pretty-print';

const stringify = PPStringify.asString(PPOption.ansiDarkTreeified);
const toPrint = {
	A: {
		A1: { A11: null, A12: { A121: null, A122: null, A123: null }, A13: null },
		A2: null,
		A3: null
	},
	B: { B1: null, B2: null }
};

console.log(stringify(toPrint));
