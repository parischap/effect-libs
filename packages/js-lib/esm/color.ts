/**
 * A very simple ANSI colors module
 *
 * @since 0.0.4
 */

/**
 * 8 ANSI original color offsets
 *
 * @since 0.0.4
 * @category Models
 */
export enum OriginalColors {
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
 * Type that represents a color
 *
 * @since 0.0.4
 * @category Models
 */
export interface Type {
	/**
	 * Text color
	 *
	 * @since 0.0.4
	 */
	readonly color: ReadonlyArray<number>;
	/**
	 * Background color
	 *
	 * @since 0.0.4
	 */
	readonly bgColor: ReadonlyArray<number>;
	/**
	 * True if text must be bold
	 *
	 * @since 0.0.4
	 */
	readonly isBold: boolean;
	/**
	 * True if text must be underlined
	 *
	 * @since 0.0.4
	 */
	readonly isUnderline: boolean;
	/**
	 * True if text must blink
	 *
	 * @since 0.0.4
	 */
	readonly isBlink: boolean;
	/**
	 * True if text must be framed
	 *
	 * @since 0.0.4
	 */
	readonly isFramed: boolean;
	/**
	 * True if text must be encircled
	 *
	 * @since 0.0.4
	 */
	readonly isEncircled: boolean;
	/**
	 * True if text must be overlined
	 *
	 * @since 0.0.4
	 */
	readonly isOverlined: boolean;
}

/**
 * Empty color
 *
 * @since 0.0.4
 * @category Instances
 */
export const empty: Type = {
	color: [],
	bgColor: [],
	isBold: false,
	isUnderline: false,
	isBlink: false,
	isFramed: false,
	isEncircled: false,
	isOverlined: false
};

/**
 * Creates a simple color from the 8 ANSI original color offsets
 *
 * @since 0.0.4
 * @category Constructors
 */
export const simpleFromOriginalColor = (color: OriginalColors): Type => ({
	...empty,
	color: Array.of(30 + color)
});

/**
 * Black color
 *
 * @since 0.0.4
 * @category Instances
 */
export const black = simpleFromOriginalColor(OriginalColors.Black);

/**
 * Red color
 *
 * @since 0.0.4
 * @category Instances
 */
export const red = simpleFromOriginalColor(OriginalColors.Red);

/**
 * Green color
 *
 * @since 0.0.4
 * @category Instances
 */
export const green = simpleFromOriginalColor(OriginalColors.Green);

/**
 * Yellow color
 *
 * @since 0.0.4
 * @category Instances
 */
export const yellow = simpleFromOriginalColor(OriginalColors.Yellow);

/**
 * Blue color
 *
 * @since 0.0.4
 * @category Instances
 */
export const blue = simpleFromOriginalColor(OriginalColors.Blue);

/**
 * Magenta color
 *
 * @since 0.0.4
 * @category Instances
 */
export const magenta = simpleFromOriginalColor(OriginalColors.Magenta);

/**
 * Cyan color
 *
 * @since 0.0.4
 * @category Instances
 */
export const cyan = simpleFromOriginalColor(OriginalColors.Cyan);

/**
 * White color
 *
 * @since 0.0.4
 * @category Instances
 */
export const white = simpleFromOriginalColor(OriginalColors.White);

/**
 * Creates a bright color from the 8 ANSI original color offsets
 *
 * @since 0.0.4
 * @category Constructors
 */
export const brightFromOriginalColor = (color: OriginalColors): Type => ({
	...empty,
	color: Array.of(90 + color)
});

/**
 * Bright black color
 *
 * @since 0.0.4
 * @category Instances
 */
export const brightBlack = brightFromOriginalColor(OriginalColors.Black);

/**
 * Bright red color
 *
 * @since 0.0.4
 * @category Instances
 */
export const brightRed = brightFromOriginalColor(OriginalColors.Red);

/**
 * Bright green color
 *
 * @since 0.0.4
 * @category Instances
 */
export const brightGreen = brightFromOriginalColor(OriginalColors.Green);

/**
 * Bright yellow color
 *
 * @since 0.0.4
 * @category Instances
 */
export const brightYellow = brightFromOriginalColor(OriginalColors.Yellow);

/**
 * Bright blue color
 *
 * @since 0.0.4
 * @category Instances
 */
export const brightBlue = brightFromOriginalColor(OriginalColors.Blue);

/**
 * Bright magenta color
 *
 * @since 0.0.4
 * @category Instances
 */
export const brightMagenta = brightFromOriginalColor(OriginalColors.Magenta);

/**
 * Bright cyan color
 *
 * @since 0.0.4
 * @category Instances
 */
export const brightCyan = brightFromOriginalColor(OriginalColors.Cyan);

/**
 * Bright white color
 *
 * @since 0.0.4
 * @category Instances
 */
export const brightWhite = brightFromOriginalColor(OriginalColors.White);

/**
 * Creates a color from the 8-bit color palette
 *
 * @since 0.0.4
 * @category Constructors
 */
export const fromPalette = (color: number): Type => ({ ...empty, color: Array.of(38, 5, color) });

/**
 * Creates a color from RGB
 *
 * @since 0.0.4
 * @category Constructors
 */
export const fromRGB = (red: number, green: number, blue: number): Type => ({
	...empty,
	color: Array.of(38, 2, red, green, blue)
});

/**
 * Returns a copy of self with the text color set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setSimpleColorFromOriginalColor =
	(color: OriginalColors) =>
	(self: Type): Type => ({ ...self, color: Array.of(40 + color) });

/**
 * Returns a copy of self with the text color set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setBrightColorFromOriginalColor =
	(color: OriginalColors) =>
	(self: Type): Type => ({ ...self, color: Array.of(100 + color) });

/**
 * Returns a copy of self with the text color set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setColorFromPalette =
	(color: number) =>
	(self: Type): Type => ({ ...self, color: Array.of(38, 5, color) });

/**
 * Returns a copy of self with the text color set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setColorFromRGB =
	(red: number, green: number, blue: number) =>
	(self: Type): Type => ({ ...self, color: Array.of(38, 2, red, green, blue) });

/**
 * Returns a copy of self with the text color unset
 *
 * @since 0.0.4
 * @category Utils
 */
export const unsetColor = (self: Type): Type => ({ ...self, color: [] });

/**
 * Returns a copy of self with the background color set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setSimpleBgColorFromOriginalColor =
	(color: OriginalColors) =>
	(self: Type): Type => ({ ...self, bgColor: Array.of(40 + color) });

/**
 * Returns a copy of self with the background color set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setBrightBgColorFromOriginalColor =
	(color: OriginalColors) =>
	(self: Type): Type => ({ ...self, bgColor: Array.of(100 + color) });

/**
 * Returns a copy of self with the background color set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setBgColorFromPalette =
	(color: number) =>
	(self: Type): Type => ({ ...self, bgColor: Array.of(38, 5, color) });

/**
 * Returns a copy of self with the background color set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setBgColorFromRGB =
	(red: number, green: number, blue: number) =>
	(self: Type): Type => ({ ...self, bgColor: Array.of(38, 2, red, green, blue) });

/**
 * Returns a copy of self with the background color unset
 *
 * @since 0.0.4
 * @category Utils
 */
export const unsetBgColor = (self: Type): Type => ({ ...self, bgColor: [] });

/**
 * Returns a copy of self with the bold flag set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setBold = (self: Type): Type => ({ ...self, isBold: true });

/**
 * Returns a copy of self with the underline flag set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setUnderline = (self: Type): Type => ({ ...self, isUnderline: true });

/**
 * Returns a copy of self with the blink flag set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setBlink = (self: Type): Type => ({ ...self, isBlink: true });

/**
 * Returns a copy of self with the framed flag set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setFramed = (self: Type): Type => ({ ...self, isFramed: true });

/**
 * Returns a copy of self with the encircled flag set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setEncircled = (self: Type): Type => ({ ...self, isEncircled: true });

/**
 * Returns a copy of self with the overlined flag set
 *
 * @since 0.0.4
 * @category Utils
 */
export const setOverlined = (self: Type): Type => ({ ...self, isOverlined: true });

/**
 * Returns a copy of self with the bold flag unset
 *
 * @since 0.0.4
 * @category Utils
 */
export const unsetBold = (self: Type): Type => ({ ...self, isBold: false });

/**
 * Returns a copy of self with the underline flag unset
 *
 * @since 0.0.4
 * @category Utils
 */
export const unsetUnderline = (self: Type): Type => ({ ...self, isUnderline: false });

/**
 * Returns a copy of self with the blink flag unset
 *
 * @since 0.0.4
 * @category Utils
 */
export const unsetBlink = (self: Type): Type => ({ ...self, isBlink: false });

/**
 * Returns a copy of self with the framed flag unset
 *
 * @since 0.0.4
 * @category Utils
 */
export const unsetFramed = (self: Type): Type => ({ ...self, isFramed: false });

/**
 * Returns a copy of self with the encircled flag unset
 *
 * @since 0.0.4
 * @category Utils
 */
export const unsetEncircled = (self: Type): Type => ({ ...self, isEncircled: false });

/**
 * Returns a copy of self with the overlined flag unset
 *
 * @since 0.0.4
 * @category Utils
 */
export const unsetOverlined = (self: Type): Type => ({ ...self, isOverlined: false });

/**
 * Applies the color to a string `s` passed as argument
 *
 * @since 0.0.4
 * @category Destructors
 */
export const applyToString =
	(s: string) =>
	(self: Type): string => {
		const bold = self.isBold ? Array.of(1) : [];
		const underline = self.isUnderline ? Array.of(4) : [];
		const blink = self.isBlink ? Array.of(5) : [];
		const framed = self.isFramed ? Array.of(51) : [];
		const encircled = self.isEncircled ? Array.of(52) : [];
		const overlined = self.isOverlined ? Array.of(53) : [];
		const sequence = [
			...self.color,
			...self.bgColor,
			...bold,
			...underline,
			...blink,
			...framed,
			...encircled,
			...overlined
		];
		return `\x1b[${sequence.join(';')}m${s}\x1b[0m`;
	};
