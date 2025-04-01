/* eslint-disable functional/no-expression-statements */
import { CVNumberBase10Format } from '@parischap/conversions';
import { Equal } from 'effect';
import { describe, it } from 'vitest';

const uk = CVNumberBase10Format.uk;

describe('NumberBase10Format', () => {
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(
				TEUtils.moduleTagFromTestFilePath(__filename),
				CVNumberBase10Format.moduleTag
			);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertTrue(Equal.equals(uk, CVNumberBase10Format.make({ ...uk })));
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(Equal.equals(uk, blackRed));
			});
		});

		describe('.toString()', () => {
			it('Black and red', () => {
				TEUtils.strictEqual(blackRed.toString(), 'Black/RedPalette');
			});
		});

		it('.pipe()', () => {
			TEUtils.assertTrue(blackRed.pipe(ASPalette.has));
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(ASPalette.has(blackRed));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(ASPalette.has(new Date()));
			});
		});
	});

	describe('toBase10NumberParts', () => {
		const toBase10NumberParts = MString.toBase10NumberParts({
			thousandSeparator: ' ',
			fractionalSeparator: ',',
			eNotationChars: ['E', 'e']
		});

		it('Empty string', () => {
			TEUtils.assertNone(toBase10NumberParts(''));
		});

		it('Only a sign', () => {
			TEUtils.assertNone(toBase10NumberParts('+'));
		});

		it('Unsigned mantissa with no integer part', () => {
			TEUtils.assertEquals(
				toBase10NumberParts(',45'),
				Option.some(
					Tuple.make(Option.none(), BigDecimal.make(45n, 2), Option.none(), 2, '', '', ',45', '')
				)
			);
		});

		it('Signed mantissa with no integer part', () => {
			TEUtils.assertEquals(
				toBase10NumberParts('+,45'),
				Option.some(
					Tuple.make(Option.some(1), BigDecimal.make(45n, 2), Option.none(), 2, '+', '', ',45', '')
				)
			);
		});

		it('Signed mantissa with no fractional part', () => {
			TEUtils.assertEquals(
				toBase10NumberParts('-45'),
				Option.some(
					Tuple.make(
						Option.some(-1),
						BigDecimal.unsafeFromNumber(45),
						Option.none(),
						0,
						'-',
						'45',
						'',
						''
					)
				)
			);
		});

		it('Unsigned mantissa and exponent', () => {
			TEUtils.assertEquals(
				toBase10NumberParts('45,45e-12'),
				Option.some(
					Tuple.make(
						Option.none(),
						BigDecimal.make(4545n, 2),
						Option.some(-12),
						2,
						'',
						'45',
						',45',
						'-12'
					)
				)
			);
		});

		it('Signed mantissa with exponent and zero mantissa integer part', () => {
			TEUtils.assertEquals(
				toBase10NumberParts('+ 0,45e12'),
				Option.some(
					Tuple.make(
						Option.some(1),
						BigDecimal.make(45n, 2),
						Option.some(12),
						2,
						'+',
						'0',
						',45',
						'12'
					)
				)
			);
		});
	});
});
