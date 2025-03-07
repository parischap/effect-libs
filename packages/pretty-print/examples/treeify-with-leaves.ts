/* eslint-disable functional/no-expression-statements */
import { PPOption, PPStringifiedValue } from '@parischap/pretty-print';
import { pipe } from 'effect';

const stringifier = PPOption.toStringifier(PPOption.darkModeTreeify);

const toPrint = {
	Vegetal: {
		Trees: {
			Oaks: 8,
			BirchTree: 3
		},
		Fruit: { Apples: 8, Lemons: 5 }
	},
	Animal: {
		Mammals: {
			Dogs: 3,
			Cats: 2
		}
	}
};

console.log(pipe(toPrint, stringifier, PPStringifiedValue.toAnsiString()));
