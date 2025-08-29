/* eslint-disable functional/no-expression-statements */
import { CVRoundingOption } from '@parischap/conversions';

// Let's define a number rounder from halfExpand2. Type: (value:number) => number
const numberRounder = CVRoundingOption.toNumberRounder(CVRoundingOption.halfExpand2);

/** Positive number */
// Result: 12.456
console.log(numberRounder(12.46));

/** Negative number */
// Result: -12.46
console.log(numberRounder(-12.457));
