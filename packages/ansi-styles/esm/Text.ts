/**
 * This module implements a styled text, i.e. an array of UniStyled where a UniStyled is a string
 * formatted in a given style.
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

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/ansi-styles/Text/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a unformly styled text (that is a text that is thorougly formatted with the same
 * style)
 */
namespace UniStyled {
	const namespaceTag = moduleTag + 'UniStyled/';
	const _TypeId: unique symbol = Symbol.for(namespaceTag) as _TypeId;
	type _TypeId = typeof _TypeId;

	/**
	 * Interface that represents a Unistyled text
	 *
	 * @category Models
	 */
	export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
		/** The text to be styled */
		readonly text: string;

		/** The style to apply to the text */
		readonly style: ASStyleCharacteristics.Type;

		/* @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

	/**
	 * Equivalence based on the style
	 *
	 * @category Equivalences
	 */
	export const haveSameStyle: Equivalence.Equivalence<Type> = (self, that) =>
		ASStyleCharacteristics.equivalence(self.style, that.style);

	/**
	 * Equivalence based on the text
	 *
	 * @category Equivalences
	 */
	export const haveSameText: Equivalence.Equivalence<Type> = (self, that) =>
		self.text === that.text;

	/**
	 * Equivalence
	 *
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		haveSameText(self, that) && haveSameStyle(self, that);

	/** Prototype */
	const _TypeIdHash = Hash.hash(_TypeId);
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.text,
				Hash.hash,
				Hash.combine(Hash.hash(this.style)),
				Hash.combine(_TypeIdHash),
				Hash.cached(this)
			);
		},
		...MInspectable.BaseProto(namespaceTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Gets the `text` property of `self`
	 *
	 * @category Destructors
	 */
	export const text: MTypes.OneArgFunction<Type, string> = Struct.get('text');

	/**
	 * Gets the `style` property of `self`
	 *
	 * @category Destructors
	 */
	export const style: MTypes.OneArgFunction<Type, ASStyleCharacteristics.Type> =
		Struct.get('style');

	/**
	 * Merges the characteristics of `style` with the `style` property of `self`. In case of conflict,
	 * the characteristics in the `style` property of `self` will prevail.
	 *
	 * @category Utils
	 */
	export const applyStyleUnder = (
		style: ASStyleCharacteristics.Type
	): MTypes.OneArgFunction<Type, Type> =>
		flow(
			MStruct.evolve({
				style: ASStyleCharacteristics.mergeUnder(style)
			}),
			make
		);

	/**
	 * Builds a new UniStyled from the concatenation of several UniStyled. The style of the resulting
	 * Unistyled is the one of the first Unistyled to be concatenated
	 *
	 * @category Constructors
	 */
	export const concat = (elems: MTypes.OverOne<Type>): Type =>
		make({
			text: pipe(elems, Array.map(text), Array.join('')),
			style: pipe(elems, Array.headNonEmpty, style)
		});

	/**
	 * Gets the length of `self` without the formatting
	 *
	 * @category Utils
	 */
	export const toLength: MTypes.OneArgFunction<Type, number> = flow(
		Struct.get('text'),
		String.length
	);

	/**
	 * Returns the ANSI string corresponding to self
	 *
	 * @category Destructors
	 */
	export const toAnsiString = (self: Type): string => {
		const ansiStart = ASStyleCharacteristics.toAnsiString(self.style);
		return ansiStart === '' ? self.text : ansiStart + self.text + ASAnsiString.reset;
	};
}

/**
 * Interface that represents a Text
 *
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Type, Pipeable.Pipeable {
	/* The text as an array of UniStyled */
	readonly uniStyledTexts: ReadonlyArray<UniStyled.Type>;

	/* @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

const _equivalence = Array.getEquivalence(UniStyled.equivalence);
/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	_equivalence(self.uniStyledTexts, that.uniStyledTexts);

const _haveSameTextequivalence = Array.getEquivalence(UniStyled.haveSameText);
/**
 * Equivalence
 *
 * @category Equivalences
 */
export const haveSameText: Equivalence.Equivalence<Type> = (self, that) =>
	_haveSameTextequivalence(self.uniStyledTexts, that.uniStyledTexts);

/** Prototype */
const _TypeIdHash = Hash.hash(_TypeId);
const proto: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
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
 * @category Destructors
 */
export const uniStyledTexts: MTypes.OneArgFunction<
	Type,
	ReadonlyArray<UniStyled.Type>
> = Struct.get('uniStyledTexts');

/**
 * Returns the length of `self` without the length of the styling
 *
 * @category Destructors
 */
export const toLength: MTypes.OneArgFunction<Type, number> = flow(
	uniStyledTexts,
	Array.map(UniStyled.toLength),
	Number.sumAll
);

/**
 * Predicate that returns true if `self` is empty
 *
 * @category Predicates
 */

export const isEmpty: Predicate.Predicate<Type> = flow(toLength, MFunction.strictEquals(0));

/**
 * Predicate that returns true if `self` is not empty
 *
 * @category Predicates
 */

export const isNotEmpty: Predicate.Predicate<Type> = Predicate.not(isEmpty);

/**
 * Builds a Text by applying a StyleCharacteristics to some strings and other Text's
 *
 * @category Constructors
 */

export const fromStyleAndElems =
	(style: ASStyleCharacteristics.Type) =>
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
								Option.map((text) => pipe({ text, style }, UniStyled.make, Array.of))
							)
						),
						MMatch.orElse(
							flow(
								Struct.get('uniStyledTexts'),
								Array.map(UniStyled.applyStyleUnder(style)),
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
 * Builds a new Text by concatenating all passed Texts or strings
 *
 * @category Utils
 */
export const concat: (...elems: ReadonlyArray<string | Type>) => Type = fromStyleAndElems(
	ASStyleCharacteristics.none
);

/**
 * An empty Text
 *
 * @category Instances
 */
export const empty: Type = concat();

/**
 * A Text instance that represents a linebreak
 *
 * @category Instances
 */
export const lineBreak: Type = concat(`\n`);

/**
 * Builds a Text from a string withoout applying any style
 *
 * @category Constructors
 */
export const fromString: MTypes.OneArgFunction<string, Type> = concat;

/**
 * Returns the ANSI string corresponding to self
 *
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
					const toApply = pipe(uniStyled.style, ASStyleCharacteristics.substractContext(context));

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
 * Returns the string corresponding to self without any styling
 *
 * @category Destructors
 */
export const toUnstyledString: MTypes.OneArgFunction<Type, string> = flow(
	uniStyledTexts,
	Array.map(UniStyled.text),
	Array.join('')
);

/**
 * Builds a new Text by appending `that` to `self`
 *
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type =>
		concat(self, that);

/**
 * Builds a new Text by prepending `that` to `self`
 *
 * @category Utils
 */
export const prepend =
	(that: Type) =>
	(self: Type): Type =>
		concat(that, self);

/**
 * Builds a new Text by prepending `startText` and appending 'endText' to `self`
 *
 * @category Utils
 */
export const surround = (startText: Type, endText: Type): MTypes.OneArgFunction<Type> =>
	flow(prepend(startText), append(endText));

/**
 * Builds a new Text by joining all passed Texts and adding `self` as separator in between
 *
 * @category Utils
 */
export const join =
	(self: Type) =>
	(arr: ReadonlyArray<Type>): Type =>
		concat(...pipe(arr, Array.intersperse(self)));

/**
 * Builds a new Text by repeating `n` times the passed Text. `n` must be a strictly positive
 * integer.
 *
 * @category Utils
 */
export const repeat =
	(n: number) =>
	(self: Type): Type =>
		concat(...pipe(self, Array.replicate(n)));
