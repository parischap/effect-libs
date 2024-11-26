/**
 * A Palette is a type that groups several formats under a name. It is mainly used to build
 * ContextFormatters (see ContextFormatter.ts).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.1.0
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Array, Equal, Equivalence, Hash, Pipeable, Predicate, Struct } from 'effect';
import * as ASFormat from './Format.js';

const moduleTag = '@parischap/ansi-styles/Palette/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents a Palette.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this Palette instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;

	/**
	 * Array of formats contained by this Palette
	 *
	 * @since 0.0.1
	 */
	readonly formats: ReadonlyArray<ASFormat.Type>;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.name === self.name;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	[MInspectable.NameSymbol](this: Type) {
		return this.name;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Gets the name of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type, string> = Struct.get('name');

/**
 * Gets the underlying formats of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const formats: MTypes.OneArgFunction<Type, ReadonlyArray<ASFormat.Type>> = Struct.get(
	'formats'
);

/**
 * Palette instance which contains all standard original colors
 *
 * @since 0.0.1
 * @category Instances
 */

export const allStandardOriginalColors = make({
	name: 'AllStandardOriginalColors',
	formats: Array.make(
		ASFormat.Colored.Original.black,
		ASFormat.Colored.Original.red,
		ASFormat.Colored.Original.green,
		ASFormat.Colored.Original.yellow,
		ASFormat.Colored.Original.blue,
		ASFormat.Colored.Original.magenta,
		ASFormat.Colored.Original.cyan,
		ASFormat.Colored.Original.white
	)
});

/**
 * Palette instance which contains all bright original colors
 *
 * @since 0.0.1
 * @category Instances
 */

export const allBrightOriginalColors = make({
	name: 'AllStandardOriginalColors',
	formats: Array.make(
		ASFormat.Colored.Original.brightBlack,
		ASFormat.Colored.Original.brightRed,
		ASFormat.Colored.Original.brightGreen,
		ASFormat.Colored.Original.brightYellow,
		ASFormat.Colored.Original.brightBlue,
		ASFormat.Colored.Original.brightMagenta,
		ASFormat.Colored.Original.brightCyan,
		ASFormat.Colored.Original.brightWhite
	)
});

/**
 * Palette instance which contains all original colors
 *
 * @since 0.0.1
 * @category Instances
 */

export const allOriginalColors = make({
	name: 'AllStandardOriginalColors',
	formats: Array.appendAll(allStandardOriginalColors.formats, allBrightOriginalColors.formats)
});
