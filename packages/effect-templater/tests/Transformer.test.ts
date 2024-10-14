/* eslint-disable functional/no-expression-statements */
import { Transformer } from '@parischap/effect-templater';
import { Chunk, Either, Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('Transformer', () => {
	describe('string', () => {
		it('Reading', () => {
			expect(
				pipe(
					'foo and bar',
					Transformer.string.read,
					// Revert from Chunk to Array when Effect 4.0 with structurzl equality comes out
					Either.map(Chunk.fromIterable),
					Equal.equals(Either.right(Chunk.make('foo and bar', '')))
				)
			).toBe(true);
		});

		it('Writing', () => {
			expect(
				pipe('foo and bar', Transformer.string.write, Equal.equals(Either.right('foo and bar')))
			).toBe(true);
		});
	});

	describe('real', () => {
		describe('Reading', () => {
			it('floatingPoint - Empty string', () => {
				expect(pipe('', Transformer.floatingPoint.read, Either.isLeft)).toBe(true);
			});

			it('floatingPoint - One space string', () => {
				expect(pipe(' ', Transformer.floatingPoint.read, Either.isLeft)).toBe(true);
			});

			it('floatingPoint - With upfront 0', () => {
				expect(pipe('01.1', Transformer.floatingPoint.read, Either.isLeft)).toBe(true);
			});

			it('floatingPoint - With space in the decimal part', () => {
				expect(defaultTester('1 001.1') !== null).toBe(false);
			});

			it('floatingPoint - With fractional separator but without fractional part', () => {
				expect(defaultTester('1001.') !== null).toBe(false);
			});

			it('floatingPoint - 0', () => {
				expect(defaultTester('0') !== null).toBe(true);
			});

			it('floatingPoint - 101', () => {
				expect(defaultTester('101') !== null).toBe(true);
			});

			it('floatingPoint - 101.1', () => {
				expect(defaultTester('101.1') !== null).toBe(true);
			});

			it('floatingPoint - 1001.1001', () => {
				expect(defaultTester('1001.1001') !== null).toBe(true);
			});

			it('floatingPoint - 1001.10010', () => {
				expect(defaultTester('1001.10010') !== null).toBe(true);
			});

			it('floatingPoint - .1001', () => {
				expect(defaultTester('.1001') !== null).toBe(true);
			});

			it('Float with separator - Empty string', () => {
				expect(floatRegExpWithThousandSep('') !== null).toBe(false);
			});

			it('Float with separator - One space string', () => {
				expect(floatRegExpWithThousandSep(' ') !== null).toBe(false);
			});

			it('Float with separator - With upfront 0', () => {
				expect(floatRegExpWithThousandSep('01') !== null).toBe(false);
			});

			it('Float with separator - With letter in the fractional part', () => {
				expect(floatRegExpWithThousandSep('1001.0a1') !== null).toBe(false);
			});

			it('Float with separator - With space in the fractional part', () => {
				expect(floatRegExpWithThousandSep('1001.001 001') !== null).toBe(false);
			});

			it('Float with separator - With no space in the decimal part', () => {
				expect(floatRegExpWithThousandSep('1001.1001') !== null).toBe(false);
			});

			it('Float with separator - With two spaces in the decimal part', () => {
				expect(floatRegExpWithThousandSep('1  001.1001') !== null).toBe(false);
			});

			it('Float with separator - 0', () => {
				expect(floatRegExpWithThousandSep('0') !== null).toBe(true);
			});

			it('Float with separator - 101.101', () => {
				expect(floatRegExpWithThousandSep('101.101') !== null).toBe(true);
			});

			it('Float with separator - 1001.1001', () => {
				expect(floatRegExpWithThousandSep('1 001.1001') !== null).toBe(true);
			});

			it('Float with separator - 10001.10012', () => {
				expect(floatRegExpWithThousandSep('10 001.10012') !== null).toBe(true);
			});

			it('Float with separator - 1000001.0030011', () => {
				expect(floatRegExpWithThousandSep('1 000 001.0030011') !== null).toBe(true);
			});
		});

		const defaultTester = pipe(
			{},
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExpNoneTester = pipe(
			{ signOptions: Transformer.RealOptions.SignOptions.None },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExpMandatoryTester = pipe(
			{ signOptions: Transformer.RealOptions.SignOptions.Mandatory },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExpPlusMinusOptional = pipe(
			{ signOptions: Transformer.RealOptions.SignOptions.PlusMinusOptional },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const intRegExp = pipe(
			{ signOptions: Transformer.RealOptions.SignOptions.None, maxFractionalDigits: 0 },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const intRegExpWithENotation = pipe(
			{
				signOptions: Transformer.RealOptions.SignOptions.None,
				maxFractionalDigits: 0,
				eNotationOptions: Transformer.RealOptions.ENotationOptions.Lowercase
			},
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExp0 = pipe(
			{ signOptions: Transformer.RealOptions.SignOptions.None, maxDecimalDigits: 0 },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExp1 = pipe(
			{ signOptions: Transformer.RealOptions.SignOptions.None, maxDecimalDigits: 1 },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExp2 = pipe(
			{ signOptions: Transformer.RealOptions.SignOptions.None, maxDecimalDigits: 2 },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExp4 = pipe(
			{ signOptions: Transformer.RealOptions.SignOptions.None, maxDecimalDigits: 4 },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExp02 = pipe(
			{ signOptions: Transformer.RealOptions.SignOptions.None, maxFractionalDigits: 2 },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExp022 = pipe(
			{
				signOptions: Transformer.RealOptions.SignOptions.None,
				minFractionalDigits: 2,
				maxFractionalDigits: 2
			},
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		const floatRegExpWithThousandSep = pipe(
			{ thousandSep: ' ' },
			Transformer.RealOptions.withDefaults,
			Transformer.RealOptions.toStringTester
		);

		it('Minus sign allowed - Matching without sign', () => {
			expect(defaultTester('123') !== null).toBe(true);
		});

		it('Minus sign allowed - Matching with sign', () => {
			expect(defaultTester('-123') !== null).toBe(true);
		});

		it('Minus sign allowed - Not matching', () => {
			expect(defaultTester('+123') !== null).toBe(false);
		});

		it('No sign allowed - Matching', () => {
			expect(floatRegExpNoneTester('123') !== null).toBe(true);
		});

		it('No sign allowed - Not matching with +', () => {
			expect(floatRegExpNoneTester('+ 123') !== null).toBe(false);
		});

		it('No sign allowed - Not matching with -', () => {
			expect(floatRegExpNoneTester('-123') !== null).toBe(false);
		});

		it('Mandatory sign - Matching with + ', () => {
			expect(floatRegExpMandatoryTester('+123') !== null).toBe(true);
		});

		it('Mandatory sign - Matching with - ', () => {
			expect(floatRegExpMandatoryTester('-  123') !== null).toBe(true);
		});

		it('Mandatory sign - Not matching', () => {
			expect(floatRegExpMandatoryTester('123') !== null).toBe(false);
		});

		it('Plus/minus sign allowed - Matching with + sign', () => {
			expect(floatRegExpPlusMinusOptional('+123') !== null).toBe(true);
		});

		it('Plus/minus sign allowed - Matching with - sign', () => {
			expect(floatRegExpPlusMinusOptional('-123') !== null).toBe(true);
		});

		it('Plus/minus sign allowed - Matching without sign', () => {
			expect(floatRegExpPlusMinusOptional('123') !== null).toBe(true);
		});

		it('Float without decimal digit - Matching', () => {
			expect(floatRegExp0('.01') !== null).toBe(true);
		});

		it('Float without decimal digit - Not matching', () => {
			expect(floatRegExp0('1') !== null).toBe(false);
		});

		it('Float with at most 1 decimal digit - Matching .01', () => {
			expect(floatRegExp1('.01') !== null).toBe(true);
		});

		it('Float with at most 1 decimal digit - Matching 0', () => {
			expect(floatRegExp1('0') !== null).toBe(true);
		});

		it('Float with at most 1 decimal digit - Matching 1', () => {
			expect(floatRegExp1('1') !== null).toBe(true);
		});

		it('Float with at most 1 decimal digit - Not matching', () => {
			expect(floatRegExp1('10.04') !== null).toBe(false);
		});

		it('Float with at most 2 decimal digits - Matching 0', () => {
			expect(floatRegExp2('0') !== null).toBe(true);
		});

		it('Float with at most 2 decimal digits - Matching 19.998', () => {
			expect(floatRegExp2('19.998') !== null).toBe(true);
		});

		it('Float with at most 2 decimal digits - Not matching', () => {
			expect(floatRegExp2('1199.04') !== null).toBe(false);
		});

		it('Float with at most 4 decimal digits - Matching 1', () => {
			expect(floatRegExp4('1') !== null).toBe(true);
		});

		it('Float with at most 4 decimal digits - Matching 1001.76', () => {
			expect(floatRegExp4('1001.76') !== null).toBe(true);
		});

		it('Float with at most 4 decimal digits - Not matching', () => {
			expect(floatRegExp4('10001.65') !== null).toBe(false);
		});

		it('Float with at most 2 fractional digits - Matching', () => {
			expect(floatRegExp02('1.01') !== null).toBe(true);
		});

		it('Float with at most 2 fractional digits - Not matching', () => {
			expect(floatRegExp02('1.011') !== null).toBe(false);
		});

		it('Float with exactly 2 fractional digits - Matching', () => {
			expect(floatRegExp022('.01') !== null).toBe(true);
		});

		it('Float with exactly 2 fractional digits - Not matching .1', () => {
			expect(floatRegExp022('.1') !== null).toBe(false);
		});

		it('Float with exactly 2 fractional digits - Not matching .111', () => {
			expect(floatRegExp022('.111') !== null).toBe(false);
		});

		it('Integer - Empty string', () => {
			expect(intRegExp('') !== null).toBe(false);
		});

		it('Integer - One space string', () => {
			expect(intRegExp(' ') !== null).toBe(false);
		});

		it('Integer - With upfront 0', () => {
			expect(intRegExp('01') !== null).toBe(false);
		});

		it('Integer - With e notation', () => {
			expect(intRegExp('1e5') !== null).toBe(false);
		});

		it('Integer - With decimal part', () => {
			expect(intRegExp('1001.1') !== null).toBe(false);
		});

		it('Integer - 0', () => {
			expect(intRegExp('0') !== null).toBe(true);
		});

		it('Integer - 101', () => {
			expect(intRegExp('101') !== null).toBe(true);
		});

		it('Integer with e notation - Matching 1e5', () => {
			expect(intRegExpWithENotation('1e5') !== null).toBe(true);
		});

		it('Integer with e notation - Matching 1e-5', () => {
			expect(intRegExpWithENotation('1e-5') !== null).toBe(true);
		});

		it('Integer with e notation - Matching 18', () => {
			expect(intRegExpWithENotation('18') !== null).toBe(true);
		});

		it('Integer with e notation - Not matching', () => {
			expect(intRegExpWithENotation('1 e5') !== null).toBe(false);
		});
	});

	/*describe('unsignedInt', () => {
		const unsignedInt = Transformer.unsignedInt('_');

		it('Reading from string not matching', () => {
			expect(pipe('+107_485foo and bar', unsignedInt.read, Either.isLeft)).toBe(true);
		});

		it('Reading from matching string', () => {
			expect(
				pipe(
					'107_485foo and bar',
					unsignedInt.read,
					// Revert from Chunk to Array when Effect 4.0 with structurzl equality comes out
					Either.map(Chunk.fromIterable),
					Equal.equals(Either.right(Chunk.make(107485, 'foo and bar')))
				)
			).toBe(true);
		});

		it('Writing', () => {
			expect(unsignedInt.write(MPositiveInt.fromNumber(1003457))).toBe('1_003_457');
		});
	});*/
});
