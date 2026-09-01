import * as MBigDecimal from '@parischap/effect-lib/MBigDecimal';
import * as MNumber from '@parischap/effect-lib/MNumber';

// Let's compare how the different rounding options treat the same half-way value at precision 0
const value = 2.5;

// Result: 3 (round toward +∞)
console.log(MNumber.round(0, MBigDecimal.RoundingOption.Ceil)(value));

// Result: 2 (round toward -∞)
console.log(MNumber.round(0, MBigDecimal.RoundingOption.Floor)(value));

// Result: 3 (round away from 0)
console.log(MNumber.round(0, MBigDecimal.RoundingOption.Expand)(value));

// Result: 2 (round toward 0)
console.log(MNumber.round(0, MBigDecimal.RoundingOption.Trunc)(value));

// Result: 3 (ties away from 0)
console.log(MNumber.round(0, MBigDecimal.RoundingOption.HalfExpand)(value));

// Result: 2 (ties towards the nearest even integer: 2 is even)
console.log(MNumber.round(0, MBigDecimal.RoundingOption.HalfEven)(value));

// Same comparison with 3.5: HalfEven now rounds up because 4 is the nearest even integer
// Result: 4
console.log(MNumber.round(0, MBigDecimal.RoundingOption.HalfEven)(3.5));
