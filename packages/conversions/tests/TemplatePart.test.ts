import * as TestUtils from "@parischap/configs/TestUtils";
import { CVTemplatePart, CVTemplatePlaceholder, CVTemplateSeparator } from "@parischap/conversions";
import { describe, it } from "vitest";

describe("CVTemplatePart", () => {
  const separator = CVTemplateSeparator.make("foo");
  const threeChars = CVTemplatePlaceholder.fixedLength({ name: "foo", length: 3 });

  describe("isPlaceholder", () => {
    it("Not passing", () => {
      TestUtils.assertFalse(CVTemplatePart.isPlaceholder(separator));
    });

    it("Passing", () => {
      TestUtils.assertTrue(CVTemplatePart.isPlaceholder(threeChars));
    });
  });

  describe("isSeparator", () => {
    it("Not passing", () => {
      TestUtils.assertFalse(CVTemplatePart.isSeparator(threeChars));
    });

    it("Passing", () => {
      TestUtils.assertTrue(CVTemplatePart.isSeparator(separator));
    });
  });
});
