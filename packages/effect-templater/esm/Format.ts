import { MTypes } from '@parischap/effect-lib';
import { Number } from 'effect';
import * as Alignment from './Alignment.js';

//const moduleTag = '@parischap/effect-templater/format/';

/**
 * Utility type that transforms a Format into its real world type
 *
 * @category Utils
 */
export type FormatToType<T extends Type> = T extends Int | InternalNumber ? number : string;

/**
 * A format
 *
 * @category Models
 */
abstract class Type {
	protected constructor() {}
	//abstract readonly stringToValue: <T>(s: string) => T;
	//abstract readonly valueToString: <T>(v: T) => string;
}

export { type Type };
/**
 * An object that contains the parameters used to format an integer
 *
 * @category Models
 */
class Int extends Type {
	/** The base. Will be clamped to the range [2..36] Default: 10 */
	readonly base: number;

	/** The alignment to apply Default: None */
	readonly alignment: Alignment.Type;

	constructor({ base = 10, alignment = Alignment.makeNone() }: MTypes.PartialData<Int> = {}) {
		super();
		this.base = Number.clamp(base, { minimum: 2, maximum: 36 });
		this.alignment = alignment;
	}
}
export { type Int };
/** @category Constructors */
export const makeInt = (params: MTypes.PartialData<Int> = {}): Int => new Int(params);

/**
 * An object that contains the parameters used to format a real number
 *
 * @category Models
 */
class InternalNumber extends Type {
	/** The number of digits after the decimal point. Will be clamped to [0..100] Default: 2 */
	readonly digits: number;

	/** If true, the number will be printed in exponential notation Default: false */
	readonly exponentialNotation: boolean;

	/** The alignment to apply Default: None */
	readonly alignment: Alignment.Type;

	constructor({
		digits = 2,
		exponentialNotation = false,
		alignment = Alignment.makeNone()
	}: MTypes.PartialData<InternalNumber> = {}) {
		super();
		this.digits = Number.clamp(digits, { minimum: 0, maximum: 100 });
		this.exponentialNotation = exponentialNotation;
		this.alignment = alignment;
	}
}

export { type InternalNumber as Number };
/** @category Constructors */
export const makeNumber = (params: MTypes.PartialData<InternalNumber> = {}): InternalNumber =>
	new InternalNumber(params);

/**
 * An object that contains the parameters used to format a string
 *
 * @category Models
 */
class InternalString extends Type {
	/** The alignment to apply Default: None */
	readonly alignment: Alignment.Type;

	constructor({ alignment = Alignment.makeNone() }: MTypes.PartialData<InternalString>) {
		super();
		this.alignment = alignment;
	}
}

export { type InternalString as String };
/** @category Constructors */
export const makeString = (params: MTypes.PartialData<InternalString> = {}): InternalString =>
	new InternalString(params);
