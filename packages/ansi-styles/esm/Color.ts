/**
 * This module defines all available ANSI colors
 *
 * You can use the RGB.make function to build more RGB colors
 *
 * @since 0.0.1
 */

import { MInspectable, MMatch, MPipeable, MTypes } from '@parischap/effect-lib';
import {
	Array,
	Equal,
	Equivalence,
	flow,
	Hash,
	Number,
	pipe,
	Pipeable,
	Predicate,
	Struct
} from 'effect';
import { ASAnsiString } from './index.js';

export const moduleTag = '@parischap/ansi-styles/Color/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;
const _TypeIdHash = Hash.hash(TypeId);

const _TagSymbol: unique symbol = Symbol.for(moduleTag + '_TagSymbol/');
const _sequenceSymbol: unique symbol = Symbol.for(moduleTag + '_sequenceSymbol/');

export type Type = ThreeBit.Type | EightBit.Type | Rgb.Type;

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, TypeId);
const _has = has;

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const isThreeBit = (u: Type): u is ThreeBit.Type => u[_TagSymbol] === 'ThreeBit';

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const isEightBit = (u: Type): u is EightBit.Type => u[_TagSymbol] === 'EightBit';

/**
 * Type guard
 *
 * @since 0.0.1
 * @category Guards
 */
export const isRgb = (u: Type): u is Rgb.Type => u[_TagSymbol] === 'Rgb';

/**
 * Namespace for three-bit colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace ThreeBit {
	/**
	 * Namespace for three-bit color offsets
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	namespace Offset {
		/**
		 * Three-bit color offsets
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export enum Type {
			Black = 0,
			Red = 1,
			Green = 2,
			Yellow = 3,
			Blue = 4,
			Magenta = 5,
			Cyan = 6,
			White = 7
		}

		/**
		 * Builds the id of a color from its offset
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toId: MTypes.OneArgFunction<Type, string> = flow(
			MMatch.make,
			flow(
				MMatch.whenIs(Type.Black, () => 'Black'),
				MMatch.whenIs(Type.Red, () => 'Red'),
				MMatch.whenIs(Type.Green, () => 'Green'),
				MMatch.whenIs(Type.Yellow, () => 'Yellow'),
				MMatch.whenIs(Type.Blue, () => 'Blue'),
				MMatch.whenIs(Type.Magenta, () => 'Magenta'),
				MMatch.whenIs(Type.Cyan, () => 'Cyan'),
				MMatch.whenIs(Type.White, () => 'White')
			),
			MMatch.exhaustive
		);
	}

	/** ThreeBit color Type */
	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * Offset of this color
		 *
		 * @since 0.0.1
		 */
		readonly offset: Offset.Type;

		/**
		 * Indicates whether the color is bright
		 *
		 * @since 0.0.1
		 */
		readonly isBright: boolean;

		/**
		 * Gets the sequence of `this`
		 *
		 * @since 0.0.1
		 */
		readonly [_sequenceSymbol]: () => ASAnsiString.NonEmptySequence;

		/** @internal */
		readonly [_TagSymbol]: 'ThreeBit';

		/** @internal */
		readonly [TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */

	export const has = (u: unknown): u is Type => _has(u) && isThreeBit(u);

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		self.offset === that.offset && self.isBright === that.isBright;

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[TypeId]: TypeId,
		[_TagSymbol]: 'ThreeBit',
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.offset,
				Hash.hash,
				Hash.combine(Hash.hash(this.isBright)),
				Hash.combine(Hash.hash(this[_TagSymbol])),
				Hash.combine(_TypeIdHash),
				Hash.cached(this)
			);
		},
		[_sequenceSymbol](this: Type) {
			return Array.of((this.isBright ? 90 : 30) + this.offset);
		},
		[MInspectable.IdSymbol](this: Type) {
			return (this.isBright ? 'Bright' : '') + Offset.toId(this.offset);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Gets the `offset` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const offset: MTypes.OneArgFunction<Type, Offset.Type> = Struct.get('offset');

	/**
	 * Gets the `isBright` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const isBright: MTypes.OneArgFunction<Type, boolean> = Struct.get('isBright');

	/** Constructor */
	const _makeNormal = (offset: Offset.Type) => _make({ offset, isBright: false });

	/**
	 * Original black color instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const black: Type = _makeNormal(Offset.Type.Black);

	/**
	 * Original red color instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const red: Type = _makeNormal(Offset.Type.Red);

	/**
	 * Original green color instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const green: Type = _makeNormal(Offset.Type.Green);

	/**
	 * Original yellow color instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const yellow: Type = _makeNormal(Offset.Type.Yellow);

	/**
	 * Original blue color instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const blue: Type = _makeNormal(Offset.Type.Blue);

	/**
	 * Original magenta color instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const magenta: Type = _makeNormal(Offset.Type.Magenta);

	/**
	 * Original cyan color instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const cyan: Type = _makeNormal(Offset.Type.Cyan);

	/**
	 * Original white color instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const white: Type = _makeNormal(Offset.Type.White);

	/**
	 * Namespace for bright three-bit colors
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace Bright {
		/** Constructor */
		const _makeBright = (offset: Offset.Type) => _make({ offset, isBright: true });

		/**
		 * Original black color instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const black: Type = _makeBright(Offset.Type.Black);

		/**
		 * Original red color instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const red: Type = _makeBright(Offset.Type.Red);

		/**
		 * Original green color instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const green: Type = _makeBright(Offset.Type.Green);

		/**
		 * Original yellow color instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const yellow: Type = _makeBright(Offset.Type.Yellow);

		/**
		 * Original blue color instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const blue: Type = _makeBright(Offset.Type.Blue);

		/**
		 * Original magenta color instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const magenta: Type = _makeBright(Offset.Type.Magenta);

		/**
		 * Original cyan color instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const cyan: Type = _makeBright(Offset.Type.Cyan);

		/**
		 * Original white color instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const white: Type = _makeBright(Offset.Type.White);
	}
}

/**
 * Namespace for eight-bit colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace EightBit {
	/**
	 * Namespace for eight-bit color codes
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	namespace Code {
		/**
		 * Eight-bit color codes
		 *
		 * @since 0.0.1
		 * @category Models
		 */
		export enum Type {
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
			DarkGoldenRod = 136,
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
			LightGoldenRod3 = 179,
			Tan = 180,
			MistyRose3 = 181,
			Thistle3 = 182,
			Plum2 = 183,
			Yellow3_2 = 184,
			Khaki3 = 185,
			LightGoldenRod2_1 = 186,
			LightYellow3 = 187,
			Grey84 = 188,
			LightSteelBlue1 = 189,
			Yellow2 = 190,
			DarkOliveGreen1_1 = 191,
			DarkOliveGreen1_2 = 192,
			DarkSeaGreen1_2 = 193,
			HoneyDew2 = 194,
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
			LightGoldenRod2_2 = 221,
			LightGoldenRod2_3 = 222,
			NavajoWhite1 = 223,
			MistyRose1 = 224,
			Thistle1 = 225,
			Yellow1 = 226,
			LightGoldenRod1 = 227,
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

		/**
		 * Builds the id of a color from its code
		 *
		 * @since 0.0.1
		 * @category Destructors
		 */
		export const toId: MTypes.OneArgFunction<Type, string> = flow(
			MMatch.make,
			flow(
				flow(
					flow(
						MMatch.whenIs(Type.Black, () => 'Black'),
						MMatch.whenIs(Type.Maroon, () => 'Maroon'),
						MMatch.whenIs(Type.Green, () => 'Green'),
						MMatch.whenIs(Type.Olive, () => 'Olive'),
						MMatch.whenIs(Type.Navy, () => 'Navy'),
						MMatch.whenIs(Type.Purple_1, () => 'Purple_1'),
						MMatch.whenIs(Type.Teal, () => 'Teal'),
						MMatch.whenIs(Type.Silver, () => 'Silver'),
						MMatch.whenIs(Type.Grey, () => 'Grey')
					),
					flow(
						MMatch.whenIs(Type.Red, () => 'Red'),
						MMatch.whenIs(Type.Lime, () => 'Lime'),
						MMatch.whenIs(Type.Yellow, () => 'Yellow'),
						MMatch.whenIs(Type.Blue, () => 'Blue'),
						MMatch.whenIs(Type.Fuchsia, () => 'Fuchsia'),
						MMatch.whenIs(Type.Aqua, () => 'Aqua'),
						MMatch.whenIs(Type.White, () => 'White'),
						MMatch.whenIs(Type.Grey0, () => 'Grey0'),
						MMatch.whenIs(Type.NavyBlue, () => 'NavyBlue')
					),
					flow(
						MMatch.whenIs(Type.DarkBlue, () => 'DarkBlue'),
						MMatch.whenIs(Type.Blue3_1, () => 'Blue3_1'),
						MMatch.whenIs(Type.Blue3_2, () => 'Blue3_2'),
						MMatch.whenIs(Type.Blue1, () => 'Blue1'),
						MMatch.whenIs(Type.DarkGreen, () => 'DarkGreen'),
						MMatch.whenIs(Type.DeepSkyBlue4_1, () => 'DeepSkyBlue4_1'),
						MMatch.whenIs(Type.DeepSkyBlue4_2, () => 'DeepSkyBlue4_2'),
						MMatch.whenIs(Type.DeepSkyBlue4_3, () => 'DeepSkyBlue4_3'),
						MMatch.whenIs(Type.DodgerBlue3, () => 'DodgerBlue3')
					),
					flow(
						MMatch.whenIs(Type.DodgerBlue2, () => 'DodgerBlue2'),
						MMatch.whenIs(Type.Green4, () => 'Green4'),
						MMatch.whenIs(Type.SpringGreen4, () => 'SpringGreen4'),
						MMatch.whenIs(Type.Turquoise4, () => 'Turquoise4'),
						MMatch.whenIs(Type.DeepSkyBlue3_1, () => 'DeepSkyBlue3_1'),
						MMatch.whenIs(Type.DeepSkyBlue3_2, () => 'DeepSkyBlue3_2'),
						MMatch.whenIs(Type.DodgerBlue1, () => 'DodgerBlue1'),
						MMatch.whenIs(Type.Green3_1, () => 'Green3_1'),
						MMatch.whenIs(Type.SpringGreen3_1, () => 'SpringGreen3_1')
					),
					flow(
						MMatch.whenIs(Type.DarkCyan, () => 'DarkCyan'),
						MMatch.whenIs(Type.LightSeaGreen, () => 'LightSeaGreen'),
						MMatch.whenIs(Type.DeepSkyBlue2, () => 'DeepSkyBlue2'),
						MMatch.whenIs(Type.DeepSkyBlue1, () => 'DeepSkyBlue1'),
						MMatch.whenIs(Type.Green3_2, () => 'Green3_2'),
						MMatch.whenIs(Type.SpringGreen3_2, () => 'SpringGreen3_2'),
						MMatch.whenIs(Type.SpringGreen2_1, () => 'SpringGreen2_1'),
						MMatch.whenIs(Type.Cyan3, () => 'Cyan3'),
						MMatch.whenIs(Type.DarkTurquoise, () => 'DarkTurquoise')
					),
					flow(
						MMatch.whenIs(Type.Turquoise2, () => 'Turquoise2'),
						MMatch.whenIs(Type.Green1, () => 'Green1'),
						MMatch.whenIs(Type.SpringGreen2_2, () => 'SpringGreen2_2'),
						MMatch.whenIs(Type.SpringGreen1, () => 'SpringGreen1'),
						MMatch.whenIs(Type.MediumSpringGreen, () => 'MediumSpringGreen'),
						MMatch.whenIs(Type.Cyan2, () => 'Cyan2'),
						MMatch.whenIs(Type.Cyan1, () => 'Cyan1'),
						MMatch.whenIs(Type.DarkRed_1, () => 'DarkRed_1'),
						MMatch.whenIs(Type.DeepPink4_1, () => 'DeepPink4_1')
					),
					flow(
						MMatch.whenIs(Type.Purple4_1, () => 'Purple4_1'),
						MMatch.whenIs(Type.Purple4_2, () => 'Purple4_2'),
						MMatch.whenIs(Type.Purple3, () => 'Purple3'),
						MMatch.whenIs(Type.BlueViolet, () => 'BlueViolet'),
						MMatch.whenIs(Type.Orange4_1, () => 'Orange4_1'),
						MMatch.whenIs(Type.Grey37, () => 'Grey37'),
						MMatch.whenIs(Type.MediumPurple4, () => 'MediumPurple4'),
						MMatch.whenIs(Type.SlateBlue3_1, () => 'SlateBlue3_1'),
						MMatch.whenIs(Type.SlateBlue3_2, () => 'SlateBlue3_2')
					),
					flow(
						MMatch.whenIs(Type.RoyalBlue1, () => 'RoyalBlue1'),
						MMatch.whenIs(Type.Chartreuse4, () => 'Chartreuse4'),
						MMatch.whenIs(Type.DarkSeaGreen4_1, () => 'DarkSeaGreen4_1'),
						MMatch.whenIs(Type.PaleTurquoise4, () => 'PaleTurquoise4'),
						MMatch.whenIs(Type.SteelBlue, () => 'SteelBlue'),
						MMatch.whenIs(Type.SteelBlue3, () => 'SteelBlue3'),
						MMatch.whenIs(Type.CornflowerBlue, () => 'CornflowerBlue'),
						MMatch.whenIs(Type.Chartreuse3_1, () => 'Chartreuse3_1'),
						MMatch.whenIs(Type.DarkSeaGreen4_2, () => 'DarkSeaGreen4_2')
					),
					flow(
						MMatch.whenIs(Type.CadetBlue_1, () => 'CadetBlue_1'),
						MMatch.whenIs(Type.CadetBlue_2, () => 'CadetBlue_2'),
						MMatch.whenIs(Type.SkyBlue3, () => 'SkyBlue3'),
						MMatch.whenIs(Type.SteelBlue1_1, () => 'SteelBlue1_1'),
						MMatch.whenIs(Type.Chartreuse3_2, () => 'Chartreuse3_2'),
						MMatch.whenIs(Type.PaleGreen3_1, () => 'PaleGreen3_1'),
						MMatch.whenIs(Type.SeaGreen3, () => 'SeaGreen3'),
						MMatch.whenIs(Type.Aquamarine3, () => 'Aquamarine3'),
						MMatch.whenIs(Type.MediumTurquoise, () => 'MediumTurquoise')
					)
				),
				flow(
					flow(
						MMatch.whenIs(Type.SteelBlue1_2, () => 'SteelBlue1_2'),
						MMatch.whenIs(Type.Chartreuse2_1, () => 'Chartreuse2_1'),
						MMatch.whenIs(Type.SeaGreen2, () => 'SeaGreen2'),
						MMatch.whenIs(Type.SeaGreen1_1, () => 'SeaGreen1_1'),
						MMatch.whenIs(Type.SeaGreen1_2, () => 'SeaGreen1_2'),
						MMatch.whenIs(Type.Aquamarine1_1, () => 'Aquamarine1_1'),
						MMatch.whenIs(Type.DarkSlateGray2, () => 'DarkSlateGray2'),
						MMatch.whenIs(Type.DarkRed_2, () => 'DarkRed_2'),
						MMatch.whenIs(Type.DeepPink4_2, () => 'DeepPink4_2')
					),
					flow(
						MMatch.whenIs(Type.DarkMagenta_1, () => 'DarkMagenta_1'),
						MMatch.whenIs(Type.DarkMagenta_2, () => 'DarkMagenta_2'),
						MMatch.whenIs(Type.DarkViolet_1, () => 'DarkViolet_1'),
						MMatch.whenIs(Type.Purple_2, () => 'Purple_2'),
						MMatch.whenIs(Type.Orange4_2, () => 'Orange4_2'),
						MMatch.whenIs(Type.LightPink4, () => 'LightPink4'),
						MMatch.whenIs(Type.Plum4, () => 'Plum4'),
						MMatch.whenIs(Type.MediumPurple3_1, () => 'MediumPurple3_1'),
						MMatch.whenIs(Type.MediumPurple3_2, () => 'MediumPurple3_2')
					),
					flow(
						MMatch.whenIs(Type.SlateBlue1, () => 'SlateBlue1'),
						MMatch.whenIs(Type.Yellow4_1, () => 'Yellow4_1'),
						MMatch.whenIs(Type.Wheat4, () => 'Wheat4'),
						MMatch.whenIs(Type.Grey53, () => 'Grey53'),
						MMatch.whenIs(Type.LightSlateGrey, () => 'LightSlateGrey'),
						MMatch.whenIs(Type.MediumPurple, () => 'MediumPurple'),
						MMatch.whenIs(Type.LightSlateBlue, () => 'LightSlateBlue'),
						MMatch.whenIs(Type.Yellow4_2, () => 'Yellow4_2'),
						MMatch.whenIs(Type.DarkOliveGreen3_1, () => 'DarkOliveGreen3_1')
					),
					flow(
						MMatch.whenIs(Type.DarkSeaGreen, () => 'DarkSeaGreen'),
						MMatch.whenIs(Type.LightSkyBlue3_1, () => 'LightSkyBlue3_1'),
						MMatch.whenIs(Type.LightSkyBlue3_2, () => 'LightSkyBlue3_2'),
						MMatch.whenIs(Type.SkyBlue2, () => 'SkyBlue2'),
						MMatch.whenIs(Type.Chartreuse2_2, () => 'Chartreuse2_2'),
						MMatch.whenIs(Type.DarkOliveGreen3_2, () => 'DarkOliveGreen3_2'),
						MMatch.whenIs(Type.PaleGreen3_2, () => 'PaleGreen3_2'),
						MMatch.whenIs(Type.DarkSeaGreen3_1, () => 'DarkSeaGreen3_1'),
						MMatch.whenIs(Type.DarkSlateGray3, () => 'DarkSlateGray3')
					),
					flow(
						MMatch.whenIs(Type.SkyBlue1, () => 'SkyBlue1'),
						MMatch.whenIs(Type.Chartreuse1, () => 'Chartreuse1'),
						MMatch.whenIs(Type.LightGreen_1, () => 'LightGreen_1'),
						MMatch.whenIs(Type.LightGreen_2, () => 'LightGreen_2'),
						MMatch.whenIs(Type.PaleGreen1_1, () => 'PaleGreen1_1'),
						MMatch.whenIs(Type.Aquamarine1_2, () => 'Aquamarine1_2'),
						MMatch.whenIs(Type.DarkSlateGray1, () => 'DarkSlateGray1'),
						MMatch.whenIs(Type.Red3_1, () => 'Red3_1'),
						MMatch.whenIs(Type.DeepPink4_3, () => 'DeepPink4_3')
					),
					flow(
						MMatch.whenIs(Type.MediumVioletRed, () => 'MediumVioletRed'),
						MMatch.whenIs(Type.Magenta3_1, () => 'Magenta3_1'),
						MMatch.whenIs(Type.DarkViolet_2, () => 'DarkViolet_2'),
						MMatch.whenIs(Type.Purple_3, () => 'Purple_3'),
						MMatch.whenIs(Type.DarkOrange3_1, () => 'DarkOrange3_1'),
						MMatch.whenIs(Type.IndianRed_1, () => 'IndianRed_1'),
						MMatch.whenIs(Type.HotPink3_1, () => 'HotPink3_1'),
						MMatch.whenIs(Type.MediumOrchid3, () => 'MediumOrchid3'),
						MMatch.whenIs(Type.MediumOrchid, () => 'MediumOrchid')
					),
					flow(
						MMatch.whenIs(Type.MediumPurple2_1, () => 'MediumPurple2_1'),
						MMatch.whenIs(Type.DarkGoldenRod, () => 'DarkGoldenRod'),
						MMatch.whenIs(Type.LightSalmon3_1, () => 'LightSalmon3_1'),
						MMatch.whenIs(Type.RosyBrown, () => 'RosyBrown'),
						MMatch.whenIs(Type.Grey63, () => 'Grey63'),
						MMatch.whenIs(Type.MediumPurple2_2, () => 'MediumPurple2_2'),
						MMatch.whenIs(Type.MediumPurple1, () => 'MediumPurple1'),
						MMatch.whenIs(Type.Gold3_1, () => 'Gold3_1'),
						MMatch.whenIs(Type.DarkKhaki, () => 'DarkKhaki')
					),
					flow(
						MMatch.whenIs(Type.NavajoWhite3, () => 'NavajoWhite3'),
						MMatch.whenIs(Type.Grey69, () => 'Grey69'),
						MMatch.whenIs(Type.LightSteelBlue3, () => 'LightSteelBlue3'),
						MMatch.whenIs(Type.LightSteelBlue, () => 'LightSteelBlue'),
						MMatch.whenIs(Type.Yellow3_1, () => 'Yellow3_1'),
						MMatch.whenIs(Type.DarkOliveGreen3_3, () => 'DarkOliveGreen3_3'),
						MMatch.whenIs(Type.DarkSeaGreen3_2, () => 'DarkSeaGreen3_2'),
						MMatch.whenIs(Type.DarkSeaGreen2_1, () => 'DarkSeaGreen2_1'),
						MMatch.whenIs(Type.LightCyan3, () => 'LightCyan3')
					),
					flow(
						MMatch.whenIs(Type.LightSkyBlue1, () => 'LightSkyBlue1'),
						MMatch.whenIs(Type.GreenYellow, () => 'GreenYellow'),
						MMatch.whenIs(Type.DarkOliveGreen2, () => 'DarkOliveGreen2'),
						MMatch.whenIs(Type.PaleGreen1_2, () => 'PaleGreen1_2'),
						MMatch.whenIs(Type.DarkSeaGreen2_2, () => 'DarkSeaGreen2_2'),
						MMatch.whenIs(Type.DarkSeaGreen1_1, () => 'DarkSeaGreen1_1'),
						MMatch.whenIs(Type.PaleTurquoise1, () => 'PaleTurquoise1'),
						MMatch.whenIs(Type.Red3_2, () => 'Red3_2'),
						MMatch.whenIs(Type.DeepPink3_1, () => 'DeepPink3_1')
					)
				),
				flow(
					flow(
						MMatch.whenIs(Type.DeepPink3_2, () => 'DeepPink3_2'),
						MMatch.whenIs(Type.Magenta3_2, () => 'Magenta3_2'),
						MMatch.whenIs(Type.Magenta3_3, () => 'Magenta3_3'),
						MMatch.whenIs(Type.Magenta2_1, () => 'Magenta2_1'),
						MMatch.whenIs(Type.DarkOrange3_2, () => 'DarkOrange3_2'),
						MMatch.whenIs(Type.IndianRed_2, () => 'IndianRed_2'),
						MMatch.whenIs(Type.HotPink3_2, () => 'HotPink3_2'),
						MMatch.whenIs(Type.HotPink2, () => 'HotPink2'),
						MMatch.whenIs(Type.Orchid, () => 'Orchid')
					),
					flow(
						MMatch.whenIs(Type.MediumOrchid1_1, () => 'MediumOrchid1_1'),
						MMatch.whenIs(Type.Orange3, () => 'Orange3'),
						MMatch.whenIs(Type.LightSalmon3_2, () => 'LightSalmon3_2'),
						MMatch.whenIs(Type.LightPink3, () => 'LightPink3'),
						MMatch.whenIs(Type.Pink3, () => 'Pink3'),
						MMatch.whenIs(Type.Plum3, () => 'Plum3'),
						MMatch.whenIs(Type.Violet, () => 'Violet'),
						MMatch.whenIs(Type.Gold3_2, () => 'Gold3_2'),
						MMatch.whenIs(Type.LightGoldenRod3, () => 'LightGoldenRod3')
					),
					flow(
						MMatch.whenIs(Type.Tan, () => 'Tan'),
						MMatch.whenIs(Type.MistyRose3, () => 'MistyRose3'),
						MMatch.whenIs(Type.Thistle3, () => 'Thistle3'),
						MMatch.whenIs(Type.Plum2, () => 'Plum2'),
						MMatch.whenIs(Type.Yellow3_2, () => 'Yellow3_2'),
						MMatch.whenIs(Type.Khaki3, () => 'Khaki3'),
						MMatch.whenIs(Type.LightGoldenRod2_1, () => 'LightGoldenRod2_1'),
						MMatch.whenIs(Type.LightYellow3, () => 'LightYellow3'),
						MMatch.whenIs(Type.Grey84, () => 'Grey84')
					),
					flow(
						MMatch.whenIs(Type.LightSteelBlue1, () => 'LightSteelBlue1'),
						MMatch.whenIs(Type.Yellow2, () => 'Yellow2'),
						MMatch.whenIs(Type.DarkOliveGreen1_1, () => 'DarkOliveGreen1_1'),
						MMatch.whenIs(Type.DarkOliveGreen1_2, () => 'DarkOliveGreen1_2'),
						MMatch.whenIs(Type.DarkSeaGreen1_2, () => 'DarkSeaGreen1_2'),
						MMatch.whenIs(Type.HoneyDew2, () => 'HoneyDew2'),
						MMatch.whenIs(Type.LightCyan1, () => 'LightCyan1'),
						MMatch.whenIs(Type.Red1, () => 'Red1'),
						MMatch.whenIs(Type.DeepPink2, () => 'DeepPink2')
					),
					flow(
						MMatch.whenIs(Type.DeepPink1_1, () => 'DeepPink1_1'),
						MMatch.whenIs(Type.DeepPink1_2, () => 'DeepPink1_2'),
						MMatch.whenIs(Type.Magenta2_2, () => 'Magenta2_2'),
						MMatch.whenIs(Type.Magenta1, () => 'Magenta1'),
						MMatch.whenIs(Type.OrangeRed1, () => 'OrangeRed1'),
						MMatch.whenIs(Type.IndianRed1_1, () => 'IndianRed1_1'),
						MMatch.whenIs(Type.IndianRed1_2, () => 'IndianRed1_2'),
						MMatch.whenIs(Type.HotPink_1, () => 'HotPink_1'),
						MMatch.whenIs(Type.HotPink_2, () => 'HotPink_2')
					),
					flow(
						MMatch.whenIs(Type.MediumOrchid1_2, () => 'MediumOrchid1_2'),
						MMatch.whenIs(Type.DarkOrange, () => 'DarkOrange'),
						MMatch.whenIs(Type.Salmon1, () => 'Salmon1'),
						MMatch.whenIs(Type.LightCoral, () => 'LightCoral'),
						MMatch.whenIs(Type.PaleVioletRed1, () => 'PaleVioletRed1'),
						MMatch.whenIs(Type.Orchid2, () => 'Orchid2'),
						MMatch.whenIs(Type.Orchid1, () => 'Orchid1'),
						MMatch.whenIs(Type.Orange1, () => 'Orange1'),
						MMatch.whenIs(Type.SandyBrown, () => 'SandyBrown')
					),
					flow(
						MMatch.whenIs(Type.LightSalmon1, () => 'LightSalmon1'),
						MMatch.whenIs(Type.LightPink1, () => 'LightPink1'),
						MMatch.whenIs(Type.Pink1, () => 'Pink1'),
						MMatch.whenIs(Type.Plum1, () => 'Plum1'),
						MMatch.whenIs(Type.Gold1, () => 'Gold1'),
						MMatch.whenIs(Type.LightGoldenRod2_2, () => 'LightGoldenRod2_2'),
						MMatch.whenIs(Type.LightGoldenRod2_3, () => 'LightGoldenRod2_3'),
						MMatch.whenIs(Type.NavajoWhite1, () => 'NavajoWhite1'),
						MMatch.whenIs(Type.MistyRose1, () => 'MistyRose1')
					),
					flow(
						MMatch.whenIs(Type.Thistle1, () => 'Thistle1'),
						MMatch.whenIs(Type.Yellow1, () => 'Yellow1'),
						MMatch.whenIs(Type.LightGoldenRod1, () => 'LightGoldenRod1'),
						MMatch.whenIs(Type.Khaki1, () => 'Khaki1'),
						MMatch.whenIs(Type.Wheat1, () => 'Wheat1'),
						MMatch.whenIs(Type.Cornsilk1, () => 'Cornsilk1'),
						MMatch.whenIs(Type.Grey100, () => 'Grey100'),
						MMatch.whenIs(Type.Grey3, () => 'Grey3'),
						MMatch.whenIs(Type.Grey7, () => 'Grey7')
					),
					flow(
						MMatch.whenIs(Type.Grey11, () => 'Grey11'),
						MMatch.whenIs(Type.Grey15, () => 'Grey15'),
						MMatch.whenIs(Type.Grey19, () => 'Grey19'),
						MMatch.whenIs(Type.Grey23, () => 'Grey23'),
						MMatch.whenIs(Type.Grey27, () => 'Grey27'),
						MMatch.whenIs(Type.Grey30, () => 'Grey30'),
						MMatch.whenIs(Type.Grey35, () => 'Grey35'),
						MMatch.whenIs(Type.Grey39, () => 'Grey39'),
						MMatch.whenIs(Type.Grey42, () => 'Grey42')
					)
				),
				flow(
					flow(
						MMatch.whenIs(Type.Grey46, () => 'Grey46'),
						MMatch.whenIs(Type.Grey50, () => 'Grey50'),
						MMatch.whenIs(Type.Grey54, () => 'Grey54'),
						MMatch.whenIs(Type.Grey58, () => 'Grey58'),
						MMatch.whenIs(Type.Grey62, () => 'Grey62'),
						MMatch.whenIs(Type.Grey66, () => 'Grey66'),
						MMatch.whenIs(Type.Grey70, () => 'Grey70'),
						MMatch.whenIs(Type.Grey74, () => 'Grey74'),
						MMatch.whenIs(Type.Grey78, () => 'Grey78')
					),
					flow(
						MMatch.whenIs(Type.Grey82, () => 'Grey82'),
						MMatch.whenIs(Type.Grey85, () => 'Grey85'),
						MMatch.whenIs(Type.Grey89, () => 'Grey89'),
						MMatch.whenIs(Type.Grey93, () => 'Grey93')
					)
				)
			),
			MMatch.exhaustive
		);
	}

	/** EightBit color Type */
	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/**
		 * Code of this color
		 *
		 * @since 0.0.1
		 */
		readonly code: Code.Type;

		/**
		 * Gets the sequence of `this`
		 *
		 * @since 0.0.1
		 */
		readonly [_sequenceSymbol]: () => ASAnsiString.NonEmptySequence;

		/** @internal */
		readonly [_TagSymbol]: 'EightBit';

		/** @internal */
		readonly [TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => _has(u) && isEightBit(u);

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) => self.code === that.code;

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[TypeId]: TypeId,
		[_TagSymbol]: 'EightBit',
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.code,
				Hash.hash,
				Hash.combine(Hash.hash(this[_TagSymbol])),
				Hash.combine(_TypeIdHash),
				Hash.cached(this)
			);
		},
		[_sequenceSymbol](this: Type) {
			return Array.make(38, 5, this.code);
		},
		[MInspectable.IdSymbol](this: Type) {
			return 'EightBit' + Code.toId(this.code);
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Gets the `code` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const code: MTypes.OneArgFunction<Type, Code.Type> = Struct.get('code');

	/**
	 * Eightbit black color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const black: Type = _make({ code: Code.Type.Black });
	/**
	 * Eightbit maroon color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const maroon: Type = _make({ code: Code.Type.Maroon });
	/**
	 * Eightbit green color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green: Type = _make({ code: Code.Type.Green });
	/**
	 * Eightbit olive color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const olive: Type = _make({ code: Code.Type.Olive });
	/**
	 * Eightbit navy color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navy: Type = _make({ code: Code.Type.Navy });
	/**
	 * Eightbit purple_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple_1: Type = _make({ code: Code.Type.Purple_1 });
	/**
	 * Eightbit teal color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const teal: Type = _make({ code: Code.Type.Teal });
	/**
	 * Eightbit silver color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const silver: Type = _make({ code: Code.Type.Silver });
	/**
	 * Eightbit grey color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey: Type = _make({ code: Code.Type.Grey });
	/**
	 * Eightbit red color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red: Type = _make({ code: Code.Type.Red });
	/**
	 * Eightbit lime color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lime: Type = _make({ code: Code.Type.Lime });
	/**
	 * Eightbit yellow color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow: Type = _make({ code: Code.Type.Yellow });
	/**
	 * Eightbit blue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue: Type = _make({ code: Code.Type.Blue });
	/**
	 * Eightbit fuchsia color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const fuchsia: Type = _make({ code: Code.Type.Fuchsia });
	/**
	 * Eightbit aqua color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aqua: Type = _make({ code: Code.Type.Aqua });
	/**
	 * Eightbit white color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const white: Type = _make({ code: Code.Type.White });
	/**
	 * Eightbit grey0 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey0: Type = _make({ code: Code.Type.Grey0 });
	/**
	 * Eightbit navyBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navyBlue: Type = _make({ code: Code.Type.NavyBlue });
	/**
	 * Eightbit darkBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkBlue: Type = _make({ code: Code.Type.DarkBlue });
	/**
	 * Eightbit blue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue3_1: Type = _make({ code: Code.Type.Blue3_1 });
	/**
	 * Eightbit blue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue3_2: Type = _make({ code: Code.Type.Blue3_2 });
	/**
	 * Eightbit blue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue1: Type = _make({ code: Code.Type.Blue1 });
	/**
	 * Eightbit darkGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkGreen: Type = _make({ code: Code.Type.DarkGreen });
	/**
	 * Eightbit deepSkyBlue4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue4_1: Type = _make({ code: Code.Type.DeepSkyBlue4_1 });
	/**
	 * Eightbit deepSkyBlue4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue4_2: Type = _make({ code: Code.Type.DeepSkyBlue4_2 });
	/**
	 * Eightbit deepSkyBlue4_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue4_3: Type = _make({ code: Code.Type.DeepSkyBlue4_3 });
	/**
	 * Eightbit dodgerBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const dodgerBlue3: Type = _make({ code: Code.Type.DodgerBlue3 });
	/**
	 * Eightbit dodgerBlue2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const dodgerBlue2: Type = _make({ code: Code.Type.DodgerBlue2 });
	/**
	 * Eightbit green4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green4: Type = _make({ code: Code.Type.Green4 });
	/**
	 * Eightbit springGreen4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen4: Type = _make({ code: Code.Type.SpringGreen4 });
	/**
	 * Eightbit turquoise4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const turquoise4: Type = _make({ code: Code.Type.Turquoise4 });
	/**
	 * Eightbit deepSkyBlue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue3_1: Type = _make({ code: Code.Type.DeepSkyBlue3_1 });
	/**
	 * Eightbit deepSkyBlue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue3_2: Type = _make({ code: Code.Type.DeepSkyBlue3_2 });
	/**
	 * Eightbit dodgerBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const dodgerBlue1: Type = _make({ code: Code.Type.DodgerBlue1 });
	/**
	 * Eightbit green3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green3_1: Type = _make({ code: Code.Type.Green3_1 });
	/**
	 * Eightbit springGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen3_1: Type = _make({ code: Code.Type.SpringGreen3_1 });
	/**
	 * Eightbit darkCyan color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkCyan: Type = _make({ code: Code.Type.DarkCyan });
	/**
	 * Eightbit lightSeaGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSeaGreen: Type = _make({ code: Code.Type.LightSeaGreen });
	/**
	 * Eightbit deepSkyBlue2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue2: Type = _make({ code: Code.Type.DeepSkyBlue2 });
	/**
	 * Eightbit deepSkyBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue1: Type = _make({ code: Code.Type.DeepSkyBlue1 });
	/**
	 * Eightbit green3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green3_2: Type = _make({ code: Code.Type.Green3_2 });
	/**
	 * Eightbit springGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen3_2: Type = _make({ code: Code.Type.SpringGreen3_2 });
	/**
	 * Eightbit springGreen2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen2_1: Type = _make({ code: Code.Type.SpringGreen2_1 });
	/**
	 * Eightbit cyan3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cyan3: Type = _make({ code: Code.Type.Cyan3 });
	/**
	 * Eightbit darkTurquoise color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkTurquoise: Type = _make({ code: Code.Type.DarkTurquoise });
	/**
	 * Eightbit turquoise2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const turquoise2: Type = _make({ code: Code.Type.Turquoise2 });
	/**
	 * Eightbit green1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green1: Type = _make({ code: Code.Type.Green1 });
	/**
	 * Eightbit springGreen2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen2_2: Type = _make({ code: Code.Type.SpringGreen2_2 });
	/**
	 * Eightbit springGreen1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen1: Type = _make({ code: Code.Type.SpringGreen1 });
	/**
	 * Eightbit mediumSpringGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumSpringGreen: Type = _make({ code: Code.Type.MediumSpringGreen });
	/**
	 * Eightbit cyan2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cyan2: Type = _make({ code: Code.Type.Cyan2 });
	/**
	 * Eightbit cyan1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cyan1: Type = _make({ code: Code.Type.Cyan1 });
	/**
	 * Eightbit darkRed_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkRed_1: Type = _make({ code: Code.Type.DarkRed_1 });
	/**
	 * Eightbit deepPink4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink4_1: Type = _make({ code: Code.Type.DeepPink4_1 });
	/**
	 * Eightbit purple4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple4_1: Type = _make({ code: Code.Type.Purple4_1 });
	/**
	 * Eightbit purple4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple4_2: Type = _make({ code: Code.Type.Purple4_2 });
	/**
	 * Eightbit purple3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple3: Type = _make({ code: Code.Type.Purple3 });
	/**
	 * Eightbit blueViolet color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blueViolet: Type = _make({ code: Code.Type.BlueViolet });
	/**
	 * Eightbit orange4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange4_1: Type = _make({ code: Code.Type.Orange4_1 });
	/**
	 * Eightbit grey37 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey37: Type = _make({ code: Code.Type.Grey37 });
	/**
	 * Eightbit mediumPurple4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple4: Type = _make({ code: Code.Type.MediumPurple4 });
	/**
	 * Eightbit slateBlue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const slateBlue3_1: Type = _make({ code: Code.Type.SlateBlue3_1 });
	/**
	 * Eightbit slateBlue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const slateBlue3_2: Type = _make({ code: Code.Type.SlateBlue3_2 });
	/**
	 * Eightbit royalBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const royalBlue1: Type = _make({ code: Code.Type.RoyalBlue1 });
	/**
	 * Eightbit chartreuse4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse4: Type = _make({ code: Code.Type.Chartreuse4 });
	/**
	 * Eightbit darkSeaGreen4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen4_1: Type = _make({ code: Code.Type.DarkSeaGreen4_1 });
	/**
	 * Eightbit paleTurquoise4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleTurquoise4: Type = _make({ code: Code.Type.PaleTurquoise4 });
	/**
	 * Eightbit steelBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue: Type = _make({ code: Code.Type.SteelBlue });
	/**
	 * Eightbit steelBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue3: Type = _make({ code: Code.Type.SteelBlue3 });
	/**
	 * Eightbit cornflowerBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cornflowerBlue: Type = _make({ code: Code.Type.CornflowerBlue });
	/**
	 * Eightbit chartreuse3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse3_1: Type = _make({ code: Code.Type.Chartreuse3_1 });
	/**
	 * Eightbit darkSeaGreen4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen4_2: Type = _make({ code: Code.Type.DarkSeaGreen4_2 });
	/**
	 * Eightbit cadetBlue_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cadetBlue_1: Type = _make({ code: Code.Type.CadetBlue_1 });
	/**
	 * Eightbit cadetBlue_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cadetBlue_2: Type = _make({ code: Code.Type.CadetBlue_2 });
	/**
	 * Eightbit skyBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const skyBlue3: Type = _make({ code: Code.Type.SkyBlue3 });
	/**
	 * Eightbit steelBlue1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue1_1: Type = _make({ code: Code.Type.SteelBlue1_1 });
	/**
	 * Eightbit chartreuse3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse3_2: Type = _make({ code: Code.Type.Chartreuse3_2 });
	/**
	 * Eightbit paleGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen3_1: Type = _make({ code: Code.Type.PaleGreen3_1 });
	/**
	 * Eightbit seaGreen3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen3: Type = _make({ code: Code.Type.SeaGreen3 });
	/**
	 * Eightbit aquamarine3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aquamarine3: Type = _make({ code: Code.Type.Aquamarine3 });
	/**
	 * Eightbit mediumTurquoise color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumTurquoise: Type = _make({ code: Code.Type.MediumTurquoise });
	/**
	 * Eightbit steelBlue1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue1_2: Type = _make({ code: Code.Type.SteelBlue1_2 });
	/**
	 * Eightbit chartreuse2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse2_1: Type = _make({ code: Code.Type.Chartreuse2_1 });
	/**
	 * Eightbit seaGreen2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen2: Type = _make({ code: Code.Type.SeaGreen2 });
	/**
	 * Eightbit seaGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen1_1: Type = _make({ code: Code.Type.SeaGreen1_1 });
	/**
	 * Eightbit seaGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen1_2: Type = _make({ code: Code.Type.SeaGreen1_2 });
	/**
	 * Eightbit aquamarine1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aquamarine1_1: Type = _make({ code: Code.Type.Aquamarine1_1 });
	/**
	 * Eightbit darkSlateGray2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSlateGray2: Type = _make({ code: Code.Type.DarkSlateGray2 });
	/**
	 * Eightbit darkRed_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkRed_2: Type = _make({ code: Code.Type.DarkRed_2 });
	/**
	 * Eightbit deepPink4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink4_2: Type = _make({ code: Code.Type.DeepPink4_2 });
	/**
	 * Eightbit darkMagenta_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkMagenta_1: Type = _make({ code: Code.Type.DarkMagenta_1 });
	/**
	 * Eightbit darkMagenta_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkMagenta_2: Type = _make({ code: Code.Type.DarkMagenta_2 });
	/**
	 * Eightbit darkViolet_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkViolet_1: Type = _make({ code: Code.Type.DarkViolet_1 });
	/**
	 * Eightbit purple_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple_2: Type = _make({ code: Code.Type.Purple_2 });
	/**
	 * Eightbit orange4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange4_2: Type = _make({ code: Code.Type.Orange4_2 });
	/**
	 * Eightbit lightPink4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightPink4: Type = _make({ code: Code.Type.LightPink4 });
	/**
	 * Eightbit plum4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum4: Type = _make({ code: Code.Type.Plum4 });
	/**
	 * Eightbit mediumPurple3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple3_1: Type = _make({ code: Code.Type.MediumPurple3_1 });
	/**
	 * Eightbit mediumPurple3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple3_2: Type = _make({ code: Code.Type.MediumPurple3_2 });
	/**
	 * Eightbit slateBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const slateBlue1: Type = _make({ code: Code.Type.SlateBlue1 });
	/**
	 * Eightbit yellow4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow4_1: Type = _make({ code: Code.Type.Yellow4_1 });
	/**
	 * Eightbit wheat4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const wheat4: Type = _make({ code: Code.Type.Wheat4 });
	/**
	 * Eightbit grey53 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey53: Type = _make({ code: Code.Type.Grey53 });
	/**
	 * Eightbit lightSlateGrey color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSlateGrey: Type = _make({ code: Code.Type.LightSlateGrey });
	/**
	 * Eightbit mediumPurple color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple: Type = _make({ code: Code.Type.MediumPurple });
	/**
	 * Eightbit lightSlateBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSlateBlue: Type = _make({ code: Code.Type.LightSlateBlue });
	/**
	 * Eightbit yellow4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow4_2: Type = _make({ code: Code.Type.Yellow4_2 });
	/**
	 * Eightbit darkOliveGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen3_1: Type = _make({ code: Code.Type.DarkOliveGreen3_1 });
	/**
	 * Eightbit darkSeaGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen: Type = _make({ code: Code.Type.DarkSeaGreen });
	/**
	 * Eightbit lightSkyBlue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSkyBlue3_1: Type = _make({ code: Code.Type.LightSkyBlue3_1 });
	/**
	 * Eightbit lightSkyBlue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSkyBlue3_2: Type = _make({ code: Code.Type.LightSkyBlue3_2 });
	/**
	 * Eightbit skyBlue2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const skyBlue2: Type = _make({ code: Code.Type.SkyBlue2 });
	/**
	 * Eightbit chartreuse2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse2_2: Type = _make({ code: Code.Type.Chartreuse2_2 });
	/**
	 * Eightbit darkOliveGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen3_2: Type = _make({ code: Code.Type.DarkOliveGreen3_2 });
	/**
	 * Eightbit paleGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen3_2: Type = _make({ code: Code.Type.PaleGreen3_2 });
	/**
	 * Eightbit darkSeaGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen3_1: Type = _make({ code: Code.Type.DarkSeaGreen3_1 });
	/**
	 * Eightbit darkSlateGray3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSlateGray3: Type = _make({ code: Code.Type.DarkSlateGray3 });
	/**
	 * Eightbit skyBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const skyBlue1: Type = _make({ code: Code.Type.SkyBlue1 });
	/**
	 * Eightbit chartreuse1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse1: Type = _make({ code: Code.Type.Chartreuse1 });
	/**
	 * Eightbit lightGreen_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGreen_1: Type = _make({ code: Code.Type.LightGreen_1 });
	/**
	 * Eightbit lightGreen_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGreen_2: Type = _make({ code: Code.Type.LightGreen_2 });
	/**
	 * Eightbit paleGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen1_1: Type = _make({ code: Code.Type.PaleGreen1_1 });
	/**
	 * Eightbit aquamarine1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aquamarine1_2: Type = _make({ code: Code.Type.Aquamarine1_2 });
	/**
	 * Eightbit darkSlateGray1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSlateGray1: Type = _make({ code: Code.Type.DarkSlateGray1 });
	/**
	 * Eightbit red3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red3_1: Type = _make({ code: Code.Type.Red3_1 });
	/**
	 * Eightbit deepPink4_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink4_3: Type = _make({ code: Code.Type.DeepPink4_3 });
	/**
	 * Eightbit mediumVioletRed color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumVioletRed: Type = _make({ code: Code.Type.MediumVioletRed });
	/**
	 * Eightbit magenta3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta3_1: Type = _make({ code: Code.Type.Magenta3_1 });
	/**
	 * Eightbit darkViolet_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkViolet_2: Type = _make({ code: Code.Type.DarkViolet_2 });
	/**
	 * Eightbit purple_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple_3: Type = _make({ code: Code.Type.Purple_3 });
	/**
	 * Eightbit darkOrange3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOrange3_1: Type = _make({ code: Code.Type.DarkOrange3_1 });
	/**
	 * Eightbit indianRed_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed_1: Type = _make({ code: Code.Type.IndianRed_1 });
	/**
	 * Eightbit hotPink3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink3_1: Type = _make({ code: Code.Type.HotPink3_1 });
	/**
	 * Eightbit mediumOrchid3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid3: Type = _make({ code: Code.Type.MediumOrchid3 });
	/**
	 * Eightbit mediumOrchid color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid: Type = _make({ code: Code.Type.MediumOrchid });
	/**
	 * Eightbit mediumPurple2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple2_1: Type = _make({ code: Code.Type.MediumPurple2_1 });
	/**
	 * Eightbit darkGoldenRod color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkGoldenRod: Type = _make({ code: Code.Type.DarkGoldenRod });
	/**
	 * Eightbit lightSalmon3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSalmon3_1: Type = _make({ code: Code.Type.LightSalmon3_1 });
	/**
	 * Eightbit rosyBrown color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const rosyBrown: Type = _make({ code: Code.Type.RosyBrown });
	/**
	 * Eightbit grey63 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey63: Type = _make({ code: Code.Type.Grey63 });
	/**
	 * Eightbit mediumPurple2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple2_2: Type = _make({ code: Code.Type.MediumPurple2_2 });
	/**
	 * Eightbit mediumPurple1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple1: Type = _make({ code: Code.Type.MediumPurple1 });
	/**
	 * Eightbit gold3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const gold3_1: Type = _make({ code: Code.Type.Gold3_1 });
	/**
	 * Eightbit darkKhaki color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkKhaki: Type = _make({ code: Code.Type.DarkKhaki });
	/**
	 * Eightbit navajoWhite3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navajoWhite3: Type = _make({ code: Code.Type.NavajoWhite3 });
	/**
	 * Eightbit grey69 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey69: Type = _make({ code: Code.Type.Grey69 });
	/**
	 * Eightbit lightSteelBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSteelBlue3: Type = _make({ code: Code.Type.LightSteelBlue3 });
	/**
	 * Eightbit lightSteelBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSteelBlue: Type = _make({ code: Code.Type.LightSteelBlue });
	/**
	 * Eightbit yellow3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow3_1: Type = _make({ code: Code.Type.Yellow3_1 });
	/**
	 * Eightbit darkOliveGreen3_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen3_3: Type = _make({ code: Code.Type.DarkOliveGreen3_3 });
	/**
	 * Eightbit darkSeaGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen3_2: Type = _make({ code: Code.Type.DarkSeaGreen3_2 });
	/**
	 * Eightbit darkSeaGreen2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen2_1: Type = _make({ code: Code.Type.DarkSeaGreen2_1 });
	/**
	 * Eightbit lightCyan3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightCyan3: Type = _make({ code: Code.Type.LightCyan3 });
	/**
	 * Eightbit lightSkyBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSkyBlue1: Type = _make({ code: Code.Type.LightSkyBlue1 });
	/**
	 * Eightbit greenYellow color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const greenYellow: Type = _make({ code: Code.Type.GreenYellow });
	/**
	 * Eightbit darkOliveGreen2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen2: Type = _make({ code: Code.Type.DarkOliveGreen2 });
	/**
	 * Eightbit paleGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen1_2: Type = _make({ code: Code.Type.PaleGreen1_2 });
	/**
	 * Eightbit darkSeaGreen2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen2_2: Type = _make({ code: Code.Type.DarkSeaGreen2_2 });
	/**
	 * Eightbit darkSeaGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen1_1: Type = _make({ code: Code.Type.DarkSeaGreen1_1 });
	/**
	 * Eightbit paleTurquoise1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleTurquoise1: Type = _make({ code: Code.Type.PaleTurquoise1 });
	/**
	 * Eightbit red3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red3_2: Type = _make({ code: Code.Type.Red3_2 });
	/**
	 * Eightbit deepPink3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink3_1: Type = _make({ code: Code.Type.DeepPink3_1 });
	/**
	 * Eightbit deepPink3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink3_2: Type = _make({ code: Code.Type.DeepPink3_2 });
	/**
	 * Eightbit magenta3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta3_2: Type = _make({ code: Code.Type.Magenta3_2 });
	/**
	 * Eightbit magenta3_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta3_3: Type = _make({ code: Code.Type.Magenta3_3 });
	/**
	 * Eightbit magenta2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta2_1: Type = _make({ code: Code.Type.Magenta2_1 });
	/**
	 * Eightbit darkOrange3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOrange3_2: Type = _make({ code: Code.Type.DarkOrange3_2 });
	/**
	 * Eightbit indianRed_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed_2: Type = _make({ code: Code.Type.IndianRed_2 });
	/**
	 * Eightbit hotPink3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink3_2: Type = _make({ code: Code.Type.HotPink3_2 });
	/**
	 * Eightbit hotPink2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink2: Type = _make({ code: Code.Type.HotPink2 });
	/**
	 * Eightbit orchid color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orchid: Type = _make({ code: Code.Type.Orchid });
	/**
	 * Eightbit mediumOrchid1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid1_1: Type = _make({ code: Code.Type.MediumOrchid1_1 });
	/**
	 * Eightbit orange3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange3: Type = _make({ code: Code.Type.Orange3 });
	/**
	 * Eightbit lightSalmon3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSalmon3_2: Type = _make({ code: Code.Type.LightSalmon3_2 });
	/**
	 * Eightbit lightPink3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightPink3: Type = _make({ code: Code.Type.LightPink3 });
	/**
	 * Eightbit pink3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const pink3: Type = _make({ code: Code.Type.Pink3 });
	/**
	 * Eightbit plum3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum3: Type = _make({ code: Code.Type.Plum3 });
	/**
	 * Eightbit violet color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const violet: Type = _make({ code: Code.Type.Violet });
	/**
	 * Eightbit gold3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const gold3_2: Type = _make({ code: Code.Type.Gold3_2 });
	/**
	 * Eightbit lightGoldenRod3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenRod3: Type = _make({ code: Code.Type.LightGoldenRod3 });
	/**
	 * Eightbit tan color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const tan: Type = _make({ code: Code.Type.Tan });
	/**
	 * Eightbit mistyRose3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mistyRose3: Type = _make({ code: Code.Type.MistyRose3 });
	/**
	 * Eightbit thistle3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const thistle3: Type = _make({ code: Code.Type.Thistle3 });
	/**
	 * Eightbit plum2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum2: Type = _make({ code: Code.Type.Plum2 });
	/**
	 * Eightbit yellow3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow3_2: Type = _make({ code: Code.Type.Yellow3_2 });
	/**
	 * Eightbit khaki3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const khaki3: Type = _make({ code: Code.Type.Khaki3 });
	/**
	 * Eightbit lightGoldenRod2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenRod2_1: Type = _make({ code: Code.Type.LightGoldenRod2_1 });
	/**
	 * Eightbit lightYellow3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightYellow3: Type = _make({ code: Code.Type.LightYellow3 });
	/**
	 * Eightbit grey84 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey84: Type = _make({ code: Code.Type.Grey84 });
	/**
	 * Eightbit lightSteelBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSteelBlue1: Type = _make({ code: Code.Type.LightSteelBlue1 });
	/**
	 * Eightbit yellow2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow2: Type = _make({ code: Code.Type.Yellow2 });
	/**
	 * Eightbit darkOliveGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen1_1: Type = _make({ code: Code.Type.DarkOliveGreen1_1 });
	/**
	 * Eightbit darkOliveGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen1_2: Type = _make({ code: Code.Type.DarkOliveGreen1_2 });
	/**
	 * Eightbit darkSeaGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen1_2: Type = _make({ code: Code.Type.DarkSeaGreen1_2 });
	/**
	 * Eightbit honeyDew2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const honeyDew2: Type = _make({ code: Code.Type.HoneyDew2 });
	/**
	 * Eightbit lightCyan1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightCyan1: Type = _make({ code: Code.Type.LightCyan1 });
	/**
	 * Eightbit red1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red1: Type = _make({ code: Code.Type.Red1 });
	/**
	 * Eightbit deepPink2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink2: Type = _make({ code: Code.Type.DeepPink2 });
	/**
	 * Eightbit deepPink1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink1_1: Type = _make({ code: Code.Type.DeepPink1_1 });
	/**
	 * Eightbit deepPink1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink1_2: Type = _make({ code: Code.Type.DeepPink1_2 });
	/**
	 * Eightbit magenta2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta2_2: Type = _make({ code: Code.Type.Magenta2_2 });
	/**
	 * Eightbit magenta1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta1: Type = _make({ code: Code.Type.Magenta1 });
	/**
	 * Eightbit orangeRed1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orangeRed1: Type = _make({ code: Code.Type.OrangeRed1 });
	/**
	 * Eightbit indianRed1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed1_1: Type = _make({ code: Code.Type.IndianRed1_1 });
	/**
	 * Eightbit indianRed1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed1_2: Type = _make({ code: Code.Type.IndianRed1_2 });
	/**
	 * Eightbit hotPink_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink_1: Type = _make({ code: Code.Type.HotPink_1 });
	/**
	 * Eightbit hotPink_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink_2: Type = _make({ code: Code.Type.HotPink_2 });
	/**
	 * Eightbit mediumOrchid1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid1_2: Type = _make({ code: Code.Type.MediumOrchid1_2 });
	/**
	 * Eightbit darkOrange color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOrange: Type = _make({ code: Code.Type.DarkOrange });
	/**
	 * Eightbit salmon1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const salmon1: Type = _make({ code: Code.Type.Salmon1 });
	/**
	 * Eightbit lightCoral color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightCoral: Type = _make({ code: Code.Type.LightCoral });
	/**
	 * Eightbit paleVioletRed1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleVioletRed1: Type = _make({ code: Code.Type.PaleVioletRed1 });
	/**
	 * Eightbit orchid2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orchid2: Type = _make({ code: Code.Type.Orchid2 });
	/**
	 * Eightbit orchid1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orchid1: Type = _make({ code: Code.Type.Orchid1 });
	/**
	 * Eightbit orange1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange1: Type = _make({ code: Code.Type.Orange1 });
	/**
	 * Eightbit sandyBrown color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const sandyBrown: Type = _make({ code: Code.Type.SandyBrown });
	/**
	 * Eightbit lightSalmon1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSalmon1: Type = _make({ code: Code.Type.LightSalmon1 });
	/**
	 * Eightbit lightPink1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightPink1: Type = _make({ code: Code.Type.LightPink1 });
	/**
	 * Eightbit pink1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const pink1: Type = _make({ code: Code.Type.Pink1 });
	/**
	 * Eightbit plum1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum1: Type = _make({ code: Code.Type.Plum1 });
	/**
	 * Eightbit gold1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const gold1: Type = _make({ code: Code.Type.Gold1 });
	/**
	 * Eightbit lightGoldenRod2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenRod2_2: Type = _make({ code: Code.Type.LightGoldenRod2_2 });
	/**
	 * Eightbit lightGoldenRod2_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenRod2_3: Type = _make({ code: Code.Type.LightGoldenRod2_3 });
	/**
	 * Eightbit navajoWhite1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navajoWhite1: Type = _make({ code: Code.Type.NavajoWhite1 });
	/**
	 * Eightbit mistyRose1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mistyRose1: Type = _make({ code: Code.Type.MistyRose1 });
	/**
	 * Eightbit thistle1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const thistle1: Type = _make({ code: Code.Type.Thistle1 });
	/**
	 * Eightbit yellow1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow1: Type = _make({ code: Code.Type.Yellow1 });
	/**
	 * Eightbit lightGoldenRod1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenRod1: Type = _make({ code: Code.Type.LightGoldenRod1 });
	/**
	 * Eightbit khaki1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const khaki1: Type = _make({ code: Code.Type.Khaki1 });
	/**
	 * Eightbit wheat1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const wheat1: Type = _make({ code: Code.Type.Wheat1 });
	/**
	 * Eightbit cornsilk1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cornsilk1: Type = _make({ code: Code.Type.Cornsilk1 });
	/**
	 * Eightbit grey100 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey100: Type = _make({ code: Code.Type.Grey100 });
	/**
	 * Eightbit grey3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey3: Type = _make({ code: Code.Type.Grey3 });
	/**
	 * Eightbit grey7 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey7: Type = _make({ code: Code.Type.Grey7 });
	/**
	 * Eightbit grey11 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey11: Type = _make({ code: Code.Type.Grey11 });
	/**
	 * Eightbit grey15 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey15: Type = _make({ code: Code.Type.Grey15 });
	/**
	 * Eightbit grey19 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey19: Type = _make({ code: Code.Type.Grey19 });
	/**
	 * Eightbit grey23 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey23: Type = _make({ code: Code.Type.Grey23 });
	/**
	 * Eightbit grey27 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey27: Type = _make({ code: Code.Type.Grey27 });
	/**
	 * Eightbit grey30 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey30: Type = _make({ code: Code.Type.Grey30 });
	/**
	 * Eightbit grey35 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey35: Type = _make({ code: Code.Type.Grey35 });
	/**
	 * Eightbit grey39 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey39: Type = _make({ code: Code.Type.Grey39 });
	/**
	 * Eightbit grey42 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey42: Type = _make({ code: Code.Type.Grey42 });
	/**
	 * Eightbit grey46 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey46: Type = _make({ code: Code.Type.Grey46 });
	/**
	 * Eightbit grey50 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey50: Type = _make({ code: Code.Type.Grey50 });
	/**
	 * Eightbit grey54 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey54: Type = _make({ code: Code.Type.Grey54 });
	/**
	 * Eightbit grey58 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey58: Type = _make({ code: Code.Type.Grey58 });
	/**
	 * Eightbit grey62 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey62: Type = _make({ code: Code.Type.Grey62 });
	/**
	 * Eightbit grey66 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey66: Type = _make({ code: Code.Type.Grey66 });
	/**
	 * Eightbit grey70 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey70: Type = _make({ code: Code.Type.Grey70 });
	/**
	 * Eightbit grey74 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey74: Type = _make({ code: Code.Type.Grey74 });
	/**
	 * Eightbit grey78 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey78: Type = _make({ code: Code.Type.Grey78 });
	/**
	 * Eightbit grey82 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey82: Type = _make({ code: Code.Type.Grey82 });
	/**
	 * Eightbit grey85 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey85: Type = _make({ code: Code.Type.Grey85 });
	/**
	 * Eightbit grey89 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey89: Type = _make({ code: Code.Type.Grey89 });
	/**
	 * Eightbit grey93 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey93: Type = _make({ code: Code.Type.Grey93 });
}

/**
 * Namespace for RGB colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Rgb {
	/** ThreeBit color Type */
	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/** Id of this RGB color */
		readonly id: string;

		/**
		 * Red part of this color
		 *
		 * @since 0.0.1
		 */
		readonly redCode: number;

		/**
		 * Green part of this color
		 *
		 * @since 0.0.1
		 */
		readonly greenCode: number;

		/**
		 * Blue part of this color
		 *
		 * @since 0.0.1
		 */
		readonly blueCode: number;

		/**
		 * Gets the sequence of `this`
		 *
		 * @since 0.0.1
		 */
		readonly [_sequenceSymbol]: () => ASAnsiString.NonEmptySequence;

		/** @internal */
		readonly [_TagSymbol]: 'Rgb';

		/** @internal */
		readonly [TypeId]: TypeId;
	}

	/**
	 * Type guard
	 *
	 * @since 0.0.1
	 * @category Guards
	 */

	export const has = (u: unknown): u is Type => _has(u) && isRgb(u);

	/**
	 * Equivalence
	 *
	 * @since 0.0.1
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		self.redCode === that.redCode &&
		self.greenCode === that.greenCode &&
		self.blueCode === that.blueCode;

	/** Prototype */
	const proto: MTypes.Proto<Type> = {
		[TypeId]: TypeId,
		[_TagSymbol]: 'Rgb',
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.redCode,
				Hash.hash,
				Hash.combine(Hash.hash(this.greenCode)),
				Hash.combine(Hash.hash(this.blueCode)),
				Hash.combine(Hash.hash(this[_TagSymbol])),
				Hash.combine(_TypeIdHash),
				Hash.cached(this)
			);
		},
		[_sequenceSymbol](this: Type) {
			return Array.make(38, 2, this.redCode, this.greenCode, this.blueCode);
		},
		[MInspectable.IdSymbol](this: Type) {
			return this.id;
		},
		...MInspectable.BaseProto(moduleTag),
		...MPipeable.BaseProto
	};

	/** Constructor */
	const _make = (params: MTypes.Data<Type>): Type => MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Gets the `id` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

	/**
	 * Gets the `redCode` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const redCode: MTypes.OneArgFunction<Type, number> = Struct.get('redCode');

	/**
	 * Gets the `greenCode` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const greenCode: MTypes.OneArgFunction<Type, number> = Struct.get('greenCode');

	/**
	 * Gets the `blueCode` property of `self`
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const blueCode: MTypes.OneArgFunction<Type, number> = Struct.get('blueCode');

	/** Constructor */
	const _makeShort = (id: string, redCode: number, greenCode: number, blueCode: number): Type =>
		_make({ id: 'Rgb' + id, redCode, greenCode, blueCode });

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
		_makeShort(
			`${red}/${green}/${blue}`,
			pipe(red, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 })),
			pipe(green, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 })),
			pipe(blue, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 }))
		);

	/**
	 * RGB maroon color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const maroon: Type = _makeShort('Maroon', 128, 0, 0);
	/**
	 * RGB darkRed color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkRed: Type = _makeShort('DarkRed', 139, 0, 0);
	/**
	 * RGB brown color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const brown: Type = _makeShort('Brown', 165, 42, 42);
	/**
	 * RGB firebrick color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const firebrick: Type = _makeShort('Firebrick', 178, 34, 34);
	/**
	 * RGB crimson color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const crimson: Type = _makeShort('Crimson', 220, 20, 60);
	/**
	 * RGB red color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const red: Type = _makeShort('Red', 255, 0, 0);
	/**
	 * RGB tomato color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const tomato: Type = _makeShort('Tomato', 255, 99, 71);
	/**
	 * RGB coral color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const coral: Type = _makeShort('Coral', 255, 127, 80);
	/**
	 * RGB indianRed color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const indianRed: Type = _makeShort('IndianRed', 205, 92, 92);
	/**
	 * RGB lightCoral color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightCoral: Type = _makeShort('LightCoral', 240, 128, 128);
	/**
	 * RGB darkSalmon color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkSalmon: Type = _makeShort('DarkSalmon', 233, 150, 122);
	/**
	 * RGB salmon color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const salmon: Type = _makeShort('Salmon', 250, 128, 114);
	/**
	 * RGB lightSalmon color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightSalmon: Type = _makeShort('LightSalmon', 255, 160, 122);
	/**
	 * RGB orangeRed color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const orangeRed: Type = _makeShort('OrangeRed', 255, 69, 0);
	/**
	 * RGB darkOrange color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkOrange: Type = _makeShort('DarkOrange', 255, 140, 0);
	/**
	 * RGB orange color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const orange: Type = _makeShort('Orange', 255, 165, 0);
	/**
	 * RGB gold color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const gold: Type = _makeShort('Gold', 255, 215, 0);
	/**
	 * RGB darkGoldenRod color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkGoldenRod: Type = _makeShort('DarkGoldenRod', 184, 134, 11);
	/**
	 * RGB goldenRod color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const goldenRod: Type = _makeShort('GoldenRod', 218, 165, 32);
	/**
	 * RGB paleGoldenRod color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const paleGoldenRod: Type = _makeShort('PaleGoldenRod', 238, 232, 170);
	/**
	 * RGB darkKhaki color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkKhaki: Type = _makeShort('DarkKhaki', 189, 183, 107);
	/**
	 * RGB khaki color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const khaki: Type = _makeShort('Khaki', 240, 230, 140);
	/**
	 * RGB olive color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const olive: Type = _makeShort('Olive', 128, 128, 0);
	/**
	 * RGB yellow color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const yellow: Type = _makeShort('Yellow', 255, 255, 0);
	/**
	 * RGB yellowGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const yellowGreen: Type = _makeShort('YellowGreen', 154, 205, 50);
	/**
	 * RGB darkOliveGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkOliveGreen: Type = _makeShort('DarkOliveGreen', 85, 107, 47);
	/**
	 * RGB oliveDrab color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const oliveDrab: Type = _makeShort('OliveDrab', 107, 142, 35);
	/**
	 * RGB lawnGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lawnGreen: Type = _makeShort('LawnGreen', 124, 252, 0);
	/**
	 * RGB chartreuse color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const chartreuse: Type = _makeShort('Chartreuse', 127, 255, 0);
	/**
	 * RGB greenYellow color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const greenYellow: Type = _makeShort('GreenYellow', 173, 255, 47);
	/**
	 * RGB darkGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkGreen: Type = _makeShort('DarkGreen', 0, 100, 0);
	/**
	 * RGB green color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const green: Type = _makeShort('Green', 0, 128, 0);
	/**
	 * RGB forestGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const forestGreen: Type = _makeShort('ForestGreen', 34, 139, 34);
	/**
	 * RGB lime color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lime: Type = _makeShort('Lime', 0, 255, 0);
	/**
	 * RGB limeGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const limeGreen: Type = _makeShort('LimeGreen', 50, 205, 50);
	/**
	 * RGB lightGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightGreen: Type = _makeShort('LightGreen', 144, 238, 144);
	/**
	 * RGB paleGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const paleGreen: Type = _makeShort('PaleGreen', 152, 251, 152);
	/**
	 * RGB darkSeaGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkSeaGreen: Type = _makeShort('DarkSeaGreen', 143, 188, 143);
	/**
	 * RGB mediumSpringGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mediumSpringGreen: Type = _makeShort('MediumSpringGreen', 0, 250, 154);
	/**
	 * RGB springGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const springGreen: Type = _makeShort('SpringGreen', 0, 255, 127);
	/**
	 * RGB seaGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const seaGreen: Type = _makeShort('SeaGreen', 46, 139, 87);
	/**
	 * RGB mediumAquaMarine color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mediumAquaMarine: Type = _makeShort('MediumAquaMarine', 102, 205, 170);
	/**
	 * RGB mediumSeaGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mediumSeaGreen: Type = _makeShort('MediumSeaGreen', 60, 179, 113);
	/**
	 * RGB lightSeaGreen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightSeaGreen: Type = _makeShort('LightSeaGreen', 32, 178, 170);
	/**
	 * RGB darkSlateGray color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkSlateGray: Type = _makeShort('DarkSlateGray', 47, 79, 79);
	/**
	 * RGB teal color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const teal: Type = _makeShort('Teal', 0, 128, 128);
	/**
	 * RGB darkCyan color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkCyan: Type = _makeShort('DarkCyan', 0, 139, 139);
	/**
	 * RGB aqua color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const aqua: Type = _makeShort('Aqua', 0, 255, 255);
	/**
	 * RGB cyan color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const cyan: Type = _makeShort('Cyan', 0, 255, 255);
	/**
	 * RGB lightCyan color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightCyan: Type = _makeShort('LightCyan', 224, 255, 255);
	/**
	 * RGB darkTurquoise color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkTurquoise: Type = _makeShort('DarkTurquoise', 0, 206, 209);
	/**
	 * RGB turquoise color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const turquoise: Type = _makeShort('Turquoise', 64, 224, 208);
	/**
	 * RGB mediumTurquoise color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mediumTurquoise: Type = _makeShort('MediumTurquoise', 72, 209, 204);
	/**
	 * RGB paleTurquoise color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const paleTurquoise: Type = _makeShort('PaleTurquoise', 175, 238, 238);
	/**
	 * RGB aquaMarine color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const aquaMarine: Type = _makeShort('AquaMarine', 127, 255, 212);
	/**
	 * RGB powderBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const powderBlue: Type = _makeShort('PowderBlue', 176, 224, 230);
	/**
	 * RGB cadetBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const cadetBlue: Type = _makeShort('CadetBlue', 95, 158, 160);
	/**
	 * RGB steelBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const steelBlue: Type = _makeShort('SteelBlue', 70, 130, 180);
	/**
	 * RGB cornFlowerBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const cornFlowerBlue: Type = _makeShort('CornFlowerBlue', 100, 149, 237);
	/**
	 * RGB deepSkyBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const deepSkyBlue: Type = _makeShort('DeepSkyBlue', 0, 191, 255);
	/**
	 * RGB dodgerBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const dodgerBlue: Type = _makeShort('DodgerBlue', 30, 144, 255);
	/**
	 * RGB lightBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightBlue: Type = _makeShort('LightBlue', 173, 216, 230);
	/**
	 * RGB skyBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const skyBlue: Type = _makeShort('SkyBlue', 135, 206, 235);
	/**
	 * RGB lightSkyBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightSkyBlue: Type = _makeShort('LightSkyBlue', 135, 206, 250);
	/**
	 * RGB midnightBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const midnightBlue: Type = _makeShort('MidnightBlue', 25, 25, 112);
	/**
	 * RGB navy color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const navy: Type = _makeShort('Navy', 0, 0, 128);
	/**
	 * RGB darkBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkBlue: Type = _makeShort('DarkBlue', 0, 0, 139);
	/**
	 * RGB mediumBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mediumBlue: Type = _makeShort('MediumBlue', 0, 0, 205);
	/**
	 * RGB blue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const blue: Type = _makeShort('Blue', 0, 0, 255);
	/**
	 * RGB royalBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const royalBlue: Type = _makeShort('RoyalBlue', 65, 105, 225);
	/**
	 * RGB blueViolet color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const blueViolet: Type = _makeShort('BlueViolet', 138, 43, 226);
	/**
	 * RGB indigo color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const indigo: Type = _makeShort('Indigo', 75, 0, 130);
	/**
	 * RGB darkSlateBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkSlateBlue: Type = _makeShort('DarkSlateBlue', 72, 61, 139);
	/**
	 * RGB slateBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const slateBlue: Type = _makeShort('SlateBlue', 106, 90, 205);
	/**
	 * RGB mediumSlateBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mediumSlateBlue: Type = _makeShort('MediumSlateBlue', 123, 104, 238);
	/**
	 * RGB mediumPurple color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mediumPurple: Type = _makeShort('MediumPurple', 147, 112, 219);
	/**
	 * RGB darkMagenta color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkMagenta: Type = _makeShort('DarkMagenta', 139, 0, 139);
	/**
	 * RGB darkViolet color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkViolet: Type = _makeShort('DarkViolet', 148, 0, 211);
	/**
	 * RGB darkOrchid color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkOrchid: Type = _makeShort('DarkOrchid', 153, 50, 204);
	/**
	 * RGB mediumOrchid2 color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mediumOrchid2: Type = _makeShort('MediumOrchid2', 186, 85, 211);
	/**
	 * RGB purple color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const purple: Type = _makeShort('Purple', 128, 0, 128);
	/**
	 * RGB thistle color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const thistle: Type = _makeShort('Thistle', 216, 191, 216);
	/**
	 * RGB plum color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const plum: Type = _makeShort('Plum', 221, 160, 221);
	/**
	 * RGB violet color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const violet: Type = _makeShort('Violet', 238, 130, 238);
	/**
	 * RGB magenta color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const magenta: Type = _makeShort('Magenta', 255, 0, 255);
	/**
	 * RGB orchid color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const orchid: Type = _makeShort('Orchid', 218, 112, 214);
	/**
	 * RGB mediumVioletRed color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mediumVioletRed: Type = _makeShort('MediumVioletRed', 199, 21, 133);
	/**
	 * RGB paleVioletRed color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const paleVioletRed: Type = _makeShort('PaleVioletRed', 219, 112, 147);
	/**
	 * RGB deepPink color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const deepPink: Type = _makeShort('DeepPink', 255, 20, 147);
	/**
	 * RGB hotPink color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const hotPink: Type = _makeShort('HotPink', 255, 105, 180);
	/**
	 * RGB lightPink color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightPink: Type = _makeShort('LightPink', 255, 182, 193);
	/**
	 * RGB pink color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const pink: Type = _makeShort('Pink', 255, 192, 203);
	/**
	 * RGB antiqueWhite color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const antiqueWhite: Type = _makeShort('AntiqueWhite', 250, 235, 215);
	/**
	 * RGB beige color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const beige: Type = _makeShort('Beige', 245, 245, 220);
	/**
	 * RGB bisque color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const bisque: Type = _makeShort('Bisque', 255, 228, 196);
	/**
	 * RGB blanchedAlmond color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const blanchedAlmond: Type = _makeShort('BlanchedAlmond', 255, 235, 205);
	/**
	 * RGB wheat color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const wheat: Type = _makeShort('Wheat', 245, 222, 179);
	/**
	 * RGB cornSilk color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const cornSilk: Type = _makeShort('CornSilk', 255, 248, 220);
	/**
	 * RGB lemonChiffon color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lemonChiffon: Type = _makeShort('LemonChiffon', 255, 250, 205);
	/**
	 * RGB lightGoldenRodYellow color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightGoldenRodYellow: Type = _makeShort('LightGoldenRodYellow', 250, 250, 210);
	/**
	 * RGB lightYellow color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightYellow: Type = _makeShort('LightYellow', 255, 255, 224);
	/**
	 * RGB saddleBrown color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const saddleBrown: Type = _makeShort('SaddleBrown', 139, 69, 19);
	/**
	 * RGB sienna color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const sienna: Type = _makeShort('Sienna', 160, 82, 45);
	/**
	 * RGB chocolate color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const chocolate: Type = _makeShort('Chocolate', 210, 105, 30);
	/**
	 * RGB peru color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const peru: Type = _makeShort('Peru', 205, 133, 63);
	/**
	 * RGB sandyBrown color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const sandyBrown: Type = _makeShort('SandyBrown', 244, 164, 96);
	/**
	 * RGB burlyWood color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const burlyWood: Type = _makeShort('BurlyWood', 222, 184, 135);
	/**
	 * RGB tan color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const tan: Type = _makeShort('Tan', 210, 180, 140);
	/**
	 * RGB rosyBrown color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const rosyBrown: Type = _makeShort('RosyBrown', 188, 143, 143);
	/**
	 * RGB moccasin color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const moccasin: Type = _makeShort('Moccasin', 255, 228, 181);
	/**
	 * RGB navajoWhite color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const navajoWhite: Type = _makeShort('NavajoWhite', 255, 222, 173);
	/**
	 * RGB peachPuff color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const peachPuff: Type = _makeShort('PeachPuff', 255, 218, 185);
	/**
	 * RGB mistyRose color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mistyRose: Type = _makeShort('MistyRose', 255, 228, 225);
	/**
	 * RGB lavenderBlush color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lavenderBlush: Type = _makeShort('LavenderBlush', 255, 240, 245);
	/**
	 * RGB linen color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const linen: Type = _makeShort('Linen', 250, 240, 230);
	/**
	 * RGB oldLace color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const oldLace: Type = _makeShort('OldLace', 253, 245, 230);
	/**
	 * RGB papayaWhip color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const papayaWhip: Type = _makeShort('PapayaWhip', 255, 239, 213);
	/**
	 * RGB seaShell color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const seaShell: Type = _makeShort('SeaShell', 255, 245, 238);
	/**
	 * RGB mintCream color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const mintCream: Type = _makeShort('MintCream', 245, 255, 250);
	/**
	 * RGB slateGray color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const slateGray: Type = _makeShort('SlateGray', 112, 128, 144);
	/**
	 * RGB lightSlateGray color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightSlateGray: Type = _makeShort('LightSlateGray', 119, 136, 153);
	/**
	 * RGB lightSteelBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightSteelBlue: Type = _makeShort('LightSteelBlue', 176, 196, 222);
	/**
	 * RGB lavender color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lavender: Type = _makeShort('Lavender', 230, 230, 250);
	/**
	 * RGB floralWhite color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const floralWhite: Type = _makeShort('FloralWhite', 255, 250, 240);
	/**
	 * RGB aliceBlue color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const aliceBlue: Type = _makeShort('AliceBlue', 240, 248, 255);
	/**
	 * RGB ghostWhite color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const ghostWhite: Type = _makeShort('GhostWhite', 248, 248, 255);
	/**
	 * RGB honeyDew color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const honeyDew: Type = _makeShort('HoneyDew', 240, 255, 240);
	/**
	 * RGB ivory color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const ivory: Type = _makeShort('Ivory', 255, 255, 240);
	/**
	 * RGB azure color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const azure: Type = _makeShort('Azure', 240, 255, 255);
	/**
	 * RGB snow color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const snow: Type = _makeShort('Snow', 255, 250, 250);
	/**
	 * RGB black color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const black: Type = _makeShort('Black', 0, 0, 0);
	/**
	 * RGB dimGray color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const dimGray: Type = _makeShort('DimGray', 105, 105, 105);
	/**
	 * RGB gray color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const gray: Type = _makeShort('Gray', 128, 128, 128);
	/**
	 * RGB darkGray color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const darkGray: Type = _makeShort('DarkGray', 169, 169, 169);
	/**
	 * RGB silver color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const silver: Type = _makeShort('Silver', 192, 192, 192);
	/**
	 * RGB lightGray color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const lightGray: Type = _makeShort('LightGray', 211, 211, 211);
	/**
	 * RGB gainsboro color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const gainsboro: Type = _makeShort('Gainsboro', 220, 220, 220);
	/**
	 * RGB whiteSmoke color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const whiteSmoke: Type = _makeShort('WhiteSmoke', 245, 245, 245);
	/**
	 * RGB white color
	 *
	 * @since 0.0.1
	 * @category RGB instances
	 */
	export const white: Type = _makeShort('White', 255, 255, 255);
}

/**
 * Equivalence
 *
 * @since 0.0.1
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	isThreeBit(self) && isThreeBit(that) ? ThreeBit.equivalence(self, that)
	: isEightBit(self) && isEightBit(that) ? EightBit.equivalence(self, that)
	: isRgb(self) && isRgb(that) ? Rgb.equivalence(self, that)
	: false;

/**
 * Gets the id of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toId = (self: Type): string => self[MInspectable.IdSymbol]();

/**
 * Gets the sequence of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toSequence = (self: Type): ASAnsiString.NonEmptySequence => self[_sequenceSymbol]();
