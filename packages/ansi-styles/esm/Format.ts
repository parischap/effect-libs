/**
 * A very simple implementation of the formats defined in the Select Graphic Rendition subset. Info
 * at https://stackoverflow.com/questions/4842424/list-of-ansi-fgColor-escape-sequences. A Format is
 * used to build a Formatter (see Formatter.ts) or a ContextFormatter (see ContextFormatter.ts). If
 * you only need a Formatter that applies a Color as foreground color, you don't need to create a
 * Format. The Formatter module has a `fromColor` constructor.
 *
 * @since 0.0.1
 */

import { MFunction, MInspectable, MPipeable, MStruct, MTypes } from '@parischap/effect-lib';
import { Array, Equal, Equivalence, flow, Hash, Option, pipe, Pipeable, Predicate } from 'effect';
import * as ASColor from './Color.js';
import { ASSequence } from './index.js';

const moduleTag = '@parischap/ansi-styles/Format/';
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
	 * Foreground color
	 *
	 * @since 0.0.1
	 */
	readonly fgColor?: ASColor.Type;
	/**
	 * Background color
	 *
	 * @since 0.0.1
	 */
	readonly bgColor?: ASColor.Type;
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
	Equal.equals(that.fgColor, self.fgColor) &&
	Equal.equals(that.bgColor, self.bgColor) &&
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
		return pipe(
			this.fgColor,
			Hash.hash,
			Hash.combine(Hash.hash(this.bgColor)),
			Hash.combine(Hash.hash(this.isBold)),
			Hash.combine(Hash.hash(this.isUnderlined)),
			Hash.combine(Hash.hash(this.isBlinking)),
			Hash.combine(Hash.hash(this.isFramed)),
			Hash.combine(Hash.hash(this.isEncircled)),
			Hash.combine(Hash.hash(this.isOverlined)),
			Hash.optimize,
			Hash.cached(this)
		);
	},
	[MInspectable.NameSymbol](this: Type) {
		const name =
			(this.isBold ? 'Bold' : '') +
			(this.isUnderlined ? 'Underlined' : '') +
			(this.isFramed ? 'Framed' : '') +
			(this.isEncircled ? 'Encircled' : '') +
			(this.isOverlined ? 'Overlined' : '') +
			(this.isBlinking ? 'Blinking' : '') +
			(this.fgColor !== undefined ? ASColor.fgName(this.fgColor) : '') +
			(this.bgColor !== undefined ? ASColor.bgName(this.bgColor) : '');
		return name === '' ? 'None' : name;
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

/**
 * Constructor that builds a format that applies `fgColor` as foreground color and no other
 * formatting
 *
 * @since 0.0.1
 * @category Constructors
 */
export const fromColor = (fgColor: ASColor.Type): Type =>
	pipe(none, MStruct.set({ fgColor }), _make);

/**
 * Format that performs no formatting
 *
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = _make({
	isBold: false,
	isUnderlined: false,
	isBlinking: false,
	isFramed: false,
	isEncircled: false,
	isOverlined: false
});

/**
 * Returns a copy of `self` with `fgColor` set to `fgColor`
 *
 * @since 0.0.1
 * @category Utils
 */
export const setFgColor = (fgColor: ASColor.Type): MTypes.OneArgFunction<Type> =>
	flow(MStruct.set({ fgColor }), _make);

/**
 * Returns a copy of `self` with `bgColor` set to `bgColor`
 *
 * @since 0.0.1
 * @category Utils
 */
export const setBgColor = (bgColor: ASColor.Type): MTypes.OneArgFunction<Type> =>
	flow(MStruct.set({ bgColor }), _make);

/**
 * Returns a copy of `self` with `isBold` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const makeBold: MTypes.OneArgFunction<Type> = flow(MStruct.set({ isBold: true }), _make);

/**
 * Returns a copy of `self` with `isUnderlined` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const makeUnderlined: MTypes.OneArgFunction<Type> = flow(
	MStruct.set({ isUnderlined: true }),
	_make
);

/**
 * Returns a copy of `self` with `isBlinking` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const makeBlinking: MTypes.OneArgFunction<Type> = flow(
	MStruct.set({ isBlinking: true }),
	_make
);

/**
 * Returns a copy of `self` with `isFramed` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const makeFramed: MTypes.OneArgFunction<Type> = flow(MStruct.set({ isFramed: true }), _make);

/**
 * Returns a copy of `self` with `isEncircled` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const makeEncircled: MTypes.OneArgFunction<Type> = flow(
	MStruct.set({ isEncircled: true }),
	_make
);

/**
 * Returns a copy of `self` with `isOverlined` set to `true`
 *
 * @since 0.0.1
 * @category Utils
 */
export const makeOverlined: MTypes.OneArgFunction<Type> = flow(
	MStruct.set({ isOverlined: true }),
	_make
);

/**
 * Gets the name of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const name = (self: Type): string => self[MInspectable.NameSymbol]();

/**
 * Gets the sequence for `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const sequence = (self: Type): ASSequence.Type =>
	pipe(
		ASSequence.empty,
		Array.appendAll(
			pipe(
				self.fgColor,
				Option.liftPredicate(MTypes.isNotUndefined),
				Option.map(ASColor.fgSequence),
				Option.getOrElse(() => ASSequence.empty)
			)
		),
		Array.appendAll(
			pipe(
				self.bgColor,
				Option.liftPredicate(MTypes.isNotUndefined),
				Option.map(ASColor.bgSequence),
				Option.getOrElse(() => ASSequence.empty)
			)
		),
		MFunction.fIfTrue({ condition: self.isBold, f: Array.append(1) }),
		MFunction.fIfTrue({ condition: self.isUnderlined, f: Array.append(4) }),
		MFunction.fIfTrue({ condition: self.isBlinking, f: Array.append(5) }),
		MFunction.fIfTrue({ condition: self.isFramed, f: Array.append(51) }),
		MFunction.fIfTrue({ condition: self.isEncircled, f: Array.append(52) }),
		MFunction.fIfTrue({ condition: self.isOverlined, f: Array.append(53) })
	);

/**
 * Gets the StringTransformer for `self`. This StringTransformer sends the sequence string
 * corresponding to Format, then the string it receives as argument and finally the reset
 * sequence.
 *
 * @since 0.0.1
 * @category Destructors
 */
export const stringTransformer: MTypes.OneArgFunction<Type, MTypes.StringTransformer> = flow(
	sequence,
	ASSequence.toStringTransformer
);
