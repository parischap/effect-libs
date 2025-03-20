/* eslint-disable functional/no-expression-statements */
import { MBigDecimal } from '@parischap/effect-lib';
import { BigDecimal } from 'effect';
import { describe, expect, it } from 'vitest';

describe('MBigDecimal', () => {
	it('unsafeFromIntString', () => {
		expect(
			BigDecimal.Equivalence(MBigDecimal.unsafeFromIntString(2)('123'), BigDecimal.make(123n, 2))
		).toBe(true);
	});
});
