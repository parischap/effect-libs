/**
 * A very simple implementation of the Select Graphic Rendition subset which allows to style
 * terminal outputs. Info at
 * https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MStruct, MTypes } from '@parischap/effect-lib';
import { Array, Equal, Equivalence, flow, Hash, pipe, Pipeable, Predicate } from 'effect';
import { ASColor } from './index.js';
export * as ASColor from './Color.js';

const moduleTag = '@parischap/ansi-style/Format/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

/**
 * Type that represents an SGR format
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Text color
	 *
	 * @since 0.0.1
	 */
	readonly color: ASColor.Type;
	/**
	 * Background color
	 *
	 * @since 0.0.1
	 */
	readonly bgColor: ASColor.Type;
	/**
	 * True if text must be bold
	 *
	 * @since 0.0.1
	 */
	readonly isBold: boolean;
	/**
	 * True if text must be underlined
	 *
	 * @since 0.0.1
	 */
	readonly isUnderlined: boolean;
	/**
	 * True if text must blink
	 *
	 * @since 0.0.1
	 */
	readonly isBlinking: boolean;
	/**
	 * True if text must be framed
	 *
	 * @since 0.0.1
	 */
	readonly isFramed: boolean;
	/**
	 * True if text must be encircled
	 *
	 * @since 0.0.1
	 */
	readonly isEncircled: boolean;
	/**
	 * True if text must be overlined
	 *
	 * @since 0.0.1
	 */
	readonly isOverlined: boolean;

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

/**
 * Equivalence
 *
 * @since 0.0.6
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	that.color === self.color &&
	that.bgColor === self.bgColor &&
	that.isBold === self.isBold &&
	that.isUnderlined === self.isUnderlined &&
	that.isBlinking === self.isBlinking &&
	that.isFramed === self.isFramed &&
	that.isEncircled === self.isEncircled &&
	that.isOverlined === self.isOverlined;

/** Prototype */
const proto: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.structure(this));
	},
	[MInspectable.GetName](this: Type) {
		return (
			(this.isBold ? 'Bold' : '') +
			(this.isUnderlined ? 'Underlined' : '') +
			(this.isFramed ? 'Framed' : '') +
			(this.isEncircled ? 'Encircled' : '') +
			(this.isOverlined ? 'Overlined' : '') +
			(this.isBlinking ? 'Blinking' : '') +
			ASColor.name(this.color) +
			(ASColor.TerminalDefault.has(this.bgColor) ? '' : `In${ASColor.name(this.bgColor)}`)
		);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/**
 * Constructor
 *
 * @since 0.0.6
 * @category Constructors
 */
export const make = (params: MTypes.Data<Type>): Type =>
	MTypes.objectFromDataAndProto(proto, params);
/**
 * Empty color
 *
 * @since 0.0.1
 * @category Instances
 */
export const terminalDefault: Type = make({
	color: ASColor.TerminalDefault.instance,
	bgColor: ASColor.TerminalDefault.instance,
	isBold: false,
	isUnderlined: false,
	isBlinking: false,
	isFramed: false,
	isEncircled: false,
	isOverlined: false
});

/**
 * Creates a format with the provided color as text color, the terminal default background color and
 * no other formatting
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromColor = (color: ASColor.Type): Type =>
	pipe(terminalDefault, MStruct.set({ color }), make);

/**
 * Returns a copy of `self` with `color` set to `color`
 *
 * @since 0.0.1
 * @category Utils
 */
export const withColor = (color: ASColor.Type): ((self: Type) => Type) =>
	flow(MStruct.set({ color }), make);

/**
 * Returns a copy of `self` with `backgroundColor` set to `backgroundColor`
 *
 * @since 0.0.1
 * @category Utils
 */
export const withBackgroundColor = (bgColor: ASColor.Type): ((self: Type) => Type) =>
	flow(MStruct.set({ bgColor }), make);

/**
 * Returns a copy of `self` with `isBold` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const bold: (self: Type) => Type = flow(MStruct.set({ isBold: true }), make);

/**
 * Returns a copy of `self` with `isUnderlined` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const underlined: (self: Type) => Type = flow(MStruct.set({ isUnderlined: true }), make);

/**
 * Returns a copy of `self` with `isBlinking` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const blinking: (self: Type) => Type = flow(MStruct.set({ isBlinking: true }), make);

/**
 * Returns a copy of `self` with `isFramed` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const framed: (self: Type) => Type = flow(MStruct.set({ isFramed: true }), make);

/**
 * Returns a copy of `self` with `isEncircled` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const encircled: (self: Type) => Type = flow(MStruct.set({ isEncircled: true }), make);

/**
 * Returns a copy of `self` with `isOverlined` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const overlined: (self: Type) => Type = flow(MStruct.set({ isOverlined: true }), make);

/**
 * Returns a copy of `self` with `isBold` set to `false`
 *
 * @since 0.0.1
 * @category Utils
 */
export const notBold: (self: Type) => Type = flow(MStruct.set({ isBold: false }), make);

/**
 * Returns a copy of `self` with `isUnderlined` set to `false`
 *
 * @since 0.0.1
 * @category Utils
 */
export const notUnderlined: (self: Type) => Type = flow(MStruct.set({ isUnderlined: false }), make);

/**
 * Returns a copy of `self` with `isBlinking` set to `false`
 *
 * @since 0.0.1
 * @category Utils
 */
export const notBlinking: (self: Type) => Type = flow(MStruct.set({ isBlinking: false }), make);

/**
 * Returns a copy of `self` with `isFramed` set to `false`
 *
 * @since 0.0.1
 * @category Utils
 */
export const notFramed: (self: Type) => Type = flow(MStruct.set({ isFramed: false }), make);

/**
 * Returns a copy of `self` with `isEncircled` set to `false`
 *
 * @since 0.0.1
 * @category Utils
 */
export const notEncircled: (self: Type) => Type = flow(MStruct.set({ isEncircled: false }), make);

/**
 * Returns a copy of `self` with `isOverlined` set to `false`
 *
 * @since 0.0.1
 * @category Utils
 */
export const notOverlined: (self: Type) => Type = flow(MStruct.set({ isOverlined: false }), make);

/**
 * Gets the sequence for `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const getSequence = (self: Type): string => {
	const bold = self.isBold ? Array.of(1) : Array.empty<number>();
	const underline = self.isUnderlined ? Array.of(4) : Array.empty<number>();
	const blink = self.isBlinking ? Array.of(5) : Array.empty<number>();
	const framed = self.isFramed ? Array.of(51) : Array.empty<number>();
	const encircled = self.isEncircled ? Array.of(52) : Array.empty<number>();
	const overlined = self.isOverlined ? Array.of(53) : Array.empty<number>();
	const sequence = [
		...self.color,
		...self.bgColor,
		...bold,
		...underline,
		...blink,
		...framed,
		...encircled,
		...overlined
	];
	return `\x1b[${sequence.join(';')}m${s}\x1b[0m`;
};
