/* eslint-disable functional/no-expression-statements */
import { MPredicate } from '@parischap/effect-lib';
import { PPPropertyFilter, PPValue, PPValues } from '@parischap/pretty-print';
import { TEUtils } from '@parischap/test-utils';
import { Array, Function, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('PropertyFilter', () => {
	const removeFunctions = PPPropertyFilter.removeFunctions;

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

	describe('Tag, prototype and guards', () => {
		it('moduleTag', () => {
			TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), PPPropertyFilter.moduleTag);
		});

		describe('Equal.equals', () => {
			it('Matching', () => {
				TEUtils.assertEquals(
					removeFunctions,
					PPPropertyFilter.make({
						id: 'RemoveFunctions',
						action: Function.identity
					})
				);
			});

			it('Non-matching', () => {
				TEUtils.assertNotEquals(removeFunctions, PPPropertyFilter.removeNonFunctions);
			});
		});

		it('.toString()', () => {
			TEUtils.strictEqual(removeFunctions.toString(), `RemoveFunctions`);
		});

		it('.pipe()', () => {
			TEUtils.strictEqual(removeFunctions.pipe(PPPropertyFilter.id), 'RemoveFunctions');
		});

		describe('has', () => {
			it('Matching', () => {
				TEUtils.assertTrue(PPPropertyFilter.has(removeFunctions));
			});
			it('Non matching', () => {
				TEUtils.assertFalse(PPPropertyFilter.has(new Date()));
			});
		});
	});

	it('removeNonFunctions', () => {
		TEUtils.deepStrictEqual(pipe(values, PPPropertyFilter.removeNonFunctions), Array.of(value2));
	});

	it('removeFunctions', () => {
		TEUtils.deepStrictEqual(
			pipe(values, PPPropertyFilter.removeFunctions),
			Array.make(value1, value3, value4)
		);
	});

	it('removeNonEnumerables', () => {
		TEUtils.deepStrictEqual(pipe(values, PPPropertyFilter.removeNonEnumerables), Array.of(value4));
	});

	it('removeEnumerables', () => {
		TEUtils.deepStrictEqual(
			pipe(values, PPPropertyFilter.removeEnumerables),
			Array.make(value1, value2, value3)
		);
	});

	it('removeStringKeys', () => {
		TEUtils.deepStrictEqual(pipe(values, PPPropertyFilter.removeStringKeys), Array.of(value4));
	});

	it('removeSymbolicKeys', () => {
		TEUtils.deepStrictEqual(
			pipe(values, PPPropertyFilter.removeSymbolicKeys),
			Array.make(value1, value2, value3)
		);
	});

	it('removeNotFulfillingKeyPredicateMaker', () => {
		TEUtils.deepStrictEqual(
			pipe(
				values,
				PPPropertyFilter.removeNotFulfillingKeyPredicateMaker({
					id: 'OnlyLength',
					predicate: MPredicate.strictEquals('length')
				})
			),
			Array.of(value3)
		);
	});
});
