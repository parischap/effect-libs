import { ASContextStyler, ASPalette, ASStyle } from "@parischap/ansi-styles";
import * as TestUtils from "@parischap/configs/TestUtils";
import { describe, it } from "vitest";

describe("ContextStyler", () => {
  interface Value {
    readonly pos1: number;
    readonly otherStuff: string;
  }

  const red: ASContextStyler.Type<Value> = ASContextStyler.red();

  const pos1 = (value: Value): number => value.pos1;

  const pos1BasedAllColorsFormatter = ASContextStyler.fromPalette({
    indexFromContext: pos1,
    palette: ASPalette.allStandardOriginalColors,
  });

  const value1: Value = {
    pos1: 2,
    otherStuff: "dummy",
  };

  const value2: Value = {
    pos1: 9,
    otherStuff: "dummy",
  };

  const redInValue1Context = red(value1);
  const pos1BasedAllColorsFormatterInValue1Context = pos1BasedAllColorsFormatter(value1);
  const pos1BasedAllColorsFormatterInValue2Context = pos1BasedAllColorsFormatter(value2);

  describe("Tag, prototype and guards", () => {
    it("moduleTag", () => {
      TestUtils.assertSome(
        TestUtils.moduleTagFromTestFilePath(__filename),
        ASContextStyler.moduleTag,
      );
    });

    describe("Equal.equals", () => {
      it("Matching", () => {
        TestUtils.assertEquals(red, ASContextStyler.fromSingleStyle(ASStyle.red));
      });

      it("Non-matching", () => {
        TestUtils.assertNotEquals(red, ASContextStyler.black());
      });
    });

    it(".toString()", () => {
      TestUtils.strictEqual(red.toString(), "RedFormatter");
      TestUtils.strictEqual(
        pos1BasedAllColorsFormatter.toString(),
        "Pos1BasedBlack/Red/Green/Yellow/Blue/Magenta/Cyan/WhitePaletteFormatter",
      );
    });

    it(".pipe()", () => {
      TestUtils.assertTrue(red.pipe(ASContextStyler.has));
    });

    describe("has", () => {
      it("Matching", () => {
        TestUtils.assertTrue(ASContextStyler.has(red));
        TestUtils.assertTrue(ASContextStyler.has(pos1BasedAllColorsFormatter));
      });
      it("Non matching", () => {
        TestUtils.assertFalse(ASContextStyler.has(new Date()));
      });
    });
  });

  describe("Action", () => {
    it("FromSingleStyle", () => {
      TestUtils.assertEquals(redInValue1Context("foo"), ASStyle.red("foo"));
    });

    it("From Palette context first within bounds", () => {
      TestUtils.assertEquals(
        pos1BasedAllColorsFormatterInValue1Context("foo"),
        ASStyle.green("foo"),
      );
    });

    it("From Palette context first out of bounds", () => {
      TestUtils.assertEquals(pos1BasedAllColorsFormatterInValue2Context("foo"), ASStyle.red("foo"));
    });

    it("From Palette context last", () => {
      TestUtils.assertEquals(
        pos1BasedAllColorsFormatter.withContextLast("foo")(value1),
        ASStyle.green("foo"),
      );
    });
  });
});
