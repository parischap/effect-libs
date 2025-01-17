/* eslint-disable functional/no-expression-statements, functional/immutable-data */

import { MStruct, MTypes } from '@parischap/effect-lib';
import {
	PPFormatSet,
	PPOption,
	PPPropertyFilter,
	PPRecordFormatter,
	PPStringify
} from '@parischap/pretty-print';
import { pipe } from 'effect';
import { describe, expect, it } from 'vitest';

describe('pretty-print', () => {
	const defaultPPStringify = PPStringify.asString();

	function test(n: number) {
		return n + 1;
	}

	describe('Basic tests', () => {
		it('string', () => {
			expect(defaultPPStringify('123')).toBe("'123'");
		});

		it('number', () => {
			expect(defaultPPStringify(123)).toBe('123');
		});

		it('bigInt', () => {
			expect(defaultPPStringify(BigInt(9007199254740991))).toBe('9007199254740991n');
		});

		it('boolean', () => {
			expect(defaultPPStringify(true)).toBe('true');
		});

		it('symbol', () => {
			expect(defaultPPStringify(Symbol.for('test'))).toBe('Symbol(test)');
		});

		it('undefined', () => {
			expect(defaultPPStringify(undefined)).toBe('undefined');
		});

		it('null', () => {
			expect(defaultPPStringify(null)).toBe('null');
		});

		it('function', () => {
			expect(defaultPPStringify(test)).toBe('(Function)');
		});

		it('simple array', () => {
			expect(defaultPPStringify([3, 4])).toBe('[3, 4]');
		});

		it('simple object', () => {
			expect(defaultPPStringify({ a: 1, b: { a: 5, c: 8 }, d: true })).toBe(
				'{ a: 1, b: { a: 5, c: 8 }, d: true }'
			);
		});
	});

	describe('Complex tests', () => {
		const testB = {
			c: { e: ['a', 'b'], d: [3, 4] },
			a: ['r', { c: 8 }],
			b: 't'
		};
		Object.defineProperty(testB, 'r', {
			value: 'x',
			enumerable: false
		});
		const symbol1 = Symbol.for('symbol1');
		const symbol2 = Symbol.for('symbol2');
		const testA = Object.assign(Object.create(testB) as MTypes.NonNullObject, {
			a: 1,
			e: () => 42,
			b: { a: 5, c: [7, 8, { h: [11, 12, 13], a: 9 }] },
			[symbol1]: 42,
			d: true
		});
		Object.defineProperties(testA, {
			g: {
				value: [54, (n: number) => n + 1],
				enumerable: false
			},
			[symbol2]: {
				value: (n: number) => n + 2,
				enumerable: false
			}
		});

		it('Split on total length', () => {
			const stringify = pipe(
				PPOption.singleLine(PPFormatSet.none),
				MStruct.set({
					recordFormatter: pipe(PPFormatSet.none, PPRecordFormatter.splitOnTotalLength(92))
				}),
				PPOption.make,
				PPStringify.asString
			);
			expect(stringify(testA)).toBe(
				'{ Symbol(symbol1): 42, a: 1, b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] }, d: true, e: (Function) }'
			);

			expect(
				PPStringify.asString({
					...PPOption.unformattedSplitWhenTotalLengthExceeds40,
					recordFormatter: PPRecordFormatter.splitOnTotalLength(91)(PPFormatSet.none)
				})(testA)
			).toBe(
				'{\n  Symbol(symbol1): 42,\n  a: 1,\n  b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] },\n  d: true,\n  e: (Function)\n}'
			);
		});

		it('Split on number of constituents', () => {
			expect(
				PPStringify.asString({
					...PPOption.unformattedTabified,
					recordFormatter: PPRecordFormatter.splitOnConstituentNumber(5)(PPFormatSet.none)
				})(testA)
			).toBe(
				'{ Symbol(symbol1): 42, a: 1, b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] }, d: true, e: (Function) }'
			);

			expect(
				PPStringify.asString({
					...PPOption.unformattedTabified,
					recordFormatter: PPRecordFormatter.splitOnConstituentNumber(4)(PPFormatSet.none)
				})(testA)
			).toBe(
				'{\n  Symbol(symbol1): 42,\n  a: 1,\n  b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] },\n  d: true,\n  e: (Function)\n}'
			);
		});

		it('Single-line, with non-enumerables except on arrays, without functions and symbols', () => {
			expect(
				PPStringify.asString({
					...PPOption.unformattedSingleLine,
					propertyFilter: pipe(
						PPPropertyFilter.removeNonEnumerablesOnArrays,
						PPPropertyFilter.combine(PPPropertyFilter.removeFunctions),
						PPPropertyFilter.combine(PPPropertyFilter.removeSymbolicKeys)
					)
				})(testA)
			).toBe('{ a: 1, b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] }, d: true, g: [54] }');
		});

		it('Single-line, with non-enumerables, without enumerables, non-functions and string keys', () => {
			expect(
				PPStringify.asString({
					...PPOption.unformattedSingleLine,
					propertyFilter: pipe(
						PPPropertyFilter.removeEnumerables,
						PPPropertyFilter.combine(PPPropertyFilter.removeNonFunctions),
						PPPropertyFilter.combine(PPPropertyFilter.removeStringKeys)
					)
				})(testA)
			).toBe('{ Symbol(symbol2): (Function) }');
		});

		it('Single-line, maxDepth=2', () => {
			expect(
				PPStringify.asString({
					...PPOption.unformattedSingleLine,
					maxDepth: 2
				})(testA)
			).toBe('{ Symbol(symbol1): 42, a: 1, b: { a: 5, c: [Array] }, d: true, e: (Function) }');
		});

		it('Single-line with maxPrototypeDepth=+Infinity and dedupeRecordProperties=true', () => {
			expect(
				PPStringify.asString({
					...PPOption.unformattedSingleLine,
					maxPrototypeDepth: +Infinity,
					dedupeRecordProperties: true
				})(testA)
			).toBe(
				"{ Symbol(symbol1): 42, a: 1, b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] }, c@: { d: [3, 4], e: ['a', 'b'] }, d: true, e: (Function) }"
			);
		});

		it('Treeified with maxPrototypeDepth=+Infinity', () => {
			expect(
				PPStringify.asString({
					...PPOption.unformattedTreeified,
					maxPrototypeDepth: +Infinity
				})(testA)
			).toBe(`
├─ Symbol(symbol1): 42
├─ a: 1
├─ a@
│  ├─ 0: 'r'
│  └─ 1
│     └─ c: 8
├─ b
│  ├─ a: 5
│  └─ c
│     ├─ 0: 7
│     ├─ 1: 8
│     └─ 2
│        ├─ a: 9
│        └─ h
│           ├─ 0: 11
│           ├─ 1: 12
│           └─ 2: 13
├─ b@: 't'
├─ c@
│  ├─ d
│  │  ├─ 0: 3
│  │  └─ 1: 4
│  └─ e
│     ├─ 0: 'a'
│     └─ 1: 'b'
├─ d: true
└─ e: (Function)`);
		});
	});
});
