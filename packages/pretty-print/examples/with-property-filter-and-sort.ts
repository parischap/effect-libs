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

const recordWithFilterAndSort = PPNonPrimitiveParameters.make({
  id: 'RecordWithFilterAndSort',
  isApplicableTo: () => true,
  // Hide function-valued properties
  propertyFilter: PPPropertyFilter.removeFunctions,
  // Then alphabetize by string key
  propertySortOrder: Option.some(PPValueOrder.byOneLineStringKey),
});

const { stringify } = pipe(
  PPParameters.utilInspectLike,
  MStruct.append({
    id: 'WithPropertyFilterAndSort',
    nonPrimitiveParametersArray: Array.make(
      PPNonPrimitiveParameters.utilInspectLikeFunction,
      PPNonPrimitiveParameters.utilInspectLikeArray,
      PPNonPrimitiveParameters.utilInspectLikeIterable,
      recordWithFilterAndSort,
    ),
    styleMap: PPParameters.darkModeUtilInspectLike.styleMap,
  }),
  PPParameters.make,
  PPStringifier.make,
);

const toPrint = {
  zeta: 'last in unsorted order',
  alpha: 'first after sorting',
  toString: () => 'should be hidden by removeFunctions',
  middle: 42,
  beta: true,
};

console.log(pipe(toPrint, stringify, PPStringifiedValue.toAnsiString()));
