import * as TestUtils from "@parischap/configs/TestUtils";
import { CVRoundingMode, CVRoundingOption } from "@parischap/conversions";
import { MNumber } from "@parischap/effect-lib";
import { BigDecimal, Equal, pipe } from "effect";
import { describe, it } from "vitest";

describe("CVRoundingOption", () => {
  const roundingOption = CVRoundingOption.make({
    precision: 3,
    roundingMode: CVRoundingMode.Type.HalfEven,
  });

  describe("Tag, prototype and guards", () => {
    it("moduleTag", () => {
      TestUtils.assertSome(
        TestUtils.moduleTagFromTestFilePath(__filename),
        CVRoundingOption.moduleTag,
      );
    });

    describe("Equal.equals", () => {
      it("Matching", () => {
        TestUtils.assertTrue(
          Equal.equals(
            roundingOption,
            CVRoundingOption.make({
              precision: 3,
              roundingMode: CVRoundingMode.Type.HalfEven,
            }),
          ),
        );
      });

      it("Non-matching", () => {
        TestUtils.assertNotEquals(
          roundingOption,
          CVRoundingOption.make({
            precision: 2,
            roundingMode: CVRoundingMode.Type.HalfEven,
          }),
        );
      });
    });

    it(".toString()", () => {
      TestUtils.strictEqual(roundingOption.toString(), "HalfEvenRounderWith3Precision");
    });

    it(".pipe()", () => {
      TestUtils.assertTrue(roundingOption.pipe(CVRoundingOption.has));
    });

    describe("has", () => {
      it("Matching", () => {
        TestUtils.assertTrue(CVRoundingOption.has(roundingOption));
      });
      it("Non matching", () => {
        TestUtils.assertFalse(CVRoundingOption.has(new Date()));
      });
    });
  });

  describe("toNumberRounder", () => {
    const rounder = CVRoundingOption.toNumberRounder(roundingOption);
    it("Even number", () => {
      TestUtils.assertTrue(pipe(0.4566, rounder, MNumber.equals(0.457)));
    });
    it("Odd number", () => {
      TestUtils.assertTrue(pipe(-0.4564, rounder, MNumber.equals(-0.456)));
    });
  });

  describe("toBigDecimalRounder", () => {
    const rounder = CVRoundingOption.toBigDecimalRounder(roundingOption);
    it("Even number", () => {
      TestUtils.assertEquals(rounder(BigDecimal.make(4566n, 4)), BigDecimal.make(457n, 3));
    });
    it("Odd number", () => {
      TestUtils.assertEquals(rounder(BigDecimal.make(-4564n, 4)), BigDecimal.make(-456n, 3));
    });
  });
});
