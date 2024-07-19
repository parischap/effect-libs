/* eslint functional/no-expression-statements: "off", functional/immutable-data: "off" */
import { MTypes } from '@parischap/effect-lib';
import { Options, SplitMode, Stringify } from '@parischap/effect-pretty-print';
import { describe, expect, it } from 'vitest';

describe('effect-pretty-print', () => {
	const defaultStringify = Stringify.asString();

	function test(n: number) {
		return n + 1;
	}

	describe('Basic tests', () => {
		it('string', () => {
			expect(defaultStringify('123')).toBe("'123'");
		});

		it('number', () => {
			expect(defaultStringify(123)).toBe('123');
		});

		it('bigInt', () => {
			expect(defaultStringify(BigInt(9007199254740991))).toBe('9007199254740991n');
		});

		it('boolean', () => {
			expect(defaultStringify(true)).toBe('true');
		});

		it('symbol', () => {
			expect(defaultStringify(Symbol.for('test'))).toBe('Symbol(test)');
		});

		it('undefined', () => {
			expect(defaultStringify(undefined)).toBe('undefined');
		});

		it('null', () => {
			expect(defaultStringify(null)).toBe('null');
		});

		it('function', () => {
			expect(defaultStringify(test)).toBe('(Function)');
		});

		it('simple array', () => {
			expect(defaultStringify([3, 4])).toBe('[3, 4]');
		});

		it('simple object', () => {
			expect(defaultStringify({ a: 1, b: { a: 5, c: 8 }, d: true })).toBe(
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
		const testA = Object.assign(Object.create(testB) as MTypes.AnyRecord, {
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
			expect(
				Stringify.asString(
					Options.generator({
						splitMode: SplitMode.AutoBasedOnConstituentsLength({
							singleLineRecordFormat: Options.singleLineAutoRecordFormat,
							multiLineRecordFormat: Options.multiLineAutoRecordFormat,
							indentMode: Options.tabifyIndentMode,
							limit: 63
						})
					})
				)(testA)
			).toBe(
				'{ Symbol(symbol1): 42, a: 1, b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] }, d: true, e: (Function) }'
			);

			expect(
				Stringify.asString(
					Options.generator({
						splitMode: SplitMode.AutoBasedOnConstituentsLength({
							singleLineRecordFormat: Options.singleLineAutoRecordFormat,
							multiLineRecordFormat: Options.multiLineAutoRecordFormat,
							indentMode: Options.tabifyIndentMode,
							limit: 62
						})
					})
				)(testA)
			).toBe(
				'{\n  Symbol(symbol1): 42,\n  a: 1,\n  b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] },\n  d: true,\n  e: (Function)\n}'
			);
		});

		it('Split on number of constituents', () => {
			expect(
				Stringify.asString(
					Options.generator({
						splitMode: SplitMode.AutoBasedOnConstituentNumber({
							singleLineRecordFormat: Options.singleLineAutoRecordFormat,
							multiLineRecordFormat: Options.multiLineAutoRecordFormat,
							indentMode: Options.tabifyIndentMode,
							limit: 5
						})
					})
				)(testA)
			).toBe(
				'{ Symbol(symbol1): 42, a: 1, b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] }, d: true, e: (Function) }'
			);

			expect(
				Stringify.asString(
					Options.generator({
						splitMode: SplitMode.AutoBasedOnConstituentNumber({
							singleLineRecordFormat: Options.singleLineAutoRecordFormat,
							multiLineRecordFormat: Options.multiLineAutoRecordFormat,
							indentMode: Options.tabifyIndentMode,
							limit: 4
						})
					})
				)(testA)
			).toBe(
				'{\n  Symbol(symbol1): 42,\n  a: 1,\n  b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] },\n  d: true,\n  e: (Function)\n}'
			);
		});

		it('Single-line, with non-enumerables on non-null objects, without functions and symbols', () => {
			expect(
				Stringify.asString({
					...Options.uncoloredSingleLine,
					showNonEnumerableProperties: true,
					showFunctions: false,
					showSymbolicProperties: false,
					propertyFilter: Options.enumerablePropertyFilterForArrays
				})(testA)
			).toBe('{ a: 1, b: { a: 5, c: [7, 8, { a: 9, h: [11, 12, 13] }] }, d: true, g: [54] }');
		});

		it('Single-line, with non-enumerables, without enumerables, non-functions and string keys', () => {
			expect(
				Stringify.asString({
					...Options.uncoloredSingleLine,
					showEnumerableProperties: false,
					showNonEnumerableProperties: true,
					showNonFunctions: false,
					showStringProperties: false
				})(testA)
			).toBe('{ Symbol(symbol2): (Function) }');
		});

		it('Single-line, maxDepth=2', () => {
			expect(
				Stringify.asString({
					...Options.uncoloredSingleLine,
					maxDepth: 2
				})(testA)
			).toBe('{ Symbol(symbol1): 42, a: 1, b: { a: 5, c: [Array] }, d: true, e: (Function) }');
		});

		it('Treeified with maxPrototypeDepth=+Infinity', () => {
			expect(
				Stringify.asString({
					...Options.uncoloredTreeified,
					maxPrototypeDepth: +Infinity
				})(testA)
			).toBe(`
├─ Symbol(symbol1): 42,
├─ a: 1,
├─ a@
│  ├─ 0: 'r',
│  └─ 1
│     └─ c: 8,
├─ b
│  ├─ a: 5,
│  └─ c
│     ├─ 0: 7,
│     ├─ 1: 8,
│     └─ 2
│        ├─ a: 9,
│        └─ h
│           ├─ 0: 11,
│           ├─ 1: 12,
│           └─ 2: 13,
├─ b@: 't',
├─ c@
│  ├─ d
│  │  ├─ 0: 3,
│  │  └─ 1: 4,
│  └─ e
│     ├─ 0: 'a',
│     └─ 1: 'b',
├─ d: true,
└─ e: (Function)`);
		});
	});
});
