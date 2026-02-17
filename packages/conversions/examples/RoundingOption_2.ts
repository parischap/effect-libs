import * as CVRounder from '@parischap/conversions/CVRounder'
import * as CVRounderParams from '@parischap/conversions/CVRounderParams'

// Let's define a number rounder from halfExpand2. Type: (value:number) => number
const numberRounder = CVRounder.number(CVRounderParams.halfExpand2);

/** Positive number */
// Result: 12.456
console.log(numberRounder(12.46));

/** Negative number */
// Result: -12.46
console.log(numberRounder(-12.457));
