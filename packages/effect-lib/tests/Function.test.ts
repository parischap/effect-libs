import * as TestUtils from "@parischap/configs/TestUtils";
import * as MFunction from '@parischap/effect-lib/MFunction'
import {pipe} from 'effect'
import * as Number from 'effect/Number'
import * as String from 'effect/String'
import { describe, it } from "vitest";

describe("MFunction", () => {
  describe("fIfTrue", () => {
    it("Matching", () => {
      TestUtils.strictEqual(
        pipe(1 as number, MFunction.fIfTrue({ condition: true, f: Number.increment })),
        2,
      );
    });

    it("Non-matching", () => {
      TestUtils.strictEqual(
        pipe(1 as number, MFunction.fIfTrue({ condition: false, f: Number.increment })),
        1,
      );
    });
  });

  it("flipDual", () => {
    TestUtils.strictEqual(pipe(2, MFunction.flipDual(String.takeLeft)("foo")), "fo");
  });

  it("parameterNumber", () => {
    TestUtils.strictEqual(
      pipe((m: number, n: number) => m + n, MFunction.parameterNumber),
      2,
    );
  });

  it("name", () => {
    TestUtils.strictEqual(pipe(Math.max, MFunction.name), "max");
  });

  describe("once", () => {
    it("Returns the computed value on the first call", () => {
      let a = 0;
      const complexFoo = () => a++;
      const memoized = MFunction.once(complexFoo);
      TestUtils.strictEqual(memoized(), 0);
    });

    it("Returns the cached value on subsequent calls", () => {
      let a = 0;
      const complexFoo = () => a++;
      const memoized = MFunction.once(complexFoo);
      memoized(); // prime the cache
      TestUtils.strictEqual(memoized(), 0);
    });
  });

  it("applyAsThis", () => {
    TestUtils.strictEqual(pipe(Array.prototype.pop, MFunction.applyAsThis([1, 2])), 2);
  });

  it("execute", () => {
    TestUtils.strictEqual(
      pipe(() => 1, MFunction.execute),
      1,
    );
  });

  describe("clone", () => {
    it("Creates a distinct function reference", () => {
      const incCopy = MFunction.clone(Number.increment);
      TestUtils.assertFalse(incCopy === Number.increment);
    });

    it("Behaves identically to the original function", () => {
      const incCopy = MFunction.clone(Number.increment);
      TestUtils.strictEqual(incCopy(1), 2);
    });
  });

  it("constEmptyString", () => {
    TestUtils.strictEqual(MFunction.constEmptyString(), '');
  });

  it("constIdentity", () => {
    TestUtils.strictEqual(MFunction.constIdentity()(5), 5);
  });
});
