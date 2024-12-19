/**
 * A StyleCharacteristics is a sorted array of StyleCharacteristic's (see StyleCharacteristic.ts).
 *
 * @since 0.0.1
 */

import { MArray, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
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
import * as ASAnsiString from './AnsiString.js';
import * as ASStyleCharacteristic from './StyleCharacteristic.js';

export const moduleTag = '@parischap/ansi-styles/StyleCharacteristics/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type of a StyleCharacteristics
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Array of StyleCharacteristic's sorted by category. Did not use a SortedSet because we need some
	 * waranties as to the order of equivalent elements when merging StyleCharacteristics
	 *
	 * @since 0.0.1
	 */
	readonly sortedArray: ReadonlyArray<ASStyleCharacteristic.Type>;

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

// To be removed when Effect 4.0 with structural equality comes out
const _sortedArrayEq: Equivalence.Equivalence<ReadonlyArray<ASStyleCharacteristic.Type>> =
	Array.getEquivalence(ASStyleCharacteristic.equivalence);

/**
 * Equivalence
 *
 * @since 0.0.6
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	_sortedArrayEq(self.sortedArray, that.sortedArray);

const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.sortedArray, Hash.array, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return pipe(this.sortedArray, Array.map(ASStyleCharacteristic.id), Array.join(''));
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Empty StyleCharacteristics
 *
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = _make({
	sortedArray: Array.empty()
});

/**
 * Default StyleCharacteristics for all categories
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaults: Type = _make({
	sortedArray: pipe(
		[
			ASStyleCharacteristic.normal,
			ASStyleCharacteristic.notItalic,
			ASStyleCharacteristic.notUnderlined,
			ASStyleCharacteristic.notStruckThrough,
			ASStyleCharacteristic.notOverlined,
			ASStyleCharacteristic.notInversed,
			ASStyleCharacteristic.notHidden,
			ASStyleCharacteristic.noBlink,
			ASStyleCharacteristic.defaultColor,
			ASStyleCharacteristic.Bg.defaultColor
		],
		Array.sort(ASStyleCharacteristic.byCategory)
	)
});

/**
 * Constructor from a single StyleCharacteristic
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromStyleCharacteristic = (styleCharacteristic: ASStyleCharacteristic.Type) =>
	_make({ sortedArray: Array.of(styleCharacteristic) });

const _mergeByCategory = MArray.mergeSorted(ASStyleCharacteristic.byCategory);
const _differenceByCategory = MArray.differenceSorted(ASStyleCharacteristic.byCategory);

/**
 * Builds a new StyleCharacteristics by merging `self` and `that`. In case of conflict (e.g `self`
 * contains `Bold` and `that` contains `Dim`), the characteristics in `that` will prevail.
 *
 * @since 0.0.1
 * @category Utils
 */
export const merge =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			sortedArray: pipe(
				that.sortedArray,
				_mergeByCategory(self.sortedArray),
				// dedupeAdjacentWith keeps first occurence of adjacent identical values
				Array.dedupeAdjacentWith(ASStyleCharacteristic.haveSameCategory)
			)
		});

/**
 * Builds a new StyleCharacteristics by removing from `self` the StyleCharacterostic's of `that`.
 *
 * @since 0.0.1
 * @category Utils
 */
export const difference =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			sortedArray: pipe(self.sortedArray, _differenceByCategory(that.sortedArray))
		});

/**
 * Gets the `sortedArray` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const sortedArray: MTypes.OneArgFunction<
	Type,
	ReadonlyArray<ASStyleCharacteristic.Type>
> = Struct.get('sortedArray');

/**
 * Returns the ANSI string corresponding to `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toAnsiString: MTypes.OneArgFunction<Type, ASAnsiString.Type> = flow(
	sortedArray,
	MArray.match012({
		onEmpty: Function.constant(ASAnsiString.empty),
		onSingleton: ASStyleCharacteristic.ansiString,
		onOverTwo: flow(
			Array.map(ASStyleCharacteristic.sequence),
			Array.flatten,
			ASAnsiString.fromNonEmptySequence
		)
	})
);
