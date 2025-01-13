/**
 * A ContextFormatter is a type that allows you to format a string differently depending on the
 * context. It encapsulates a Palette (see Palette.ts) that contains `n` styles and a function that
 * takes a context object and returns an index `i`. It uses the Style at position i % n, where % is
 * the modulo function.
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
	String,
	Struct
} from 'effect';
import * as ASPalette from './Palette.js';
import * as ASText from './Text.js';

export const moduleTag = '@parischap/ansi-styles/ContextFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

interface IndexFromContext<in C> {
	(c: C): number;
}

/**
 * Type that represents a ContextFormatter
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type<in C>
	extends MTypes.OneArgFunction<string, MTypes.OneArgFunction<C, ASText.Type>>,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/**
	 * The text to display by default if an empty string is passed to the formatter
	 *
	 * @since 0.0.1
	 */
	readonly defaultText: string;

	/**
	 * Function that takes a context object and derives an index from it
	 *
	 * @since 0.0.1
	 */
	readonly indexFromContext: IndexFromContext<C>;

	/**
	 * Palette used by this ContextFormatter.
	 *
	 * @since 0.0.1
	 */
	readonly palette: ASPalette.Type;

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
	self.defaultText === that.defaultText &&
	self.indexFromContext.name === that.indexFromContext.name &&
	ASPalette.equivalence(self.palette, that.palette);

/** Prototype */
const _TypeIdHash = Hash.hash(TypeId);
const base: MTypes.Proto<Type<never>> = {
	[TypeId]: TypeId,
	[Equal.symbol]<C>(this: Type<C>, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol]<C>(this: Type<C>) {
		return pipe(
			this.indexFromContext.name,
			Hash.hash,
			Hash.combine(Hash.hash(this.defaultText)),
			Hash.combine(Hash.hash(this.palette)),
			Hash.combine(_TypeIdHash),
			Hash.cached(this)
		);
	},
	[MInspectable.IdSymbol]<C>(this: Type<C>) {
		return toId(this);
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
export const make = <C>(params: MTypes.Data<Type<C>>): Type<C> => {
	const styles = params.palette.styles;
	const n = styles.length;
	return Object.assign(
		(s: string) => {
			const textToShow = s === '' ? params.defaultText : s;
			const onEmpty = Function.constant(n === 0 ? ASText.fromString(textToShow) : ASText.empty);
			return (context: C): ASText.Type =>
				Array.match(styles, {
					onEmpty,
					onNonEmpty: flow(
						MArray.unsafeGet(params.indexFromContext(context) % n),
						Function.apply(textToShow)
					)
				});
		},
		{
			...params,
			...base
		}
	);
};

/**
 * Gets the `indexFromContext` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const indexFromContext: <C>(self: Type<C>) => IndexFromContext<C> =
	Struct.get('indexFromContext');

/**
 * Gets the `palette` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const palette: MTypes.OneArgFunction<Type<never>, ASPalette.Type> = Struct.get('palette');

/**
 * Gets the `defaultText` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const defaultText: MTypes.OneArgFunction<Type<never>, string> = Struct.get('defaultText');

/**
 * Gets the id of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toId = (self: Type<never>): string =>
	ASPalette.toId(self.palette) +
	'BasedOn' +
	String.capitalize(self.indexFromContext.name) +
	(self.defaultText === '' ? '' : 'With' + String.capitalize(self.defaultText) + 'AsDefault');
