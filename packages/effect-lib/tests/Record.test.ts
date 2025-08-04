/* eslint-disable functional/no-expression-statements */
import { MRecord, MTypes } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { Option, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('MRecord', () => {
	it('unsafeGet', () => {
		TEUtils.strictEqual(pipe({ a: 1, b: true }, MRecord.unsafeGet('a')), 1);
	});

	describe('tryZeroParamFunction', () => {
		it('Object with default prototype', () => {
			TEUtils.assertNone(
				pipe(
					{ a: 5 },
					MRecord.tryZeroParamFunction({
						functionName: 'toString',
						/* eslint-disable-next-line @typescript-eslint/unbound-method */
						exception: Object.prototype.toString
					})
				)
			);
		});

		it('getDay on Date object', () => {
			TEUtils.assertSome(
				pipe(
					new Date(0),
					MRecord.tryZeroParamFunction({
						functionName: 'getDay'
					}),
					Option.filter(MTypes.isNumber)
				),
				4
			);
		});
	});

	describe('tryZeroParamStringFunction', () => {
		it('getDay on Date object', () => {
			TEUtils.assertNone(
				pipe(
					new Date(0),
					MRecord.tryZeroParamStringFunction({
						functionName: 'getDay'
					})
				)
			);
		});

		it('toString on Date object', () => {
			TEUtils.assertSome(
				pipe(
					new Date(),
					MRecord.tryZeroParamStringFunction({
						functionName: 'toString',
						/* eslint-disable-next-line @typescript-eslint/unbound-method */
						exception: Object.prototype.toString
					})
				)
			);
		});
	});
});
