/* eslint-disable functional/no-expression-statements */
import { MRecord, MTypes } from '@parischap/effect-lib';
import { Number, Option, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MRecord', () => {
	it('unsafeGet', () => {
		expect(pipe({ a: 1, b: true }, MRecord.unsafeGet('a'))).toBe(1);
	});

	describe('tryZeroParamFunction', () => {
		it('Object with default prototype', () => {
			expect(
				pipe(
					{ a: 5 },
					MRecord.tryZeroParamFunction({
						functionName: 'toString',
						/* eslint-disable-next-line @typescript-eslint/unbound-method */
						exception: Object.prototype.toString
					}),
					Option.isNone
				)
			).toBe(true);
		});

		it('getDay on Date object', () => {
			expect(
				Option.getEquivalence(Number.Equivalence)(
					pipe(
						new Date(0),
						MRecord.tryZeroParamFunction({
							functionName: 'getDay'
						}),
						Option.filter(MTypes.isNumber)
					),
					Option.some(4)
				)
			).toBe(true);
		});
	});

	describe('tryZeroParamStringFunction', () => {
		it('getDay on Date object', () => {
			expect(
				pipe(
					new Date(0),
					MRecord.tryZeroParamStringFunction({
						functionName: 'getDay'
					}),
					Option.isNone
				)
			).toBe(true);
		});

		it('toString on Date object', () => {
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
