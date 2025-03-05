/* eslint-disable functional/no-expression-statements */
import { ASContextStyler, ASPalette } from '@parischap/ansi-styles';

interface Value {
	readonly pos1: number;
	readonly otherStuff: string;
}

const red: ASContextStyler.Type<Value> = ASContextStyler.red();

const pos1 = (value: Value): number => value.pos1;

const pos1BasedAllColorsFormatter = ASContextStyler.fromPalette({
	indexFromContext: pos1,
	palette: ASPalette.allStandardOriginalColors
});

const value1: Value = {
	pos1: 2,
	otherStuff: 'dummy'
};
const pos1BasedAllColorsFormatterInValue1Context = pos1BasedAllColorsFormatter(value1);
const redInValue1Context = red(value1);

/* Prints `foo` in red */
console.log(redInValue1Context('foo'));

/* Prints `foo` in green */
console.log(pos1BasedAllColorsFormatterInValue1Context('foo'));

/* Prints `foo` in green */
console.log(pos1BasedAllColorsFormatter.withContextLast('foo')(value1));
