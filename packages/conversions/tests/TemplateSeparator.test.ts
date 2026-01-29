import * as TestUtils from "@parischap/configs/TestUtils";
import { CVTemplateSeparator } from "@parischap/conversions";
import { describe, it } from "vitest";

describe("CVTemplateSeparator", () => {
  const separator = CVTemplateSeparator.make("foo");

  describe("Tag, prototype and guards", () => {
    it("moduleTag", () => {
      TestUtils.assertSome(
        TestUtils.moduleTagFromTestFilePath(__filename),
        CVTemplateSeparator.moduleTag,
      );
    });

    it(".pipe()", () => {
      TestUtils.assertTrue(separator.pipe(CVTemplateSeparator.has));
    });

    it(".toString()", () => {
      TestUtils.strictEqual(separator.toString(), "foo");
    });

    describe("has", () => {
      it("Matching", () => {
        TestUtils.assertTrue(CVTemplateSeparator.has(separator));
      });
      it("Non matching", () => {
        TestUtils.assertFalse(CVTemplateSeparator.has(new Date()));
      });
    });
  });

  describe("Parsing", () => {
    const parser = CVTemplateSeparator.toParser(separator);
    it("Not starting by value", () => {
      TestUtils.assertLeftMessage(
        parser(1, ""),
        "Expected remaining text for separator at position 1 to start with 'foo'. Actual: ''",
      );
      TestUtils.assertLeft(parser(1, "fo1 and bar"));
    });

    it("Passing", () => {
      TestUtils.assertRight(parser(1, "foo and bar"), " and bar");
    });
  });
});
