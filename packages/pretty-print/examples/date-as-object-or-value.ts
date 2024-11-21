/* eslint-disable functional/no-expression-statements */
import { PPByPasser, PPFormatSet, PPOption, PPStringify } from '@parischap/pretty-print';

const toPrint = new Date(Date.UTC(2024, 8, 20));

const stringifyAsValue = PPStringify.asString({
	...PPOption.ansiDarkSingleLine
});

const stringifyAsRecord = PPStringify.asString({
	...PPOption.ansiDarkSingleLine,
	byPasser: PPByPasser.objectAsRecord(PPFormatSet.ansiDarkMode)
});

// As value: Fri Sep 20 2024 02:00:00 GMT+0200 (heure d’été d’Europe centrale)
console.log(`As value: ${stringifyAsValue(toPrint)}`);
// As record:
console.log(`As record: ${stringifyAsRecord(toPrint)}`);
