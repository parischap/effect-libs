/**
 * A ContextStyler is a type that allows you to format a string differently depending on the value
 * of a context object.
 */

import { MArray, MFunction, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, pipe, Pipeable, Predicate, String, Struct, Types } from 'effect';
import * as ASPalette from './Palette.js';
import * as ASStyle from './Style.js';
import type * as ASText from './Text.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/ContextStyler/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a ContextStyler used as an action
 *
 * @category Models
 */
export namespace DirectAction {
	/**
	 * Type of the action
	 *
	 * @category Models
	 */
	export interface Type<in C> extends MTypes.OneArgFunction<C, ASStyle.Action.Type> {}
}

/**
 * Namespace of a ContextStyler used as an action with flipped parameters
 *
 * @category Models
 */
export namespace ReversedAction {
	/**
	 * Namespace of an initialized ContextStyler used as an action with flipped parameters
	 *
	 * @category Models
	 */
	export namespace Initialized {
		/**
		 * Type of the action
		 *
		 * @category Models
		 */
		export interface Type<in C> extends MTypes.OneArgFunction<C, ASText.Type> {}
	}

	/**
	 * Type of the action
	 *
	 * @category Models
	 */
	export interface Type<in C> extends MTypes.OneArgFunction<string, Initialized.Type<C>> {}
}

/**
 * Namespace of a ContextStyler used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action
	 *
	 * @category Models
	 */
	export interface Type<in C> extends DirectAction.Type<C> {
		readonly withContextLast: ReversedAction.Type<C>;
	}
}

/**
 * Namespace of a function that transforms a context into an index
 *
 * @category Models
 */
export namespace IndexFromContext {
	/**
	 * Type of an IndexFromContext
	 *
	 * @category Models
	 */
	export interface Type<in C> {
		(c: C): number;
	}
}

/**
 * Type that represents a ContextStyler
 *
 * @category Models
 */
export interface Type<in C>
	extends Action.Type<C>,
		Equal.Equal,
		MInspectable.Type,
		Pipeable.Pipeable {
	/** Id of this ContextStyler instance. Useful for equality and debugging */
	readonly id: string;

	/** @internal */
	readonly [_TypeId]: {
		readonly _C: Types.Contravariant<C>;
	};
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<unknown> => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type<unknown>> = (self, that) =>
	that.id === self.id;

/** Base */
const _TypeIdHash = Hash.hash(_TypeId);
const base: MTypes.Proto<Type<unknown>> = {
	[_TypeId]: { _C: MTypes.contravariantValue },
	[Equal.symbol](this: Type<unknown>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<A>(this: Type<A>) {
		return pipe(this.id, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol]<A>(this: Type<A>) {
		return this.id;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor of a ContextStyler based on a single style. This ContextStyler is optimized to take
 * care of the fact that the context value is needless
 *
 * @category Constructors
 */
export const fromSingleStyle = <C>(style: ASStyle.Type): Type<C> => {
	return Object.assign((() => style) satisfies DirectAction.Type<unknown>, {
		...base,
		id: ASStyle.toId(style) + 'Formatter',
		withContextLast: ((toStyle) => {
			const styled = style(toStyle);
			return () => styled;
		}) satisfies ReversedAction.Type<unknown>
	});
};

/**
 * Constructor of a `ContextStyler` based on a Palette (see Palette.ts) that contains `n` styles and
 * an `indexFromContext` function that is able to transform a Context object into an integer `i`.
 * The style that will be used is the one in the Palette at position i % n, where % is the modulo
 * function.
 *
 * @category Constructors
 */
export const fromPalette = <C>({
	palette,
	indexFromContext
}: {
	readonly palette: ASPalette.Type;
	readonly indexFromContext: IndexFromContext.Type<C>;
}): Type<C> => {
	const styles = palette.styles;
	const n = styles.length;

	const getStyle: DirectAction.Type<C> = (context) =>
		pipe(styles, MArray.unsafeGet(indexFromContext(context) % n));

	return Object.assign(MFunction.clone(getStyle), {
		...base,
		id: String.capitalize(indexFromContext.name) + 'Based' + ASPalette.toId(palette) + 'Formatter',
		withContextLast: ((toStyle) => (context) =>
			getStyle(context)(toStyle)) satisfies ReversedAction.Type<C>
	});
};

/**
 * Gets the id of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type<never>, string> = Struct.get('id');

/**
 * None ContextStyler instance: does not apply any style, does not provide a defaultText
 *
 * @category Instances
 */

export const none = <C>(): Type<C> => fromSingleStyle(ASStyle.none);

/**
 * Original black color instance
 *
 * @category Original instances
 */
export const black = <C>(): Type<C> => fromSingleStyle(ASStyle.black);

/**
 * Original red color instance
 *
 * @category Original instances
 */
export const red = <C>(): Type<C> => fromSingleStyle(ASStyle.red);

/**
 * Original green color instance
 *
 * @category Original instances
 */
export const green = <C>(): Type<C> => fromSingleStyle(ASStyle.green);

/**
 * Original yellow color instance
 *
 * @category Original instances
 */
export const yellow = <C>(): Type<C> => fromSingleStyle(ASStyle.yellow);

/**
 * Original blue color instance
 *
 * @category Original instances
 */
export const blue = <C>(): Type<C> => fromSingleStyle(ASStyle.blue);

/**
 * Original magenta color instance
 *
 * @category Original instances
 */
export const magenta = <C>(): Type<C> => fromSingleStyle(ASStyle.magenta);

/**
 * Original cyan color instance
 *
 * @category Original instances
 */
export const cyan = <C>(): Type<C> => fromSingleStyle(ASStyle.cyan);

/**
 * Original white color instance
 *
 * @category Original instances
 */
export const white = <C>(): Type<C> => fromSingleStyle(ASStyle.white);
