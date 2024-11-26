/**
 * A ContextFormatter encapsulates n Formatter's (see Formatter.ts) and provides the mechanism to
 * choose one of these Formatter's based on a context object passed as parameter. More precisely,the
 * Formatter at position i % n is used to format the string, where % is the modulo function and i an
 * index derived from the context object.
 *
 * With the make function, you can define your own instances if the provided ones don't suit your
 * needs.
 *
 * @since 0.0.1
 */

import { MArray, MInspectable, MNumber, MPipeable, MTypes } from '@parischap/effect-lib';
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
import type * as ASContextShower from './ContextShower.js';
import type * as ASFormat from './Format.js';
import * as ASFormattedString from './FormattedString.js';
import * as ASFormatter from './Formatter.js';
import * as ASPalette from './Palette.js';

const moduleTag = '@parischap/ansi-styles/ContextFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/** Type of the action of a ContextFormatter */
type ActionType<in C> = MTypes.OneArgFunction<string, ASContextShower.ActionType<C>>;

/**
 * Type that represents a ContextFormatter
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type<in C> extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Name of this ContextFormatter instance. Useful for equality and debugging
	 *
	 * @since 0.0.1
	 */
	readonly name: string;

	/**
	 * Action of this ContextFormatter
	 *
	 * @since 0.0.1
	 */
	readonly action: ActionType<C>;

	/** @internal */
	readonly [TypeId]: TypeId;
}

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */

export const has = (u: unknown): u is Type<unknown> => Predicate.hasProperty(u, TypeId);

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type<never>> = (self, that) =>
	that.name === self.name;

/** Prototype */
const proto: MTypes.Proto<Type<never>> = {
	[TypeId]: TypeId,
	[Equal.symbol]<C>(this: Type<C>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<C>(this: Type<C>) {
		return Hash.cached(this, Hash.hash(this.name));
	},
	[MInspectable.NameSymbol]<C>(this: Type<C>) {
		return this.name;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = <C>(params: MTypes.Data<Type<C>>): Type<C> =>
	MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromPalette =
	<C>(nameSuffix: string, indexFromContext: MTypes.OneArgFunction<C, number>) =>
	(palette: ASPalette.Type): Type<C> => {
		const formats = palette.formats;
		const n = formats.length;
		const action: ActionType<C> = pipe(
			formats,
			Array.map(ASFormatter.fromFormat),
			MArray.match012({
				onEmpty: () => (s) => () => ASFormattedString.fromString(s),
				onSingleton: (formatter) => (s) => () => formatter.action(s),
				onOverTwo: (formatters) => (s) =>
					flow(
						indexFromContext,
						MNumber.intModulo(n),
						MArray.unsafeGetter(formatters),
						ASFormatter.action,
						Function.apply(s)
					)
			})
		);

		return _make({
			name: `${palette.name}On${nameSuffix}`,
			action
		});
	};

/**
 * Creates a ContextFormatter independant from the context from a single format.
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromFormat = <C>(format: ASFormat.Type): Type<C> => {
	const formatter = ASFormatter.fromFormat(format);
	return _make({
		name: `Always${formatter.name}`,
		action: (s) => () => formatter.action(s)
	});
};

/**
 * Gets the name of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const name: MTypes.OneArgFunction<Type<never>, string> = Struct.get('name');

/**
 * Gets the `action` of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const action: <C>(self: Type<C>) => ActionType<C> = Struct.get('action');
