/**
 * This module implements a Text that is an array of StyledString's, i.e a array of strings on which
 * a Style (see Style.ts) is applied. As syntaxic sugar, Text's can be created by Styles.
 *
 * @since 0.0.1
 */

import {
	MArray,
	MFunction,
	MInspectable,
	MMatch,
	MPipeable,
	MString,
	MStruct,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	Hash,
	Inspectable,
	Number,
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
const _moduleTag = moduleTag;
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Namespace of a unformly styled text (that is a text that is thorougly formatted with the same
 * style)
 *
 * @since 0.0.1
 */
namespace UniStyled {
	const moduleTag = _moduleTag + 'UniStyled/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Interface that represents a Unistyled text
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * The text to be styled
		 *
		 * @since 0.0.1
		 */
		readonly text: string;

		/**
		 * The style to apply to the text
		 *
		 * @since 0.0.1
		 */
		readonly styleCharacteristics: ASStyleCharacteristics.Type;

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
		self.text === that.text &&
		ASStyleCharacteristics.equivalence(self.styleCharacteristics, that.styleCharacteristics);

	/**
	 * Equivalence based on the styleCharacteristics
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const haveSameStyle: Equivalence.Equivalence<Type> = (self, that) =>
		ASStyleCharacteristics.equivalence(self.styleCharacteristics, that.styleCharacteristics);

	/** Prototype */
	const _TypeIdHash = Hash.hash(TypeId);
	const proto: MTypes.Proto<Type> = {
		[TypeId]: TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.text,
				Hash.hash,
				Hash.combine(Hash.hash(this.styleCharacteristics)),
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
	 */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Gets the `text` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const text: MTypes.OneArgFunction<Type, string> = Struct.get('text');

	/**
	 * Gets the `styleCharacteristics` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const styleCharacteristics: MTypes.OneArgFunction<Type, ASStyleCharacteristics.Type> =
		Struct.get('styleCharacteristics');

	/**
	 * Merges the chararcteristics of `styleCharacteristics` with the styleCharacteristics of `self`.
	 * In case of conflict, the characteristics in `self` prevail.
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const applyStyleUnder = (
		styleCharacteristics: ASStyleCharacteristics.Type
	): MTypes.OneArgFunction<Type, Type> =>
		flow(
			MStruct.evolve({
				styleCharacteristics: ASStyleCharacteristics.mergeUnder(styleCharacteristics)
			}),
			make
		);

	/**
	 * Builds a new UniStyled from the concatenation of several UniStyled. The style of the resulting
	 * Unistyled is the one of the first Unistyled to concatenated
	 *
	 * @since 0.0.1
	 * @category Constructors
	 */
	export const concat = (elems: Array.NonEmptyReadonlyArray<Type>): Type =>
		make({
			text: pipe(elems, Array.map(text), Array.join('')),
			styleCharacteristics: pipe(elems, Array.headNonEmpty, styleCharacteristics)
		});

	/**
	 * Gets the length of `self` without the formatting
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const length: MTypes.OneArgFunction<Type, number> = flow(
		Struct.get('text'),
		String.length
	);

	/**
	 * Returns the ANSI string corresponding to self
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toAnsiString = (self: Type): string => {
		const ansiStart = ASStyleCharacteristics.toAnsiString(self.styleCharacteristics);
		return ansiStart + self.text + (ansiStart !== '' ? ASAnsiString.reset : '');
	};
}

/**
 * Interface that represents a Text
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/* The text as an array of UniStyled */
	readonly uniStyledTexts: ReadonlyArray<UniStyled.Type>;

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

// To be removed when Effect 4.0 with structural equality comes out
const _equivalence = Array.getEquivalence(UniStyled.equivalence);
/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	_equivalence(self.uniStyledTexts, that.uniStyledTexts);

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.uniStyledTexts, Hash.array, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return toAnsiString(this);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Returns the `uniStyledTexts` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const uniStyledTexts: MTypes.OneArgFunction<
	Type,
	ReadonlyArray<UniStyled.Type>
> = Struct.get('uniStyledTexts');

/**
 * Returns the length of `self` without the length of the styling
 *
 * @since 0.0.1
 * @category Destructors
 */
export const length: MTypes.OneArgFunction<Type, number> = flow(
	uniStyledTexts,
	Array.map(UniStyled.length),
	Number.sumAll
);

/**
 * Predicate that returs true if `self` is empty
 *
 * @since 0.0.1
 * @category Predicates
 */

export const isEmpty: Predicate.Predicate<Type> = flow(length, MFunction.strictEquals(0));

/**
 * Builds a Text by applying a StyleCharacteristics to some strings and other Text's
 *
 * @since 0.0.1
 * @category Constructors
 */

/**
 * Builds a new Text by concatenating all passed Texts or strings
 *
 * @since 0.0.1
 * @category Utils
 */
export const fromStyleAndElems =
	(styleCharacteristics: ASStyleCharacteristics.Type) =>
	(...elems: ReadonlyArray<string | Type>): Type =>
		_make({
			uniStyledTexts: pipe(
				elems,
				Array.filterMap(
					flow(
						MMatch.make,
						MMatch.when(
							MTypes.isString,
							flow(
								Option.liftPredicate(String.isNonEmpty),
								Option.map((text) => pipe({ text, styleCharacteristics }, UniStyled.make, Array.of))
							)
						),
						MMatch.orElse(
							flow(
								Struct.get('uniStyledTexts'),
								Array.map(UniStyled.applyStyleUnder(styleCharacteristics)),
								Option.some
							)
						)
					)
				),
				Array.flatten,
				Array.match({
					onEmpty: () => Array.empty<UniStyled.Type>(),
					onNonEmpty: flow(Array.groupWith(UniStyled.haveSameStyle), Array.map(UniStyled.concat))
				})
			)
		});

/**
 * Bilds Concatenates
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
 * Returns the ANSI string corresponding to self
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toAnsiString: MTypes.OneArgFunction<Type, string> = flow(
	uniStyledTexts,
	MArray.match012({
		onEmpty: MFunction.constEmptyString,
		onSingleton: UniStyled.toAnsiString,
		onOverTwo: flow(
			Array.map(UniStyled.applyStyleUnder(ASStyleCharacteristics.defaults)),
			Array.reduce(
				Tuple.make('', ASStyleCharacteristics.defaults),
				([text, context], uniStyled) => {
					const toApply = pipe(
						uniStyled.styleCharacteristics,
						ASStyleCharacteristics.substractContext(context)
					);

					return pipe(
						toApply,
						ASStyleCharacteristics.toAnsiString,
						MString.prepend(text),
						MString.append(uniStyled.text),
						Tuple.make,
						Tuple.appendElement(pipe(context, ASStyleCharacteristics.mergeOver(toApply)))
					);
				}
			),
			Tuple.getFirst,
			MString.append(ASAnsiString.reset)
		)
	})
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
