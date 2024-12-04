/**
 * This module implements an index that uniquely identifies each style characteristic supported by
 * this package
 *
 * @since 0.0.1
 */

/**
 * Type that represents a style characteristic.
 *
 * @since 0.0.1
 * @category Models
 */
//The order matters because style ids are created by concatenating the characteristicIds of each style characteristic in this order: `BoldRed` sounds better than `RedBold`. We left a gap before `FgColor` in case we want to add new style characteristics.
export enum Type {
	Intensity = 0,
	Italic = 1,
	Underlined = 2,
	StruckThrough = 3,
	Overlined = 4,
	Inversed = 5,
	Hidden = 6,
	Blink = 7,
	FgColor = 100,
	BgColor = 101
}
