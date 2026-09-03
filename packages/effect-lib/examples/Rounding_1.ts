import * as BigDecimal from 'effect/BigDecimal';

import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
import * as MNumber from '@parischap/effect-lib/MNumber';
import * as MNumberBase10Format from '@parischap/effect-lib/MNumberBase10Format';

// Let's define a number rounder: the result must have three fractional digits using the HalfEven
// rounding mode
const numberRounder = MNumber.round(3, MNumberBase10Format.RoundingOption.HalfEven);
// Let's define a BigDecimal rounder with the same parameters
const bigDecimalRounder = MBigDecimal.round(3, MNumberBase10Format.RoundingOption.HalfEven);

/** Positive numbers with even last significant digit */
// Result: 12.457
console.log(numberRounder(12.4566));

// Result: 12.456
console.log(numberRounder(12.4565));

// Result: 12.456
console.log(numberRounder(12.4564));

/** Positive numbers with odd last significant digit */
// Result: 12.458
console.log(numberRounder(12.4576));

// Result: 12.458
console.log(numberRounder(12.4575));

// Result: 12.457
console.log(numberRounder(12.4574));

/** Negative numbers with even last significant digit */
// Result: -12.457
console.log(numberRounder(-12.4566));

// Result: -12.456
console.log(numberRounder(-12.4565));

// Result: -12.456
console.log(numberRounder(-12.4564));

/** Negative numbers with odd last significant digit */
// Result: -12.458
console.log(numberRounder(-12.4576));

// Result: -12.458
console.log(numberRounder(-12.4575));

// Result: -12.457
console.log(numberRounder(-12.4574));

// Result: -12.450000000000001 (javascript number loss of accuracy)
console.log(numberRounder(-12.45));

/** Diverse BigDecimal numbers */
// Result: BigDecimal.make(12457n, 3)
console.log(bigDecimalRounder(BigDecimal.make(124_566n, 4)));

// Result: BigDecimal.make(-12456n, 3)
console.log(bigDecimalRounder(BigDecimal.make(-124_565n, 4)));

// Result: BigDecimal.make(12450n, 3)
console.log(bigDecimalRounder(BigDecimal.make(1245n, 2)));
