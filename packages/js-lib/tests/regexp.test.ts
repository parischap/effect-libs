/* eslint-disable functional/no-expression-statements */
import { JsRegExp } from '@parischap/js-lib';
import { describe, expect, it } from 'vitest';

describe('JsRegExp', () => {
	describe('escape', () => {
		it('All together', () => {
			expect(JsRegExp.escape('\\ ^ $ * + ? . ( ) | { } [ ]')).toBe(
				'\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'
			);
		});
	});

	describe('int', () => {
		const intRegExp = new RegExp(JsRegExp.makeLine(JsRegExp.int));

		it('Empty string', () => {
			expect(intRegExp.exec('') !== null).toBe(false);
		});

		it('One space string', () => {
			expect(intRegExp.exec(' ') !== null).toBe(false);
		});

		it('With upfront 0', () => {
			expect(intRegExp.exec('01') !== null).toBe(false);
		});

		it('With space in the middle', () => {
			expect(intRegExp.exec('1 001') !== null).toBe(false);
		});

		it('0', () => {
			expect(intRegExp.exec('0') !== null).toBe(true);
		});

		it('101', () => {
			expect(intRegExp.exec('101') !== null).toBe(true);
		});

		it('1001', () => {
			expect(intRegExp.exec('1001') !== null).toBe(true);
		});

		it('10001', () => {
			expect(intRegExp.exec('10001') !== null).toBe(true);
		});

		it('100001', () => {
			expect(intRegExp.exec('100001') !== null).toBe(true);
		});

		it('1000001', () => {
			expect(intRegExp.exec('1000001') !== null).toBe(true);
		});
	});

	describe('intWithThousandSep', () => {
		const intRegExp = new RegExp(JsRegExp.makeLine(JsRegExp.intWithThousandSep('')));
		const intRegExpWithSep = new RegExp(JsRegExp.makeLine(JsRegExp.intWithThousandSep(' ')));

		it('Without separator - Empty string', () => {
			expect(intRegExp.exec('') !== null).toBe(false);
		});

		it('Without separator - One space string', () => {
			expect(intRegExp.exec(' ') !== null).toBe(false);
		});

		it('Without separator - With upfront 0', () => {
			expect(intRegExp.exec('01') !== null).toBe(false);
		});

		it('Without separator - With space in the middle', () => {
			expect(intRegExp.exec('1 001') !== null).toBe(false);
		});

		it('Without separator - 0', () => {
			expect(intRegExp.exec('0') !== null).toBe(true);
		});

		it('Without separator - 101', () => {
			expect(intRegExp.exec('101') !== null).toBe(true);
		});

		it('Without separator - 1001', () => {
			expect(intRegExp.exec('1001') !== null).toBe(true);
		});

		it('Without separator - 10001', () => {
			expect(intRegExp.exec('10001') !== null).toBe(true);
		});

		it('Without separator - 100001', () => {
			expect(intRegExp.exec('100001') !== null).toBe(true);
		});

		it('Without separator - 1000001', () => {
			expect(intRegExp.exec('1000001') !== null).toBe(true);
		});

		it('With separator - Empty string', () => {
			expect(intRegExpWithSep.exec('') !== null).toBe(false);
		});

		it('With separator - One space string', () => {
			expect(intRegExpWithSep.exec(' ') !== null).toBe(false);
		});

		it('With separator - With upfront 0', () => {
			expect(intRegExpWithSep.exec('01') !== null).toBe(false);
		});

		it('With separator - With letter in the middle', () => {
			expect(intRegExpWithSep.exec('1a001') !== null).toBe(false);
		});

		it('With separator - With no space in the middle', () => {
			expect(intRegExpWithSep.exec('1001') !== null).toBe(false);
		});

		it('With separator - With two spaces in the middle', () => {
			expect(intRegExpWithSep.exec('1  001') !== null).toBe(false);
		});

		it('With separator - With space in the middle', () => {
			expect(intRegExpWithSep.exec('1 001') !== null).toBe(true);
		});

		it('With separator - 0', () => {
			expect(intRegExpWithSep.exec('0') !== null).toBe(true);
		});

		it('With separator - 101', () => {
			expect(intRegExpWithSep.exec('101') !== null).toBe(true);
		});

		it('With separator - 1001', () => {
			expect(intRegExpWithSep.exec('1 001') !== null).toBe(true);
		});

		it('With separator - 10001', () => {
			expect(intRegExpWithSep.exec('10 001') !== null).toBe(true);
		});

		it('With separator - 100001', () => {
			expect(intRegExpWithSep.exec('100 001') !== null).toBe(true);
		});

		it('With separator - 1000001', () => {
			expect(intRegExpWithSep.exec('1 000 001') !== null).toBe(true);
		});

		it('With separator - +1001', () => {
			expect(intRegExpWithSep.exec('+1 001') !== null).toBe(true);
		});

		it('With separator - -1001', () => {
			expect(intRegExpWithSep.exec('-  1 001') !== null).toBe(true);
		});
	});

	describe('floatingPoint', () => {
		const floatRegExp = new RegExp(JsRegExp.makeLine(JsRegExp.floatingPoint(JsRegExp.dot)));

		it('Empty string', () => {
			expect(floatRegExp.exec('') !== null).toBe(false);
		});

		it('One space string', () => {
			expect(floatRegExp.exec(' ') !== null).toBe(false);
		});

		it('With upfront 0', () => {
			expect(floatRegExp.exec('01.1') !== null).toBe(false);
		});

		it('With space in the middle', () => {
			expect(floatRegExp.exec('1 001.1') !== null).toBe(false);
		});

		it('0', () => {
			expect(floatRegExp.exec('0') !== null).toBe(true);
		});

		it('101', () => {
			expect(floatRegExp.exec('101') !== null).toBe(true);
		});

		it('101.1', () => {
			expect(floatRegExp.exec('101.1') !== null).toBe(true);
		});

		it('1001.1001', () => {
			expect(floatRegExp.exec('1001.1001') !== null).toBe(true);
		});

		it('1001.10010', () => {
			expect(floatRegExp.exec('1001.10010') !== null).toBe(true);
		});

		it('.1001', () => {
			expect(floatRegExp.exec('.1001') !== null).toBe(true);
		});
	});

	describe('floatingPointWithThousandSep', () => {
		const floatRegExp = new RegExp(
			JsRegExp.makeLine(JsRegExp.floatingPointWithThousandSep(JsRegExp.dot, ''))
		);
		const floatRegExpWithSep = new RegExp(
			JsRegExp.makeLine(JsRegExp.floatingPointWithThousandSep(JsRegExp.dot, ' '))
		);

		it('Without separator - Empty string', () => {
			expect(floatRegExp.exec('') !== null).toBe(false);
		});

		it('Without separator - One space string', () => {
			expect(floatRegExp.exec(' ') !== null).toBe(false);
		});

		it('Without separator - With upfront 0', () => {
			expect(floatRegExp.exec('01.1') !== null).toBe(false);
		});

		it('Without separator - With space in the middle', () => {
			expect(floatRegExp.exec('1 001.1') !== null).toBe(false);
		});

		it('Without separator - 0', () => {
			expect(floatRegExp.exec('0') !== null).toBe(true);
		});

		it('Without separator - 101', () => {
			expect(floatRegExp.exec('101') !== null).toBe(true);
		});

		it('Without separator - 101.1', () => {
			expect(floatRegExp.exec('101.1') !== null).toBe(true);
		});

		it('Without separator - 1001.1001', () => {
			expect(floatRegExp.exec('1001.1001') !== null).toBe(true);
		});

		it('Without separator - 1001.10010', () => {
			expect(floatRegExp.exec('1001.10010') !== null).toBe(true);
		});

		it('Without separator - .1001', () => {
			expect(floatRegExp.exec('.1001') !== null).toBe(true);
		});

		it('With separator - Empty string', () => {
			expect(floatRegExpWithSep.exec('') !== null).toBe(false);
		});

		it('With separator - One space string', () => {
			expect(floatRegExpWithSep.exec(' ') !== null).toBe(false);
		});

		it('With separator - With upfront 0', () => {
			expect(floatRegExpWithSep.exec('01') !== null).toBe(false);
		});

		it('With separator - With letter in the middle', () => {
			expect(floatRegExpWithSep.exec('1001.0a1') !== null).toBe(false);
		});

		it('With separator - With no space in the middle', () => {
			expect(floatRegExpWithSep.exec('1001.1001') !== null).toBe(false);
		});

		it('With separator - With two spaces in the middle', () => {
			expect(floatRegExpWithSep.exec('1  001.1001') !== null).toBe(false);
		});

		it('With separator - 0', () => {
			expect(floatRegExpWithSep.exec('0') !== null).toBe(true);
		});

		it('With separator - 101.101', () => {
			expect(floatRegExpWithSep.exec('101.101') !== null).toBe(true);
		});

		it('With separator - 1001.1001', () => {
			expect(floatRegExpWithSep.exec('1 001.1001') !== null).toBe(true);
		});

		it('With separator - 10001.10012', () => {
			expect(floatRegExpWithSep.exec('10 001.10012') !== null).toBe(true);
		});

		it('With separator - 100001.0030011', () => {
			expect(floatRegExpWithSep.exec('100 001.0030011') !== null).toBe(true);
		});

		it('With separator - +1001.11', () => {
			expect(floatRegExpWithSep.exec('+1 001.11') !== null).toBe(true);
		});

		it('With separator - -.333 23', () => {
			expect(floatRegExpWithSep.exec('-  .33323') !== null).toBe(true);
		});
	});
});
