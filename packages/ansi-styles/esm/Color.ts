/**
 * A very simple implementation of the Select Graphic Rendition subset which allows to colorize
 * terminal outputs. Info at
 * https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
 *
 * @since 0.1.0
 */

import { MInspectable, MMatch, MPipeable, MTypes } from '@parischap/effect-lib';
import { Array, Equal, Equivalence, flow, Hash, Pipeable, Predicate } from 'effect';

const moduleTag = '@parischap/ansi-style/Color/';
const _moduleTag = moduleTag;
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;
const GetFGSequence: unique symbol = Symbol.for(moduleTag + 'GetFGSequence/') as GetFGSequence;
type GetFGSequence = typeof GetFGSequence;
const GetBGSequence: unique symbol = Symbol.for(moduleTag + 'GetBGSequence/') as GetBGSequence;
type GetBGSequence = typeof GetBGSequence;

export type Type = TerminalDefault.Type | Original.Type | EightBit.Type | RGB.Type;

/**
 * Namespace for the default terminal color
 *
 * @since 0.0.1
 * @category Models
 */
export namespace TerminalDefault {
	const moduleTag = _moduleTag + 'TerminalDefault/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * Function that returns the ANSI foreground sequence for this color
		 *
		 * @since 0.0.1
		 */
		readonly [GetFGSequence]: () => MTypes.Array<number>;

		/**
		 * Function that returns the ANSI background sequence for this color
		 *
		 * @since 0.0.1
		 */
		readonly [GetBGSequence]: () => MTypes.Array<number>;

		/** @internal */
		readonly [_TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type =>
		Predicate.hasProperty(u, _TypeId) && u[_TypeId] === TypeId;

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (_self, _that) => true;

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that);
		},
		[Hash.symbol](this: Type) {
			return 0;
		},
		[MInspectable.GetName](this: Type) {
			return 'TerminalDefault';
		},
		[GetFGSequence](this: Type) {
			return Array.of(39);
		},
		[GetBGSequence](this: Type) {
			return Array.of(49);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Unique instance
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const instance = _make({});
}

/**
 * Namespace for original colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Original {
	const moduleTag = _moduleTag + 'Original/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * 8 ANSI original color offsets
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export enum Offset {
		Black = 0,
		Red = 1,
		Green = 2,
		Yellow = 3,
		Blue = 4,
		Magenta = 5,
		Cyan = 6,
		White = 7
	}

	export namespace Offset {
		export const name: (self: Offset) => string = flow(
			MMatch.make,
			flow(
				MMatch.whenIs(Offset.Black, () => 'Black'),
				MMatch.whenIs(Offset.Red, () => 'Red'),
				MMatch.whenIs(Offset.Green, () => 'Green'),
				MMatch.whenIs(Offset.Yellow, () => 'Yellow'),
				MMatch.whenIs(Offset.Blue, () => 'Blue'),
				MMatch.whenIs(Offset.Magenta, () => 'Magenta'),
				MMatch.whenIs(Offset.Cyan, () => 'Cyan'),
				MMatch.whenIs(Offset.White, () => 'White')
			),
			MMatch.exhaustive
		);
	}

	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * The color offset
		 *
		 * @since 0.0.1
		 */
		readonly colorOffset: Offset;

		/**
		 * `true` to use the bright version of the color. `false` otherwise
		 *
		 * @since 0.0.1
		 */
		readonly isBright: boolean;

		/**
		 * Function that returns the ANSI foreground sequence for this color
		 *
		 * @since 0.0.1
		 */
		readonly [GetFGSequence]: () => MTypes.Array<number>;

		/**
		 * Function that returns the ANSI background sequence for this color
		 *
		 * @since 0.0.1
		 */
		readonly [GetBGSequence]: () => MTypes.Array<number>;

		/** @internal */
		readonly [_TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type =>
		Predicate.hasProperty(u, _TypeId) && u[_TypeId] === TypeId;

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		that.colorOffset === self.colorOffset && that.isBright === self.isBright;

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return Hash.cached(this, Hash.structure(this));
		},
		[MInspectable.GetName](this: Type) {
			return (this.isBright ? 'Bright' : '') + Offset.name(this.colorOffset);
		},
		[GetFGSequence](this: Type) {
			return Array.of((this.isBright ? 90 : 30) + this.colorOffset);
		},
		[GetBGSequence](this: Type) {
			return Array.of((this.isBright ? 100 : 40) + this.colorOffset);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Constructor for non-bright colors
	 *
	 * @since 0.0.1
	 * @category Construtors
	 */
	export const make = (colorOffset: Offset) => _make({ colorOffset, isBright: false });

	/**
	 * Constructor for bright colors
	 *
	 * @since 0.0.1
	 * @category Construtors
	 */
	export const makeBright = (colorOffset: Offset) => _make({ colorOffset, isBright: true });

	/**
	 * Original black color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const black: Type = make(Offset.Black);

	/**
	 * Original red color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const red: Type = make(Offset.Red);

	/**
	 * Original green color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const green: Type = make(Offset.Green);

	/**
	 * Original yellow color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const yellow: Type = make(Offset.Yellow);

	/**
	 * Original blue color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const blue: Type = make(Offset.Blue);

	/**
	 * Original magenta color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const magenta: Type = make(Offset.Magenta);

	/**
	 * Original cyan color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const cyan: Type = make(Offset.Cyan);

	/**
	 * Original white color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const white: Type = make(Offset.White);

	/**
	 * Original bright black color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const brightBlack: Type = makeBright(Offset.Black);

	/**
	 * Original bright red color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const brightRed: Type = makeBright(Offset.Red);

	/**
	 * Original bright green color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const brightGreen: Type = makeBright(Offset.Green);

	/**
	 * Original bright yellow color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const brightYellow: Type = makeBright(Offset.Yellow);

	/**
	 * Original bright blue color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const brightBlue: Type = makeBright(Offset.Blue);

	/**
	 * Original bright magenta color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const brightMagenta: Type = makeBright(Offset.Magenta);

	/**
	 * Original bright cyan color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const brightCyan: Type = makeBright(Offset.Cyan);

	/**
	 * Original bright white color
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const brightWhite: Type = makeBright(Offset.White);
}

/**
 * Namespace for eight-bit colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace EightBit {
	const moduleTag = _moduleTag + 'EightBit/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * The color code: must be an integer value comprised in the interval [0,255]
		 *
		 * @since 0.0.1
		 */
		readonly code: number;

		/**
		 * Function that returns the ANSI foreground sequence for this color
		 *
		 * @since 0.0.1
		 */
		readonly [GetFGSequence]: () => MTypes.Array<number>;

		/**
		 * Function that returns the ANSI background sequence for this color
		 *
		 * @since 0.0.1
		 */
		readonly [GetBGSequence]: () => MTypes.Array<number>;

		/** @internal */
		readonly [_TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type =>
		Predicate.hasProperty(u, _TypeId) && u[_TypeId] === TypeId;

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) => that.code === self.code;

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return Hash.cached(this, Hash.structure(this));
		},
		[MInspectable.GetName](this: Type) {
			return `Color${this.code}`;
		},
		[GetFGSequence](this: Type) {
			return Array.make(38, 5, this.code);
		},
		[GetBGSequence](this: Type) {
			return Array.make(48, 5, this.code);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/**
	 * Constructor
	 *
	 * @since 0.0.1
	 * @category Construtors
	 */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);
}

/**
 * Namespace for RGB colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace RGB {
	const moduleTag = _moduleTag + 'RGB/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * The red color code: must be an integer value comprised in the interval [0,255]
		 *
		 * @since 0.0.1
		 */
		readonly redCode: number;

		/**
		 * The green color code: must be an integer value comprised in the interval [0,255]
		 *
		 * @since 0.0.1
		 */
		readonly greenCode: number;

		/**
		 * The blue color code: must be an integer value comprised in the interval [0,255]
		 *
		 * @since 0.0.1
		 */
		readonly blueCode: number;

		/**
		 * Function that returns the ANSI foreground sequence for this color
		 *
		 * @since 0.0.1
		 */
		readonly [GetFGSequence]: () => MTypes.Array<number>;

		/**
		 * Function that returns the ANSI background sequence for this color
		 *
		 * @since 0.0.1
		 */
		readonly [GetBGSequence]: () => MTypes.Array<number>;

		/** @internal */
		readonly [_TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type =>
		Predicate.hasProperty(u, _TypeId) && u[_TypeId] === TypeId;

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		that.redCode === self.redCode &&
		that.greenCode === self.greenCode &&
		that.blueCode === self.blueCode;

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: TypeId,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return Hash.cached(this, Hash.structure(this));
		},
		[MInspectable.GetName](this: Type) {
			return `RGB/${this.redCode}/${this.greenCode}/${this.blueCode}`;
		},
		[GetFGSequence](this: Type) {
			return Array.make(38, 2, this.redCode, this.greenCode, this.blueCode);
		},
		[GetBGSequence](this: Type) {
			return Array.make(48, 2, this.redCode, this.greenCode, this.blueCode);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/**
	 * Constructor
	 *
	 * @since 0.0.1
	 * @category Construtors
	 */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);
}

/**
 * Returns the name of this color
 *
 * @since 0.0.1
 * @category Utils
 */
export const name = (self: Type): string => self[MInspectable.GetName]();
