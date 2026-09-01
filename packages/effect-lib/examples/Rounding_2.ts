import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
import * as MNumber from '@parischap/effect-lib/MNumber';

// Let's precompute a rounder suitable for accounting apps of most countries: 2 fractional digits,
// HalfExpand rounding mode. Precomputing the closure once and reusing it is more efficient than
// calling MNumber.round(2, MBigDecimal.RoundingOption.HalfExpand) on every value
const accountingRounder = MNumber.round(2, MBigDecimal.RoundingOption.HalfExpand);

/** Positive number */
// Result: 12.46
console.log(accountingRounder(12.457));

/** Negative number */
// Result: -12.46
console.log(accountingRounder(-12.457));
