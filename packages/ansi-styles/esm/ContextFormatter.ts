/**
 * A ContextFormatter is a type that allows you to format a string differently depending on the
 * context. It encapsulates a Palette (see Palette.ts) that contains `n` styles and a function that
 * takes a context object and returns an index `i`. It uses the Style at position i % n, where % is
 * the modulo function.
 *
 * @since 0.0.1
 */

import { MArray, MInspectable, MMatch, MPipeable, MStruct, MTypes } from '@parischap/effect-lib';
import { flow, Function, pipe, Pipeable, Predicate, String, Struct, Types } from 'effect';
import * as ASPalette from './Palette.js';
import * as ASStyle from './Style.js';
import * as ASText from './Text.js';

/**
 * Module tag
 *
 * @since 0.0.1
 * @category Models
 */
export const moduleTag = '@parischap/ansi-styles/ContextFormatter/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

const _TagSymbol: unique symbol = Symbol.for(moduleTag + '_TagSymbol/');

/**
 * Namespace of a ContextFormatter used as an action
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export interface Type<in C> {
		(s?: string): MTypes.OneArgFunction<C, ASText.Type>;
	}
}

/**
 * Type of a ContextFormatter
 *
 * @since 0.0.1
 * @category Models
 */
export type Type<C> = Unistyled.Type | PaletteBased.Type<C>;

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const has = (u: unknown): u is Type<never> => Predicate.hasProperty(u, TypeId);
const _has = has;

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const isUnistyled = (u: Type<never>): u is Unistyled.Type => u[_TagSymbol] === 'Unistyled';

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const isPaletteBased = (u: Type<never>): u is PaletteBased.Type<never> =>
	u[_TagSymbol] === 'PaletteBased';

/**
 * Namespace for a Unistyled ContextFormatter, i.e. a ContextFormatter which always applies the same
 * style (which can be Style.none) and therefore does not care for a context
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Unistyled {
	/**
	 * Unistyled ContextFormatter Type
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export interface Type extends Action.Type<unknown>, MInspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * The text to display by default if an empty string is passed to the formatter
		 *
		 * @since 0.0.1
		 */
		readonly defaultText: string;

		/**
		 * The style to apply
		 *
		 * @since 0.0.1
		 */
		readonly style: ASStyle.Type;

		/** @internal */
		readonly [_TagSymbol]: 'Unistyled';

		/** @internal */
		readonly [TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */

	export const has = (u: unknown): u is Type => _has(u) && isUnistyled(u);

	/** Base */
	const base: MTypes.Proto<Type> = {
		[TypeId]: TypeId,
		[_TagSymbol]: 'Unistyled',
		[MInspectable.IdSymbol](this: Type) {
			return toId(this);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type =>
		Object.assign(
			((s) => {
				const textToShow = params.style(MTypes.isUndefined(s) ? params.defaultText : s);
				return (): ASText.Type => textToShow;
			}) satisfies Action.Type<unknown>,
			{
				...params,
				...base
			}
		);

	/**
	 * Constructor
	 *
	 * @since 0.0.1
	 * @category Constructors
	 */
	export const make = ({
		defaultText = '',
		style
	}: {
		readonly defaultText?: string;
		readonly style: ASStyle.Type;
	}): Type => _make({ defaultText, style });

	/**
	 * Gets the `defaultText` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const defaultText: MTypes.OneArgFunction<Type, string> = Struct.get('defaultText');

	/**
	 * Gets the `style` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const style: MTypes.OneArgFunction<Type, ASStyle.Type> = Struct.get('style');

	/**
	 * Gets the id of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const toId = (self: Type): string =>
		ASStyle.toId(self.style) +
		'Formatter' +
		(self.defaultText === '' ? '' : 'With' + String.capitalize(self.defaultText) + 'AsDefault');

	/**
	 * Builds a copy of `self` with the 'defaultText' property set to 'defaultText'
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const setDefaultText = (defaultText: string): MTypes.OneArgFunction<Type, Type> =>
		flow(MStruct.set({ defaultText }), _make);
}

/**
 * Namespace for a PaletteBased ContextFormatter
 *
 * @since 0.0.1
 * @category Models
 */
export namespace PaletteBased {
	/**
	 * Namespace of a function that transforms a context into an index
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace IndexFromContext {
		/**
		 * Type of an IndexFromContext
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export interface Type<in C> {
			(c: C): number;
		}
	}

	/**
	 * Type that represents a non empty ContextFormatter
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export interface Type<in C> extends Action.Type<C>, MInspectable.Inspectable, Pipeable.Pipeable {
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
		readonly indexFromContext: IndexFromContext.Type<C>;

		/**
		 * Palette used by this ContextFormatter.
		 *
		 * @since 0.0.1
		 */
		readonly palette: ASPalette.Type;

		/** @internal */
		readonly [_TagSymbol]: 'PaletteBased';

		/** @internal */
		readonly [TypeId]: {
			readonly _C: Types.Contravariant<C>;
		};
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */

	export const has = (u: unknown): u is Type<never> => _has(u) && isPaletteBased(u);

	/** Base */
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	const base: MTypes.Proto<Type<any>> = {
		[TypeId]: {
			_C: MTypes.contravariantValue
		},
		[_TagSymbol]: 'PaletteBased',
		[MInspectable.IdSymbol]<C>(this: Type<C>) {
			return toId(this);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = <C>(params: MTypes.Data<Type<C>>): Type<C> => {
		const styles = params.palette.styles;
		const n = styles.length;
		return Object.assign(
			((s) => {
				const textToShow = MTypes.isUndefined(s) ? params.defaultText : s;
				return (context: C): ASText.Type =>
					pipe(
						styles,
						MArray.unsafeGet(params.indexFromContext(context) % n),
						Function.apply(textToShow)
					);
			}) satisfies Action.Type<C>,
			{
				...params,
				...base
			}
		);
	};

	/**
	 * Constructor
	 *
	 * @since 0.0.1
	 * @category Constructors
	 */
	export const make =
		<C>(indexFromContext: IndexFromContext.Type<C>) =>
		({
			defaultText = '',
			palette
		}: {
			readonly defaultText?: string;
			readonly palette: ASPalette.Type;
		}): Type<C> =>
			_make({ defaultText, indexFromContext, palette });

	/**
	 * Gets the `indexFromContext` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const indexFromContext: <C>(self: Type<C>) => IndexFromContext.Type<C> =
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
		'FormatterOn' +
		String.capitalize(self.indexFromContext.name) +
		(self.defaultText === '' ? '' : 'With' + String.capitalize(self.defaultText) + 'AsDefault');

	/**
	 * Builds a copy of `self` with the 'defaultText' property set to 'defaultText'
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const setDefaultText = (defaultText: string): (<C>(self: Type<C>) => Type<C>) =>
		flow(MStruct.set({ defaultText }), _make);
}

/**
 * Builds a copy of `self` with the 'defaultText' property set to 'defaultText'
 *
 * @since 0.0.1
 * @category Utils
 */
export const setDefaultText = (defaultText: string): (<C>(self: Type<C>) => Type<C>) =>
	flow(
		MMatch.make,
		MMatch.when(isUnistyled, Unistyled.setDefaultText(defaultText)),
		MMatch.orElse(PaletteBased.setDefaultText(defaultText))
	);

/**
 * None ContextFormatter instance: does not apply any style, does not provide a defaultText
 *
 * @since 0.0.1
 * @category Instances
 */

export const none: Unistyled.Type = Unistyled.make({ style: ASStyle.none });

/**
 * Original black color instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const black: Unistyled.Type = Unistyled.make({ style: ASStyle.black });

/**
 * Original red color instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const red: Unistyled.Type = Unistyled.make({ style: ASStyle.red });

/**
 * Original green color instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const green: Unistyled.Type = Unistyled.make({ style: ASStyle.green });

/**
 * Original yellow color instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const yellow: Unistyled.Type = Unistyled.make({ style: ASStyle.yellow });

/**
 * Original blue color instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const blue: Unistyled.Type = Unistyled.make({ style: ASStyle.blue });

/**
 * Original magenta color instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const magenta: Unistyled.Type = Unistyled.make({ style: ASStyle.magenta });

/**
 * Original cyan color instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const cyan: Unistyled.Type = Unistyled.make({ style: ASStyle.cyan });

/**
 * Original white color instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const white: Unistyled.Type = Unistyled.make({ style: ASStyle.white });
