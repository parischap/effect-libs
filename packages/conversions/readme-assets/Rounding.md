<!-- LTeX: language=en-US -->
<div align="center">

# CVRounderParams

A module to round numbers and [BigDecimal](https://effect.website/docs/data-types/bigdecimal/)'s with the same rounding options as those offered by the JavaScript INTL namespace: Ceil, Floor, Expand, Trunc, HalfCeil...

</div>

## 1. Usage example

```ts
import { CVRounder, CVRounderParams, CVRoundingOption } from '@parischap/conversions';
import { BigDecimal } from 'effect';

// Here we define the parameters of the rounder:
// the result must have three fractional digits using the HalfEven rounding mode
const rounderParams = CVRounderParams.make({
  precision: 3,
  roundingOption: CVRoundingOption.Type.HalfEven,
});

// Let's define a number rounder from our parameters. Type: (value:number) => number
const numberRounder = CVRounder.number(rounderParams);
// Let's define a BigDecimal rounder from our parameters. Type: (value:BigDecimal) => BigDecimal
const bigDecimalRounder = CVRounder.bigDecimal(rounderParams);

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
```

## 3. CVRounderParams instances

Instead of building your own `CVRounderParams`, you can use the `halfExpand2` `CVRounderParams` instance (`HalfExpand` rounding option with a precision of two fractional digits). It will come in handy in accounting apps of most countries. For example:

```ts
import { CVRounder, CVRounderParams } from '@parischap/conversions';

// Let's define a number rounder from halfExpand2. Type: (value:number) => number
const numberRounder = CVRounder.number(CVRounderParams.halfExpand2);

/** Positive number */
// Result: 12.456
console.log(numberRounder(12.46));

/** Negative number */
// Result: -12.46
console.log(numberRounder(-12.457));
```

## 4. Debugging and equality

`CVRoundingOption` objects implement `Effect` equivalence and equality based on equivalence and equality of the `precision` and `roundingOption` properties. They also implement a `.toString()` method. For instance:

```ts
import { CVRounderParams, CVRoundingOption } from '@parischap/conversions';
import { Equal } from 'effect';

// Result: 'HalfExpandRounderWith2Precision'
console.log(CVRounderParams.halfExpand2);

const dummyOption1 = CVRounderParams.make({
  precision: 3,
  roundingOption: CVRoundingOption.Type.HalfEven,
});

const dummyOption2 = CVRounderParams.make({
  precision: 2,
  roundingOption: CVRoundingOption.Type.HalfExpand,
});

// Result: false
console.log(Equal.equals(CVRounderParams.halfExpand2, dummyOption1));

// Result: true
console.log(Equal.equals(CVRounderParams.halfExpand2, dummyOption2));
```
