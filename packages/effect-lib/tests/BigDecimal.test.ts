/* eslint-disable functional/no-expression-statements */
import { MBigDecimal } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal } from 'effect';
import { describe, it } from 'vitest';

describe('MBigDecimal', () => {
	it('unsafeFromIntString', () => {
		TEUtils.assertEquals(MBigDecimal.unsafeFromIntString(2)('123'), BigDecimal.make(123n, 2));
	});
});
