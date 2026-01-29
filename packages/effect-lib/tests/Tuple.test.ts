import * as TestUtils from "@parischap/configs/TestUtils";
import { MTuple } from "@parischap/effect-lib";
import { Array, Number, pipe, Tuple } from "effect";
import { describe, it } from "vitest";

describe("MTuple", () => {
  describe("make", () => {
    it("With Array.map", () => {
      TestUtils.deepStrictEqual(
        pipe(Array.make(1, 2), Array.map(MTuple.fromSingleValue)),
        Array.make(Tuple.make(1), Tuple.make(2)),
      );
    });
  });

  describe("makeBoth", () => {
    it("From number", () => {
      TestUtils.deepStrictEqual(MTuple.makeBoth(1), Tuple.make(1, 1));
    });
  });

  describe("makeBothBy", () => {
    it("From number", () => {
      TestUtils.deepStrictEqual(
        pipe(1, MTuple.makeBothBy({ toFirst: Number.sum(1), toSecond: Number.multiply(2) })),
        Tuple.make(2, 2),
      );
    });
  });

  describe("prepend", () => {
    it("From number", () => {
      TestUtils.deepStrictEqual(pipe(1, Tuple.make, MTuple.prependElement(2)), Tuple.make(2, 1));
    });
  });

  describe("firstTwo", () => {
    it("From number tuple", () => {
      TestUtils.deepStrictEqual(MTuple.firstTwo(Tuple.make(1, 2, 3)), Tuple.make(1, 2));
    });
  });
});
