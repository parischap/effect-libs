import { pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Option from 'effect/Option';

import * as MStruct from '@parischap/effect-lib/MStruct';
import * as PPNonPrimitiveParameters from '@parischap/pretty-print/PPNonPrimitiveParameters';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPPropertyFilter from '@parischap/pretty-print/PPPropertyFilter';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';
import * as PPValueOrder from '@parischap/pretty-print/PPValueOrder';

class Animal {
  constructor(
    public readonly species: string,
    public readonly legs: number,
  ) {}
}

class Dog extends Animal {
  constructor(public readonly name: string) {
    super('dog', 4);
  }
}

class WorkingDog extends Dog {
  constructor(
    name: string,
    public readonly job: string,
  ) {
    super(name);
  }
}

const recordWithProtoDepth = PPNonPrimitiveParameters.make({
  id: 'RecordWithProtoDepth',
  isApplicableTo: () => true,
  maxPrototypeDepth: 4,
  propertyFilter: PPPropertyFilter.none,
  propertySortOrder: Option.some(PPValueOrder.byProtoDepth),
});

const { stringify } = pipe(
  PPParameters.utilInspectLike,
  MStruct.append({
    id: 'WithPrototypeChain',
    nonPrimitiveParametersArray: Array.make(
      PPNonPrimitiveParameters.utilInspectLikeFunction,
      PPNonPrimitiveParameters.utilInspectLikeArray,
      PPNonPrimitiveParameters.utilInspectLikeIterable,
      recordWithProtoDepth,
    ),
    styleMap: PPParameters.darkModeUtilInspectLike.styleMap,
  }),
  PPParameters.make,
  PPStringifier.make,
);

console.log(pipe(new WorkingDog('Rex', 'guide'), stringify, PPStringifiedValue.toAnsiString()));
