/* eslint-disable functional/no-expression-statements */
import { PPOption, PPStringifiedValue } from '@parischap/pretty-print';
import { HashMap, pipe } from 'effect';

const stringifier = PPOption.toStringifier(PPOption.darkModeUtilInspectLike);

const toPrint = {
	a: [7, 8],
	e: HashMap.make(['key1', 3], ['key2', 6]),
	b: { a: 5, c: 8 },
	f: Math.max,
	d: {
		e: true,
		f: { a: { k: { z: 'foo', y: 'bar' } } }
	}
};

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
