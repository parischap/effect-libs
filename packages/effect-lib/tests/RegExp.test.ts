/* eslint-disable functional/no-expression-statements */
import { MRegExp } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

describe('MRegExp', () => {
	describe('escape', () => {
		it('All together', () => {
			expect(MRegExp.escape('\\ ^ $ * + ? . ( ) | { } [ ]')).toBe(
				'\\\\ \\^ \\$ \\* \\+ \\? \\. \\( \\) \\| \\{ \\} \\[ \\]'
			);
		});
	});

	describe('floatingPoint', () => {
		const floatRegExp = new RegExp(MRegExp.makeLine(MRegExp.floatingPoint()));
		const floatRegExpNone = new RegExp(
			MRegExp.makeLine(MRegExp.floatingPoint(MRegExp.SignOption.None))
		);
		const floatRegExpMandatory = new RegExp(
			MRegExp.makeLine(MRegExp.floatingPoint(MRegExp.SignOption.Mandatory))
		);
		const floatRegExpPlusMinusOptional = new RegExp(
			MRegExp.makeLine(MRegExp.floatingPoint(MRegExp.SignOption.PlusMinusOptional))
		);

		const intRegExp = new RegExp(
			MRegExp.makeLine(
				MRegExp.floatingPoint(MRegExp.SignOption.None, MRegExp.dot, '', +Infinity, 0, 0)
			)
		);

		const intRegExpWithENotation = new RegExp(
			MRegExp.makeLine(
				MRegExp.floatingPoint(MRegExp.SignOption.None, MRegExp.dot, '', +Infinity, 0, 0, true)
			)
		);

		const floatRegExp0 = new RegExp(
			MRegExp.makeLine(MRegExp.floatingPoint(MRegExp.SignOption.None, MRegExp.dot, '', 0))
		);

		const floatRegExp1 = new RegExp(
			MRegExp.makeLine(MRegExp.floatingPoint(MRegExp.SignOption.None, MRegExp.dot, '', 1))
		);

		const floatRegExp2 = new RegExp(
			MRegExp.makeLine(MRegExp.floatingPoint(MRegExp.SignOption.None, MRegExp.dot, '', 2))
		);

		const floatRegExp4 = new RegExp(
			MRegExp.makeLine(MRegExp.floatingPoint(MRegExp.SignOption.None, MRegExp.dot, '', 4))
		);

		const floatRegExp02 = new RegExp(
			MRegExp.makeLine(
				MRegExp.floatingPoint(MRegExp.SignOption.None, MRegExp.dot, '', +Infinity, 0, 2)
			)
		);

		const floatRegExp022 = new RegExp(
			MRegExp.makeLine(
				MRegExp.floatingPoint(MRegExp.SignOption.None, MRegExp.dot, '', +Infinity, 2, 2)
			)
		);

		const floatRegExpWithThousandSep = new RegExp(
			MRegExp.makeLine(MRegExp.floatingPoint(MRegExp.SignOption.MinusOptional, MRegExp.dot, ' '))
		);

		it('Minus sign allowed - Matching without sign', () => {
			expect(floatRegExp.exec('123') !== null).toBe(true);
		});

		it('Minus sign allowed - Matching with sign', () => {
			expect(floatRegExp.exec('-123') !== null).toBe(true);
		});

		it('Minus sign allowed - Not matching', () => {
			expect(floatRegExp.exec('+123') !== null).toBe(false);
		});

		it('No sign allowed - Matching', () => {
			expect(floatRegExpNone.exec('123') !== null).toBe(true);
		});

		it('No sign allowed - Not matching with +', () => {
			expect(floatRegExpNone.exec('+ 123') !== null).toBe(false);
		});

		it('No sign allowed - Not matching with -', () => {
			expect(floatRegExpNone.exec('-123') !== null).toBe(false);
		});

		it('Mandatory sign - Matching with + ', () => {
			expect(floatRegExpMandatory.exec('+123') !== null).toBe(true);
		});

		it('Mandatory sign - Matching with - ', () => {
			expect(floatRegExpMandatory.exec('-  123') !== null).toBe(true);
		});

		it('Mandatory sign - Not matching', () => {
			expect(floatRegExpMandatory.exec('123') !== null).toBe(false);
		});

		it('Plus/minus sign allowed - Matching with + sign', () => {
			expect(floatRegExpPlusMinusOptional.exec('+123') !== null).toBe(true);
		});

		it('Plus/minus sign allowed - Matching with - sign', () => {
			expect(floatRegExpPlusMinusOptional.exec('-123') !== null).toBe(true);
		});

		it('Plus/minus sign allowed - Matching without sign', () => {
			expect(floatRegExpPlusMinusOptional.exec('123') !== null).toBe(true);
		});

		it('Float without separator - Empty string', () => {
			expect(floatRegExp.exec('') !== null).toBe(false);
		});

		it('Float without separator - One space string', () => {
			expect(floatRegExp.exec(' ') !== null).toBe(false);
		});

		it('Float without separator - With upfront 0', () => {
			expect(floatRegExp.exec('01.1') !== null).toBe(false);
		});

		it('Float without separator - With space in the decimal part', () => {
			expect(floatRegExp.exec('1 001.1') !== null).toBe(false);
		});

		it('Float without separator - With fractional separator but without fractional part', () => {
			expect(floatRegExp.exec('1001.') !== null).toBe(false);
		});

		it('Float without separator - 0', () => {
			expect(floatRegExp.exec('0') !== null).toBe(true);
		});

		it('Float without separator - 101', () => {
			expect(floatRegExp.exec('101') !== null).toBe(true);
		});

		it('Float without separator - 101.1', () => {
			expect(floatRegExp.exec('101.1') !== null).toBe(true);
		});

		it('Float without separator - 1001.1001', () => {
			expect(floatRegExp.exec('1001.1001') !== null).toBe(true);
		});

		it('Float without separator - 1001.10010', () => {
			expect(floatRegExp.exec('1001.10010') !== null).toBe(true);
		});

		it('Float without separator - .1001', () => {
			expect(floatRegExp.exec('.1001') !== null).toBe(true);
		});

		it('Float with separator - Empty string', () => {
			expect(floatRegExpWithThousandSep.exec('') !== null).toBe(false);
		});

		it('Float with separator - One space string', () => {
			expect(floatRegExpWithThousandSep.exec(' ') !== null).toBe(false);
		});

		it('Float with separator - With upfront 0', () => {
			expect(floatRegExpWithThousandSep.exec('01') !== null).toBe(false);
		});

		it('Float with separator - With letter in the fractional part', () => {
			expect(floatRegExpWithThousandSep.exec('1001.0a1') !== null).toBe(false);
		});

		it('Float with separator - With space in the fractional part', () => {
			expect(floatRegExpWithThousandSep.exec('1001.001 001') !== null).toBe(false);
		});

		it('Float with separator - With no space in the decimal part', () => {
			expect(floatRegExpWithThousandSep.exec('1001.1001') !== null).toBe(false);
		});

		it('Float with separator - With two spaces in the decimal part', () => {
			expect(floatRegExpWithThousandSep.exec('1  001.1001') !== null).toBe(false);
		});

		it('Float with separator - 0', () => {
			expect(floatRegExpWithThousandSep.exec('0') !== null).toBe(true);
		});

		it('Float with separator - 101.101', () => {
			expect(floatRegExpWithThousandSep.exec('101.101') !== null).toBe(true);
		});

		it('Float with separator - 1001.1001', () => {
			expect(floatRegExpWithThousandSep.exec('1 001.1001') !== null).toBe(true);
		});

		it('Float with separator - 10001.10012', () => {
			expect(floatRegExpWithThousandSep.exec('10 001.10012') !== null).toBe(true);
		});

		it('Float with separator - 1000001.0030011', () => {
			expect(floatRegExpWithThousandSep.exec('1 000 001.0030011') !== null).toBe(true);
		});

		it('Float without decimal digit - Matching', () => {
			expect(floatRegExp0.exec('.01') !== null).toBe(true);
		});

		it('Float without decimal digit - Not matching', () => {
			expect(floatRegExp0.exec('1') !== null).toBe(false);
		});

		it('Float with at most 1 decimal digit - Matching .01', () => {
			expect(floatRegExp1.exec('.01') !== null).toBe(true);
		});

		it('Float with at most 1 decimal digit - Matching 0', () => {
			expect(floatRegExp1.exec('0') !== null).toBe(true);
		});

		it('Float with at most 1 decimal digit - Matching 1', () => {
			expect(floatRegExp1.exec('1') !== null).toBe(true);
		});

		it('Float with at most 1 decimal digit - Not matching', () => {
			expect(floatRegExp1.exec('10.04') !== null).toBe(false);
		});

		it('Float with at most 2 decimal digits - Matching 0', () => {
			expect(floatRegExp2.exec('0') !== null).toBe(true);
		});

		it('Float with at most 2 decimal digits - Matching 19.998', () => {
			expect(floatRegExp2.exec('19.998') !== null).toBe(true);
		});

		it('Float with at most 2 decimal digits - Not matching', () => {
			expect(floatRegExp2.exec('1199.04') !== null).toBe(false);
		});

		it('Float with at most 4 decimal digits - Matching 1', () => {
			expect(floatRegExp4.exec('1') !== null).toBe(true);
		});

		it('Float with at most 4 decimal digits - Matching 1001.76', () => {
			expect(floatRegExp4.exec('1001.76') !== null).toBe(true);
		});

		it('Float with at most 4 decimal digits - Not matching', () => {
			expect(floatRegExp4.exec('10001.65') !== null).toBe(false);
		});

		it('Float with at most 2 fractional digits - Matching', () => {
			expect(floatRegExp02.exec('1.01') !== null).toBe(true);
		});

		it('Float with at most 2 fractional digits - Not matching', () => {
			expect(floatRegExp02.exec('1.011') !== null).toBe(false);
		});

		it('Float with exactly 2 fractional digits - Matching', () => {
			expect(floatRegExp022.exec('.01') !== null).toBe(true);
		});

		it('Float with exactly 2 fractional digits - Not matching .1', () => {
			expect(floatRegExp022.exec('.1') !== null).toBe(false);
		});

		it('Float with exactly 2 fractional digits - Not matching .111', () => {
			expect(floatRegExp022.exec('.111') !== null).toBe(false);
		});

		it('Integer - Empty string', () => {
			expect(intRegExp.exec('') !== null).toBe(false);
		});

		it('Integer - One space string', () => {
			expect(intRegExp.exec(' ') !== null).toBe(false);
		});

		it('Integer - With upfront 0', () => {
			expect(intRegExp.exec('01') !== null).toBe(false);
		});

		it('Integer - With e notation', () => {
			expect(intRegExp.exec('1e5') !== null).toBe(false);
		});

		it('Integer - With decimal part', () => {
			expect(intRegExp.exec('1001.1') !== null).toBe(false);
		});

		it('Integer - 0', () => {
			expect(intRegExp.exec('0') !== null).toBe(true);
		});

		it('Integer - 101', () => {
			expect(intRegExp.exec('101') !== null).toBe(true);
		});

		it('Integer with e notation - Matching 1e5', () => {
			expect(intRegExpWithENotation.exec('1e5') !== null).toBe(true);
		});

		it('Integer with e notation - Matching 1e-5', () => {
			expect(intRegExpWithENotation.exec('1e-5') !== null).toBe(true);
		});

		it('Integer with e notation - Matching 18', () => {
			expect(intRegExpWithENotation.exec('18') !== null).toBe(true);
		});

		it('Integer with e notation - Not matching', () => {
			expect(intRegExpWithENotation.exec('1 e5') !== null).toBe(false);
		});
	});
});
