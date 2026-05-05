import * as Equal from 'effect/Equal';

import * as TestUtils from '@parischap/configs/TestUtils';
import type * as MTypes from '@parischap/effect-lib/MTypes';

import { describe, it } from 'vitest';

const testSymbol: unique symbol = Symbol.for('testSymbol');

interface TestInterface {
  readonly a: number;
  readonly b: string;
  readonly toString: () => string;
  _foo(): string;
  [testSymbol](): string;
  [Equal.symbol](): boolean;
}

//type TestTuple = readonly [number, boolean, string];
//type TestOneArgFunction = typeof Number.increment;

/** Tuple */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.Tuple<string, 2 | 3>,
    [string, string] | [string, string, string]
  >(),
);
TestUtils.assertTrueType(TestUtils.areEqualTypes<MTypes.Tuple<string, number>, Array<string>>());

/** ReadonlyTuple */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.ReadonlyTuple<string, 2 | 3>,
    readonly [string, string] | readonly [string, string, string]
  >(),
);
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MTypes.ReadonlyTuple<string, number>, ReadonlyArray<string>>(),
);

/** Data */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.Data<TestInterface>,
    {
      readonly a: number;
      readonly b: string;
    }
  >(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.Data<TestInterface, 'a'>,
    {
      readonly a?: number;
      readonly b: string;
    }
  >(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MTypes.Data<TestInterface, 'a' | 'b'>,
    {
      readonly a?: number;
      readonly b?: string;
    }
  >(),
);

/** ToKeyIntersection */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<MTypes.ToKeyIntersection<readonly [5, 6]>, 5 & 6>(),
);

/** IntersectAndSimplify */
TestUtils.assertTrueType(TestUtils.areEqualTypes<MTypes.IntersectAndSimplify<number, 5>, 5>());

describe('MTypes', () => {
  it('Type-level assertions compile', () => {
    // All assertions in this file are type-level only; this runtime test
    // exists so that vitest registers a suite for the file.
  });
});
