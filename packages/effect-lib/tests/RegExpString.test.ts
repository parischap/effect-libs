import { assert, describe, it } from '@effect/vitest';
import { flow, pipe } from 'effect';
import * as Option from 'effect/Option';
import * as Struct from 'effect/Struct';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MRegExpString from '@parischap/effect-lib/MRegExpString';
import * as MString from '@parischap/effect-lib/MString';

describe('MRegExpString', () => {
  describe('unsignedNonNullBase10Int', () => {
    describe('No thousand separator', () => {
      const regExp = pipe(
        MRegExpString.unsignedNonNullBase10Int(''),
        MRegExpString.makeLine,
        RegExp,
      );

      it('Single digit', () => {
        assert.isTrue(regExp.test('1'));
      });

      it('Multi-digit number', () => {
        assert.isTrue(regExp.test('18320'));
      });

      it('Zero', () => {
        assert.isFalse(regExp.test('0'));
      });

      it('Number with space', () => {
        assert.isFalse(regExp.test('18 320'));
      });

      it('Leading zero', () => {
        assert.isFalse(regExp.test('018320'));
      });
    });

    describe('With space thousand separator', () => {
      const regExp = pipe(
        MRegExpString.unsignedNonNullBase10Int(' '),
        MRegExpString.makeLine,
        RegExp,
      );

      it('Single digit', () => {
        assert.isTrue(regExp.test('1'));
      });

      it('Three-digit number', () => {
        assert.isTrue(regExp.test('999'));
      });

      it('Number with space separator', () => {
        assert.isTrue(regExp.test('18 320'));
      });

      it('Zero', () => {
        assert.isFalse(regExp.test('0'));
      });

      it('Number without space separator', () => {
        assert.isFalse(regExp.test('18320'));
      });

      it('Wrong grouping', () => {
        assert.isFalse(regExp.test('1 8320'));
      });

      it('Leading space', () => {
        assert.isFalse(regExp.test(' 18 320'));
      });

      it('Trailing space', () => {
        assert.isFalse(regExp.test('18 320 '));
      });

      it('Double space separator', () => {
        assert.isFalse(regExp.test('18  320'));
      });

      it('Leading zero', () => {
        assert.isFalse(regExp.test('018 320'));
      });
    });
  });

  describe('unsignedBase10Int', () => {
    describe('No thousand separator', () => {
      const regExp = pipe(MRegExpString.unsignedBase10Int(''), MRegExpString.makeLine, RegExp);

      it('Zero', () => {
        assert.isTrue(regExp.test('0'));
      });

      it('Single digit', () => {
        assert.isTrue(regExp.test('1'));
      });

      it('Multi-digit number', () => {
        assert.isTrue(regExp.test('18320'));
      });

      it('Two zeros', () => {
        assert.isFalse(regExp.test('00'));
      });

      it('Number with space', () => {
        assert.isFalse(regExp.test('18 320'));
      });

      it('Leading zero', () => {
        assert.isFalse(regExp.test('018320'));
      });
    });

    describe('With dot thousand separator', () => {
      const regExp = pipe(MRegExpString.unsignedBase10Int('.'), MRegExpString.makeLine, RegExp);

      it('Zero', () => {
        assert.isTrue(regExp.test('0'));
      });

      it('Single digit', () => {
        assert.isTrue(regExp.test('1'));
      });

      it('Three-digit number', () => {
        assert.isTrue(regExp.test('999'));
      });

      it('Number with dot separator', () => {
        assert.isTrue(regExp.test('18.320'));
      });

      it('Number without dot separator', () => {
        assert.isFalse(regExp.test('18320'));
      });

      it('Wrong grouping', () => {
        assert.isFalse(regExp.test('1.8320'));
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
          ['signPart', 'padding', 'mantissaIntegerPart', 'mantissaFractionalPart', 'exponentPart'],
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
          padding: '',
          mantissaIntegerPart: '12',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Simple number starting with fillChar', () => {
        TestUtils.assertSome(getPartsWithNoSep('  12'), {
          signPart: '',
          padding: '  ',
          mantissaIntegerPart: '12',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Complex number', () => {
        TestUtils.assertSome(getPartsWithNoSep('+  18320.45e-2'), {
          signPart: '+',
          padding: '  ',
          mantissaIntegerPart: '18320',
          mantissaFractionalPart: '45',
          exponentPart: '-2',
        });
      });

      it('Sign before padding', () => {
        TestUtils.assertNone(getPartsWithNoSep(' +18320.45e-2'));
      });

      it('Non-numeric character', () => {
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
          padding: '',
          mantissaIntegerPart: '12 430',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Simple number starting with fillChar', () => {
        TestUtils.assertSome(getPartsWithSep('  12 430'), {
          signPart: '',
          padding: '  ',
          mantissaIntegerPart: '12 430',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Complex number', () => {
        TestUtils.assertSome(getPartsWithSep('+  18 320.45^2'), {
          signPart: '+',
          padding: '  ',
          mantissaIntegerPart: '18 320',
          mantissaFractionalPart: '45',
          exponentPart: '2',
        });
      });

      it('Sign before padding', () => {
        TestUtils.assertNone(getPartsWithSep(' +18 320.45^2'));
      });

      it('Non-numeric character', () => {
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
          padding: '',
          mantissaIntegerPart: '12',
          mantissaFractionalPart: '',
          exponentPart: '',
        });
      });

      it('Complex number', () => {
        TestUtils.assertSome(getPartsWithNoFillChar('+18 320.45e-2'), {
          signPart: '+',
          padding: '',
          mantissaIntegerPart: '18 320',
          mantissaFractionalPart: '45',
          exponentPart: '-2',
        });
      });

      it('Leading space before sign', () => {
        TestUtils.assertNone(getPartsWithNoFillChar(' +18 320.45e-2'));
      });

      it('Non-numeric character', () => {
        TestUtils.assertNone(getPartsWithNoFillChar('18A'));
      });

      it('Leading spaces without sign', () => {
        TestUtils.assertNone(getPartsWithNoFillChar('  12'));
      });

      it('Sign before spaces', () => {
        TestUtils.assertNone(getPartsWithNoFillChar('+  18 320.45e-2'));
      });
    });
  });
});
