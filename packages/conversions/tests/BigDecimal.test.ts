/* eslint-disable functional/no-expression-statements */
import {
	CVBigDecimal,
	CVInteger,
	CVPositiveInteger,
	CVPositiveReal,
	CVReal
} from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { BigDecimal } from 'effect';
import { describe, it } from 'vitest';

describe('CVBigDecimal', () => {
	it('From Real', () => {
		TEUtils.deepStrictEqual(
			CVBigDecimal.fromReal(CVReal.unsafeFromNumber(-154)),
			BigDecimal.make(-154n, 0)
		);
	});

	it('From PositiveReal', () => {
		TEUtils.deepStrictEqual(
			CVBigDecimal.fromReal(CVPositiveReal.unsafeFromNumber(154)),
			BigDecimal.make(154n, 0)
		);
	});

	it('From PositiveInteger', () => {
		TEUtils.deepStrictEqual(
			CVBigDecimal.fromReal(CVPositiveInteger.unsafeFromNumber(154)),
			BigDecimal.make(154n, 0)
		);
	});

	it('From Integer', () => {
		TEUtils.deepStrictEqual(
			CVBigDecimal.fromReal(CVInteger.unsafeFromNumber(-154)),
			BigDecimal.make(-154n, 0)
		);
	});
});
