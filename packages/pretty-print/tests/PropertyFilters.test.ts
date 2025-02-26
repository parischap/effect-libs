/* eslint-disable functional/no-expression-statements */
import { PPPropertyFilter, PPPropertyFilters, PPValue, PPValues } from '@parischap/pretty-print';
import { Array, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('PropertyFilters', () => {
	const value1 = PPValue.fromTopValue({
		content: 1
	});
	const value2 = PPValue.fromTopValue(Math.max);

	const value3 = PPValue.fromNonPrimitiveValueAndKey({
		nonPrimitiveContent: [1, 2],
		key: 'length',
		depth: 0,
		protoDepth: 0
	});
	const value4 = PPValue.fromNonPrimitiveValueAndKey({
		nonPrimitiveContent: { [Symbol.iterator]: 1, a: 2 },
		key: Symbol.iterator,
		depth: 0,
		protoDepth: 0
	});
	const values: PPValues.Type = Array.make(value1, value2, value3, value4);

	it('toSyntheticPropertyFilter', () => {
		const filters: PPPropertyFilters.Type = Array.make(
			PPPropertyFilter.removeFunctions,
			PPPropertyFilter.removeNonEnumerables
		);
		const removeFunctionsAndNonEnumerables = PPPropertyFilters.toSyntheticPropertyFilter(filters);
		expect(pipe(values, removeFunctionsAndNonEnumerables)).toStrictEqual(Array.of(value4));
	});
});
