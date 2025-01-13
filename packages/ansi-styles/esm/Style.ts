/**
 * Same as StyleCharacteristics (see StyleCharacteristics.ts) but, as syntaxic sugar, styles are
 * callable functions that create Text's (see Text.ts). For instance, `const text =
 * ASStyle.red('foo')` will create a text containing the string 'foo' styled in red.
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
/*
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
	readonly style: ASStyleCharacteristics.Type;

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
	ASStyleCharacteristics.equivalence(self.style, that.style);

const _TypeIdHash = Hash.hash(TypeId);
const base: MTypes.Proto<Type> = {
	[TypeId]: TypeId,
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
const _make = ({ style }: MTypes.Data<Type>): Type =>
	Object.assign(
		(...args: ReadonlyArray<string | ASText.Type>): ASText.Type =>
			ASText.fromStyleAndElems(style)(...args),
		{
			style,
			...base
		}
	);

/**
 * Gets the `style` property of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const style: MTypes.OneArgFunction<Type, ASStyleCharacteristics.Type> = Struct.get('style');

/**
 * Returns the id of `self`
 *
 * @since 0.0.1
 * @category Destructors
 */
export const toId = (self: Type): string => ASStyleCharacteristics.toId(self.style);
/**
 * Builds a new Style by merging `self` and `that`. In case of conflict (e.g `self` contains `Bold`
 * and `that` contains `NotBold`), the style in `that` will prevail.
 *
 * @since 0.0.1
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
 * @since 0.0.1
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
 * @since 0.0.1
 * @category Instances
 */
export const none: Type = _make({ style: ASStyleCharacteristics.none });

/**
 * Bold Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const bold: Type = _make({ style: ASStyleCharacteristics.bold });

/**
 * NotBold Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notBold: Type = _make({ style: ASStyleCharacteristics.notBold });

/**
 * Dim Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const dim: Type = _make({ style: ASStyleCharacteristics.dim });

/**
 * NotDim Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notDim: Type = _make({ style: ASStyleCharacteristics.notDim });

/**
 * Italic Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const italic: Type = _make({ style: ASStyleCharacteristics.italic });

/**
 * NotItalic Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notItalic: Type = _make({ style: ASStyleCharacteristics.notItalic });

/**
 * Underlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const underlined: Type = _make({ style: ASStyleCharacteristics.underlined });

/**
 * NotUnderlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notUnderlined: Type = _make({ style: ASStyleCharacteristics.notUnderlined });

/**
 * Struck-through Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const struckThrough: Type = _make({ style: ASStyleCharacteristics.struckThrough });

/**
 * NotStruckThrough Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notStruckThrough: Type = _make({
	style: ASStyleCharacteristics.notStruckThrough
});

/**
 * Overlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const overlined: Type = _make({ style: ASStyleCharacteristics.overlined });

/**
 * NotOverlined Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notOverlined: Type = _make({ style: ASStyleCharacteristics.notOverlined });

/**
 * Inversed Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const inversed: Type = _make({ style: ASStyleCharacteristics.inversed });

/**
 * NotInversed Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notInversed: Type = _make({ style: ASStyleCharacteristics.notInversed });

/**
 * Hidden Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const hidden: Type = _make({ style: ASStyleCharacteristics.hidden });

/**
 * NotHidden Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notHidden: Type = _make({ style: ASStyleCharacteristics.notHidden });

/**
 * Blinking Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const blinking: Type = _make({ style: ASStyleCharacteristics.blinking });

/**
 * NotBlinking Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const notBlinking: Type = _make({ style: ASStyleCharacteristics.notBlinking });

/**
 * Default foreground color Style instance
 *
 * @since 0.0.1
 * @category Instances
 */
export const defaultColor: Type = _make({ style: ASStyleCharacteristics.fgDefaultColor });

/**
 * Builds a Style that applies `color` as foreground color
 *
 * @since 0.0.1
 * @category Constructors
 */
export const color = (color: ASColor.Type): Type =>
	_make({ style: ASStyleCharacteristics.fromColorAsForegroundColor(color) });

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
		style: ASStyleCharacteristics.bgDefaultColor
	});

	/**
	 * Builds a Style that applies `color` as background color
	 *
	 * @since 0.0.1
	 * @category Constructors
	 */
	export const color = (color: ASColor.Type): Type =>
		_make({ style: ASStyleCharacteristics.fromColorAsBackgroundColor(color) });

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
