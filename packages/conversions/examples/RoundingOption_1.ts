import { CVRoundingMode, CVRoundingOption } from "@parischap/conversions";
import { BigDecimal } from "effect";

// Here we define our rounding options:
// the result must have three fractional digits using the HalfEven rounding mode
const roundingOption = CVRoundingOption.make({
  precision: 3,
  roundingMode: CVRoundingMode.Type.HalfEven,
});

// Let's define a number rounder from our options. Type: (value:number) => number
const numberRounder = CVRoundingOption.toNumberRounder(roundingOption);
// Let's define a BigDecimal rounder from our options. Type: (value:BigDecimal) => BigDecimal
const bigDecimalRounder = CVRoundingOption.toBigDecimalRounder(roundingOption);

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
