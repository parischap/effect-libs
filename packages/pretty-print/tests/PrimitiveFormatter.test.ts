/* eslint-disable functional/no-expression-statements */
import { PPOption, PPPrimitiveFormatter, PPValue } from '@parischap/pretty-print';
import { Equal, pipe } from 'effect';
import { describe, it } from 'vitest';

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
			TEUtils.strictEqual(
				PPPrimitiveFormatter.moduleTag,
				TEUtils.moduleTagFromTestFilePath(__filename)
			);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertTrue(
					Equal.equals(utilInspectLikeFormatter, PPPrimitiveFormatter.utilInspectLikeMaker())
				);
			});

			it('Non-matching', () => {
				TEUtils.assertFalse(
					Equal.equals(utilInspectLikeFormatter, utilInspectLikeFormatterWithOtherDefaults)
				);
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(utilInspectLikeFormatter.toString(), `UtilInspectLike`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(
				utilInspectLikeFormatter.pipe(PPPrimitiveFormatter.id),
				'UtilInspectLike'
			);
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPPrimitiveFormatter.has(utilInspectLikeFormatter));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPPrimitiveFormatter.has(new Date()));
			});
		});
	});

	describe('utilInspectLikeMaker', () => {
		it('string under maxStringlength', () => {
			TEUtils.strictEqual(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue('foo')
					)
				),
				"'foo'"
			);
		});

		it('string under maxStringlength', () => {
			TEUtils.strictEqual(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue('foobar')
					)
				),
				"'foo...'"
			);
		});

		it('number', () => {
			TEUtils.strictEqual(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(utilInspectLike, PPValue.fromTopValue(255))
				),
				'255'
			);
		});

		it('bigint', () => {
			TEUtils.strictEqual(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(BigInt(5))
					)
				),
				'5n'
			);
		});

		it('boolean', () => {
			TEUtils.strictEqual(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(true)
					)
				),
				'true'
			);
		});

		it('symbol', () => {
			TEUtils.strictEqual(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(Symbol.for('foo'))
					)
				),
				'Symbol(foo)'
			);
		});

		it('undefined', () => {
			TEUtils.strictEqual(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(undefined)
					)
				),
				'undefined'
			);
		});

		it('null', () => {
			TEUtils.strictEqual(
				pipe(
					utilInspectLikeFormatterWithOtherDefaults.call(
						utilInspectLike,
						PPValue.fromTopValue(null)
					)
				),
				'null'
			);
		});
	});
});
