/**
 * A ContextFormatter is a type that allows you to format a string differently depending on the
 * value of a context object. It encapsulates a Palette (see Palette.ts) that contains `n` styles
 * and a function that takes a context object and returns an index `i`. It uses the Style at
 * position i % n, where % is the modulo function.
 */

import { MArray, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { pipe, Pipeable, Predicate, String, Struct, Types } from 'effect';
import * as ASPalette from './Palette.js';
import * as ASStyle from './Style.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/ansi-styles/ContextFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const _TagSymbol: unique symbol = Symbol.for(moduleTag + '_TagSymbol/');
const UnistyledTag = 'Unistyled';
const PaletteBasedTag = 'PaletteBased';

/**
 * Namespace of a ContextFormatter used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action
	 *
	 * @category Models
	 */
	export interface Type<in C> extends MTypes.OneArgFunction<C, ASStyle.Action.Type> {}
}

/**
 * Type of a ContextFormatter
 *
 * @category Models
 */
export type Type<C> = Unistyled.Type | PaletteBased.Type<C>;

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type<never> => Predicate.hasProperty(u, TypeId);
const _has = has;

/**
 * Type guard
 *
 * @category Guards
 */
export const isUnistyled = (u: Type<never>): u is Unistyled.Type => u[_TagSymbol] === UnistyledTag;

/**
 * Type guard
 *
 * @category Guards
 */
export const isPaletteBased = (u: Type<never>): u is PaletteBased.Type<never> =>
	u[_TagSymbol] === PaletteBasedTag;

/**
 * Namespace for a Unistyled ContextFormatter, i.e. a ContextFormatter which always applies the same
 * style (which can be Style.none) and therefore does not care for a context
 *
 * @category Models
 */
export namespace Unistyled {
	/**
	 * Unistyled ContextFormatter Type
	 *
	 * @category Models
	 */
	export interface Type extends Action.Type<unknown>, MInspectable.Inspectable, Pipeable.Pipeable {
		/** The style to apply */
		readonly style: ASStyle.Type;

		/** @internal */
		readonly [_TagSymbol]: typeof UnistyledTag;

		/** @internal */
		readonly [TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */

	export const has = (u: unknown): u is Type => _has(u) && isUnistyled(u);

	/** Base */
	const base: MTypes.Proto<Type> = {
		[TypeId]: TypeId,
		[_TagSymbol]: UnistyledTag,
		[MInspectable.IdSymbol](this: Type) {
			return toId(this);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type => {
		const style = params.style;
		return Object.assign(((_context) => style) satisfies Action.Type<unknown>, {
			...params,
			...base
		});
	};

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const make = (style: ASStyle.Type): Type => _make({ style });

	/**
	 * Gets the `style` property of `self`
	 *
	 * @category Destructors
	 */
	export const style: MTypes.OneArgFunction<Type, ASStyle.Type> = Struct.get('style');

	/**
	 * Gets the id of `self`
	 *
	 * @category Destructors
	 */
	export const toId = (self: Type): string => ASStyle.toId(self.style) + 'Formatter';
}

/**
 * Namespace for a Palette-based ContextFormatter
 *
 * @category Models
 */
export namespace PaletteBased {
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
	 * Type that represents a Palette-based ContextFormatter
	 *
	 * @category Models
	 */
	export interface Type<in C> extends Action.Type<C>, MInspectable.Inspectable, Pipeable.Pipeable {
		/** Function that takes a context object and derives an index from it */
		readonly indexFromContext: IndexFromContext.Type<C>;

		/** Palette used by this ContextFormatter */
		readonly palette: ASPalette.Type;

		/** @internal */
		readonly [_TagSymbol]: typeof PaletteBasedTag;

		/** @internal */
		readonly [TypeId]: {
			readonly _C: Types.Contravariant<C>;
		};
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */

	export const has = (u: unknown): u is Type<never> => _has(u) && isPaletteBased(u);

	/** Base */
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	const base: MTypes.Proto<Type<any>> = {
		[TypeId]: {
			_C: MTypes.contravariantValue
		},
		[_TagSymbol]: PaletteBasedTag,
		[MInspectable.IdSymbol]<C>(this: Type<C>) {
			return toId(this);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const make = <C>(params: MTypes.Data<Type<C>>): Type<C> => {
		const styles = params.palette.styles;
		const n = styles.length;
		const indexFromContext = params.indexFromContext;
		return Object.assign(
			((context) =>
				pipe(styles, MArray.unsafeGet(indexFromContext(context) % n))) satisfies Action.Type<C>,
			{
				...params,
				...base
			}
		);
	};

	/**
	 * Gets the `indexFromContext` property of `self`
	 *
	 * @category Destructors
	 */
	export const indexFromContext: <C>(self: Type<C>) => IndexFromContext.Type<C> =
		Struct.get('indexFromContext');

	/**
	 * Gets the `palette` property of `self`
	 *
	 * @category Destructors
	 */
	export const palette: MTypes.OneArgFunction<Type<never>, ASPalette.Type> = Struct.get('palette');

	/**
	 * Gets the id of `self`
	 *
	 * @category Destructors
	 */
	export const toId = (self: Type<never>): string =>
		String.capitalize(self.indexFromContext.name) +
		'Based' +
		ASPalette.toId(self.palette) +
		'Formatter';
}

/**
 * None ContextFormatter instance: does not apply any style, does not provide a defaultText
 *
 * @category Instances
 */

export const none: Unistyled.Type = Unistyled.make(ASStyle.none);

/**
 * Original black color instance
 *
 * @category Original instances
 */
export const black: Unistyled.Type = Unistyled.make(ASStyle.black);

/**
 * Original red color instance
 *
 * @category Original instances
 */
export const red: Unistyled.Type = Unistyled.make(ASStyle.red);

/**
 * Original green color instance
 *
 * @category Original instances
 */
export const green: Unistyled.Type = Unistyled.make(ASStyle.green);

/**
 * Original yellow color instance
 *
 * @category Original instances
 */
export const yellow: Unistyled.Type = Unistyled.make(ASStyle.yellow);

/**
 * Original blue color instance
 *
 * @category Original instances
 */
export const blue: Unistyled.Type = Unistyled.make(ASStyle.blue);

/**
 * Original magenta color instance
 *
 * @category Original instances
 */
export const magenta: Unistyled.Type = Unistyled.make(ASStyle.magenta);

/**
 * Original cyan color instance
 *
 * @category Original instances
 */
export const cyan: Unistyled.Type = Unistyled.make(ASStyle.cyan);

/**
 * Original white color instance
 *
 * @category Original instances
 */
export const white: Unistyled.Type = Unistyled.make(ASStyle.white);
