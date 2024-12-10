/**
 * This module implements a type that represents an ANSI style as defined in the Select Graphic
 * Rendition subset. Info at
 * https://stackoverflow.com/questions/4842424/list-of-ansi-fgColor-escape-characteristicSequences.
 * A style is simply a sorted array of the StyleCharacteristics that define it.
 *
 * @since 0.0.1
 */

import { MFunction, MInspectable, MMatch, MPipeable, MString, MTypes } from '@parischap/effect-lib';
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
import * as ASStyleCharacteristic from './StyleCharacteristic.js';
import * as ASString from './Text.js';

export const moduleTag = '@parischap/ansi-styles/Style/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

export interface Action {
	(...args: ReadonlyArray<string | ASString.Type>): ASString.Type;
}

/**
 * Type that represents a Style
 *
 * @since 0.0.1
 * @category Models
 */
export interface Type extends Action, Equal.Equal, MInspectable.Inspectable, Pipeable.Pipeable {
	/**
	 * Array of the StyleCharacteristic's defining this style sorted by Category and id. Did not use a
	 * SortedSet because we need some waranties as to the order of equivalent elements when merging
	 * StyleCharacteristic's
	 *
	 * @since 0.0.1
	 */
	readonly characteristics: ReadonlyArray<ASStyleCharacteristic.Type>;

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

// To be removed when Effect 4.0 with structural equality comes out
const _characteristicsEq: Equivalence.Equivalence<ReadonlyArray<ASStyleCharacteristic.Type>> =
	Array.getEquivalence(ASStyleCharacteristic.equivalence);
/**
 * Equivalence
 *
 * @since 0.0.6
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	_characteristicsEq(self.characteristics, that.characteristics);

const _TypeIdHash = Hash.hash(TypeId);
const base: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.characteristics, Hash.array, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return pipe(this.characteristics, Array.map(ASStyleCharacteristic.id), Array.join(''));
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

function _action(this: Type, ...args: ReadonlyArray<string | ASString.Type>): ASString.Type {
	return 0 as never;
}

/** Constructor */
const _make = ({ characteristics }: MTypes.Data<Type>): Type => {
	return Object.assign(MFunction.clone(_action), {
		characteristics,
		...base
	});
};

/**
 * Gets the `characteristics` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const characteristics: MTypes.OneArgFunction<
	Type,
	ReadonlyArray<ASStyleCharacteristic.Type>
> = Struct.get('characteristics');

/**
 * Builds a Style from the combination of two other Styles. If `self` and `that` contain contrary
 * StyleCharacteristic's (e.g `self` contains `Bold` and `that` contains `Dim`), the characteristics
 * in `that` will prevail.
 *
 * @since 0.0.1
 * @category Utils
 */
export const combine =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			characteristics: pipe(
				that.characteristics,
				ASStyleCharacteristic.mergeByCategoryAndId(self.characteristics),
				Array.dedupeAdjacentWith(ASStyleCharacteristic.sameCategoryEquivalence)
			)
		});

/**
 * @since 0.0.1
 * @category Utils
 */
/*const toStringTransformer = (self: Type): MTypes.StringTransformer =>
	pipe(
		self.characteristics,
		Array.map(ASStyleCharacteristic.sequence),
		Array.flatten,
		ASSequenceString.fromNonEmptySequence,
		MString.prepend
	);*/

/** Constructor from a single Characteristic */
export const _fromCharacteritic = (characteristic: ASStyleCharacteristic.Type): Type =>
	_make({
		characteristics: Array.of(characteristic)
	});

/**
 * None Style instance, i.e Style that performs no styling
 *
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = _make({
	characteristics: Array.empty()
});

/**
 * Bold Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bold: Type = _fromCharacteritic(ASStyleCharacteristic.bold);

/**
 * Dim Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: Type = _fromCharacteritic(ASStyleCharacteristic.dim);

/**
 * Normal Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const normal: Type = _fromCharacteritic(ASStyleCharacteristic.normal);

/**
 * Italic Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: Type = _fromCharacteritic(ASStyleCharacteristic.italic);

/**
 * NotItalic Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notItalic: Type = _fromCharacteritic(ASStyleCharacteristic.notItalic);

/**
 * Underlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: Type = _fromCharacteritic(ASStyleCharacteristic.underlined);

/**
 * NotUnderlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notUnderlined: Type = _fromCharacteritic(ASStyleCharacteristic.notUnderlined);

/**
 * Struck-through Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: Type = _fromCharacteritic(ASStyleCharacteristic.struckThrough);

/**
 * NotStruckThrough Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notStruckThrough: Type = _fromCharacteritic(ASStyleCharacteristic.notStruckThrough);

/**
 * Overlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: Type = _fromCharacteritic(ASStyleCharacteristic.overlined);

/**
 * NotOverlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notOverlined: Type = _fromCharacteritic(ASStyleCharacteristic.notOverlined);

/**
 * Inversed Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: Type = _fromCharacteritic(ASStyleCharacteristic.inversed);

/**
 * NotInversed Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notInversed: Type = _fromCharacteritic(ASStyleCharacteristic.notInversed);

/**
 * Hidden Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: Type = _fromCharacteritic(ASStyleCharacteristic.hidden);

/**
 * NotHidden Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notHidden: Type = _fromCharacteritic(ASStyleCharacteristic.notHidden);

/**
 * Slow blink Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const slowBlink: Type = _fromCharacteritic(ASStyleCharacteristic.slowBlink);

/**
 * Fast blink Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const fastBlink: Type = _fromCharacteritic(ASStyleCharacteristic.fastBlink);

/**
 * NoBlink Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const noBlink: Type = _fromCharacteritic(ASStyleCharacteristic.noBlink);

namespace OriginalColorOffset {
	/** 8 ANSI original color offsets */
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

	export const withId = (self: Type) => ({ offset: self, id: toId(self) });
}

/** Standard foreground color Style instance maker */
const _fromOriginalColorOffset: MTypes.OneArgFunction<OriginalColorOffset.Type, Type> = flow(
	OriginalColorOffset.withId,
	ASStyleCharacteristic.standardFgColor,
	_fromCharacteritic
);

/**
 * Original black color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const black: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Black);

/**
 * Original red color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const red: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Red);

/**
 * Original green color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const green: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Green);

/**
 * Original yellow color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const yellow: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Yellow);

/**
 * Original blue color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const blue: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Blue);

/**
 * Original magenta color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const magenta: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Magenta);

/**
 * Original cyan color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const cyan: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Cyan);

/**
 * Original white color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const white: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.White);

/**
 * Namespace for bright original colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Bright {
	/** Bright foreground color Style instance maker */
	const _fromOriginalColorOffset: MTypes.OneArgFunction<OriginalColorOffset.Type, Type> = flow(
		OriginalColorOffset.withId,
		ASStyleCharacteristic.brightFgColor,
		_fromCharacteritic
	);

	/**
	 * Original bright black color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const black: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Black);

	/**
	 * Original bright red color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const red: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Red);

	/**
	 * Original bright green color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const green: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Green);

	/**
	 * Original bright yellow color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const yellow: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Yellow);

	/**
	 * Original bright blue color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const blue: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Blue);

	/**
	 * Original bright magenta color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const magenta: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Magenta);

	/**
	 * Original bright cyan color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const cyan: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Cyan);

	/**
	 * Original bright white color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const white: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.White);
}

/**
 * Namespace for original colors used as background colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Bg {
	/** Standard background color Style instance maker */
	const _fromOriginalColorOffset: MTypes.OneArgFunction<OriginalColorOffset.Type, Type> = flow(
		OriginalColorOffset.withId,
		ASStyleCharacteristic.standardBgColor,
		_fromCharacteritic
	);

	/**
	 * Original black color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const black: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Black);

	/**
	 * Original red color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const red: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Red);

	/**
	 * Original green color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const green: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Green);

	/**
	 * Original yellow color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const yellow: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Yellow);

	/**
	 * Original blue color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const blue: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Blue);

	/**
	 * Original magenta color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const magenta: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Magenta);

	/**
	 * Original cyan color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const cyan: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Cyan);

	/**
	 * Original white color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const white: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.White);

	/**
	 * Namespace for bright original colors used as background colors
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace Bright {
		/** Bright background color Style instance maker */
		const _fromOriginalColorOffset: MTypes.OneArgFunction<OriginalColorOffset.Type, Type> = flow(
			OriginalColorOffset.withId,
			ASStyleCharacteristic.brightBgColor,
			_fromCharacteritic
		);

		/**
		 * Original bright black color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const black: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Black);

		/**
		 * Original bright red color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const red: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Red);

		/**
		 * Original bright green color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const green: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Green);

		/**
		 * Original bright yellow color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const yellow: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Yellow);

		/**
		 * Original bright blue color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const blue: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Blue);

		/**
		 * Original bright magenta color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const magenta: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Magenta);

		/**
		 * Original bright cyan color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const cyan: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.Cyan);

		/**
		 * Original bright white color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const white: Type = _fromOriginalColorOffset(OriginalColorOffset.Type.White);
	}
}

/**
 * Namespace for eight-bit colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace EightBit {
	/** Namespace for eight-bit color codes */
	namespace Code {
		/**
		 * EightBit color codes
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

		export const toId: (self: Code.Type) => string = flow(
			MMatch.make,
			flow(
				flow(
					flow(
						MMatch.whenIs(Code.Type.Black, () => 'Black'),
						MMatch.whenIs(Code.Type.Maroon, () => 'Maroon'),
						MMatch.whenIs(Code.Type.Green, () => 'Green'),
						MMatch.whenIs(Code.Type.Olive, () => 'Olive'),
						MMatch.whenIs(Code.Type.Navy, () => 'Navy'),
						MMatch.whenIs(Code.Type.Purple_1, () => 'Purple_1'),
						MMatch.whenIs(Code.Type.Teal, () => 'Teal'),
						MMatch.whenIs(Code.Type.Silver, () => 'Silver'),
						MMatch.whenIs(Code.Type.Grey, () => 'Grey')
					),
					flow(
						MMatch.whenIs(Code.Type.Red, () => 'Red'),
						MMatch.whenIs(Code.Type.Lime, () => 'Lime'),
						MMatch.whenIs(Code.Type.Yellow, () => 'Yellow'),
						MMatch.whenIs(Code.Type.Blue, () => 'Blue'),
						MMatch.whenIs(Code.Type.Fuchsia, () => 'Fuchsia'),
						MMatch.whenIs(Code.Type.Aqua, () => 'Aqua'),
						MMatch.whenIs(Code.Type.White, () => 'White'),
						MMatch.whenIs(Code.Type.Grey0, () => 'Grey0'),
						MMatch.whenIs(Code.Type.NavyBlue, () => 'NavyBlue')
					),
					flow(
						MMatch.whenIs(Code.Type.DarkBlue, () => 'DarkBlue'),
						MMatch.whenIs(Code.Type.Blue3_1, () => 'Blue3_1'),
						MMatch.whenIs(Code.Type.Blue3_2, () => 'Blue3_2'),
						MMatch.whenIs(Code.Type.Blue1, () => 'Blue1'),
						MMatch.whenIs(Code.Type.DarkGreen, () => 'DarkGreen'),
						MMatch.whenIs(Code.Type.DeepSkyBlue4_1, () => 'DeepSkyBlue4_1'),
						MMatch.whenIs(Code.Type.DeepSkyBlue4_2, () => 'DeepSkyBlue4_2'),
						MMatch.whenIs(Code.Type.DeepSkyBlue4_3, () => 'DeepSkyBlue4_3'),
						MMatch.whenIs(Code.Type.DodgerBlue3, () => 'DodgerBlue3')
					),
					flow(
						MMatch.whenIs(Code.Type.DodgerBlue2, () => 'DodgerBlue2'),
						MMatch.whenIs(Code.Type.Green4, () => 'Green4'),
						MMatch.whenIs(Code.Type.SpringGreen4, () => 'SpringGreen4'),
						MMatch.whenIs(Code.Type.Turquoise4, () => 'Turquoise4'),
						MMatch.whenIs(Code.Type.DeepSkyBlue3_1, () => 'DeepSkyBlue3_1'),
						MMatch.whenIs(Code.Type.DeepSkyBlue3_2, () => 'DeepSkyBlue3_2'),
						MMatch.whenIs(Code.Type.DodgerBlue1, () => 'DodgerBlue1'),
						MMatch.whenIs(Code.Type.Green3_1, () => 'Green3_1'),
						MMatch.whenIs(Code.Type.SpringGreen3_1, () => 'SpringGreen3_1')
					),
					flow(
						MMatch.whenIs(Code.Type.DarkCyan, () => 'DarkCyan'),
						MMatch.whenIs(Code.Type.LightSeaGreen, () => 'LightSeaGreen'),
						MMatch.whenIs(Code.Type.DeepSkyBlue2, () => 'DeepSkyBlue2'),
						MMatch.whenIs(Code.Type.DeepSkyBlue1, () => 'DeepSkyBlue1'),
						MMatch.whenIs(Code.Type.Green3_2, () => 'Green3_2'),
						MMatch.whenIs(Code.Type.SpringGreen3_2, () => 'SpringGreen3_2'),
						MMatch.whenIs(Code.Type.SpringGreen2_1, () => 'SpringGreen2_1'),
						MMatch.whenIs(Code.Type.Cyan3, () => 'Cyan3'),
						MMatch.whenIs(Code.Type.DarkTurquoise, () => 'DarkTurquoise')
					),
					flow(
						MMatch.whenIs(Code.Type.Turquoise2, () => 'Turquoise2'),
						MMatch.whenIs(Code.Type.Green1, () => 'Green1'),
						MMatch.whenIs(Code.Type.SpringGreen2_2, () => 'SpringGreen2_2'),
						MMatch.whenIs(Code.Type.SpringGreen1, () => 'SpringGreen1'),
						MMatch.whenIs(Code.Type.MediumSpringGreen, () => 'MediumSpringGreen'),
						MMatch.whenIs(Code.Type.Cyan2, () => 'Cyan2'),
						MMatch.whenIs(Code.Type.Cyan1, () => 'Cyan1'),
						MMatch.whenIs(Code.Type.DarkRed_1, () => 'DarkRed_1'),
						MMatch.whenIs(Code.Type.DeepPink4_1, () => 'DeepPink4_1')
					),
					flow(
						MMatch.whenIs(Code.Type.Purple4_1, () => 'Purple4_1'),
						MMatch.whenIs(Code.Type.Purple4_2, () => 'Purple4_2'),
						MMatch.whenIs(Code.Type.Purple3, () => 'Purple3'),
						MMatch.whenIs(Code.Type.BlueViolet, () => 'BlueViolet'),
						MMatch.whenIs(Code.Type.Orange4_1, () => 'Orange4_1'),
						MMatch.whenIs(Code.Type.Grey37, () => 'Grey37'),
						MMatch.whenIs(Code.Type.MediumPurple4, () => 'MediumPurple4'),
						MMatch.whenIs(Code.Type.SlateBlue3_1, () => 'SlateBlue3_1'),
						MMatch.whenIs(Code.Type.SlateBlue3_2, () => 'SlateBlue3_2')
					),
					flow(
						MMatch.whenIs(Code.Type.RoyalBlue1, () => 'RoyalBlue1'),
						MMatch.whenIs(Code.Type.Chartreuse4, () => 'Chartreuse4'),
						MMatch.whenIs(Code.Type.DarkSeaGreen4_1, () => 'DarkSeaGreen4_1'),
						MMatch.whenIs(Code.Type.PaleTurquoise4, () => 'PaleTurquoise4'),
						MMatch.whenIs(Code.Type.SteelBlue, () => 'SteelBlue'),
						MMatch.whenIs(Code.Type.SteelBlue3, () => 'SteelBlue3'),
						MMatch.whenIs(Code.Type.CornflowerBlue, () => 'CornflowerBlue'),
						MMatch.whenIs(Code.Type.Chartreuse3_1, () => 'Chartreuse3_1'),
						MMatch.whenIs(Code.Type.DarkSeaGreen4_2, () => 'DarkSeaGreen4_2')
					),
					flow(
						MMatch.whenIs(Code.Type.CadetBlue_1, () => 'CadetBlue_1'),
						MMatch.whenIs(Code.Type.CadetBlue_2, () => 'CadetBlue_2'),
						MMatch.whenIs(Code.Type.SkyBlue3, () => 'SkyBlue3'),
						MMatch.whenIs(Code.Type.SteelBlue1_1, () => 'SteelBlue1_1'),
						MMatch.whenIs(Code.Type.Chartreuse3_2, () => 'Chartreuse3_2'),
						MMatch.whenIs(Code.Type.PaleGreen3_1, () => 'PaleGreen3_1'),
						MMatch.whenIs(Code.Type.SeaGreen3, () => 'SeaGreen3'),
						MMatch.whenIs(Code.Type.Aquamarine3, () => 'Aquamarine3'),
						MMatch.whenIs(Code.Type.MediumTurquoise, () => 'MediumTurquoise')
					)
				),
				flow(
					flow(
						MMatch.whenIs(Code.Type.SteelBlue1_2, () => 'SteelBlue1_2'),
						MMatch.whenIs(Code.Type.Chartreuse2_1, () => 'Chartreuse2_1'),
						MMatch.whenIs(Code.Type.SeaGreen2, () => 'SeaGreen2'),
						MMatch.whenIs(Code.Type.SeaGreen1_1, () => 'SeaGreen1_1'),
						MMatch.whenIs(Code.Type.SeaGreen1_2, () => 'SeaGreen1_2'),
						MMatch.whenIs(Code.Type.Aquamarine1_1, () => 'Aquamarine1_1'),
						MMatch.whenIs(Code.Type.DarkSlateGray2, () => 'DarkSlateGray2'),
						MMatch.whenIs(Code.Type.DarkRed_2, () => 'DarkRed_2'),
						MMatch.whenIs(Code.Type.DeepPink4_2, () => 'DeepPink4_2')
					),
					flow(
						MMatch.whenIs(Code.Type.DarkMagenta_1, () => 'DarkMagenta_1'),
						MMatch.whenIs(Code.Type.DarkMagenta_2, () => 'DarkMagenta_2'),
						MMatch.whenIs(Code.Type.DarkViolet_1, () => 'DarkViolet_1'),
						MMatch.whenIs(Code.Type.Purple_2, () => 'Purple_2'),
						MMatch.whenIs(Code.Type.Orange4_2, () => 'Orange4_2'),
						MMatch.whenIs(Code.Type.LightPink4, () => 'LightPink4'),
						MMatch.whenIs(Code.Type.Plum4, () => 'Plum4'),
						MMatch.whenIs(Code.Type.MediumPurple3_1, () => 'MediumPurple3_1'),
						MMatch.whenIs(Code.Type.MediumPurple3_2, () => 'MediumPurple3_2')
					),
					flow(
						MMatch.whenIs(Code.Type.SlateBlue1, () => 'SlateBlue1'),
						MMatch.whenIs(Code.Type.Yellow4_1, () => 'Yellow4_1'),
						MMatch.whenIs(Code.Type.Wheat4, () => 'Wheat4'),
						MMatch.whenIs(Code.Type.Grey53, () => 'Grey53'),
						MMatch.whenIs(Code.Type.LightSlateGrey, () => 'LightSlateGrey'),
						MMatch.whenIs(Code.Type.MediumPurple, () => 'MediumPurple'),
						MMatch.whenIs(Code.Type.LightSlateBlue, () => 'LightSlateBlue'),
						MMatch.whenIs(Code.Type.Yellow4_2, () => 'Yellow4_2'),
						MMatch.whenIs(Code.Type.DarkOliveGreen3_1, () => 'DarkOliveGreen3_1')
					),
					flow(
						MMatch.whenIs(Code.Type.DarkSeaGreen, () => 'DarkSeaGreen'),
						MMatch.whenIs(Code.Type.LightSkyBlue3_1, () => 'LightSkyBlue3_1'),
						MMatch.whenIs(Code.Type.LightSkyBlue3_2, () => 'LightSkyBlue3_2'),
						MMatch.whenIs(Code.Type.SkyBlue2, () => 'SkyBlue2'),
						MMatch.whenIs(Code.Type.Chartreuse2_2, () => 'Chartreuse2_2'),
						MMatch.whenIs(Code.Type.DarkOliveGreen3_2, () => 'DarkOliveGreen3_2'),
						MMatch.whenIs(Code.Type.PaleGreen3_2, () => 'PaleGreen3_2'),
						MMatch.whenIs(Code.Type.DarkSeaGreen3_1, () => 'DarkSeaGreen3_1'),
						MMatch.whenIs(Code.Type.DarkSlateGray3, () => 'DarkSlateGray3')
					),
					flow(
						MMatch.whenIs(Code.Type.SkyBlue1, () => 'SkyBlue1'),
						MMatch.whenIs(Code.Type.Chartreuse1, () => 'Chartreuse1'),
						MMatch.whenIs(Code.Type.LightGreen_1, () => 'LightGreen_1'),
						MMatch.whenIs(Code.Type.LightGreen_2, () => 'LightGreen_2'),
						MMatch.whenIs(Code.Type.PaleGreen1_1, () => 'PaleGreen1_1'),
						MMatch.whenIs(Code.Type.Aquamarine1_2, () => 'Aquamarine1_2'),
						MMatch.whenIs(Code.Type.DarkSlateGray1, () => 'DarkSlateGray1'),
						MMatch.whenIs(Code.Type.Red3_1, () => 'Red3_1'),
						MMatch.whenIs(Code.Type.DeepPink4_3, () => 'DeepPink4_3')
					),
					flow(
						MMatch.whenIs(Code.Type.MediumVioletRed, () => 'MediumVioletRed'),
						MMatch.whenIs(Code.Type.Magenta3_1, () => 'Magenta3_1'),
						MMatch.whenIs(Code.Type.DarkViolet_2, () => 'DarkViolet_2'),
						MMatch.whenIs(Code.Type.Purple_3, () => 'Purple_3'),
						MMatch.whenIs(Code.Type.DarkOrange3_1, () => 'DarkOrange3_1'),
						MMatch.whenIs(Code.Type.IndianRed_1, () => 'IndianRed_1'),
						MMatch.whenIs(Code.Type.HotPink3_1, () => 'HotPink3_1'),
						MMatch.whenIs(Code.Type.MediumOrchid3, () => 'MediumOrchid3'),
						MMatch.whenIs(Code.Type.MediumOrchid, () => 'MediumOrchid')
					),
					flow(
						MMatch.whenIs(Code.Type.MediumPurple2_1, () => 'MediumPurple2_1'),
						MMatch.whenIs(Code.Type.DarkGoldenrod, () => 'DarkGoldenrod'),
						MMatch.whenIs(Code.Type.LightSalmon3_1, () => 'LightSalmon3_1'),
						MMatch.whenIs(Code.Type.RosyBrown, () => 'RosyBrown'),
						MMatch.whenIs(Code.Type.Grey63, () => 'Grey63'),
						MMatch.whenIs(Code.Type.MediumPurple2_2, () => 'MediumPurple2_2'),
						MMatch.whenIs(Code.Type.MediumPurple1, () => 'MediumPurple1'),
						MMatch.whenIs(Code.Type.Gold3_1, () => 'Gold3_1'),
						MMatch.whenIs(Code.Type.DarkKhaki, () => 'DarkKhaki')
					),
					flow(
						MMatch.whenIs(Code.Type.NavajoWhite3, () => 'NavajoWhite3'),
						MMatch.whenIs(Code.Type.Grey69, () => 'Grey69'),
						MMatch.whenIs(Code.Type.LightSteelBlue3, () => 'LightSteelBlue3'),
						MMatch.whenIs(Code.Type.LightSteelBlue, () => 'LightSteelBlue'),
						MMatch.whenIs(Code.Type.Yellow3_1, () => 'Yellow3_1'),
						MMatch.whenIs(Code.Type.DarkOliveGreen3_3, () => 'DarkOliveGreen3_3'),
						MMatch.whenIs(Code.Type.DarkSeaGreen3_2, () => 'DarkSeaGreen3_2'),
						MMatch.whenIs(Code.Type.DarkSeaGreen2_1, () => 'DarkSeaGreen2_1'),
						MMatch.whenIs(Code.Type.LightCyan3, () => 'LightCyan3')
					),
					flow(
						MMatch.whenIs(Code.Type.LightSkyBlue1, () => 'LightSkyBlue1'),
						MMatch.whenIs(Code.Type.GreenYellow, () => 'GreenYellow'),
						MMatch.whenIs(Code.Type.DarkOliveGreen2, () => 'DarkOliveGreen2'),
						MMatch.whenIs(Code.Type.PaleGreen1_2, () => 'PaleGreen1_2'),
						MMatch.whenIs(Code.Type.DarkSeaGreen2_2, () => 'DarkSeaGreen2_2'),
						MMatch.whenIs(Code.Type.DarkSeaGreen1_1, () => 'DarkSeaGreen1_1'),
						MMatch.whenIs(Code.Type.PaleTurquoise1, () => 'PaleTurquoise1'),
						MMatch.whenIs(Code.Type.Red3_2, () => 'Red3_2'),
						MMatch.whenIs(Code.Type.DeepPink3_1, () => 'DeepPink3_1')
					)
				),
				flow(
					flow(
						MMatch.whenIs(Code.Type.DeepPink3_2, () => 'DeepPink3_2'),
						MMatch.whenIs(Code.Type.Magenta3_2, () => 'Magenta3_2'),
						MMatch.whenIs(Code.Type.Magenta3_3, () => 'Magenta3_3'),
						MMatch.whenIs(Code.Type.Magenta2_1, () => 'Magenta2_1'),
						MMatch.whenIs(Code.Type.DarkOrange3_2, () => 'DarkOrange3_2'),
						MMatch.whenIs(Code.Type.IndianRed_2, () => 'IndianRed_2'),
						MMatch.whenIs(Code.Type.HotPink3_2, () => 'HotPink3_2'),
						MMatch.whenIs(Code.Type.HotPink2, () => 'HotPink2'),
						MMatch.whenIs(Code.Type.Orchid, () => 'Orchid')
					),
					flow(
						MMatch.whenIs(Code.Type.MediumOrchid1_1, () => 'MediumOrchid1_1'),
						MMatch.whenIs(Code.Type.Orange3, () => 'Orange3'),
						MMatch.whenIs(Code.Type.LightSalmon3_2, () => 'LightSalmon3_2'),
						MMatch.whenIs(Code.Type.LightPink3, () => 'LightPink3'),
						MMatch.whenIs(Code.Type.Pink3, () => 'Pink3'),
						MMatch.whenIs(Code.Type.Plum3, () => 'Plum3'),
						MMatch.whenIs(Code.Type.Violet, () => 'Violet'),
						MMatch.whenIs(Code.Type.Gold3_2, () => 'Gold3_2'),
						MMatch.whenIs(Code.Type.LightGoldenrod3, () => 'LightGoldenrod3')
					),
					flow(
						MMatch.whenIs(Code.Type.Tan, () => 'Tan'),
						MMatch.whenIs(Code.Type.MistyRose3, () => 'MistyRose3'),
						MMatch.whenIs(Code.Type.Thistle3, () => 'Thistle3'),
						MMatch.whenIs(Code.Type.Plum2, () => 'Plum2'),
						MMatch.whenIs(Code.Type.Yellow3_2, () => 'Yellow3_2'),
						MMatch.whenIs(Code.Type.Khaki3, () => 'Khaki3'),
						MMatch.whenIs(Code.Type.LightGoldenrod2_1, () => 'LightGoldenrod2_1'),
						MMatch.whenIs(Code.Type.LightYellow3, () => 'LightYellow3'),
						MMatch.whenIs(Code.Type.Grey84, () => 'Grey84')
					),
					flow(
						MMatch.whenIs(Code.Type.LightSteelBlue1, () => 'LightSteelBlue1'),
						MMatch.whenIs(Code.Type.Yellow2, () => 'Yellow2'),
						MMatch.whenIs(Code.Type.DarkOliveGreen1_1, () => 'DarkOliveGreen1_1'),
						MMatch.whenIs(Code.Type.DarkOliveGreen1_2, () => 'DarkOliveGreen1_2'),
						MMatch.whenIs(Code.Type.DarkSeaGreen1_2, () => 'DarkSeaGreen1_2'),
						MMatch.whenIs(Code.Type.Honeydew2, () => 'Honeydew2'),
						MMatch.whenIs(Code.Type.LightCyan1, () => 'LightCyan1'),
						MMatch.whenIs(Code.Type.Red1, () => 'Red1'),
						MMatch.whenIs(Code.Type.DeepPink2, () => 'DeepPink2')
					),
					flow(
						MMatch.whenIs(Code.Type.DeepPink1_1, () => 'DeepPink1_1'),
						MMatch.whenIs(Code.Type.DeepPink1_2, () => 'DeepPink1_2'),
						MMatch.whenIs(Code.Type.Magenta2_2, () => 'Magenta2_2'),
						MMatch.whenIs(Code.Type.Magenta1, () => 'Magenta1'),
						MMatch.whenIs(Code.Type.OrangeRed1, () => 'OrangeRed1'),
						MMatch.whenIs(Code.Type.IndianRed1_1, () => 'IndianRed1_1'),
						MMatch.whenIs(Code.Type.IndianRed1_2, () => 'IndianRed1_2'),
						MMatch.whenIs(Code.Type.HotPink_1, () => 'HotPink_1'),
						MMatch.whenIs(Code.Type.HotPink_2, () => 'HotPink_2')
					),
					flow(
						MMatch.whenIs(Code.Type.MediumOrchid1_2, () => 'MediumOrchid1_2'),
						MMatch.whenIs(Code.Type.DarkOrange, () => 'DarkOrange'),
						MMatch.whenIs(Code.Type.Salmon1, () => 'Salmon1'),
						MMatch.whenIs(Code.Type.LightCoral, () => 'LightCoral'),
						MMatch.whenIs(Code.Type.PaleVioletRed1, () => 'PaleVioletRed1'),
						MMatch.whenIs(Code.Type.Orchid2, () => 'Orchid2'),
						MMatch.whenIs(Code.Type.Orchid1, () => 'Orchid1'),
						MMatch.whenIs(Code.Type.Orange1, () => 'Orange1'),
						MMatch.whenIs(Code.Type.SandyBrown, () => 'SandyBrown')
					),
					flow(
						MMatch.whenIs(Code.Type.LightSalmon1, () => 'LightSalmon1'),
						MMatch.whenIs(Code.Type.LightPink1, () => 'LightPink1'),
						MMatch.whenIs(Code.Type.Pink1, () => 'Pink1'),
						MMatch.whenIs(Code.Type.Plum1, () => 'Plum1'),
						MMatch.whenIs(Code.Type.Gold1, () => 'Gold1'),
						MMatch.whenIs(Code.Type.LightGoldenrod2_2, () => 'LightGoldenrod2_2'),
						MMatch.whenIs(Code.Type.LightGoldenrod2_3, () => 'LightGoldenrod2_3'),
						MMatch.whenIs(Code.Type.NavajoWhite1, () => 'NavajoWhite1'),
						MMatch.whenIs(Code.Type.MistyRose1, () => 'MistyRose1')
					),
					flow(
						MMatch.whenIs(Code.Type.Thistle1, () => 'Thistle1'),
						MMatch.whenIs(Code.Type.Yellow1, () => 'Yellow1'),
						MMatch.whenIs(Code.Type.LightGoldenrod1, () => 'LightGoldenrod1'),
						MMatch.whenIs(Code.Type.Khaki1, () => 'Khaki1'),
						MMatch.whenIs(Code.Type.Wheat1, () => 'Wheat1'),
						MMatch.whenIs(Code.Type.Cornsilk1, () => 'Cornsilk1'),
						MMatch.whenIs(Code.Type.Grey100, () => 'Grey100'),
						MMatch.whenIs(Code.Type.Grey3, () => 'Grey3'),
						MMatch.whenIs(Code.Type.Grey7, () => 'Grey7')
					),
					flow(
						MMatch.whenIs(Code.Type.Grey11, () => 'Grey11'),
						MMatch.whenIs(Code.Type.Grey15, () => 'Grey15'),
						MMatch.whenIs(Code.Type.Grey19, () => 'Grey19'),
						MMatch.whenIs(Code.Type.Grey23, () => 'Grey23'),
						MMatch.whenIs(Code.Type.Grey27, () => 'Grey27'),
						MMatch.whenIs(Code.Type.Grey30, () => 'Grey30'),
						MMatch.whenIs(Code.Type.Grey35, () => 'Grey35'),
						MMatch.whenIs(Code.Type.Grey39, () => 'Grey39'),
						MMatch.whenIs(Code.Type.Grey42, () => 'Grey42')
					)
				),
				flow(
					flow(
						MMatch.whenIs(Code.Type.Grey46, () => 'Grey46'),
						MMatch.whenIs(Code.Type.Grey50, () => 'Grey50'),
						MMatch.whenIs(Code.Type.Grey54, () => 'Grey54'),
						MMatch.whenIs(Code.Type.Grey58, () => 'Grey58'),
						MMatch.whenIs(Code.Type.Grey62, () => 'Grey62'),
						MMatch.whenIs(Code.Type.Grey66, () => 'Grey66'),
						MMatch.whenIs(Code.Type.Grey70, () => 'Grey70'),
						MMatch.whenIs(Code.Type.Grey74, () => 'Grey74'),
						MMatch.whenIs(Code.Type.Grey78, () => 'Grey78')
					),
					flow(
						MMatch.whenIs(Code.Type.Grey82, () => 'Grey82'),
						MMatch.whenIs(Code.Type.Grey85, () => 'Grey85'),
						MMatch.whenIs(Code.Type.Grey89, () => 'Grey89'),
						MMatch.whenIs(Code.Type.Grey93, () => 'Grey93')
					)
				)
			),
			MMatch.exhaustive,
			MString.prepend('EightBit')
		);

		export const withId = (self: Type) => ({ code: self, id: toId(self) });
	}

	/** EightBit foreground color Style instance maker */
	const _fromCode: MTypes.OneArgFunction<Code.Type, Type> = flow(
		Code.withId,
		ASStyleCharacteristic.eightBitFgColor,
		_fromCharacteritic
	);

	/**
	 * Eightbit black color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const black: Type = _fromCode(Code.Type.Black);
	/**
	 * Eightbit maroon color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const maroon: Type = _fromCode(Code.Type.Maroon);
	/**
	 * Eightbit green color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green: Type = _fromCode(Code.Type.Green);
	/**
	 * Eightbit olive color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const olive: Type = _fromCode(Code.Type.Olive);
	/**
	 * Eightbit navy color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navy: Type = _fromCode(Code.Type.Navy);
	/**
	 * Eightbit purple_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple_1: Type = _fromCode(Code.Type.Purple_1);
	/**
	 * Eightbit teal color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const teal: Type = _fromCode(Code.Type.Teal);
	/**
	 * Eightbit silver color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const silver: Type = _fromCode(Code.Type.Silver);
	/**
	 * Eightbit grey color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey: Type = _fromCode(Code.Type.Grey);
	/**
	 * Eightbit red color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red: Type = _fromCode(Code.Type.Red);
	/**
	 * Eightbit lime color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lime: Type = _fromCode(Code.Type.Lime);
	/**
	 * Eightbit yellow color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow: Type = _fromCode(Code.Type.Yellow);
	/**
	 * Eightbit blue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue: Type = _fromCode(Code.Type.Blue);
	/**
	 * Eightbit fuchsia color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const fuchsia: Type = _fromCode(Code.Type.Fuchsia);
	/**
	 * Eightbit aqua color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aqua: Type = _fromCode(Code.Type.Aqua);
	/**
	 * Eightbit white color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const white: Type = _fromCode(Code.Type.White);
	/**
	 * Eightbit grey0 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey0: Type = _fromCode(Code.Type.Grey0);
	/**
	 * Eightbit navyBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navyBlue: Type = _fromCode(Code.Type.NavyBlue);
	/**
	 * Eightbit darkBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkBlue: Type = _fromCode(Code.Type.DarkBlue);
	/**
	 * Eightbit blue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue3_1: Type = _fromCode(Code.Type.Blue3_1);
	/**
	 * Eightbit blue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue3_2: Type = _fromCode(Code.Type.Blue3_2);
	/**
	 * Eightbit blue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue1: Type = _fromCode(Code.Type.Blue1);
	/**
	 * Eightbit darkGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkGreen: Type = _fromCode(Code.Type.DarkGreen);
	/**
	 * Eightbit deepSkyBlue4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue4_1: Type = _fromCode(Code.Type.DeepSkyBlue4_1);
	/**
	 * Eightbit deepSkyBlue4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue4_2: Type = _fromCode(Code.Type.DeepSkyBlue4_2);
	/**
	 * Eightbit deepSkyBlue4_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue4_3: Type = _fromCode(Code.Type.DeepSkyBlue4_3);
	/**
	 * Eightbit dodgerBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const dodgerBlue3: Type = _fromCode(Code.Type.DodgerBlue3);
	/**
	 * Eightbit dodgerBlue2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const dodgerBlue2: Type = _fromCode(Code.Type.DodgerBlue2);
	/**
	 * Eightbit green4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green4: Type = _fromCode(Code.Type.Green4);
	/**
	 * Eightbit springGreen4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen4: Type = _fromCode(Code.Type.SpringGreen4);
	/**
	 * Eightbit turquoise4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const turquoise4: Type = _fromCode(Code.Type.Turquoise4);
	/**
	 * Eightbit deepSkyBlue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue3_1: Type = _fromCode(Code.Type.DeepSkyBlue3_1);
	/**
	 * Eightbit deepSkyBlue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue3_2: Type = _fromCode(Code.Type.DeepSkyBlue3_2);
	/**
	 * Eightbit dodgerBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const dodgerBlue1: Type = _fromCode(Code.Type.DodgerBlue1);
	/**
	 * Eightbit green3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green3_1: Type = _fromCode(Code.Type.Green3_1);
	/**
	 * Eightbit springGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen3_1: Type = _fromCode(Code.Type.SpringGreen3_1);
	/**
	 * Eightbit darkCyan color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkCyan: Type = _fromCode(Code.Type.DarkCyan);
	/**
	 * Eightbit lightSeaGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSeaGreen: Type = _fromCode(Code.Type.LightSeaGreen);
	/**
	 * Eightbit deepSkyBlue2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue2: Type = _fromCode(Code.Type.DeepSkyBlue2);
	/**
	 * Eightbit deepSkyBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue1: Type = _fromCode(Code.Type.DeepSkyBlue1);
	/**
	 * Eightbit green3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green3_2: Type = _fromCode(Code.Type.Green3_2);
	/**
	 * Eightbit springGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen3_2: Type = _fromCode(Code.Type.SpringGreen3_2);
	/**
	 * Eightbit springGreen2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen2_1: Type = _fromCode(Code.Type.SpringGreen2_1);
	/**
	 * Eightbit cyan3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cyan3: Type = _fromCode(Code.Type.Cyan3);
	/**
	 * Eightbit darkTurquoise color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkTurquoise: Type = _fromCode(Code.Type.DarkTurquoise);
	/**
	 * Eightbit turquoise2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const turquoise2: Type = _fromCode(Code.Type.Turquoise2);
	/**
	 * Eightbit green1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green1: Type = _fromCode(Code.Type.Green1);
	/**
	 * Eightbit springGreen2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen2_2: Type = _fromCode(Code.Type.SpringGreen2_2);
	/**
	 * Eightbit springGreen1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen1: Type = _fromCode(Code.Type.SpringGreen1);
	/**
	 * Eightbit mediumSpringGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumSpringGreen: Type = _fromCode(Code.Type.MediumSpringGreen);
	/**
	 * Eightbit cyan2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cyan2: Type = _fromCode(Code.Type.Cyan2);
	/**
	 * Eightbit cyan1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cyan1: Type = _fromCode(Code.Type.Cyan1);
	/**
	 * Eightbit darkRed_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkRed_1: Type = _fromCode(Code.Type.DarkRed_1);
	/**
	 * Eightbit deepPink4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink4_1: Type = _fromCode(Code.Type.DeepPink4_1);
	/**
	 * Eightbit purple4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple4_1: Type = _fromCode(Code.Type.Purple4_1);
	/**
	 * Eightbit purple4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple4_2: Type = _fromCode(Code.Type.Purple4_2);
	/**
	 * Eightbit purple3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple3: Type = _fromCode(Code.Type.Purple3);
	/**
	 * Eightbit blueViolet color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blueViolet: Type = _fromCode(Code.Type.BlueViolet);
	/**
	 * Eightbit orange4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange4_1: Type = _fromCode(Code.Type.Orange4_1);
	/**
	 * Eightbit grey37 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey37: Type = _fromCode(Code.Type.Grey37);
	/**
	 * Eightbit mediumPurple4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple4: Type = _fromCode(Code.Type.MediumPurple4);
	/**
	 * Eightbit slateBlue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const slateBlue3_1: Type = _fromCode(Code.Type.SlateBlue3_1);
	/**
	 * Eightbit slateBlue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const slateBlue3_2: Type = _fromCode(Code.Type.SlateBlue3_2);
	/**
	 * Eightbit royalBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const royalBlue1: Type = _fromCode(Code.Type.RoyalBlue1);
	/**
	 * Eightbit chartreuse4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse4: Type = _fromCode(Code.Type.Chartreuse4);
	/**
	 * Eightbit darkSeaGreen4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen4_1: Type = _fromCode(Code.Type.DarkSeaGreen4_1);
	/**
	 * Eightbit paleTurquoise4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleTurquoise4: Type = _fromCode(Code.Type.PaleTurquoise4);
	/**
	 * Eightbit steelBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue: Type = _fromCode(Code.Type.SteelBlue);
	/**
	 * Eightbit steelBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue3: Type = _fromCode(Code.Type.SteelBlue3);
	/**
	 * Eightbit cornflowerBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cornflowerBlue: Type = _fromCode(Code.Type.CornflowerBlue);
	/**
	 * Eightbit chartreuse3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse3_1: Type = _fromCode(Code.Type.Chartreuse3_1);
	/**
	 * Eightbit darkSeaGreen4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen4_2: Type = _fromCode(Code.Type.DarkSeaGreen4_2);
	/**
	 * Eightbit cadetBlue_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cadetBlue_1: Type = _fromCode(Code.Type.CadetBlue_1);
	/**
	 * Eightbit cadetBlue_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cadetBlue_2: Type = _fromCode(Code.Type.CadetBlue_2);
	/**
	 * Eightbit skyBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const skyBlue3: Type = _fromCode(Code.Type.SkyBlue3);
	/**
	 * Eightbit steelBlue1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue1_1: Type = _fromCode(Code.Type.SteelBlue1_1);
	/**
	 * Eightbit chartreuse3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse3_2: Type = _fromCode(Code.Type.Chartreuse3_2);
	/**
	 * Eightbit paleGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen3_1: Type = _fromCode(Code.Type.PaleGreen3_1);
	/**
	 * Eightbit seaGreen3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen3: Type = _fromCode(Code.Type.SeaGreen3);
	/**
	 * Eightbit aquamarine3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aquamarine3: Type = _fromCode(Code.Type.Aquamarine3);
	/**
	 * Eightbit mediumTurquoise color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumTurquoise: Type = _fromCode(Code.Type.MediumTurquoise);
	/**
	 * Eightbit steelBlue1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue1_2: Type = _fromCode(Code.Type.SteelBlue1_2);
	/**
	 * Eightbit chartreuse2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse2_1: Type = _fromCode(Code.Type.Chartreuse2_1);
	/**
	 * Eightbit seaGreen2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen2: Type = _fromCode(Code.Type.SeaGreen2);
	/**
	 * Eightbit seaGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen1_1: Type = _fromCode(Code.Type.SeaGreen1_1);
	/**
	 * Eightbit seaGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen1_2: Type = _fromCode(Code.Type.SeaGreen1_2);
	/**
	 * Eightbit aquamarine1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aquamarine1_1: Type = _fromCode(Code.Type.Aquamarine1_1);
	/**
	 * Eightbit darkSlateGray2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSlateGray2: Type = _fromCode(Code.Type.DarkSlateGray2);
	/**
	 * Eightbit darkRed_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkRed_2: Type = _fromCode(Code.Type.DarkRed_2);
	/**
	 * Eightbit deepPink4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink4_2: Type = _fromCode(Code.Type.DeepPink4_2);
	/**
	 * Eightbit darkMagenta_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkMagenta_1: Type = _fromCode(Code.Type.DarkMagenta_1);
	/**
	 * Eightbit darkMagenta_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkMagenta_2: Type = _fromCode(Code.Type.DarkMagenta_2);
	/**
	 * Eightbit darkViolet_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkViolet_1: Type = _fromCode(Code.Type.DarkViolet_1);
	/**
	 * Eightbit purple_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple_2: Type = _fromCode(Code.Type.Purple_2);
	/**
	 * Eightbit orange4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange4_2: Type = _fromCode(Code.Type.Orange4_2);
	/**
	 * Eightbit lightPink4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightPink4: Type = _fromCode(Code.Type.LightPink4);
	/**
	 * Eightbit plum4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum4: Type = _fromCode(Code.Type.Plum4);
	/**
	 * Eightbit mediumPurple3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple3_1: Type = _fromCode(Code.Type.MediumPurple3_1);
	/**
	 * Eightbit mediumPurple3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple3_2: Type = _fromCode(Code.Type.MediumPurple3_2);
	/**
	 * Eightbit slateBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const slateBlue1: Type = _fromCode(Code.Type.SlateBlue1);
	/**
	 * Eightbit yellow4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow4_1: Type = _fromCode(Code.Type.Yellow4_1);
	/**
	 * Eightbit wheat4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const wheat4: Type = _fromCode(Code.Type.Wheat4);
	/**
	 * Eightbit grey53 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey53: Type = _fromCode(Code.Type.Grey53);
	/**
	 * Eightbit lightSlateGrey color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSlateGrey: Type = _fromCode(Code.Type.LightSlateGrey);
	/**
	 * Eightbit mediumPurple color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple: Type = _fromCode(Code.Type.MediumPurple);
	/**
	 * Eightbit lightSlateBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSlateBlue: Type = _fromCode(Code.Type.LightSlateBlue);
	/**
	 * Eightbit yellow4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow4_2: Type = _fromCode(Code.Type.Yellow4_2);
	/**
	 * Eightbit darkOliveGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen3_1: Type = _fromCode(Code.Type.DarkOliveGreen3_1);
	/**
	 * Eightbit darkSeaGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen: Type = _fromCode(Code.Type.DarkSeaGreen);
	/**
	 * Eightbit lightSkyBlue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSkyBlue3_1: Type = _fromCode(Code.Type.LightSkyBlue3_1);
	/**
	 * Eightbit lightSkyBlue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSkyBlue3_2: Type = _fromCode(Code.Type.LightSkyBlue3_2);
	/**
	 * Eightbit skyBlue2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const skyBlue2: Type = _fromCode(Code.Type.SkyBlue2);
	/**
	 * Eightbit chartreuse2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse2_2: Type = _fromCode(Code.Type.Chartreuse2_2);
	/**
	 * Eightbit darkOliveGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen3_2: Type = _fromCode(Code.Type.DarkOliveGreen3_2);
	/**
	 * Eightbit paleGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen3_2: Type = _fromCode(Code.Type.PaleGreen3_2);
	/**
	 * Eightbit darkSeaGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen3_1: Type = _fromCode(Code.Type.DarkSeaGreen3_1);
	/**
	 * Eightbit darkSlateGray3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSlateGray3: Type = _fromCode(Code.Type.DarkSlateGray3);
	/**
	 * Eightbit skyBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const skyBlue1: Type = _fromCode(Code.Type.SkyBlue1);
	/**
	 * Eightbit chartreuse1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse1: Type = _fromCode(Code.Type.Chartreuse1);
	/**
	 * Eightbit lightGreen_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGreen_1: Type = _fromCode(Code.Type.LightGreen_1);
	/**
	 * Eightbit lightGreen_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGreen_2: Type = _fromCode(Code.Type.LightGreen_2);
	/**
	 * Eightbit paleGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen1_1: Type = _fromCode(Code.Type.PaleGreen1_1);
	/**
	 * Eightbit aquamarine1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aquamarine1_2: Type = _fromCode(Code.Type.Aquamarine1_2);
	/**
	 * Eightbit darkSlateGray1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSlateGray1: Type = _fromCode(Code.Type.DarkSlateGray1);
	/**
	 * Eightbit red3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red3_1: Type = _fromCode(Code.Type.Red3_1);
	/**
	 * Eightbit deepPink4_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink4_3: Type = _fromCode(Code.Type.DeepPink4_3);
	/**
	 * Eightbit mediumVioletRed color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumVioletRed: Type = _fromCode(Code.Type.MediumVioletRed);
	/**
	 * Eightbit magenta3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta3_1: Type = _fromCode(Code.Type.Magenta3_1);
	/**
	 * Eightbit darkViolet_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkViolet_2: Type = _fromCode(Code.Type.DarkViolet_2);
	/**
	 * Eightbit purple_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple_3: Type = _fromCode(Code.Type.Purple_3);
	/**
	 * Eightbit darkOrange3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOrange3_1: Type = _fromCode(Code.Type.DarkOrange3_1);
	/**
	 * Eightbit indianRed_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed_1: Type = _fromCode(Code.Type.IndianRed_1);
	/**
	 * Eightbit hotPink3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink3_1: Type = _fromCode(Code.Type.HotPink3_1);
	/**
	 * Eightbit mediumOrchid3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid3: Type = _fromCode(Code.Type.MediumOrchid3);
	/**
	 * Eightbit mediumOrchid color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid: Type = _fromCode(Code.Type.MediumOrchid);
	/**
	 * Eightbit mediumPurple2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple2_1: Type = _fromCode(Code.Type.MediumPurple2_1);
	/**
	 * Eightbit darkGoldenrod color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkGoldenrod: Type = _fromCode(Code.Type.DarkGoldenrod);
	/**
	 * Eightbit lightSalmon3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSalmon3_1: Type = _fromCode(Code.Type.LightSalmon3_1);
	/**
	 * Eightbit rosyBrown color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const rosyBrown: Type = _fromCode(Code.Type.RosyBrown);
	/**
	 * Eightbit grey63 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey63: Type = _fromCode(Code.Type.Grey63);
	/**
	 * Eightbit mediumPurple2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple2_2: Type = _fromCode(Code.Type.MediumPurple2_2);
	/**
	 * Eightbit mediumPurple1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple1: Type = _fromCode(Code.Type.MediumPurple1);
	/**
	 * Eightbit gold3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const gold3_1: Type = _fromCode(Code.Type.Gold3_1);
	/**
	 * Eightbit darkKhaki color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkKhaki: Type = _fromCode(Code.Type.DarkKhaki);
	/**
	 * Eightbit navajoWhite3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navajoWhite3: Type = _fromCode(Code.Type.NavajoWhite3);
	/**
	 * Eightbit grey69 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey69: Type = _fromCode(Code.Type.Grey69);
	/**
	 * Eightbit lightSteelBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSteelBlue3: Type = _fromCode(Code.Type.LightSteelBlue3);
	/**
	 * Eightbit lightSteelBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSteelBlue: Type = _fromCode(Code.Type.LightSteelBlue);
	/**
	 * Eightbit yellow3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow3_1: Type = _fromCode(Code.Type.Yellow3_1);
	/**
	 * Eightbit darkOliveGreen3_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen3_3: Type = _fromCode(Code.Type.DarkOliveGreen3_3);
	/**
	 * Eightbit darkSeaGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen3_2: Type = _fromCode(Code.Type.DarkSeaGreen3_2);
	/**
	 * Eightbit darkSeaGreen2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen2_1: Type = _fromCode(Code.Type.DarkSeaGreen2_1);
	/**
	 * Eightbit lightCyan3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightCyan3: Type = _fromCode(Code.Type.LightCyan3);
	/**
	 * Eightbit lightSkyBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSkyBlue1: Type = _fromCode(Code.Type.LightSkyBlue1);
	/**
	 * Eightbit greenYellow color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const greenYellow: Type = _fromCode(Code.Type.GreenYellow);
	/**
	 * Eightbit darkOliveGreen2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen2: Type = _fromCode(Code.Type.DarkOliveGreen2);
	/**
	 * Eightbit paleGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen1_2: Type = _fromCode(Code.Type.PaleGreen1_2);
	/**
	 * Eightbit darkSeaGreen2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen2_2: Type = _fromCode(Code.Type.DarkSeaGreen2_2);
	/**
	 * Eightbit darkSeaGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen1_1: Type = _fromCode(Code.Type.DarkSeaGreen1_1);
	/**
	 * Eightbit paleTurquoise1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleTurquoise1: Type = _fromCode(Code.Type.PaleTurquoise1);
	/**
	 * Eightbit red3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red3_2: Type = _fromCode(Code.Type.Red3_2);
	/**
	 * Eightbit deepPink3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink3_1: Type = _fromCode(Code.Type.DeepPink3_1);
	/**
	 * Eightbit deepPink3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink3_2: Type = _fromCode(Code.Type.DeepPink3_2);
	/**
	 * Eightbit magenta3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta3_2: Type = _fromCode(Code.Type.Magenta3_2);
	/**
	 * Eightbit magenta3_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta3_3: Type = _fromCode(Code.Type.Magenta3_3);
	/**
	 * Eightbit magenta2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta2_1: Type = _fromCode(Code.Type.Magenta2_1);
	/**
	 * Eightbit darkOrange3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOrange3_2: Type = _fromCode(Code.Type.DarkOrange3_2);
	/**
	 * Eightbit indianRed_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed_2: Type = _fromCode(Code.Type.IndianRed_2);
	/**
	 * Eightbit hotPink3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink3_2: Type = _fromCode(Code.Type.HotPink3_2);
	/**
	 * Eightbit hotPink2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink2: Type = _fromCode(Code.Type.HotPink2);
	/**
	 * Eightbit orchid color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orchid: Type = _fromCode(Code.Type.Orchid);
	/**
	 * Eightbit mediumOrchid1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid1_1: Type = _fromCode(Code.Type.MediumOrchid1_1);
	/**
	 * Eightbit orange3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange3: Type = _fromCode(Code.Type.Orange3);
	/**
	 * Eightbit lightSalmon3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSalmon3_2: Type = _fromCode(Code.Type.LightSalmon3_2);
	/**
	 * Eightbit lightPink3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightPink3: Type = _fromCode(Code.Type.LightPink3);
	/**
	 * Eightbit pink3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const pink3: Type = _fromCode(Code.Type.Pink3);
	/**
	 * Eightbit plum3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum3: Type = _fromCode(Code.Type.Plum3);
	/**
	 * Eightbit violet color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const violet: Type = _fromCode(Code.Type.Violet);
	/**
	 * Eightbit gold3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const gold3_2: Type = _fromCode(Code.Type.Gold3_2);
	/**
	 * Eightbit lightGoldenrod3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod3: Type = _fromCode(Code.Type.LightGoldenrod3);
	/**
	 * Eightbit tan color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const tan: Type = _fromCode(Code.Type.Tan);
	/**
	 * Eightbit mistyRose3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mistyRose3: Type = _fromCode(Code.Type.MistyRose3);
	/**
	 * Eightbit thistle3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const thistle3: Type = _fromCode(Code.Type.Thistle3);
	/**
	 * Eightbit plum2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum2: Type = _fromCode(Code.Type.Plum2);
	/**
	 * Eightbit yellow3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow3_2: Type = _fromCode(Code.Type.Yellow3_2);
	/**
	 * Eightbit khaki3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const khaki3: Type = _fromCode(Code.Type.Khaki3);
	/**
	 * Eightbit lightGoldenrod2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod2_1: Type = _fromCode(Code.Type.LightGoldenrod2_1);
	/**
	 * Eightbit lightYellow3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightYellow3: Type = _fromCode(Code.Type.LightYellow3);
	/**
	 * Eightbit grey84 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey84: Type = _fromCode(Code.Type.Grey84);
	/**
	 * Eightbit lightSteelBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSteelBlue1: Type = _fromCode(Code.Type.LightSteelBlue1);
	/**
	 * Eightbit yellow2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow2: Type = _fromCode(Code.Type.Yellow2);
	/**
	 * Eightbit darkOliveGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen1_1: Type = _fromCode(Code.Type.DarkOliveGreen1_1);
	/**
	 * Eightbit darkOliveGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen1_2: Type = _fromCode(Code.Type.DarkOliveGreen1_2);
	/**
	 * Eightbit darkSeaGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen1_2: Type = _fromCode(Code.Type.DarkSeaGreen1_2);
	/**
	 * Eightbit honeydew2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const honeydew2: Type = _fromCode(Code.Type.Honeydew2);
	/**
	 * Eightbit lightCyan1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightCyan1: Type = _fromCode(Code.Type.LightCyan1);
	/**
	 * Eightbit red1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red1: Type = _fromCode(Code.Type.Red1);
	/**
	 * Eightbit deepPink2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink2: Type = _fromCode(Code.Type.DeepPink2);
	/**
	 * Eightbit deepPink1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink1_1: Type = _fromCode(Code.Type.DeepPink1_1);
	/**
	 * Eightbit deepPink1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink1_2: Type = _fromCode(Code.Type.DeepPink1_2);
	/**
	 * Eightbit magenta2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta2_2: Type = _fromCode(Code.Type.Magenta2_2);
	/**
	 * Eightbit magenta1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta1: Type = _fromCode(Code.Type.Magenta1);
	/**
	 * Eightbit orangeRed1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orangeRed1: Type = _fromCode(Code.Type.OrangeRed1);
	/**
	 * Eightbit indianRed1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed1_1: Type = _fromCode(Code.Type.IndianRed1_1);
	/**
	 * Eightbit indianRed1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed1_2: Type = _fromCode(Code.Type.IndianRed1_2);
	/**
	 * Eightbit hotPink_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink_1: Type = _fromCode(Code.Type.HotPink_1);
	/**
	 * Eightbit hotPink_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink_2: Type = _fromCode(Code.Type.HotPink_2);
	/**
	 * Eightbit mediumOrchid1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid1_2: Type = _fromCode(Code.Type.MediumOrchid1_2);
	/**
	 * Eightbit darkOrange color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOrange: Type = _fromCode(Code.Type.DarkOrange);
	/**
	 * Eightbit salmon1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const salmon1: Type = _fromCode(Code.Type.Salmon1);
	/**
	 * Eightbit lightCoral color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightCoral: Type = _fromCode(Code.Type.LightCoral);
	/**
	 * Eightbit paleVioletRed1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleVioletRed1: Type = _fromCode(Code.Type.PaleVioletRed1);
	/**
	 * Eightbit orchid2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orchid2: Type = _fromCode(Code.Type.Orchid2);
	/**
	 * Eightbit orchid1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orchid1: Type = _fromCode(Code.Type.Orchid1);
	/**
	 * Eightbit orange1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange1: Type = _fromCode(Code.Type.Orange1);
	/**
	 * Eightbit sandyBrown color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const sandyBrown: Type = _fromCode(Code.Type.SandyBrown);
	/**
	 * Eightbit lightSalmon1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSalmon1: Type = _fromCode(Code.Type.LightSalmon1);
	/**
	 * Eightbit lightPink1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightPink1: Type = _fromCode(Code.Type.LightPink1);
	/**
	 * Eightbit pink1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const pink1: Type = _fromCode(Code.Type.Pink1);
	/**
	 * Eightbit plum1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum1: Type = _fromCode(Code.Type.Plum1);
	/**
	 * Eightbit gold1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const gold1: Type = _fromCode(Code.Type.Gold1);
	/**
	 * Eightbit lightGoldenrod2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod2_2: Type = _fromCode(Code.Type.LightGoldenrod2_2);
	/**
	 * Eightbit lightGoldenrod2_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod2_3: Type = _fromCode(Code.Type.LightGoldenrod2_3);
	/**
	 * Eightbit navajoWhite1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navajoWhite1: Type = _fromCode(Code.Type.NavajoWhite1);
	/**
	 * Eightbit mistyRose1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mistyRose1: Type = _fromCode(Code.Type.MistyRose1);
	/**
	 * Eightbit thistle1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const thistle1: Type = _fromCode(Code.Type.Thistle1);
	/**
	 * Eightbit yellow1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow1: Type = _fromCode(Code.Type.Yellow1);
	/**
	 * Eightbit lightGoldenrod1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod1: Type = _fromCode(Code.Type.LightGoldenrod1);
	/**
	 * Eightbit khaki1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const khaki1: Type = _fromCode(Code.Type.Khaki1);
	/**
	 * Eightbit wheat1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const wheat1: Type = _fromCode(Code.Type.Wheat1);
	/**
	 * Eightbit cornsilk1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cornsilk1: Type = _fromCode(Code.Type.Cornsilk1);
	/**
	 * Eightbit grey100 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey100: Type = _fromCode(Code.Type.Grey100);
	/**
	 * Eightbit grey3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey3: Type = _fromCode(Code.Type.Grey3);
	/**
	 * Eightbit grey7 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey7: Type = _fromCode(Code.Type.Grey7);
	/**
	 * Eightbit grey11 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey11: Type = _fromCode(Code.Type.Grey11);
	/**
	 * Eightbit grey15 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey15: Type = _fromCode(Code.Type.Grey15);
	/**
	 * Eightbit grey19 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey19: Type = _fromCode(Code.Type.Grey19);
	/**
	 * Eightbit grey23 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey23: Type = _fromCode(Code.Type.Grey23);
	/**
	 * Eightbit grey27 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey27: Type = _fromCode(Code.Type.Grey27);
	/**
	 * Eightbit grey30 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey30: Type = _fromCode(Code.Type.Grey30);
	/**
	 * Eightbit grey35 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey35: Type = _fromCode(Code.Type.Grey35);
	/**
	 * Eightbit grey39 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey39: Type = _fromCode(Code.Type.Grey39);
	/**
	 * Eightbit grey42 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey42: Type = _fromCode(Code.Type.Grey42);
	/**
	 * Eightbit grey46 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey46: Type = _fromCode(Code.Type.Grey46);
	/**
	 * Eightbit grey50 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey50: Type = _fromCode(Code.Type.Grey50);
	/**
	 * Eightbit grey54 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey54: Type = _fromCode(Code.Type.Grey54);
	/**
	 * Eightbit grey58 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey58: Type = _fromCode(Code.Type.Grey58);
	/**
	 * Eightbit grey62 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey62: Type = _fromCode(Code.Type.Grey62);
	/**
	 * Eightbit grey66 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey66: Type = _fromCode(Code.Type.Grey66);
	/**
	 * Eightbit grey70 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey70: Type = _fromCode(Code.Type.Grey70);
	/**
	 * Eightbit grey74 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey74: Type = _fromCode(Code.Type.Grey74);
	/**
	 * Eightbit grey78 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey78: Type = _fromCode(Code.Type.Grey78);
	/**
	 * Eightbit grey82 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey82: Type = _fromCode(Code.Type.Grey82);
	/**
	 * Eightbit grey85 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey85: Type = _fromCode(Code.Type.Grey85);
	/**
	 * Eightbit grey89 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey89: Type = _fromCode(Code.Type.Grey89);
	/**
	 * Eightbit grey93 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey93: Type = _fromCode(Code.Type.Grey93);

	/**
	 * Namespace for eight-bit colors used as background color
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace Bg {
		/** EightBit background color Style instance maker */
		const _fromCode: MTypes.OneArgFunction<Code.Type, Type> = flow(
			Code.withId,
			ASStyleCharacteristic.eightBitBgColor,
			_fromCharacteritic
		);

		/**
		 * Eightbit black color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const black: Type = _fromCode(Code.Type.Black);
		/**
		 * Eightbit maroon color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const maroon: Type = _fromCode(Code.Type.Maroon);
		/**
		 * Eightbit green color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green: Type = _fromCode(Code.Type.Green);
		/**
		 * Eightbit olive color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const olive: Type = _fromCode(Code.Type.Olive);
		/**
		 * Eightbit navy color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navy: Type = _fromCode(Code.Type.Navy);
		/**
		 * Eightbit purple_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple_1: Type = _fromCode(Code.Type.Purple_1);
		/**
		 * Eightbit teal color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const teal: Type = _fromCode(Code.Type.Teal);
		/**
		 * Eightbit silver color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const silver: Type = _fromCode(Code.Type.Silver);
		/**
		 * Eightbit grey color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey: Type = _fromCode(Code.Type.Grey);
		/**
		 * Eightbit red color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red: Type = _fromCode(Code.Type.Red);
		/**
		 * Eightbit lime color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lime: Type = _fromCode(Code.Type.Lime);
		/**
		 * Eightbit yellow color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow: Type = _fromCode(Code.Type.Yellow);
		/**
		 * Eightbit blue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue: Type = _fromCode(Code.Type.Blue);
		/**
		 * Eightbit fuchsia color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const fuchsia: Type = _fromCode(Code.Type.Fuchsia);
		/**
		 * Eightbit aqua color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aqua: Type = _fromCode(Code.Type.Aqua);
		/**
		 * Eightbit white color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const white: Type = _fromCode(Code.Type.White);
		/**
		 * Eightbit grey0 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey0: Type = _fromCode(Code.Type.Grey0);
		/**
		 * Eightbit navyBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navyBlue: Type = _fromCode(Code.Type.NavyBlue);
		/**
		 * Eightbit darkBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkBlue: Type = _fromCode(Code.Type.DarkBlue);
		/**
		 * Eightbit blue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue3_1: Type = _fromCode(Code.Type.Blue3_1);
		/**
		 * Eightbit blue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue3_2: Type = _fromCode(Code.Type.Blue3_2);
		/**
		 * Eightbit blue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue1: Type = _fromCode(Code.Type.Blue1);
		/**
		 * Eightbit darkGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkGreen: Type = _fromCode(Code.Type.DarkGreen);
		/**
		 * Eightbit deepSkyBlue4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue4_1: Type = _fromCode(Code.Type.DeepSkyBlue4_1);
		/**
		 * Eightbit deepSkyBlue4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue4_2: Type = _fromCode(Code.Type.DeepSkyBlue4_2);
		/**
		 * Eightbit deepSkyBlue4_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue4_3: Type = _fromCode(Code.Type.DeepSkyBlue4_3);
		/**
		 * Eightbit dodgerBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const dodgerBlue3: Type = _fromCode(Code.Type.DodgerBlue3);
		/**
		 * Eightbit dodgerBlue2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const dodgerBlue2: Type = _fromCode(Code.Type.DodgerBlue2);
		/**
		 * Eightbit green4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green4: Type = _fromCode(Code.Type.Green4);
		/**
		 * Eightbit springGreen4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen4: Type = _fromCode(Code.Type.SpringGreen4);
		/**
		 * Eightbit turquoise4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const turquoise4: Type = _fromCode(Code.Type.Turquoise4);
		/**
		 * Eightbit deepSkyBlue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue3_1: Type = _fromCode(Code.Type.DeepSkyBlue3_1);
		/**
		 * Eightbit deepSkyBlue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue3_2: Type = _fromCode(Code.Type.DeepSkyBlue3_2);
		/**
		 * Eightbit dodgerBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const dodgerBlue1: Type = _fromCode(Code.Type.DodgerBlue1);
		/**
		 * Eightbit green3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green3_1: Type = _fromCode(Code.Type.Green3_1);
		/**
		 * Eightbit springGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen3_1: Type = _fromCode(Code.Type.SpringGreen3_1);
		/**
		 * Eightbit darkCyan color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkCyan: Type = _fromCode(Code.Type.DarkCyan);
		/**
		 * Eightbit lightSeaGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSeaGreen: Type = _fromCode(Code.Type.LightSeaGreen);
		/**
		 * Eightbit deepSkyBlue2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue2: Type = _fromCode(Code.Type.DeepSkyBlue2);
		/**
		 * Eightbit deepSkyBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue1: Type = _fromCode(Code.Type.DeepSkyBlue1);
		/**
		 * Eightbit green3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green3_2: Type = _fromCode(Code.Type.Green3_2);
		/**
		 * Eightbit springGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen3_2: Type = _fromCode(Code.Type.SpringGreen3_2);
		/**
		 * Eightbit springGreen2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen2_1: Type = _fromCode(Code.Type.SpringGreen2_1);
		/**
		 * Eightbit cyan3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cyan3: Type = _fromCode(Code.Type.Cyan3);
		/**
		 * Eightbit darkTurquoise color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkTurquoise: Type = _fromCode(Code.Type.DarkTurquoise);
		/**
		 * Eightbit turquoise2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const turquoise2: Type = _fromCode(Code.Type.Turquoise2);
		/**
		 * Eightbit green1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green1: Type = _fromCode(Code.Type.Green1);
		/**
		 * Eightbit springGreen2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen2_2: Type = _fromCode(Code.Type.SpringGreen2_2);
		/**
		 * Eightbit springGreen1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen1: Type = _fromCode(Code.Type.SpringGreen1);
		/**
		 * Eightbit mediumSpringGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumSpringGreen: Type = _fromCode(Code.Type.MediumSpringGreen);
		/**
		 * Eightbit cyan2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cyan2: Type = _fromCode(Code.Type.Cyan2);
		/**
		 * Eightbit cyan1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cyan1: Type = _fromCode(Code.Type.Cyan1);
		/**
		 * Eightbit darkRed_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkRed_1: Type = _fromCode(Code.Type.DarkRed_1);
		/**
		 * Eightbit deepPink4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink4_1: Type = _fromCode(Code.Type.DeepPink4_1);
		/**
		 * Eightbit purple4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple4_1: Type = _fromCode(Code.Type.Purple4_1);
		/**
		 * Eightbit purple4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple4_2: Type = _fromCode(Code.Type.Purple4_2);
		/**
		 * Eightbit purple3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple3: Type = _fromCode(Code.Type.Purple3);
		/**
		 * Eightbit blueViolet color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blueViolet: Type = _fromCode(Code.Type.BlueViolet);
		/**
		 * Eightbit orange4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange4_1: Type = _fromCode(Code.Type.Orange4_1);
		/**
		 * Eightbit grey37 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey37: Type = _fromCode(Code.Type.Grey37);
		/**
		 * Eightbit mediumPurple4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple4: Type = _fromCode(Code.Type.MediumPurple4);
		/**
		 * Eightbit slateBlue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const slateBlue3_1: Type = _fromCode(Code.Type.SlateBlue3_1);
		/**
		 * Eightbit slateBlue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const slateBlue3_2: Type = _fromCode(Code.Type.SlateBlue3_2);
		/**
		 * Eightbit royalBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const royalBlue1: Type = _fromCode(Code.Type.RoyalBlue1);
		/**
		 * Eightbit chartreuse4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse4: Type = _fromCode(Code.Type.Chartreuse4);
		/**
		 * Eightbit darkSeaGreen4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen4_1: Type = _fromCode(Code.Type.DarkSeaGreen4_1);
		/**
		 * Eightbit paleTurquoise4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleTurquoise4: Type = _fromCode(Code.Type.PaleTurquoise4);
		/**
		 * Eightbit steelBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue: Type = _fromCode(Code.Type.SteelBlue);
		/**
		 * Eightbit steelBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue3: Type = _fromCode(Code.Type.SteelBlue3);
		/**
		 * Eightbit cornflowerBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cornflowerBlue: Type = _fromCode(Code.Type.CornflowerBlue);
		/**
		 * Eightbit chartreuse3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse3_1: Type = _fromCode(Code.Type.Chartreuse3_1);
		/**
		 * Eightbit darkSeaGreen4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen4_2: Type = _fromCode(Code.Type.DarkSeaGreen4_2);
		/**
		 * Eightbit cadetBlue_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cadetBlue_1: Type = _fromCode(Code.Type.CadetBlue_1);
		/**
		 * Eightbit cadetBlue_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cadetBlue_2: Type = _fromCode(Code.Type.CadetBlue_2);
		/**
		 * Eightbit skyBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const skyBlue3: Type = _fromCode(Code.Type.SkyBlue3);
		/**
		 * Eightbit steelBlue1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue1_1: Type = _fromCode(Code.Type.SteelBlue1_1);
		/**
		 * Eightbit chartreuse3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse3_2: Type = _fromCode(Code.Type.Chartreuse3_2);
		/**
		 * Eightbit paleGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen3_1: Type = _fromCode(Code.Type.PaleGreen3_1);
		/**
		 * Eightbit seaGreen3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen3: Type = _fromCode(Code.Type.SeaGreen3);
		/**
		 * Eightbit aquamarine3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aquamarine3: Type = _fromCode(Code.Type.Aquamarine3);
		/**
		 * Eightbit mediumTurquoise color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumTurquoise: Type = _fromCode(Code.Type.MediumTurquoise);
		/**
		 * Eightbit steelBlue1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue1_2: Type = _fromCode(Code.Type.SteelBlue1_2);
		/**
		 * Eightbit chartreuse2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse2_1: Type = _fromCode(Code.Type.Chartreuse2_1);
		/**
		 * Eightbit seaGreen2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen2: Type = _fromCode(Code.Type.SeaGreen2);
		/**
		 * Eightbit seaGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen1_1: Type = _fromCode(Code.Type.SeaGreen1_1);
		/**
		 * Eightbit seaGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen1_2: Type = _fromCode(Code.Type.SeaGreen1_2);
		/**
		 * Eightbit aquamarine1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aquamarine1_1: Type = _fromCode(Code.Type.Aquamarine1_1);
		/**
		 * Eightbit darkSlateGray2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSlateGray2: Type = _fromCode(Code.Type.DarkSlateGray2);
		/**
		 * Eightbit darkRed_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkRed_2: Type = _fromCode(Code.Type.DarkRed_2);
		/**
		 * Eightbit deepPink4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink4_2: Type = _fromCode(Code.Type.DeepPink4_2);
		/**
		 * Eightbit darkMagenta_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkMagenta_1: Type = _fromCode(Code.Type.DarkMagenta_1);
		/**
		 * Eightbit darkMagenta_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkMagenta_2: Type = _fromCode(Code.Type.DarkMagenta_2);
		/**
		 * Eightbit darkViolet_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkViolet_1: Type = _fromCode(Code.Type.DarkViolet_1);
		/**
		 * Eightbit purple_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple_2: Type = _fromCode(Code.Type.Purple_2);
		/**
		 * Eightbit orange4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange4_2: Type = _fromCode(Code.Type.Orange4_2);
		/**
		 * Eightbit lightPink4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightPink4: Type = _fromCode(Code.Type.LightPink4);
		/**
		 * Eightbit plum4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum4: Type = _fromCode(Code.Type.Plum4);
		/**
		 * Eightbit mediumPurple3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple3_1: Type = _fromCode(Code.Type.MediumPurple3_1);
		/**
		 * Eightbit mediumPurple3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple3_2: Type = _fromCode(Code.Type.MediumPurple3_2);
		/**
		 * Eightbit slateBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const slateBlue1: Type = _fromCode(Code.Type.SlateBlue1);
		/**
		 * Eightbit yellow4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow4_1: Type = _fromCode(Code.Type.Yellow4_1);
		/**
		 * Eightbit wheat4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const wheat4: Type = _fromCode(Code.Type.Wheat4);
		/**
		 * Eightbit grey53 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey53: Type = _fromCode(Code.Type.Grey53);
		/**
		 * Eightbit lightSlateGrey color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSlateGrey: Type = _fromCode(Code.Type.LightSlateGrey);
		/**
		 * Eightbit mediumPurple color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple: Type = _fromCode(Code.Type.MediumPurple);
		/**
		 * Eightbit lightSlateBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSlateBlue: Type = _fromCode(Code.Type.LightSlateBlue);
		/**
		 * Eightbit yellow4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow4_2: Type = _fromCode(Code.Type.Yellow4_2);
		/**
		 * Eightbit darkOliveGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen3_1: Type = _fromCode(Code.Type.DarkOliveGreen3_1);
		/**
		 * Eightbit darkSeaGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen: Type = _fromCode(Code.Type.DarkSeaGreen);
		/**
		 * Eightbit lightSkyBlue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSkyBlue3_1: Type = _fromCode(Code.Type.LightSkyBlue3_1);
		/**
		 * Eightbit lightSkyBlue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSkyBlue3_2: Type = _fromCode(Code.Type.LightSkyBlue3_2);
		/**
		 * Eightbit skyBlue2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const skyBlue2: Type = _fromCode(Code.Type.SkyBlue2);
		/**
		 * Eightbit chartreuse2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse2_2: Type = _fromCode(Code.Type.Chartreuse2_2);
		/**
		 * Eightbit darkOliveGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen3_2: Type = _fromCode(Code.Type.DarkOliveGreen3_2);
		/**
		 * Eightbit paleGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen3_2: Type = _fromCode(Code.Type.PaleGreen3_2);
		/**
		 * Eightbit darkSeaGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen3_1: Type = _fromCode(Code.Type.DarkSeaGreen3_1);
		/**
		 * Eightbit darkSlateGray3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSlateGray3: Type = _fromCode(Code.Type.DarkSlateGray3);
		/**
		 * Eightbit skyBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const skyBlue1: Type = _fromCode(Code.Type.SkyBlue1);
		/**
		 * Eightbit chartreuse1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse1: Type = _fromCode(Code.Type.Chartreuse1);
		/**
		 * Eightbit lightGreen_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGreen_1: Type = _fromCode(Code.Type.LightGreen_1);
		/**
		 * Eightbit lightGreen_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGreen_2: Type = _fromCode(Code.Type.LightGreen_2);
		/**
		 * Eightbit paleGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen1_1: Type = _fromCode(Code.Type.PaleGreen1_1);
		/**
		 * Eightbit aquamarine1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aquamarine1_2: Type = _fromCode(Code.Type.Aquamarine1_2);
		/**
		 * Eightbit darkSlateGray1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSlateGray1: Type = _fromCode(Code.Type.DarkSlateGray1);
		/**
		 * Eightbit red3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red3_1: Type = _fromCode(Code.Type.Red3_1);
		/**
		 * Eightbit deepPink4_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink4_3: Type = _fromCode(Code.Type.DeepPink4_3);
		/**
		 * Eightbit mediumVioletRed color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumVioletRed: Type = _fromCode(Code.Type.MediumVioletRed);
		/**
		 * Eightbit magenta3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta3_1: Type = _fromCode(Code.Type.Magenta3_1);
		/**
		 * Eightbit darkViolet_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkViolet_2: Type = _fromCode(Code.Type.DarkViolet_2);
		/**
		 * Eightbit purple_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple_3: Type = _fromCode(Code.Type.Purple_3);
		/**
		 * Eightbit darkOrange3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOrange3_1: Type = _fromCode(Code.Type.DarkOrange3_1);
		/**
		 * Eightbit indianRed_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed_1: Type = _fromCode(Code.Type.IndianRed_1);
		/**
		 * Eightbit hotPink3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink3_1: Type = _fromCode(Code.Type.HotPink3_1);
		/**
		 * Eightbit mediumOrchid3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid3: Type = _fromCode(Code.Type.MediumOrchid3);
		/**
		 * Eightbit mediumOrchid color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid: Type = _fromCode(Code.Type.MediumOrchid);
		/**
		 * Eightbit mediumPurple2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple2_1: Type = _fromCode(Code.Type.MediumPurple2_1);
		/**
		 * Eightbit darkGoldenrod color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkGoldenrod: Type = _fromCode(Code.Type.DarkGoldenrod);
		/**
		 * Eightbit lightSalmon3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSalmon3_1: Type = _fromCode(Code.Type.LightSalmon3_1);
		/**
		 * Eightbit rosyBrown color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const rosyBrown: Type = _fromCode(Code.Type.RosyBrown);
		/**
		 * Eightbit grey63 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey63: Type = _fromCode(Code.Type.Grey63);
		/**
		 * Eightbit mediumPurple2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple2_2: Type = _fromCode(Code.Type.MediumPurple2_2);
		/**
		 * Eightbit mediumPurple1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple1: Type = _fromCode(Code.Type.MediumPurple1);
		/**
		 * Eightbit gold3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const gold3_1: Type = _fromCode(Code.Type.Gold3_1);
		/**
		 * Eightbit darkKhaki color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkKhaki: Type = _fromCode(Code.Type.DarkKhaki);
		/**
		 * Eightbit navajoWhite3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navajoWhite3: Type = _fromCode(Code.Type.NavajoWhite3);
		/**
		 * Eightbit grey69 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey69: Type = _fromCode(Code.Type.Grey69);
		/**
		 * Eightbit lightSteelBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSteelBlue3: Type = _fromCode(Code.Type.LightSteelBlue3);
		/**
		 * Eightbit lightSteelBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSteelBlue: Type = _fromCode(Code.Type.LightSteelBlue);
		/**
		 * Eightbit yellow3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow3_1: Type = _fromCode(Code.Type.Yellow3_1);
		/**
		 * Eightbit darkOliveGreen3_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen3_3: Type = _fromCode(Code.Type.DarkOliveGreen3_3);
		/**
		 * Eightbit darkSeaGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen3_2: Type = _fromCode(Code.Type.DarkSeaGreen3_2);
		/**
		 * Eightbit darkSeaGreen2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen2_1: Type = _fromCode(Code.Type.DarkSeaGreen2_1);
		/**
		 * Eightbit lightCyan3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightCyan3: Type = _fromCode(Code.Type.LightCyan3);
		/**
		 * Eightbit lightSkyBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSkyBlue1: Type = _fromCode(Code.Type.LightSkyBlue1);
		/**
		 * Eightbit greenYellow color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const greenYellow: Type = _fromCode(Code.Type.GreenYellow);
		/**
		 * Eightbit darkOliveGreen2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen2: Type = _fromCode(Code.Type.DarkOliveGreen2);
		/**
		 * Eightbit paleGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen1_2: Type = _fromCode(Code.Type.PaleGreen1_2);
		/**
		 * Eightbit darkSeaGreen2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen2_2: Type = _fromCode(Code.Type.DarkSeaGreen2_2);
		/**
		 * Eightbit darkSeaGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen1_1: Type = _fromCode(Code.Type.DarkSeaGreen1_1);
		/**
		 * Eightbit paleTurquoise1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleTurquoise1: Type = _fromCode(Code.Type.PaleTurquoise1);
		/**
		 * Eightbit red3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red3_2: Type = _fromCode(Code.Type.Red3_2);
		/**
		 * Eightbit deepPink3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink3_1: Type = _fromCode(Code.Type.DeepPink3_1);
		/**
		 * Eightbit deepPink3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink3_2: Type = _fromCode(Code.Type.DeepPink3_2);
		/**
		 * Eightbit magenta3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta3_2: Type = _fromCode(Code.Type.Magenta3_2);
		/**
		 * Eightbit magenta3_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta3_3: Type = _fromCode(Code.Type.Magenta3_3);
		/**
		 * Eightbit magenta2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta2_1: Type = _fromCode(Code.Type.Magenta2_1);
		/**
		 * Eightbit darkOrange3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOrange3_2: Type = _fromCode(Code.Type.DarkOrange3_2);
		/**
		 * Eightbit indianRed_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed_2: Type = _fromCode(Code.Type.IndianRed_2);
		/**
		 * Eightbit hotPink3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink3_2: Type = _fromCode(Code.Type.HotPink3_2);
		/**
		 * Eightbit hotPink2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink2: Type = _fromCode(Code.Type.HotPink2);
		/**
		 * Eightbit orchid color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orchid: Type = _fromCode(Code.Type.Orchid);
		/**
		 * Eightbit mediumOrchid1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid1_1: Type = _fromCode(Code.Type.MediumOrchid1_1);
		/**
		 * Eightbit orange3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange3: Type = _fromCode(Code.Type.Orange3);
		/**
		 * Eightbit lightSalmon3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSalmon3_2: Type = _fromCode(Code.Type.LightSalmon3_2);
		/**
		 * Eightbit lightPink3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightPink3: Type = _fromCode(Code.Type.LightPink3);
		/**
		 * Eightbit pink3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const pink3: Type = _fromCode(Code.Type.Pink3);
		/**
		 * Eightbit plum3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum3: Type = _fromCode(Code.Type.Plum3);
		/**
		 * Eightbit violet color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const violet: Type = _fromCode(Code.Type.Violet);
		/**
		 * Eightbit gold3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const gold3_2: Type = _fromCode(Code.Type.Gold3_2);
		/**
		 * Eightbit lightGoldenrod3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod3: Type = _fromCode(Code.Type.LightGoldenrod3);
		/**
		 * Eightbit tan color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const tan: Type = _fromCode(Code.Type.Tan);
		/**
		 * Eightbit mistyRose3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mistyRose3: Type = _fromCode(Code.Type.MistyRose3);
		/**
		 * Eightbit thistle3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const thistle3: Type = _fromCode(Code.Type.Thistle3);
		/**
		 * Eightbit plum2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum2: Type = _fromCode(Code.Type.Plum2);
		/**
		 * Eightbit yellow3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow3_2: Type = _fromCode(Code.Type.Yellow3_2);
		/**
		 * Eightbit khaki3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const khaki3: Type = _fromCode(Code.Type.Khaki3);
		/**
		 * Eightbit lightGoldenrod2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod2_1: Type = _fromCode(Code.Type.LightGoldenrod2_1);
		/**
		 * Eightbit lightYellow3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightYellow3: Type = _fromCode(Code.Type.LightYellow3);
		/**
		 * Eightbit grey84 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey84: Type = _fromCode(Code.Type.Grey84);
		/**
		 * Eightbit lightSteelBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSteelBlue1: Type = _fromCode(Code.Type.LightSteelBlue1);
		/**
		 * Eightbit yellow2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow2: Type = _fromCode(Code.Type.Yellow2);
		/**
		 * Eightbit darkOliveGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen1_1: Type = _fromCode(Code.Type.DarkOliveGreen1_1);
		/**
		 * Eightbit darkOliveGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen1_2: Type = _fromCode(Code.Type.DarkOliveGreen1_2);
		/**
		 * Eightbit darkSeaGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen1_2: Type = _fromCode(Code.Type.DarkSeaGreen1_2);
		/**
		 * Eightbit honeydew2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const honeydew2: Type = _fromCode(Code.Type.Honeydew2);
		/**
		 * Eightbit lightCyan1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightCyan1: Type = _fromCode(Code.Type.LightCyan1);
		/**
		 * Eightbit red1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red1: Type = _fromCode(Code.Type.Red1);
		/**
		 * Eightbit deepPink2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink2: Type = _fromCode(Code.Type.DeepPink2);
		/**
		 * Eightbit deepPink1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink1_1: Type = _fromCode(Code.Type.DeepPink1_1);
		/**
		 * Eightbit deepPink1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink1_2: Type = _fromCode(Code.Type.DeepPink1_2);
		/**
		 * Eightbit magenta2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta2_2: Type = _fromCode(Code.Type.Magenta2_2);
		/**
		 * Eightbit magenta1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta1: Type = _fromCode(Code.Type.Magenta1);
		/**
		 * Eightbit orangeRed1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orangeRed1: Type = _fromCode(Code.Type.OrangeRed1);
		/**
		 * Eightbit indianRed1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed1_1: Type = _fromCode(Code.Type.IndianRed1_1);
		/**
		 * Eightbit indianRed1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed1_2: Type = _fromCode(Code.Type.IndianRed1_2);
		/**
		 * Eightbit hotPink_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink_1: Type = _fromCode(Code.Type.HotPink_1);
		/**
		 * Eightbit hotPink_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink_2: Type = _fromCode(Code.Type.HotPink_2);
		/**
		 * Eightbit mediumOrchid1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid1_2: Type = _fromCode(Code.Type.MediumOrchid1_2);
		/**
		 * Eightbit darkOrange color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOrange: Type = _fromCode(Code.Type.DarkOrange);
		/**
		 * Eightbit salmon1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const salmon1: Type = _fromCode(Code.Type.Salmon1);
		/**
		 * Eightbit lightCoral color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightCoral: Type = _fromCode(Code.Type.LightCoral);
		/**
		 * Eightbit paleVioletRed1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleVioletRed1: Type = _fromCode(Code.Type.PaleVioletRed1);
		/**
		 * Eightbit orchid2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orchid2: Type = _fromCode(Code.Type.Orchid2);
		/**
		 * Eightbit orchid1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orchid1: Type = _fromCode(Code.Type.Orchid1);
		/**
		 * Eightbit orange1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange1: Type = _fromCode(Code.Type.Orange1);
		/**
		 * Eightbit sandyBrown color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const sandyBrown: Type = _fromCode(Code.Type.SandyBrown);
		/**
		 * Eightbit lightSalmon1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSalmon1: Type = _fromCode(Code.Type.LightSalmon1);
		/**
		 * Eightbit lightPink1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightPink1: Type = _fromCode(Code.Type.LightPink1);
		/**
		 * Eightbit pink1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const pink1: Type = _fromCode(Code.Type.Pink1);
		/**
		 * Eightbit plum1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum1: Type = _fromCode(Code.Type.Plum1);
		/**
		 * Eightbit gold1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const gold1: Type = _fromCode(Code.Type.Gold1);
		/**
		 * Eightbit lightGoldenrod2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod2_2: Type = _fromCode(Code.Type.LightGoldenrod2_2);
		/**
		 * Eightbit lightGoldenrod2_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod2_3: Type = _fromCode(Code.Type.LightGoldenrod2_3);
		/**
		 * Eightbit navajoWhite1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navajoWhite1: Type = _fromCode(Code.Type.NavajoWhite1);
		/**
		 * Eightbit mistyRose1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mistyRose1: Type = _fromCode(Code.Type.MistyRose1);
		/**
		 * Eightbit thistle1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const thistle1: Type = _fromCode(Code.Type.Thistle1);
		/**
		 * Eightbit yellow1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow1: Type = _fromCode(Code.Type.Yellow1);
		/**
		 * Eightbit lightGoldenrod1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod1: Type = _fromCode(Code.Type.LightGoldenrod1);
		/**
		 * Eightbit khaki1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const khaki1: Type = _fromCode(Code.Type.Khaki1);
		/**
		 * Eightbit wheat1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const wheat1: Type = _fromCode(Code.Type.Wheat1);
		/**
		 * Eightbit cornsilk1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cornsilk1: Type = _fromCode(Code.Type.Cornsilk1);
		/**
		 * Eightbit grey100 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey100: Type = _fromCode(Code.Type.Grey100);
		/**
		 * Eightbit grey3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey3: Type = _fromCode(Code.Type.Grey3);
		/**
		 * Eightbit grey7 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey7: Type = _fromCode(Code.Type.Grey7);
		/**
		 * Eightbit grey11 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey11: Type = _fromCode(Code.Type.Grey11);
		/**
		 * Eightbit grey15 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey15: Type = _fromCode(Code.Type.Grey15);
		/**
		 * Eightbit grey19 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey19: Type = _fromCode(Code.Type.Grey19);
		/**
		 * Eightbit grey23 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey23: Type = _fromCode(Code.Type.Grey23);
		/**
		 * Eightbit grey27 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey27: Type = _fromCode(Code.Type.Grey27);
		/**
		 * Eightbit grey30 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey30: Type = _fromCode(Code.Type.Grey30);
		/**
		 * Eightbit grey35 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey35: Type = _fromCode(Code.Type.Grey35);
		/**
		 * Eightbit grey39 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey39: Type = _fromCode(Code.Type.Grey39);
		/**
		 * Eightbit grey42 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey42: Type = _fromCode(Code.Type.Grey42);
		/**
		 * Eightbit grey46 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey46: Type = _fromCode(Code.Type.Grey46);
		/**
		 * Eightbit grey50 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey50: Type = _fromCode(Code.Type.Grey50);
		/**
		 * Eightbit grey54 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey54: Type = _fromCode(Code.Type.Grey54);
		/**
		 * Eightbit grey58 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey58: Type = _fromCode(Code.Type.Grey58);
		/**
		 * Eightbit grey62 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey62: Type = _fromCode(Code.Type.Grey62);
		/**
		 * Eightbit grey66 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey66: Type = _fromCode(Code.Type.Grey66);
		/**
		 * Eightbit grey70 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey70: Type = _fromCode(Code.Type.Grey70);
		/**
		 * Eightbit grey74 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey74: Type = _fromCode(Code.Type.Grey74);
		/**
		 * Eightbit grey78 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey78: Type = _fromCode(Code.Type.Grey78);
		/**
		 * Eightbit grey82 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey82: Type = _fromCode(Code.Type.Grey82);
		/**
		 * Eightbit grey85 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey85: Type = _fromCode(Code.Type.Grey85);
		/**
		 * Eightbit grey89 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey89: Type = _fromCode(Code.Type.Grey89);
		/**
		 * Eightbit grey93 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey93: Type = _fromCode(Code.Type.Grey93);
	}
}

/**
 * Namespace for RGB colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace RGB {
	/** RGB foreground color Style instance maker */
	const _fromCodes: MTypes.OneArgFunction<
		{
			readonly id: string;
			readonly redCode: number;
			readonly greenCode: number;
			readonly blueCode: number;
		},
		Type
	> = flow(ASStyleCharacteristic.RgbFgColor, _fromCharacteritic);

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
			id: `${red}/${green}/${blue}`,
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
		id: 'Maroon',
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
		id: 'DarkRed',
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
		id: 'Brown',
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
		id: 'Firebrick',
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
		id: 'Crimson',
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
		id: 'Red',
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
		id: 'Tomato',
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
		id: 'Coral',
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
		id: 'IndianRed',
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
		id: 'LightCoral',
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
		id: 'DarkSalmon',
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
		id: 'Salmon',
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
		id: 'LightSalmon',
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
		id: 'OrangeRed',
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
		id: 'DarkOrange',
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
		id: 'Orange',
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
		id: 'Gold',
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
		id: 'DarkGoldenRod',
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
		id: 'GoldenRod',
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
		id: 'PaleGoldenRod',
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
		id: 'DarkKhaki',
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
		id: 'Khaki',
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
		id: 'Olive',
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
		id: 'Yellow',
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
		id: 'YellowGreen',
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
		id: 'DarkOliveGreen',
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
		id: 'OliveDrab',
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
		id: 'LawnGreen',
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
		id: 'Chartreuse',
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
		id: 'GreenYellow',
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
		id: 'DarkGreen',
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
		id: 'Green',
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
		id: 'ForestGreen',
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
		id: 'Lime',
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
		id: 'LimeGreen',
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
		id: 'LightGreen',
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
		id: 'PaleGreen',
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
		id: 'DarkSeaGreen',
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
		id: 'MediumSpringGreen',
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
		id: 'SpringGreen',
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
		id: 'SeaGreen',
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
		id: 'MediumAquaMarine',
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
		id: 'MediumSeaGreen',
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
		id: 'LightSeaGreen',
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
		id: 'DarkSlateGray',
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
		id: 'Teal',
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
		id: 'DarkCyan',
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
		id: 'Aqua',
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
		id: 'Cyan',
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
		id: 'LightCyan',
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
		id: 'DarkTurquoise',
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
		id: 'Turquoise',
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
		id: 'MediumTurquoise',
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
		id: 'PaleTurquoise',
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
		id: 'AquaMarine',
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
		id: 'PowderBlue',
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
		id: 'CadetBlue',
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
		id: 'SteelBlue',
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
		id: 'CornFlowerBlue',
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
		id: 'DeepSkyBlue',
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
		id: 'DodgerBlue',
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
		id: 'LightBlue',
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
		id: 'SkyBlue',
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
		id: 'LightSkyBlue',
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
		id: 'MidnightBlue',
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
		id: 'Navy',
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
		id: 'DarkBlue',
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
		id: 'MediumBlue',
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
		id: 'Blue',
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
		id: 'RoyalBlue',
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
		id: 'BlueViolet',
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
		id: 'Indigo',
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
		id: 'DarkSlateBlue',
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
		id: 'SlateBlue',
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
		id: 'MediumSlateBlue',
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
		id: 'MediumPurple',
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
		id: 'DarkMagenta',
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
		id: 'DarkViolet',
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
		id: 'DarkOrchid',
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
		id: 'MediumOrchid2',
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
		id: 'Purple',
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
		id: 'Thistle',
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
		id: 'Plum',
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
		id: 'Violet',
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
		id: 'Magenta',
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
		id: 'Orchid',
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
		id: 'MediumVioletRed',
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
		id: 'PaleVioletRed',
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
		id: 'DeepPink',
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
		id: 'HotPink',
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
		id: 'LightPink',
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
		id: 'Pink',
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
		id: 'AntiqueWhite',
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
		id: 'Beige',
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
		id: 'Bisque',
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
		id: 'BlanchedAlmond',
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
		id: 'Wheat',
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
		id: 'CornSilk',
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
		id: 'LemonChiffon',
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
		id: 'LightGoldenRodYellow',
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
		id: 'LightYellow',
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
		id: 'SaddleBrown',
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
		id: 'Sienna',
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
		id: 'Chocolate',
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
		id: 'Peru',
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
		id: 'SandyBrown',
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
		id: 'BurlyWood',
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
		id: 'Tan',
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
		id: 'RosyBrown',
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
		id: 'Moccasin',
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
		id: 'NavajoWhite',
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
		id: 'PeachPuff',
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
		id: 'MistyRose',
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
		id: 'LavenderBlush',
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
		id: 'Linen',
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
		id: 'OldLace',
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
		id: 'PapayaWhip',
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
		id: 'SeaShell',
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
		id: 'MintCream',
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
		id: 'SlateGray',
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
		id: 'LightSlateGray',
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
		id: 'LightSteelBlue',
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
		id: 'Lavender',
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
		id: 'FloralWhite',
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
		id: 'AliceBlue',
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
		id: 'GhostWhite',
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
		id: 'Honeydew',
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
		id: 'Ivory',
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
		id: 'Azure',
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
		id: 'Snow',
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
		id: 'Black',
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
		id: 'DimGray',
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
		id: 'Gray',
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
		id: 'DarkGray',
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
		id: 'Silver',
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
		id: 'LightGray',
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
		id: 'Gainsboro',
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
		id: 'WhiteSmoke',
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
		id: 'White',
		redCode: 255,
		greenCode: 255,
		blueCode: 255
	});

	/**
	 * Namespace for RGB Bg colors
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace Bg {
		/** RGB background color Style instance maker */
		const _fromCodes: MTypes.OneArgFunction<
			{
				readonly id: string;
				readonly redCode: number;
				readonly greenCode: number;
				readonly blueCode: number;
			},
			Type
		> = flow(ASStyleCharacteristic.RgbBgColor, _fromCharacteritic);

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
				id: `${red}/${green}/${blue}`,
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
			id: 'Maroon',
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
			id: 'DarkRed',
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
			id: 'Brown',
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
			id: 'Firebrick',
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
			id: 'Crimson',
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
			id: 'Red',
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
			id: 'Tomato',
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
			id: 'Coral',
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
			id: 'IndianRed',
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
			id: 'LightCoral',
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
			id: 'DarkSalmon',
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
			id: 'Salmon',
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
			id: 'LightSalmon',
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
			id: 'OrangeRed',
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
			id: 'DarkOrange',
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
			id: 'Orange',
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
			id: 'Gold',
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
			id: 'DarkGoldenRod',
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
			id: 'GoldenRod',
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
			id: 'PaleGoldenRod',
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
			id: 'DarkKhaki',
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
			id: 'Khaki',
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
			id: 'Olive',
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
			id: 'Yellow',
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
			id: 'YellowGreen',
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
			id: 'DarkOliveGreen',
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
			id: 'OliveDrab',
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
			id: 'LawnGreen',
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
			id: 'Chartreuse',
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
			id: 'GreenYellow',
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
			id: 'DarkGreen',
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
			id: 'Green',
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
			id: 'ForestGreen',
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
			id: 'Lime',
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
			id: 'LimeGreen',
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
			id: 'LightGreen',
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
			id: 'PaleGreen',
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
			id: 'DarkSeaGreen',
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
			id: 'MediumSpringGreen',
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
			id: 'SpringGreen',
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
			id: 'SeaGreen',
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
			id: 'MediumAquaMarine',
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
			id: 'MediumSeaGreen',
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
			id: 'LightSeaGreen',
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
			id: 'DarkSlateGray',
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
			id: 'Teal',
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
			id: 'DarkCyan',
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
			id: 'Aqua',
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
			id: 'Cyan',
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
			id: 'LightCyan',
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
			id: 'DarkTurquoise',
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
			id: 'Turquoise',
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
			id: 'MediumTurquoise',
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
			id: 'PaleTurquoise',
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
			id: 'AquaMarine',
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
			id: 'PowderBlue',
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
			id: 'CadetBlue',
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
			id: 'SteelBlue',
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
			id: 'CornFlowerBlue',
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
			id: 'DeepSkyBlue',
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
			id: 'DodgerBlue',
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
			id: 'LightBlue',
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
			id: 'SkyBlue',
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
			id: 'LightSkyBlue',
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
			id: 'MidnightBlue',
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
			id: 'Navy',
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
			id: 'DarkBlue',
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
			id: 'MediumBlue',
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
			id: 'Blue',
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
			id: 'RoyalBlue',
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
			id: 'BlueViolet',
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
			id: 'Indigo',
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
			id: 'DarkSlateBlue',
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
			id: 'SlateBlue',
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
			id: 'MediumSlateBlue',
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
			id: 'MediumPurple',
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
			id: 'DarkMagenta',
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
			id: 'DarkViolet',
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
			id: 'DarkOrchid',
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
			id: 'MediumOrchid2',
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
			id: 'Purple',
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
			id: 'Thistle',
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
			id: 'Plum',
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
			id: 'Violet',
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
			id: 'Magenta',
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
			id: 'Orchid',
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
			id: 'MediumVioletRed',
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
			id: 'PaleVioletRed',
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
			id: 'DeepPink',
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
			id: 'HotPink',
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
			id: 'LightPink',
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
			id: 'Pink',
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
			id: 'AntiqueWhite',
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
			id: 'Beige',
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
			id: 'Bisque',
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
			id: 'BlanchedAlmond',
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
			id: 'Wheat',
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
			id: 'CornSilk',
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
			id: 'LemonChiffon',
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
			id: 'LightGoldenRodYellow',
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
			id: 'LightYellow',
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
			id: 'SaddleBrown',
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
			id: 'Sienna',
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
			id: 'Chocolate',
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
			id: 'Peru',
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
			id: 'SandyBrown',
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
			id: 'BurlyWood',
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
			id: 'Tan',
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
			id: 'RosyBrown',
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
			id: 'Moccasin',
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
			id: 'NavajoWhite',
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
			id: 'PeachPuff',
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
			id: 'MistyRose',
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
			id: 'LavenderBlush',
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
			id: 'Linen',
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
			id: 'OldLace',
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
			id: 'PapayaWhip',
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
			id: 'SeaShell',
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
			id: 'MintCream',
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
			id: 'SlateGray',
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
			id: 'LightSlateGray',
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
			id: 'LightSteelBlue',
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
			id: 'Lavender',
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
			id: 'FloralWhite',
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
			id: 'AliceBlue',
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
			id: 'GhostWhite',
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
			id: 'Honeydew',
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
			id: 'Ivory',
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
			id: 'Azure',
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
			id: 'Snow',
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
			id: 'Black',
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
			id: 'DimGray',
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
			id: 'Gray',
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
			id: 'DarkGray',
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
			id: 'Silver',
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
			id: 'LightGray',
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
			id: 'Gainsboro',
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
			id: 'WhiteSmoke',
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
			id: 'White',
			redCode: 255,
			greenCode: 255,
			blueCode: 255
		});
	}
}
