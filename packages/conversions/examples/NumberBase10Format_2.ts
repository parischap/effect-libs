/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format } from '@parischap/conversions';
import { pipe } from 'effect';

// Result:
// {
//   _id: '@parischap/conversions/NumberBase10Format/',
//   thousandSeparator: '',
//   fractionalSeparator: '.',
//   showNullIntegerPart: true,
//   minimumFractionalDigits: 0,
//   maximumFractionalDigits: 3,
//   eNotationChars: [ 'e', 'E' ],
//   scientificNotation: 0,
//   roundingMode: 6,
//   signDisplay: 3
//  }
console.log(CVNumberBase10Format.ukStyleUngroupedNumber);

// Result: 'signed integer'
console.log(
	pipe(
		CVNumberBase10Format.ukStyleUngroupedNumber,
		CVNumberBase10Format.withSignDisplay,
		CVNumberBase10Format.withNDecimals(0),
		CVNumberBase10Format.toDescription
	)
);
