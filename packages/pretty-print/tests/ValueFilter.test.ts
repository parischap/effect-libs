/* eslint-disable functional/no-expression-statements */
import { MFunction, MUtils } from '@parischap/effect-lib';
import { PPValue, PPValueFilter, PPValues } from '@parischap/pretty-print';
import { Array, Equal, Function, pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('ValueFilter', () => {
	const removeFunctions = PPValueFilter.removeFunctions;

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
			expect(PPValueFilter.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
		});

		describe('Equal.equals', () => {
			const dummy = PPValueFilter.make({
				id: 'RemoveFunctions',
				action: Function.identity
			});
			it('Matching', () => {
				expect(Equal.equals(removeFunctions, dummy)).toBe(true);
			});

			it('Non-matching', () => {
				expect(Equal.equals(removeFunctions, PPValueFilter.removeNonFunctions)).toBe(false);
			});
		});

		it('.toString()', () => {
			expect(removeFunctions.toString()).toBe(`RemoveFunctions`);
		});

		it('.pipe()', () => {
			expect(removeFunctions.pipe(PPValueFilter.id)).toBe('RemoveFunctions');
		});

		describe('has', () => {
			it('Matching', () => {
				expect(PPValueFilter.has(removeFunctions)).toBe(true);
			});
			it('Non matching', () => {
				expect(PPValueFilter.has(new Date())).toBe(false);
			});
		});
	});

	it('removeNonFunctions', () => {
		expect(pipe(values, PPValueFilter.removeNonFunctions)).toStrictEqual(Array.of(value2));
	});

	it('removeFunctions', () => {
		expect(pipe(values, PPValueFilter.removeFunctions)).toStrictEqual(
			Array.make(value1, value3, value4)
		);
	});

	it('removeNonEnumerables', () => {
		expect(pipe(values, PPValueFilter.removeNonEnumerables)).toStrictEqual(Array.of(value4));
	});

	it('removeEnumerables', () => {
		expect(pipe(values, PPValueFilter.removeEnumerables)).toStrictEqual(
			Array.make(value1, value2, value3)
		);
	});

	it('removeStringKeys', () => {
		expect(pipe(values, PPValueFilter.removeStringKeys)).toStrictEqual(Array.of(value4));
	});

	it('removeSymbolicKeys', () => {
		expect(pipe(values, PPValueFilter.removeSymbolicKeys)).toStrictEqual(
			Array.make(value1, value2, value3)
		);
	});

	it('removeNotFulfillingKeyPredicate', () => {
		expect(
			pipe(
				values,
				PPValueFilter.removeNotFulfillingKeyPredicate({
					id: 'OnlyLength',
					predicate: MFunction.strictEquals('length')
				})
			)
		).toStrictEqual(Array.of(value3));
	});
});
