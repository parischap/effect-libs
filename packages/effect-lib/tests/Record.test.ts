/* eslint-disable functional/no-expression-statements */
import { MRecord } from '@parischap/effect-lib';
import { Option, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MRecord', () => {
	it('unsafeGet', () => {
		expect(pipe({ a: 1, b: true }, MRecord.unsafeGet('a'))).toBe(1);
	});

	describe('tryZeroParamStringFunction', () => {
		it('Object with default prototype', () => {
			expect(
				pipe(
					{ a: 5 },
					MRecord.tryZeroParamStringFunction({
						functionName: 'toString',
						/* eslint-disable-next-line @typescript-eslint/unbound-method */
						exception: Object.prototype.toString
					}),
					Option.isNone
				)
			).toBe(true);
		});

		it('Date object', () => {
			expect(
				pipe(
					new Date(),
					MRecord.tryZeroParamStringFunction({
						functionName: 'toString',
						/* eslint-disable-next-line @typescript-eslint/unbound-method */
						exception: Object.prototype.toString
					}),
					Option.isSome
				)
			).toBe(true);
		});
	});
});
