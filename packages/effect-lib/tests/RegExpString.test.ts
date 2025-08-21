/* eslint-disable functional/no-expression-statements */
import { MRegExpString, MString } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Function, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('MRegExpString', () => {
	describe('unsignedNonNullBase10Int', () => {
		describe('No thousand separator', () => {
			const regExp = pipe(
				MRegExpString.unsignedNonNullBase10Int(''),
				MRegExpString.makeLine,
				RegExp
			);

			it('Matching', () => {
				TEUtils.assertTrue(regExp.test('1'));
				TEUtils.assertTrue(regExp.test('18320'));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(regExp.test('0'));
				TEUtils.assertFalse(regExp.test('18 320'));
				TEUtils.assertFalse(regExp.test('018320'));
			});
		});

		describe('With space thousand separator', () => {
			const regExp = pipe(
				MRegExpString.unsignedNonNullBase10Int(' '),
				MRegExpString.makeLine,
				RegExp
			);

			it('Matching', () => {
				TEUtils.assertTrue(regExp.test('1'));
				TEUtils.assertTrue(regExp.test('999'));
				TEUtils.assertTrue(regExp.test('18 320'));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(regExp.test('0'));
				TEUtils.assertFalse(regExp.test('18320'));
				TEUtils.assertFalse(regExp.test('1 8320'));
				TEUtils.assertFalse(regExp.test(' 18 320'));
				TEUtils.assertFalse(regExp.test('18 320 '));
				TEUtils.assertFalse(regExp.test('18  320'));
				TEUtils.assertFalse(regExp.test('018 320'));
			});
		});
	});

	describe('unsignedBase10Int', () => {
		describe('No thousand separator', () => {
			const regExp = pipe(MRegExpString.unsignedBase10Int(''), MRegExpString.makeLine, RegExp);

			it('Matching', () => {
				TEUtils.assertTrue(regExp.test('0'));
				TEUtils.assertTrue(regExp.test('1'));
				TEUtils.assertTrue(regExp.test('18320'));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(regExp.test('00'));
				TEUtils.assertFalse(regExp.test('18 320'));
				TEUtils.assertFalse(regExp.test('018320'));
			});
		});

		describe('With dot thousand separator', () => {
			const regExp = pipe(MRegExpString.unsignedBase10Int('.'), MRegExpString.makeLine, RegExp);

			it('Matching', () => {
				TEUtils.assertTrue(regExp.test('0'));
				TEUtils.assertTrue(regExp.test('1'));
				TEUtils.assertTrue(regExp.test('999'));
				TEUtils.assertTrue(regExp.test('18.320'));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(regExp.test('18320'));
				TEUtils.assertFalse(regExp.test('1.8320'));
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
			pipe(
				params,
				MRegExpString.base10Number,
				MRegExpString.makeLine,
				RegExp,
				Tuple.make,
				Tuple.appendElement(5),
				Function.tupled(MString.capturedGroups)
			);

		describe('With no thousand separator and usual parameters', () => {
			const getPartsWithNoSep = getParts({
				thousandSeparator: '',
				fractionalSeparator: '.',
				eNotationChars: ['E', 'e'],
				fillChar: ' '
			});
			it('Simple number', () => {
				TEUtils.assertSome(getPartsWithNoSep('12'), Tuple.make('', '', '12', '', ''));
			});

			it('Simple number starting with fillChar', () => {
				TEUtils.assertSome(getPartsWithNoSep('  12'), Tuple.make('', '  ', '12', '', ''));
			});

			it('Complex number', () => {
				TEUtils.assertSome(
					getPartsWithNoSep('+  18320.45e-2'),
					Tuple.make('+', '  ', '18320', '45', '-2')
				);
			});

			it('Not passing', () => {
				TEUtils.assertNone(getPartsWithNoSep(' +18320.45e-2'));
				TEUtils.assertNone(getPartsWithNoSep('18A'));
			});
		});

		describe('With space thousand separator and ^ as exponent', () => {
			const getPartsWithSep = getParts({
				thousandSeparator: ' ',
				fractionalSeparator: '.',
				eNotationChars: ['^'],
				fillChar: ' '
			});

			it('Simple number', () => {
				TEUtils.assertSome(getPartsWithSep('12 430'), Tuple.make('', '', '12 430', '', ''));
			});

			it('Simple number starting with fillChar', () => {
				TEUtils.assertSome(getPartsWithSep('  12 430'), Tuple.make('', '  ', '12 430', '', ''));
			});

			it('Complex number', () => {
				TEUtils.assertSome(
					getPartsWithSep('+  18 320.45^2'),
					Tuple.make('+', '  ', '18 320', '45', '2')
				);
			});

			it('Not passing', () => {
				TEUtils.assertNone(getPartsWithSep(' +18 320.45^2'));
				TEUtils.assertNone(getPartsWithSep('18A'));
			});
		});

		describe('With no fillChar', () => {
			const getPartsWithNoFillChar = getParts({
				thousandSeparator: ' ',
				fractionalSeparator: '.',
				eNotationChars: ['E', 'e'],
				fillChar: ''
			});

			it('Simple number', () => {
				TEUtils.assertSome(getPartsWithNoFillChar('12'), Tuple.make('', '', '12', '', ''));
			});

			it('Complex number', () => {
				TEUtils.assertSome(
					getPartsWithNoFillChar('+18 320.45e-2'),
					Tuple.make('+', '', '18 320', '45', '-2')
				);
			});

			it('Not passing', () => {
				TEUtils.assertNone(getPartsWithNoFillChar(' +18 320.45e-2'));
				TEUtils.assertNone(getPartsWithNoFillChar('18A'));
				TEUtils.assertNone(getPartsWithNoFillChar('  12'));
				TEUtils.assertNone(getPartsWithNoFillChar('+  18 320.45e-2'));
			});
		});
	});
});
