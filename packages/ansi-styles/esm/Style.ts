/**
 * Same as StyleCharacteristics (see StyleCharacteristics.ts) but, as syntaxic sugar, styles are
 * callable functions that create Text's (see Text.ts). For instance, `const text =
 * ASStyle.red('foo')` will create a text containing the string 'foo' styled in red.
 */

import { MInspectable, MPipeable, MTypes } from '@parischap/effect-lib';
import { Equal, Equivalence, Hash, pipe, Pipeable, Predicate, Struct } from 'effect';
import * as ASColor from './Color.js';
import * as ASStyleCharacteristics from './StyleCharacteristics.js';
import * as ASText from './Text.js';

/**
 * Module tag
 *
 * @category Models
 */
export const moduleTag = '@parischap/ansi-styles/Style/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Namespace of a Style used as an action
 *
 * @category Models
 */
export namespace Action {
	/**
	 * Type of the action
	 *
	 * @category Models
	 */
	export interface Type {
		(...args: ReadonlyArray<string | ASText.Type>): ASText.Type;
	}
}

/**
 * Type that represents a Style
 *
 * @category Models
 */
export interface Type
	extends Action.Type,
		Equal.Equal,
		MInspectable.Inspectable,
		Pipeable.Pipeable {
	/** StyleCharacteristics that define this Style */
	readonly style: ASStyleCharacteristics.Type;

	/** @internal */
	readonly [_TypeId]: _TypeId;
}

/**
 * Type guard
 *
 * @category Guards
 */
export const has = (u: unknown): u is Type => Predicate.hasProperty(u, _TypeId);

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
	ASStyleCharacteristics.equivalence(self.style, that.style);

/** Base */
const _TypeIdHash = Hash.hash(_TypeId);
const base: MTypes.Proto<Type> = {
	[_TypeId]: _TypeId,
	[Equal.symbol](this: Type, that: unknown): boolean {
		return has(that) && equivalence(this, that);
	},
	[Hash.symbol](this: Type) {
		return pipe(this.style, Hash.hash, Hash.combine(_TypeIdHash), Hash.cached(this));
	},
	[MInspectable.IdSymbol](this: Type) {
		return toId(this);
	},
	...MInspectable.BaseProto(moduleTag),
	...MPipeable.BaseProto
};

/** Constructor */
const _make = (params: MTypes.Data<Type>): Type =>
	Object.assign(
		((...args) => ASText.fromStyleAndElems(params.style)(...args)) satisfies Action.Type,
		{
			...params,
			...base
		}
	);

/**
 * Gets the `style` property of `self`
 *
 * @category Destructors
 */
export const style: MTypes.OneArgFunction<Type, ASStyleCharacteristics.Type> = Struct.get('style');

/**
 * Returns the id of `self`
 *
 * @category Destructors
 */
export const toId = (self: Type): string => ASStyleCharacteristics.toId(self.style);
/**
 * Builds a new Style by merging `self` and `that`. In case of conflict (e.g `self` contains `Bold`
 * and `that` contains `NotBold`), the style in `that` will prevail.
 *
 * @category Utils
 */
export const mergeOver =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			style: pipe(self.style, ASStyleCharacteristics.mergeOver(that.style))
		});

/**
 * Builds a new Style by merging `self` and `that`. In case of conflict (e.g `self` contains `Bold`
 * and `that` contains `NotBold`), the style in `self` will prevail.
 *
 * @category Utils
 */
export const mergeUnder =
	(that: Type) =>
	(self: Type): Type =>
		_make({
			style: pipe(self.style, ASStyleCharacteristics.mergeUnder(that.style))
		});

/**
 * None Style instance, i.e. Style that performs no styling
 *
 * @category Instances
 */
export const none: Type = _make({ style: ASStyleCharacteristics.none });

/**
 * Bold Style instance
 *
 * @category Instances
 */
export const bold: Type = _make({ style: ASStyleCharacteristics.bold });

/**
 * NotBold Style instance
 *
 * @category Instances
 */
export const notBold: Type = _make({ style: ASStyleCharacteristics.notBold });

/**
 * Dim Style instance
 *
 * @category Instances
 */
export const dim: Type = _make({ style: ASStyleCharacteristics.dim });

/**
 * NotDim Style instance
 *
 * @category Instances
 */
export const notDim: Type = _make({ style: ASStyleCharacteristics.notDim });

/**
 * Italic Style instance
 *
 * @category Instances
 */
export const italic: Type = _make({ style: ASStyleCharacteristics.italic });

/**
 * NotItalic Style instance
 *
 * @category Instances
 */
export const notItalic: Type = _make({ style: ASStyleCharacteristics.notItalic });

/**
 * Underlined Style instance
 *
 * @category Instances
 */
export const underlined: Type = _make({ style: ASStyleCharacteristics.underlined });

/**
 * NotUnderlined Style instance
 *
 * @category Instances
 */
export const notUnderlined: Type = _make({ style: ASStyleCharacteristics.notUnderlined });

/**
 * Struck-through Style instance
 *
 * @category Instances
 */
export const struckThrough: Type = _make({ style: ASStyleCharacteristics.struckThrough });

/**
 * NotStruckThrough Style instance
 *
 * @category Instances
 */
export const notStruckThrough: Type = _make({
	style: ASStyleCharacteristics.notStruckThrough
});

/**
 * Overlined Style instance
 *
 * @category Instances
 */
export const overlined: Type = _make({ style: ASStyleCharacteristics.overlined });

/**
 * NotOverlined Style instance
 *
 * @category Instances
 */
export const notOverlined: Type = _make({ style: ASStyleCharacteristics.notOverlined });

/**
 * Inversed Style instance
 *
 * @category Instances
 */
export const inversed: Type = _make({ style: ASStyleCharacteristics.inversed });

/**
 * NotInversed Style instance
 *
 * @category Instances
 */
export const notInversed: Type = _make({ style: ASStyleCharacteristics.notInversed });

/**
 * Hidden Style instance
 *
 * @category Instances
 */
export const hidden: Type = _make({ style: ASStyleCharacteristics.hidden });

/**
 * NotHidden Style instance
 *
 * @category Instances
 */
export const notHidden: Type = _make({ style: ASStyleCharacteristics.notHidden });

/**
 * Blinking Style instance
 *
 * @category Instances
 */
export const blinking: Type = _make({ style: ASStyleCharacteristics.blinking });

/**
 * NotBlinking Style instance
 *
 * @category Instances
 */
export const notBlinking: Type = _make({ style: ASStyleCharacteristics.notBlinking });

/**
 * Default foreground color Style instance
 *
 * @category Instances
 */
export const defaultColor: Type = _make({ style: ASStyleCharacteristics.fgDefaultColor });

/**
 * Builds a Style that applies `color` as foreground color
 *
 * @category Constructors
 */
export const color = (color: ASColor.Type): Type =>
	_make({ style: ASStyleCharacteristics.fromColorAsForegroundColor(color) });

/**
 * Original black color style instance
 *
 * @category Original instances
 */
export const black: Type = color(ASColor.threeBitBlack);

/**
 * Original red color style instance
 *
 * @category Original instances
 */
export const red: Type = color(ASColor.threeBitRed);

/**
 * Original green color style instance
 *
 * @category Original instances
 */
export const green: Type = color(ASColor.threeBitGreen);

/**
 * Original yellow color style instance
 *
 * @category Original instances
 */
export const yellow: Type = color(ASColor.threeBitYellow);

/**
 * Original blue color style instance
 *
 * @category Original instances
 */
export const blue: Type = color(ASColor.threeBitBlue);

/**
 * Original magenta color style instance
 *
 * @category Original instances
 */
export const magenta: Type = color(ASColor.threeBitMagenta);

/**
 * Original cyan color style instance
 *
 * @category Original instances
 */
export const cyan: Type = color(ASColor.threeBitCyan);

/**
 * Original white color style instance
 *
 * @category Original instances
 */
export const white: Type = color(ASColor.threeBitWhite);

/**
 * Namespace for bright original colors
 *
 * @category Models
 */
export namespace Bright {
	/**
	 * Original bright black color style instance
	 *
	 * @category Original instances
	 */
	export const black: Type = color(ASColor.threeBitBrightBlack);

	/**
	 * Original bright red color style instance
	 *
	 * @category Original instances
	 */
	export const red: Type = color(ASColor.threeBitBrightRed);

	/**
	 * Original bright green color style instance
	 *
	 * @category Original instances
	 */
	export const green: Type = color(ASColor.threeBitBrightGreen);

	/**
	 * Original bright yellow color style instance
	 *
	 * @category Original instances
	 */
	export const yellow: Type = color(ASColor.threeBitBrightYellow);

	/**
	 * Original bright blue color style instance
	 *
	 * @category Original instances
	 */
	export const blue: Type = color(ASColor.threeBitBrightBlue);

	/**
	 * Original bright magenta color style instance
	 *
	 * @category Original instances
	 */
	export const magenta: Type = color(ASColor.threeBitBrightMagenta);

	/**
	 * Original bright cyan color style instance
	 *
	 * @category Original instances
	 */
	export const cyan: Type = color(ASColor.threeBitBrightCyan);

	/**
	 * Original bright white color style instance
	 *
	 * @category Original instances
	 */
	export const white: Type = color(ASColor.threeBitBrightWhite);
}

/**
 * Namespace for colors used as background colors
 *
 * @category Models
 */
export namespace Bg {
	/**
	 * Default background color Style instance
	 *
	 * @category Instances
	 */
	export const defaultColor: Type = _make({
		style: ASStyleCharacteristics.bgDefaultColor
	});

	/**
	 * Builds a Style that applies `color` as background color
	 *
	 * @category Constructors
	 */
	export const color = (color: ASColor.Type): Type =>
		_make({ style: ASStyleCharacteristics.fromColorAsBackgroundColor(color) });

	/**
	 * Original black color style instance
	 *
	 * @category Original instances
	 */
	export const black: Type = color(ASColor.threeBitBlack);

	/**
	 * Original red color style instance
	 *
	 * @category Original instances
	 */
	export const red: Type = color(ASColor.threeBitRed);

	/**
	 * Original green color style instance
	 *
	 * @category Original instances
	 */
	export const green: Type = color(ASColor.threeBitGreen);

	/**
	 * Original yellow color style instance
	 *
	 * @category Original instances
	 */
	export const yellow: Type = color(ASColor.threeBitYellow);

	/**
	 * Original blue color style instance
	 *
	 * @category Original instances
	 */
	export const blue: Type = color(ASColor.threeBitBlue);

	/**
	 * Original magenta color style instance
	 *
	 * @category Original instances
	 */
	export const magenta: Type = color(ASColor.threeBitMagenta);

	/**
	 * Original cyan color style instance
	 *
	 * @category Original instances
	 */
	export const cyan: Type = color(ASColor.threeBitCyan);

	/**
	 * Original white color style instance
	 *
	 * @category Original instances
	 */
	export const white: Type = color(ASColor.threeBitWhite);

	/**
	 * Namespace for bright original colors
	 *
	 * @category Models
	 */
	export namespace Bright {
		/**
		 * Original bright black color style instance
		 *
		 * @category Original instances
		 */
		export const black: Type = color(ASColor.threeBitBrightBlack);

		/**
		 * Original bright red color style instance
		 *
		 * @category Original instances
		 */
		export const red: Type = color(ASColor.threeBitBrightRed);

		/**
		 * Original bright green color style instance
		 *
		 * @category Original instances
		 */
		export const green: Type = color(ASColor.threeBitBrightGreen);

		/**
		 * Original bright yellow color style instance
		 *
		 * @category Original instances
		 */
		export const yellow: Type = color(ASColor.threeBitBrightYellow);

		/**
		 * Original bright blue color style instance
		 *
		 * @category Original instances
		 */
		export const blue: Type = color(ASColor.threeBitBrightBlue);

		/**
		 * Original bright magenta color style instance
		 *
		 * @category Original instances
		 */
		export const magenta: Type = color(ASColor.threeBitBrightMagenta);

		/**
		 * Original bright cyan color style instance
		 *
		 * @category Original instances
		 */
		export const cyan: Type = color(ASColor.threeBitBrightCyan);

		/**
		 * Original bright white color style instance
		 *
		 * @category Original instances
		 */
		export const white: Type = color(ASColor.threeBitBrightWhite);
	}
}
