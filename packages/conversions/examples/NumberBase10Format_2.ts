import { pipe } from 'effect';

import * as CVNumberBase10Format from '@parischap/conversions/CVNumberBase10Format';

// Result:
// {
//   _id: '@parischap/conversions/NumberBase10Format/',
//   thousandSeparator: '',
//   fractionalSeparator: '.',
//   showNullIntegerPart: true,
//   integerPartPadding: { _id: 'Option', _tag: 'None' },
//   minimumFractionalDigits: 0,
//   maximumFractionalDigits: 3,
//   eNotationChars: [ 'e', 'E' ],
//   scientificNotationOption: 0,
//   roundingOption: 6,
//   signDisplayOption: 3
//  }
console.log(CVNumberBase10Format.ukStyleUngroupedNumber);

// Result: 'signed integer'
console.log(
  pipe(
    CVNumberBase10Format.ukStyleUngroupedNumber,
    CVNumberBase10Format.withSignDisplay,
    CVNumberBase10Format.withNDecimals(0),
    CVNumberBase10Format.toDescription,
  ),
);
