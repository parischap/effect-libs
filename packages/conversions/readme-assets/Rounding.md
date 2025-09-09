<div align="center">

# CVRoundingOption

A module to round numbers and BigDecimal's with the same rounding options as those offered by the javascript INTL namespace: Ceil, Floor, Expand, Trunc, HalfCeil...

</div>

## 1. Usage example

```ts
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
console.log(bigDecimalRounder(BigDecimal.make(124566n, 4)));

// Result: BigDecimal.make(-12456n, 3)
console.log(bigDecimalRounder(BigDecimal.make(-124565n, 4)));

// Result: BigDecimal.make(12450n, 3)
console.log(bigDecimalRounder(BigDecimal.make(1245n, 2)));
```

## 2. Available rounding modes

The available rounding modes are defined in module RoundingMode.ts:

```ts
export enum Type {
	/** Round toward +∞. Positive values round up. Negative values round "more positive" */
	Ceil = 0,
	/** Round toward -∞. Positive values round down. Negative values round "more negative" */
	Floor = 1,
	/**
	 * Round away from 0. The magnitude of the value is always increased by rounding. Positive values
	 * round up. Negative values round "more negative"
	 */
	Expand = 2,
	/**
	 * Round toward 0. The magnitude of the value is always reduced by rounding. Positive values round
	 * down. Negative values round "less negative"
	 */
	Trunc = 3,
	/**
	 * Ties toward +∞. Values above the half-increment round like "ceil" (towards +∞), and below like
	 * "floor" (towards -∞). On the half-increment, values round like "ceil"
	 */
	HalfCeil = 4,
	/**
	 * Ties toward -∞. Values above the half-increment round like "ceil" (towards +∞), and below like
	 * "floor" (towards -∞). On the half-increment, values round like "floor"
	 */
	HalfFloor = 5,
	/**
	 * Ties away from 0. Values above the half-increment round like "expand" (away from zero), and
	 * below like "trunc" (towards 0). On the half-increment, values round like "expand"
	 */
	HalfExpand = 6,
	/**
	 * Ties toward 0. Values above the half-increment round like "expand" (away from zero), and below
	 * like "trunc" (towards 0). On the half-increment, values round like "trunc"
	 */
	HalfTrunc = 7,
	/**
	 * Ties towards the nearest even integer. Values above the half-increment round like "expand"
	 * (away from zero), and below like "trunc" (towards 0). On the half-increment values round
	 * towards the nearest even digit
	 */
	HalfEven = 8,
}
```

## 3. CVRoundingOption instances

Instead of building your own `CVRoundingOption`, you can use the `halfExpand2` `CVRoundingOption` instance (`HalfExpand` rounding mode with a precision of two fractional digits). It will come in handy in accounting apps of most countries. For example:

```ts
import { CVRoundingOption } from "@parischap/conversions";

// Let's define a number rounder from halfExpand2. Type: (value:number) => number
const numberRounder = CVRoundingOption.toNumberRounder(
	CVRoundingOption.halfExpand2,
);

/** Positive number */
// Result: 12.456
console.log(numberRounder(12.46));

/** Negative number */
// Result: -12.46
console.log(numberRounder(-12.457));
```

## 4. Debugging and equality

`CVRoundingOption` objects implement `Effect` equivalence and equality based on equivalence and equality of the `precision` and `roundingMode` properties. They also implement a `.toString()` method. For instance:

```ts
import { CVRoundingMode, CVRoundingOption } from "@parischap/conversions";
import { Equal } from "effect";

// Result: 'HalfExpandRounderWith2Precision'
console.log(CVRoundingOption.halfExpand2);

const dummyOption1 = CVRoundingOption.make({
	precision: 3,
	roundingMode: CVRoundingMode.Type.HalfEven,
});

const dummyOption2 = CVRoundingOption.make({
	precision: 2,
	roundingMode: CVRoundingMode.Type.HalfExpand,
});

// Result: false
console.log(Equal.equals(CVRoundingOption.halfExpand2, dummyOption1));

// Result: true
console.log(Equal.equals(CVRoundingOption.halfExpand2, dummyOption2));
```
