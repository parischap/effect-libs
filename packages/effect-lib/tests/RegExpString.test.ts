import * as TestUtils from '@parischap/configs/TestUtils';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString'
import * as MString from '@parischap/effect-lib/MString'
import {flow, pipe} from 'effect'
import * as Option from 'effect/Option'
import * as Struct from 'effect/Struct'
import { describe, it } from 'vitest';

describe('MRegExpString', () => {
  describe('unsignedNonNullBase10Int', () => {
    describe('No thousand separator', () => {
      const regExp = pipe(
        MRegExpString.unsignedNonNullBase10Int(''),
        MRegExpString.makeLine,
        RegExp,
      );

      it('Matching', () => {
        TestUtils.assertTrue(regExp.test('1'));
        TestUtils.assertTrue(regExp.test('18320'));
      });

      it('Non-matching', () => {
        TestUtils.assertFalse(regExp.test('0'));
        TestUtils.assertFalse(regExp.test('18 320'));
        TestUtils.assertFalse(regExp.test('018320'));
      });
    });

    describe('With space thousand separator', () => {
      const regExp = pipe(
        MRegExpString.unsignedNonNullBase10Int(' '),
        MRegExpString.makeLine,
        RegExp,
      );

      it('Matching', () => {
        TestUtils.assertTrue(regExp.test('1'));
        TestUtils.assertTrue(regExp.test('999'));
        TestUtils.assertTrue(regExp.test('18 320'));
      });

      it('Non-matching', () => {
        TestUtils.assertFalse(regExp.test('0'));
        TestUtils.assertFalse(regExp.test('18320'));
        TestUtils.assertFalse(regExp.test('1 8320'));
        TestUtils.assertFalse(regExp.test(' 18 320'));
        TestUtils.assertFalse(regExp.test('18 320 '));
        TestUtils.assertFalse(regExp.test('18  320'));
        TestUtils.assertFalse(regExp.test('018 320'));
      });
    });
  });

  describe('unsignedBase10Int', () => {
    describe('No thousand separator', () => {
      const regExp = pipe(MRegExpString.unsignedBase10Int(''), MRegExpString.makeLine, RegExp);

      it('Matching', () => {
        TestUtils.assertTrue(regExp.test('0'));
        TestUtils.assertTrue(regExp.test('1'));
        TestUtils.assertTrue(regExp.test('18320'));
      });

      it('Non-matching', () => {
        TestUtils.assertFalse(regExp.test('00'));
        TestUtils.assertFalse(regExp.test('18 320'));
        TestUtils.assertFalse(regExp.test('018320'));
      });
    });

    describe('With dot thousand separator', () => {
      const regExp = pipe(MRegExpString.unsignedBase10Int('.'), MRegExpString.makeLine, RegExp);

      it('Matching', () => {
        TestUtils.assertTrue(regExp.test('0'));
        TestUtils.assertTrue(regExp.test('1'));
        TestUtils.assertTrue(regExp.test('999'));
        TestUtils.assertTrue(regExp.test('18.320'));
      });

      it('Non-matching', () => {
        TestUtils.assertFalse(regExp.test('18320'));
        TestUtils.assertFalse(regExp.test('1.8320'));
      });
    });
  });

  describe('base10Number', () => {
    const getParts = (params: {
      readonly thousandSeparator: string;
      readonly fractionalSeparator: string;
      readonly eNotationChars: ReadonlyArray<string>;
      readonly fillChar: string;
    }) =>
      flow(
        MString.matchWithCapturingGroups(
          pipe(params, MRegExpString.base10Number, MRegExpString.makeLine, RegExp),
          [
            'signPart',
            'fillChars',
            'mantissaIntegerPart',
            'mantissaFractionalPart',
            'exponentPart',
          ],
        ),
        Option.map(Struct.get('groups')),
      );

    describe('With no thousand separator and usual parameters', () => {
      const getPartsWithNoSep = getParts({
        thousandSeparator: '',
        fractionalSeparator: '.',
        eNotationChars: ['E', 'e'],
        fillChar: ' ',
      });
      it('Simple number', () => {
        TestUtils.assertSome(getPartsWithNoSep('12'), {
          signPart: '',
          fillChars: '',
          mantissaIntegerPart: '12',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Simple number starting with fillChar', () => {
        TestUtils.assertSome(getPartsWithNoSep('  12'), {
          signPart: '',
          fillChars: '  ',
          mantissaIntegerPart: '12',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Complex number', () => {
        TestUtils.assertSome(getPartsWithNoSep('+  18320.45e-2'), {
          signPart: '+',
          fillChars: '  ',
          mantissaIntegerPart: '18320',
          mantissaFractionalPart: '45',
          exponentPart: '-2',
        });
      });

      it('Not passing', () => {
        TestUtils.assertNone(getPartsWithNoSep(' +18320.45e-2'));
        TestUtils.assertNone(getPartsWithNoSep('18A'));
      });
    });

    describe('With space thousand separator and ^ as exponent', () => {
      const getPartsWithSep = getParts({
        thousandSeparator: ' ',
        fractionalSeparator: '.',
        eNotationChars: ['^'],
        fillChar: ' ',
      });

      it('Simple number', () => {
        TestUtils.assertSome(getPartsWithSep('12 430'), {
          signPart: '',
          fillChars: '',
          mantissaIntegerPart: '12 430',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Simple number starting with fillChar', () => {
        TestUtils.assertSome(getPartsWithSep('  12 430'), {
          signPart: '',
          fillChars: '  ',
          mantissaIntegerPart: '12 430',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Complex number', () => {
        TestUtils.assertSome(getPartsWithSep('+  18 320.45^2'), {
          signPart: '+',
          fillChars: '  ',
          mantissaIntegerPart: '18 320',
          mantissaFractionalPart: '45',
          exponentPart: '2',
        });
      });

      it('Not passing', () => {
        TestUtils.assertNone(getPartsWithSep(' +18 320.45^2'));
        TestUtils.assertNone(getPartsWithSep('18A'));
      });
    });

    describe('With no fillChar', () => {
      const getPartsWithNoFillChar = getParts({
        thousandSeparator: ' ',
        fractionalSeparator: '.',
        eNotationChars: ['E', 'e'],
        fillChar: '',
      });

      it('Simple number', () => {
        TestUtils.assertSome(getPartsWithNoFillChar('12'), {
          signPart: '',
          fillChars: '',
          mantissaIntegerPart: '12',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Complex number', () => {
        TestUtils.assertSome(getPartsWithNoFillChar('+18 320.45e-2'), {
          signPart: '+',
          fillChars: '',
          mantissaIntegerPart: '18 320',
          mantissaFractionalPart: '45',
          exponentPart: '-2',
        });
      });

      it('Not passing', () => {
        TestUtils.assertNone(getPartsWithNoFillChar(' +18 320.45e-2'));
        TestUtils.assertNone(getPartsWithNoFillChar('18A'));
        TestUtils.assertNone(getPartsWithNoFillChar('  12'));
        TestUtils.assertNone(getPartsWithNoFillChar('+  18 320.45e-2'));
      });
    });
  });
});
