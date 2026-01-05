import * as TestUtils from "@parischap/configs/TestUtils";
import { MFunction } from "@parischap/effect-lib";
import { Number, pipe, String } from "effect";
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

  it("once", () => {
    let a = 0;
    const complexFoo = () => a++;
    const memoized = MFunction.once(complexFoo);
    TestUtils.strictEqual(memoized(), 0);
    TestUtils.strictEqual(memoized(), 0);
  });

  it("applyAsMethod", () => {
    TestUtils.strictEqual(pipe(Array.prototype.pop, MFunction.applyAsThis([1, 2])), 2);
  });

  it("execute", () => {
    TestUtils.strictEqual(
      pipe(() => 1, MFunction.execute),
      1,
    );
  });

  it("clone", () => {
    const incCopy = MFunction.clone(Number.increment);
    TestUtils.assertFalse(incCopy === Number.increment);
    TestUtils.strictEqual(incCopy(1), 2);
  });
});
