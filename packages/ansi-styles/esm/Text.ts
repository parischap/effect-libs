/**
 * This module implements a tree of which:
 *
 * - The leaves are styled strings.
 * - Non leaf nodes are styles that apply to all their children Bsically, a text is a hierarchical
 *   structure of styles to apply to strings
 *
 * @since 0.0.1
 */

import { MFunction, MInspectable, MPipeable, MTree, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	Hash,
	Inspectable,
	Option,
	Order,
	Pipeable,
	Predicate,
	String,
	Struct,
	flow,
	pipe
} from 'effect';
import { ASStyle } from './index.js';

export const moduleTag = '@parischap/ansi-styles/Text/';
const _moduleTag = moduleTag;
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/** Namespace that implements the value of a node of a Text */
namespace String {
	export const moduleTag = _moduleTag + 'String/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Interface that represents a String
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
		readonly string: Option.Option<string>;

		/**
		 * The style to apply to the `string` property
		 *
		 * @since 0.0.1
		 */
		readonly style: ASStyle.Type;

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
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		that.string === self.string && that.style === self.style;

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
	export const style: MTypes.OneArgFunction<Type, ASStyle.Type> = Struct.get('style');
}
/**
 * Interface that represents a Text
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, Inspectable.Inspectable, Pipeable.Pipeable {
	/** The tree of String's that forms the Text */
	readonly stringTree: MTree.Type<ASString.Type>;

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
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	MTree.equivalence(that.stringTree, self.stringTree);

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.stringTree, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
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
 * Builds a String from a string and a style. If style is not provided, the `none` Style is applied
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromStringAndStyle = ({
	string,
	style = ASStyle.none
}: {
	readonly string: string;
	readonly style?: ASStyle.Type;
}): Type =>
	make({
		stringTree: MTree.make({
			value: ASString.make({ string, style }),
			forest: Array.empty()
		})
	});

/**
 * Builds a String from a style and several strings/String's. If style is not provided, the `none`
 * Style is applied
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromStringsAndStyle = ({
	strings,
	style = ASStyle.none
}: {
	readonly strings: ReadonlyArray<string | Type>;
	readonly style?: ASStyle.Type;
}): Type =>
	make({
		stringTree: MTree.make({
			value: ASString.make({ string, style }),
			forest: Array.empty()
		})
	});

/**
 * An empty String
 *
 * @since 0.0.1
 * @category Instances
 */
export const empty = fromStringAndStyle({ string: '' });

/**
 * Returns the `stringTree` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const stringTree: MTypes.OneArgFunction<Type, MTree.Type<ASString.Type>> = Struct.get(
	'stringTree'
);

/**
 * Returns the length of `self` without the length of the styling
 *
 * @since 0.0.1
 * @category Destructors
 */
export const length: MTypes.OneArgFunction<Type, number> = flow(
	stringTree,
	MTree.reduce(0, (acc, nodeValue) => acc + nodeValue.string.length)
);

/**
 * Builds a new String by appending `that` to `self`
 *
 * @since 0.0.1
 * @category Utils
 */
export const append =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			formatted: self.formatted + that.formatted,
			unformatted: self.unformatted + that.unformatted
		});

/**
 * Builds a new String by appending `self` to `that`
 *
 * @since 0.0.1
 * @category Utils
 */
export const prepend =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			formatted: that.formatted + self.formatted,
			unformatted: that.unformatted + self.unformatted
		});

/**
 * Builds a new String by concatenating all passed Strings
 *
 * @since 0.0.1
 * @category Utils
 */
export const concat = (...sArr: ReadonlyArray<Type>): Type =>
	_make({
		formatted: pipe(sArr, Array.map(formatted), Array.join('')),

		unformatted: pipe(sArr, Array.map(unformatted), Array.join(''))
	});

/**
 * Builds a new String by joining all passed Strings and adding a separator `sep` in between
 *
 * @since 0.0.1
 * @category Utils
 */
export const join =
	(sep: Type) =>
	(sArr: ReadonlyArray<Type>): Type =>
		_make({
			formatted: pipe(sArr, Array.map(formatted), Array.join(sep.formatted)),

			unformatted: pipe(sArr, Array.map(unformatted), Array.join(sep.unformatted))
		});

/**
 * Builds a new String by repeating `n` times the passed String
 *
 * @since 0.0.1
 * @category Utils
 */
export const repeat =
	(n: number) =>
	(self: Type): Type => {
		const repeat = String.repeat(n);
		return _make({
			formatted: repeat(self.formatted),
			unformatted: repeat(self.unformatted)
		});
	};

/**
 * Returns `true` if the String represents an empty string
 *
 * @since 0.0.1
 * @category Utils
 */
export const isEmpty: Predicate.Predicate<Type> = flow(
	unformattedLength,
	MFunction.strictEquals(0)
);

/**
 * Returns `true` if the String does not represent an empty string
 *
 * @since 0.0.1
 * @category Utils
 */
export const isNonEmpty: Predicate.Predicate<Type> = Predicate.not(isEmpty);

/**
 * Defines an order on Strings based on the order of the `unformatted` property
 *
 * @since 0.0.1
 * @category Ordering
 */
export const order = Order.mapInput(Order.string, formatted);
