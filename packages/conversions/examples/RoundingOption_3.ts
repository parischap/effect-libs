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
