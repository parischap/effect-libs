/**
 * This module implements a type that represents an ANSI style as defined in the Select Graphic
 * Rendition subset. Info at
 * https://stackoverflow.com/questions/4842424/list-of-ansi-fgColor-escape-characteristicSequences.
 * A style is simply a sorted array of the StyleCharacteristics that define it.
 *
 * @since 0.0.1
 */

import { MFunction, MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
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
import * as ASColorCode from './ColorCode.js';
import * as ASStyleCharacteristic from './StyleCharacteristic.js';
import * as ASText from './Text.js';

export const moduleTag = '@parischap/ansi-styles/Style/';
const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;
type TypeId = typeof TypeId;

export interface Action {
	(...args: ReadonlyArray<string | ASText.Type>): ASText.Type;
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

function _action(this: Type, ...args: ReadonlyArray<string | ASText.Type>): ASText.Type {
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

/**
 * Default foreground color Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultColor: Type = _fromCharacteritic(ASStyleCharacteristic.defaultColor);

/** Standard foreground color Style instance maker */
const _fromCode: MTypes.OneArgFunction<ASColorCode.ThreeBit.Type, Type> = flow(
	ASColorCode.ThreeBit.withId,
	ASStyleCharacteristic.standardColor,
	_fromCharacteritic
);

/**
 * Original black color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const black: Type = _fromCode(ASColorCode.ThreeBit.Type.Black);

/**
 * Original red color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const red: Type = _fromCode(ASColorCode.ThreeBit.Type.Red);

/**
 * Original green color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const green: Type = _fromCode(ASColorCode.ThreeBit.Type.Green);

/**
 * Original yellow color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const yellow: Type = _fromCode(ASColorCode.ThreeBit.Type.Yellow);

/**
 * Original blue color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const blue: Type = _fromCode(ASColorCode.ThreeBit.Type.Blue);

/**
 * Original magenta color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const magenta: Type = _fromCode(ASColorCode.ThreeBit.Type.Magenta);

/**
 * Original cyan color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const cyan: Type = _fromCode(ASColorCode.ThreeBit.Type.Cyan);

/**
 * Original white color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const white: Type = _fromCode(ASColorCode.ThreeBit.Type.White);

/**
 * Namespace for bright original colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Bright {
	/** Bright foreground color Style instance maker */
	const _fromCode: MTypes.OneArgFunction<ASColorCode.ThreeBit.Type, Type> = flow(
		ASColorCode.ThreeBit.withId,
		ASStyleCharacteristic.brightColor,
		_fromCharacteritic
	);

	/**
	 * Original bright black color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const black: Type = _fromCode(ASColorCode.ThreeBit.Type.Black);

	/**
	 * Original bright red color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const red: Type = _fromCode(ASColorCode.ThreeBit.Type.Red);

	/**
	 * Original bright green color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const green: Type = _fromCode(ASColorCode.ThreeBit.Type.Green);

	/**
	 * Original bright yellow color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const yellow: Type = _fromCode(ASColorCode.ThreeBit.Type.Yellow);

	/**
	 * Original bright blue color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const blue: Type = _fromCode(ASColorCode.ThreeBit.Type.Blue);

	/**
	 * Original bright magenta color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const magenta: Type = _fromCode(ASColorCode.ThreeBit.Type.Magenta);

	/**
	 * Original bright cyan color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const cyan: Type = _fromCode(ASColorCode.ThreeBit.Type.Cyan);

	/**
	 * Original bright white color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const white: Type = _fromCode(ASColorCode.ThreeBit.Type.White);
}

/**
 * Namespace for eight-bit colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace EightBit {
	/** EightBit foreground color Style instance maker */
	const _fromCode: MTypes.OneArgFunction<ASColorCode.EightBit.Type, Type> = flow(
		ASColorCode.EightBit.withId,
		ASStyleCharacteristic.eightBitColor,
		_fromCharacteritic
	);

	/**
	 * Eightbit black color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const black: Type = _fromCode(ASColorCode.EightBit.Type.Black);
	/**
	 * Eightbit maroon color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const maroon: Type = _fromCode(ASColorCode.EightBit.Type.Maroon);
	/**
	 * Eightbit green color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green: Type = _fromCode(ASColorCode.EightBit.Type.Green);
	/**
	 * Eightbit olive color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const olive: Type = _fromCode(ASColorCode.EightBit.Type.Olive);
	/**
	 * Eightbit navy color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navy: Type = _fromCode(ASColorCode.EightBit.Type.Navy);
	/**
	 * Eightbit purple_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple_1: Type = _fromCode(ASColorCode.EightBit.Type.Purple_1);
	/**
	 * Eightbit teal color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const teal: Type = _fromCode(ASColorCode.EightBit.Type.Teal);
	/**
	 * Eightbit silver color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const silver: Type = _fromCode(ASColorCode.EightBit.Type.Silver);
	/**
	 * Eightbit grey color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey: Type = _fromCode(ASColorCode.EightBit.Type.Grey);
	/**
	 * Eightbit red color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red: Type = _fromCode(ASColorCode.EightBit.Type.Red);
	/**
	 * Eightbit lime color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lime: Type = _fromCode(ASColorCode.EightBit.Type.Lime);
	/**
	 * Eightbit yellow color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow: Type = _fromCode(ASColorCode.EightBit.Type.Yellow);
	/**
	 * Eightbit blue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue: Type = _fromCode(ASColorCode.EightBit.Type.Blue);
	/**
	 * Eightbit fuchsia color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const fuchsia: Type = _fromCode(ASColorCode.EightBit.Type.Fuchsia);
	/**
	 * Eightbit aqua color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aqua: Type = _fromCode(ASColorCode.EightBit.Type.Aqua);
	/**
	 * Eightbit white color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const white: Type = _fromCode(ASColorCode.EightBit.Type.White);
	/**
	 * Eightbit grey0 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey0: Type = _fromCode(ASColorCode.EightBit.Type.Grey0);
	/**
	 * Eightbit navyBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navyBlue: Type = _fromCode(ASColorCode.EightBit.Type.NavyBlue);
	/**
	 * Eightbit darkBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkBlue: Type = _fromCode(ASColorCode.EightBit.Type.DarkBlue);
	/**
	 * Eightbit blue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue3_1: Type = _fromCode(ASColorCode.EightBit.Type.Blue3_1);
	/**
	 * Eightbit blue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue3_2: Type = _fromCode(ASColorCode.EightBit.Type.Blue3_2);
	/**
	 * Eightbit blue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blue1: Type = _fromCode(ASColorCode.EightBit.Type.Blue1);
	/**
	 * Eightbit darkGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkGreen: Type = _fromCode(ASColorCode.EightBit.Type.DarkGreen);
	/**
	 * Eightbit deepSkyBlue4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue4_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue4_1);
	/**
	 * Eightbit deepSkyBlue4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue4_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue4_2);
	/**
	 * Eightbit deepSkyBlue4_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue4_3: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue4_3);
	/**
	 * Eightbit dodgerBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const dodgerBlue3: Type = _fromCode(ASColorCode.EightBit.Type.DodgerBlue3);
	/**
	 * Eightbit dodgerBlue2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const dodgerBlue2: Type = _fromCode(ASColorCode.EightBit.Type.DodgerBlue2);
	/**
	 * Eightbit green4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green4: Type = _fromCode(ASColorCode.EightBit.Type.Green4);
	/**
	 * Eightbit springGreen4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen4: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen4);
	/**
	 * Eightbit turquoise4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const turquoise4: Type = _fromCode(ASColorCode.EightBit.Type.Turquoise4);
	/**
	 * Eightbit deepSkyBlue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue3_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue3_1);
	/**
	 * Eightbit deepSkyBlue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue3_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue3_2);
	/**
	 * Eightbit dodgerBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const dodgerBlue1: Type = _fromCode(ASColorCode.EightBit.Type.DodgerBlue1);
	/**
	 * Eightbit green3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green3_1: Type = _fromCode(ASColorCode.EightBit.Type.Green3_1);
	/**
	 * Eightbit springGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen3_1: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen3_1);
	/**
	 * Eightbit darkCyan color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkCyan: Type = _fromCode(ASColorCode.EightBit.Type.DarkCyan);
	/**
	 * Eightbit lightSeaGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSeaGreen: Type = _fromCode(ASColorCode.EightBit.Type.LightSeaGreen);
	/**
	 * Eightbit deepSkyBlue2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue2: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue2);
	/**
	 * Eightbit deepSkyBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepSkyBlue1: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue1);
	/**
	 * Eightbit green3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green3_2: Type = _fromCode(ASColorCode.EightBit.Type.Green3_2);
	/**
	 * Eightbit springGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen3_2: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen3_2);
	/**
	 * Eightbit springGreen2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen2_1: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen2_1);
	/**
	 * Eightbit cyan3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cyan3: Type = _fromCode(ASColorCode.EightBit.Type.Cyan3);
	/**
	 * Eightbit darkTurquoise color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkTurquoise: Type = _fromCode(ASColorCode.EightBit.Type.DarkTurquoise);
	/**
	 * Eightbit turquoise2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const turquoise2: Type = _fromCode(ASColorCode.EightBit.Type.Turquoise2);
	/**
	 * Eightbit green1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const green1: Type = _fromCode(ASColorCode.EightBit.Type.Green1);
	/**
	 * Eightbit springGreen2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen2_2: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen2_2);
	/**
	 * Eightbit springGreen1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const springGreen1: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen1);
	/**
	 * Eightbit mediumSpringGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumSpringGreen: Type = _fromCode(ASColorCode.EightBit.Type.MediumSpringGreen);
	/**
	 * Eightbit cyan2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cyan2: Type = _fromCode(ASColorCode.EightBit.Type.Cyan2);
	/**
	 * Eightbit cyan1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cyan1: Type = _fromCode(ASColorCode.EightBit.Type.Cyan1);
	/**
	 * Eightbit darkRed_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkRed_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkRed_1);
	/**
	 * Eightbit deepPink4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink4_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink4_1);
	/**
	 * Eightbit purple4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple4_1: Type = _fromCode(ASColorCode.EightBit.Type.Purple4_1);
	/**
	 * Eightbit purple4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple4_2: Type = _fromCode(ASColorCode.EightBit.Type.Purple4_2);
	/**
	 * Eightbit purple3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple3: Type = _fromCode(ASColorCode.EightBit.Type.Purple3);
	/**
	 * Eightbit blueViolet color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const blueViolet: Type = _fromCode(ASColorCode.EightBit.Type.BlueViolet);
	/**
	 * Eightbit orange4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange4_1: Type = _fromCode(ASColorCode.EightBit.Type.Orange4_1);
	/**
	 * Eightbit grey37 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey37: Type = _fromCode(ASColorCode.EightBit.Type.Grey37);
	/**
	 * Eightbit mediumPurple4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple4: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple4);
	/**
	 * Eightbit slateBlue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const slateBlue3_1: Type = _fromCode(ASColorCode.EightBit.Type.SlateBlue3_1);
	/**
	 * Eightbit slateBlue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const slateBlue3_2: Type = _fromCode(ASColorCode.EightBit.Type.SlateBlue3_2);
	/**
	 * Eightbit royalBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const royalBlue1: Type = _fromCode(ASColorCode.EightBit.Type.RoyalBlue1);
	/**
	 * Eightbit chartreuse4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse4: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse4);
	/**
	 * Eightbit darkSeaGreen4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen4_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen4_1);
	/**
	 * Eightbit paleTurquoise4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleTurquoise4: Type = _fromCode(ASColorCode.EightBit.Type.PaleTurquoise4);
	/**
	 * Eightbit steelBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue: Type = _fromCode(ASColorCode.EightBit.Type.SteelBlue);
	/**
	 * Eightbit steelBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue3: Type = _fromCode(ASColorCode.EightBit.Type.SteelBlue3);
	/**
	 * Eightbit cornflowerBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cornflowerBlue: Type = _fromCode(ASColorCode.EightBit.Type.CornflowerBlue);
	/**
	 * Eightbit chartreuse3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse3_1: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse3_1);
	/**
	 * Eightbit darkSeaGreen4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen4_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen4_2);
	/**
	 * Eightbit cadetBlue_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cadetBlue_1: Type = _fromCode(ASColorCode.EightBit.Type.CadetBlue_1);
	/**
	 * Eightbit cadetBlue_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cadetBlue_2: Type = _fromCode(ASColorCode.EightBit.Type.CadetBlue_2);
	/**
	 * Eightbit skyBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const skyBlue3: Type = _fromCode(ASColorCode.EightBit.Type.SkyBlue3);
	/**
	 * Eightbit steelBlue1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue1_1: Type = _fromCode(ASColorCode.EightBit.Type.SteelBlue1_1);
	/**
	 * Eightbit chartreuse3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse3_2: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse3_2);
	/**
	 * Eightbit paleGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen3_1: Type = _fromCode(ASColorCode.EightBit.Type.PaleGreen3_1);
	/**
	 * Eightbit seaGreen3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen3: Type = _fromCode(ASColorCode.EightBit.Type.SeaGreen3);
	/**
	 * Eightbit aquamarine3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aquamarine3: Type = _fromCode(ASColorCode.EightBit.Type.Aquamarine3);
	/**
	 * Eightbit mediumTurquoise color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumTurquoise: Type = _fromCode(ASColorCode.EightBit.Type.MediumTurquoise);
	/**
	 * Eightbit steelBlue1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const steelBlue1_2: Type = _fromCode(ASColorCode.EightBit.Type.SteelBlue1_2);
	/**
	 * Eightbit chartreuse2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse2_1: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse2_1);
	/**
	 * Eightbit seaGreen2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen2: Type = _fromCode(ASColorCode.EightBit.Type.SeaGreen2);
	/**
	 * Eightbit seaGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen1_1: Type = _fromCode(ASColorCode.EightBit.Type.SeaGreen1_1);
	/**
	 * Eightbit seaGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const seaGreen1_2: Type = _fromCode(ASColorCode.EightBit.Type.SeaGreen1_2);
	/**
	 * Eightbit aquamarine1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aquamarine1_1: Type = _fromCode(ASColorCode.EightBit.Type.Aquamarine1_1);
	/**
	 * Eightbit darkSlateGray2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSlateGray2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSlateGray2);
	/**
	 * Eightbit darkRed_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkRed_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkRed_2);
	/**
	 * Eightbit deepPink4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink4_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink4_2);
	/**
	 * Eightbit darkMagenta_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkMagenta_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkMagenta_1);
	/**
	 * Eightbit darkMagenta_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkMagenta_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkMagenta_2);
	/**
	 * Eightbit darkViolet_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkViolet_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkViolet_1);
	/**
	 * Eightbit purple_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple_2: Type = _fromCode(ASColorCode.EightBit.Type.Purple_2);
	/**
	 * Eightbit orange4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange4_2: Type = _fromCode(ASColorCode.EightBit.Type.Orange4_2);
	/**
	 * Eightbit lightPink4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightPink4: Type = _fromCode(ASColorCode.EightBit.Type.LightPink4);
	/**
	 * Eightbit plum4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum4: Type = _fromCode(ASColorCode.EightBit.Type.Plum4);
	/**
	 * Eightbit mediumPurple3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple3_1: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple3_1);
	/**
	 * Eightbit mediumPurple3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple3_2: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple3_2);
	/**
	 * Eightbit slateBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const slateBlue1: Type = _fromCode(ASColorCode.EightBit.Type.SlateBlue1);
	/**
	 * Eightbit yellow4_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow4_1: Type = _fromCode(ASColorCode.EightBit.Type.Yellow4_1);
	/**
	 * Eightbit wheat4 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const wheat4: Type = _fromCode(ASColorCode.EightBit.Type.Wheat4);
	/**
	 * Eightbit grey53 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey53: Type = _fromCode(ASColorCode.EightBit.Type.Grey53);
	/**
	 * Eightbit lightSlateGrey color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSlateGrey: Type = _fromCode(ASColorCode.EightBit.Type.LightSlateGrey);
	/**
	 * Eightbit mediumPurple color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple);
	/**
	 * Eightbit lightSlateBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSlateBlue: Type = _fromCode(ASColorCode.EightBit.Type.LightSlateBlue);
	/**
	 * Eightbit yellow4_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow4_2: Type = _fromCode(ASColorCode.EightBit.Type.Yellow4_2);
	/**
	 * Eightbit darkOliveGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen3_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen3_1);
	/**
	 * Eightbit darkSeaGreen color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen);
	/**
	 * Eightbit lightSkyBlue3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSkyBlue3_1: Type = _fromCode(ASColorCode.EightBit.Type.LightSkyBlue3_1);
	/**
	 * Eightbit lightSkyBlue3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSkyBlue3_2: Type = _fromCode(ASColorCode.EightBit.Type.LightSkyBlue3_2);
	/**
	 * Eightbit skyBlue2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const skyBlue2: Type = _fromCode(ASColorCode.EightBit.Type.SkyBlue2);
	/**
	 * Eightbit chartreuse2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse2_2: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse2_2);
	/**
	 * Eightbit darkOliveGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen3_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen3_2);
	/**
	 * Eightbit paleGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen3_2: Type = _fromCode(ASColorCode.EightBit.Type.PaleGreen3_2);
	/**
	 * Eightbit darkSeaGreen3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen3_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen3_1);
	/**
	 * Eightbit darkSlateGray3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSlateGray3: Type = _fromCode(ASColorCode.EightBit.Type.DarkSlateGray3);
	/**
	 * Eightbit skyBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const skyBlue1: Type = _fromCode(ASColorCode.EightBit.Type.SkyBlue1);
	/**
	 * Eightbit chartreuse1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const chartreuse1: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse1);
	/**
	 * Eightbit lightGreen_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGreen_1: Type = _fromCode(ASColorCode.EightBit.Type.LightGreen_1);
	/**
	 * Eightbit lightGreen_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGreen_2: Type = _fromCode(ASColorCode.EightBit.Type.LightGreen_2);
	/**
	 * Eightbit paleGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen1_1: Type = _fromCode(ASColorCode.EightBit.Type.PaleGreen1_1);
	/**
	 * Eightbit aquamarine1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const aquamarine1_2: Type = _fromCode(ASColorCode.EightBit.Type.Aquamarine1_2);
	/**
	 * Eightbit darkSlateGray1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSlateGray1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSlateGray1);
	/**
	 * Eightbit red3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red3_1: Type = _fromCode(ASColorCode.EightBit.Type.Red3_1);
	/**
	 * Eightbit deepPink4_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink4_3: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink4_3);
	/**
	 * Eightbit mediumVioletRed color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumVioletRed: Type = _fromCode(ASColorCode.EightBit.Type.MediumVioletRed);
	/**
	 * Eightbit magenta3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta3_1: Type = _fromCode(ASColorCode.EightBit.Type.Magenta3_1);
	/**
	 * Eightbit darkViolet_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkViolet_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkViolet_2);
	/**
	 * Eightbit purple_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const purple_3: Type = _fromCode(ASColorCode.EightBit.Type.Purple_3);
	/**
	 * Eightbit darkOrange3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOrange3_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkOrange3_1);
	/**
	 * Eightbit indianRed_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed_1: Type = _fromCode(ASColorCode.EightBit.Type.IndianRed_1);
	/**
	 * Eightbit hotPink3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink3_1: Type = _fromCode(ASColorCode.EightBit.Type.HotPink3_1);
	/**
	 * Eightbit mediumOrchid3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid3: Type = _fromCode(ASColorCode.EightBit.Type.MediumOrchid3);
	/**
	 * Eightbit mediumOrchid color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid: Type = _fromCode(ASColorCode.EightBit.Type.MediumOrchid);
	/**
	 * Eightbit mediumPurple2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple2_1: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple2_1);
	/**
	 * Eightbit darkGoldenrod color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkGoldenrod: Type = _fromCode(ASColorCode.EightBit.Type.DarkGoldenrod);
	/**
	 * Eightbit lightSalmon3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSalmon3_1: Type = _fromCode(ASColorCode.EightBit.Type.LightSalmon3_1);
	/**
	 * Eightbit rosyBrown color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const rosyBrown: Type = _fromCode(ASColorCode.EightBit.Type.RosyBrown);
	/**
	 * Eightbit grey63 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey63: Type = _fromCode(ASColorCode.EightBit.Type.Grey63);
	/**
	 * Eightbit mediumPurple2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple2_2: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple2_2);
	/**
	 * Eightbit mediumPurple1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumPurple1: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple1);
	/**
	 * Eightbit gold3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const gold3_1: Type = _fromCode(ASColorCode.EightBit.Type.Gold3_1);
	/**
	 * Eightbit darkKhaki color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkKhaki: Type = _fromCode(ASColorCode.EightBit.Type.DarkKhaki);
	/**
	 * Eightbit navajoWhite3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navajoWhite3: Type = _fromCode(ASColorCode.EightBit.Type.NavajoWhite3);
	/**
	 * Eightbit grey69 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey69: Type = _fromCode(ASColorCode.EightBit.Type.Grey69);
	/**
	 * Eightbit lightSteelBlue3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSteelBlue3: Type = _fromCode(ASColorCode.EightBit.Type.LightSteelBlue3);
	/**
	 * Eightbit lightSteelBlue color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSteelBlue: Type = _fromCode(ASColorCode.EightBit.Type.LightSteelBlue);
	/**
	 * Eightbit yellow3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow3_1: Type = _fromCode(ASColorCode.EightBit.Type.Yellow3_1);
	/**
	 * Eightbit darkOliveGreen3_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen3_3: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen3_3);
	/**
	 * Eightbit darkSeaGreen3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen3_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen3_2);
	/**
	 * Eightbit darkSeaGreen2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen2_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen2_1);
	/**
	 * Eightbit lightCyan3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightCyan3: Type = _fromCode(ASColorCode.EightBit.Type.LightCyan3);
	/**
	 * Eightbit lightSkyBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSkyBlue1: Type = _fromCode(ASColorCode.EightBit.Type.LightSkyBlue1);
	/**
	 * Eightbit greenYellow color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const greenYellow: Type = _fromCode(ASColorCode.EightBit.Type.GreenYellow);
	/**
	 * Eightbit darkOliveGreen2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen2: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen2);
	/**
	 * Eightbit paleGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleGreen1_2: Type = _fromCode(ASColorCode.EightBit.Type.PaleGreen1_2);
	/**
	 * Eightbit darkSeaGreen2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen2_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen2_2);
	/**
	 * Eightbit darkSeaGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen1_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen1_1);
	/**
	 * Eightbit paleTurquoise1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleTurquoise1: Type = _fromCode(ASColorCode.EightBit.Type.PaleTurquoise1);
	/**
	 * Eightbit red3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red3_2: Type = _fromCode(ASColorCode.EightBit.Type.Red3_2);
	/**
	 * Eightbit deepPink3_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink3_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink3_1);
	/**
	 * Eightbit deepPink3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink3_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink3_2);
	/**
	 * Eightbit magenta3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta3_2: Type = _fromCode(ASColorCode.EightBit.Type.Magenta3_2);
	/**
	 * Eightbit magenta3_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta3_3: Type = _fromCode(ASColorCode.EightBit.Type.Magenta3_3);
	/**
	 * Eightbit magenta2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta2_1: Type = _fromCode(ASColorCode.EightBit.Type.Magenta2_1);
	/**
	 * Eightbit darkOrange3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOrange3_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkOrange3_2);
	/**
	 * Eightbit indianRed_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed_2: Type = _fromCode(ASColorCode.EightBit.Type.IndianRed_2);
	/**
	 * Eightbit hotPink3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink3_2: Type = _fromCode(ASColorCode.EightBit.Type.HotPink3_2);
	/**
	 * Eightbit hotPink2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink2: Type = _fromCode(ASColorCode.EightBit.Type.HotPink2);
	/**
	 * Eightbit orchid color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orchid: Type = _fromCode(ASColorCode.EightBit.Type.Orchid);
	/**
	 * Eightbit mediumOrchid1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid1_1: Type = _fromCode(ASColorCode.EightBit.Type.MediumOrchid1_1);
	/**
	 * Eightbit orange3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange3: Type = _fromCode(ASColorCode.EightBit.Type.Orange3);
	/**
	 * Eightbit lightSalmon3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSalmon3_2: Type = _fromCode(ASColorCode.EightBit.Type.LightSalmon3_2);
	/**
	 * Eightbit lightPink3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightPink3: Type = _fromCode(ASColorCode.EightBit.Type.LightPink3);
	/**
	 * Eightbit pink3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const pink3: Type = _fromCode(ASColorCode.EightBit.Type.Pink3);
	/**
	 * Eightbit plum3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum3: Type = _fromCode(ASColorCode.EightBit.Type.Plum3);
	/**
	 * Eightbit violet color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const violet: Type = _fromCode(ASColorCode.EightBit.Type.Violet);
	/**
	 * Eightbit gold3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const gold3_2: Type = _fromCode(ASColorCode.EightBit.Type.Gold3_2);
	/**
	 * Eightbit lightGoldenrod3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod3: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod3);
	/**
	 * Eightbit tan color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const tan: Type = _fromCode(ASColorCode.EightBit.Type.Tan);
	/**
	 * Eightbit mistyRose3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mistyRose3: Type = _fromCode(ASColorCode.EightBit.Type.MistyRose3);
	/**
	 * Eightbit thistle3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const thistle3: Type = _fromCode(ASColorCode.EightBit.Type.Thistle3);
	/**
	 * Eightbit plum2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum2: Type = _fromCode(ASColorCode.EightBit.Type.Plum2);
	/**
	 * Eightbit yellow3_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow3_2: Type = _fromCode(ASColorCode.EightBit.Type.Yellow3_2);
	/**
	 * Eightbit khaki3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const khaki3: Type = _fromCode(ASColorCode.EightBit.Type.Khaki3);
	/**
	 * Eightbit lightGoldenrod2_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod2_1: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod2_1);
	/**
	 * Eightbit lightYellow3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightYellow3: Type = _fromCode(ASColorCode.EightBit.Type.LightYellow3);
	/**
	 * Eightbit grey84 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey84: Type = _fromCode(ASColorCode.EightBit.Type.Grey84);
	/**
	 * Eightbit lightSteelBlue1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSteelBlue1: Type = _fromCode(ASColorCode.EightBit.Type.LightSteelBlue1);
	/**
	 * Eightbit yellow2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow2: Type = _fromCode(ASColorCode.EightBit.Type.Yellow2);
	/**
	 * Eightbit darkOliveGreen1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen1_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen1_1);
	/**
	 * Eightbit darkOliveGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOliveGreen1_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen1_2);
	/**
	 * Eightbit darkSeaGreen1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkSeaGreen1_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen1_2);
	/**
	 * Eightbit honeydew2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const honeydew2: Type = _fromCode(ASColorCode.EightBit.Type.Honeydew2);
	/**
	 * Eightbit lightCyan1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightCyan1: Type = _fromCode(ASColorCode.EightBit.Type.LightCyan1);
	/**
	 * Eightbit red1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const red1: Type = _fromCode(ASColorCode.EightBit.Type.Red1);
	/**
	 * Eightbit deepPink2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink2: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink2);
	/**
	 * Eightbit deepPink1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink1_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink1_1);
	/**
	 * Eightbit deepPink1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const deepPink1_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink1_2);
	/**
	 * Eightbit magenta2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta2_2: Type = _fromCode(ASColorCode.EightBit.Type.Magenta2_2);
	/**
	 * Eightbit magenta1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const magenta1: Type = _fromCode(ASColorCode.EightBit.Type.Magenta1);
	/**
	 * Eightbit orangeRed1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orangeRed1: Type = _fromCode(ASColorCode.EightBit.Type.OrangeRed1);
	/**
	 * Eightbit indianRed1_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed1_1: Type = _fromCode(ASColorCode.EightBit.Type.IndianRed1_1);
	/**
	 * Eightbit indianRed1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const indianRed1_2: Type = _fromCode(ASColorCode.EightBit.Type.IndianRed1_2);
	/**
	 * Eightbit hotPink_1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink_1: Type = _fromCode(ASColorCode.EightBit.Type.HotPink_1);
	/**
	 * Eightbit hotPink_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const hotPink_2: Type = _fromCode(ASColorCode.EightBit.Type.HotPink_2);
	/**
	 * Eightbit mediumOrchid1_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mediumOrchid1_2: Type = _fromCode(ASColorCode.EightBit.Type.MediumOrchid1_2);
	/**
	 * Eightbit darkOrange color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const darkOrange: Type = _fromCode(ASColorCode.EightBit.Type.DarkOrange);
	/**
	 * Eightbit salmon1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const salmon1: Type = _fromCode(ASColorCode.EightBit.Type.Salmon1);
	/**
	 * Eightbit lightCoral color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightCoral: Type = _fromCode(ASColorCode.EightBit.Type.LightCoral);
	/**
	 * Eightbit paleVioletRed1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const paleVioletRed1: Type = _fromCode(ASColorCode.EightBit.Type.PaleVioletRed1);
	/**
	 * Eightbit orchid2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orchid2: Type = _fromCode(ASColorCode.EightBit.Type.Orchid2);
	/**
	 * Eightbit orchid1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orchid1: Type = _fromCode(ASColorCode.EightBit.Type.Orchid1);
	/**
	 * Eightbit orange1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const orange1: Type = _fromCode(ASColorCode.EightBit.Type.Orange1);
	/**
	 * Eightbit sandyBrown color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const sandyBrown: Type = _fromCode(ASColorCode.EightBit.Type.SandyBrown);
	/**
	 * Eightbit lightSalmon1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightSalmon1: Type = _fromCode(ASColorCode.EightBit.Type.LightSalmon1);
	/**
	 * Eightbit lightPink1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightPink1: Type = _fromCode(ASColorCode.EightBit.Type.LightPink1);
	/**
	 * Eightbit pink1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const pink1: Type = _fromCode(ASColorCode.EightBit.Type.Pink1);
	/**
	 * Eightbit plum1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const plum1: Type = _fromCode(ASColorCode.EightBit.Type.Plum1);
	/**
	 * Eightbit gold1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const gold1: Type = _fromCode(ASColorCode.EightBit.Type.Gold1);
	/**
	 * Eightbit lightGoldenrod2_2 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod2_2: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod2_2);
	/**
	 * Eightbit lightGoldenrod2_3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod2_3: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod2_3);
	/**
	 * Eightbit navajoWhite1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const navajoWhite1: Type = _fromCode(ASColorCode.EightBit.Type.NavajoWhite1);
	/**
	 * Eightbit mistyRose1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const mistyRose1: Type = _fromCode(ASColorCode.EightBit.Type.MistyRose1);
	/**
	 * Eightbit thistle1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const thistle1: Type = _fromCode(ASColorCode.EightBit.Type.Thistle1);
	/**
	 * Eightbit yellow1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const yellow1: Type = _fromCode(ASColorCode.EightBit.Type.Yellow1);
	/**
	 * Eightbit lightGoldenrod1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const lightGoldenrod1: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod1);
	/**
	 * Eightbit khaki1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const khaki1: Type = _fromCode(ASColorCode.EightBit.Type.Khaki1);
	/**
	 * Eightbit wheat1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const wheat1: Type = _fromCode(ASColorCode.EightBit.Type.Wheat1);
	/**
	 * Eightbit cornsilk1 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const cornsilk1: Type = _fromCode(ASColorCode.EightBit.Type.Cornsilk1);
	/**
	 * Eightbit grey100 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey100: Type = _fromCode(ASColorCode.EightBit.Type.Grey100);
	/**
	 * Eightbit grey3 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey3: Type = _fromCode(ASColorCode.EightBit.Type.Grey3);
	/**
	 * Eightbit grey7 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey7: Type = _fromCode(ASColorCode.EightBit.Type.Grey7);
	/**
	 * Eightbit grey11 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey11: Type = _fromCode(ASColorCode.EightBit.Type.Grey11);
	/**
	 * Eightbit grey15 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey15: Type = _fromCode(ASColorCode.EightBit.Type.Grey15);
	/**
	 * Eightbit grey19 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey19: Type = _fromCode(ASColorCode.EightBit.Type.Grey19);
	/**
	 * Eightbit grey23 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey23: Type = _fromCode(ASColorCode.EightBit.Type.Grey23);
	/**
	 * Eightbit grey27 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey27: Type = _fromCode(ASColorCode.EightBit.Type.Grey27);
	/**
	 * Eightbit grey30 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey30: Type = _fromCode(ASColorCode.EightBit.Type.Grey30);
	/**
	 * Eightbit grey35 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey35: Type = _fromCode(ASColorCode.EightBit.Type.Grey35);
	/**
	 * Eightbit grey39 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey39: Type = _fromCode(ASColorCode.EightBit.Type.Grey39);
	/**
	 * Eightbit grey42 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey42: Type = _fromCode(ASColorCode.EightBit.Type.Grey42);
	/**
	 * Eightbit grey46 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey46: Type = _fromCode(ASColorCode.EightBit.Type.Grey46);
	/**
	 * Eightbit grey50 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey50: Type = _fromCode(ASColorCode.EightBit.Type.Grey50);
	/**
	 * Eightbit grey54 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey54: Type = _fromCode(ASColorCode.EightBit.Type.Grey54);
	/**
	 * Eightbit grey58 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey58: Type = _fromCode(ASColorCode.EightBit.Type.Grey58);
	/**
	 * Eightbit grey62 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey62: Type = _fromCode(ASColorCode.EightBit.Type.Grey62);
	/**
	 * Eightbit grey66 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey66: Type = _fromCode(ASColorCode.EightBit.Type.Grey66);
	/**
	 * Eightbit grey70 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey70: Type = _fromCode(ASColorCode.EightBit.Type.Grey70);
	/**
	 * Eightbit grey74 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey74: Type = _fromCode(ASColorCode.EightBit.Type.Grey74);
	/**
	 * Eightbit grey78 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey78: Type = _fromCode(ASColorCode.EightBit.Type.Grey78);
	/**
	 * Eightbit grey82 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey82: Type = _fromCode(ASColorCode.EightBit.Type.Grey82);
	/**
	 * Eightbit grey85 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey85: Type = _fromCode(ASColorCode.EightBit.Type.Grey85);
	/**
	 * Eightbit grey89 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey89: Type = _fromCode(ASColorCode.EightBit.Type.Grey89);
	/**
	 * Eightbit grey93 color
	 *
	 * @since 0.0.1
	 * @category EightBit instances
	 */
	export const grey93: Type = _fromCode(ASColorCode.EightBit.Type.Grey93);
}
/**
 * Namespace for RGB colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Rgb {
	/** RGB foreground color Style instance maker */
	const _fromCode: MTypes.OneArgFunction<
		{
			readonly id: string;
			readonly redCode: number;
			readonly greenCode: number;
			readonly blueCode: number;
		},
		Type
	> = flow(ASStyleCharacteristic.RgbColor, _fromCharacteritic);

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
		_fromCode({
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
	export const maroon: Type = _fromCode({
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
	export const darkRed: Type = _fromCode({
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
	export const brown: Type = _fromCode({
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
	export const firebrick: Type = _fromCode({
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
	export const crimson: Type = _fromCode({
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
	export const red: Type = _fromCode({
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
	export const tomato: Type = _fromCode({
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
	export const coral: Type = _fromCode({
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
	export const indianRed: Type = _fromCode({
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
	export const lightCoral: Type = _fromCode({
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
	export const darkSalmon: Type = _fromCode({
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
	export const salmon: Type = _fromCode({
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
	export const lightSalmon: Type = _fromCode({
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
	export const orangeRed: Type = _fromCode({
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
	export const darkOrange: Type = _fromCode({
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
	export const orange: Type = _fromCode({
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
	export const gold: Type = _fromCode({
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
	export const darkGoldenRod: Type = _fromCode({
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
	export const goldenRod: Type = _fromCode({
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
	export const paleGoldenRod: Type = _fromCode({
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
	export const darkKhaki: Type = _fromCode({
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
	export const khaki: Type = _fromCode({
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
	export const olive: Type = _fromCode({
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
	export const yellow: Type = _fromCode({
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
	export const yellowGreen: Type = _fromCode({
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
	export const darkOliveGreen: Type = _fromCode({
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
	export const oliveDrab: Type = _fromCode({
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
	export const lawnGreen: Type = _fromCode({
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
	export const chartreuse: Type = _fromCode({
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
	export const greenYellow: Type = _fromCode({
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
	export const darkGreen: Type = _fromCode({
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
	export const green: Type = _fromCode({
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
	export const forestGreen: Type = _fromCode({
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
	export const lime: Type = _fromCode({
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
	export const limeGreen: Type = _fromCode({
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
	export const lightGreen: Type = _fromCode({
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
	export const paleGreen: Type = _fromCode({
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
	export const darkSeaGreen: Type = _fromCode({
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
	export const mediumSpringGreen: Type = _fromCode({
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
	export const springGreen: Type = _fromCode({
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
	export const seaGreen: Type = _fromCode({
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
	export const mediumAquaMarine: Type = _fromCode({
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
	export const mediumSeaGreen: Type = _fromCode({
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
	export const lightSeaGreen: Type = _fromCode({
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
	export const darkSlateGray: Type = _fromCode({
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
	export const teal: Type = _fromCode({
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
	export const darkCyan: Type = _fromCode({
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
	export const aqua: Type = _fromCode({
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
	export const cyan: Type = _fromCode({
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
	export const lightCyan: Type = _fromCode({
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
	export const darkTurquoise: Type = _fromCode({
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
	export const turquoise: Type = _fromCode({
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
	export const mediumTurquoise: Type = _fromCode({
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
	export const paleTurquoise: Type = _fromCode({
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
	export const aquaMarine: Type = _fromCode({
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
	export const powderBlue: Type = _fromCode({
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
	export const cadetBlue: Type = _fromCode({
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
	export const steelBlue: Type = _fromCode({
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
	export const cornFlowerBlue: Type = _fromCode({
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
	export const deepSkyBlue: Type = _fromCode({
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
	export const dodgerBlue: Type = _fromCode({
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
	export const lightBlue: Type = _fromCode({
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
	export const skyBlue: Type = _fromCode({
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
	export const lightSkyBlue: Type = _fromCode({
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
	export const midnightBlue: Type = _fromCode({
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
	export const navy: Type = _fromCode({
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
	export const darkBlue: Type = _fromCode({
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
	export const mediumBlue: Type = _fromCode({
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
	export const blue: Type = _fromCode({
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
	export const royalBlue: Type = _fromCode({
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
	export const blueViolet: Type = _fromCode({
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
	export const indigo: Type = _fromCode({
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
	export const darkSlateBlue: Type = _fromCode({
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
	export const slateBlue: Type = _fromCode({
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
	export const mediumSlateBlue: Type = _fromCode({
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
	export const mediumPurple: Type = _fromCode({
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
	export const darkMagenta: Type = _fromCode({
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
	export const darkViolet: Type = _fromCode({
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
	export const darkOrchid: Type = _fromCode({
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
	export const mediumOrchid2: Type = _fromCode({
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
	export const purple: Type = _fromCode({
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
	export const thistle: Type = _fromCode({
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
	export const plum: Type = _fromCode({
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
	export const violet: Type = _fromCode({
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
	export const magenta: Type = _fromCode({
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
	export const orchid: Type = _fromCode({
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
	export const mediumVioletRed: Type = _fromCode({
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
	export const paleVioletRed: Type = _fromCode({
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
	export const deepPink: Type = _fromCode({
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
	export const hotPink: Type = _fromCode({
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
	export const lightPink: Type = _fromCode({
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
	export const pink: Type = _fromCode({
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
	export const antiqueWhite: Type = _fromCode({
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
	export const beige: Type = _fromCode({
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
	export const bisque: Type = _fromCode({
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
	export const blanchedAlmond: Type = _fromCode({
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
	export const wheat: Type = _fromCode({
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
	export const cornSilk: Type = _fromCode({
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
	export const lemonChiffon: Type = _fromCode({
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
	export const lightGoldenRodYellow: Type = _fromCode({
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
	export const lightYellow: Type = _fromCode({
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
	export const saddleBrown: Type = _fromCode({
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
	export const sienna: Type = _fromCode({
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
	export const chocolate: Type = _fromCode({
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
	export const peru: Type = _fromCode({
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
	export const sandyBrown: Type = _fromCode({
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
	export const burlyWood: Type = _fromCode({
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
	export const tan: Type = _fromCode({
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
	export const rosyBrown: Type = _fromCode({
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
	export const moccasin: Type = _fromCode({
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
	export const navajoWhite: Type = _fromCode({
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
	export const peachPuff: Type = _fromCode({
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
	export const mistyRose: Type = _fromCode({
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
	export const lavenderBlush: Type = _fromCode({
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
	export const linen: Type = _fromCode({
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
	export const oldLace: Type = _fromCode({
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
	export const papayaWhip: Type = _fromCode({
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
	export const seaShell: Type = _fromCode({
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
	export const mintCream: Type = _fromCode({
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
	export const slateGray: Type = _fromCode({
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
	export const lightSlateGray: Type = _fromCode({
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
	export const lightSteelBlue: Type = _fromCode({
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
	export const lavender: Type = _fromCode({
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
	export const floralWhite: Type = _fromCode({
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
	export const aliceBlue: Type = _fromCode({
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
	export const ghostWhite: Type = _fromCode({
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
	export const honeydew: Type = _fromCode({
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
	export const ivory: Type = _fromCode({
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
	export const azure: Type = _fromCode({
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
	export const snow: Type = _fromCode({
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
	export const black: Type = _fromCode({
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
	export const dimGray: Type = _fromCode({
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
	export const gray: Type = _fromCode({
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
	export const darkGray: Type = _fromCode({
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
	export const silver: Type = _fromCode({
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
	export const lightGray: Type = _fromCode({
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
	export const gainsboro: Type = _fromCode({
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
	export const whiteSmoke: Type = _fromCode({
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
	export const white: Type = _fromCode({
		id: 'White',
		redCode: 255,
		greenCode: 255,
		blueCode: 255
	});
}

/**
 * Namespace for original colors used as background colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Bg {
	/**
	 * Default background color Style instance
	 *
	 * @since 0.0.1
	 * @category Instances
	 */
	export const defaultColor: Type = _fromCharacteritic(ASStyleCharacteristic.Bg.defaultColor);

	/** Standard background color Style instance maker */
	const _fromCode: MTypes.OneArgFunction<ASColorCode.ThreeBit.Type, Type> = flow(
		ASColorCode.ThreeBit.withId,
		ASStyleCharacteristic.Bg.standardColor,
		_fromCharacteritic
	);

	/**
	 * Original black color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const black: Type = _fromCode(ASColorCode.ThreeBit.Type.Black);

	/**
	 * Original red color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const red: Type = _fromCode(ASColorCode.ThreeBit.Type.Red);

	/**
	 * Original green color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const green: Type = _fromCode(ASColorCode.ThreeBit.Type.Green);

	/**
	 * Original yellow color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const yellow: Type = _fromCode(ASColorCode.ThreeBit.Type.Yellow);

	/**
	 * Original blue color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const blue: Type = _fromCode(ASColorCode.ThreeBit.Type.Blue);

	/**
	 * Original magenta color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const magenta: Type = _fromCode(ASColorCode.ThreeBit.Type.Magenta);

	/**
	 * Original cyan color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const cyan: Type = _fromCode(ASColorCode.ThreeBit.Type.Cyan);

	/**
	 * Original white color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const white: Type = _fromCode(ASColorCode.ThreeBit.Type.White);

	/**
	 * Namespace for bright original colors used as background colors
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace Bright {
		/** Bright background color Style instance maker */
		const _fromCode: MTypes.OneArgFunction<ASColorCode.ThreeBit.Type, Type> = flow(
			ASColorCode.ThreeBit.withId,
			ASStyleCharacteristic.Bg.brightColor,
			_fromCharacteritic
		);

		/**
		 * Original bright black color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const black: Type = _fromCode(ASColorCode.ThreeBit.Type.Black);

		/**
		 * Original bright red color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const red: Type = _fromCode(ASColorCode.ThreeBit.Type.Red);

		/**
		 * Original bright green color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const green: Type = _fromCode(ASColorCode.ThreeBit.Type.Green);

		/**
		 * Original bright yellow color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const yellow: Type = _fromCode(ASColorCode.ThreeBit.Type.Yellow);

		/**
		 * Original bright blue color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const blue: Type = _fromCode(ASColorCode.ThreeBit.Type.Blue);

		/**
		 * Original bright magenta color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const magenta: Type = _fromCode(ASColorCode.ThreeBit.Type.Magenta);

		/**
		 * Original bright cyan color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const cyan: Type = _fromCode(ASColorCode.ThreeBit.Type.Cyan);

		/**
		 * Original bright white color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const white: Type = _fromCode(ASColorCode.ThreeBit.Type.White);
	}

	/**
	 * Namespace for eight-bit colors used as background color
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace EightBit {
		/** EightBit background color Style instance maker */
		const _fromCode: MTypes.OneArgFunction<ASColorCode.EightBit.Type, Type> = flow(
			ASColorCode.EightBit.withId,
			ASStyleCharacteristic.Bg.eightBitColor,
			_fromCharacteritic
		);

		/**
		 * Eightbit black color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const black: Type = _fromCode(ASColorCode.EightBit.Type.Black);
		/**
		 * Eightbit maroon color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const maroon: Type = _fromCode(ASColorCode.EightBit.Type.Maroon);
		/**
		 * Eightbit green color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green: Type = _fromCode(ASColorCode.EightBit.Type.Green);
		/**
		 * Eightbit olive color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const olive: Type = _fromCode(ASColorCode.EightBit.Type.Olive);
		/**
		 * Eightbit navy color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navy: Type = _fromCode(ASColorCode.EightBit.Type.Navy);
		/**
		 * Eightbit purple_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple_1: Type = _fromCode(ASColorCode.EightBit.Type.Purple_1);
		/**
		 * Eightbit teal color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const teal: Type = _fromCode(ASColorCode.EightBit.Type.Teal);
		/**
		 * Eightbit silver color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const silver: Type = _fromCode(ASColorCode.EightBit.Type.Silver);
		/**
		 * Eightbit grey color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey: Type = _fromCode(ASColorCode.EightBit.Type.Grey);
		/**
		 * Eightbit red color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red: Type = _fromCode(ASColorCode.EightBit.Type.Red);
		/**
		 * Eightbit lime color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lime: Type = _fromCode(ASColorCode.EightBit.Type.Lime);
		/**
		 * Eightbit yellow color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow: Type = _fromCode(ASColorCode.EightBit.Type.Yellow);
		/**
		 * Eightbit blue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue: Type = _fromCode(ASColorCode.EightBit.Type.Blue);
		/**
		 * Eightbit fuchsia color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const fuchsia: Type = _fromCode(ASColorCode.EightBit.Type.Fuchsia);
		/**
		 * Eightbit aqua color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aqua: Type = _fromCode(ASColorCode.EightBit.Type.Aqua);
		/**
		 * Eightbit white color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const white: Type = _fromCode(ASColorCode.EightBit.Type.White);
		/**
		 * Eightbit grey0 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey0: Type = _fromCode(ASColorCode.EightBit.Type.Grey0);
		/**
		 * Eightbit navyBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navyBlue: Type = _fromCode(ASColorCode.EightBit.Type.NavyBlue);
		/**
		 * Eightbit darkBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkBlue: Type = _fromCode(ASColorCode.EightBit.Type.DarkBlue);
		/**
		 * Eightbit blue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue3_1: Type = _fromCode(ASColorCode.EightBit.Type.Blue3_1);
		/**
		 * Eightbit blue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue3_2: Type = _fromCode(ASColorCode.EightBit.Type.Blue3_2);
		/**
		 * Eightbit blue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blue1: Type = _fromCode(ASColorCode.EightBit.Type.Blue1);
		/**
		 * Eightbit darkGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkGreen: Type = _fromCode(ASColorCode.EightBit.Type.DarkGreen);
		/**
		 * Eightbit deepSkyBlue4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue4_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue4_1);
		/**
		 * Eightbit deepSkyBlue4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue4_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue4_2);
		/**
		 * Eightbit deepSkyBlue4_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue4_3: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue4_3);
		/**
		 * Eightbit dodgerBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const dodgerBlue3: Type = _fromCode(ASColorCode.EightBit.Type.DodgerBlue3);
		/**
		 * Eightbit dodgerBlue2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const dodgerBlue2: Type = _fromCode(ASColorCode.EightBit.Type.DodgerBlue2);
		/**
		 * Eightbit green4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green4: Type = _fromCode(ASColorCode.EightBit.Type.Green4);
		/**
		 * Eightbit springGreen4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen4: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen4);
		/**
		 * Eightbit turquoise4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const turquoise4: Type = _fromCode(ASColorCode.EightBit.Type.Turquoise4);
		/**
		 * Eightbit deepSkyBlue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue3_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue3_1);
		/**
		 * Eightbit deepSkyBlue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue3_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue3_2);
		/**
		 * Eightbit dodgerBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const dodgerBlue1: Type = _fromCode(ASColorCode.EightBit.Type.DodgerBlue1);
		/**
		 * Eightbit green3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green3_1: Type = _fromCode(ASColorCode.EightBit.Type.Green3_1);
		/**
		 * Eightbit springGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen3_1: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen3_1);
		/**
		 * Eightbit darkCyan color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkCyan: Type = _fromCode(ASColorCode.EightBit.Type.DarkCyan);
		/**
		 * Eightbit lightSeaGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSeaGreen: Type = _fromCode(ASColorCode.EightBit.Type.LightSeaGreen);
		/**
		 * Eightbit deepSkyBlue2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue2: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue2);
		/**
		 * Eightbit deepSkyBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepSkyBlue1: Type = _fromCode(ASColorCode.EightBit.Type.DeepSkyBlue1);
		/**
		 * Eightbit green3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green3_2: Type = _fromCode(ASColorCode.EightBit.Type.Green3_2);
		/**
		 * Eightbit springGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen3_2: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen3_2);
		/**
		 * Eightbit springGreen2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen2_1: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen2_1);
		/**
		 * Eightbit cyan3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cyan3: Type = _fromCode(ASColorCode.EightBit.Type.Cyan3);
		/**
		 * Eightbit darkTurquoise color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkTurquoise: Type = _fromCode(ASColorCode.EightBit.Type.DarkTurquoise);
		/**
		 * Eightbit turquoise2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const turquoise2: Type = _fromCode(ASColorCode.EightBit.Type.Turquoise2);
		/**
		 * Eightbit green1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const green1: Type = _fromCode(ASColorCode.EightBit.Type.Green1);
		/**
		 * Eightbit springGreen2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen2_2: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen2_2);
		/**
		 * Eightbit springGreen1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const springGreen1: Type = _fromCode(ASColorCode.EightBit.Type.SpringGreen1);
		/**
		 * Eightbit mediumSpringGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumSpringGreen: Type = _fromCode(ASColorCode.EightBit.Type.MediumSpringGreen);
		/**
		 * Eightbit cyan2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cyan2: Type = _fromCode(ASColorCode.EightBit.Type.Cyan2);
		/**
		 * Eightbit cyan1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cyan1: Type = _fromCode(ASColorCode.EightBit.Type.Cyan1);
		/**
		 * Eightbit darkRed_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkRed_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkRed_1);
		/**
		 * Eightbit deepPink4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink4_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink4_1);
		/**
		 * Eightbit purple4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple4_1: Type = _fromCode(ASColorCode.EightBit.Type.Purple4_1);
		/**
		 * Eightbit purple4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple4_2: Type = _fromCode(ASColorCode.EightBit.Type.Purple4_2);
		/**
		 * Eightbit purple3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple3: Type = _fromCode(ASColorCode.EightBit.Type.Purple3);
		/**
		 * Eightbit blueViolet color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const blueViolet: Type = _fromCode(ASColorCode.EightBit.Type.BlueViolet);
		/**
		 * Eightbit orange4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange4_1: Type = _fromCode(ASColorCode.EightBit.Type.Orange4_1);
		/**
		 * Eightbit grey37 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey37: Type = _fromCode(ASColorCode.EightBit.Type.Grey37);
		/**
		 * Eightbit mediumPurple4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple4: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple4);
		/**
		 * Eightbit slateBlue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const slateBlue3_1: Type = _fromCode(ASColorCode.EightBit.Type.SlateBlue3_1);
		/**
		 * Eightbit slateBlue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const slateBlue3_2: Type = _fromCode(ASColorCode.EightBit.Type.SlateBlue3_2);
		/**
		 * Eightbit royalBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const royalBlue1: Type = _fromCode(ASColorCode.EightBit.Type.RoyalBlue1);
		/**
		 * Eightbit chartreuse4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse4: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse4);
		/**
		 * Eightbit darkSeaGreen4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen4_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen4_1);
		/**
		 * Eightbit paleTurquoise4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleTurquoise4: Type = _fromCode(ASColorCode.EightBit.Type.PaleTurquoise4);
		/**
		 * Eightbit steelBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue: Type = _fromCode(ASColorCode.EightBit.Type.SteelBlue);
		/**
		 * Eightbit steelBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue3: Type = _fromCode(ASColorCode.EightBit.Type.SteelBlue3);
		/**
		 * Eightbit cornflowerBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cornflowerBlue: Type = _fromCode(ASColorCode.EightBit.Type.CornflowerBlue);
		/**
		 * Eightbit chartreuse3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse3_1: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse3_1);
		/**
		 * Eightbit darkSeaGreen4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen4_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen4_2);
		/**
		 * Eightbit cadetBlue_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cadetBlue_1: Type = _fromCode(ASColorCode.EightBit.Type.CadetBlue_1);
		/**
		 * Eightbit cadetBlue_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cadetBlue_2: Type = _fromCode(ASColorCode.EightBit.Type.CadetBlue_2);
		/**
		 * Eightbit skyBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const skyBlue3: Type = _fromCode(ASColorCode.EightBit.Type.SkyBlue3);
		/**
		 * Eightbit steelBlue1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue1_1: Type = _fromCode(ASColorCode.EightBit.Type.SteelBlue1_1);
		/**
		 * Eightbit chartreuse3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse3_2: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse3_2);
		/**
		 * Eightbit paleGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen3_1: Type = _fromCode(ASColorCode.EightBit.Type.PaleGreen3_1);
		/**
		 * Eightbit seaGreen3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen3: Type = _fromCode(ASColorCode.EightBit.Type.SeaGreen3);
		/**
		 * Eightbit aquamarine3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aquamarine3: Type = _fromCode(ASColorCode.EightBit.Type.Aquamarine3);
		/**
		 * Eightbit mediumTurquoise color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumTurquoise: Type = _fromCode(ASColorCode.EightBit.Type.MediumTurquoise);
		/**
		 * Eightbit steelBlue1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const steelBlue1_2: Type = _fromCode(ASColorCode.EightBit.Type.SteelBlue1_2);
		/**
		 * Eightbit chartreuse2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse2_1: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse2_1);
		/**
		 * Eightbit seaGreen2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen2: Type = _fromCode(ASColorCode.EightBit.Type.SeaGreen2);
		/**
		 * Eightbit seaGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen1_1: Type = _fromCode(ASColorCode.EightBit.Type.SeaGreen1_1);
		/**
		 * Eightbit seaGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const seaGreen1_2: Type = _fromCode(ASColorCode.EightBit.Type.SeaGreen1_2);
		/**
		 * Eightbit aquamarine1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aquamarine1_1: Type = _fromCode(ASColorCode.EightBit.Type.Aquamarine1_1);
		/**
		 * Eightbit darkSlateGray2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSlateGray2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSlateGray2);
		/**
		 * Eightbit darkRed_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkRed_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkRed_2);
		/**
		 * Eightbit deepPink4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink4_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink4_2);
		/**
		 * Eightbit darkMagenta_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkMagenta_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkMagenta_1);
		/**
		 * Eightbit darkMagenta_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkMagenta_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkMagenta_2);
		/**
		 * Eightbit darkViolet_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkViolet_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkViolet_1);
		/**
		 * Eightbit purple_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple_2: Type = _fromCode(ASColorCode.EightBit.Type.Purple_2);
		/**
		 * Eightbit orange4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange4_2: Type = _fromCode(ASColorCode.EightBit.Type.Orange4_2);
		/**
		 * Eightbit lightPink4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightPink4: Type = _fromCode(ASColorCode.EightBit.Type.LightPink4);
		/**
		 * Eightbit plum4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum4: Type = _fromCode(ASColorCode.EightBit.Type.Plum4);
		/**
		 * Eightbit mediumPurple3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple3_1: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple3_1);
		/**
		 * Eightbit mediumPurple3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple3_2: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple3_2);
		/**
		 * Eightbit slateBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const slateBlue1: Type = _fromCode(ASColorCode.EightBit.Type.SlateBlue1);
		/**
		 * Eightbit yellow4_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow4_1: Type = _fromCode(ASColorCode.EightBit.Type.Yellow4_1);
		/**
		 * Eightbit wheat4 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const wheat4: Type = _fromCode(ASColorCode.EightBit.Type.Wheat4);
		/**
		 * Eightbit grey53 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey53: Type = _fromCode(ASColorCode.EightBit.Type.Grey53);
		/**
		 * Eightbit lightSlateGrey color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSlateGrey: Type = _fromCode(ASColorCode.EightBit.Type.LightSlateGrey);
		/**
		 * Eightbit mediumPurple color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple);
		/**
		 * Eightbit lightSlateBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSlateBlue: Type = _fromCode(ASColorCode.EightBit.Type.LightSlateBlue);
		/**
		 * Eightbit yellow4_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow4_2: Type = _fromCode(ASColorCode.EightBit.Type.Yellow4_2);
		/**
		 * Eightbit darkOliveGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen3_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen3_1);
		/**
		 * Eightbit darkSeaGreen color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen);
		/**
		 * Eightbit lightSkyBlue3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSkyBlue3_1: Type = _fromCode(ASColorCode.EightBit.Type.LightSkyBlue3_1);
		/**
		 * Eightbit lightSkyBlue3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSkyBlue3_2: Type = _fromCode(ASColorCode.EightBit.Type.LightSkyBlue3_2);
		/**
		 * Eightbit skyBlue2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const skyBlue2: Type = _fromCode(ASColorCode.EightBit.Type.SkyBlue2);
		/**
		 * Eightbit chartreuse2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse2_2: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse2_2);
		/**
		 * Eightbit darkOliveGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen3_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen3_2);
		/**
		 * Eightbit paleGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen3_2: Type = _fromCode(ASColorCode.EightBit.Type.PaleGreen3_2);
		/**
		 * Eightbit darkSeaGreen3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen3_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen3_1);
		/**
		 * Eightbit darkSlateGray3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSlateGray3: Type = _fromCode(ASColorCode.EightBit.Type.DarkSlateGray3);
		/**
		 * Eightbit skyBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const skyBlue1: Type = _fromCode(ASColorCode.EightBit.Type.SkyBlue1);
		/**
		 * Eightbit chartreuse1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const chartreuse1: Type = _fromCode(ASColorCode.EightBit.Type.Chartreuse1);
		/**
		 * Eightbit lightGreen_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGreen_1: Type = _fromCode(ASColorCode.EightBit.Type.LightGreen_1);
		/**
		 * Eightbit lightGreen_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGreen_2: Type = _fromCode(ASColorCode.EightBit.Type.LightGreen_2);
		/**
		 * Eightbit paleGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen1_1: Type = _fromCode(ASColorCode.EightBit.Type.PaleGreen1_1);
		/**
		 * Eightbit aquamarine1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const aquamarine1_2: Type = _fromCode(ASColorCode.EightBit.Type.Aquamarine1_2);
		/**
		 * Eightbit darkSlateGray1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSlateGray1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSlateGray1);
		/**
		 * Eightbit red3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red3_1: Type = _fromCode(ASColorCode.EightBit.Type.Red3_1);
		/**
		 * Eightbit deepPink4_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink4_3: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink4_3);
		/**
		 * Eightbit mediumVioletRed color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumVioletRed: Type = _fromCode(ASColorCode.EightBit.Type.MediumVioletRed);
		/**
		 * Eightbit magenta3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta3_1: Type = _fromCode(ASColorCode.EightBit.Type.Magenta3_1);
		/**
		 * Eightbit darkViolet_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkViolet_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkViolet_2);
		/**
		 * Eightbit purple_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const purple_3: Type = _fromCode(ASColorCode.EightBit.Type.Purple_3);
		/**
		 * Eightbit darkOrange3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOrange3_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkOrange3_1);
		/**
		 * Eightbit indianRed_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed_1: Type = _fromCode(ASColorCode.EightBit.Type.IndianRed_1);
		/**
		 * Eightbit hotPink3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink3_1: Type = _fromCode(ASColorCode.EightBit.Type.HotPink3_1);
		/**
		 * Eightbit mediumOrchid3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid3: Type = _fromCode(ASColorCode.EightBit.Type.MediumOrchid3);
		/**
		 * Eightbit mediumOrchid color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid: Type = _fromCode(ASColorCode.EightBit.Type.MediumOrchid);
		/**
		 * Eightbit mediumPurple2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple2_1: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple2_1);
		/**
		 * Eightbit darkGoldenrod color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkGoldenrod: Type = _fromCode(ASColorCode.EightBit.Type.DarkGoldenrod);
		/**
		 * Eightbit lightSalmon3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSalmon3_1: Type = _fromCode(ASColorCode.EightBit.Type.LightSalmon3_1);
		/**
		 * Eightbit rosyBrown color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const rosyBrown: Type = _fromCode(ASColorCode.EightBit.Type.RosyBrown);
		/**
		 * Eightbit grey63 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey63: Type = _fromCode(ASColorCode.EightBit.Type.Grey63);
		/**
		 * Eightbit mediumPurple2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple2_2: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple2_2);
		/**
		 * Eightbit mediumPurple1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumPurple1: Type = _fromCode(ASColorCode.EightBit.Type.MediumPurple1);
		/**
		 * Eightbit gold3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const gold3_1: Type = _fromCode(ASColorCode.EightBit.Type.Gold3_1);
		/**
		 * Eightbit darkKhaki color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkKhaki: Type = _fromCode(ASColorCode.EightBit.Type.DarkKhaki);
		/**
		 * Eightbit navajoWhite3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navajoWhite3: Type = _fromCode(ASColorCode.EightBit.Type.NavajoWhite3);
		/**
		 * Eightbit grey69 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey69: Type = _fromCode(ASColorCode.EightBit.Type.Grey69);
		/**
		 * Eightbit lightSteelBlue3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSteelBlue3: Type = _fromCode(ASColorCode.EightBit.Type.LightSteelBlue3);
		/**
		 * Eightbit lightSteelBlue color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSteelBlue: Type = _fromCode(ASColorCode.EightBit.Type.LightSteelBlue);
		/**
		 * Eightbit yellow3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow3_1: Type = _fromCode(ASColorCode.EightBit.Type.Yellow3_1);
		/**
		 * Eightbit darkOliveGreen3_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen3_3: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen3_3);
		/**
		 * Eightbit darkSeaGreen3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen3_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen3_2);
		/**
		 * Eightbit darkSeaGreen2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen2_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen2_1);
		/**
		 * Eightbit lightCyan3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightCyan3: Type = _fromCode(ASColorCode.EightBit.Type.LightCyan3);
		/**
		 * Eightbit lightSkyBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSkyBlue1: Type = _fromCode(ASColorCode.EightBit.Type.LightSkyBlue1);
		/**
		 * Eightbit greenYellow color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const greenYellow: Type = _fromCode(ASColorCode.EightBit.Type.GreenYellow);
		/**
		 * Eightbit darkOliveGreen2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen2: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen2);
		/**
		 * Eightbit paleGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleGreen1_2: Type = _fromCode(ASColorCode.EightBit.Type.PaleGreen1_2);
		/**
		 * Eightbit darkSeaGreen2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen2_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen2_2);
		/**
		 * Eightbit darkSeaGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen1_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen1_1);
		/**
		 * Eightbit paleTurquoise1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleTurquoise1: Type = _fromCode(ASColorCode.EightBit.Type.PaleTurquoise1);
		/**
		 * Eightbit red3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red3_2: Type = _fromCode(ASColorCode.EightBit.Type.Red3_2);
		/**
		 * Eightbit deepPink3_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink3_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink3_1);
		/**
		 * Eightbit deepPink3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink3_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink3_2);
		/**
		 * Eightbit magenta3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta3_2: Type = _fromCode(ASColorCode.EightBit.Type.Magenta3_2);
		/**
		 * Eightbit magenta3_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta3_3: Type = _fromCode(ASColorCode.EightBit.Type.Magenta3_3);
		/**
		 * Eightbit magenta2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta2_1: Type = _fromCode(ASColorCode.EightBit.Type.Magenta2_1);
		/**
		 * Eightbit darkOrange3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOrange3_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkOrange3_2);
		/**
		 * Eightbit indianRed_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed_2: Type = _fromCode(ASColorCode.EightBit.Type.IndianRed_2);
		/**
		 * Eightbit hotPink3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink3_2: Type = _fromCode(ASColorCode.EightBit.Type.HotPink3_2);
		/**
		 * Eightbit hotPink2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink2: Type = _fromCode(ASColorCode.EightBit.Type.HotPink2);
		/**
		 * Eightbit orchid color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orchid: Type = _fromCode(ASColorCode.EightBit.Type.Orchid);
		/**
		 * Eightbit mediumOrchid1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid1_1: Type = _fromCode(ASColorCode.EightBit.Type.MediumOrchid1_1);
		/**
		 * Eightbit orange3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange3: Type = _fromCode(ASColorCode.EightBit.Type.Orange3);
		/**
		 * Eightbit lightSalmon3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSalmon3_2: Type = _fromCode(ASColorCode.EightBit.Type.LightSalmon3_2);
		/**
		 * Eightbit lightPink3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightPink3: Type = _fromCode(ASColorCode.EightBit.Type.LightPink3);
		/**
		 * Eightbit pink3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const pink3: Type = _fromCode(ASColorCode.EightBit.Type.Pink3);
		/**
		 * Eightbit plum3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum3: Type = _fromCode(ASColorCode.EightBit.Type.Plum3);
		/**
		 * Eightbit violet color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const violet: Type = _fromCode(ASColorCode.EightBit.Type.Violet);
		/**
		 * Eightbit gold3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const gold3_2: Type = _fromCode(ASColorCode.EightBit.Type.Gold3_2);
		/**
		 * Eightbit lightGoldenrod3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod3: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod3);
		/**
		 * Eightbit tan color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const tan: Type = _fromCode(ASColorCode.EightBit.Type.Tan);
		/**
		 * Eightbit mistyRose3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mistyRose3: Type = _fromCode(ASColorCode.EightBit.Type.MistyRose3);
		/**
		 * Eightbit thistle3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const thistle3: Type = _fromCode(ASColorCode.EightBit.Type.Thistle3);
		/**
		 * Eightbit plum2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum2: Type = _fromCode(ASColorCode.EightBit.Type.Plum2);
		/**
		 * Eightbit yellow3_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow3_2: Type = _fromCode(ASColorCode.EightBit.Type.Yellow3_2);
		/**
		 * Eightbit khaki3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const khaki3: Type = _fromCode(ASColorCode.EightBit.Type.Khaki3);
		/**
		 * Eightbit lightGoldenrod2_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod2_1: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod2_1);
		/**
		 * Eightbit lightYellow3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightYellow3: Type = _fromCode(ASColorCode.EightBit.Type.LightYellow3);
		/**
		 * Eightbit grey84 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey84: Type = _fromCode(ASColorCode.EightBit.Type.Grey84);
		/**
		 * Eightbit lightSteelBlue1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSteelBlue1: Type = _fromCode(ASColorCode.EightBit.Type.LightSteelBlue1);
		/**
		 * Eightbit yellow2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow2: Type = _fromCode(ASColorCode.EightBit.Type.Yellow2);
		/**
		 * Eightbit darkOliveGreen1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen1_1: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen1_1);
		/**
		 * Eightbit darkOliveGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOliveGreen1_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkOliveGreen1_2);
		/**
		 * Eightbit darkSeaGreen1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkSeaGreen1_2: Type = _fromCode(ASColorCode.EightBit.Type.DarkSeaGreen1_2);
		/**
		 * Eightbit honeydew2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const honeydew2: Type = _fromCode(ASColorCode.EightBit.Type.Honeydew2);
		/**
		 * Eightbit lightCyan1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightCyan1: Type = _fromCode(ASColorCode.EightBit.Type.LightCyan1);
		/**
		 * Eightbit red1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const red1: Type = _fromCode(ASColorCode.EightBit.Type.Red1);
		/**
		 * Eightbit deepPink2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink2: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink2);
		/**
		 * Eightbit deepPink1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink1_1: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink1_1);
		/**
		 * Eightbit deepPink1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const deepPink1_2: Type = _fromCode(ASColorCode.EightBit.Type.DeepPink1_2);
		/**
		 * Eightbit magenta2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta2_2: Type = _fromCode(ASColorCode.EightBit.Type.Magenta2_2);
		/**
		 * Eightbit magenta1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const magenta1: Type = _fromCode(ASColorCode.EightBit.Type.Magenta1);
		/**
		 * Eightbit orangeRed1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orangeRed1: Type = _fromCode(ASColorCode.EightBit.Type.OrangeRed1);
		/**
		 * Eightbit indianRed1_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed1_1: Type = _fromCode(ASColorCode.EightBit.Type.IndianRed1_1);
		/**
		 * Eightbit indianRed1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const indianRed1_2: Type = _fromCode(ASColorCode.EightBit.Type.IndianRed1_2);
		/**
		 * Eightbit hotPink_1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink_1: Type = _fromCode(ASColorCode.EightBit.Type.HotPink_1);
		/**
		 * Eightbit hotPink_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const hotPink_2: Type = _fromCode(ASColorCode.EightBit.Type.HotPink_2);
		/**
		 * Eightbit mediumOrchid1_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mediumOrchid1_2: Type = _fromCode(ASColorCode.EightBit.Type.MediumOrchid1_2);
		/**
		 * Eightbit darkOrange color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const darkOrange: Type = _fromCode(ASColorCode.EightBit.Type.DarkOrange);
		/**
		 * Eightbit salmon1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const salmon1: Type = _fromCode(ASColorCode.EightBit.Type.Salmon1);
		/**
		 * Eightbit lightCoral color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightCoral: Type = _fromCode(ASColorCode.EightBit.Type.LightCoral);
		/**
		 * Eightbit paleVioletRed1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const paleVioletRed1: Type = _fromCode(ASColorCode.EightBit.Type.PaleVioletRed1);
		/**
		 * Eightbit orchid2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orchid2: Type = _fromCode(ASColorCode.EightBit.Type.Orchid2);
		/**
		 * Eightbit orchid1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orchid1: Type = _fromCode(ASColorCode.EightBit.Type.Orchid1);
		/**
		 * Eightbit orange1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const orange1: Type = _fromCode(ASColorCode.EightBit.Type.Orange1);
		/**
		 * Eightbit sandyBrown color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const sandyBrown: Type = _fromCode(ASColorCode.EightBit.Type.SandyBrown);
		/**
		 * Eightbit lightSalmon1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightSalmon1: Type = _fromCode(ASColorCode.EightBit.Type.LightSalmon1);
		/**
		 * Eightbit lightPink1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightPink1: Type = _fromCode(ASColorCode.EightBit.Type.LightPink1);
		/**
		 * Eightbit pink1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const pink1: Type = _fromCode(ASColorCode.EightBit.Type.Pink1);
		/**
		 * Eightbit plum1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const plum1: Type = _fromCode(ASColorCode.EightBit.Type.Plum1);
		/**
		 * Eightbit gold1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const gold1: Type = _fromCode(ASColorCode.EightBit.Type.Gold1);
		/**
		 * Eightbit lightGoldenrod2_2 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod2_2: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod2_2);
		/**
		 * Eightbit lightGoldenrod2_3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod2_3: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod2_3);
		/**
		 * Eightbit navajoWhite1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const navajoWhite1: Type = _fromCode(ASColorCode.EightBit.Type.NavajoWhite1);
		/**
		 * Eightbit mistyRose1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const mistyRose1: Type = _fromCode(ASColorCode.EightBit.Type.MistyRose1);
		/**
		 * Eightbit thistle1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const thistle1: Type = _fromCode(ASColorCode.EightBit.Type.Thistle1);
		/**
		 * Eightbit yellow1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const yellow1: Type = _fromCode(ASColorCode.EightBit.Type.Yellow1);
		/**
		 * Eightbit lightGoldenrod1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const lightGoldenrod1: Type = _fromCode(ASColorCode.EightBit.Type.LightGoldenrod1);
		/**
		 * Eightbit khaki1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const khaki1: Type = _fromCode(ASColorCode.EightBit.Type.Khaki1);
		/**
		 * Eightbit wheat1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const wheat1: Type = _fromCode(ASColorCode.EightBit.Type.Wheat1);
		/**
		 * Eightbit cornsilk1 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const cornsilk1: Type = _fromCode(ASColorCode.EightBit.Type.Cornsilk1);
		/**
		 * Eightbit grey100 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey100: Type = _fromCode(ASColorCode.EightBit.Type.Grey100);
		/**
		 * Eightbit grey3 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey3: Type = _fromCode(ASColorCode.EightBit.Type.Grey3);
		/**
		 * Eightbit grey7 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey7: Type = _fromCode(ASColorCode.EightBit.Type.Grey7);
		/**
		 * Eightbit grey11 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey11: Type = _fromCode(ASColorCode.EightBit.Type.Grey11);
		/**
		 * Eightbit grey15 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey15: Type = _fromCode(ASColorCode.EightBit.Type.Grey15);
		/**
		 * Eightbit grey19 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey19: Type = _fromCode(ASColorCode.EightBit.Type.Grey19);
		/**
		 * Eightbit grey23 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey23: Type = _fromCode(ASColorCode.EightBit.Type.Grey23);
		/**
		 * Eightbit grey27 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey27: Type = _fromCode(ASColorCode.EightBit.Type.Grey27);
		/**
		 * Eightbit grey30 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey30: Type = _fromCode(ASColorCode.EightBit.Type.Grey30);
		/**
		 * Eightbit grey35 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey35: Type = _fromCode(ASColorCode.EightBit.Type.Grey35);
		/**
		 * Eightbit grey39 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey39: Type = _fromCode(ASColorCode.EightBit.Type.Grey39);
		/**
		 * Eightbit grey42 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey42: Type = _fromCode(ASColorCode.EightBit.Type.Grey42);
		/**
		 * Eightbit grey46 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey46: Type = _fromCode(ASColorCode.EightBit.Type.Grey46);
		/**
		 * Eightbit grey50 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey50: Type = _fromCode(ASColorCode.EightBit.Type.Grey50);
		/**
		 * Eightbit grey54 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey54: Type = _fromCode(ASColorCode.EightBit.Type.Grey54);
		/**
		 * Eightbit grey58 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey58: Type = _fromCode(ASColorCode.EightBit.Type.Grey58);
		/**
		 * Eightbit grey62 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey62: Type = _fromCode(ASColorCode.EightBit.Type.Grey62);
		/**
		 * Eightbit grey66 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey66: Type = _fromCode(ASColorCode.EightBit.Type.Grey66);
		/**
		 * Eightbit grey70 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey70: Type = _fromCode(ASColorCode.EightBit.Type.Grey70);
		/**
		 * Eightbit grey74 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey74: Type = _fromCode(ASColorCode.EightBit.Type.Grey74);
		/**
		 * Eightbit grey78 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey78: Type = _fromCode(ASColorCode.EightBit.Type.Grey78);
		/**
		 * Eightbit grey82 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey82: Type = _fromCode(ASColorCode.EightBit.Type.Grey82);
		/**
		 * Eightbit grey85 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey85: Type = _fromCode(ASColorCode.EightBit.Type.Grey85);
		/**
		 * Eightbit grey89 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey89: Type = _fromCode(ASColorCode.EightBit.Type.Grey89);
		/**
		 * Eightbit grey93 color
		 *
		 * @since 0.0.1
		 * @category EightBit instances
		 */
		export const grey93: Type = _fromCode(ASColorCode.EightBit.Type.Grey93);
	}

	/**
	 * Namespace for RGB Bg colors
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace Rgb {
		/** RGB background color Style instance maker */
		const _fromCode: MTypes.OneArgFunction<
			{
				readonly id: string;
				readonly redCode: number;
				readonly greenCode: number;
				readonly blueCode: number;
			},
			Type
		> = flow(ASStyleCharacteristic.Bg.RgbColor, _fromCharacteritic);

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
			_fromCode({
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
		export const maroon: Type = _fromCode({
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
		export const darkRed: Type = _fromCode({
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
		export const brown: Type = _fromCode({
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
		export const firebrick: Type = _fromCode({
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
		export const crimson: Type = _fromCode({
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
		export const red: Type = _fromCode({
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
		export const tomato: Type = _fromCode({
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
		export const coral: Type = _fromCode({
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
		export const indianRed: Type = _fromCode({
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
		export const lightCoral: Type = _fromCode({
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
		export const darkSalmon: Type = _fromCode({
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
		export const salmon: Type = _fromCode({
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
		export const lightSalmon: Type = _fromCode({
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
		export const orangeRed: Type = _fromCode({
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
		export const darkOrange: Type = _fromCode({
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
		export const orange: Type = _fromCode({
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
		export const gold: Type = _fromCode({
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
		export const darkGoldenRod: Type = _fromCode({
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
		export const goldenRod: Type = _fromCode({
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
		export const paleGoldenRod: Type = _fromCode({
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
		export const darkKhaki: Type = _fromCode({
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
		export const khaki: Type = _fromCode({
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
		export const olive: Type = _fromCode({
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
		export const yellow: Type = _fromCode({
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
		export const yellowGreen: Type = _fromCode({
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
		export const darkOliveGreen: Type = _fromCode({
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
		export const oliveDrab: Type = _fromCode({
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
		export const lawnGreen: Type = _fromCode({
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
		export const chartreuse: Type = _fromCode({
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
		export const greenYellow: Type = _fromCode({
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
		export const darkGreen: Type = _fromCode({
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
		export const green: Type = _fromCode({
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
		export const forestGreen: Type = _fromCode({
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
		export const lime: Type = _fromCode({
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
		export const limeGreen: Type = _fromCode({
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
		export const lightGreen: Type = _fromCode({
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
		export const paleGreen: Type = _fromCode({
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
		export const darkSeaGreen: Type = _fromCode({
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
		export const mediumSpringGreen: Type = _fromCode({
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
		export const springGreen: Type = _fromCode({
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
		export const seaGreen: Type = _fromCode({
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
		export const mediumAquaMarine: Type = _fromCode({
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
		export const mediumSeaGreen: Type = _fromCode({
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
		export const lightSeaGreen: Type = _fromCode({
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
		export const darkSlateGray: Type = _fromCode({
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
		export const teal: Type = _fromCode({
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
		export const darkCyan: Type = _fromCode({
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
		export const aqua: Type = _fromCode({
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
		export const cyan: Type = _fromCode({
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
		export const lightCyan: Type = _fromCode({
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
		export const darkTurquoise: Type = _fromCode({
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
		export const turquoise: Type = _fromCode({
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
		export const mediumTurquoise: Type = _fromCode({
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
		export const paleTurquoise: Type = _fromCode({
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
		export const aquaMarine: Type = _fromCode({
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
		export const powderBlue: Type = _fromCode({
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
		export const cadetBlue: Type = _fromCode({
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
		export const steelBlue: Type = _fromCode({
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
		export const cornFlowerBlue: Type = _fromCode({
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
		export const deepSkyBlue: Type = _fromCode({
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
		export const dodgerBlue: Type = _fromCode({
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
		export const lightBlue: Type = _fromCode({
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
		export const skyBlue: Type = _fromCode({
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
		export const lightSkyBlue: Type = _fromCode({
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
		export const midnightBlue: Type = _fromCode({
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
		export const navy: Type = _fromCode({
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
		export const darkBlue: Type = _fromCode({
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
		export const mediumBlue: Type = _fromCode({
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
		export const blue: Type = _fromCode({
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
		export const royalBlue: Type = _fromCode({
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
		export const blueViolet: Type = _fromCode({
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
		export const indigo: Type = _fromCode({
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
		export const darkSlateBlue: Type = _fromCode({
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
		export const slateBlue: Type = _fromCode({
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
		export const mediumSlateBlue: Type = _fromCode({
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
		export const mediumPurple: Type = _fromCode({
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
		export const darkMagenta: Type = _fromCode({
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
		export const darkViolet: Type = _fromCode({
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
		export const darkOrchid: Type = _fromCode({
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
		export const mediumOrchid2: Type = _fromCode({
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
		export const purple: Type = _fromCode({
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
		export const thistle: Type = _fromCode({
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
		export const plum: Type = _fromCode({
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
		export const violet: Type = _fromCode({
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
		export const magenta: Type = _fromCode({
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
		export const orchid: Type = _fromCode({
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
		export const mediumVioletRed: Type = _fromCode({
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
		export const paleVioletRed: Type = _fromCode({
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
		export const deepPink: Type = _fromCode({
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
		export const hotPink: Type = _fromCode({
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
		export const lightPink: Type = _fromCode({
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
		export const pink: Type = _fromCode({
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
		export const antiqueWhite: Type = _fromCode({
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
		export const beige: Type = _fromCode({
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
		export const bisque: Type = _fromCode({
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
		export const blanchedAlmond: Type = _fromCode({
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
		export const wheat: Type = _fromCode({
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
		export const cornSilk: Type = _fromCode({
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
		export const lemonChiffon: Type = _fromCode({
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
		export const lightGoldenRodYellow: Type = _fromCode({
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
		export const lightYellow: Type = _fromCode({
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
		export const saddleBrown: Type = _fromCode({
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
		export const sienna: Type = _fromCode({
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
		export const chocolate: Type = _fromCode({
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
		export const peru: Type = _fromCode({
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
		export const sandyBrown: Type = _fromCode({
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
		export const burlyWood: Type = _fromCode({
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
		export const tan: Type = _fromCode({
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
		export const rosyBrown: Type = _fromCode({
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
		export const moccasin: Type = _fromCode({
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
		export const navajoWhite: Type = _fromCode({
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
		export const peachPuff: Type = _fromCode({
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
		export const mistyRose: Type = _fromCode({
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
		export const lavenderBlush: Type = _fromCode({
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
		export const linen: Type = _fromCode({
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
		export const oldLace: Type = _fromCode({
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
		export const papayaWhip: Type = _fromCode({
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
		export const seaShell: Type = _fromCode({
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
		export const mintCream: Type = _fromCode({
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
		export const slateGray: Type = _fromCode({
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
		export const lightSlateGray: Type = _fromCode({
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
		export const lightSteelBlue: Type = _fromCode({
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
		export const lavender: Type = _fromCode({
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
		export const floralWhite: Type = _fromCode({
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
		export const aliceBlue: Type = _fromCode({
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
		export const ghostWhite: Type = _fromCode({
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
		export const honeydew: Type = _fromCode({
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
		export const ivory: Type = _fromCode({
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
		export const azure: Type = _fromCode({
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
		export const snow: Type = _fromCode({
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
		export const black: Type = _fromCode({
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
		export const dimGray: Type = _fromCode({
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
		export const gray: Type = _fromCode({
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
		export const darkGray: Type = _fromCode({
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
		export const silver: Type = _fromCode({
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
		export const lightGray: Type = _fromCode({
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
		export const gainsboro: Type = _fromCode({
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
		export const whiteSmoke: Type = _fromCode({
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
		export const white: Type = _fromCode({
			id: 'White',
			redCode: 255,
			greenCode: 255,
			blueCode: 255
		});
	}
}
