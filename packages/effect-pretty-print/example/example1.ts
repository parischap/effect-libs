import { FormattedString, ansiOptions, stringify } from '@parischap/effect-pretty-print';

const _ = FormattedString.makeWith;

const symbol1 = Symbol.for('symbol1');
const symbol2 = Symbol.for('symbol2');
const symbol3 = Symbol.for('symbol3');
const symbol4 = Symbol.for('symbol4');

class TestA {
	readonly [symbol1]: boolean;
	readonly [symbol2]: undefined | null;
	constructor(
		readonly a: string,
		readonly b: number,
		readonly c: bigInt,
		readonly d: symbol,
		readonly e: unknown,
		f: boolean,
		g: null | undefined
	) {
		this[symbol1] = f;
		this[symbol2] = g;
	}

	test(n: number): number {
		return n + 1;
	}
	[symbol3](): number {
		return 1;
	}
}

class TestB extends TestA {
	constructor(
		a: string,
		b: number,
		c: bigInt,
		d: symbol,
		e: unknown,
		f: boolean,
		g: null | undefined,
		readonly h: unknown,
		readonly i: unknown
	) {
		super(a, b, c, d, e, f, g);
	}

	override test(n: number): number {
		return n + 1;
	}
	[symbol3](): number {
		return 2;
	}
}

class TestC extends TestB {
	constructor(
		a: string,
		b: number,
		c: bigInt,
		d: symbol,
		e: unknown,
		f: boolean,
		g: null | undefined,
		h: unknown,
		i: unknown,
		readonly j: number
	) {
		super(a, b, c, d, e, f, g, h, i);
	}

	essai(n: number): number {
		return n + 1;
	}
}

const testB1 = new TestB('Mozart', 2, 3n, symbol4, true, true, null, 8, 9);
const testC1 = new TestC('Beethoven', 5, 110n, symbol3, testB1, false, undefined, 8, 9, 10);
const testC2 = new TestC('Liszt', 8, 197654n, symbol4, testB1, false, undefined, testC1, 9, 10);

console.log(
	stringify({
		...ansiOptions,
		showNonEnumerableProperties: true,
		tab: _('|----')
	})(testC2).value
);
