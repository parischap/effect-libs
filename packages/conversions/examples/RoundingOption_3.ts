import * as CVRounderParams from '@parischap/conversions/CVRounderParams'
import * as CVRoundingOption from '@parischap/conversions/CVRoundingOption'
import * as Equal from 'effect/Equal'

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
