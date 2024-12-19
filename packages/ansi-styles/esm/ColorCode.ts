/**
 * This module defines color codes for the 16 original colors and the 256 eight-bit colors
 *
 * @since 0.0.1
 */

import { MMatch, MTypes } from '@parischap/effect-lib';
import { flow } from 'effect';

/**
 * Namespace for three-bit color codes
 *
 * @since 0.0.1
 * @category Models
 */
export namespace ThreeBit {
	/**
	 * Three-bit color codes
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
	 * Builds the id of a color from its code
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

	/**
	 * Builds an object containing the code and id of a color
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const withId = (self: Type) => ({ offset: self, id: toId(self) });
}

/**
 * Namespace for eight-bit color codes
 *
 * @since 0.0.1
 * @category Models
 */
export namespace EightBit {
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

	/**
	 * Builds an object containing the code and id of a color
	 *
	 * @since 0.0.1
	 * @category Destructors
	 */
	export const withId = (self: Type) => ({ code: self, id: toId(self) });
}
