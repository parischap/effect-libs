import * as TestUtils from "@parischap/configs/TestUtils";
import { CVBigInt, CVInteger, CVPositiveInteger, CVReal } from "@parischap/conversions";
import { describe, it } from "vitest";

describe("CVBigInt", () => {
  it("From Integer", () => {
    TestUtils.deepStrictEqual(CVBigInt.fromInteger(CVInteger.unsafeFromNumber(-154)), -154n);
  });

  it("From PositiveInteger", () => {
    TestUtils.deepStrictEqual(CVBigInt.fromInteger(CVPositiveInteger.unsafeFromNumber(154)), 154n);
  });

  describe("Conversions from Real", () => {
    const notPassing = CVReal.unsafeFromNumber(15.4);
    const passing = CVReal.unsafeFromNumber(15);
    const bigint = 15n;

    describe("fromRealOption", () => {
      it("Not passing", () => {
        TestUtils.assertNone(CVBigInt.fromRealOption(notPassing));
      });
      it("Passing", () => {
        TestUtils.assertSome(CVBigInt.fromRealOption(passing), bigint);
      });
    });

    describe("fromReal", () => {
      it("Not passing", () => {
        TestUtils.assertLeft(CVBigInt.fromReal(notPassing));
      });
      it("Passing", () => {
        TestUtils.assertRight(CVBigInt.fromReal(passing), bigint);
      });
    });

    describe("fromRealOrThrow", () => {
      it("Not passing", () => {
        TestUtils.throws(() => CVBigInt.fromRealOrThrow(notPassing));
      });
      it("Passing", () => {
        TestUtils.strictEqual(CVBigInt.fromRealOrThrow(passing), bigint);
      });
    });
  });
});
