import * as TestUtils from "@parischap/configs/TestUtils";
import { CVDateTimeFormatContext } from "@parischap/conversions";
import { describe, it } from "vitest";

describe("CVDateTimeFormatContext", () => {
  const enGBContext = CVDateTimeFormatContext.enGB;

  describe("Prototype and guards", () => {
    it(".toString()", () => {
      TestUtils.strictEqual(enGBContext.toString(), "en-GB");
    });

    it(".pipe()", () => {
      TestUtils.assertTrue(enGBContext.pipe(CVDateTimeFormatContext.has));
    });

    describe("has", () => {
      it("Matching", () => {
        TestUtils.assertTrue(CVDateTimeFormatContext.has(enGBContext));
      });
      it("Non matching", () => {
        TestUtils.assertFalse(CVDateTimeFormatContext.has(new Date()));
      });
    });
  });

  it("fromLocale", () => {
    TestUtils.assertSome(CVDateTimeFormatContext.fromLocale("en-US"));
  });
});
