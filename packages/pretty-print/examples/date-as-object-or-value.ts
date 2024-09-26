/* eslint-disable functional/no-expression-statements */
import { ByPasser, ColorSet, Options, Stringify } from '@parischap/pretty-print';

const toPrint = new Date(Date.UTC(2024, 8, 20));

const stringifyAsValue = Stringify.asString({
	...Options.ansiDarkSingleLine
});

const stringifyAsRecord = Stringify.asString({
	...Options.ansiDarkSingleLine,
	byPasser: ByPasser.objectAsRecord(ColorSet.ansiDarkMode)
});

// As value: Fri Sep 20 2024 02:00:00 GMT+0200 (heure d’été d’Europe centrale)
console.log(`As value: ${stringifyAsValue(toPrint)}`);
// As record:
console.log(`As record: ${stringifyAsRecord(toPrint)}`);
