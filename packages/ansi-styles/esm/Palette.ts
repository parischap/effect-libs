/**
 * A Palette is a type that groups several styles under an id. It is mainly used to build
 * ContextFormatters (see ContextFormatter.ts).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.1.0
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Array, Equal, Equivalence, flow, Hash, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as ASStyle from './Style.js';

export const moduleTag = '@parischap/ansi-styles/Palette/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an array of Style's.
 *
 * @since 0.0.1
 * @category Models
 */
export type Styles = ReadonlyArray<ASStyle.Type>;

/**
 * Type that represents a Palette.
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Array of styles contained by this Palette
	 *
	 * @since 0.0.1
	 */
	readonly styles: Styles;

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

// To be removed when Effect 4.0 with structural equality comes out
const _equivalence = Array.getEquivalence(ASStyle.equivalence);

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	_equivalence(self.styles, that.styles);

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.styles, Hash.array, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return toId(this);
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
 * Gets the id of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toId: MTypes.OneArgFunction<Type, string> = flow(
	Struct.get('styles'),
	Array.map(ASStyle.toId),
	Array.join('/')
);

/**
 * Gets the underlying styles of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const styles: MTypes.OneArgFunction<Type, Styles> = Struct.get('styles');

/**
 * Appends `that` to `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type =>
		make({
			styles: pipe(self.styles, Array.appendAll(that.styles))
		});

/**
 * Empty Palette instance
 *
 * @since 0.0.1
 * @category Instances
 */

export const empty: Type = make({
	styles: Array.empty()
});

/**
 * Palette instance which contains all standard original colors
 *
 * @since 0.0.1
 * @category Instances
 */

export const allStandardOriginalColors: Type = make({
	styles: Array.make(
		ASStyle.black,
		ASStyle.red,
		ASStyle.green,
		ASStyle.yellow,
		ASStyle.blue,
		ASStyle.magenta,
		ASStyle.cyan,
		ASStyle.white
	)
});

/**
 * Palette instance which contains all bright original colors
 *
 * @since 0.0.1
 * @category Instances
 */

export const allBrightOriginalColors: Type = make({
	styles: Array.make(
		ASStyle.Bright.black,
		ASStyle.Bright.red,
		ASStyle.Bright.green,
		ASStyle.Bright.yellow,
		ASStyle.Bright.blue,
		ASStyle.Bright.magenta,
		ASStyle.Bright.cyan,
		ASStyle.Bright.white
	)
});

/**
 * Palette instance which contains all original colors
 *
 * @since 0.0.1
 * @category Instances
 */

export const allOriginalColors: Type = pipe(
	allStandardOriginalColors,
	append(allBrightOriginalColors)
);
