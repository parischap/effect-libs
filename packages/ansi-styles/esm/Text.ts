/**
 * This module implements a Text that is an array of StyledString's, i.e a array of strings on which
 * a Style (see Style.ts) is applied. As syntaxic sugar, Text's can be created by Styles.
 *
 * @since 0.0.1
 */

import { MInspectable, MMatch, MPipeable, MString, MTree, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	Function,
	Hash,
	Inspectable,
	Option,
	Pipeable,
	Predicate,
	String,
	Struct,
	Tuple,
	flow,
	pipe
} from 'effect';
import * as ASAnsiString from './AnsiString.js';
import * as ASStyleCharacteristics from './StyleCharacteristics.js';

export const moduleTag = '@parischap/ansi-styles/Text/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace that implements a StyledString
 *
 * @since 0.0.1
 * @category Models
 */
namespace StyledString1 {
	export const moduleTag = _moduleTag + 'StyledString/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Interface that represents a StyledString
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * The string to be styled
		 *
		 * @since 0.0.1
		 */
		readonly string: string;

		/**
		 * The style to apply to the `string` property
		 *
		 * @since 0.0.1
		 */
		readonly style: ASStyleCharacteristics.Type;

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
	 * Equivalence that considers two StyledStrings to be equivalent when they have the same style
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const haveSameStyle: Equivalence.Equivalence<Type> = (self, that) =>
		ASStyleCharacteristics.equivalence(self.style, that.style);

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		that.string === self.string && ASStyleCharacteristics.equivalence(self.style, that.style);

	/** Prototype */
	const _TypeIdHash = Hash.hash(TypeId);
	const proto: MTypes.Proto<Type> = {
		[TypeId]: TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.string,
				Hash.hash,
				Hash.combine(Hash.hash(this.style)),
				Hash.combine(_TypeIdHash),
				Hash.cached(this)
			);
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
	 * Builds a StyledString from a string without applying any style
	 *
	 * @since 0.0.1
	 * @category Constructors
	 */
	export const fromString = (string: string): Type =>
		make({ string, style: ASStyleCharacteristics.none });

	/**
	 * Builds a StyledString whose `string` property is the concatenation of the `string` properties
	 * of the passed StyleString's and whose `style` property is the `style` property of the first
	 * passed StyleString.
	 *
	 * @since 0.0.1
	 * @category Constructors
	 */
	export const fromStyledStrings = (styledStrings: Array.NonEmptyReadonlyArray<Type>): Type =>
		make({
			string: pipe(styledStrings, Array.map(string), Array.join('')),
			style: pipe(styledStrings, Array.headNonEmpty, Struct.get('style'))
		});

	/**
	 * Builds a new StyledString identical to `self` except that the StyleCharacteristic's of `style`
	 * are added to the StyleCharacteristic's of the `style` property of `self`. In case of conflict,
	 * StyleCharacteristic's of the `style` property of `self` prevail over those of the passed
	 * `style`.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const addCharacteristics =
		(style: ASStyleCharacteristics.Type) =>
		(self: Type): Type =>
			make({
				string: self.string,
				style: pipe(style, ASStyleCharacteristics.merge(self.style))
			});

	/**
	 * Builds a new StyledString identical to `self` except that the StyleCharacteristic's of `style`
	 * are removed from the StyleCharacteristic's of the `style` property of `self`.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const removeCharacteristics =
		(style: ASStyleCharacteristics.Type) =>
		(self: Type): Type =>
			make({
				string: self.string,
				style: pipe(self.style, ASStyleCharacteristics.difference(style))
			});

	/**
	 * Returns the `string` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const string: MTypes.OneArgFunction<Type, string> = Struct.get('string');

	/**
	 * Returns the `style` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const style: MTypes.OneArgFunction<Type, ASStyleCharacteristics.Type> =
		Struct.get('style');

	/**
	 * Returns the length of `self` without the length of the styling
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const length: MTypes.OneArgFunction<Type, number> = flow(string, String.length);

	/**
	 * Returns the ANSI string corresponding to `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toPrefixedAnsiString = (self: Type): string =>
		pipe(self.style, ASStyleCharacteristics.toAnsiString, MString.append(self.string));
}

namespace StyledString {
	/**
	 * Type of a StyledString
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export type Type = MTree.Type<ASStyleCharacteristics.Type | string>;

	/**
	 * Guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */
	export const isString = (self: Type): self is MTree.Type<string> => MTypes.isString(self.value);

	/**
	 * Guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */
	export const isStyleCharacteristics = (
		self: Type
	): self is MTree.Type<ASStyleCharacteristics.Type> => ASStyleCharacteristics.has(self.value);

	export const equivalence: Equivalence.Equivalence<Type> = MTree.getValueEquivalence(
		(self, that) =>
			ASStyleCharacteristics.has(self) && ASStyleCharacteristics.has(that) ?
				ASStyleCharacteristics.equivalence(self, that)
			: MTypes.isString(self) && MTypes.isString(that) ? self === that
			: false
	);
}

/**
 * Interface that represents a Text
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/* The text as a tree with strings as leaves and ASStyleCharacteristic's for the other nodes */
	readonly tree: TreeType;

	/* @internal */
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
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	MTree.equivalence(self.tree, that.tree);

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.tree, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return toPrefixedAnsiString(this);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Predicate that returs true if `self` is non-empty
 *
 * @since 0.0.1
 * @category Predicates
 */
export const isNonEmpty: Predicate.Predicate<Type> = flow(Struct.get('tree'), MTree.hasChildren);

/**
 * Predicate that returs true if `self` is empty
 *
 * @since 0.0.1
 * @category Predicates
 */

export const isEmpty: Predicate.Predicate<Type> = Predicate.not(isNonEmpty);

/**
 * Builds a Text by applying a StyleCharacteristics to some strings and other Text's
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromStyleAndElems =
	(characteristics: ASStyleCharacteristics.Type) =>
	(...elems: ReadonlyArray<string | Type>): Type =>
		_make({
			tree: MTree.make({
				value: characteristics,
				forest: pipe(
					elems,
					Array.filterMap(
						flow(
							MMatch.make,
							MMatch.when(MTypes.isString, (s) =>
								pipe({ value: s, forest: Array.empty() }, MTree.make, Option.some)
							),
							MMatch.when(isEmpty, Function.constant(Option.none())),
							MMatch.orElse(flow(Struct.get('tree'), Option.some))
						)
					),
					(z) => z
				)
			})
		});

/**
 * Builds a new Text by concatenating all passed Texts or strings
 *
 * @since 0.0.1
 * @category Utils
 */
export const concat: (...elems: ReadonlyArray<string | Type>) => Type = fromStyleAndElems(
	ASStyleCharacteristics.none
);

/**
 * An empty Text
 *
 * @since 0.0.1
 * @category Instances
 */
export const empty: Type = concat();

/**
 * Returns the `styledStrings` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const tree: MTypes.OneArgFunction<Type, TreeType> = Struct.get('tree');

/**
 * Returns the length of `self` without the length of the styling
 *
 * @since 0.0.1
 * @category Destructors
 */
export const length: MTypes.OneArgFunction<Type, number> = flow(
	tree,
	MTree.reduce(0, (acc, value) => (MTypes.isString(value) ? acc + value.length : acc))
);

/**
 * Returns the ANSI string corresponding to self
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toPrefixedAnsiString = (self: Type): string =>
	pipe(
		self.styledStrings,
		Array.mapAccum(ASStyleCharacteristics.defaults, (context, styledString) =>
			Tuple.make(
				pipe(context, ASStyleCharacteristics.merge(styledString.style)),
				pipe(styledString, StyledString.removeCharacteristics(context))
			)
		),
		Tuple.getSecond,
		Array.map(StyledString.toPrefixedAnsiString),
		Array.join(''),
		MString.append(ASAnsiString.resetAnsiString)
	);

/**
 * Builds a new Text by appending `that` to `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type =>
		concat(self, that);

/**
 * Builds a new String by appending `self` to `that`
 *
 * @since 0.0.1
 * @category Utils
 */
export const prepend =
	(that: Type) =>
	(self: Type): Type =>
		concat(that, self);

/**
 * Builds a new Text by joining all passed Texts and adding self as separator in between
 *
 * @since 0.0.1
 * @category Utils
 */
export const join =
	(self: Type) =>
	(arr: ReadonlyArray<Type>): Type =>
		concat(...pipe(arr, Array.intersperse(self)));

/**
 * Builds a new Text by repeating `n` times the passed Text
 *
 * @since 0.0.1
 * @category Utils
 */
export const repeat =
	(n: number) =>
	(self: Type): Type =>
		concat(...pipe(self, Array.replicate(n)));
