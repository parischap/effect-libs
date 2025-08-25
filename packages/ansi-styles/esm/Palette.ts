/**
 * A Palette is a type that groups several styles under an id. It is mainly used to build
 * ContextStylers (see ContextStyler.ts).
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 */

import { MInspectable, MPipeable, MString, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Function,
	Hash,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as ASStyle from './Style.js';
import * as ASStyles from './Styles.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Palette/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Type that represents a Palette.
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/** Array of styles contained by this Palette */
	readonly styles: ASStyles.Type;

	/** @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

const _equivalence = Array.getEquivalence(ASStyle.equivalence);
/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	_equivalence(self.styles, that.styles);

/** Prototype */
const _TypeIdHash = Hash.hash(_TypeId);
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
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
export const make = (...styles: ASStyles.Type): Type => _make({ styles });
const _tupledMake = Function.tupled(make);

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const toId: MTypes.OneArgFunction<Type, string> = flow(
	Struct.get('styles'),
	ASStyles.toId,
	MString.append('Palette')
);

/**
 * Gets the underlying styles of `self`
 *
 * @category Destructors
 */
export const styles: MTypes.OneArgFunction<Type, ASStyles.Type> = Struct.get('styles');

/**
 * Appends `that` to `self`
 *
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type =>
		pipe(self.styles, ASStyles.append(that.styles), _tupledMake);

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
