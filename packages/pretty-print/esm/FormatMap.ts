/**
 * This module implements a type that represents formatters identified by a id to be applied to the different
 * parts of a stringified value.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.3.0
 */

import { ASColor, ASFormat, ASFormatter } from '@parischap/ansi-styles';
import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, flow, Hash, HashMap, Option, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as PPStringFormatter from './StringFormatter.js';

const moduleTag = '@parischap/pretty-print/FormatMap/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Interface that represents a FormatSet
 *
 * @since 0.3.0
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Id of this FormatMap instance. Useful for equality and debugging.
	 *
	 * @since 0.3.0
	 */
	readonly id: string;
	/**
	 * Format applied to the different parts of the value to stringify
	 *
	 * @since 0.3.0
	 */
	readonly formatters: HashMap.HashMap<string, PPStringFormatter.Type>;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.3.0
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.3.0
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.id === self.id;

/** Prototype */
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

/**
 * Returns the StringFormatter associated with `formatName`. Returns `StringFormatter.none` if `formatName` is not present in `self`.
 *
 * @since 0.3.0
 * @category Destructors
 */
export const get = (formatName:string):((self:Type)=> PPStringFormatter.Type) =>
	flow(Struct.get('formatters'), HashMap.get(formatName), Option.getOrElse(()=>PPStringFormatter.none))

/**
 * Constructor
 *
 * @since 0.3.0
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * FormatSet instance for that doesn't apply any formatting (uses the None Formatter of the ansi-styles
 * library for all parts to be formatted)
 *
 * @since 0.3.0
 * @category Instances
 */
export const none: Type = make({
	id: 'None',
	format: HashMap.make(['stringValueFormatter', PPStringFormatter.none],
	otherValueFormatter: PPStringFormatter.none,
	symbolValueFormatter: PPStringFormatter.none,
	bigIntMarkFormatter: PPStringFormatter.none,
	propertyKeyFormatterWhenFunctionValue: PPStringFormatter.none,
	propertyKeyFormatterWhenSymbol: PPStringFormatter.none,
	propertyKeyFormatterWhenOther: PPStringFormatter.none,
	propertySeparatorFormatter: PPStringFormatter.none,
	recordDelimitersFormatWheel: PPFormatWheel.empty,
	keyValueSeparatorFormatter: PPStringFormatter.none,
	prototypeMarkFormatter: PPStringFormatter.none,
	multiLineIndentFormatter: PPStringFormatter.none
});

/**
 * FormatSet instance for ansi dark mode - Uses functions from the ansi-styles library
 *
 * @since 0.3.0
 * @category Instances
 */
export const ansiDarkMode: Type = make({
	id: 'AnsiDarkMode',
	stringValueFormatter: pipe(ASColor.Original.green, ASFormat.fromColor, ASFormatter.fromFormat),
	otherValueFormatter: pipe(ASColor.Original.yellow, ASFormat.fromColor, ASFormatter.fromFormat),
	symbolValueFormatter: pipe(ASColor.Original.cyan, ASFormat.fromColor, ASFormatter.fromFormat),
	bigIntMarkFormatter: pipe(ASColor.Original.magenta, ASFormat.fromColor, ASFormatter.fromFormat),
	propertyKeyFormatterWhenFunctionValue: pipe(
		ASColor.Original.blue,
		ASFormat.fromColor,
		ASFormatter.fromFormat
	),
	propertyKeyFormatterWhenSymbol: pipe(
		ASColor.Original.cyan,
		ASFormat.fromColor,
		ASFormatter.fromFormat
	),
	propertyKeyFormatterWhenOther: pipe(
		ASColor.Original.red,
		ASFormat.fromColor,
		ASFormatter.fromFormat
	),
	propertySeparatorFormatter: pipe(
		ASColor.Original.white,
		ASFormat.fromColor,
		ASFormatter.fromFormat
	),
	recordDelimitersFormatWheel: PPFormatWheel.ansiDarkMode,
	keyValueSeparatorFormatter: pipe(
		ASColor.Original.white,
		ASFormat.fromColor,
		ASFormatter.fromFormat
	),
	prototypeMarkFormatter: pipe(ASColor.Original.green, ASFormat.fromColor, ASFormatter.fromFormat),
	multiLineIndentFormatter: pipe(ASColor.Original.green, ASFormat.fromColor, ASFormatter.fromFormat)
});
