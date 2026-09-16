import { describe, it } from '@effect/vitest';
import type * as Equal from 'effect/Equal';
import type * as Types from 'effect/Types';

import * as TestUtils from '@parischap/configs/TestUtils';
import type * as MTypes from '@parischap/effect-lib/MTypes';

const testSymbol: unique symbol = Symbol.for('testSymbol');

class TestClass {
  readonly n: number;
  constructor(n: number) {
    this.n = n;
  }
}

const testInstance = new TestClass(4);

/** Object */
TestUtils.assertTrueType(TestUtils.doesNotSatisfy<1, MTypes.Object>());
TestUtils.assertTrueType(TestUtils.doesNotSatisfy<null, MTypes.Object>());
TestUtils.assertTrueType(TestUtils.doesNotSatisfy<undefined, MTypes.Object>());
TestUtils.assertTrueType(TestUtils.doesNotSatisfy<() => 1, MTypes.Object>());
TestUtils.assertTrueType(TestUtils.doesNotSatisfy<[1], MTypes.Object>());
TestUtils.assertTrueType(TestUtils.doesNotSatisfy<typeof testInstance, MTypes.Object>());
TestUtils.assertTrueType(TestUtils.satisfies<{ a: 1 }, MTypes.Object>());

/** NonPrimitive */
TestUtils.assertTrueType(TestUtils.doesNotSatisfy<1, MTypes.NonPrimitive>());
TestUtils.assertTrueType(TestUtils.doesNotSatisfy<null, MTypes.NonPrimitive>());
TestUtils.assertTrueType(TestUtils.doesNotSatisfy<undefined, MTypes.NonPrimitive>());
TestUtils.assertTrueType(TestUtils.satisfies<() => 1, MTypes.NonPrimitive>());
TestUtils.assertTrueType(TestUtils.satisfies<[1], MTypes.NonPrimitive>());
TestUtils.assertTrueType(TestUtils.satisfies<typeof testInstance, MTypes.NonPrimitive>());
TestUtils.assertTrueType(TestUtils.satisfies<{ a: 1 }, MTypes.NonPrimitive>());

interface TestInterface {
  readonly a: number;
  readonly b: string;
  readonly toString: () => string;
  _foo(): string;
  [testSymbol](): string;
  [Equal.symbol](): boolean;
}

/** Data */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    Types.Simplify<MTypes.Data<TestInterface>>,
    {
      readonly a: number;
      readonly b: string;
    }
  >(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    Types.Simplify<MTypes.Data<TestInterface, 'a'>>,
    {
      readonly a?: number;
      readonly b: string;
    }
  >(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    Types.Simplify<MTypes.Data<TestInterface, 'a' | 'b'>>,
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
