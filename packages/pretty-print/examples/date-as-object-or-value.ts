/* eslint-disable functional/no-expression-statements */
import { ByPasser, ColorSet, Options, Stringify } from '@parischap/pretty-print';

const toPrint = new Date(Date.UTC(2024, 8, 20));
const stringifyByPassToStringed = Stringify.asString({
	...Options.ansiDarkSingleLine
});

const stringifyAllObjects = Stringify.asString({
	...Options.ansiDarkSingleLine,
	byPasser: ByPasser.defaultInstance(ColorSet.ansiDarkMode)
});

console.log(`As date: ${stringifyByPassToStringed(toPrint)}`);
console.log(`As object: ${stringifyAllObjects(toPrint)}`);
