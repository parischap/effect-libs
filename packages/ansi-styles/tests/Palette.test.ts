import { ASPalette, ASStyle } from "@parischap/ansi-styles";
import * as TestUtils from "@parischap/configs/TestUtils";
import { pipe } from "effect";
import { describe, it } from "vitest";

describe("ASPalette", () => {
  const blackRed = ASPalette.make(ASStyle.black, ASStyle.red);

  describe("Tag, prototype and guards", () => {
    it("moduleTag", () => {
      TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), ASPalette.moduleTag);
    });

    describe("Equal.equals", () => {
      it("Matching", () => {
        TestUtils.assertEquals(blackRed, ASPalette.make(ASStyle.black, ASStyle.red));
      });

      it("Non-matching", () => {
        TestUtils.assertNotEquals(ASPalette.allOriginalColors, blackRed);
      });
    });

    describe(".toString()", () => {
      it("Black and red", () => {
        TestUtils.strictEqual(blackRed.toString(), "Black/RedPalette");
      });
    });

    it(".pipe()", () => {
      TestUtils.assertTrue(blackRed.pipe(ASPalette.has));
    });

    describe("has", () => {
      it("Matching", () => {
        TestUtils.assertTrue(ASPalette.has(blackRed));
      });
      it("Non matching", () => {
        TestUtils.assertFalse(ASPalette.has(new Date()));
      });
    });
  });

  it("append", () => {
    TestUtils.assertEquals(
      pipe(
        ASPalette.make(ASStyle.black, ASStyle.red, ASStyle.green, ASStyle.yellow),
        ASPalette.append(
          ASPalette.make(ASStyle.blue, ASStyle.magenta, ASStyle.cyan, ASStyle.white),
        ),
      ),
      ASPalette.allStandardOriginalColors,
    );
  });
});
