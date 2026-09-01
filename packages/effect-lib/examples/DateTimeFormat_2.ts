import * as MDateTimeFormat from '@parischap/effect-lib/MDateTimeFormat';

const { Token } = MDateTimeFormat;

// Let's define a DateTimeFormat: iiii d MMMM yyyy (context-independent)
const frenchFormat = MDateTimeFormat.make(
  Token.iiii,
  ' ',
  Token.d,
  ' ',
  Token.MMMM,
  ' ',
  Token.yyyy,
);

// Result: [ 18, ' ', 12, ' ', 9, ' ', 2 ]  (the numbers are the Token enum values for iiii, d, MMMM, yyyy)
console.log(frenchFormat);
