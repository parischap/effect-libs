/**
 * This module defines all available ANSI colors
 *
 * You can use the RGB.make function to build more RGB colors
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
import * as ASAnsiString from './AnsiString.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/ansi-styles/Color/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;
const _TypeIdHash = Hash.hash(_TypeId);

const _tagSymbol: unique symbol = Symbol.for(moduleTag + '_tagSymbol/');
const _threeBitTag = 'ThreeBit';
const _eightBitTag = 'EightBit';
const _rgbTag = 'Rgb';
const _threeBitTagHash = Hash.hash(_threeBitTag);
const _eightBitTagHash = Hash.hash(_eightBitTag);
const _rgbTagHash = Hash.hash(_rgbTag);

const _sequenceSymbol: unique symbol = Symbol.for(moduleTag + '_sequenceSymbol/');

/**
 * Type of a Color
 *
 * @category Models
 */
export type Type = ThreeBit.Type | EightBit.Type | Rgb.Type;

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);
const _has = has;

/**
 * Type guard
 *
 * @category Guards
 */
export const isThreeBit = (u: Type): u is ThreeBit.Type => u[_tagSymbol] === _threeBitTag;

/**
 * Type guard
 *
 * @category Guards
 */
export const isEightBit = (u: Type): u is EightBit.Type => u[_tagSymbol] === _eightBitTag;

/**
 * Type guard
 *
 * @category Guards
 */
export const isRgb = (u: Type): u is Rgb.Type => u[_tagSymbol] === _rgbTag;

/**
 * Namespace for three-bit colors
 *
 * @category Models
 */
export namespace ThreeBit {
	/**
	 * Namespace for three-bit color offsets
	 *
	 * @category Models
	 */
	export namespace Offset {
		/**
		 * Three-bit color offsets
		 *
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

	/**
	 * ThreeBit color Type
	 *
	 * @category Models
	 */
	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/** Offset of this color */
		readonly offset: Offset.Type;

		/** Indicates whether the color is bright */
		readonly isBright: boolean;

		/** Gets the sequence of `this` */
		readonly [_sequenceSymbol]: () => ASAnsiString.NonEmptySequence;

		/** @internal */
		readonly [_tagSymbol]: typeof _threeBitTag;

		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */

	export const has = (u: unknown): u is Type => _has(u) && isThreeBit(u);

	/**
	 * Equivalence
	 *
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		self.offset === that.offset && self.isBright === that.isBright;

	/** Proto */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		[_tagSymbol]: _threeBitTag,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.offset,
				Hash.hash,
				Hash.combine(Hash.hash(this.isBright)),
				Hash.combine(_threeBitTagHash),
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
	 * @category Destructors
	 */
	export const offset: MTypes.OneArgFunction<Type, Offset.Type> = Struct.get('offset');

	/**
	 * Gets the `isBright` property of `self`
	 *
	 * @category Destructors
	 */
	export const isBright: MTypes.OneArgFunction<Type, boolean> = Struct.get('isBright');

	/**
	 * Constructor of normal colors
	 *
	 * @category Constructors
	 */
	export const make = (offset: Offset.Type) => _make({ offset, isBright: false });

	/**
	 * Namespace for bright three-bit colors
	 *
	 * @category Models
	 */
	export namespace Bright {
		/**
		 * Constructor of bright colors
		 *
		 * @category Original instances
		 */
		export const make = (offset: Offset.Type) => _make({ offset, isBright: true });
	}
}

/**
 * Namespace for eight-bit colors
 *
 * @category Models
 */
export namespace EightBit {
	/**
	 * Namespace for eight-bit color codes
	 *
	 * @category Models
	 */
	export namespace Code {
		/**
		 * Eight-bit color codes
		 *
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

	/**
	 * EightBit color Type
	 *
	 * @category Models
	 */
	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/** Code of this color */
		readonly code: Code.Type;

		/** Gets the sequence of `this` */
		readonly [_sequenceSymbol]: () => ASAnsiString.NonEmptySequence;

		/** @internal */
		readonly [_tagSymbol]: typeof _eightBitTag;

		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */
	export const has = (u: unknown): u is Type => _has(u) && isEightBit(u);

	/**
	 * Equivalence
	 *
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) => self.code === that.code;

	/** Base */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		[_tagSymbol]: _eightBitTag,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.code,
				Hash.hash,
				Hash.combine(_eightBitTagHash),
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

	/**
	 * Constructor
	 *
	 * @category Constructors
	 */
	export const make = (params: MTypes.Data<Type>): Type =>
		MTypes.objectFromDataAndProto(proto, params);

	/**
	 * Gets the `code` property of `self`
	 *
	 * @category Destructors
	 */
	export const code: MTypes.OneArgFunction<Type, Code.Type> = Struct.get('code');
}

/**
 * Namespace for RGB colors
 *
 * @category Models
 */
export namespace Rgb {
	/**
	 * ThreeBit color Type
	 *
	 * @category Models
	 */
	export interface Type extends Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
		/** Id of this RGB color */
		readonly id: string;

		/** Red part of this color */
		readonly redCode: number;

		/** Green part of this color */
		readonly greenCode: number;

		/** Blue part of this color */
		readonly blueCode: number;

		/** Gets the sequence of `this` */
		readonly [_sequenceSymbol]: () => ASAnsiString.NonEmptySequence;

		/** @internal */
		readonly [_tagSymbol]: typeof _rgbTag;

		/** @internal */
		readonly [_TypeId]: _TypeId;
	}

	/**
	 * Type guard
	 *
	 * @category Guards
	 */

	export const has = (u: unknown): u is Type => _has(u) && isRgb(u);

	/**
	 * Equivalence
	 *
	 * @category Equivalences
	 */
	export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
		self.redCode === that.redCode &&
		self.greenCode === that.greenCode &&
		self.blueCode === that.blueCode;

	/** Base */
	const proto: MTypes.Proto<Type> = {
		[_TypeId]: _TypeId,
		[_tagSymbol]: _rgbTag,
		[Equal.symbol](this: Type, that: unknown): boolean {
			return has(that) && equivalence(this, that);
		},
		[Hash.symbol](this: Type) {
			return pipe(
				this.redCode,
				Hash.hash,
				Hash.combine(Hash.hash(this.greenCode)),
				Hash.combine(Hash.hash(this.blueCode)),
				Hash.combine(_rgbTagHash),
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
	 * @category Destructors
	 */
	export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

	/**
	 * Gets the `redCode` property of `self`
	 *
	 * @category Destructors
	 */
	export const redCode: MTypes.OneArgFunction<Type, number> = Struct.get('redCode');

	/**
	 * Gets the `greenCode` property of `self`
	 *
	 * @category Destructors
	 */
	export const greenCode: MTypes.OneArgFunction<Type, number> = Struct.get('greenCode');

	/**
	 * Gets the `blueCode` property of `self`
	 *
	 * @category Destructors
	 */
	export const blueCode: MTypes.OneArgFunction<Type, number> = Struct.get('blueCode');

	/**
	 * Constructor of predefined RGB colors
	 *
	 * @category Constructors
	 */
	export const makeShort = (
		id: string,
		redCode: number,
		greenCode: number,
		blueCode: number
	): Type => _make({ id: 'Rgb' + id, redCode, greenCode, blueCode });

	/**
	 * Constructor
	 *
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
		makeShort(
			`${red}/${green}/${blue}`,
			pipe(red, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 })),
			pipe(green, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 })),
			pipe(blue, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 }))
		);
}

/**
 * Equivalence
 *
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
 * @category Destructors
 */
export const toId = (self: Type): string => self[MInspectable.IdSymbol]();

/**
 * Gets the sequence of `self`
 *
 * @category Destructors
 */
export const toSequence = (self: Type): ASAnsiString.NonEmptySequence => self[_sequenceSymbol]();

// Color instances have been placed outside the namespaces because namespace content does not get documented by docgen
/**
 * Original Black color instance
 *
 * @category Original instances
 */
export const threeBitBlack: ThreeBit.Type = ThreeBit.make(ThreeBit.Offset.Type.Black);
/**
 * Original Red color instance
 *
 * @category Original instances
 */
export const threeBitRed: ThreeBit.Type = ThreeBit.make(ThreeBit.Offset.Type.Red);
/**
 * Original Green color instance
 *
 * @category Original instances
 */
export const threeBitGreen: ThreeBit.Type = ThreeBit.make(ThreeBit.Offset.Type.Green);
/**
 * Original Yellow color instance
 *
 * @category Original instances
 */
export const threeBitYellow: ThreeBit.Type = ThreeBit.make(ThreeBit.Offset.Type.Yellow);
/**
 * Original Blue color instance
 *
 * @category Original instances
 */
export const threeBitBlue: ThreeBit.Type = ThreeBit.make(ThreeBit.Offset.Type.Blue);
/**
 * Original Magenta color instance
 *
 * @category Original instances
 */
export const threeBitMagenta: ThreeBit.Type = ThreeBit.make(ThreeBit.Offset.Type.Magenta);
/**
 * Original Cyan color instance
 *
 * @category Original instances
 */
export const threeBitCyan: ThreeBit.Type = ThreeBit.make(ThreeBit.Offset.Type.Cyan);
/**
 * Original White color instance
 *
 * @category Original instances
 */
export const threeBitWhite: ThreeBit.Type = ThreeBit.make(ThreeBit.Offset.Type.White);

/**
 * Original Bright Black color instance
 *
 * @category Original instances
 */
export const threeBitBrightBlack: ThreeBit.Type = ThreeBit.Bright.make(ThreeBit.Offset.Type.Black);
/**
 * Original Bright Red color instance
 *
 * @category Original instances
 */
export const threeBitBrightRed: ThreeBit.Type = ThreeBit.Bright.make(ThreeBit.Offset.Type.Red);
/**
 * Original Bright Green color instance
 *
 * @category Original instances
 */
export const threeBitBrightGreen: ThreeBit.Type = ThreeBit.Bright.make(ThreeBit.Offset.Type.Green);
/**
 * Original Bright Yellow color instance
 *
 * @category Original instances
 */
export const threeBitBrightYellow: ThreeBit.Type = ThreeBit.Bright.make(
	ThreeBit.Offset.Type.Yellow
);
/**
 * Original Bright Blue color instance
 *
 * @category Original instances
 */
export const threeBitBrightBlue: ThreeBit.Type = ThreeBit.Bright.make(ThreeBit.Offset.Type.Blue);
/**
 * Original Bright Magenta color instance
 *
 * @category Original instances
 */
export const threeBitBrightMagenta: ThreeBit.Type = ThreeBit.Bright.make(
	ThreeBit.Offset.Type.Magenta
);
/**
 * Original Bright Cyan color instance
 *
 * @category Original instances
 */
export const threeBitBrightCyan: ThreeBit.Type = ThreeBit.Bright.make(ThreeBit.Offset.Type.Cyan);
/**
 * Original Bright White color instance
 *
 * @category Original instances
 */
export const threeBitBrightWhite: ThreeBit.Type = ThreeBit.Bright.make(ThreeBit.Offset.Type.White);

/**
 * Eightbit Black Color instance
 *
 * @category EightBit instances
 */
export const eightBitBlack: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Black });
/**
 * Eightbit Maroon Color instance
 *
 * @category EightBit instances
 */
export const eightBitMaroon: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Maroon });
/**
 * Eightbit Green Color instance
 *
 * @category EightBit instances
 */
export const eightBitGreen: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Green });
/**
 * Eightbit Olive Color instance
 *
 * @category EightBit instances
 */
export const eightBitOlive: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Olive });
/**
 * Eightbit Navy Color instance
 *
 * @category EightBit instances
 */
export const eightBitNavy: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Navy });
/**
 * Eightbit Purple_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPurple_1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Purple_1 });
/**
 * Eightbit Teal Color instance
 *
 * @category EightBit instances
 */
export const eightBitTeal: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Teal });
/**
 * Eightbit Silver Color instance
 *
 * @category EightBit instances
 */
export const eightBitSilver: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Silver });
/**
 * Eightbit Grey Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey });
/**
 * Eightbit Red Color instance
 *
 * @category EightBit instances
 */
export const eightBitRed: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Red });
/**
 * Eightbit Lime Color instance
 *
 * @category EightBit instances
 */
export const eightBitLime: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Lime });
/**
 * Eightbit Yellow Color instance
 *
 * @category EightBit instances
 */
export const eightBitYellow: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Yellow });
/**
 * Eightbit Blue Color instance
 *
 * @category EightBit instances
 */
export const eightBitBlue: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Blue });
/**
 * Eightbit Fuchsia Color instance
 *
 * @category EightBit instances
 */
export const eightBitFuchsia: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Fuchsia });
/**
 * Eightbit Aqua Color instance
 *
 * @category EightBit instances
 */
export const eightBitAqua: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Aqua });
/**
 * Eightbit White Color instance
 *
 * @category EightBit instances
 */
export const eightBitWhite: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.White });
/**
 * Eightbit Grey0 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey0: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey0 });
/**
 * Eightbit NavyBlue Color instance
 *
 * @category EightBit instances
 */
export const eightBitNavyBlue: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.NavyBlue });
/**
 * Eightbit DarkBlue Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkBlue: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.DarkBlue });
/**
 * Eightbit Blue3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitBlue3_1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Blue3_1 });
/**
 * Eightbit Blue3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitBlue3_2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Blue3_2 });
/**
 * Eightbit Blue1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitBlue1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Blue1 });
/**
 * Eightbit DarkGreen Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkGreen: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkGreen
});
/**
 * Eightbit DeepSkyBlue4_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepSkyBlue4_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepSkyBlue4_1
});
/**
 * Eightbit DeepSkyBlue4_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepSkyBlue4_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepSkyBlue4_2
});
/**
 * Eightbit DeepSkyBlue4_3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepSkyBlue4_3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepSkyBlue4_3
});
/**
 * Eightbit DodgerBlue3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDodgerBlue3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DodgerBlue3
});
/**
 * Eightbit DodgerBlue2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDodgerBlue2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DodgerBlue2
});
/**
 * Eightbit Green4 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGreen4: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Green4 });
/**
 * Eightbit SpringGreen4 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSpringGreen4: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SpringGreen4
});
/**
 * Eightbit Turquoise4 Color instance
 *
 * @category EightBit instances
 */
export const eightBitTurquoise4: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Turquoise4
});
/**
 * Eightbit DeepSkyBlue3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepSkyBlue3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepSkyBlue3_1
});
/**
 * Eightbit DeepSkyBlue3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepSkyBlue3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepSkyBlue3_2
});
/**
 * Eightbit DodgerBlue1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDodgerBlue1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DodgerBlue1
});
/**
 * Eightbit Green3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGreen3_1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Green3_1 });
/**
 * Eightbit SpringGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSpringGreen3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SpringGreen3_1
});
/**
 * Eightbit DarkCyan Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkCyan: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.DarkCyan });
/**
 * Eightbit LightSeaGreen Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSeaGreen: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSeaGreen
});
/**
 * Eightbit DeepSkyBlue2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepSkyBlue2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepSkyBlue2
});
/**
 * Eightbit DeepSkyBlue1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepSkyBlue1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepSkyBlue1
});
/**
 * Eightbit Green3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGreen3_2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Green3_2 });
/**
 * Eightbit SpringGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSpringGreen3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SpringGreen3_2
});
/**
 * Eightbit SpringGreen2_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSpringGreen2_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SpringGreen2_1
});
/**
 * Eightbit Cyan3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitCyan3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Cyan3 });
/**
 * Eightbit DarkTurquoise Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkTurquoise: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkTurquoise
});
/**
 * Eightbit Turquoise2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitTurquoise2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Turquoise2
});
/**
 * Eightbit Green1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGreen1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Green1 });
/**
 * Eightbit SpringGreen2_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSpringGreen2_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SpringGreen2_2
});
/**
 * Eightbit SpringGreen1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSpringGreen1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SpringGreen1
});
/**
 * Eightbit MediumSpringGreen Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumSpringGreen: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumSpringGreen
});
/**
 * Eightbit Cyan2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitCyan2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Cyan2 });
/**
 * Eightbit Cyan1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitCyan1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Cyan1 });
/**
 * Eightbit DarkRed_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkRed_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkRed_1
});
/**
 * Eightbit DeepPink4_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepPink4_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepPink4_1
});
/**
 * Eightbit Purple4_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPurple4_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Purple4_1
});
/**
 * Eightbit Purple4_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPurple4_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Purple4_2
});
/**
 * Eightbit Purple3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPurple3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Purple3 });
/**
 * Eightbit BlueViolet Color instance
 *
 * @category EightBit instances
 */
export const eightBitBlueViolet: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.BlueViolet
});
/**
 * Eightbit Orange4_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitOrange4_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Orange4_1
});
/**
 * Eightbit Grey37 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey37: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey37 });
/**
 * Eightbit MediumPurple4 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumPurple4: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumPurple4
});
/**
 * Eightbit SlateBlue3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSlateBlue3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SlateBlue3_1
});
/**
 * Eightbit SlateBlue3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSlateBlue3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SlateBlue3_2
});
/**
 * Eightbit RoyalBlue1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitRoyalBlue1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.RoyalBlue1
});
/**
 * Eightbit Chartreuse4 Color instance
 *
 * @category EightBit instances
 */
export const eightBitChartreuse4: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Chartreuse4
});
/**
 * Eightbit DarkSeaGreen4_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSeaGreen4_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSeaGreen4_1
});
/**
 * Eightbit PaleTurquoise4 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPaleTurquoise4: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.PaleTurquoise4
});
/**
 * Eightbit SteelBlue Color instance
 *
 * @category EightBit instances
 */
export const eightBitSteelBlue: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SteelBlue
});
/**
 * Eightbit SteelBlue3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSteelBlue3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SteelBlue3
});
/**
 * Eightbit CornflowerBlue Color instance
 *
 * @category EightBit instances
 */
export const eightBitCornflowerBlue: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.CornflowerBlue
});
/**
 * Eightbit Chartreuse3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitChartreuse3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Chartreuse3_1
});
/**
 * Eightbit DarkSeaGreen4_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSeaGreen4_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSeaGreen4_2
});
/**
 * Eightbit CadetBlue_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitCadetBlue_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.CadetBlue_1
});
/**
 * Eightbit CadetBlue_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitCadetBlue_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.CadetBlue_2
});
/**
 * Eightbit SkyBlue3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSkyBlue3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.SkyBlue3 });
/**
 * Eightbit SteelBlue1_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSteelBlue1_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SteelBlue1_1
});
/**
 * Eightbit Chartreuse3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitChartreuse3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Chartreuse3_2
});
/**
 * Eightbit PaleGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPaleGreen3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.PaleGreen3_1
});
/**
 * Eightbit SeaGreen3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSeaGreen3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SeaGreen3
});
/**
 * Eightbit Aquamarine3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitAquamarine3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Aquamarine3
});
/**
 * Eightbit MediumTurquoise Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumTurquoise: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumTurquoise
});
/**
 * Eightbit SteelBlue1_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSteelBlue1_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SteelBlue1_2
});
/**
 * Eightbit Chartreuse2_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitChartreuse2_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Chartreuse2_1
});
/**
 * Eightbit SeaGreen2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSeaGreen2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SeaGreen2
});
/**
 * Eightbit SeaGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSeaGreen1_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SeaGreen1_1
});
/**
 * Eightbit SeaGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSeaGreen1_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SeaGreen1_2
});
/**
 * Eightbit Aquamarine1_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitAquamarine1_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Aquamarine1_1
});
/**
 * Eightbit DarkSlateGray2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSlateGray2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSlateGray2
});
/**
 * Eightbit DarkRed_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkRed_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkRed_2
});
/**
 * Eightbit DeepPink4_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepPink4_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepPink4_2
});
/**
 * Eightbit DarkMagenta_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkMagenta_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkMagenta_1
});
/**
 * Eightbit DarkMagenta_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkMagenta_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkMagenta_2
});
/**
 * Eightbit DarkViolet_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkViolet_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkViolet_1
});
/**
 * Eightbit Purple_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPurple_2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Purple_2 });
/**
 * Eightbit Orange4_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitOrange4_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Orange4_2
});
/**
 * Eightbit LightPink4 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightPink4: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightPink4
});
/**
 * Eightbit Plum4 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPlum4: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Plum4 });
/**
 * Eightbit MediumPurple3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumPurple3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumPurple3_1
});
/**
 * Eightbit MediumPurple3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumPurple3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumPurple3_2
});
/**
 * Eightbit SlateBlue1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSlateBlue1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SlateBlue1
});
/**
 * Eightbit Yellow4_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitYellow4_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Yellow4_1
});
/**
 * Eightbit Wheat4 Color instance
 *
 * @category EightBit instances
 */
export const eightBitWheat4: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Wheat4 });
/**
 * Eightbit Grey53 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey53: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey53 });
/**
 * Eightbit LightSlateGrey Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSlateGrey: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSlateGrey
});
/**
 * Eightbit MediumPurple Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumPurple: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumPurple
});
/**
 * Eightbit LightSlateBlue Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSlateBlue: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSlateBlue
});
/**
 * Eightbit Yellow4_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitYellow4_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Yellow4_2
});
/**
 * Eightbit DarkOliveGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkOliveGreen3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkOliveGreen3_1
});
/**
 * Eightbit DarkSeaGreen Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSeaGreen: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSeaGreen
});
/**
 * Eightbit LightSkyBlue3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSkyBlue3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSkyBlue3_1
});
/**
 * Eightbit LightSkyBlue3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSkyBlue3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSkyBlue3_2
});
/**
 * Eightbit SkyBlue2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSkyBlue2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.SkyBlue2 });
/**
 * Eightbit Chartreuse2_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitChartreuse2_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Chartreuse2_2
});
/**
 * Eightbit DarkOliveGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkOliveGreen3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkOliveGreen3_2
});
/**
 * Eightbit PaleGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPaleGreen3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.PaleGreen3_2
});
/**
 * Eightbit DarkSeaGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSeaGreen3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSeaGreen3_1
});
/**
 * Eightbit DarkSlateGray3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSlateGray3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSlateGray3
});
/**
 * Eightbit SkyBlue1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSkyBlue1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.SkyBlue1 });
/**
 * Eightbit Chartreuse1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitChartreuse1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Chartreuse1
});
/**
 * Eightbit LightGreen_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightGreen_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightGreen_1
});
/**
 * Eightbit LightGreen_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightGreen_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightGreen_2
});
/**
 * Eightbit PaleGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPaleGreen1_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.PaleGreen1_1
});
/**
 * Eightbit Aquamarine1_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitAquamarine1_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Aquamarine1_2
});
/**
 * Eightbit DarkSlateGray1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSlateGray1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSlateGray1
});
/**
 * Eightbit Red3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitRed3_1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Red3_1 });
/**
 * Eightbit DeepPink4_3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepPink4_3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepPink4_3
});
/**
 * Eightbit MediumVioletRed Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumVioletRed: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumVioletRed
});
/**
 * Eightbit Magenta3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMagenta3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Magenta3_1
});
/**
 * Eightbit DarkViolet_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkViolet_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkViolet_2
});
/**
 * Eightbit Purple_3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPurple_3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Purple_3 });
/**
 * Eightbit DarkOrange3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkOrange3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkOrange3_1
});
/**
 * Eightbit IndianRed_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitIndianRed_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.IndianRed_1
});
/**
 * Eightbit HotPink3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitHotPink3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.HotPink3_1
});
/**
 * Eightbit MediumOrchid3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumOrchid3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumOrchid3
});
/**
 * Eightbit MediumOrchid Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumOrchid: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumOrchid
});
/**
 * Eightbit MediumPurple2_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumPurple2_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumPurple2_1
});
/**
 * Eightbit DarkGoldenRod Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkGoldenRod: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkGoldenRod
});
/**
 * Eightbit LightSalmon3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSalmon3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSalmon3_1
});
/**
 * Eightbit RosyBrown Color instance
 *
 * @category EightBit instances
 */
export const eightBitRosyBrown: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.RosyBrown
});
/**
 * Eightbit Grey63 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey63: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey63 });
/**
 * Eightbit MediumPurple2_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumPurple2_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumPurple2_2
});
/**
 * Eightbit MediumPurple1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumPurple1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumPurple1
});
/**
 * Eightbit Gold3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGold3_1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Gold3_1 });
/**
 * Eightbit DarkKhaki Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkKhaki: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkKhaki
});
/**
 * Eightbit NavajoWhite3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitNavajoWhite3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.NavajoWhite3
});
/**
 * Eightbit Grey69 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey69: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey69 });
/**
 * Eightbit LightSteelBlue3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSteelBlue3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSteelBlue3
});
/**
 * Eightbit LightSteelBlue Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSteelBlue: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSteelBlue
});
/**
 * Eightbit Yellow3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitYellow3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Yellow3_1
});
/**
 * Eightbit DarkOliveGreen3_3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkOliveGreen3_3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkOliveGreen3_3
});
/**
 * Eightbit DarkSeaGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSeaGreen3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSeaGreen3_2
});
/**
 * Eightbit DarkSeaGreen2_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSeaGreen2_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSeaGreen2_1
});
/**
 * Eightbit LightCyan3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightCyan3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightCyan3
});
/**
 * Eightbit LightSkyBlue1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSkyBlue1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSkyBlue1
});
/**
 * Eightbit GreenYellow Color instance
 *
 * @category EightBit instances
 */
export const eightBitGreenYellow: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.GreenYellow
});
/**
 * Eightbit DarkOliveGreen2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkOliveGreen2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkOliveGreen2
});
/**
 * Eightbit PaleGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPaleGreen1_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.PaleGreen1_2
});
/**
 * Eightbit DarkSeaGreen2_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSeaGreen2_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSeaGreen2_2
});
/**
 * Eightbit DarkSeaGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSeaGreen1_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSeaGreen1_1
});
/**
 * Eightbit PaleTurquoise1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPaleTurquoise1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.PaleTurquoise1
});
/**
 * Eightbit Red3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitRed3_2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Red3_2 });
/**
 * Eightbit DeepPink3_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepPink3_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepPink3_1
});
/**
 * Eightbit DeepPink3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepPink3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepPink3_2
});
/**
 * Eightbit Magenta3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMagenta3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Magenta3_2
});
/**
 * Eightbit Magenta3_3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMagenta3_3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Magenta3_3
});
/**
 * Eightbit Magenta2_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMagenta2_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Magenta2_1
});
/**
 * Eightbit DarkOrange3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkOrange3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkOrange3_2
});
/**
 * Eightbit IndianRed_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitIndianRed_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.IndianRed_2
});
/**
 * Eightbit HotPink3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitHotPink3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.HotPink3_2
});
/**
 * Eightbit HotPink2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitHotPink2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.HotPink2 });
/**
 * Eightbit Orchid Color instance
 *
 * @category EightBit instances
 */
export const eightBitOrchid: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Orchid });
/**
 * Eightbit MediumOrchid1_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumOrchid1_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumOrchid1_1
});
/**
 * Eightbit Orange3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitOrange3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Orange3 });
/**
 * Eightbit LightSalmon3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSalmon3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSalmon3_2
});
/**
 * Eightbit LightPink3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightPink3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightPink3
});
/**
 * Eightbit Pink3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPink3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Pink3 });
/**
 * Eightbit Plum3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPlum3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Plum3 });
/**
 * Eightbit Violet Color instance
 *
 * @category EightBit instances
 */
export const eightBitViolet: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Violet });
/**
 * Eightbit Gold3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGold3_2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Gold3_2 });
/**
 * Eightbit LightGoldenRod3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightGoldenRod3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightGoldenRod3
});
/**
 * Eightbit Tan Color instance
 *
 * @category EightBit instances
 */
export const eightBitTan: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Tan });
/**
 * Eightbit MistyRose3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMistyRose3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MistyRose3
});
/**
 * Eightbit Thistle3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitThistle3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Thistle3 });
/**
 * Eightbit Plum2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPlum2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Plum2 });
/**
 * Eightbit Yellow3_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitYellow3_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Yellow3_2
});
/**
 * Eightbit Khaki3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitKhaki3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Khaki3 });
/**
 * Eightbit LightGoldenRod2_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightGoldenRod2_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightGoldenRod2_1
});
/**
 * Eightbit LightYellow3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightYellow3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightYellow3
});
/**
 * Eightbit Grey84 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey84: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey84 });
/**
 * Eightbit LightSteelBlue1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSteelBlue1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSteelBlue1
});
/**
 * Eightbit Yellow2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitYellow2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Yellow2 });
/**
 * Eightbit DarkOliveGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkOliveGreen1_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkOliveGreen1_1
});
/**
 * Eightbit DarkOliveGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkOliveGreen1_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkOliveGreen1_2
});
/**
 * Eightbit DarkSeaGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkSeaGreen1_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkSeaGreen1_2
});
/**
 * Eightbit HoneyDew2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitHoneyDew2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.HoneyDew2
});
/**
 * Eightbit LightCyan1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightCyan1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightCyan1
});
/**
 * Eightbit Red1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitRed1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Red1 });
/**
 * Eightbit DeepPink2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepPink2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepPink2
});
/**
 * Eightbit DeepPink1_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepPink1_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepPink1_1
});
/**
 * Eightbit DeepPink1_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitDeepPink1_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DeepPink1_2
});
/**
 * Eightbit Magenta2_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMagenta2_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Magenta2_2
});
/**
 * Eightbit Magenta1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMagenta1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Magenta1 });
/**
 * Eightbit OrangeRed1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitOrangeRed1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.OrangeRed1
});
/**
 * Eightbit IndianRed1_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitIndianRed1_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.IndianRed1_1
});
/**
 * Eightbit IndianRed1_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitIndianRed1_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.IndianRed1_2
});
/**
 * Eightbit HotPink_1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitHotPink_1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.HotPink_1
});
/**
 * Eightbit HotPink_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitHotPink_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.HotPink_2
});
/**
 * Eightbit MediumOrchid1_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMediumOrchid1_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MediumOrchid1_2
});
/**
 * Eightbit DarkOrange Color instance
 *
 * @category EightBit instances
 */
export const eightBitDarkOrange: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.DarkOrange
});
/**
 * Eightbit Salmon1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitSalmon1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Salmon1 });
/**
 * Eightbit LightCoral Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightCoral: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightCoral
});
/**
 * Eightbit PaleVioletRed1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPaleVioletRed1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.PaleVioletRed1
});
/**
 * Eightbit Orchid2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitOrchid2: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Orchid2 });
/**
 * Eightbit Orchid1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitOrchid1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Orchid1 });
/**
 * Eightbit Orange1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitOrange1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Orange1 });
/**
 * Eightbit SandyBrown Color instance
 *
 * @category EightBit instances
 */
export const eightBitSandyBrown: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.SandyBrown
});
/**
 * Eightbit LightSalmon1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightSalmon1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightSalmon1
});
/**
 * Eightbit LightPink1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightPink1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightPink1
});
/**
 * Eightbit Pink1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPink1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Pink1 });
/**
 * Eightbit Plum1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitPlum1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Plum1 });
/**
 * Eightbit Gold1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGold1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Gold1 });
/**
 * Eightbit LightGoldenRod2_2 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightGoldenRod2_2: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightGoldenRod2_2
});
/**
 * Eightbit LightGoldenRod2_3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightGoldenRod2_3: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightGoldenRod2_3
});
/**
 * Eightbit NavajoWhite1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitNavajoWhite1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.NavajoWhite1
});
/**
 * Eightbit MistyRose1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitMistyRose1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.MistyRose1
});
/**
 * Eightbit Thistle1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitThistle1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Thistle1 });
/**
 * Eightbit Yellow1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitYellow1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Yellow1 });
/**
 * Eightbit LightGoldenRod1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitLightGoldenRod1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.LightGoldenRod1
});
/**
 * Eightbit Khaki1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitKhaki1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Khaki1 });
/**
 * Eightbit Wheat1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitWheat1: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Wheat1 });
/**
 * Eightbit Cornsilk1 Color instance
 *
 * @category EightBit instances
 */
export const eightBitCornsilk1: EightBit.Type = EightBit.make({
	code: EightBit.Code.Type.Cornsilk1
});
/**
 * Eightbit Grey100 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey100: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey100 });
/**
 * Eightbit Grey3 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey3: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey3 });
/**
 * Eightbit Grey7 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey7: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey7 });
/**
 * Eightbit Grey11 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey11: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey11 });
/**
 * Eightbit Grey15 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey15: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey15 });
/**
 * Eightbit Grey19 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey19: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey19 });
/**
 * Eightbit Grey23 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey23: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey23 });
/**
 * Eightbit Grey27 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey27: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey27 });
/**
 * Eightbit Grey30 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey30: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey30 });
/**
 * Eightbit Grey35 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey35: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey35 });
/**
 * Eightbit Grey39 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey39: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey39 });
/**
 * Eightbit Grey42 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey42: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey42 });
/**
 * Eightbit Grey46 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey46: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey46 });
/**
 * Eightbit Grey50 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey50: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey50 });
/**
 * Eightbit Grey54 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey54: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey54 });
/**
 * Eightbit Grey58 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey58: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey58 });
/**
 * Eightbit Grey62 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey62: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey62 });
/**
 * Eightbit Grey66 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey66: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey66 });
/**
 * Eightbit Grey70 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey70: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey70 });
/**
 * Eightbit Grey74 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey74: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey74 });
/**
 * Eightbit Grey78 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey78: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey78 });
/**
 * Eightbit Grey82 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey82: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey82 });
/**
 * Eightbit Grey85 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey85: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey85 });
/**
 * Eightbit Grey89 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey89: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey89 });
/**
 * Eightbit Grey93 Color instance
 *
 * @category EightBit instances
 */
export const eightBitGrey93: EightBit.Type = EightBit.make({ code: EightBit.Code.Type.Grey93 });

/**
 * RGB AliceBlue Color instance
 *
 * @category EightBit instances
 */
export const rgbAliceBlue: Rgb.Type = Rgb.makeShort('AliceBlue', 240, 248, 255);
/**
 * RGB AntiqueWhite Color instance
 *
 * @category RGB instances
 */
export const rgbAntiqueWhite: Rgb.Type = Rgb.makeShort('AntiqueWhite', 250, 235, 215);
/**
 * RGB Aqua Color instance
 *
 * @category RGB instances
 */
export const rgbAqua: Rgb.Type = Rgb.makeShort('Aqua', 0, 255, 255);
/**
 * RGB AquaMarine Color instance
 *
 * @category RGB instances
 */
export const rgbAquaMarine: Rgb.Type = Rgb.makeShort('AquaMarine', 127, 255, 212);
/**
 * RGB Azure Color instance
 *
 * @category RGB instances
 */
export const rgbAzure: Rgb.Type = Rgb.makeShort('Azure', 240, 255, 255);
/**
 * RGB Beige Color instance
 *
 * @category RGB instances
 */
export const rgbBeige: Rgb.Type = Rgb.makeShort('Beige', 245, 245, 220);
/**
 * RGB Bisque Color instance
 *
 * @category RGB instances
 */
export const rgbBisque: Rgb.Type = Rgb.makeShort('Bisque', 255, 228, 196);
/**
 * RGB Black Color instance
 *
 * @category RGB instances
 */
export const rgbBlack: Rgb.Type = Rgb.makeShort('Black', 0, 0, 0);
/**
 * RGB BlanchedAlmond Color instance
 *
 * @category RGB instances
 */
export const rgbBlanchedAlmond: Rgb.Type = Rgb.makeShort('BlanchedAlmond', 255, 235, 205);
/**
 * RGB Blue Color instance
 *
 * @category RGB instances
 */
export const rgbBlue: Rgb.Type = Rgb.makeShort('Blue', 0, 0, 255);
/**
 * RGB BlueViolet Color instance
 *
 * @category RGB instances
 */
export const rgbBlueViolet: Rgb.Type = Rgb.makeShort('BlueViolet', 138, 43, 226);
/**
 * RGB Brown Color instance
 *
 * @category RGB instances
 */
export const rgbBrown: Rgb.Type = Rgb.makeShort('Brown', 165, 42, 42);
/**
 * RGB BurlyWood Color instance
 *
 * @category RGB instances
 */
export const rgbBurlyWood: Rgb.Type = Rgb.makeShort('BurlyWood', 222, 184, 135);
/**
 * RGB CadetBlue Color instance
 *
 * @category RGB instances
 */
export const rgbCadetBlue: Rgb.Type = Rgb.makeShort('CadetBlue', 95, 158, 160);
/**
 * RGB Chartreuse Color instance
 *
 * @category RGB instances
 */
export const rgbChartreuse: Rgb.Type = Rgb.makeShort('Chartreuse', 127, 255, 0);
/**
 * RGB Chocolate Color instance
 *
 * @category RGB instances
 */
export const rgbChocolate: Rgb.Type = Rgb.makeShort('Chocolate', 210, 105, 30);
/**
 * RGB Coral Color instance
 *
 * @category RGB instances
 */
export const rgbCoral: Rgb.Type = Rgb.makeShort('Coral', 255, 127, 80);
/**
 * RGB CornFlowerBlue Color instance
 *
 * @category RGB instances
 */
export const rgbCornFlowerBlue: Rgb.Type = Rgb.makeShort('CornFlowerBlue', 100, 149, 237);
/**
 * RGB CornSilk Color instance
 *
 * @category RGB instances
 */
export const rgbCornSilk: Rgb.Type = Rgb.makeShort('CornSilk', 255, 248, 220);
/**
 * RGB Crimson Color instance
 *
 * @category RGB instances
 */
export const rgbCrimson: Rgb.Type = Rgb.makeShort('Crimson', 220, 20, 60);
/**
 * RGB Cyan Color instance
 *
 * @category RGB instances
 */
export const rgbCyan: Rgb.Type = Rgb.makeShort('Cyan', 0, 255, 255);
/**
 * RGB DarkBlue Color instance
 *
 * @category RGB instances
 */
export const rgbDarkBlue: Rgb.Type = Rgb.makeShort('DarkBlue', 0, 0, 139);
/**
 * RGB DarkCyan Color instance
 *
 * @category RGB instances
 */
export const rgbDarkCyan: Rgb.Type = Rgb.makeShort('DarkCyan', 0, 139, 139);
/**
 * RGB DarkGoldenRod Color instance
 *
 * @category RGB instances
 */
export const rgbDarkGoldenRod: Rgb.Type = Rgb.makeShort('DarkGoldenRod', 184, 134, 11);
/**
 * RGB DarkGray Color instance
 *
 * @category RGB instances
 */
export const rgbDarkGray: Rgb.Type = Rgb.makeShort('DarkGray', 169, 169, 169);
/**
 * RGB DarkGreen Color instance
 *
 * @category RGB instances
 */
export const rgbDarkGreen: Rgb.Type = Rgb.makeShort('DarkGreen', 0, 100, 0);
/**
 * RGB DarkKhaki Color instance
 *
 * @category RGB instances
 */
export const rgbDarkKhaki: Rgb.Type = Rgb.makeShort('DarkKhaki', 189, 183, 107);
/**
 * RGB DarkMagenta Color instance
 *
 * @category RGB instances
 */
export const rgbDarkMagenta: Rgb.Type = Rgb.makeShort('DarkMagenta', 139, 0, 139);
/**
 * RGB DarkOliveGreen Color instance
 *
 * @category RGB instances
 */
export const rgbDarkOliveGreen: Rgb.Type = Rgb.makeShort('DarkOliveGreen', 85, 107, 47);
/**
 * RGB DarkOrange Color instance
 *
 * @category RGB instances
 */
export const rgbDarkOrange: Rgb.Type = Rgb.makeShort('DarkOrange', 255, 140, 0);
/**
 * RGB DarkOrchid Color instance
 *
 * @category RGB instances
 */
export const rgbDarkOrchid: Rgb.Type = Rgb.makeShort('DarkOrchid', 153, 50, 204);
/**
 * RGB DarkRed Color instance
 *
 * @category RGB instances
 */
export const rgbDarkRed: Rgb.Type = Rgb.makeShort('DarkRed', 139, 0, 0);
/**
 * RGB DarkSalmon Color instance
 *
 * @category RGB instances
 */
export const rgbDarkSalmon: Rgb.Type = Rgb.makeShort('DarkSalmon', 233, 150, 122);
/**
 * RGB DarkSeaGreen Color instance
 *
 * @category RGB instances
 */
export const rgbDarkSeaGreen: Rgb.Type = Rgb.makeShort('DarkSeaGreen', 143, 188, 143);
/**
 * RGB DarkSlateBlue Color instance
 *
 * @category RGB instances
 */
export const rgbDarkSlateBlue: Rgb.Type = Rgb.makeShort('DarkSlateBlue', 72, 61, 139);
/**
 * RGB DarkSlateGray Color instance
 *
 * @category RGB instances
 */
export const rgbDarkSlateGray: Rgb.Type = Rgb.makeShort('DarkSlateGray', 47, 79, 79);
/**
 * RGB DarkTurquoise Color instance
 *
 * @category RGB instances
 */
export const rgbDarkTurquoise: Rgb.Type = Rgb.makeShort('DarkTurquoise', 0, 206, 209);
/**
 * RGB DarkViolet Color instance
 *
 * @category RGB instances
 */
export const rgbDarkViolet: Rgb.Type = Rgb.makeShort('DarkViolet', 148, 0, 211);
/**
 * RGB DeepPink Color instance
 *
 * @category RGB instances
 */
export const rgbDeepPink: Rgb.Type = Rgb.makeShort('DeepPink', 255, 20, 147);
/**
 * RGB DeepSkyBlue Color instance
 *
 * @category RGB instances
 */
export const rgbDeepSkyBlue: Rgb.Type = Rgb.makeShort('DeepSkyBlue', 0, 191, 255);
/**
 * RGB DimGray Color instance
 *
 * @category RGB instances
 */
export const rgbDimGray: Rgb.Type = Rgb.makeShort('DimGray', 105, 105, 105);
/**
 * RGB DodgerBlue Color instance
 *
 * @category RGB instances
 */
export const rgbDodgerBlue: Rgb.Type = Rgb.makeShort('DodgerBlue', 30, 144, 255);
/**
 * RGB Firebrick Color instance
 *
 * @category RGB instances
 */
export const rgbFirebrick: Rgb.Type = Rgb.makeShort('Firebrick', 178, 34, 34);
/**
 * RGB FloralWhite Color instance
 *
 * @category RGB instances
 */
export const rgbFloralWhite: Rgb.Type = Rgb.makeShort('FloralWhite', 255, 250, 240);
/**
 * RGB ForestGreen Color instance
 *
 * @category RGB instances
 */
export const rgbForestGreen: Rgb.Type = Rgb.makeShort('ForestGreen', 34, 139, 34);
/**
 * RGB Gainsboro Color instance
 *
 * @category RGB instances
 */
export const rgbGainsboro: Rgb.Type = Rgb.makeShort('Gainsboro', 220, 220, 220);
/**
 * RGB GhostWhite Color instance
 *
 * @category RGB instances
 */
export const rgbGhostWhite: Rgb.Type = Rgb.makeShort('GhostWhite', 248, 248, 255);
/**
 * RGB Gold Color instance
 *
 * @category RGB instances
 */
export const rgbGold: Rgb.Type = Rgb.makeShort('Gold', 255, 215, 0);
/**
 * RGB GoldenRod Color instance
 *
 * @category RGB instances
 */
export const rgbGoldenRod: Rgb.Type = Rgb.makeShort('GoldenRod', 218, 165, 32);
/**
 * RGB Gray Color instance
 *
 * @category RGB instances
 */
export const rgbGray: Rgb.Type = Rgb.makeShort('Gray', 128, 128, 128);
/**
 * RGB Green Color instance
 *
 * @category RGB instances
 */
export const rgbGreen: Rgb.Type = Rgb.makeShort('Green', 0, 128, 0);
/**
 * RGB GreenYellow Color instance
 *
 * @category RGB instances
 */
export const rgbGreenYellow: Rgb.Type = Rgb.makeShort('GreenYellow', 173, 255, 47);
/**
 * RGB HoneyDew Color instance
 *
 * @category RGB instances
 */
export const rgbHoneyDew: Rgb.Type = Rgb.makeShort('HoneyDew', 240, 255, 240);
/**
 * RGB HotPink Color instance
 *
 * @category RGB instances
 */
export const rgbHotPink: Rgb.Type = Rgb.makeShort('HotPink', 255, 105, 180);
/**
 * RGB IndianRed Color instance
 *
 * @category RGB instances
 */
export const rgbIndianRed: Rgb.Type = Rgb.makeShort('IndianRed', 205, 92, 92);
/**
 * RGB Indigo Color instance
 *
 * @category RGB instances
 */
export const rgbIndigo: Rgb.Type = Rgb.makeShort('Indigo', 75, 0, 130);
/**
 * RGB Ivory Color instance
 *
 * @category RGB instances
 */
export const rgbIvory: Rgb.Type = Rgb.makeShort('Ivory', 255, 255, 240);
/**
 * RGB Khaki Color instance
 *
 * @category RGB instances
 */
export const rgbKhaki: Rgb.Type = Rgb.makeShort('Khaki', 240, 230, 140);
/**
 * RGB Lavender Color instance
 *
 * @category RGB instances
 */
export const rgbLavender: Rgb.Type = Rgb.makeShort('Lavender', 230, 230, 250);
/**
 * RGB LavenderBlush Color instance
 *
 * @category RGB instances
 */
export const rgbLavenderBlush: Rgb.Type = Rgb.makeShort('LavenderBlush', 255, 240, 245);
/**
 * RGB LawnGreen Color instance
 *
 * @category RGB instances
 */
export const rgbLawnGreen: Rgb.Type = Rgb.makeShort('LawnGreen', 124, 252, 0);
/**
 * RGB LemonChiffon Color instance
 *
 * @category RGB instances
 */
export const rgbLemonChiffon: Rgb.Type = Rgb.makeShort('LemonChiffon', 255, 250, 205);
/**
 * RGB LightBlue Color instance
 *
 * @category RGB instances
 */
export const rgbLightBlue: Rgb.Type = Rgb.makeShort('LightBlue', 173, 216, 230);
/**
 * RGB LightCoral Color instance
 *
 * @category RGB instances
 */
export const rgbLightCoral: Rgb.Type = Rgb.makeShort('LightCoral', 240, 128, 128);
/**
 * RGB LightCyan Color instance
 *
 * @category RGB instances
 */
export const rgbLightCyan: Rgb.Type = Rgb.makeShort('LightCyan', 224, 255, 255);
/**
 * RGB LightGoldenRodYellow Color instance
 *
 * @category RGB instances
 */
export const rgbLightGoldenRodYellow: Rgb.Type = Rgb.makeShort(
	'LightGoldenRodYellow',
	250,
	250,
	210
);
/**
 * RGB LightGray Color instance
 *
 * @category RGB instances
 */
export const rgbLightGray: Rgb.Type = Rgb.makeShort('LightGray', 211, 211, 211);
/**
 * RGB LightGreen Color instance
 *
 * @category RGB instances
 */
export const rgbLightGreen: Rgb.Type = Rgb.makeShort('LightGreen', 144, 238, 144);
/**
 * RGB LightPink Color instance
 *
 * @category RGB instances
 */
export const rgbLightPink: Rgb.Type = Rgb.makeShort('LightPink', 255, 182, 193);
/**
 * RGB LightSalmon Color instance
 *
 * @category RGB instances
 */
export const rgbLightSalmon: Rgb.Type = Rgb.makeShort('LightSalmon', 255, 160, 122);
/**
 * RGB LightSeaGreen Color instance
 *
 * @category RGB instances
 */
export const rgbLightSeaGreen: Rgb.Type = Rgb.makeShort('LightSeaGreen', 32, 178, 170);
/**
 * RGB LightSkyBlue Color instance
 *
 * @category RGB instances
 */
export const rgbLightSkyBlue: Rgb.Type = Rgb.makeShort('LightSkyBlue', 135, 206, 250);
/**
 * RGB LightSlateGray Color instance
 *
 * @category RGB instances
 */
export const rgbLightSlateGray: Rgb.Type = Rgb.makeShort('LightSlateGray', 119, 136, 153);
/**
 * RGB LightSteelBlue Color instance
 *
 * @category RGB instances
 */
export const rgbLightSteelBlue: Rgb.Type = Rgb.makeShort('LightSteelBlue', 176, 196, 222);
/**
 * RGB LightYellow Color instance
 *
 * @category RGB instances
 */
export const rgbLightYellow: Rgb.Type = Rgb.makeShort('LightYellow', 255, 255, 224);
/**
 * RGB Lime Color instance
 *
 * @category RGB instances
 */
export const rgbLime: Rgb.Type = Rgb.makeShort('Lime', 0, 255, 0);
/**
 * RGB LimeGreen Color instance
 *
 * @category RGB instances
 */
export const rgbLimeGreen: Rgb.Type = Rgb.makeShort('LimeGreen', 50, 205, 50);
/**
 * RGB Linen Color instance
 *
 * @category RGB instances
 */
export const rgbLinen: Rgb.Type = Rgb.makeShort('Linen', 250, 240, 230);
/**
 * RGB Magenta Color instance
 *
 * @category RGB instances
 */
export const rgbMagenta: Rgb.Type = Rgb.makeShort('Magenta', 255, 0, 255);
/**
 * RGB Maroon Color instance
 *
 * @category RGB instances
 */
export const rgbMaroon: Rgb.Type = Rgb.makeShort('Maroon', 128, 0, 0);
/**
 * RGB MediumAquaMarine Color instance
 *
 * @category RGB instances
 */
export const rgbMediumAquaMarine: Rgb.Type = Rgb.makeShort('MediumAquaMarine', 102, 205, 170);
/**
 * RGB MediumBlue Color instance
 *
 * @category RGB instances
 */
export const rgbMediumBlue: Rgb.Type = Rgb.makeShort('MediumBlue', 0, 0, 205);
/**
 * RGB MediumOrchid2 Color instance
 *
 * @category RGB instances
 */
export const rgbMediumOrchid2: Rgb.Type = Rgb.makeShort('MediumOrchid2', 186, 85, 211);
/**
 * RGB MediumPurple Color instance
 *
 * @category RGB instances
 */
export const rgbMediumPurple: Rgb.Type = Rgb.makeShort('MediumPurple', 147, 112, 219);
/**
 * RGB MediumSeaGreen Color instance
 *
 * @category RGB instances
 */
export const rgbMediumSeaGreen: Rgb.Type = Rgb.makeShort('MediumSeaGreen', 60, 179, 113);
/**
 * RGB MediumSlateBlue Color instance
 *
 * @category RGB instances
 */
export const rgbMediumSlateBlue: Rgb.Type = Rgb.makeShort('MediumSlateBlue', 123, 104, 238);
/**
 * RGB MediumSpringGreen Color instance
 *
 * @category RGB instances
 */
export const rgbMediumSpringGreen: Rgb.Type = Rgb.makeShort('MediumSpringGreen', 0, 250, 154);
/**
 * RGB MediumTurquoise Color instance
 *
 * @category RGB instances
 */
export const rgbMediumTurquoise: Rgb.Type = Rgb.makeShort('MediumTurquoise', 72, 209, 204);
/**
 * RGB MediumVioletRed Color instance
 *
 * @category RGB instances
 */
export const rgbMediumVioletRed: Rgb.Type = Rgb.makeShort('MediumVioletRed', 199, 21, 133);
/**
 * RGB MidnightBlue Color instance
 *
 * @category RGB instances
 */
export const rgbMidnightBlue: Rgb.Type = Rgb.makeShort('MidnightBlue', 25, 25, 112);
/**
 * RGB MintCream Color instance
 *
 * @category RGB instances
 */
export const rgbMintCream: Rgb.Type = Rgb.makeShort('MintCream', 245, 255, 250);
/**
 * RGB MistyRose Color instance
 *
 * @category RGB instances
 */
export const rgbMistyRose: Rgb.Type = Rgb.makeShort('MistyRose', 255, 228, 225);
/**
 * RGB Moccasin Color instance
 *
 * @category RGB instances
 */
export const rgbMoccasin: Rgb.Type = Rgb.makeShort('Moccasin', 255, 228, 181);
/**
 * RGB NavajoWhite Color instance
 *
 * @category RGB instances
 */
export const rgbNavajoWhite: Rgb.Type = Rgb.makeShort('NavajoWhite', 255, 222, 173);
/**
 * RGB Navy Color instance
 *
 * @category RGB instances
 */
export const rgbNavy: Rgb.Type = Rgb.makeShort('Navy', 0, 0, 128);
/**
 * RGB OldLace Color instance
 *
 * @category RGB instances
 */
export const rgbOldLace: Rgb.Type = Rgb.makeShort('OldLace', 253, 245, 230);
/**
 * RGB Olive Color instance
 *
 * @category RGB instances
 */
export const rgbOlive: Rgb.Type = Rgb.makeShort('Olive', 128, 128, 0);
/**
 * RGB OliveDrab Color instance
 *
 * @category RGB instances
 */
export const rgbOliveDrab: Rgb.Type = Rgb.makeShort('OliveDrab', 107, 142, 35);
/**
 * RGB Orange Color instance
 *
 * @category RGB instances
 */
export const rgbOrange: Rgb.Type = Rgb.makeShort('Orange', 255, 165, 0);
/**
 * RGB OrangeRed Color instance
 *
 * @category RGB instances
 */
export const rgbOrangeRed: Rgb.Type = Rgb.makeShort('OrangeRed', 255, 69, 0);
/**
 * RGB Orchid Color instance
 *
 * @category RGB instances
 */
export const rgbOrchid: Rgb.Type = Rgb.makeShort('Orchid', 218, 112, 214);
/**
 * RGB PaleGoldenRod Color instance
 *
 * @category RGB instances
 */
export const rgbPaleGoldenRod: Rgb.Type = Rgb.makeShort('PaleGoldenRod', 238, 232, 170);
/**
 * RGB PaleGreen Color instance
 *
 * @category RGB instances
 */
export const rgbPaleGreen: Rgb.Type = Rgb.makeShort('PaleGreen', 152, 251, 152);
/**
 * RGB PaleTurquoise Color instance
 *
 * @category RGB instances
 */
export const rgbPaleTurquoise: Rgb.Type = Rgb.makeShort('PaleTurquoise', 175, 238, 238);
/**
 * RGB PaleVioletRed Color instance
 *
 * @category RGB instances
 */
export const rgbPaleVioletRed: Rgb.Type = Rgb.makeShort('PaleVioletRed', 219, 112, 147);
/**
 * RGB PapayaWhip Color instance
 *
 * @category RGB instances
 */
export const rgbPapayaWhip: Rgb.Type = Rgb.makeShort('PapayaWhip', 255, 239, 213);
/**
 * RGB PeachPuff Color instance
 *
 * @category RGB instances
 */
export const rgbPeachPuff: Rgb.Type = Rgb.makeShort('PeachPuff', 255, 218, 185);
/**
 * RGB Peru Color instance
 *
 * @category RGB instances
 */
export const rgbPeru: Rgb.Type = Rgb.makeShort('Peru', 205, 133, 63);
/**
 * RGB Pink Color instance
 *
 * @category RGB instances
 */
export const rgbPink: Rgb.Type = Rgb.makeShort('Pink', 255, 192, 203);
/**
 * RGB Plum Color instance
 *
 * @category RGB instances
 */
export const rgbPlum: Rgb.Type = Rgb.makeShort('Plum', 221, 160, 221);
/**
 * RGB PowderBlue Color instance
 *
 * @category RGB instances
 */
export const rgbPowderBlue: Rgb.Type = Rgb.makeShort('PowderBlue', 176, 224, 230);
/**
 * RGB Purple Color instance
 *
 * @category RGB instances
 */
export const rgbPurple: Rgb.Type = Rgb.makeShort('Purple', 128, 0, 128);
/**
 * RGB Red Color instance
 *
 * @category RGB instances
 */
export const rgbRed: Rgb.Type = Rgb.makeShort('Red', 255, 0, 0);
/**
 * RGB RosyBrown Color instance
 *
 * @category RGB instances
 */
export const rgbRosyBrown: Rgb.Type = Rgb.makeShort('RosyBrown', 188, 143, 143);
/**
 * RGB RoyalBlue Color instance
 *
 * @category RGB instances
 */
export const rgbRoyalBlue: Rgb.Type = Rgb.makeShort('RoyalBlue', 65, 105, 225);
/**
 * RGB SaddleBrown Color instance
 *
 * @category RGB instances
 */
export const rgbSaddleBrown: Rgb.Type = Rgb.makeShort('SaddleBrown', 139, 69, 19);
/**
 * RGB Salmon Color instance
 *
 * @category RGB instances
 */
export const rgbSalmon: Rgb.Type = Rgb.makeShort('Salmon', 250, 128, 114);
/**
 * RGB SandyBrown Color instance
 *
 * @category RGB instances
 */
export const rgbSandyBrown: Rgb.Type = Rgb.makeShort('SandyBrown', 244, 164, 96);
/**
 * RGB SeaGreen Color instance
 *
 * @category RGB instances
 */
export const rgbSeaGreen: Rgb.Type = Rgb.makeShort('SeaGreen', 46, 139, 87);
/**
 * RGB SeaShell Color instance
 *
 * @category RGB instances
 */
export const rgbSeaShell: Rgb.Type = Rgb.makeShort('SeaShell', 255, 245, 238);
/**
 * RGB Sienna Color instance
 *
 * @category RGB instances
 */
export const rgbSienna: Rgb.Type = Rgb.makeShort('Sienna', 160, 82, 45);
/**
 * RGB Silver Color instance
 *
 * @category RGB instances
 */
export const rgbSilver: Rgb.Type = Rgb.makeShort('Silver', 192, 192, 192);
/**
 * RGB SkyBlue Color instance
 *
 * @category RGB instances
 */
export const rgbSkyBlue: Rgb.Type = Rgb.makeShort('SkyBlue', 135, 206, 235);
/**
 * RGB SlateBlue Color instance
 *
 * @category RGB instances
 */
export const rgbSlateBlue: Rgb.Type = Rgb.makeShort('SlateBlue', 106, 90, 205);
/**
 * RGB SlateGray Color instance
 *
 * @category RGB instances
 */
export const rgbSlateGray: Rgb.Type = Rgb.makeShort('SlateGray', 112, 128, 144);
/**
 * RGB Snow Color instance
 *
 * @category RGB instances
 */
export const rgbSnow: Rgb.Type = Rgb.makeShort('Snow', 255, 250, 250);
/**
 * RGB SpringGreen Color instance
 *
 * @category RGB instances
 */
export const rgbSpringGreen: Rgb.Type = Rgb.makeShort('SpringGreen', 0, 255, 127);
/**
 * RGB SteelBlue Color instance
 *
 * @category RGB instances
 */
export const rgbSteelBlue: Rgb.Type = Rgb.makeShort('SteelBlue', 70, 130, 180);
/**
 * RGB Tan Color instance
 *
 * @category RGB instances
 */
export const rgbTan: Rgb.Type = Rgb.makeShort('Tan', 210, 180, 140);
/**
 * RGB Teal Color instance
 *
 * @category RGB instances
 */
export const rgbTeal: Rgb.Type = Rgb.makeShort('Teal', 0, 128, 128);
/**
 * RGB Thistle Color instance
 *
 * @category RGB instances
 */
export const rgbThistle: Rgb.Type = Rgb.makeShort('Thistle', 216, 191, 216);
/**
 * RGB Tomato Color instance
 *
 * @category RGB instances
 */
export const rgbTomato: Rgb.Type = Rgb.makeShort('Tomato', 255, 99, 71);
/**
 * RGB Turquoise Color instance
 *
 * @category RGB instances
 */
export const rgbTurquoise: Rgb.Type = Rgb.makeShort('Turquoise', 64, 224, 208);
/**
 * RGB Violet Color instance
 *
 * @category RGB instances
 */
export const rgbViolet: Rgb.Type = Rgb.makeShort('Violet', 238, 130, 238);
/**
 * RGB Wheat Color instance
 *
 * @category RGB instances
 */
export const rgbWheat: Rgb.Type = Rgb.makeShort('Wheat', 245, 222, 179);
/**
 * RGB White Color instance
 *
 * @category RGB instances
 */
export const rgbWhite: Rgb.Type = Rgb.makeShort('White', 255, 255, 255);
/**
 * RGB WhiteSmoke Color instance
 *
 * @category RGB instances
 */
export const rgbWhiteSmoke: Rgb.Type = Rgb.makeShort('WhiteSmoke', 245, 245, 245);
/**
 * RGB Yellow Color instance
 *
 * @category RGB instances
 */
export const rgbYellow: Rgb.Type = Rgb.makeShort('Yellow', 255, 255, 0);
/**
 * RGB YellowGreen Color instance
 *
 * @category RGB instances
 */
export const rgbYellowGreen: Rgb.Type = Rgb.makeShort('YellowGreen', 154, 205, 50);
