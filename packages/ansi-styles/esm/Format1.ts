/**
 * A very simple implementation of the formats defined in the Select Graphic Rendition subset. Info
 * at https://stackoverflow.com/questions/4842424/list-of-ansi-fgColor-escape-sequences. A Format is
 * either:
 *
 * - A color that will be applied as foreground color (ASFormat.Colored)
 * - A style that comprises foreground and background colors as well as several properties such as
 *   whether the text is bold, blinking, underlined,... (ASFormat.Styled).
 *
 * Note that a Styled Format with only a foreground color `c` is equal to a Colored Format built
 * from the same `c` color.
 *
 * Once a Format is built, you can apply it directly to a string by calling the
 * ASFormat.stringTransformer function. However, if that stringTransformer is to be stored in
 * another object, it is good practise to encapsulate it into a Formatter so as to give it a id for
 * debug purposes (a function does not get printed by JSON.stringify)
 *
 * @since 0.0.1
 */

import {
	MFunction,
	MInspectable,
	MMatch,
	MPipeable,
	MString,
	MStruct,
	MTypes
} from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Hash,
	Number,
	Option,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import * as ASSequence from './Sequence.js';

export const moduleTag = '@parischap/ansi-styles/Format/';
const _moduleTag = moduleTag;
const _TypeId: unique symbol = Symbol.for(moduleTag);

/**
 * Type that represents a Format
 *
 * @since 0.0.1
 * @category Models
 */
export type Type = Styled.Type | Colored.Type;

/**
 * Type guard
 *
 * @since 0.0.6
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @since 0.0.6
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => id(that) === id(self);

/** Base prototype */
const baseProto = {
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return Hash.cached(this, Hash.hash(id(this)));
	},
	...MPipeable.BaseProto
};

/**
 * Gets the id of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const id = (self: Type): string => self[MInspectable.IdSymbol]();

export namespace Colored {
	const moduleTag = _moduleTag + 'Colored/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Type of a Colored Format
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * Name of this Colored Format instance. Useful for equality and debugging
		 *
		 * @since 0.0.1
		 */
		readonly id: string;

		/**
		 * Foreground sequence that corresponds to this Colored Format
		 *
		 * @since 0.0.1
		 */
		readonly fgSequence: ASSequence.NonEmptyType;

		/**
		 * StringTransformer that sends the sequence string corresponding to this Color used as
		 * foreground color, then the string it receives as argument and finally the reset sequence.
		 *
		 * @since 0.0.1
		 */
		readonly fgStringTransformer: MTypes.StringTransformer;

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

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: TypeId,
		...baseProto,
		[MInspectable.IdSymbol](this: Type) {
			return this.id;
		},
		...MInspectable.BaseProto(moduleTag)
	};

	/** Constructor */
	export const _make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	export const _fromSequence = ({
		id,
		fgSequence
	}: {
		readonly id: string;
		readonly fgSequence: ASSequence.NonEmptyType;
	}) =>
		_make({
			id,
			fgSequence,
			fgStringTransformer: ASSequence.toStringTransformer(fgSequence)
		});

	/**
	 * Returns the foreground id of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const fgName: MTypes.OneArgFunction<Type, string> = Struct.get('id');

	/**
	 * Returns the background id of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const bgName: MTypes.OneArgFunction<Type, string> = flow(
		Struct.get('id'),
		MString.prepend('In')
	);

	/**
	 * Returns the foreground sequence of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const fgSequence: MTypes.OneArgFunction<Type, ASSequence.NonEmptyType> =
		Struct.get('fgSequence');

	/**
	 * Returns the background sequence of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const bgSequence: MTypes.OneArgFunction<Type, ASSequence.NonEmptyType> = flow(
		fgSequence,
		ASSequence.toBgSequence
	);

	/**
	 * Returns the fgStringTransformer property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const fgStringTransformer: MTypes.OneArgFunction<Type, MTypes.StringTransformer> =
		Struct.get('fgStringTransformer');

	/**
	 * Namespace for the default terminal color
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace TerminalDefault {
		/**
		 * Unique instance
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const instance = _fromSequence({
			id: 'TerminalDefaultColor',
			fgSequence: Array.of(39)
		});
	}

	/**
	 * Namespace for original colors
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace Original {
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
			export const id: (self: Offset) => string = flow(
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

		/**
		 * Constructor for non-bright colors. Needs not be exported: all possible instances are
		 * available
		 */
		const _makeStandard = (colorOffset: Offset): Type =>
			_fromSequence({
				id: Offset.id(colorOffset),
				fgSequence: pipe(colorOffset, Number.sum(30), Array.of)
			});

		/** Constructor for bright colors. Needs not be exported: all possible instances are available */
		const _makeBright = (colorOffset: Offset) =>
			_fromSequence({
				id: 'Bright' + Offset.id(colorOffset),
				fgSequence: pipe(colorOffset, Number.sum(90), Array.of)
			});
		/**
		 * Original black color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const black: Type = _makeStandard(Offset.Black);

		/**
		 * Original red color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const red: Type = _makeStandard(Offset.Red);

		/**
		 * Original green color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const green: Type = _makeStandard(Offset.Green);

		/**
		 * Original yellow color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const yellow: Type = _makeStandard(Offset.Yellow);

		/**
		 * Original blue color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const blue: Type = _makeStandard(Offset.Blue);

		/**
		 * Original magenta color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const magenta: Type = _makeStandard(Offset.Magenta);

		/**
		 * Original cyan color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const cyan: Type = _makeStandard(Offset.Cyan);

		/**
		 * Original white color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const white: Type = _makeStandard(Offset.White);

		/**
		 * Original bright black color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const brightBlack: Type = _makeBright(Offset.Black);

		/**
		 * Original bright red color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const brightRed: Type = _makeBright(Offset.Red);

		/**
		 * Original bright green color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const brightGreen: Type = _makeBright(Offset.Green);

		/**
		 * Original bright yellow color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const brightYellow: Type = _makeBright(Offset.Yellow);

		/**
		 * Original bright blue color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const brightBlue: Type = _makeBright(Offset.Blue);

		/**
		 * Original bright magenta color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const brightMagenta: Type = _makeBright(Offset.Magenta);

		/**
		 * Original bright cyan color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const brightCyan: Type = _makeBright(Offset.Cyan);

		/**
		 * Original bright white color
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const brightWhite: Type = _makeBright(Offset.White);
	}

	/**
	 * Namespace for eight-bit colors
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace EightBit {
		/**
		 * EightBit color codes
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export enum Code {
			Black = 0,
			Maroon = 1,
			Green = 2,
			Olive = 3,
			Navy = 4,
			Purple_1 = 5,
			Teal = 6,
			Silver = 7,
			Grey = 8,
			Red = 9,
			Lime = 10,
			Yellow = 11,
			Blue = 12,
			Fuchsia = 13,
			Aqua = 14,
			White = 15,
			Grey0 = 16,
			NavyBlue = 17,
			DarkBlue = 18,
			Blue3_1 = 19,
			Blue3_2 = 20,
			Blue1 = 21,
			DarkGreen = 22,
			DeepSkyBlue4_1 = 23,
			DeepSkyBlue4_2 = 24,
			DeepSkyBlue4_3 = 25,
			DodgerBlue3 = 26,
			DodgerBlue2 = 27,
			Green4 = 28,
			SpringGreen4 = 29,
			Turquoise4 = 30,
			DeepSkyBlue3_1 = 31,
			DeepSkyBlue3_2 = 32,
			DodgerBlue1 = 33,
			Green3_1 = 34,
			SpringGreen3_1 = 35,
			DarkCyan = 36,
			LightSeaGreen = 37,
			DeepSkyBlue2 = 38,
			DeepSkyBlue1 = 39,
			Green3_2 = 40,
			SpringGreen3_2 = 41,
			SpringGreen2_1 = 42,
			Cyan3 = 43,
			DarkTurquoise = 44,
			Turquoise2 = 45,
			Green1 = 46,
			SpringGreen2_2 = 47,
			SpringGreen1 = 48,
			MediumSpringGreen = 49,
			Cyan2 = 50,
			Cyan1 = 51,
			DarkRed_1 = 52,
			DeepPink4_1 = 53,
			Purple4_1 = 54,
			Purple4_2 = 55,
			Purple3 = 56,
			BlueViolet = 57,
			Orange4_1 = 58,
			Grey37 = 59,
			MediumPurple4 = 60,
			SlateBlue3_1 = 61,
			SlateBlue3_2 = 62,
			RoyalBlue1 = 63,
			Chartreuse4 = 64,
			DarkSeaGreen4_1 = 65,
			PaleTurquoise4 = 66,
			SteelBlue = 67,
			SteelBlue3 = 68,
			CornflowerBlue = 69,
			Chartreuse3_1 = 70,
			DarkSeaGreen4_2 = 71,
			CadetBlue_1 = 72,
			CadetBlue_2 = 73,
			SkyBlue3 = 74,
			SteelBlue1_1 = 75,
			Chartreuse3_2 = 76,
			PaleGreen3_1 = 77,
			SeaGreen3 = 78,
			Aquamarine3 = 79,
			MediumTurquoise = 80,
			SteelBlue1_2 = 81,
			Chartreuse2_1 = 82,
			SeaGreen2 = 83,
			SeaGreen1_1 = 84,
			SeaGreen1_2 = 85,
			Aquamarine1_1 = 86,
			DarkSlateGray2 = 87,
			DarkRed_2 = 88,
			DeepPink4_2 = 89,
			DarkMagenta_1 = 90,
			DarkMagenta_2 = 91,
			DarkViolet_1 = 92,
			Purple_2 = 93,
			Orange4_2 = 94,
			LightPink4 = 95,
			Plum4 = 96,
			MediumPurple3_1 = 97,
			MediumPurple3_2 = 98,
			SlateBlue1 = 99,
			Yellow4_1 = 100,
			Wheat4 = 101,
			Grey53 = 102,
			LightSlateGrey = 103,
			MediumPurple = 104,
			LightSlateBlue = 105,
			Yellow4_2 = 106,
			DarkOliveGreen3_1 = 107,
			DarkSeaGreen = 108,
			LightSkyBlue3_1 = 109,
			LightSkyBlue3_2 = 110,
			SkyBlue2 = 111,
			Chartreuse2_2 = 112,
			DarkOliveGreen3_2 = 113,
			PaleGreen3_2 = 114,
			DarkSeaGreen3_1 = 115,
			DarkSlateGray3 = 116,
			SkyBlue1 = 117,
			Chartreuse1 = 118,
			LightGreen_1 = 119,
			LightGreen_2 = 120,
			PaleGreen1_1 = 121,
			Aquamarine1_2 = 122,
			DarkSlateGray1 = 123,
			Red3_1 = 124,
			DeepPink4_3 = 125,
			MediumVioletRed = 126,
			Magenta3_1 = 127,
			DarkViolet_2 = 128,
			Purple_3 = 129,
			DarkOrange3_1 = 130,
			IndianRed_1 = 131,
			HotPink3_1 = 132,
			MediumOrchid3 = 133,
			MediumOrchid = 134,
			MediumPurple2_1 = 135,
			DarkGoldenrod = 136,
			LightSalmon3_1 = 137,
			RosyBrown = 138,
			Grey63 = 139,
			MediumPurple2_2 = 140,
			MediumPurple1 = 141,
			Gold3_1 = 142,
			DarkKhaki = 143,
			NavajoWhite3 = 144,
			Grey69 = 145,
			LightSteelBlue3 = 146,
			LightSteelBlue = 147,
			Yellow3_1 = 148,
			DarkOliveGreen3_3 = 149,
			DarkSeaGreen3_2 = 150,
			DarkSeaGreen2_1 = 151,
			LightCyan3 = 152,
			LightSkyBlue1 = 153,
			GreenYellow = 154,
			DarkOliveGreen2 = 155,
			PaleGreen1_2 = 156,
			DarkSeaGreen2_2 = 157,
			DarkSeaGreen1_1 = 158,
			PaleTurquoise1 = 159,
			Red3_2 = 160,
			DeepPink3_1 = 161,
			DeepPink3_2 = 162,
			Magenta3_2 = 163,
			Magenta3_3 = 164,
			Magenta2_1 = 165,
			DarkOrange3_2 = 166,
			IndianRed_2 = 167,
			HotPink3_2 = 168,
			HotPink2 = 169,
			Orchid = 170,
			MediumOrchid1_1 = 171,
			Orange3 = 172,
			LightSalmon3_2 = 173,
			LightPink3 = 174,
			Pink3 = 175,
			Plum3 = 176,
			Violet = 177,
			Gold3_2 = 178,
			LightGoldenrod3 = 179,
			Tan = 180,
			MistyRose3 = 181,
			Thistle3 = 182,
			Plum2 = 183,
			Yellow3_2 = 184,
			Khaki3 = 185,
			LightGoldenrod2_1 = 186,
			LightYellow3 = 187,
			Grey84 = 188,
			LightSteelBlue1 = 189,
			Yellow2 = 190,
			DarkOliveGreen1_1 = 191,
			DarkOliveGreen1_2 = 192,
			DarkSeaGreen1_2 = 193,
			Honeydew2 = 194,
			LightCyan1 = 195,
			Red1 = 196,
			DeepPink2 = 197,
			DeepPink1_1 = 198,
			DeepPink1_2 = 199,
			Magenta2_2 = 200,
			Magenta1 = 201,
			OrangeRed1 = 202,
			IndianRed1_1 = 203,
			IndianRed1_2 = 204,
			HotPink_1 = 205,
			HotPink_2 = 206,
			MediumOrchid1_2 = 207,
			DarkOrange = 208,
			Salmon1 = 209,
			LightCoral = 210,
			PaleVioletRed1 = 211,
			Orchid2 = 212,
			Orchid1 = 213,
			Orange1 = 214,
			SandyBrown = 215,
			LightSalmon1 = 216,
			LightPink1 = 217,
			Pink1 = 218,
			Plum1 = 219,
			Gold1 = 220,
			LightGoldenrod2_2 = 221,
			LightGoldenrod2_3 = 222,
			NavajoWhite1 = 223,
			MistyRose1 = 224,
			Thistle1 = 225,
			Yellow1 = 226,
			LightGoldenrod1 = 227,
			Khaki1 = 228,
			Wheat1 = 229,
			Cornsilk1 = 230,
			Grey100 = 231,
			Grey3 = 232,
			Grey7 = 233,
			Grey11 = 234,
			Grey15 = 235,
			Grey19 = 236,
			Grey23 = 237,
			Grey27 = 238,
			Grey30 = 239,
			Grey35 = 240,
			Grey39 = 241,
			Grey42 = 242,
			Grey46 = 243,
			Grey50 = 244,
			Grey54 = 245,
			Grey58 = 246,
			Grey62 = 247,
			Grey66 = 248,
			Grey70 = 249,
			Grey74 = 250,
			Grey78 = 251,
			Grey82 = 252,
			Grey85 = 253,
			Grey89 = 254,
			Grey93 = 255
		}

		export namespace Code {
			export const id: (self: Code) => string = flow(
				MMatch.make,
				flow(
					flow(
						flow(
							MMatch.whenIs(Code.Black, () => 'Black'),
							MMatch.whenIs(Code.Maroon, () => 'Maroon'),
							MMatch.whenIs(Code.Green, () => 'Green'),
							MMatch.whenIs(Code.Olive, () => 'Olive'),
							MMatch.whenIs(Code.Navy, () => 'Navy'),
							MMatch.whenIs(Code.Purple_1, () => 'Purple_1'),
							MMatch.whenIs(Code.Teal, () => 'Teal'),
							MMatch.whenIs(Code.Silver, () => 'Silver'),
							MMatch.whenIs(Code.Grey, () => 'Grey')
						),
						flow(
							MMatch.whenIs(Code.Red, () => 'Red'),
							MMatch.whenIs(Code.Lime, () => 'Lime'),
							MMatch.whenIs(Code.Yellow, () => 'Yellow'),
							MMatch.whenIs(Code.Blue, () => 'Blue'),
							MMatch.whenIs(Code.Fuchsia, () => 'Fuchsia'),
							MMatch.whenIs(Code.Aqua, () => 'Aqua'),
							MMatch.whenIs(Code.White, () => 'White'),
							MMatch.whenIs(Code.Grey0, () => 'Grey0'),
							MMatch.whenIs(Code.NavyBlue, () => 'NavyBlue')
						),
						flow(
							MMatch.whenIs(Code.DarkBlue, () => 'DarkBlue'),
							MMatch.whenIs(Code.Blue3_1, () => 'Blue3_1'),
							MMatch.whenIs(Code.Blue3_2, () => 'Blue3_2'),
							MMatch.whenIs(Code.Blue1, () => 'Blue1'),
							MMatch.whenIs(Code.DarkGreen, () => 'DarkGreen'),
							MMatch.whenIs(Code.DeepSkyBlue4_1, () => 'DeepSkyBlue4_1'),
							MMatch.whenIs(Code.DeepSkyBlue4_2, () => 'DeepSkyBlue4_2'),
							MMatch.whenIs(Code.DeepSkyBlue4_3, () => 'DeepSkyBlue4_3'),
							MMatch.whenIs(Code.DodgerBlue3, () => 'DodgerBlue3')
						),
						flow(
							MMatch.whenIs(Code.DodgerBlue2, () => 'DodgerBlue2'),
							MMatch.whenIs(Code.Green4, () => 'Green4'),
							MMatch.whenIs(Code.SpringGreen4, () => 'SpringGreen4'),
							MMatch.whenIs(Code.Turquoise4, () => 'Turquoise4'),
							MMatch.whenIs(Code.DeepSkyBlue3_1, () => 'DeepSkyBlue3_1'),
							MMatch.whenIs(Code.DeepSkyBlue3_2, () => 'DeepSkyBlue3_2'),
							MMatch.whenIs(Code.DodgerBlue1, () => 'DodgerBlue1'),
							MMatch.whenIs(Code.Green3_1, () => 'Green3_1'),
							MMatch.whenIs(Code.SpringGreen3_1, () => 'SpringGreen3_1')
						),
						flow(
							MMatch.whenIs(Code.DarkCyan, () => 'DarkCyan'),
							MMatch.whenIs(Code.LightSeaGreen, () => 'LightSeaGreen'),
							MMatch.whenIs(Code.DeepSkyBlue2, () => 'DeepSkyBlue2'),
							MMatch.whenIs(Code.DeepSkyBlue1, () => 'DeepSkyBlue1'),
							MMatch.whenIs(Code.Green3_2, () => 'Green3_2'),
							MMatch.whenIs(Code.SpringGreen3_2, () => 'SpringGreen3_2'),
							MMatch.whenIs(Code.SpringGreen2_1, () => 'SpringGreen2_1'),
							MMatch.whenIs(Code.Cyan3, () => 'Cyan3'),
							MMatch.whenIs(Code.DarkTurquoise, () => 'DarkTurquoise')
						),
						flow(
							MMatch.whenIs(Code.Turquoise2, () => 'Turquoise2'),
							MMatch.whenIs(Code.Green1, () => 'Green1'),
							MMatch.whenIs(Code.SpringGreen2_2, () => 'SpringGreen2_2'),
							MMatch.whenIs(Code.SpringGreen1, () => 'SpringGreen1'),
							MMatch.whenIs(Code.MediumSpringGreen, () => 'MediumSpringGreen'),
							MMatch.whenIs(Code.Cyan2, () => 'Cyan2'),
							MMatch.whenIs(Code.Cyan1, () => 'Cyan1'),
							MMatch.whenIs(Code.DarkRed_1, () => 'DarkRed_1'),
							MMatch.whenIs(Code.DeepPink4_1, () => 'DeepPink4_1')
						),
						flow(
							MMatch.whenIs(Code.Purple4_1, () => 'Purple4_1'),
							MMatch.whenIs(Code.Purple4_2, () => 'Purple4_2'),
							MMatch.whenIs(Code.Purple3, () => 'Purple3'),
							MMatch.whenIs(Code.BlueViolet, () => 'BlueViolet'),
							MMatch.whenIs(Code.Orange4_1, () => 'Orange4_1'),
							MMatch.whenIs(Code.Grey37, () => 'Grey37'),
							MMatch.whenIs(Code.MediumPurple4, () => 'MediumPurple4'),
							MMatch.whenIs(Code.SlateBlue3_1, () => 'SlateBlue3_1'),
							MMatch.whenIs(Code.SlateBlue3_2, () => 'SlateBlue3_2')
						),
						flow(
							MMatch.whenIs(Code.RoyalBlue1, () => 'RoyalBlue1'),
							MMatch.whenIs(Code.Chartreuse4, () => 'Chartreuse4'),
							MMatch.whenIs(Code.DarkSeaGreen4_1, () => 'DarkSeaGreen4_1'),
							MMatch.whenIs(Code.PaleTurquoise4, () => 'PaleTurquoise4'),
							MMatch.whenIs(Code.SteelBlue, () => 'SteelBlue'),
							MMatch.whenIs(Code.SteelBlue3, () => 'SteelBlue3'),
							MMatch.whenIs(Code.CornflowerBlue, () => 'CornflowerBlue'),
							MMatch.whenIs(Code.Chartreuse3_1, () => 'Chartreuse3_1'),
							MMatch.whenIs(Code.DarkSeaGreen4_2, () => 'DarkSeaGreen4_2')
						),
						flow(
							MMatch.whenIs(Code.CadetBlue_1, () => 'CadetBlue_1'),
							MMatch.whenIs(Code.CadetBlue_2, () => 'CadetBlue_2'),
							MMatch.whenIs(Code.SkyBlue3, () => 'SkyBlue3'),
							MMatch.whenIs(Code.SteelBlue1_1, () => 'SteelBlue1_1'),
							MMatch.whenIs(Code.Chartreuse3_2, () => 'Chartreuse3_2'),
							MMatch.whenIs(Code.PaleGreen3_1, () => 'PaleGreen3_1'),
							MMatch.whenIs(Code.SeaGreen3, () => 'SeaGreen3'),
							MMatch.whenIs(Code.Aquamarine3, () => 'Aquamarine3'),
							MMatch.whenIs(Code.MediumTurquoise, () => 'MediumTurquoise')
						)
					),
					flow(
						flow(
							MMatch.whenIs(Code.SteelBlue1_2, () => 'SteelBlue1_2'),
							MMatch.whenIs(Code.Chartreuse2_1, () => 'Chartreuse2_1'),
							MMatch.whenIs(Code.SeaGreen2, () => 'SeaGreen2'),
							MMatch.whenIs(Code.SeaGreen1_1, () => 'SeaGreen1_1'),
							MMatch.whenIs(Code.SeaGreen1_2, () => 'SeaGreen1_2'),
							MMatch.whenIs(Code.Aquamarine1_1, () => 'Aquamarine1_1'),
							MMatch.whenIs(Code.DarkSlateGray2, () => 'DarkSlateGray2'),
							MMatch.whenIs(Code.DarkRed_2, () => 'DarkRed_2'),
							MMatch.whenIs(Code.DeepPink4_2, () => 'DeepPink4_2')
						),
						flow(
							MMatch.whenIs(Code.DarkMagenta_1, () => 'DarkMagenta_1'),
							MMatch.whenIs(Code.DarkMagenta_2, () => 'DarkMagenta_2'),
							MMatch.whenIs(Code.DarkViolet_1, () => 'DarkViolet_1'),
							MMatch.whenIs(Code.Purple_2, () => 'Purple_2'),
							MMatch.whenIs(Code.Orange4_2, () => 'Orange4_2'),
							MMatch.whenIs(Code.LightPink4, () => 'LightPink4'),
							MMatch.whenIs(Code.Plum4, () => 'Plum4'),
							MMatch.whenIs(Code.MediumPurple3_1, () => 'MediumPurple3_1'),
							MMatch.whenIs(Code.MediumPurple3_2, () => 'MediumPurple3_2')
						),
						flow(
							MMatch.whenIs(Code.SlateBlue1, () => 'SlateBlue1'),
							MMatch.whenIs(Code.Yellow4_1, () => 'Yellow4_1'),
							MMatch.whenIs(Code.Wheat4, () => 'Wheat4'),
							MMatch.whenIs(Code.Grey53, () => 'Grey53'),
							MMatch.whenIs(Code.LightSlateGrey, () => 'LightSlateGrey'),
							MMatch.whenIs(Code.MediumPurple, () => 'MediumPurple'),
							MMatch.whenIs(Code.LightSlateBlue, () => 'LightSlateBlue'),
							MMatch.whenIs(Code.Yellow4_2, () => 'Yellow4_2'),
							MMatch.whenIs(Code.DarkOliveGreen3_1, () => 'DarkOliveGreen3_1')
						),
						flow(
							MMatch.whenIs(Code.DarkSeaGreen, () => 'DarkSeaGreen'),
							MMatch.whenIs(Code.LightSkyBlue3_1, () => 'LightSkyBlue3_1'),
							MMatch.whenIs(Code.LightSkyBlue3_2, () => 'LightSkyBlue3_2'),
							MMatch.whenIs(Code.SkyBlue2, () => 'SkyBlue2'),
							MMatch.whenIs(Code.Chartreuse2_2, () => 'Chartreuse2_2'),
							MMatch.whenIs(Code.DarkOliveGreen3_2, () => 'DarkOliveGreen3_2'),
							MMatch.whenIs(Code.PaleGreen3_2, () => 'PaleGreen3_2'),
							MMatch.whenIs(Code.DarkSeaGreen3_1, () => 'DarkSeaGreen3_1'),
							MMatch.whenIs(Code.DarkSlateGray3, () => 'DarkSlateGray3')
						),
						flow(
							MMatch.whenIs(Code.SkyBlue1, () => 'SkyBlue1'),
							MMatch.whenIs(Code.Chartreuse1, () => 'Chartreuse1'),
							MMatch.whenIs(Code.LightGreen_1, () => 'LightGreen_1'),
							MMatch.whenIs(Code.LightGreen_2, () => 'LightGreen_2'),
							MMatch.whenIs(Code.PaleGreen1_1, () => 'PaleGreen1_1'),
							MMatch.whenIs(Code.Aquamarine1_2, () => 'Aquamarine1_2'),
							MMatch.whenIs(Code.DarkSlateGray1, () => 'DarkSlateGray1'),
							MMatch.whenIs(Code.Red3_1, () => 'Red3_1'),
							MMatch.whenIs(Code.DeepPink4_3, () => 'DeepPink4_3')
						),
						flow(
							MMatch.whenIs(Code.MediumVioletRed, () => 'MediumVioletRed'),
							MMatch.whenIs(Code.Magenta3_1, () => 'Magenta3_1'),
							MMatch.whenIs(Code.DarkViolet_2, () => 'DarkViolet_2'),
							MMatch.whenIs(Code.Purple_3, () => 'Purple_3'),
							MMatch.whenIs(Code.DarkOrange3_1, () => 'DarkOrange3_1'),
							MMatch.whenIs(Code.IndianRed_1, () => 'IndianRed_1'),
							MMatch.whenIs(Code.HotPink3_1, () => 'HotPink3_1'),
							MMatch.whenIs(Code.MediumOrchid3, () => 'MediumOrchid3'),
							MMatch.whenIs(Code.MediumOrchid, () => 'MediumOrchid')
						),
						flow(
							MMatch.whenIs(Code.MediumPurple2_1, () => 'MediumPurple2_1'),
							MMatch.whenIs(Code.DarkGoldenrod, () => 'DarkGoldenrod'),
							MMatch.whenIs(Code.LightSalmon3_1, () => 'LightSalmon3_1'),
							MMatch.whenIs(Code.RosyBrown, () => 'RosyBrown'),
							MMatch.whenIs(Code.Grey63, () => 'Grey63'),
							MMatch.whenIs(Code.MediumPurple2_2, () => 'MediumPurple2_2'),
							MMatch.whenIs(Code.MediumPurple1, () => 'MediumPurple1'),
							MMatch.whenIs(Code.Gold3_1, () => 'Gold3_1'),
							MMatch.whenIs(Code.DarkKhaki, () => 'DarkKhaki')
						),
						flow(
							MMatch.whenIs(Code.NavajoWhite3, () => 'NavajoWhite3'),
							MMatch.whenIs(Code.Grey69, () => 'Grey69'),
							MMatch.whenIs(Code.LightSteelBlue3, () => 'LightSteelBlue3'),
							MMatch.whenIs(Code.LightSteelBlue, () => 'LightSteelBlue'),
							MMatch.whenIs(Code.Yellow3_1, () => 'Yellow3_1'),
							MMatch.whenIs(Code.DarkOliveGreen3_3, () => 'DarkOliveGreen3_3'),
							MMatch.whenIs(Code.DarkSeaGreen3_2, () => 'DarkSeaGreen3_2'),
							MMatch.whenIs(Code.DarkSeaGreen2_1, () => 'DarkSeaGreen2_1'),
							MMatch.whenIs(Code.LightCyan3, () => 'LightCyan3')
						),
						flow(
							MMatch.whenIs(Code.LightSkyBlue1, () => 'LightSkyBlue1'),
							MMatch.whenIs(Code.GreenYellow, () => 'GreenYellow'),
							MMatch.whenIs(Code.DarkOliveGreen2, () => 'DarkOliveGreen2'),
							MMatch.whenIs(Code.PaleGreen1_2, () => 'PaleGreen1_2'),
							MMatch.whenIs(Code.DarkSeaGreen2_2, () => 'DarkSeaGreen2_2'),
							MMatch.whenIs(Code.DarkSeaGreen1_1, () => 'DarkSeaGreen1_1'),
							MMatch.whenIs(Code.PaleTurquoise1, () => 'PaleTurquoise1'),
							MMatch.whenIs(Code.Red3_2, () => 'Red3_2'),
							MMatch.whenIs(Code.DeepPink3_1, () => 'DeepPink3_1')
						)
					),
					flow(
						flow(
							MMatch.whenIs(Code.DeepPink3_2, () => 'DeepPink3_2'),
							MMatch.whenIs(Code.Magenta3_2, () => 'Magenta3_2'),
							MMatch.whenIs(Code.Magenta3_3, () => 'Magenta3_3'),
							MMatch.whenIs(Code.Magenta2_1, () => 'Magenta2_1'),
							MMatch.whenIs(Code.DarkOrange3_2, () => 'DarkOrange3_2'),
							MMatch.whenIs(Code.IndianRed_2, () => 'IndianRed_2'),
							MMatch.whenIs(Code.HotPink3_2, () => 'HotPink3_2'),
							MMatch.whenIs(Code.HotPink2, () => 'HotPink2'),
							MMatch.whenIs(Code.Orchid, () => 'Orchid')
						),
						flow(
							MMatch.whenIs(Code.MediumOrchid1_1, () => 'MediumOrchid1_1'),
							MMatch.whenIs(Code.Orange3, () => 'Orange3'),
							MMatch.whenIs(Code.LightSalmon3_2, () => 'LightSalmon3_2'),
							MMatch.whenIs(Code.LightPink3, () => 'LightPink3'),
							MMatch.whenIs(Code.Pink3, () => 'Pink3'),
							MMatch.whenIs(Code.Plum3, () => 'Plum3'),
							MMatch.whenIs(Code.Violet, () => 'Violet'),
							MMatch.whenIs(Code.Gold3_2, () => 'Gold3_2'),
							MMatch.whenIs(Code.LightGoldenrod3, () => 'LightGoldenrod3')
						),
						flow(
							MMatch.whenIs(Code.Tan, () => 'Tan'),
							MMatch.whenIs(Code.MistyRose3, () => 'MistyRose3'),
							MMatch.whenIs(Code.Thistle3, () => 'Thistle3'),
							MMatch.whenIs(Code.Plum2, () => 'Plum2'),
							MMatch.whenIs(Code.Yellow3_2, () => 'Yellow3_2'),
							MMatch.whenIs(Code.Khaki3, () => 'Khaki3'),
							MMatch.whenIs(Code.LightGoldenrod2_1, () => 'LightGoldenrod2_1'),
							MMatch.whenIs(Code.LightYellow3, () => 'LightYellow3'),
							MMatch.whenIs(Code.Grey84, () => 'Grey84')
						),
						flow(
							MMatch.whenIs(Code.LightSteelBlue1, () => 'LightSteelBlue1'),
							MMatch.whenIs(Code.Yellow2, () => 'Yellow2'),
							MMatch.whenIs(Code.DarkOliveGreen1_1, () => 'DarkOliveGreen1_1'),
							MMatch.whenIs(Code.DarkOliveGreen1_2, () => 'DarkOliveGreen1_2'),
							MMatch.whenIs(Code.DarkSeaGreen1_2, () => 'DarkSeaGreen1_2'),
							MMatch.whenIs(Code.Honeydew2, () => 'Honeydew2'),
							MMatch.whenIs(Code.LightCyan1, () => 'LightCyan1'),
							MMatch.whenIs(Code.Red1, () => 'Red1'),
							MMatch.whenIs(Code.DeepPink2, () => 'DeepPink2')
						),
						flow(
							MMatch.whenIs(Code.DeepPink1_1, () => 'DeepPink1_1'),
							MMatch.whenIs(Code.DeepPink1_2, () => 'DeepPink1_2'),
							MMatch.whenIs(Code.Magenta2_2, () => 'Magenta2_2'),
							MMatch.whenIs(Code.Magenta1, () => 'Magenta1'),
							MMatch.whenIs(Code.OrangeRed1, () => 'OrangeRed1'),
							MMatch.whenIs(Code.IndianRed1_1, () => 'IndianRed1_1'),
							MMatch.whenIs(Code.IndianRed1_2, () => 'IndianRed1_2'),
							MMatch.whenIs(Code.HotPink_1, () => 'HotPink_1'),
							MMatch.whenIs(Code.HotPink_2, () => 'HotPink_2')
						),
						flow(
							MMatch.whenIs(Code.MediumOrchid1_2, () => 'MediumOrchid1_2'),
							MMatch.whenIs(Code.DarkOrange, () => 'DarkOrange'),
							MMatch.whenIs(Code.Salmon1, () => 'Salmon1'),
							MMatch.whenIs(Code.LightCoral, () => 'LightCoral'),
							MMatch.whenIs(Code.PaleVioletRed1, () => 'PaleVioletRed1'),
							MMatch.whenIs(Code.Orchid2, () => 'Orchid2'),
							MMatch.whenIs(Code.Orchid1, () => 'Orchid1'),
							MMatch.whenIs(Code.Orange1, () => 'Orange1'),
							MMatch.whenIs(Code.SandyBrown, () => 'SandyBrown')
						),
						flow(
							MMatch.whenIs(Code.LightSalmon1, () => 'LightSalmon1'),
							MMatch.whenIs(Code.LightPink1, () => 'LightPink1'),
							MMatch.whenIs(Code.Pink1, () => 'Pink1'),
							MMatch.whenIs(Code.Plum1, () => 'Plum1'),
							MMatch.whenIs(Code.Gold1, () => 'Gold1'),
							MMatch.whenIs(Code.LightGoldenrod2_2, () => 'LightGoldenrod2_2'),
							MMatch.whenIs(Code.LightGoldenrod2_3, () => 'LightGoldenrod2_3'),
							MMatch.whenIs(Code.NavajoWhite1, () => 'NavajoWhite1'),
							MMatch.whenIs(Code.MistyRose1, () => 'MistyRose1')
						),
						flow(
							MMatch.whenIs(Code.Thistle1, () => 'Thistle1'),
							MMatch.whenIs(Code.Yellow1, () => 'Yellow1'),
							MMatch.whenIs(Code.LightGoldenrod1, () => 'LightGoldenrod1'),
							MMatch.whenIs(Code.Khaki1, () => 'Khaki1'),
							MMatch.whenIs(Code.Wheat1, () => 'Wheat1'),
							MMatch.whenIs(Code.Cornsilk1, () => 'Cornsilk1'),
							MMatch.whenIs(Code.Grey100, () => 'Grey100'),
							MMatch.whenIs(Code.Grey3, () => 'Grey3'),
							MMatch.whenIs(Code.Grey7, () => 'Grey7')
						),
						flow(
							MMatch.whenIs(Code.Grey11, () => 'Grey11'),
							MMatch.whenIs(Code.Grey15, () => 'Grey15'),
							MMatch.whenIs(Code.Grey19, () => 'Grey19'),
							MMatch.whenIs(Code.Grey23, () => 'Grey23'),
							MMatch.whenIs(Code.Grey27, () => 'Grey27'),
							MMatch.whenIs(Code.Grey30, () => 'Grey30'),
							MMatch.whenIs(Code.Grey35, () => 'Grey35'),
							MMatch.whenIs(Code.Grey39, () => 'Grey39'),
							MMatch.whenIs(Code.Grey42, () => 'Grey42')
						)
					),
					flow(
						flow(
							MMatch.whenIs(Code.Grey46, () => 'Grey46'),
							MMatch.whenIs(Code.Grey50, () => 'Grey50'),
							MMatch.whenIs(Code.Grey54, () => 'Grey54'),
							MMatch.whenIs(Code.Grey58, () => 'Grey58'),
							MMatch.whenIs(Code.Grey62, () => 'Grey62'),
							MMatch.whenIs(Code.Grey66, () => 'Grey66'),
							MMatch.whenIs(Code.Grey70, () => 'Grey70'),
							MMatch.whenIs(Code.Grey74, () => 'Grey74'),
							MMatch.whenIs(Code.Grey78, () => 'Grey78')
						),
						flow(
							MMatch.whenIs(Code.Grey82, () => 'Grey82'),
							MMatch.whenIs(Code.Grey85, () => 'Grey85'),
							MMatch.whenIs(Code.Grey89, () => 'Grey89'),
							MMatch.whenIs(Code.Grey93, () => 'Grey93')
						)
					)
				),
				MMatch.exhaustive,
				MString.prepend('EightBit')
			);
		}

		/** Constructor. Needs not be exported: all possible instances are available */
		const _fromCode = (code: Code): Type =>
			_fromSequence({
				id: Code.id(code),
				fgSequence: pipe(code, Array.of, Array.prependAll([38, 5]))
			});

		/**
		 * Eightbit black color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const black: Type = _fromCode(Code.Black);
		/**
		 * Eightbit maroon color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const maroon: Type = _fromCode(Code.Maroon);
		/**
		 * Eightbit green color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green: Type = _fromCode(Code.Green);
		/**
		 * Eightbit olive color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const olive: Type = _fromCode(Code.Olive);
		/**
		 * Eightbit navy color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navy: Type = _fromCode(Code.Navy);
		/**
		 * Eightbit purple_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple_1: Type = _fromCode(Code.Purple_1);
		/**
		 * Eightbit teal color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const teal: Type = _fromCode(Code.Teal);
		/**
		 * Eightbit silver color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const silver: Type = _fromCode(Code.Silver);
		/**
		 * Eightbit grey color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey: Type = _fromCode(Code.Grey);
		/**
		 * Eightbit red color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red: Type = _fromCode(Code.Red);
		/**
		 * Eightbit lime color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lime: Type = _fromCode(Code.Lime);
		/**
		 * Eightbit yellow color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow: Type = _fromCode(Code.Yellow);
		/**
		 * Eightbit blue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue: Type = _fromCode(Code.Blue);
		/**
		 * Eightbit fuchsia color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const fuchsia: Type = _fromCode(Code.Fuchsia);
		/**
		 * Eightbit aqua color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aqua: Type = _fromCode(Code.Aqua);
		/**
		 * Eightbit white color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const white: Type = _fromCode(Code.White);
		/**
		 * Eightbit grey0 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey0: Type = _fromCode(Code.Grey0);
		/**
		 * Eightbit navyBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navyBlue: Type = _fromCode(Code.NavyBlue);
		/**
		 * Eightbit darkBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkBlue: Type = _fromCode(Code.DarkBlue);
		/**
		 * Eightbit blue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue3_1: Type = _fromCode(Code.Blue3_1);
		/**
		 * Eightbit blue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue3_2: Type = _fromCode(Code.Blue3_2);
		/**
		 * Eightbit blue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue1: Type = _fromCode(Code.Blue1);
		/**
		 * Eightbit darkGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkGreen: Type = _fromCode(Code.DarkGreen);
		/**
		 * Eightbit deepSkyBlue4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue4_1: Type = _fromCode(Code.DeepSkyBlue4_1);
		/**
		 * Eightbit deepSkyBlue4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue4_2: Type = _fromCode(Code.DeepSkyBlue4_2);
		/**
		 * Eightbit deepSkyBlue4_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue4_3: Type = _fromCode(Code.DeepSkyBlue4_3);
		/**
		 * Eightbit dodgerBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const dodgerBlue3: Type = _fromCode(Code.DodgerBlue3);
		/**
		 * Eightbit dodgerBlue2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const dodgerBlue2: Type = _fromCode(Code.DodgerBlue2);
		/**
		 * Eightbit green4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green4: Type = _fromCode(Code.Green4);
		/**
		 * Eightbit springGreen4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen4: Type = _fromCode(Code.SpringGreen4);
		/**
		 * Eightbit turquoise4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const turquoise4: Type = _fromCode(Code.Turquoise4);
		/**
		 * Eightbit deepSkyBlue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue3_1: Type = _fromCode(Code.DeepSkyBlue3_1);
		/**
		 * Eightbit deepSkyBlue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue3_2: Type = _fromCode(Code.DeepSkyBlue3_2);
		/**
		 * Eightbit dodgerBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const dodgerBlue1: Type = _fromCode(Code.DodgerBlue1);
		/**
		 * Eightbit green3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green3_1: Type = _fromCode(Code.Green3_1);
		/**
		 * Eightbit springGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen3_1: Type = _fromCode(Code.SpringGreen3_1);
		/**
		 * Eightbit darkCyan color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkCyan: Type = _fromCode(Code.DarkCyan);
		/**
		 * Eightbit lightSeaGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSeaGreen: Type = _fromCode(Code.LightSeaGreen);
		/**
		 * Eightbit deepSkyBlue2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue2: Type = _fromCode(Code.DeepSkyBlue2);
		/**
		 * Eightbit deepSkyBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue1: Type = _fromCode(Code.DeepSkyBlue1);
		/**
		 * Eightbit green3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green3_2: Type = _fromCode(Code.Green3_2);
		/**
		 * Eightbit springGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen3_2: Type = _fromCode(Code.SpringGreen3_2);
		/**
		 * Eightbit springGreen2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen2_1: Type = _fromCode(Code.SpringGreen2_1);
		/**
		 * Eightbit cyan3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cyan3: Type = _fromCode(Code.Cyan3);
		/**
		 * Eightbit darkTurquoise color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkTurquoise: Type = _fromCode(Code.DarkTurquoise);
		/**
		 * Eightbit turquoise2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const turquoise2: Type = _fromCode(Code.Turquoise2);
		/**
		 * Eightbit green1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green1: Type = _fromCode(Code.Green1);
		/**
		 * Eightbit springGreen2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen2_2: Type = _fromCode(Code.SpringGreen2_2);
		/**
		 * Eightbit springGreen1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen1: Type = _fromCode(Code.SpringGreen1);
		/**
		 * Eightbit mediumSpringGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumSpringGreen: Type = _fromCode(Code.MediumSpringGreen);
		/**
		 * Eightbit cyan2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cyan2: Type = _fromCode(Code.Cyan2);
		/**
		 * Eightbit cyan1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cyan1: Type = _fromCode(Code.Cyan1);
		/**
		 * Eightbit darkRed_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkRed_1: Type = _fromCode(Code.DarkRed_1);
		/**
		 * Eightbit deepPink4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink4_1: Type = _fromCode(Code.DeepPink4_1);
		/**
		 * Eightbit purple4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple4_1: Type = _fromCode(Code.Purple4_1);
		/**
		 * Eightbit purple4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple4_2: Type = _fromCode(Code.Purple4_2);
		/**
		 * Eightbit purple3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple3: Type = _fromCode(Code.Purple3);
		/**
		 * Eightbit blueViolet color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blueViolet: Type = _fromCode(Code.BlueViolet);
		/**
		 * Eightbit orange4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange4_1: Type = _fromCode(Code.Orange4_1);
		/**
		 * Eightbit grey37 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey37: Type = _fromCode(Code.Grey37);
		/**
		 * Eightbit mediumPurple4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple4: Type = _fromCode(Code.MediumPurple4);
		/**
		 * Eightbit slateBlue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const slateBlue3_1: Type = _fromCode(Code.SlateBlue3_1);
		/**
		 * Eightbit slateBlue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const slateBlue3_2: Type = _fromCode(Code.SlateBlue3_2);
		/**
		 * Eightbit royalBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const royalBlue1: Type = _fromCode(Code.RoyalBlue1);
		/**
		 * Eightbit chartreuse4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse4: Type = _fromCode(Code.Chartreuse4);
		/**
		 * Eightbit darkSeaGreen4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen4_1: Type = _fromCode(Code.DarkSeaGreen4_1);
		/**
		 * Eightbit paleTurquoise4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleTurquoise4: Type = _fromCode(Code.PaleTurquoise4);
		/**
		 * Eightbit steelBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue: Type = _fromCode(Code.SteelBlue);
		/**
		 * Eightbit steelBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue3: Type = _fromCode(Code.SteelBlue3);
		/**
		 * Eightbit cornflowerBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cornflowerBlue: Type = _fromCode(Code.CornflowerBlue);
		/**
		 * Eightbit chartreuse3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse3_1: Type = _fromCode(Code.Chartreuse3_1);
		/**
		 * Eightbit darkSeaGreen4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen4_2: Type = _fromCode(Code.DarkSeaGreen4_2);
		/**
		 * Eightbit cadetBlue_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cadetBlue_1: Type = _fromCode(Code.CadetBlue_1);
		/**
		 * Eightbit cadetBlue_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cadetBlue_2: Type = _fromCode(Code.CadetBlue_2);
		/**
		 * Eightbit skyBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const skyBlue3: Type = _fromCode(Code.SkyBlue3);
		/**
		 * Eightbit steelBlue1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue1_1: Type = _fromCode(Code.SteelBlue1_1);
		/**
		 * Eightbit chartreuse3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse3_2: Type = _fromCode(Code.Chartreuse3_2);
		/**
		 * Eightbit paleGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen3_1: Type = _fromCode(Code.PaleGreen3_1);
		/**
		 * Eightbit seaGreen3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen3: Type = _fromCode(Code.SeaGreen3);
		/**
		 * Eightbit aquamarine3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aquamarine3: Type = _fromCode(Code.Aquamarine3);
		/**
		 * Eightbit mediumTurquoise color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumTurquoise: Type = _fromCode(Code.MediumTurquoise);
		/**
		 * Eightbit steelBlue1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue1_2: Type = _fromCode(Code.SteelBlue1_2);
		/**
		 * Eightbit chartreuse2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse2_1: Type = _fromCode(Code.Chartreuse2_1);
		/**
		 * Eightbit seaGreen2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen2: Type = _fromCode(Code.SeaGreen2);
		/**
		 * Eightbit seaGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen1_1: Type = _fromCode(Code.SeaGreen1_1);
		/**
		 * Eightbit seaGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen1_2: Type = _fromCode(Code.SeaGreen1_2);
		/**
		 * Eightbit aquamarine1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aquamarine1_1: Type = _fromCode(Code.Aquamarine1_1);
		/**
		 * Eightbit darkSlateGray2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSlateGray2: Type = _fromCode(Code.DarkSlateGray2);
		/**
		 * Eightbit darkRed_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkRed_2: Type = _fromCode(Code.DarkRed_2);
		/**
		 * Eightbit deepPink4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink4_2: Type = _fromCode(Code.DeepPink4_2);
		/**
		 * Eightbit darkMagenta_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkMagenta_1: Type = _fromCode(Code.DarkMagenta_1);
		/**
		 * Eightbit darkMagenta_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkMagenta_2: Type = _fromCode(Code.DarkMagenta_2);
		/**
		 * Eightbit darkViolet_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkViolet_1: Type = _fromCode(Code.DarkViolet_1);
		/**
		 * Eightbit purple_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple_2: Type = _fromCode(Code.Purple_2);
		/**
		 * Eightbit orange4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange4_2: Type = _fromCode(Code.Orange4_2);
		/**
		 * Eightbit lightPink4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightPink4: Type = _fromCode(Code.LightPink4);
		/**
		 * Eightbit plum4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum4: Type = _fromCode(Code.Plum4);
		/**
		 * Eightbit mediumPurple3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple3_1: Type = _fromCode(Code.MediumPurple3_1);
		/**
		 * Eightbit mediumPurple3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple3_2: Type = _fromCode(Code.MediumPurple3_2);
		/**
		 * Eightbit slateBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const slateBlue1: Type = _fromCode(Code.SlateBlue1);
		/**
		 * Eightbit yellow4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow4_1: Type = _fromCode(Code.Yellow4_1);
		/**
		 * Eightbit wheat4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const wheat4: Type = _fromCode(Code.Wheat4);
		/**
		 * Eightbit grey53 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey53: Type = _fromCode(Code.Grey53);
		/**
		 * Eightbit lightSlateGrey color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSlateGrey: Type = _fromCode(Code.LightSlateGrey);
		/**
		 * Eightbit mediumPurple color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple: Type = _fromCode(Code.MediumPurple);
		/**
		 * Eightbit lightSlateBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSlateBlue: Type = _fromCode(Code.LightSlateBlue);
		/**
		 * Eightbit yellow4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow4_2: Type = _fromCode(Code.Yellow4_2);
		/**
		 * Eightbit darkOliveGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen3_1: Type = _fromCode(Code.DarkOliveGreen3_1);
		/**
		 * Eightbit darkSeaGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen: Type = _fromCode(Code.DarkSeaGreen);
		/**
		 * Eightbit lightSkyBlue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSkyBlue3_1: Type = _fromCode(Code.LightSkyBlue3_1);
		/**
		 * Eightbit lightSkyBlue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSkyBlue3_2: Type = _fromCode(Code.LightSkyBlue3_2);
		/**
		 * Eightbit skyBlue2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const skyBlue2: Type = _fromCode(Code.SkyBlue2);
		/**
		 * Eightbit chartreuse2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse2_2: Type = _fromCode(Code.Chartreuse2_2);
		/**
		 * Eightbit darkOliveGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen3_2: Type = _fromCode(Code.DarkOliveGreen3_2);
		/**
		 * Eightbit paleGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen3_2: Type = _fromCode(Code.PaleGreen3_2);
		/**
		 * Eightbit darkSeaGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen3_1: Type = _fromCode(Code.DarkSeaGreen3_1);
		/**
		 * Eightbit darkSlateGray3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSlateGray3: Type = _fromCode(Code.DarkSlateGray3);
		/**
		 * Eightbit skyBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const skyBlue1: Type = _fromCode(Code.SkyBlue1);
		/**
		 * Eightbit chartreuse1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse1: Type = _fromCode(Code.Chartreuse1);
		/**
		 * Eightbit lightGreen_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGreen_1: Type = _fromCode(Code.LightGreen_1);
		/**
		 * Eightbit lightGreen_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGreen_2: Type = _fromCode(Code.LightGreen_2);
		/**
		 * Eightbit paleGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen1_1: Type = _fromCode(Code.PaleGreen1_1);
		/**
		 * Eightbit aquamarine1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aquamarine1_2: Type = _fromCode(Code.Aquamarine1_2);
		/**
		 * Eightbit darkSlateGray1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSlateGray1: Type = _fromCode(Code.DarkSlateGray1);
		/**
		 * Eightbit red3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red3_1: Type = _fromCode(Code.Red3_1);
		/**
		 * Eightbit deepPink4_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink4_3: Type = _fromCode(Code.DeepPink4_3);
		/**
		 * Eightbit mediumVioletRed color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumVioletRed: Type = _fromCode(Code.MediumVioletRed);
		/**
		 * Eightbit magenta3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta3_1: Type = _fromCode(Code.Magenta3_1);
		/**
		 * Eightbit darkViolet_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkViolet_2: Type = _fromCode(Code.DarkViolet_2);
		/**
		 * Eightbit purple_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple_3: Type = _fromCode(Code.Purple_3);
		/**
		 * Eightbit darkOrange3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOrange3_1: Type = _fromCode(Code.DarkOrange3_1);
		/**
		 * Eightbit indianRed_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed_1: Type = _fromCode(Code.IndianRed_1);
		/**
		 * Eightbit hotPink3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink3_1: Type = _fromCode(Code.HotPink3_1);
		/**
		 * Eightbit mediumOrchid3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid3: Type = _fromCode(Code.MediumOrchid3);
		/**
		 * Eightbit mediumOrchid color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid: Type = _fromCode(Code.MediumOrchid);
		/**
		 * Eightbit mediumPurple2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple2_1: Type = _fromCode(Code.MediumPurple2_1);
		/**
		 * Eightbit darkGoldenrod color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkGoldenrod: Type = _fromCode(Code.DarkGoldenrod);
		/**
		 * Eightbit lightSalmon3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSalmon3_1: Type = _fromCode(Code.LightSalmon3_1);
		/**
		 * Eightbit rosyBrown color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const rosyBrown: Type = _fromCode(Code.RosyBrown);
		/**
		 * Eightbit grey63 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey63: Type = _fromCode(Code.Grey63);
		/**
		 * Eightbit mediumPurple2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple2_2: Type = _fromCode(Code.MediumPurple2_2);
		/**
		 * Eightbit mediumPurple1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple1: Type = _fromCode(Code.MediumPurple1);
		/**
		 * Eightbit gold3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const gold3_1: Type = _fromCode(Code.Gold3_1);
		/**
		 * Eightbit darkKhaki color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkKhaki: Type = _fromCode(Code.DarkKhaki);
		/**
		 * Eightbit navajoWhite3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navajoWhite3: Type = _fromCode(Code.NavajoWhite3);
		/**
		 * Eightbit grey69 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey69: Type = _fromCode(Code.Grey69);
		/**
		 * Eightbit lightSteelBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSteelBlue3: Type = _fromCode(Code.LightSteelBlue3);
		/**
		 * Eightbit lightSteelBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSteelBlue: Type = _fromCode(Code.LightSteelBlue);
		/**
		 * Eightbit yellow3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow3_1: Type = _fromCode(Code.Yellow3_1);
		/**
		 * Eightbit darkOliveGreen3_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen3_3: Type = _fromCode(Code.DarkOliveGreen3_3);
		/**
		 * Eightbit darkSeaGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen3_2: Type = _fromCode(Code.DarkSeaGreen3_2);
		/**
		 * Eightbit darkSeaGreen2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen2_1: Type = _fromCode(Code.DarkSeaGreen2_1);
		/**
		 * Eightbit lightCyan3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightCyan3: Type = _fromCode(Code.LightCyan3);
		/**
		 * Eightbit lightSkyBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSkyBlue1: Type = _fromCode(Code.LightSkyBlue1);
		/**
		 * Eightbit greenYellow color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const greenYellow: Type = _fromCode(Code.GreenYellow);
		/**
		 * Eightbit darkOliveGreen2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen2: Type = _fromCode(Code.DarkOliveGreen2);
		/**
		 * Eightbit paleGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen1_2: Type = _fromCode(Code.PaleGreen1_2);
		/**
		 * Eightbit darkSeaGreen2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen2_2: Type = _fromCode(Code.DarkSeaGreen2_2);
		/**
		 * Eightbit darkSeaGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen1_1: Type = _fromCode(Code.DarkSeaGreen1_1);
		/**
		 * Eightbit paleTurquoise1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleTurquoise1: Type = _fromCode(Code.PaleTurquoise1);
		/**
		 * Eightbit red3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red3_2: Type = _fromCode(Code.Red3_2);
		/**
		 * Eightbit deepPink3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink3_1: Type = _fromCode(Code.DeepPink3_1);
		/**
		 * Eightbit deepPink3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink3_2: Type = _fromCode(Code.DeepPink3_2);
		/**
		 * Eightbit magenta3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta3_2: Type = _fromCode(Code.Magenta3_2);
		/**
		 * Eightbit magenta3_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta3_3: Type = _fromCode(Code.Magenta3_3);
		/**
		 * Eightbit magenta2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta2_1: Type = _fromCode(Code.Magenta2_1);
		/**
		 * Eightbit darkOrange3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOrange3_2: Type = _fromCode(Code.DarkOrange3_2);
		/**
		 * Eightbit indianRed_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed_2: Type = _fromCode(Code.IndianRed_2);
		/**
		 * Eightbit hotPink3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink3_2: Type = _fromCode(Code.HotPink3_2);
		/**
		 * Eightbit hotPink2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink2: Type = _fromCode(Code.HotPink2);
		/**
		 * Eightbit orchid color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orchid: Type = _fromCode(Code.Orchid);
		/**
		 * Eightbit mediumOrchid1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid1_1: Type = _fromCode(Code.MediumOrchid1_1);
		/**
		 * Eightbit orange3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange3: Type = _fromCode(Code.Orange3);
		/**
		 * Eightbit lightSalmon3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSalmon3_2: Type = _fromCode(Code.LightSalmon3_2);
		/**
		 * Eightbit lightPink3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightPink3: Type = _fromCode(Code.LightPink3);
		/**
		 * Eightbit pink3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const pink3: Type = _fromCode(Code.Pink3);
		/**
		 * Eightbit plum3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum3: Type = _fromCode(Code.Plum3);
		/**
		 * Eightbit violet color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const violet: Type = _fromCode(Code.Violet);
		/**
		 * Eightbit gold3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const gold3_2: Type = _fromCode(Code.Gold3_2);
		/**
		 * Eightbit lightGoldenrod3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod3: Type = _fromCode(Code.LightGoldenrod3);
		/**
		 * Eightbit tan color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const tan: Type = _fromCode(Code.Tan);
		/**
		 * Eightbit mistyRose3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mistyRose3: Type = _fromCode(Code.MistyRose3);
		/**
		 * Eightbit thistle3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const thistle3: Type = _fromCode(Code.Thistle3);
		/**
		 * Eightbit plum2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum2: Type = _fromCode(Code.Plum2);
		/**
		 * Eightbit yellow3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow3_2: Type = _fromCode(Code.Yellow3_2);
		/**
		 * Eightbit khaki3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const khaki3: Type = _fromCode(Code.Khaki3);
		/**
		 * Eightbit lightGoldenrod2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod2_1: Type = _fromCode(Code.LightGoldenrod2_1);
		/**
		 * Eightbit lightYellow3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightYellow3: Type = _fromCode(Code.LightYellow3);
		/**
		 * Eightbit grey84 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey84: Type = _fromCode(Code.Grey84);
		/**
		 * Eightbit lightSteelBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSteelBlue1: Type = _fromCode(Code.LightSteelBlue1);
		/**
		 * Eightbit yellow2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow2: Type = _fromCode(Code.Yellow2);
		/**
		 * Eightbit darkOliveGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen1_1: Type = _fromCode(Code.DarkOliveGreen1_1);
		/**
		 * Eightbit darkOliveGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen1_2: Type = _fromCode(Code.DarkOliveGreen1_2);
		/**
		 * Eightbit darkSeaGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen1_2: Type = _fromCode(Code.DarkSeaGreen1_2);
		/**
		 * Eightbit honeydew2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const honeydew2: Type = _fromCode(Code.Honeydew2);
		/**
		 * Eightbit lightCyan1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightCyan1: Type = _fromCode(Code.LightCyan1);
		/**
		 * Eightbit red1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red1: Type = _fromCode(Code.Red1);
		/**
		 * Eightbit deepPink2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink2: Type = _fromCode(Code.DeepPink2);
		/**
		 * Eightbit deepPink1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink1_1: Type = _fromCode(Code.DeepPink1_1);
		/**
		 * Eightbit deepPink1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink1_2: Type = _fromCode(Code.DeepPink1_2);
		/**
		 * Eightbit magenta2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta2_2: Type = _fromCode(Code.Magenta2_2);
		/**
		 * Eightbit magenta1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta1: Type = _fromCode(Code.Magenta1);
		/**
		 * Eightbit orangeRed1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orangeRed1: Type = _fromCode(Code.OrangeRed1);
		/**
		 * Eightbit indianRed1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed1_1: Type = _fromCode(Code.IndianRed1_1);
		/**
		 * Eightbit indianRed1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed1_2: Type = _fromCode(Code.IndianRed1_2);
		/**
		 * Eightbit hotPink_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink_1: Type = _fromCode(Code.HotPink_1);
		/**
		 * Eightbit hotPink_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink_2: Type = _fromCode(Code.HotPink_2);
		/**
		 * Eightbit mediumOrchid1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid1_2: Type = _fromCode(Code.MediumOrchid1_2);
		/**
		 * Eightbit darkOrange color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOrange: Type = _fromCode(Code.DarkOrange);
		/**
		 * Eightbit salmon1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const salmon1: Type = _fromCode(Code.Salmon1);
		/**
		 * Eightbit lightCoral color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightCoral: Type = _fromCode(Code.LightCoral);
		/**
		 * Eightbit paleVioletRed1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleVioletRed1: Type = _fromCode(Code.PaleVioletRed1);
		/**
		 * Eightbit orchid2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orchid2: Type = _fromCode(Code.Orchid2);
		/**
		 * Eightbit orchid1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orchid1: Type = _fromCode(Code.Orchid1);
		/**
		 * Eightbit orange1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange1: Type = _fromCode(Code.Orange1);
		/**
		 * Eightbit sandyBrown color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const sandyBrown: Type = _fromCode(Code.SandyBrown);
		/**
		 * Eightbit lightSalmon1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSalmon1: Type = _fromCode(Code.LightSalmon1);
		/**
		 * Eightbit lightPink1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightPink1: Type = _fromCode(Code.LightPink1);
		/**
		 * Eightbit pink1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const pink1: Type = _fromCode(Code.Pink1);
		/**
		 * Eightbit plum1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum1: Type = _fromCode(Code.Plum1);
		/**
		 * Eightbit gold1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const gold1: Type = _fromCode(Code.Gold1);
		/**
		 * Eightbit lightGoldenrod2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod2_2: Type = _fromCode(Code.LightGoldenrod2_2);
		/**
		 * Eightbit lightGoldenrod2_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod2_3: Type = _fromCode(Code.LightGoldenrod2_3);
		/**
		 * Eightbit navajoWhite1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navajoWhite1: Type = _fromCode(Code.NavajoWhite1);
		/**
		 * Eightbit mistyRose1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mistyRose1: Type = _fromCode(Code.MistyRose1);
		/**
		 * Eightbit thistle1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const thistle1: Type = _fromCode(Code.Thistle1);
		/**
		 * Eightbit yellow1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow1: Type = _fromCode(Code.Yellow1);
		/**
		 * Eightbit lightGoldenrod1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod1: Type = _fromCode(Code.LightGoldenrod1);
		/**
		 * Eightbit khaki1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const khaki1: Type = _fromCode(Code.Khaki1);
		/**
		 * Eightbit wheat1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const wheat1: Type = _fromCode(Code.Wheat1);
		/**
		 * Eightbit cornsilk1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cornsilk1: Type = _fromCode(Code.Cornsilk1);
		/**
		 * Eightbit grey100 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey100: Type = _fromCode(Code.Grey100);
		/**
		 * Eightbit grey3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey3: Type = _fromCode(Code.Grey3);
		/**
		 * Eightbit grey7 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey7: Type = _fromCode(Code.Grey7);
		/**
		 * Eightbit grey11 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey11: Type = _fromCode(Code.Grey11);
		/**
		 * Eightbit grey15 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey15: Type = _fromCode(Code.Grey15);
		/**
		 * Eightbit grey19 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey19: Type = _fromCode(Code.Grey19);
		/**
		 * Eightbit grey23 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey23: Type = _fromCode(Code.Grey23);
		/**
		 * Eightbit grey27 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey27: Type = _fromCode(Code.Grey27);
		/**
		 * Eightbit grey30 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey30: Type = _fromCode(Code.Grey30);
		/**
		 * Eightbit grey35 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey35: Type = _fromCode(Code.Grey35);
		/**
		 * Eightbit grey39 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey39: Type = _fromCode(Code.Grey39);
		/**
		 * Eightbit grey42 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey42: Type = _fromCode(Code.Grey42);
		/**
		 * Eightbit grey46 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey46: Type = _fromCode(Code.Grey46);
		/**
		 * Eightbit grey50 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey50: Type = _fromCode(Code.Grey50);
		/**
		 * Eightbit grey54 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey54: Type = _fromCode(Code.Grey54);
		/**
		 * Eightbit grey58 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey58: Type = _fromCode(Code.Grey58);
		/**
		 * Eightbit grey62 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey62: Type = _fromCode(Code.Grey62);
		/**
		 * Eightbit grey66 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey66: Type = _fromCode(Code.Grey66);
		/**
		 * Eightbit grey70 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey70: Type = _fromCode(Code.Grey70);
		/**
		 * Eightbit grey74 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey74: Type = _fromCode(Code.Grey74);
		/**
		 * Eightbit grey78 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey78: Type = _fromCode(Code.Grey78);
		/**
		 * Eightbit grey82 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey82: Type = _fromCode(Code.Grey82);
		/**
		 * Eightbit grey85 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey85: Type = _fromCode(Code.Grey85);
		/**
		 * Eightbit grey89 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey89: Type = _fromCode(Code.Grey89);
		/**
		 * Eightbit grey93 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey93: Type = _fromCode(Code.Grey93);
	}

	/**
	 * Namespace for RGB colors
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace RGB {
		/** Constructor */
		const _fromCodes = ({
			id,
			redCode,
			greenCode,
			blueCode
		}: {
			readonly id: string;
			readonly redCode: number;
			readonly greenCode: number;
			readonly blueCode: number;
		}): Type =>
			_fromSequence({
				id,
				fgSequence: Array.make(38, 2, redCode, greenCode, blueCode)
			});

		/**
		 * Constructor
		 *
		 * @since 0.0.1
		 * @category Construtors
		 */
		export const make = ({
			red,
			green,
			blue
		}: {
			readonly red: number;
			readonly green: number;
			readonly blue: number;
		}): Type =>
			_fromCodes({
				id: `RGB/${red}/${green}/${blue}`,
				redCode: pipe(red, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 })),
				greenCode: pipe(green, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 })),
				blueCode: pipe(blue, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 }))
			});

		/**
		 * RGB maroon color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const maroon: Type = _fromCodes({
			id: 'RGBMaroon',
			redCode: 128,
			greenCode: 0,
			blueCode: 0
		});
		/**
		 * RGB darkRed color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkRed: Type = _fromCodes({
			id: 'RGBDarkRed',
			redCode: 139,
			greenCode: 0,
			blueCode: 0
		});
		/**
		 * RGB brown color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const brown: Type = _fromCodes({
			id: 'RGBBrown',
			redCode: 165,
			greenCode: 42,
			blueCode: 42
		});
		/**
		 * RGB firebrick color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const firebrick: Type = _fromCodes({
			id: 'RGBFirebrick',
			redCode: 178,
			greenCode: 34,
			blueCode: 34
		});
		/**
		 * RGB crimson color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const crimson: Type = _fromCodes({
			id: 'RGBCrimson',
			redCode: 220,
			greenCode: 20,
			blueCode: 60
		});
		/**
		 * RGB red color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const red: Type = _fromCodes({
			id: 'RGBRed',
			redCode: 255,
			greenCode: 0,
			blueCode: 0
		});
		/**
		 * RGB tomato color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const tomato: Type = _fromCodes({
			id: 'RGBTomato',
			redCode: 255,
			greenCode: 99,
			blueCode: 71
		});
		/**
		 * RGB coral color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const coral: Type = _fromCodes({
			id: 'RGBCoral',
			redCode: 255,
			greenCode: 127,
			blueCode: 80
		});
		/**
		 * RGB indianRed color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const indianRed: Type = _fromCodes({
			id: 'RGBIndianRed',
			redCode: 205,
			greenCode: 92,
			blueCode: 92
		});
		/**
		 * RGB lightCoral color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightCoral: Type = _fromCodes({
			id: 'RGBLightCoral',
			redCode: 240,
			greenCode: 128,
			blueCode: 128
		});
		/**
		 * RGB darkSalmon color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkSalmon: Type = _fromCodes({
			id: 'RGBDarkSalmon',
			redCode: 233,
			greenCode: 150,
			blueCode: 122
		});
		/**
		 * RGB salmon color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const salmon: Type = _fromCodes({
			id: 'RGBSalmon',
			redCode: 250,
			greenCode: 128,
			blueCode: 114
		});
		/**
		 * RGB lightSalmon color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightSalmon: Type = _fromCodes({
			id: 'RGBLightSalmon',
			redCode: 255,
			greenCode: 160,
			blueCode: 122
		});
		/**
		 * RGB orangeRed color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const orangeRed: Type = _fromCodes({
			id: 'RGBOrangeRed',
			redCode: 255,
			greenCode: 69,
			blueCode: 0
		});
		/**
		 * RGB darkOrange color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkOrange: Type = _fromCodes({
			id: 'RGBDarkOrange',
			redCode: 255,
			greenCode: 140,
			blueCode: 0
		});
		/**
		 * RGB orange color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const orange: Type = _fromCodes({
			id: 'RGBOrange',
			redCode: 255,
			greenCode: 165,
			blueCode: 0
		});
		/**
		 * RGB gold color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const gold: Type = _fromCodes({
			id: 'RGBGold',
			redCode: 255,
			greenCode: 215,
			blueCode: 0
		});
		/**
		 * RGB darkGoldenRod color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkGoldenRod: Type = _fromCodes({
			id: 'RGBDarkGoldenRod',
			redCode: 184,
			greenCode: 134,
			blueCode: 11
		});
		/**
		 * RGB goldenRod color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const goldenRod: Type = _fromCodes({
			id: 'RGBGoldenRod',
			redCode: 218,
			greenCode: 165,
			blueCode: 32
		});
		/**
		 * RGB paleGoldenRod color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const paleGoldenRod: Type = _fromCodes({
			id: 'RGBPaleGoldenRod',
			redCode: 238,
			greenCode: 232,
			blueCode: 170
		});
		/**
		 * RGB darkKhaki color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkKhaki: Type = _fromCodes({
			id: 'RGBDarkKhaki',
			redCode: 189,
			greenCode: 183,
			blueCode: 107
		});
		/**
		 * RGB khaki color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const khaki: Type = _fromCodes({
			id: 'RGBKhaki',
			redCode: 240,
			greenCode: 230,
			blueCode: 140
		});
		/**
		 * RGB olive color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const olive: Type = _fromCodes({
			id: 'RGBOlive',
			redCode: 128,
			greenCode: 128,
			blueCode: 0
		});
		/**
		 * RGB yellow color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const yellow: Type = _fromCodes({
			id: 'RGBYellow',
			redCode: 255,
			greenCode: 255,
			blueCode: 0
		});
		/**
		 * RGB yellowGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const yellowGreen: Type = _fromCodes({
			id: 'RGBYellowGreen',
			redCode: 154,
			greenCode: 205,
			blueCode: 50
		});
		/**
		 * RGB darkOliveGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkOliveGreen: Type = _fromCodes({
			id: 'RGBDarkOliveGreen',
			redCode: 85,
			greenCode: 107,
			blueCode: 47
		});
		/**
		 * RGB oliveDrab color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const oliveDrab: Type = _fromCodes({
			id: 'RGBOliveDrab',
			redCode: 107,
			greenCode: 142,
			blueCode: 35
		});
		/**
		 * RGB lawnGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lawnGreen: Type = _fromCodes({
			id: 'RGBLawnGreen',
			redCode: 124,
			greenCode: 252,
			blueCode: 0
		});
		/**
		 * RGB chartreuse color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const chartreuse: Type = _fromCodes({
			id: 'RGBChartreuse',
			redCode: 127,
			greenCode: 255,
			blueCode: 0
		});
		/**
		 * RGB greenYellow color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const greenYellow: Type = _fromCodes({
			id: 'RGBGreenYellow',
			redCode: 173,
			greenCode: 255,
			blueCode: 47
		});
		/**
		 * RGB darkGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkGreen: Type = _fromCodes({
			id: 'RGBDarkGreen',
			redCode: 0,
			greenCode: 100,
			blueCode: 0
		});
		/**
		 * RGB green color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const green: Type = _fromCodes({
			id: 'RGBGreen',
			redCode: 0,
			greenCode: 128,
			blueCode: 0
		});
		/**
		 * RGB forestGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const forestGreen: Type = _fromCodes({
			id: 'RGBForestGreen',
			redCode: 34,
			greenCode: 139,
			blueCode: 34
		});
		/**
		 * RGB lime color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lime: Type = _fromCodes({
			id: 'RGBLime',
			redCode: 0,
			greenCode: 255,
			blueCode: 0
		});
		/**
		 * RGB limeGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const limeGreen: Type = _fromCodes({
			id: 'RGBLimeGreen',
			redCode: 50,
			greenCode: 205,
			blueCode: 50
		});
		/**
		 * RGB lightGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightGreen: Type = _fromCodes({
			id: 'RGBLightGreen',
			redCode: 144,
			greenCode: 238,
			blueCode: 144
		});
		/**
		 * RGB paleGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const paleGreen: Type = _fromCodes({
			id: 'RGBPaleGreen',
			redCode: 152,
			greenCode: 251,
			blueCode: 152
		});
		/**
		 * RGB darkSeaGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkSeaGreen: Type = _fromCodes({
			id: 'RGBDarkSeaGreen',
			redCode: 143,
			greenCode: 188,
			blueCode: 143
		});
		/**
		 * RGB mediumSpringGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mediumSpringGreen: Type = _fromCodes({
			id: 'RGBMediumSpringGreen',
			redCode: 0,
			greenCode: 250,
			blueCode: 154
		});
		/**
		 * RGB springGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const springGreen: Type = _fromCodes({
			id: 'RGBSpringGreen',
			redCode: 0,
			greenCode: 255,
			blueCode: 127
		});
		/**
		 * RGB seaGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const seaGreen: Type = _fromCodes({
			id: 'RGBSeaGreen',
			redCode: 46,
			greenCode: 139,
			blueCode: 87
		});
		/**
		 * RGB mediumAquaMarine color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mediumAquaMarine: Type = _fromCodes({
			id: 'RGBMediumAquaMarine',
			redCode: 102,
			greenCode: 205,
			blueCode: 170
		});
		/**
		 * RGB mediumSeaGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mediumSeaGreen: Type = _fromCodes({
			id: 'RGBMediumSeaGreen',
			redCode: 60,
			greenCode: 179,
			blueCode: 113
		});
		/**
		 * RGB lightSeaGreen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightSeaGreen: Type = _fromCodes({
			id: 'RGBLightSeaGreen',
			redCode: 32,
			greenCode: 178,
			blueCode: 170
		});
		/**
		 * RGB darkSlateGray color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkSlateGray: Type = _fromCodes({
			id: 'RGBDarkSlateGray',
			redCode: 47,
			greenCode: 79,
			blueCode: 79
		});
		/**
		 * RGB teal color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const teal: Type = _fromCodes({
			id: 'RGBTeal',
			redCode: 0,
			greenCode: 128,
			blueCode: 128
		});
		/**
		 * RGB darkCyan color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkCyan: Type = _fromCodes({
			id: 'RGBDarkCyan',
			redCode: 0,
			greenCode: 139,
			blueCode: 139
		});
		/**
		 * RGB aqua color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const aqua: Type = _fromCodes({
			id: 'RGBAqua',
			redCode: 0,
			greenCode: 255,
			blueCode: 255
		});
		/**
		 * RGB cyan color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const cyan: Type = _fromCodes({
			id: 'RGBCyan',
			redCode: 0,
			greenCode: 255,
			blueCode: 255
		});
		/**
		 * RGB lightCyan color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightCyan: Type = _fromCodes({
			id: 'RGBLightCyan',
			redCode: 224,
			greenCode: 255,
			blueCode: 255
		});
		/**
		 * RGB darkTurquoise color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkTurquoise: Type = _fromCodes({
			id: 'RGBDarkTurquoise',
			redCode: 0,
			greenCode: 206,
			blueCode: 209
		});
		/**
		 * RGB turquoise color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const turquoise: Type = _fromCodes({
			id: 'RGBTurquoise',
			redCode: 64,
			greenCode: 224,
			blueCode: 208
		});
		/**
		 * RGB mediumTurquoise color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mediumTurquoise: Type = _fromCodes({
			id: 'RGBMediumTurquoise',
			redCode: 72,
			greenCode: 209,
			blueCode: 204
		});
		/**
		 * RGB paleTurquoise color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const paleTurquoise: Type = _fromCodes({
			id: 'RGBPaleTurquoise',
			redCode: 175,
			greenCode: 238,
			blueCode: 238
		});
		/**
		 * RGB aquaMarine color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const aquaMarine: Type = _fromCodes({
			id: 'RGBAquaMarine',
			redCode: 127,
			greenCode: 255,
			blueCode: 212
		});
		/**
		 * RGB powderBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const powderBlue: Type = _fromCodes({
			id: 'RGBPowderBlue',
			redCode: 176,
			greenCode: 224,
			blueCode: 230
		});
		/**
		 * RGB cadetBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const cadetBlue: Type = _fromCodes({
			id: 'RGBCadetBlue',
			redCode: 95,
			greenCode: 158,
			blueCode: 160
		});
		/**
		 * RGB steelBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const steelBlue: Type = _fromCodes({
			id: 'RGBSteelBlue',
			redCode: 70,
			greenCode: 130,
			blueCode: 180
		});
		/**
		 * RGB cornFlowerBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const cornFlowerBlue: Type = _fromCodes({
			id: 'RGBCornFlowerBlue',
			redCode: 100,
			greenCode: 149,
			blueCode: 237
		});
		/**
		 * RGB deepSkyBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const deepSkyBlue: Type = _fromCodes({
			id: 'RGBDeepSkyBlue',
			redCode: 0,
			greenCode: 191,
			blueCode: 255
		});
		/**
		 * RGB dodgerBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const dodgerBlue: Type = _fromCodes({
			id: 'RGBDodgerBlue',
			redCode: 30,
			greenCode: 144,
			blueCode: 255
		});
		/**
		 * RGB lightBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightBlue: Type = _fromCodes({
			id: 'RGBLightBlue',
			redCode: 173,
			greenCode: 216,
			blueCode: 230
		});
		/**
		 * RGB skyBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const skyBlue: Type = _fromCodes({
			id: 'RGBSkyBlue',
			redCode: 135,
			greenCode: 206,
			blueCode: 235
		});
		/**
		 * RGB lightSkyBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightSkyBlue: Type = _fromCodes({
			id: 'RGBLightSkyBlue',
			redCode: 135,
			greenCode: 206,
			blueCode: 250
		});
		/**
		 * RGB midnightBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const midnightBlue: Type = _fromCodes({
			id: 'RGBMidnightBlue',
			redCode: 25,
			greenCode: 25,
			blueCode: 112
		});
		/**
		 * RGB navy color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const navy: Type = _fromCodes({
			id: 'RGBNavy',
			redCode: 0,
			greenCode: 0,
			blueCode: 128
		});
		/**
		 * RGB darkBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkBlue: Type = _fromCodes({
			id: 'RGBDarkBlue',
			redCode: 0,
			greenCode: 0,
			blueCode: 139
		});
		/**
		 * RGB mediumBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mediumBlue: Type = _fromCodes({
			id: 'RGBMediumBlue',
			redCode: 0,
			greenCode: 0,
			blueCode: 205
		});
		/**
		 * RGB blue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const blue: Type = _fromCodes({
			id: 'RGBBlue',
			redCode: 0,
			greenCode: 0,
			blueCode: 255
		});
		/**
		 * RGB royalBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const royalBlue: Type = _fromCodes({
			id: 'RGBRoyalBlue',
			redCode: 65,
			greenCode: 105,
			blueCode: 225
		});
		/**
		 * RGB blueViolet color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const blueViolet: Type = _fromCodes({
			id: 'RGBBlueViolet',
			redCode: 138,
			greenCode: 43,
			blueCode: 226
		});
		/**
		 * RGB indigo color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const indigo: Type = _fromCodes({
			id: 'RGBIndigo',
			redCode: 75,
			greenCode: 0,
			blueCode: 130
		});
		/**
		 * RGB darkSlateBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkSlateBlue: Type = _fromCodes({
			id: 'RGBDarkSlateBlue',
			redCode: 72,
			greenCode: 61,
			blueCode: 139
		});
		/**
		 * RGB slateBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const slateBlue: Type = _fromCodes({
			id: 'RGBSlateBlue',
			redCode: 106,
			greenCode: 90,
			blueCode: 205
		});
		/**
		 * RGB mediumSlateBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mediumSlateBlue: Type = _fromCodes({
			id: 'RGBMediumSlateBlue',
			redCode: 123,
			greenCode: 104,
			blueCode: 238
		});
		/**
		 * RGB mediumPurple color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mediumPurple: Type = _fromCodes({
			id: 'RGBMediumPurple',
			redCode: 147,
			greenCode: 112,
			blueCode: 219
		});
		/**
		 * RGB darkMagenta color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkMagenta: Type = _fromCodes({
			id: 'RGBDarkMagenta',
			redCode: 139,
			greenCode: 0,
			blueCode: 139
		});
		/**
		 * RGB darkViolet color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkViolet: Type = _fromCodes({
			id: 'RGBDarkViolet',
			redCode: 148,
			greenCode: 0,
			blueCode: 211
		});
		/**
		 * RGB darkOrchid color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkOrchid: Type = _fromCodes({
			id: 'RGBDarkOrchid',
			redCode: 153,
			greenCode: 50,
			blueCode: 204
		});
		/**
		 * RGB mediumOrchid2 color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mediumOrchid2: Type = _fromCodes({
			id: 'RGBMediumOrchid2',
			redCode: 186,
			greenCode: 85,
			blueCode: 211
		});
		/**
		 * RGB purple color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const purple: Type = _fromCodes({
			id: 'RGBPurple',
			redCode: 128,
			greenCode: 0,
			blueCode: 128
		});
		/**
		 * RGB thistle color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const thistle: Type = _fromCodes({
			id: 'RGBThistle',
			redCode: 216,
			greenCode: 191,
			blueCode: 216
		});
		/**
		 * RGB plum color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const plum: Type = _fromCodes({
			id: 'RGBPlum',
			redCode: 221,
			greenCode: 160,
			blueCode: 221
		});
		/**
		 * RGB violet color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const violet: Type = _fromCodes({
			id: 'RGBViolet',
			redCode: 238,
			greenCode: 130,
			blueCode: 238
		});
		/**
		 * RGB magenta color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const magenta: Type = _fromCodes({
			id: 'RGBMagenta',
			redCode: 255,
			greenCode: 0,
			blueCode: 255
		});
		/**
		 * RGB orchid color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const orchid: Type = _fromCodes({
			id: 'RGBOrchid',
			redCode: 218,
			greenCode: 112,
			blueCode: 214
		});
		/**
		 * RGB mediumVioletRed color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mediumVioletRed: Type = _fromCodes({
			id: 'RGBMediumVioletRed',
			redCode: 199,
			greenCode: 21,
			blueCode: 133
		});
		/**
		 * RGB paleVioletRed color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const paleVioletRed: Type = _fromCodes({
			id: 'RGBPaleVioletRed',
			redCode: 219,
			greenCode: 112,
			blueCode: 147
		});
		/**
		 * RGB deepPink color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const deepPink: Type = _fromCodes({
			id: 'RGBDeepPink',
			redCode: 255,
			greenCode: 20,
			blueCode: 147
		});
		/**
		 * RGB hotPink color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const hotPink: Type = _fromCodes({
			id: 'RGBHotPink',
			redCode: 255,
			greenCode: 105,
			blueCode: 180
		});
		/**
		 * RGB lightPink color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightPink: Type = _fromCodes({
			id: 'RGBLightPink',
			redCode: 255,
			greenCode: 182,
			blueCode: 193
		});
		/**
		 * RGB pink color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const pink: Type = _fromCodes({
			id: 'RGBPink',
			redCode: 255,
			greenCode: 192,
			blueCode: 203
		});
		/**
		 * RGB antiqueWhite color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const antiqueWhite: Type = _fromCodes({
			id: 'RGBAntiqueWhite',
			redCode: 250,
			greenCode: 235,
			blueCode: 215
		});
		/**
		 * RGB beige color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const beige: Type = _fromCodes({
			id: 'RGBBeige',
			redCode: 245,
			greenCode: 245,
			blueCode: 220
		});
		/**
		 * RGB bisque color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const bisque: Type = _fromCodes({
			id: 'RGBBisque',
			redCode: 255,
			greenCode: 228,
			blueCode: 196
		});
		/**
		 * RGB blanchedAlmond color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const blanchedAlmond: Type = _fromCodes({
			id: 'RGBBlanchedAlmond',
			redCode: 255,
			greenCode: 235,
			blueCode: 205
		});
		/**
		 * RGB wheat color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const wheat: Type = _fromCodes({
			id: 'RGBWheat',
			redCode: 245,
			greenCode: 222,
			blueCode: 179
		});
		/**
		 * RGB cornSilk color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const cornSilk: Type = _fromCodes({
			id: 'RGBCornSilk',
			redCode: 255,
			greenCode: 248,
			blueCode: 220
		});
		/**
		 * RGB lemonChiffon color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lemonChiffon: Type = _fromCodes({
			id: 'RGBLemonChiffon',
			redCode: 255,
			greenCode: 250,
			blueCode: 205
		});
		/**
		 * RGB lightGoldenRodYellow color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightGoldenRodYellow: Type = _fromCodes({
			id: 'RGBLightGoldenRodYellow',
			redCode: 250,
			greenCode: 250,
			blueCode: 210
		});
		/**
		 * RGB lightYellow color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightYellow: Type = _fromCodes({
			id: 'RGBLightYellow',
			redCode: 255,
			greenCode: 255,
			blueCode: 224
		});
		/**
		 * RGB saddleBrown color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const saddleBrown: Type = _fromCodes({
			id: 'RGBSaddleBrown',
			redCode: 139,
			greenCode: 69,
			blueCode: 19
		});
		/**
		 * RGB sienna color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const sienna: Type = _fromCodes({
			id: 'RGBSienna',
			redCode: 160,
			greenCode: 82,
			blueCode: 45
		});
		/**
		 * RGB chocolate color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const chocolate: Type = _fromCodes({
			id: 'RGBChocolate',
			redCode: 210,
			greenCode: 105,
			blueCode: 30
		});
		/**
		 * RGB peru color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const peru: Type = _fromCodes({
			id: 'RGBPeru',
			redCode: 205,
			greenCode: 133,
			blueCode: 63
		});
		/**
		 * RGB sandyBrown color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const sandyBrown: Type = _fromCodes({
			id: 'RGBSandyBrown',
			redCode: 244,
			greenCode: 164,
			blueCode: 96
		});
		/**
		 * RGB burlyWood color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const burlyWood: Type = _fromCodes({
			id: 'RGBBurlyWood',
			redCode: 222,
			greenCode: 184,
			blueCode: 135
		});
		/**
		 * RGB tan color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const tan: Type = _fromCodes({
			id: 'RGBTan',
			redCode: 210,
			greenCode: 180,
			blueCode: 140
		});
		/**
		 * RGB rosyBrown color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const rosyBrown: Type = _fromCodes({
			id: 'RGBRosyBrown',
			redCode: 188,
			greenCode: 143,
			blueCode: 143
		});
		/**
		 * RGB moccasin color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const moccasin: Type = _fromCodes({
			id: 'RGBMoccasin',
			redCode: 255,
			greenCode: 228,
			blueCode: 181
		});
		/**
		 * RGB navajoWhite color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const navajoWhite: Type = _fromCodes({
			id: 'RGBNavajoWhite',
			redCode: 255,
			greenCode: 222,
			blueCode: 173
		});
		/**
		 * RGB peachPuff color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const peachPuff: Type = _fromCodes({
			id: 'RGBPeachPuff',
			redCode: 255,
			greenCode: 218,
			blueCode: 185
		});
		/**
		 * RGB mistyRose color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mistyRose: Type = _fromCodes({
			id: 'RGBMistyRose',
			redCode: 255,
			greenCode: 228,
			blueCode: 225
		});
		/**
		 * RGB lavenderBlush color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lavenderBlush: Type = _fromCodes({
			id: 'RGBLavenderBlush',
			redCode: 255,
			greenCode: 240,
			blueCode: 245
		});
		/**
		 * RGB linen color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const linen: Type = _fromCodes({
			id: 'RGBLinen',
			redCode: 250,
			greenCode: 240,
			blueCode: 230
		});
		/**
		 * RGB oldLace color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const oldLace: Type = _fromCodes({
			id: 'RGBOldLace',
			redCode: 253,
			greenCode: 245,
			blueCode: 230
		});
		/**
		 * RGB papayaWhip color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const papayaWhip: Type = _fromCodes({
			id: 'RGBPapayaWhip',
			redCode: 255,
			greenCode: 239,
			blueCode: 213
		});
		/**
		 * RGB seaShell color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const seaShell: Type = _fromCodes({
			id: 'RGBSeaShell',
			redCode: 255,
			greenCode: 245,
			blueCode: 238
		});
		/**
		 * RGB mintCream color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const mintCream: Type = _fromCodes({
			id: 'RGBMintCream',
			redCode: 245,
			greenCode: 255,
			blueCode: 250
		});
		/**
		 * RGB slateGray color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const slateGray: Type = _fromCodes({
			id: 'RGBSlateGray',
			redCode: 112,
			greenCode: 128,
			blueCode: 144
		});
		/**
		 * RGB lightSlateGray color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightSlateGray: Type = _fromCodes({
			id: 'RGBLightSlateGray',
			redCode: 119,
			greenCode: 136,
			blueCode: 153
		});
		/**
		 * RGB lightSteelBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightSteelBlue: Type = _fromCodes({
			id: 'RGBLightSteelBlue',
			redCode: 176,
			greenCode: 196,
			blueCode: 222
		});
		/**
		 * RGB lavender color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lavender: Type = _fromCodes({
			id: 'RGBLavender',
			redCode: 230,
			greenCode: 230,
			blueCode: 250
		});
		/**
		 * RGB floralWhite color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const floralWhite: Type = _fromCodes({
			id: 'RGBFloralWhite',
			redCode: 255,
			greenCode: 250,
			blueCode: 240
		});
		/**
		 * RGB aliceBlue color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const aliceBlue: Type = _fromCodes({
			id: 'RGBAliceBlue',
			redCode: 240,
			greenCode: 248,
			blueCode: 255
		});
		/**
		 * RGB ghostWhite color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const ghostWhite: Type = _fromCodes({
			id: 'RGBGhostWhite',
			redCode: 248,
			greenCode: 248,
			blueCode: 255
		});
		/**
		 * RGB honeydew color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const honeydew: Type = _fromCodes({
			id: 'RGBHoneydew',
			redCode: 240,
			greenCode: 255,
			blueCode: 240
		});
		/**
		 * RGB ivory color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const ivory: Type = _fromCodes({
			id: 'RGBIvory',
			redCode: 255,
			greenCode: 255,
			blueCode: 240
		});
		/**
		 * RGB azure color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const azure: Type = _fromCodes({
			id: 'RGBAzure',
			redCode: 240,
			greenCode: 255,
			blueCode: 255
		});
		/**
		 * RGB snow color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const snow: Type = _fromCodes({
			id: 'RGBSnow',
			redCode: 255,
			greenCode: 250,
			blueCode: 250
		});
		/**
		 * RGB black color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const black: Type = _fromCodes({
			id: 'RGBBlack',
			redCode: 0,
			greenCode: 0,
			blueCode: 0
		});
		/**
		 * RGB dimGray color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const dimGray: Type = _fromCodes({
			id: 'RGBDimGray',
			redCode: 105,
			greenCode: 105,
			blueCode: 105
		});
		/**
		 * RGB gray color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const gray: Type = _fromCodes({
			id: 'RGBGray',
			redCode: 128,
			greenCode: 128,
			blueCode: 128
		});
		/**
		 * RGB darkGray color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const darkGray: Type = _fromCodes({
			id: 'RGBDarkGray',
			redCode: 169,
			greenCode: 169,
			blueCode: 169
		});
		/**
		 * RGB silver color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const silver: Type = _fromCodes({
			id: 'RGBSilver',
			redCode: 192,
			greenCode: 192,
			blueCode: 192
		});
		/**
		 * RGB lightGray color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const lightGray: Type = _fromCodes({
			id: 'RGBLightGray',
			redCode: 211,
			greenCode: 211,
			blueCode: 211
		});
		/**
		 * RGB gainsboro color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const gainsboro: Type = _fromCodes({
			id: 'RGBGainsboro',
			redCode: 220,
			greenCode: 220,
			blueCode: 220
		});
		/**
		 * RGB whiteSmoke color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const whiteSmoke: Type = _fromCodes({
			id: 'RGBWhiteSmoke',
			redCode: 245,
			greenCode: 245,
			blueCode: 245
		});
		/**
		 * RGB white color
		 *
		 * @since 0.0.1
		 * @category RGB instances
		 */
		export const white: Type = _fromCodes({
			id: 'RGBWhite',
			redCode: 255,
			greenCode: 255,
			blueCode: 255
		});
	}
}

export namespace Styled {
	const moduleTag = _moduleTag + 'Styled/';
	const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
	type TypeId = typeof TypeId;

	/**
	 * Type that represents a Styled format
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
		readonly fgColor?: Colored.Type;
		/**
		 * Background color
		 *
		 * @since 0.0.1
		 */
		readonly bgColor?: Colored.Type;
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
		readonly [_TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.6
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type =>
		Predicate.hasProperty(u, _TypeId) && u[_TypeId] === TypeId;

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: TypeId,
		...baseProto,
		[MInspectable.IdSymbol](this: Type) {
			const id =
				(this.isBold ? 'Bold' : '') +
				(this.isUnderlined ? 'Underlined' : '') +
				(this.isFramed ? 'Framed' : '') +
				(this.isEncircled ? 'Encircled' : '') +
				(this.isOverlined ? 'Overlined' : '') +
				(this.isBlinking ? 'Blinking' : '') +
				(this.fgColor !== undefined ? Colored.fgName(this.fgColor) : '') +
				(this.bgColor !== undefined ? Colored.bgName(this.bgColor) : '');
			return id === '' ? 'None' : id;
		},
		...MInspectable.BaseProto(moduleTag)
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
	export const fromColor = (fgColor: Colored.Type): Type =>
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
	export const setFgColor = (fgColor: Colored.Type): MTypes.OneArgFunction<Type> =>
		flow(MStruct.set({ fgColor }), _make);

	/**
	 * Returns a copy of `self` with `bgColor` set to `bgColor`
	 *
	 * @since 0.0.1
	 * @category Utils
	 */
	export const setBgColor = (bgColor: Colored.Type): MTypes.OneArgFunction<Type> =>
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
	export const makeFramed: MTypes.OneArgFunction<Type> = flow(
		MStruct.set({ isFramed: true }),
		_make
	);

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
					Option.map(Colored.fgSequence),
					Option.getOrElse(() => ASSequence.empty)
				)
			),
			Array.appendAll(
				pipe(
					self.bgColor,
					Option.liftPredicate(MTypes.isNotUndefined),
					Option.map(Colored.bgSequence),
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
	 * corresponding to `self`, then the string it receives as argument and finally the reset sequence
	 * string.
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const stringTransformer: MTypes.OneArgFunction<Type, MTypes.StringTransformer> = flow(
		sequence,
		ASSequence.toStringTransformer
	);
}

/**
 * Gets the StringTransformer for `self`. This StringTransformer sends the sequence string
 * corresponding to Format, then the string it receives as argument and finally the reset sequence.
 *
 * @since 0.0.1
 * @category Destructors
 */
// Put this function after creating the Colored namespace. No warning if you do it the other way round but the code crashes at execution because Colored is undefined
export const stringTransformer: MTypes.OneArgFunction<Type, MTypes.StringTransformer> = flow(
	MMatch.make,
	MMatch.when(Colored.has, Colored.fgStringTransformer),
	MMatch.when(Styled.has, Styled.stringTransformer),
	MMatch.exhaustive
);
