/* eslint-disable functional/no-expression-statements */
import { MRegExpString } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

describe('MRegExpString', () => {
	describe('escape', () => {
		it('All together', () => {
			expect(MRegExpString.escape('\\ ^ $ * + ? . ( ) | { } [ ]')).toBe(
				'\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'
			);
		});
	});

	describe('strictlyPositiveIntWithNoSep', () => {
		it('No digit limit', () => {
			const regExp = new RegExp(
				MRegExpString.makeLine(MRegExpString.strictlyPositiveIntWithNoSep())
			);

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('100 000')).toBe(false);
			expect(regExp.test('0234')).toBe(false);

			expect(regExp.test('1')).toBe(true);
			expect(regExp.test(Math.floor(Math.random() * 1e17).toString())).toBe(true);
		});

		it('1 digit at most', () => {
			const regExp = new RegExp(
				MRegExpString.makeLine(MRegExpString.strictlyPositiveIntWithNoSep(1))
			);

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('1a')).toBe(false);
			expect(regExp.test('25')).toBe(false);
			expect(regExp.test('05')).toBe(false);

			expect(regExp.test('1')).toBe(true);
		});

		it('2 digits at most', () => {
			const regExp = new RegExp(
				MRegExpString.makeLine(MRegExpString.strictlyPositiveIntWithNoSep(2))
			);

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('1a')).toBe(false);
			expect(regExp.test('252')).toBe(false);
			expect(regExp.test('08')).toBe(false);

			expect(regExp.test('1')).toBe(true);
			expect(regExp.test('47')).toBe(true);
		});

		it('4 digits at most, 3 digits at least', () => {
			const regExp = new RegExp(
				MRegExpString.makeLine(MRegExpString.strictlyPositiveIntWithNoSep(4, 3))
			);

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('1a')).toBe(false);
			expect(regExp.test('25265')).toBe(false);
			expect(regExp.test('08')).toBe(false);
			expect(regExp.test('5')).toBe(false);
			expect(regExp.test('28')).toBe(false);

			expect(regExp.test('113')).toBe(true);
			expect(regExp.test('4765')).toBe(true);
		});
	});

	describe('strictlyPositiveInt', () => {
		it('No thousand separator', () => {
			const regExp = new RegExp(MRegExpString.makeLine(MRegExpString.strictlyPositiveInt()));

			// Few tests because in that configuration `strictlyPositiveInt` is an alias to `strictlyPositiveIntWithNoSep`
			expect(regExp.test('1')).toBe(true);
			expect(regExp.test(Math.floor(Math.random() * 1e17).toString())).toBe(true);
		});

		it('No digit limit, space thousand separator', () => {
			const regExp = new RegExp(
				MRegExpString.makeLine(MRegExpString.strictlyPositiveInt(+Infinity, ' '))
			);

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('198a214')).toBe(false);
			expect(regExp.test(' 865')).toBe(false);
			expect(regExp.test('24 4913')).toBe(false);
			expect(regExp.test('1987')).toBe(false);
			expect(regExp.test('1987 284')).toBe(false);
			expect(regExp.test('0 234 321')).toBe(false);

			expect(regExp.test('1')).toBe(true);
			expect(regExp.test('83')).toBe(true);
			expect(regExp.test('987')).toBe(true);
			expect(regExp.test('1 987')).toBe(true);
			expect(regExp.test('75 000')).toBe(true);
			expect(regExp.test('575 342')).toBe(true);
			expect(regExp.test('1 575 342')).toBe(true);
		});

		it('1 digit at most, space thousand separator', () => {
			const regExp = new RegExp(MRegExpString.makeLine(MRegExpString.strictlyPositiveInt(1, ' ')));

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('1a')).toBe(false);
			expect(regExp.test('25')).toBe(false);
			expect(regExp.test('05')).toBe(false);
			expect(regExp.test(' 5')).toBe(false);

			expect(regExp.test('1')).toBe(true);
		});

		it('2 digits at most, space thousand separator', () => {
			const regExp = new RegExp(MRegExpString.makeLine(MRegExpString.strictlyPositiveInt(2, ' ')));

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('1a')).toBe(false);
			expect(regExp.test('252')).toBe(false);
			expect(regExp.test('08')).toBe(false);
			expect(regExp.test(' 8')).toBe(false);

			expect(regExp.test('1')).toBe(true);
			expect(regExp.test('47')).toBe(true);
		});

		it('3 digits at most, space thousand separator', () => {
			const regExp = new RegExp(MRegExpString.makeLine(MRegExpString.strictlyPositiveInt(3, ' ')));

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('43a')).toBe(false);
			expect(regExp.test('2 522')).toBe(false);
			expect(regExp.test('2522')).toBe(false);
			expect(regExp.test('08')).toBe(false);
			expect(regExp.test(' 28')).toBe(false);

			expect(regExp.test('1')).toBe(true);
			expect(regExp.test('47')).toBe(true);
			expect(regExp.test('913')).toBe(true);
		});

		it('4 digits at most, space thousand separator', () => {
			const regExp = new RegExp(MRegExpString.makeLine(MRegExpString.strictlyPositiveInt(4, ' ')));

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('43a')).toBe(false);
			expect(regExp.test('24 522')).toBe(false);
			expect(regExp.test('4522')).toBe(false);
			expect(regExp.test('0218')).toBe(false);
			expect(regExp.test(' 228')).toBe(false);

			expect(regExp.test('1')).toBe(true);
			expect(regExp.test('47')).toBe(true);
			expect(regExp.test('913')).toBe(true);
			expect(regExp.test('4 913')).toBe(true);
		});

		it('5 digits at most, space thousand separator', () => {
			const regExp = new RegExp(MRegExpString.makeLine(MRegExpString.strictlyPositiveInt(5, ' ')));

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('43a')).toBe(false);
			expect(regExp.test('824 522')).toBe(false);
			expect(regExp.test('14522')).toBe(false);
			expect(regExp.test('02 182')).toBe(false);
			expect(regExp.test(' 1 228')).toBe(false);

			expect(regExp.test('1')).toBe(true);
			expect(regExp.test('47')).toBe(true);
			expect(regExp.test('913')).toBe(true);
			expect(regExp.test('4 913')).toBe(true);
			expect(regExp.test('74 913')).toBe(true);
		});

		it('6 digits at most, space thousand separator', () => {
			const regExp = new RegExp(MRegExpString.makeLine(MRegExpString.strictlyPositiveInt(6, ' ')));

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('43a')).toBe(false);
			expect(regExp.test('1 824 522')).toBe(false);
			expect(regExp.test('4522')).toBe(false);
			expect(regExp.test('018 542')).toBe(false);
			expect(regExp.test(' 432 228')).toBe(false);

			expect(regExp.test('1')).toBe(true);
			expect(regExp.test('47')).toBe(true);
			expect(regExp.test('913')).toBe(true);
			expect(regExp.test('4 913')).toBe(true);
			expect(regExp.test('74 913')).toBe(true);
			expect(regExp.test('974 913')).toBe(true);
		});

		it('7 digits at most, space thousand separator', () => {
			const regExp = new RegExp(MRegExpString.makeLine(MRegExpString.strictlyPositiveInt(7, ' ')));

			expect(regExp.test('')).toBe(false);
			expect(regExp.test(' ')).toBe(false);
			expect(regExp.test('0')).toBe(false);
			expect(regExp.test('43a')).toBe(false);
			expect(regExp.test('13 824 522')).toBe(false);
			expect(regExp.test('4522')).toBe(false);
			expect(regExp.test('0 618 542')).toBe(false);
			expect(regExp.test(' 1 432 228')).toBe(false);

			expect(regExp.test('1')).toBe(true);
			expect(regExp.test('47')).toBe(true);
			expect(regExp.test('913')).toBe(true);
			expect(regExp.test('4 913')).toBe(true);
			expect(regExp.test('74 913')).toBe(true);
			expect(regExp.test('784 913')).toBe(true);
			expect(regExp.test('9 784 913')).toBe(true);
		});
	});
});
