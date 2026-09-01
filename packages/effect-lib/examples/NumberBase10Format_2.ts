import { pipe } from 'effect';

import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';

// Result:
// {
//   _id: '@parischap/effect-lib/NumberBase10Format/',
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
console.log(MNumberBase10Format.ukStyleUngroupedNumber);

// Result: 'signed integer'
console.log(
  pipe(
    MNumberBase10Format.ukStyleUngroupedNumber,
    MNumberBase10Format.withSignDisplay,
    MNumberBase10Format.withNDecimals(0),
    MNumberBase10Format.toDescription,
  ),
);
