/**
 * A Palette is a type that groups several styles under an id. It is mainly used to build
 * ContextFormatters (see ContextFormatter.ts).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { MInspectable, MPipeable, MString, MTypes } from '@parischap/effect-lib';
import { Array, Equal, Equivalence, flow, Hash, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as ASStyle from './Style.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/ansi-styles/Palette/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an array of Style's.
 *
 * @category Models
 */
export type Styles = MTypes.OverTwo<ASStyle.Type>;

/**
 * Type that represents a Palette.
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/** Array of styles contained by this Palette */
	readonly styles: Styles;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);

// To be removed when Effect 4.0 with structural equality comes out
const _equivalence = Array.getEquivalence(ASStyle.equivalence);

/**
 * Equivalence
 *
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

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (...styles: Styles): Type => _make({ styles });

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const toId: MTypes.OneArgFunction<Type, string> = flow(
	Struct.get('styles'),
	Array.map(ASStyle.toId),
	Array.join('/'),
	MString.append('Palette')
);

/**
 * Gets the underlying styles of `self`
 *
 * @category Destructors
 */
export const styles: MTypes.OneArgFunction<Type, Styles> = Struct.get('styles');

/**
 * Appends `that` to `self`
 *
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type =>
		make(...self.styles, ...that.styles);

/**
 * Palette instance which contains all standard original colors
 *
 * @category Instances
 */

export const allStandardOriginalColors: Type = make(
	ASStyle.black,
	ASStyle.red,
	ASStyle.green,
	ASStyle.yellow,
	ASStyle.blue,
	ASStyle.magenta,
	ASStyle.cyan,
	ASStyle.white
);

/**
 * Palette instance which contains all bright original colors
 *
 * @category Instances
 */

export const allBrightOriginalColors: Type = make(
	ASStyle.Bright.black,
	ASStyle.Bright.red,
	ASStyle.Bright.green,
	ASStyle.Bright.yellow,
	ASStyle.Bright.blue,
	ASStyle.Bright.magenta,
	ASStyle.Bright.cyan,
	ASStyle.Bright.white
);

/**
 * Palette instance which contains all original colors
 *
 * @category Instances
 */

export const allOriginalColors: Type = pipe(
	allStandardOriginalColors,
	append(allBrightOriginalColors)
);
