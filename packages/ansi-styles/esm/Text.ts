/**
 * This module implements a Text that is an array of StyledString's, i.e a array of strings on which
 * a Style (see Style.ts) is applied. As syntaxic sugar, Text's can be created by Styles.
 *
 * @since 0.0.1
 */

import { MFunction, MInspectable, MMatch, MPipeable, MString, MTree, MTypes } from '@parischap/effect-lib';
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

type Node = MTree.Node.Type<ASStyleCharacteristics.Type, string>
type Tree = MTree.Type<ASStyleCharacteristics.Type, string>
type Leaf =  MTree.Leaf.Type<ASStyleCharacteristics.Type, string>

/**
 * Interface that represents a Text
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/* The text as a tree with strings as leaves and ASStyleCharacteristic's for the other nodes */
	readonly tree: Tree;

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

const _equivalence = MTree.getEquivalence(ASStyleCharacteristics.equivalence, String.Equivalence);
/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	_equivalence(self.tree, that.tree);


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
 * Returns the `tree` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const tree: MTypes.OneArgFunction<Type,
	Tree
> = Struct.get('tree');

/**
 * Returns the length of `self` without the length of the styling
 *
 * @since 0.0.1
 * @category Destructors
 */
export const length: MTypes.OneArgFunction<Type, number> = flow(
	tree,
	MTree.reduce({ z: 0, fNonLeaf: Function.identity, fLeaf: (z, b) => z + b.length })
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
export const fromStyleAndElems =
	(characteristics: ASStyleCharacteristics.Type) =>
	(...elems: ReadonlyArray<string | Type>): Type =>
		_make({
			tree: MTree.make({
				value: characteristics,
				forest: pipe(
					elems,
					Array.filterMap<string|Type,Node>(
						flow(
							MMatch.make,
							MMatch.when(MTypes.isString, 
								flow( MTree.Leaf.make<ASStyleCharacteristics.Type, string>, Option.some)
							),
							MMatch.when(isEmpty, Function.constant(Option.none())),
							MMatch.orElse(flow(Struct.get('tree'),Option.some)),
						)
					),
					Array.match({
						onEmpty: Function.constant(Array.empty<Node>()),
						onNonEmpty: 
					})
				)
			}):
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
