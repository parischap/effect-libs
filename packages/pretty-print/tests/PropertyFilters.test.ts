import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPPropertyFilter from '@parischap/pretty-print/PPPropertyFilter'
import * as PPPropertyFilters from '@parischap/pretty-print/PPPropertyFilters'
import * as PPValue from '@parischap/pretty-print/PPValue'
import * as PPValues from '@parischap/pretty-print/PPValues'
import {pipe} from 'effect'
import * as Array from 'effect/Array'
import { describe, it } from 'vitest';

describe('PropertyFilters', () => {
  const value1 = PPValue.fromTopValue({
    content: 1,
  });
  const value2 = PPValue.fromTopValue(Math.max);

  const value3 = PPValue.fromNonPrimitiveValueAndKey({
    nonPrimitive: [1, 2],
    key: 'length',
    depth: 0,
    protoDepth: 0,
  });
  const value4 = PPValue.fromNonPrimitiveValueAndKey({
    nonPrimitive: { [Symbol.iterator]: 1, a: 2 },
    key: Symbol.iterator,
    depth: 0,
    protoDepth: 0,
  });
  const values: PPValues.Type = Array.make(value1, value2, value3, value4);

  it('toSyntheticPropertyFilter', () => {
    const filters: PPPropertyFilters.Type = Array.make(
      PPPropertyFilter.removeFunctions,
      PPPropertyFilter.removeNonEnumerables,
    );
    const removeFunctionsAndNonEnumerables = PPPropertyFilters.toSyntheticPropertyFilter(filters);
    TestUtils.deepStrictEqual(pipe(values, removeFunctionsAndNonEnumerables), Array.of(value4));
  });
});
