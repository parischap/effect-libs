/* eslint-disable functional/no-expression-statements */
import { MUtils } from '@parischap/effect-lib';
import { PPOption, PPPrimitiveFormatter, PPValue } from '@parischap/pretty-print';
import { Equal, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('PrimitiveFormatter', () => {
	const utilInspectLike = PPOption.utilInspectLike;
	const utilInspectLikeFormatter = PPPrimitiveFormatter.utilInspectLikeMaker();
	const utilInspectLikeFormatterWithOtherDefaults = PPPrimitiveFormatter.utilInspectLikeMaker({
		maxStringLength: 3,
		numberFormatter: new Intl.NumberFormat(),
		id: 'UtilInspectLikeWithOtherDefaults'
	});
	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			expect(PPPrimitiveFormatter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				expect(
					Equal.equals(utilInspectLikeFormatter, PPPrimitiveFormatter.utilInspectLikeMaker())
				).toBe(true);
			});

			it('Non-matching', () => {
				expect(
					Equal.equals(utilInspectLikeFormatter, utilInspectLikeFormatterWithOtherDefaults)
				).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(utilInspectLikeFormatter.toString()).toBe(`UtilInspectLike`);
		});

		it('.pipe()', () => {
			expect(utilInspectLikeFormatter.pipe(PPPrimitiveFormatter.id)).toBe('UtilInspectLike');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPPrimitiveFormatter.has(utilInspectLikeFormatter)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPPrimitiveFormatter.has(new Date())).toBe(false);
			});
		});
	});

	describe('utilInspectLikeMaker', () => {
		it('string under maxStringlength', () => {
			expect(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue('foo')
					)
				)
			).toBe("'foo'");
		});

		it('string under maxStringlength', () => {
			expect(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue('foobar')
					)
				)
			).toBe("'foo...'");
		});

		it('number', () => {
			expect(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(utilInspectLike, PPValue.fromTopValue(255))
				)
			).toBe('255');
		});

		it('bigint', () => {
			expect(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(BigInt(5))
					)
				)
			).toBe('5n');
		});

		it('boolean', () => {
			expect(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(true)
					)
				)
			).toBe('true');
		});

		it('symbol', () => {
			expect(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(Symbol.for('foo'))
					)
				)
			).toBe('Symbol(foo)');
		});

		it('undefined', () => {
			expect(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(undefined)
					)
				)
			).toBe('undefined');
		});

		it('null', () => {
			expect(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(null)
					)
				)
			).toBe('null');
		});
	});
});
