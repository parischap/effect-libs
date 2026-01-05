import * as TestUtils from "@parischap/configs/TestUtils";
import { MRegExpString, MString } from "@parischap/effect-lib";
import { Function, pipe, Tuple } from "effect";
import { describe, it } from "vitest";

describe("MRegExpString", () => {
  describe("unsignedNonNullBase10Int", () => {
    describe("No thousand separator", () => {
      const regExp = pipe(
        MRegExpString.unsignedNonNullBase10Int(""),
        MRegExpString.makeLine,
        RegExp,
      );

      it("Matching", () => {
        TestUtils.assertTrue(regExp.test("1"));
        TestUtils.assertTrue(regExp.test("18320"));
      });

      it("Non-matching", () => {
        TestUtils.assertFalse(regExp.test("0"));
        TestUtils.assertFalse(regExp.test("18 320"));
        TestUtils.assertFalse(regExp.test("018320"));
      });
    });

    describe("With space thousand separator", () => {
      const regExp = pipe(
        MRegExpString.unsignedNonNullBase10Int(" "),
        MRegExpString.makeLine,
        RegExp,
      );

      it("Matching", () => {
        TestUtils.assertTrue(regExp.test("1"));
        TestUtils.assertTrue(regExp.test("999"));
        TestUtils.assertTrue(regExp.test("18 320"));
      });

      it("Non-matching", () => {
        TestUtils.assertFalse(regExp.test("0"));
        TestUtils.assertFalse(regExp.test("18320"));
        TestUtils.assertFalse(regExp.test("1 8320"));
        TestUtils.assertFalse(regExp.test(" 18 320"));
        TestUtils.assertFalse(regExp.test("18 320 "));
        TestUtils.assertFalse(regExp.test("18  320"));
        TestUtils.assertFalse(regExp.test("018 320"));
      });
    });
  });

  describe("unsignedBase10Int", () => {
    describe("No thousand separator", () => {
      const regExp = pipe(MRegExpString.unsignedBase10Int(""), MRegExpString.makeLine, RegExp);

      it("Matching", () => {
        TestUtils.assertTrue(regExp.test("0"));
        TestUtils.assertTrue(regExp.test("1"));
        TestUtils.assertTrue(regExp.test("18320"));
      });

      it("Non-matching", () => {
        TestUtils.assertFalse(regExp.test("00"));
        TestUtils.assertFalse(regExp.test("18 320"));
        TestUtils.assertFalse(regExp.test("018320"));
      });
    });

    describe("With dot thousand separator", () => {
      const regExp = pipe(MRegExpString.unsignedBase10Int("."), MRegExpString.makeLine, RegExp);

      it("Matching", () => {
        TestUtils.assertTrue(regExp.test("0"));
        TestUtils.assertTrue(regExp.test("1"));
        TestUtils.assertTrue(regExp.test("999"));
        TestUtils.assertTrue(regExp.test("18.320"));
      });

      it("Non-matching", () => {
        TestUtils.assertFalse(regExp.test("18320"));
        TestUtils.assertFalse(regExp.test("1.8320"));
      });
    });
  });

  describe("base10Number", () => {
    const getParts = (params: {
      readonly thousandSeparator: string;
      readonly fractionalSeparator: string;
      readonly eNotationChars: ReadonlyArray<string>;
      readonly fillChar: string;
    }) =>
      pipe(
        params,
        MRegExpString.base10Number,
        MRegExpString.makeLine,
        RegExp,
        Tuple.make,
        Tuple.appendElement(5),
        Function.tupled(MString.capturedGroups),
      );

    describe("With no thousand separator and usual parameters", () => {
      const getPartsWithNoSep = getParts({
        thousandSeparator: "",
        fractionalSeparator: ".",
        eNotationChars: ["E", "e"],
        fillChar: " ",
      });
      it("Simple number", () => {
        TestUtils.assertSome(getPartsWithNoSep("12"), Tuple.make("", "", "12", "", ""));
      });

      it("Simple number starting with fillChar", () => {
        TestUtils.assertSome(getPartsWithNoSep("  12"), Tuple.make("", "  ", "12", "", ""));
      });

      it("Complex number", () => {
        TestUtils.assertSome(
          getPartsWithNoSep("+  18320.45e-2"),
          Tuple.make("+", "  ", "18320", "45", "-2"),
        );
      });

      it("Not passing", () => {
        TestUtils.assertNone(getPartsWithNoSep(" +18320.45e-2"));
        TestUtils.assertNone(getPartsWithNoSep("18A"));
      });
    });

    describe("With space thousand separator and ^ as exponent", () => {
      const getPartsWithSep = getParts({
        thousandSeparator: " ",
        fractionalSeparator: ".",
        eNotationChars: ["^"],
        fillChar: " ",
      });

      it("Simple number", () => {
        TestUtils.assertSome(getPartsWithSep("12 430"), Tuple.make("", "", "12 430", "", ""));
      });

      it("Simple number starting with fillChar", () => {
        TestUtils.assertSome(getPartsWithSep("  12 430"), Tuple.make("", "  ", "12 430", "", ""));
      });

      it("Complex number", () => {
        TestUtils.assertSome(
          getPartsWithSep("+  18 320.45^2"),
          Tuple.make("+", "  ", "18 320", "45", "2"),
        );
      });

      it("Not passing", () => {
        TestUtils.assertNone(getPartsWithSep(" +18 320.45^2"));
        TestUtils.assertNone(getPartsWithSep("18A"));
      });
    });

    describe("With no fillChar", () => {
      const getPartsWithNoFillChar = getParts({
        thousandSeparator: " ",
        fractionalSeparator: ".",
        eNotationChars: ["E", "e"],
        fillChar: "",
      });

      it("Simple number", () => {
        TestUtils.assertSome(getPartsWithNoFillChar("12"), Tuple.make("", "", "12", "", ""));
      });

      it("Complex number", () => {
        TestUtils.assertSome(
          getPartsWithNoFillChar("+18 320.45e-2"),
          Tuple.make("+", "", "18 320", "45", "-2"),
        );
      });

      it("Not passing", () => {
        TestUtils.assertNone(getPartsWithNoFillChar(" +18 320.45e-2"));
        TestUtils.assertNone(getPartsWithNoFillChar("18A"));
        TestUtils.assertNone(getPartsWithNoFillChar("  12"));
        TestUtils.assertNone(getPartsWithNoFillChar("+  18 320.45e-2"));
      });
    });
  });
});
