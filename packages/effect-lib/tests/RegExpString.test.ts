/* eslint-disable functional/no-expression-statements */
import { MRegExpString, MString } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Function, Option, pipe, Tuple } from 'effect';
import { describe, it } from 'vitest';

describe('MRegExpString', () => {
	describe('escape', () => {
		it('All together', () => {
			TEUtils.strictEqual(
				MRegExpString.escape('\\ ^ $ * + ? . ( ) | { } [ ]'),
				'\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'
			);
		});
	});

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
		}) =>
			pipe(
				params,
				MRegExpString.base10Number,
				MRegExpString.makeLine,
				RegExp,
				Tuple.make,
				Tuple.appendElement(4),
				Function.tupled(MString.capturedGroups)
			);

		describe('With no thousand separator and usual parameters', () => {
			const getPartsWithNoSep = getParts({
				thousandSeparator: '',
				fractionalSeparator: '.',
				eNotationChars: ['E', 'e']
			});
			it('Simple number', () => {
				TEUtils.assertEquals(getPartsWithNoSep('12'), Option.some(Tuple.make('', '12', '', '')));
			});

			it('Complex number', () => {
				TEUtils.assertEquals(
					getPartsWithNoSep('+  18320.45e-2'),
					Option.some(Tuple.make('+', '18320', '45', '-2'))
				);
			});
		});

		describe('With space thousand separator and ^ as exponent', () => {
			const getPartsWithSep = getParts({
				thousandSeparator: ' ',
				fractionalSeparator: '.',
				eNotationChars: ['^']
			});

			it('Simple number', () => {
				TEUtils.assertEquals(
					getPartsWithSep('12 430'),
					Option.some(Tuple.make('', '12 430', '', ''))
				);
			});

			it('Complex number', () => {
				TEUtils.assertEquals(
					getPartsWithSep('+18 320.45^2'),
					Option.some(Tuple.make('+', '18 320', '45', '2'))
				);
			});
		});
	});
});
