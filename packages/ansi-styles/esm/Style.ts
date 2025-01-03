/**
 * This module implements a type that represents an ANSI style as defined in the Select Graphic
 * Rendition subset. Info at
 * https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences A style is simply
 * a sorted array of the StyleCharacteristic's (see StyleCharacteristics.ts) that define it. As
 * syntaxic sugar, styles are callable functions that create Text's (see Text.ts). For instance,
 * `const text = ASStyle.red('foo')` will create a text containing the string 'foo' styled in red.
 *
 * @since 0.0.1
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as ASColor from './Color.js';
import * as ASStyleCharacteristics from './StyleCharacteristics.js';
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
	 * StyleCharacteristics that define this Style
	 *
	 * @since 0.0.1
	 */
	readonly characteristics: ASStyleCharacteristics.Type;

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
	ASStyleCharacteristics.equivalence(self.characteristics, that.characteristics);

const _TypeIdHash = Hash.hash(TypeId);
const base: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.characteristics, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return ASStyleCharacteristics.toId(this.characteristics);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = ({ characteristics }: MTypes.Data<Type>): Type => {
	return Object.assign(
		(...args: ReadonlyArray<string | ASText.Type>): ASText.Type =>
			ASText.fromStyleAndElems(characteristics)(...args),
		{
			characteristics,
			...base
		}
	);
};

/**
 * Gets the `characteristics` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const characteristics: MTypes.OneArgFunction<Type, ASStyleCharacteristics.Type> =
	Struct.get('characteristics');

/**
 * Builds a new Style by merging `self` and `that`. In case of conflict (e.g `self` contains `Bold`
 * and `that` contains `NotBold`), the characteristics in `that` will prevail.
 *
 * @since 0.0.1
 * @category Utils
 */
export const mergeOver =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			characteristics: pipe(
				self.characteristics,
				ASStyleCharacteristics.mergeOver(that.characteristics)
			)
		});

/**
 * Builds a new Style by merging `self` and `that`. In case of conflict (e.g `self` contains `Bold`
 * and `that` contains `NotBold`), the characteristics in `self` will prevail.
 *
 * @since 0.0.1
 * @category Utils
 */
export const mergeUnder =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			characteristics: pipe(
				self.characteristics,
				ASStyleCharacteristics.mergeUnder(that.characteristics)
			)
		});

/**
 * None Style instance, i.e Style that performs no styling
 *
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = _make({ characteristics: ASStyleCharacteristics.none });

/**
 * Bold Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bold: Type = _make({ characteristics: ASStyleCharacteristics.bold });

/**
 * NotBold Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notBold: Type = _make({ characteristics: ASStyleCharacteristics.notBold });

/**
 * Dim Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: Type = _make({ characteristics: ASStyleCharacteristics.dim });

/**
 * NotDim Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notDim: Type = _make({ characteristics: ASStyleCharacteristics.notDim });

/**
 * Italic Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: Type = _make({ characteristics: ASStyleCharacteristics.italic });

/**
 * NotItalic Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notItalic: Type = _make({ characteristics: ASStyleCharacteristics.notItalic });

/**
 * Underlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: Type = _make({ characteristics: ASStyleCharacteristics.underlined });

/**
 * NotUnderlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notUnderlined: Type = _make({ characteristics: ASStyleCharacteristics.notUnderlined });

/**
 * Struck-through Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: Type = _make({ characteristics: ASStyleCharacteristics.struckThrough });

/**
 * NotStruckThrough Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notStruckThrough: Type = _make({
	characteristics: ASStyleCharacteristics.notStruckThrough
});

/**
 * Overlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: Type = _make({ characteristics: ASStyleCharacteristics.overlined });

/**
 * NotOverlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notOverlined: Type = _make({ characteristics: ASStyleCharacteristics.notOverlined });

/**
 * Inversed Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: Type = _make({ characteristics: ASStyleCharacteristics.inversed });

/**
 * NotInversed Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notInversed: Type = _make({ characteristics: ASStyleCharacteristics.notInversed });

/**
 * Hidden Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: Type = _make({ characteristics: ASStyleCharacteristics.hidden });

/**
 * NotHidden Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notHidden: Type = _make({ characteristics: ASStyleCharacteristics.notHidden });

/**
 * Blinking Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const blinking: Type = _make({ characteristics: ASStyleCharacteristics.blinking });

/**
 * NotBlinking Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notBlinking: Type = _make({ characteristics: ASStyleCharacteristics.notBlinking });

/**
 * Default foreground color Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultColor: Type = _make({ characteristics: ASStyleCharacteristics.fgDefaultColor });

/**
 * Builds a Style that applies `color` as foreground color
 *
 * @since 0.0.1
 * @category Constructors
 */
export const color = (color: ASColor.Type): Type =>
	_make({ characteristics: ASStyleCharacteristics.fromColorAsForegroundColor(color) });

/**
 * Original black color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const black: Type = color(ASColor.ThreeBit.black);

/**
 * Original red color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const red: Type = color(ASColor.ThreeBit.red);

/**
 * Original green color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const green: Type = color(ASColor.ThreeBit.green);

/**
 * Original yellow color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const yellow: Type = color(ASColor.ThreeBit.yellow);

/**
 * Original blue color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const blue: Type = color(ASColor.ThreeBit.blue);

/**
 * Original magenta color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const magenta: Type = color(ASColor.ThreeBit.magenta);

/**
 * Original cyan color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const cyan: Type = color(ASColor.ThreeBit.cyan);

/**
 * Original white color style instance
 *
 * @since 0.0.1
 * @category Original instances
 */
export const white: Type = color(ASColor.ThreeBit.white);

/**
 * Namespace for bright original colors
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Bright {
	/**
	 * Original bright black color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const black: Type = color(ASColor.ThreeBit.Bright.black);

	/**
	 * Original bright red color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const red: Type = color(ASColor.ThreeBit.Bright.red);

	/**
	 * Original bright green color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const green: Type = color(ASColor.ThreeBit.Bright.green);

	/**
	 * Original bright yellow color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const yellow: Type = color(ASColor.ThreeBit.Bright.yellow);

	/**
	 * Original bright blue color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const blue: Type = color(ASColor.ThreeBit.Bright.blue);

	/**
	 * Original bright magenta color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const magenta: Type = color(ASColor.ThreeBit.Bright.magenta);

	/**
	 * Original bright cyan color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const cyan: Type = color(ASColor.ThreeBit.Bright.cyan);

	/**
	 * Original bright white color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const white: Type = color(ASColor.ThreeBit.Bright.white);
}

/**
 * Namespace for colors used as background colors
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
	export const defaultColor: Type = _make({
		characteristics: ASStyleCharacteristics.bgDefaultColor
	});

	/**
	 * Builds a Style that applies `color` as background color
	 *
	 * @since 0.0.1
	 * @category Constructors
	 */
	export const color = (color: ASColor.Type): Type =>
		_make({ characteristics: ASStyleCharacteristics.fromColorAsBackgroundColor(color) });

	/**
	 * Original black color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const black: Type = color(ASColor.ThreeBit.black);

	/**
	 * Original red color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const red: Type = color(ASColor.ThreeBit.red);

	/**
	 * Original green color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const green: Type = color(ASColor.ThreeBit.green);

	/**
	 * Original yellow color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const yellow: Type = color(ASColor.ThreeBit.yellow);

	/**
	 * Original blue color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const blue: Type = color(ASColor.ThreeBit.blue);

	/**
	 * Original magenta color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const magenta: Type = color(ASColor.ThreeBit.magenta);

	/**
	 * Original cyan color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const cyan: Type = color(ASColor.ThreeBit.cyan);

	/**
	 * Original white color style instance
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const white: Type = color(ASColor.ThreeBit.white);

	/**
	 * Namespace for bright original colors
	 *
	 * @since 0.0.1
	 * @category Models
	 */
	export namespace Bright {
		/**
		 * Original bright black color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const black: Type = color(ASColor.ThreeBit.Bright.black);

		/**
		 * Original bright red color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const red: Type = color(ASColor.ThreeBit.Bright.red);

		/**
		 * Original bright green color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const green: Type = color(ASColor.ThreeBit.Bright.green);

		/**
		 * Original bright yellow color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const yellow: Type = color(ASColor.ThreeBit.Bright.yellow);

		/**
		 * Original bright blue color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const blue: Type = color(ASColor.ThreeBit.Bright.blue);

		/**
		 * Original bright magenta color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const magenta: Type = color(ASColor.ThreeBit.Bright.magenta);

		/**
		 * Original bright cyan color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const cyan: Type = color(ASColor.ThreeBit.Bright.cyan);

		/**
		 * Original bright white color style instance
		 *
		 * @since 0.0.1
		 * @category Original instances
		 */
		export const white: Type = color(ASColor.ThreeBit.Bright.white);
	}
}
