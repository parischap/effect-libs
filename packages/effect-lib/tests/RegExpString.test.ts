/* eslint-disable functional/no-expression-statements */
import { MRegExp, MRegExpString } from '@parischap/effect-lib';
import { pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MRegExpString', () => {
	describe('escape', () => {
		it('All together', () => {
			expect(MRegExpString.escape('\\ ^ $ * + ? . ( ) | { } [ ]')).toBe(
				'\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'
			);
		});
	});

	describe('strictlyPositiveInt', () => {
		describe('No thousand separator', () => {
			const regExp = pipe(
				MRegExpString.strictlyPositiveInt(),
				MRegExpString.makeLine,
				MRegExp.fromRegExpString()
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
				MRegExpString.strictlyPositiveInt(' '),
				MRegExpString.makeLine,
				MRegExp.fromRegExpString()
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

	describe('positiveInt', () => {
		describe('No thousand separator', () => {
			const regExp = pipe(
				MRegExpString.positiveInt(),
				MRegExpString.makeLine,
				MRegExp.fromRegExpString()
			);

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
			const regExp = pipe(
				MRegExpString.positiveInt('.'),
				MRegExpString.makeLine,
				MRegExp.fromRegExpString()
			);

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
});
