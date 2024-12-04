/**
 * This module implements a type that represents an ANSI style. A BasicStyle is similar to a Style
 * (see Style.ts) but without the String constructor syntaxic sugar.
 *
 * @since 0.0.1
 */
import { MInspectable, MPipeable, MString, MTypes } from '@parischap/effect-lib';
import { Array, Equal, Equivalence, flow, Hash, pipe, Pipeable, Predicate } from 'effect';
import * as ASCharacteristic from './Characteristic.js';
import * as ASSequenceString from './SequenceString.js';

export const moduleTag = '@parischap/ansi-styles/BasicStyle/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a BasicStyle
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this style
	 *
	 * @since 0.0.1
	 */
	readonly id: string;
	/**
	 * Sorted array of the Characteristic's defining this style
	 *
	 * @since 0.0.1
	 */
	readonly characteristics: Array.NonEmptyReadonlyArray<ASCharacteristic.Type>;

	/**
	 * StringTransformer that prepends the SequenceString corresponding to this style
	 *
	 * @since 0.0.1
	 */
	readonly toSequenceStringStart: MTypes.StringTransformer;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.6
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.0.6
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.id));
	},
	[MInspectable.IdSymbol](this: Type) {
		return this.id;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/** Constructor from a single Characteristic */
export const _fromCharacteritic = (characteristic: ASCharacteristic.Type): Type =>
	_make({
		id: characteristic.id,
		characteristics: Array.of(characteristic),
		toSequenceStringStart: MString.prepend(characteristic.sequenceString)
	});

/**
 * Builds a BasicStyle from the combination of two other BasicStyles. If `self` and `that` contain
 * contrary Characteristic's (e.g `self` contains `Bold` and `that` contains `Dim`), the
 * characteristics in `that` will prevail.
 *
 * @since 0.0.1
 * @category Utils
 */
export const combine = (that: Type) => (self: Type) => {
	const characteristics = pipe(
		that.characteristics,
		Array.appendAll(self.characteristics),
		Array.sort(ASCharacteristic.byIndexAndId),
		Array.dedupeAdjacent
	) as unknown as Array.NonEmptyReadonlyArray<ASCharacteristic.Type>;

	return _make({
		id: pipe(characteristics, Array.map(ASCharacteristic.id), Array.join('')),
		characteristics,
		toSequenceStringStart: pipe(
			characteristics,
			Array.map(ASCharacteristic.sequence),
			Array.flatten,
			ASSequenceString.fromNonEmptySequence,
			MString.prepend
		)
	});
};

/**
 * Bold BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bold: Type = _fromCharacteritic(ASCharacteristic.bold);

/**
 * Dim BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: Type = _fromCharacteritic(ASCharacteristic.dim);

/**
 * Italic BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: Type = _fromCharacteritic(ASCharacteristic.italic);

/**
 * Underlined BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: Type = _fromCharacteritic(ASCharacteristic.underlined);

/**
 * Struck-through BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: Type = _fromCharacteritic(ASCharacteristic.struckThrough);

/**
 * Overlined BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: Type = _fromCharacteritic(ASCharacteristic.overlined);

/**
 * Inversed BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: Type = _fromCharacteritic(ASCharacteristic.inversed);

/**
 * Hidden BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: Type = _fromCharacteritic(ASCharacteristic.hidden);

/**
 * Slow blink BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const slowBlink: Type = _fromCharacteritic(ASCharacteristic.slowBlink);

/**
 * Fast blink BasicStyle instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const fastBlink: Type = _fromCharacteritic(ASCharacteristic.fastBlink);

/**
 * Standard foreground color BasicStyle instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const standardFgColor: MTypes.OneArgFunction<
	{ readonly id: string; readonly offset: number },
	Type
> = flow(ASCharacteristic.standardFgColor, _fromCharacteritic);

/**
 * Bright foreground color BasicStyle instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const brightFgColor: MTypes.OneArgFunction<
	{ readonly id: string; readonly offset: number },
	Type
> = flow(ASCharacteristic.brightFgColor, _fromCharacteritic);

/**
 * EightBit foreground color BasicStyle instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const eightBitFgColor: MTypes.OneArgFunction<
	{ readonly id: string; readonly code: number },
	Type
> = flow(ASCharacteristic.eightBitFgColor, _fromCharacteritic);

/**
 * RGB foreground color BasicStyle instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const RgbFgColor: MTypes.OneArgFunction<
	{
		readonly id: string;
		readonly redCode: number;
		readonly greenCode: number;
		readonly blueCode: number;
	},
	Type
> = flow(ASCharacteristic.RgbFgColor, _fromCharacteritic);

/**
 * Standard background color BasicStyle instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const standardBgColor: MTypes.OneArgFunction<
	{ readonly id: string; readonly offset: number },
	Type
> = flow(ASCharacteristic.standardBgColor, _fromCharacteritic);

/**
 * Bright background color BasicStyle instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const brightBgColor: MTypes.OneArgFunction<
	{ readonly id: string; readonly offset: number },
	Type
> = flow(ASCharacteristic.brightBgColor, _fromCharacteritic);

/**
 * EightBit background color BasicStyle instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const eightBitBgColor: MTypes.OneArgFunction<
	{ readonly id: string; readonly code: number },
	Type
> = flow(ASCharacteristic.eightBitBgColor, _fromCharacteritic);

/**
 * RGB background color BasicStyle instance maker
 *
 * @since 0.0.1
 * @category Instance makers
 */
export const RgbBgColor: MTypes.OneArgFunction<
	{
		readonly id: string;
		readonly redCode: number;
		readonly greenCode: number;
		readonly blueCode: number;
	},
	Type
> = flow(ASCharacteristic.RgbBgColor, _fromCharacteritic);
