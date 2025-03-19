/* eslint-disable functional/no-expression-statements */
import { MRegExpString, MString } from '@parischap/effect-lib';
import { Array, Function, Option, pipe, String, Tuple } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MRegExpString', () => {
	describe('escape', () => {
		it('All together', () => {
			expect(MRegExpString.escape('\\ ^ $ * + ? . ( ) | { } [ ]')).toBe(
				'\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'
			);
		});
	});

	describe('strictlyPositiveBase10Int', () => {
		describe('No thousand separator', () => {
			const regExp = pipe(
				MRegExpString.strictlyPositiveBase10Int(''),
				MRegExpString.makeLine,
				RegExp
			);

			it('Matching', () => {
				expect(regExp.test('1')).toBe(true);
				expect(regExp.test('18320')).toBe(true);
			});

			it('Non-matching', () => {
				expect(regExp.test('0')).toBe(false);
				expect(regExp.test('18 320')).toBe(false);
				expect(regExp.test('018320')).toBe(false);
			});
		});

		describe('With space thousand separator', () => {
			const regExp = pipe(
				MRegExpString.strictlyPositiveBase10Int(' '),
				MRegExpString.makeLine,
				RegExp
			);

			it('Matching', () => {
				expect(regExp.test('1')).toBe(true);
				expect(regExp.test('999')).toBe(true);
				expect(regExp.test('18 320')).toBe(true);
			});

			it('Non-matching', () => {
				expect(regExp.test('0')).toBe(false);
				expect(regExp.test('18320')).toBe(false);
				expect(regExp.test('1 8320')).toBe(false);
				expect(regExp.test(' 18 320')).toBe(false);
				expect(regExp.test('18 320 ')).toBe(false);
				expect(regExp.test('18  320')).toBe(false);
				expect(regExp.test('018 320')).toBe(false);
			});
		});
	});

	describe('positiveBase10Int', () => {
		describe('No thousand separator', () => {
			const regExp = pipe(MRegExpString.positiveBase10Int(''), MRegExpString.makeLine, RegExp);

			it('Matching', () => {
				expect(regExp.test('0')).toBe(true);
				expect(regExp.test('1')).toBe(true);
				expect(regExp.test('18320')).toBe(true);
			});

			it('Non-matching', () => {
				expect(regExp.test('00')).toBe(false);
				expect(regExp.test('18 320')).toBe(false);
				expect(regExp.test('018320')).toBe(false);
			});
		});

		describe('With dot thousand separator', () => {
			const regExp = pipe(MRegExpString.positiveBase10Int('.'), MRegExpString.makeLine, RegExp);

			it('Matching', () => {
				expect(regExp.test('0')).toBe(true);
				expect(regExp.test('1')).toBe(true);
				expect(regExp.test('999')).toBe(true);
				expect(regExp.test('18.320')).toBe(true);
			});

			it('Non-matching', () => {
				expect(regExp.test('18320')).toBe(false);
				expect(regExp.test('1.8320')).toBe(false);
			});
		});
	});

	describe('base10Number', () => {
		const stringArrayOptionEq = pipe(
			String.Equivalence,
			Array.getEquivalence,
			Option.getEquivalence
		);

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
				Tuple.appendElement(6),
				Function.tupled(MString.capturedGroups)
			);

		describe('With no thousand separator and usual parameters', () => {
			const getPartsWithNoSep = getParts({
				thousandSeparator: '',
				fractionalSeparator: '.',
				eNotationChars: ['E', 'e']
			});
			it('Simple number', () => {
				expect(
					stringArrayOptionEq(getPartsWithNoSep('12'), Option.some(['', '12', '', '', '', '']))
				).toBe(true);
			});

			it('Complex number', () => {
				expect(
					stringArrayOptionEq(
						getPartsWithNoSep('+  18320.45e-2'),
						Option.some(['+', '18320', '.', '45', '-', '2'])
					)
				).toBe(true);
			});
		});

		describe('With space thousand separator and ^ as exponent', () => {
			const getPartsWithSep = getParts({
				thousandSeparator: ' ',
				fractionalSeparator: '.',
				eNotationChars: ['^']
			});

			it('Simple number', () => {
				expect(
					stringArrayOptionEq(
						getPartsWithSep('12 430'),
						Option.some(['', '12 430', '', '', '', ''])
					)
				).toBe(true);
			});

			it('Complex number', () => {
				expect(
					stringArrayOptionEq(
						getPartsWithSep('+18 320.45^2'),
						Option.some(['+', '18 320', '.', '45', '', '2'])
					)
				).toBe(true);
			});
		});
	});
});
