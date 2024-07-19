import { MTypes } from '@parischap/effect-lib';
import { Array, Equal, Hash, Inspectable, Number, Order, String, pipe } from 'effect';

//const moduleTag = '@parischap/effect-lib/FormattedString/';

/**
 * MODEL
 * A string that may contain format characters, e.g css styles or unicode characters. It contains a printedLength property that is the length of the printable characters, i.e excluding all formatting characters
 */
class Type implements Equal.Equal, Inspectable.Inspectable {
	/**
	 * The underlying string
	 */
	readonly value: string;
	/**
	 * The length of the printable characters, i.e excluding all formatting characters
	 */
	readonly printedLength: number;
	constructor({ value, printedLength }: MTypes.Data<Type>) {
		this.value = value;
		this.printedLength = printedLength;
	}

	[Equal.symbol](that: Equal.Equal): boolean {
		return that instanceof Type ? this.value === that.value : false;
	}
	[Hash.symbol](): number {
		return Hash.cached(this, Hash.hash(this.value));
	}
	toJSON() {
		return {
			value: Inspectable.toJSON(this.value),
			printedLength: Inspectable.toJSON(this.printedLength)
		};
	}
	[Inspectable.NodeInspectSymbol]() {
		return this.toJSON();
	}
	toString() {
		return Inspectable.format(this.toJSON());
	}
}

export { type Type };

export const makeWith =
	(f?: (i: string) => string) =>
	(s: string): Type =>
		new Type({
			value: MTypes.isUndefined(f) ? s : f(s),
			printedLength: s.length
		});

export const empty = makeWith()('');

export const append =
	(that: Type) =>
	(self: Type): Type =>
		new Type({
			value: self.value + that.value,
			printedLength: self.printedLength + that.printedLength
		});

export const prepend =
	(that: Type) =>
	(self: Type): Type =>
		new Type({
			value: that.value + self.value,
			printedLength: that.printedLength + self.printedLength
		});

export const concat = (...sArr: ReadonlyArray<Type>): Type =>
	new Type({
		value: pipe(
			sArr,
			Array.map((s) => s.value),
			Array.join('')
		),

		printedLength: pipe(
			sArr,
			Array.map((s) => s.printedLength),
			Number.sumAll
		)
	});

export const join =
	(sep: Type) =>
	(sArr: ReadonlyArray<Type>): Type =>
		new Type({
			value: pipe(
				sArr,
				Array.map((s) => s.value),
				Array.join(sep.value)
			),

			printedLength: pipe(
				sArr,
				Array.map((s) => s.printedLength),
				Number.sumAll,
				Number.sum(Math.max(0, sep.printedLength * (sArr.length - 1)))
			)
		});

export const repeat =
	(n: number) =>
	(self: Type): Type =>
		new Type({
			value: String.repeat(n)(self.value),
			printedLength: n * self.printedLength
		});

export const isEmpty = (self: Type): boolean => self.printedLength === 0;

export const order = Order.mapInput(Order.string, (s: Type) => s.value);

export const printedLength = (self: Type): number => self.printedLength;
