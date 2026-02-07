import * as TestUtils from "@parischap/configs/TestUtils";
import { CVRoundingMode } from "@parischap/conversions";
import { describe, it } from "vitest";

describe("CVRoundingMode", () => {
  describe("toCorrecter", () => {
    it("Ceil", () => {
      const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.Ceil);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), 0);
    });

    it("Floor", () => {
      const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.Floor);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), -1);
    });

    it("Expand", () => {
      const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.Expand);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), -1);
    });

    it("Trunc", () => {
      const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.Trunc);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 0, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 1, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -1, isEven: false }), 0);
    });

    it("HalfCeil", () => {
      const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.HalfCeil);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -6, isEven: false }), -1);
    });

    it("HalfFloor", () => {
      const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.HalfFloor);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 6, isEven: false }), 1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: false }), 0);
    });

    it("HalfExpand", () => {
      const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.HalfExpand);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: false }), 0);
    });

    it("HalfEven", () => {
      const correcter = CVRoundingMode.toCorrecter(CVRoundingMode.Type.HalfEven);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 6, isEven: true }), 1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: true }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: true }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -6, isEven: true }), -1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: true }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: true }), 0);

      TestUtils.strictEqual(correcter({ firstFollowingDigit: 6, isEven: false }), 1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 5, isEven: false }), 1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: 4, isEven: false }), 0);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -6, isEven: false }), -1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -5, isEven: false }), -1);
      TestUtils.strictEqual(correcter({ firstFollowingDigit: -4, isEven: false }), 0);
    });
  });
});
