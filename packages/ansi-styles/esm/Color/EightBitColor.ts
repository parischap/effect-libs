/** This module defines EightBit colors */

import * as MDataEquivalenceBasedEquality from '@parischap/effect-lib/MDataEquivalenceBasedEquality'
import * as MTypes from '@parischap/effect-lib/MTypes'
import * as Array from 'effect/Array'
import * as Equivalence from 'effect/Equivalence'
import * as Hash from 'effect/Hash'
import * as Predicate from 'effect/Predicate'
import * as Struct from 'effect/Struct'
import * as ASEightBitColorCode from '../internal/Color/EightBitColorCode.js';
import * as ASColor from './index.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Color/EightBitColor/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * EightBit color Type
 *
 * @category Models
 */
export class Type extends ASColor.Type {
  /** Code of this color */
  readonly code: ASEightBitColorCode.Type;

  /** Class constructor */
  private constructor({ code }: { readonly code: ASEightBitColorCode.Type }) {
    super({
      foregroundId: `EightBit${ASEightBitColorCode.toString(code)}`,
      foregroundSequence: Array.make(38, 5, code),
    });
    this.code = code;
  }

  /** Static constructor */
  static make(params: { readonly code: ASEightBitColorCode.Type }): Type {
    return new Type(params);
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
    return Predicate.hasProperty(that, _TypeId);
  }

  /** Returns the TypeMarker of the class */
  protected get [_TypeId](): _TypeId {
    return _TypeId;
  }
}

/**
 * Equivalence
 *
 * @category Equivalences
 */
export const equivalence: Equivalence.Equivalence<Type> = (self, that) => self.code === that.code;

/**
 * Constructor
 *
 * @category Constructors
 */
export const make = (params: { readonly code: ASEightBitColorCode.Type }): Type =>
  Type.make(params);

/**
 * Gets the `code` property of `self`
 *
 * @category Destructors
 */
export const code: MTypes.OneArgFunction<Type, ASEightBitColorCode.Type> = Struct.get('code');

/**
 * Eightbit Black Color instance
 *
 * @category EightBit instances
 */
export const black: Type = make({ code: ASEightBitColorCode.Type.Black });
/**
 * Eightbit Maroon Color instance
 *
 * @category EightBit instances
 */
export const maroon: Type = make({ code: ASEightBitColorCode.Type.Maroon });
/**
 * Eightbit Green Color instance
 *
 * @category EightBit instances
 */
export const green: Type = make({ code: ASEightBitColorCode.Type.Green });
/**
 * Eightbit Olive Color instance
 *
 * @category EightBit instances
 */
export const olive: Type = make({ code: ASEightBitColorCode.Type.Olive });
/**
 * Eightbit Navy Color instance
 *
 * @category EightBit instances
 */
export const navy: Type = make({ code: ASEightBitColorCode.Type.Navy });
/**
 * Eightbit Purple_1 Color instance
 *
 * @category EightBit instances
 */
export const purple_1: Type = make({ code: ASEightBitColorCode.Type.Purple_1 });
/**
 * Eightbit Teal Color instance
 *
 * @category EightBit instances
 */
export const teal: Type = make({ code: ASEightBitColorCode.Type.Teal });
/**
 * Eightbit Silver Color instance
 *
 * @category EightBit instances
 */
export const silver: Type = make({ code: ASEightBitColorCode.Type.Silver });
/**
 * Eightbit Grey Color instance
 *
 * @category EightBit instances
 */
export const grey: Type = make({ code: ASEightBitColorCode.Type.Grey });
/**
 * Eightbit Red Color instance
 *
 * @category EightBit instances
 */
export const red: Type = make({ code: ASEightBitColorCode.Type.Red });
/**
 * Eightbit Lime Color instance
 *
 * @category EightBit instances
 */
export const lime: Type = make({ code: ASEightBitColorCode.Type.Lime });
/**
 * Eightbit Yellow Color instance
 *
 * @category EightBit instances
 */
export const yellow: Type = make({ code: ASEightBitColorCode.Type.Yellow });
/**
 * Eightbit Blue Color instance
 *
 * @category EightBit instances
 */
export const blue: Type = make({ code: ASEightBitColorCode.Type.Blue });
/**
 * Eightbit Fuchsia Color instance
 *
 * @category EightBit instances
 */
export const fuchsia: Type = make({ code: ASEightBitColorCode.Type.Fuchsia });
/**
 * Eightbit Aqua Color instance
 *
 * @category EightBit instances
 */
export const aqua: Type = make({ code: ASEightBitColorCode.Type.Aqua });
/**
 * Eightbit White Color instance
 *
 * @category EightBit instances
 */
export const white: Type = make({ code: ASEightBitColorCode.Type.White });
/**
 * Eightbit Grey0 Color instance
 *
 * @category EightBit instances
 */
export const grey0: Type = make({ code: ASEightBitColorCode.Type.Grey0 });
/**
 * Eightbit NavyBlue Color instance
 *
 * @category EightBit instances
 */
export const navyBlue: Type = make({ code: ASEightBitColorCode.Type.NavyBlue });
/**
 * Eightbit DarkBlue Color instance
 *
 * @category EightBit instances
 */
export const darkBlue: Type = make({ code: ASEightBitColorCode.Type.DarkBlue });
/**
 * Eightbit Blue3_1 Color instance
 *
 * @category EightBit instances
 */
export const blue3_1: Type = make({ code: ASEightBitColorCode.Type.Blue3_1 });
/**
 * Eightbit Blue3_2 Color instance
 *
 * @category EightBit instances
 */
export const blue3_2: Type = make({ code: ASEightBitColorCode.Type.Blue3_2 });
/**
 * Eightbit Blue1 Color instance
 *
 * @category EightBit instances
 */
export const blue1: Type = make({ code: ASEightBitColorCode.Type.Blue1 });
/**
 * Eightbit DarkGreen Color instance
 *
 * @category EightBit instances
 */
export const darkGreen: Type = make({
  code: ASEightBitColorCode.Type.DarkGreen,
});
/**
 * Eightbit DeepSkyBlue4_1 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue4_1: Type = make({
  code: ASEightBitColorCode.Type.DeepSkyBlue4_1,
});
/**
 * Eightbit DeepSkyBlue4_2 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue4_2: Type = make({
  code: ASEightBitColorCode.Type.DeepSkyBlue4_2,
});
/**
 * Eightbit DeepSkyBlue4_3 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue4_3: Type = make({
  code: ASEightBitColorCode.Type.DeepSkyBlue4_3,
});
/**
 * Eightbit DodgerBlue3 Color instance
 *
 * @category EightBit instances
 */
export const dodgerBlue3: Type = make({
  code: ASEightBitColorCode.Type.DodgerBlue3,
});
/**
 * Eightbit DodgerBlue2 Color instance
 *
 * @category EightBit instances
 */
export const dodgerBlue2: Type = make({
  code: ASEightBitColorCode.Type.DodgerBlue2,
});
/**
 * Eightbit Green4 Color instance
 *
 * @category EightBit instances
 */
export const green4: Type = make({ code: ASEightBitColorCode.Type.Green4 });
/**
 * Eightbit SpringGreen4 Color instance
 *
 * @category EightBit instances
 */
export const springGreen4: Type = make({
  code: ASEightBitColorCode.Type.SpringGreen4,
});
/**
 * Eightbit Turquoise4 Color instance
 *
 * @category EightBit instances
 */
export const turquoise4: Type = make({
  code: ASEightBitColorCode.Type.Turquoise4,
});
/**
 * Eightbit DeepSkyBlue3_1 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue3_1: Type = make({
  code: ASEightBitColorCode.Type.DeepSkyBlue3_1,
});
/**
 * Eightbit DeepSkyBlue3_2 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue3_2: Type = make({
  code: ASEightBitColorCode.Type.DeepSkyBlue3_2,
});
/**
 * Eightbit DodgerBlue1 Color instance
 *
 * @category EightBit instances
 */
export const dodgerBlue1: Type = make({
  code: ASEightBitColorCode.Type.DodgerBlue1,
});
/**
 * Eightbit Green3_1 Color instance
 *
 * @category EightBit instances
 */
export const green3_1: Type = make({ code: ASEightBitColorCode.Type.Green3_1 });
/**
 * Eightbit SpringGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const springGreen3_1: Type = make({
  code: ASEightBitColorCode.Type.SpringGreen3_1,
});
/**
 * Eightbit DarkCyan Color instance
 *
 * @category EightBit instances
 */
export const darkCyan: Type = make({ code: ASEightBitColorCode.Type.DarkCyan });
/**
 * Eightbit LightSeaGreen Color instance
 *
 * @category EightBit instances
 */
export const lightSeaGreen: Type = make({
  code: ASEightBitColorCode.Type.LightSeaGreen,
});
/**
 * Eightbit DeepSkyBlue2 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue2: Type = make({
  code: ASEightBitColorCode.Type.DeepSkyBlue2,
});
/**
 * Eightbit DeepSkyBlue1 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue1: Type = make({
  code: ASEightBitColorCode.Type.DeepSkyBlue1,
});
/**
 * Eightbit Green3_2 Color instance
 *
 * @category EightBit instances
 */
export const green3_2: Type = make({ code: ASEightBitColorCode.Type.Green3_2 });
/**
 * Eightbit SpringGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const springGreen3_2: Type = make({
  code: ASEightBitColorCode.Type.SpringGreen3_2,
});
/**
 * Eightbit SpringGreen2_1 Color instance
 *
 * @category EightBit instances
 */
export const springGreen2_1: Type = make({
  code: ASEightBitColorCode.Type.SpringGreen2_1,
});
/**
 * Eightbit Cyan3 Color instance
 *
 * @category EightBit instances
 */
export const cyan3: Type = make({ code: ASEightBitColorCode.Type.Cyan3 });
/**
 * Eightbit DarkTurquoise Color instance
 *
 * @category EightBit instances
 */
export const darkTurquoise: Type = make({
  code: ASEightBitColorCode.Type.DarkTurquoise,
});
/**
 * Eightbit Turquoise2 Color instance
 *
 * @category EightBit instances
 */
export const turquoise2: Type = make({
  code: ASEightBitColorCode.Type.Turquoise2,
});
/**
 * Eightbit Green1 Color instance
 *
 * @category EightBit instances
 */
export const green1: Type = make({ code: ASEightBitColorCode.Type.Green1 });
/**
 * Eightbit SpringGreen2_2 Color instance
 *
 * @category EightBit instances
 */
export const springGreen2_2: Type = make({
  code: ASEightBitColorCode.Type.SpringGreen2_2,
});
/**
 * Eightbit SpringGreen1 Color instance
 *
 * @category EightBit instances
 */
export const springGreen1: Type = make({
  code: ASEightBitColorCode.Type.SpringGreen1,
});
/**
 * Eightbit MediumSpringGreen Color instance
 *
 * @category EightBit instances
 */
export const mediumSpringGreen: Type = make({
  code: ASEightBitColorCode.Type.MediumSpringGreen,
});
/**
 * Eightbit Cyan2 Color instance
 *
 * @category EightBit instances
 */
export const cyan2: Type = make({ code: ASEightBitColorCode.Type.Cyan2 });
/**
 * Eightbit Cyan1 Color instance
 *
 * @category EightBit instances
 */
export const cyan1: Type = make({ code: ASEightBitColorCode.Type.Cyan1 });
/**
 * Eightbit DarkRed_1 Color instance
 *
 * @category EightBit instances
 */
export const darkRed_1: Type = make({
  code: ASEightBitColorCode.Type.DarkRed_1,
});
/**
 * Eightbit DeepPink4_1 Color instance
 *
 * @category EightBit instances
 */
export const deepPink4_1: Type = make({
  code: ASEightBitColorCode.Type.DeepPink4_1,
});
/**
 * Eightbit Purple4_1 Color instance
 *
 * @category EightBit instances
 */
export const purple4_1: Type = make({
  code: ASEightBitColorCode.Type.Purple4_1,
});
/**
 * Eightbit Purple4_2 Color instance
 *
 * @category EightBit instances
 */
export const purple4_2: Type = make({
  code: ASEightBitColorCode.Type.Purple4_2,
});
/**
 * Eightbit Purple3 Color instance
 *
 * @category EightBit instances
 */
export const purple3: Type = make({ code: ASEightBitColorCode.Type.Purple3 });
/**
 * Eightbit BlueViolet Color instance
 *
 * @category EightBit instances
 */
export const blueViolet: Type = make({
  code: ASEightBitColorCode.Type.BlueViolet,
});
/**
 * Eightbit Orange4_1 Color instance
 *
 * @category EightBit instances
 */
export const orange4_1: Type = make({
  code: ASEightBitColorCode.Type.Orange4_1,
});
/**
 * Eightbit Grey37 Color instance
 *
 * @category EightBit instances
 */
export const grey37: Type = make({ code: ASEightBitColorCode.Type.Grey37 });
/**
 * Eightbit MediumPurple4 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple4: Type = make({
  code: ASEightBitColorCode.Type.MediumPurple4,
});
/**
 * Eightbit SlateBlue3_1 Color instance
 *
 * @category EightBit instances
 */
export const slateBlue3_1: Type = make({
  code: ASEightBitColorCode.Type.SlateBlue3_1,
});
/**
 * Eightbit SlateBlue3_2 Color instance
 *
 * @category EightBit instances
 */
export const slateBlue3_2: Type = make({
  code: ASEightBitColorCode.Type.SlateBlue3_2,
});
/**
 * Eightbit RoyalBlue1 Color instance
 *
 * @category EightBit instances
 */
export const royalBlue1: Type = make({
  code: ASEightBitColorCode.Type.RoyalBlue1,
});
/**
 * Eightbit Chartreuse4 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse4: Type = make({
  code: ASEightBitColorCode.Type.Chartreuse4,
});
/**
 * Eightbit DarkSeaGreen4_1 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen4_1: Type = make({
  code: ASEightBitColorCode.Type.DarkSeaGreen4_1,
});
/**
 * Eightbit PaleTurquoise4 Color instance
 *
 * @category EightBit instances
 */
export const paleTurquoise4: Type = make({
  code: ASEightBitColorCode.Type.PaleTurquoise4,
});
/**
 * Eightbit SteelBlue Color instance
 *
 * @category EightBit instances
 */
export const steelBlue: Type = make({
  code: ASEightBitColorCode.Type.SteelBlue,
});
/**
 * Eightbit SteelBlue3 Color instance
 *
 * @category EightBit instances
 */
export const steelBlue3: Type = make({
  code: ASEightBitColorCode.Type.SteelBlue3,
});
/**
 * Eightbit CornflowerBlue Color instance
 *
 * @category EightBit instances
 */
export const cornflowerBlue: Type = make({
  code: ASEightBitColorCode.Type.CornflowerBlue,
});
/**
 * Eightbit Chartreuse3_1 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse3_1: Type = make({
  code: ASEightBitColorCode.Type.Chartreuse3_1,
});
/**
 * Eightbit DarkSeaGreen4_2 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen4_2: Type = make({
  code: ASEightBitColorCode.Type.DarkSeaGreen4_2,
});
/**
 * Eightbit CadetBlue_1 Color instance
 *
 * @category EightBit instances
 */
export const cadetBlue_1: Type = make({
  code: ASEightBitColorCode.Type.CadetBlue_1,
});
/**
 * Eightbit CadetBlue_2 Color instance
 *
 * @category EightBit instances
 */
export const cadetBlue_2: Type = make({
  code: ASEightBitColorCode.Type.CadetBlue_2,
});
/**
 * Eightbit SkyBlue3 Color instance
 *
 * @category EightBit instances
 */
export const skyBlue3: Type = make({ code: ASEightBitColorCode.Type.SkyBlue3 });
/**
 * Eightbit SteelBlue1_1 Color instance
 *
 * @category EightBit instances
 */
export const steelBlue1_1: Type = make({
  code: ASEightBitColorCode.Type.SteelBlue1_1,
});
/**
 * Eightbit Chartreuse3_2 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse3_2: Type = make({
  code: ASEightBitColorCode.Type.Chartreuse3_2,
});
/**
 * Eightbit PaleGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const paleGreen3_1: Type = make({
  code: ASEightBitColorCode.Type.PaleGreen3_1,
});
/**
 * Eightbit SeaGreen3 Color instance
 *
 * @category EightBit instances
 */
export const seaGreen3: Type = make({
  code: ASEightBitColorCode.Type.SeaGreen3,
});
/**
 * Eightbit Aquamarine3 Color instance
 *
 * @category EightBit instances
 */
export const aquamarine3: Type = make({
  code: ASEightBitColorCode.Type.Aquamarine3,
});
/**
 * Eightbit MediumTurquoise Color instance
 *
 * @category EightBit instances
 */
export const mediumTurquoise: Type = make({
  code: ASEightBitColorCode.Type.MediumTurquoise,
});
/**
 * Eightbit SteelBlue1_2 Color instance
 *
 * @category EightBit instances
 */
export const steelBlue1_2: Type = make({
  code: ASEightBitColorCode.Type.SteelBlue1_2,
});
/**
 * Eightbit Chartreuse2_1 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse2_1: Type = make({
  code: ASEightBitColorCode.Type.Chartreuse2_1,
});
/**
 * Eightbit SeaGreen2 Color instance
 *
 * @category EightBit instances
 */
export const seaGreen2: Type = make({
  code: ASEightBitColorCode.Type.SeaGreen2,
});
/**
 * Eightbit SeaGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const seaGreen1_1: Type = make({
  code: ASEightBitColorCode.Type.SeaGreen1_1,
});
/**
 * Eightbit SeaGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const seaGreen1_2: Type = make({
  code: ASEightBitColorCode.Type.SeaGreen1_2,
});
/**
 * Eightbit Aquamarine1_1 Color instance
 *
 * @category EightBit instances
 */
export const aquamarine1_1: Type = make({
  code: ASEightBitColorCode.Type.Aquamarine1_1,
});
/**
 * Eightbit DarkSlateGray2 Color instance
 *
 * @category EightBit instances
 */
export const darkSlateGray2: Type = make({
  code: ASEightBitColorCode.Type.DarkSlateGray2,
});
/**
 * Eightbit DarkRed_2 Color instance
 *
 * @category EightBit instances
 */
export const darkRed_2: Type = make({
  code: ASEightBitColorCode.Type.DarkRed_2,
});
/**
 * Eightbit DeepPink4_2 Color instance
 *
 * @category EightBit instances
 */
export const deepPink4_2: Type = make({
  code: ASEightBitColorCode.Type.DeepPink4_2,
});
/**
 * Eightbit DarkMagenta_1 Color instance
 *
 * @category EightBit instances
 */
export const darkMagenta_1: Type = make({
  code: ASEightBitColorCode.Type.DarkMagenta_1,
});
/**
 * Eightbit DarkMagenta_2 Color instance
 *
 * @category EightBit instances
 */
export const darkMagenta_2: Type = make({
  code: ASEightBitColorCode.Type.DarkMagenta_2,
});
/**
 * Eightbit DarkViolet_1 Color instance
 *
 * @category EightBit instances
 */
export const darkViolet_1: Type = make({
  code: ASEightBitColorCode.Type.DarkViolet_1,
});
/**
 * Eightbit Purple_2 Color instance
 *
 * @category EightBit instances
 */
export const purple_2: Type = make({ code: ASEightBitColorCode.Type.Purple_2 });
/**
 * Eightbit Orange4_2 Color instance
 *
 * @category EightBit instances
 */
export const orange4_2: Type = make({
  code: ASEightBitColorCode.Type.Orange4_2,
});
/**
 * Eightbit LightPink4 Color instance
 *
 * @category EightBit instances
 */
export const lightPink4: Type = make({
  code: ASEightBitColorCode.Type.LightPink4,
});
/**
 * Eightbit Plum4 Color instance
 *
 * @category EightBit instances
 */
export const plum4: Type = make({ code: ASEightBitColorCode.Type.Plum4 });
/**
 * Eightbit MediumPurple3_1 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple3_1: Type = make({
  code: ASEightBitColorCode.Type.MediumPurple3_1,
});
/**
 * Eightbit MediumPurple3_2 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple3_2: Type = make({
  code: ASEightBitColorCode.Type.MediumPurple3_2,
});
/**
 * Eightbit SlateBlue1 Color instance
 *
 * @category EightBit instances
 */
export const slateBlue1: Type = make({
  code: ASEightBitColorCode.Type.SlateBlue1,
});
/**
 * Eightbit Yellow4_1 Color instance
 *
 * @category EightBit instances
 */
export const yellow4_1: Type = make({
  code: ASEightBitColorCode.Type.Yellow4_1,
});
/**
 * Eightbit Wheat4 Color instance
 *
 * @category EightBit instances
 */
export const wheat4: Type = make({ code: ASEightBitColorCode.Type.Wheat4 });
/**
 * Eightbit Grey53 Color instance
 *
 * @category EightBit instances
 */
export const grey53: Type = make({ code: ASEightBitColorCode.Type.Grey53 });
/**
 * Eightbit LightSlateGrey Color instance
 *
 * @category EightBit instances
 */
export const lightSlateGrey: Type = make({
  code: ASEightBitColorCode.Type.LightSlateGrey,
});
/**
 * Eightbit MediumPurple Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple: Type = make({
  code: ASEightBitColorCode.Type.MediumPurple,
});
/**
 * Eightbit LightSlateBlue Color instance
 *
 * @category EightBit instances
 */
export const lightSlateBlue: Type = make({
  code: ASEightBitColorCode.Type.LightSlateBlue,
});
/**
 * Eightbit Yellow4_2 Color instance
 *
 * @category EightBit instances
 */
export const yellow4_2: Type = make({
  code: ASEightBitColorCode.Type.Yellow4_2,
});
/**
 * Eightbit DarkOliveGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen3_1: Type = make({
  code: ASEightBitColorCode.Type.DarkOliveGreen3_1,
});
/**
 * Eightbit DarkSeaGreen Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen: Type = make({
  code: ASEightBitColorCode.Type.DarkSeaGreen,
});
/**
 * Eightbit LightSkyBlue3_1 Color instance
 *
 * @category EightBit instances
 */
export const lightSkyBlue3_1: Type = make({
  code: ASEightBitColorCode.Type.LightSkyBlue3_1,
});
/**
 * Eightbit LightSkyBlue3_2 Color instance
 *
 * @category EightBit instances
 */
export const lightSkyBlue3_2: Type = make({
  code: ASEightBitColorCode.Type.LightSkyBlue3_2,
});
/**
 * Eightbit SkyBlue2 Color instance
 *
 * @category EightBit instances
 */
export const skyBlue2: Type = make({ code: ASEightBitColorCode.Type.SkyBlue2 });
/**
 * Eightbit Chartreuse2_2 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse2_2: Type = make({
  code: ASEightBitColorCode.Type.Chartreuse2_2,
});
/**
 * Eightbit DarkOliveGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen3_2: Type = make({
  code: ASEightBitColorCode.Type.DarkOliveGreen3_2,
});
/**
 * Eightbit PaleGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const paleGreen3_2: Type = make({
  code: ASEightBitColorCode.Type.PaleGreen3_2,
});
/**
 * Eightbit DarkSeaGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen3_1: Type = make({
  code: ASEightBitColorCode.Type.DarkSeaGreen3_1,
});
/**
 * Eightbit DarkSlateGray3 Color instance
 *
 * @category EightBit instances
 */
export const darkSlateGray3: Type = make({
  code: ASEightBitColorCode.Type.DarkSlateGray3,
});
/**
 * Eightbit SkyBlue1 Color instance
 *
 * @category EightBit instances
 */
export const skyBlue1: Type = make({ code: ASEightBitColorCode.Type.SkyBlue1 });
/**
 * Eightbit Chartreuse1 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse1: Type = make({
  code: ASEightBitColorCode.Type.Chartreuse1,
});
/**
 * Eightbit LightGreen_1 Color instance
 *
 * @category EightBit instances
 */
export const lightGreen_1: Type = make({
  code: ASEightBitColorCode.Type.LightGreen_1,
});
/**
 * Eightbit LightGreen_2 Color instance
 *
 * @category EightBit instances
 */
export const lightGreen_2: Type = make({
  code: ASEightBitColorCode.Type.LightGreen_2,
});
/**
 * Eightbit PaleGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const paleGreen1_1: Type = make({
  code: ASEightBitColorCode.Type.PaleGreen1_1,
});
/**
 * Eightbit Aquamarine1_2 Color instance
 *
 * @category EightBit instances
 */
export const aquamarine1_2: Type = make({
  code: ASEightBitColorCode.Type.Aquamarine1_2,
});
/**
 * Eightbit DarkSlateGray1 Color instance
 *
 * @category EightBit instances
 */
export const darkSlateGray1: Type = make({
  code: ASEightBitColorCode.Type.DarkSlateGray1,
});
/**
 * Eightbit Red3_1 Color instance
 *
 * @category EightBit instances
 */
export const red3_1: Type = make({ code: ASEightBitColorCode.Type.Red3_1 });
/**
 * Eightbit DeepPink4_3 Color instance
 *
 * @category EightBit instances
 */
export const deepPink4_3: Type = make({
  code: ASEightBitColorCode.Type.DeepPink4_3,
});
/**
 * Eightbit MediumVioletRed Color instance
 *
 * @category EightBit instances
 */
export const mediumVioletRed: Type = make({
  code: ASEightBitColorCode.Type.MediumVioletRed,
});
/**
 * Eightbit Magenta3_1 Color instance
 *
 * @category EightBit instances
 */
export const magenta3_1: Type = make({
  code: ASEightBitColorCode.Type.Magenta3_1,
});
/**
 * Eightbit DarkViolet_2 Color instance
 *
 * @category EightBit instances
 */
export const darkViolet_2: Type = make({
  code: ASEightBitColorCode.Type.DarkViolet_2,
});
/**
 * Eightbit Purple_3 Color instance
 *
 * @category EightBit instances
 */
export const purple_3: Type = make({ code: ASEightBitColorCode.Type.Purple_3 });
/**
 * Eightbit DarkOrange3_1 Color instance
 *
 * @category EightBit instances
 */
export const darkOrange3_1: Type = make({
  code: ASEightBitColorCode.Type.DarkOrange3_1,
});
/**
 * Eightbit IndianRed_1 Color instance
 *
 * @category EightBit instances
 */
export const indianRed_1: Type = make({
  code: ASEightBitColorCode.Type.IndianRed_1,
});
/**
 * Eightbit HotPink3_1 Color instance
 *
 * @category EightBit instances
 */
export const hotPink3_1: Type = make({
  code: ASEightBitColorCode.Type.HotPink3_1,
});
/**
 * Eightbit MediumOrchid3 Color instance
 *
 * @category EightBit instances
 */
export const mediumOrchid3: Type = make({
  code: ASEightBitColorCode.Type.MediumOrchid3,
});
/**
 * Eightbit MediumOrchid Color instance
 *
 * @category EightBit instances
 */
export const mediumOrchid: Type = make({
  code: ASEightBitColorCode.Type.MediumOrchid,
});
/**
 * Eightbit MediumPurple2_1 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple2_1: Type = make({
  code: ASEightBitColorCode.Type.MediumPurple2_1,
});
/**
 * Eightbit DarkGoldenRod Color instance
 *
 * @category EightBit instances
 */
export const darkGoldenRod: Type = make({
  code: ASEightBitColorCode.Type.DarkGoldenRod,
});
/**
 * Eightbit LightSalmon3_1 Color instance
 *
 * @category EightBit instances
 */
export const lightSalmon3_1: Type = make({
  code: ASEightBitColorCode.Type.LightSalmon3_1,
});
/**
 * Eightbit RosyBrown Color instance
 *
 * @category EightBit instances
 */
export const rosyBrown: Type = make({
  code: ASEightBitColorCode.Type.RosyBrown,
});
/**
 * Eightbit Grey63 Color instance
 *
 * @category EightBit instances
 */
export const grey63: Type = make({ code: ASEightBitColorCode.Type.Grey63 });
/**
 * Eightbit MediumPurple2_2 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple2_2: Type = make({
  code: ASEightBitColorCode.Type.MediumPurple2_2,
});
/**
 * Eightbit MediumPurple1 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple1: Type = make({
  code: ASEightBitColorCode.Type.MediumPurple1,
});
/**
 * Eightbit Gold3_1 Color instance
 *
 * @category EightBit instances
 */
export const gold3_1: Type = make({ code: ASEightBitColorCode.Type.Gold3_1 });
/**
 * Eightbit DarkKhaki Color instance
 *
 * @category EightBit instances
 */
export const darkKhaki: Type = make({
  code: ASEightBitColorCode.Type.DarkKhaki,
});
/**
 * Eightbit NavajoWhite3 Color instance
 *
 * @category EightBit instances
 */
export const navajoWhite3: Type = make({
  code: ASEightBitColorCode.Type.NavajoWhite3,
});
/**
 * Eightbit Grey69 Color instance
 *
 * @category EightBit instances
 */
export const grey69: Type = make({ code: ASEightBitColorCode.Type.Grey69 });
/**
 * Eightbit LightSteelBlue3 Color instance
 *
 * @category EightBit instances
 */
export const lightSteelBlue3: Type = make({
  code: ASEightBitColorCode.Type.LightSteelBlue3,
});
/**
 * Eightbit LightSteelBlue Color instance
 *
 * @category EightBit instances
 */
export const lightSteelBlue: Type = make({
  code: ASEightBitColorCode.Type.LightSteelBlue,
});
/**
 * Eightbit Yellow3_1 Color instance
 *
 * @category EightBit instances
 */
export const yellow3_1: Type = make({
  code: ASEightBitColorCode.Type.Yellow3_1,
});
/**
 * Eightbit DarkOliveGreen3_3 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen3_3: Type = make({
  code: ASEightBitColorCode.Type.DarkOliveGreen3_3,
});
/**
 * Eightbit DarkSeaGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen3_2: Type = make({
  code: ASEightBitColorCode.Type.DarkSeaGreen3_2,
});
/**
 * Eightbit DarkSeaGreen2_1 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen2_1: Type = make({
  code: ASEightBitColorCode.Type.DarkSeaGreen2_1,
});
/**
 * Eightbit LightCyan3 Color instance
 *
 * @category EightBit instances
 */
export const lightCyan3: Type = make({
  code: ASEightBitColorCode.Type.LightCyan3,
});
/**
 * Eightbit LightSkyBlue1 Color instance
 *
 * @category EightBit instances
 */
export const lightSkyBlue1: Type = make({
  code: ASEightBitColorCode.Type.LightSkyBlue1,
});
/**
 * Eightbit GreenYellow Color instance
 *
 * @category EightBit instances
 */
export const greenYellow: Type = make({
  code: ASEightBitColorCode.Type.GreenYellow,
});
/**
 * Eightbit DarkOliveGreen2 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen2: Type = make({
  code: ASEightBitColorCode.Type.DarkOliveGreen2,
});
/**
 * Eightbit PaleGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const paleGreen1_2: Type = make({
  code: ASEightBitColorCode.Type.PaleGreen1_2,
});
/**
 * Eightbit DarkSeaGreen2_2 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen2_2: Type = make({
  code: ASEightBitColorCode.Type.DarkSeaGreen2_2,
});
/**
 * Eightbit DarkSeaGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen1_1: Type = make({
  code: ASEightBitColorCode.Type.DarkSeaGreen1_1,
});
/**
 * Eightbit PaleTurquoise1 Color instance
 *
 * @category EightBit instances
 */
export const paleTurquoise1: Type = make({
  code: ASEightBitColorCode.Type.PaleTurquoise1,
});
/**
 * Eightbit Red3_2 Color instance
 *
 * @category EightBit instances
 */
export const red3_2: Type = make({ code: ASEightBitColorCode.Type.Red3_2 });
/**
 * Eightbit DeepPink3_1 Color instance
 *
 * @category EightBit instances
 */
export const deepPink3_1: Type = make({
  code: ASEightBitColorCode.Type.DeepPink3_1,
});
/**
 * Eightbit DeepPink3_2 Color instance
 *
 * @category EightBit instances
 */
export const deepPink3_2: Type = make({
  code: ASEightBitColorCode.Type.DeepPink3_2,
});
/**
 * Eightbit Magenta3_2 Color instance
 *
 * @category EightBit instances
 */
export const magenta3_2: Type = make({
  code: ASEightBitColorCode.Type.Magenta3_2,
});
/**
 * Eightbit Magenta3_3 Color instance
 *
 * @category EightBit instances
 */
export const magenta3_3: Type = make({
  code: ASEightBitColorCode.Type.Magenta3_3,
});
/**
 * Eightbit Magenta2_1 Color instance
 *
 * @category EightBit instances
 */
export const magenta2_1: Type = make({
  code: ASEightBitColorCode.Type.Magenta2_1,
});
/**
 * Eightbit DarkOrange3_2 Color instance
 *
 * @category EightBit instances
 */
export const darkOrange3_2: Type = make({
  code: ASEightBitColorCode.Type.DarkOrange3_2,
});
/**
 * Eightbit IndianRed_2 Color instance
 *
 * @category EightBit instances
 */
export const indianRed_2: Type = make({
  code: ASEightBitColorCode.Type.IndianRed_2,
});
/**
 * Eightbit HotPink3_2 Color instance
 *
 * @category EightBit instances
 */
export const hotPink3_2: Type = make({
  code: ASEightBitColorCode.Type.HotPink3_2,
});
/**
 * Eightbit HotPink2 Color instance
 *
 * @category EightBit instances
 */
export const hotPink2: Type = make({ code: ASEightBitColorCode.Type.HotPink2 });
/**
 * Eightbit Orchid Color instance
 *
 * @category EightBit instances
 */
export const orchid: Type = make({ code: ASEightBitColorCode.Type.Orchid });
/**
 * Eightbit MediumOrchid1_1 Color instance
 *
 * @category EightBit instances
 */
export const mediumOrchid1_1: Type = make({
  code: ASEightBitColorCode.Type.MediumOrchid1_1,
});
/**
 * Eightbit Orange3 Color instance
 *
 * @category EightBit instances
 */
export const orange3: Type = make({ code: ASEightBitColorCode.Type.Orange3 });
/**
 * Eightbit LightSalmon3_2 Color instance
 *
 * @category EightBit instances
 */
export const lightSalmon3_2: Type = make({
  code: ASEightBitColorCode.Type.LightSalmon3_2,
});
/**
 * Eightbit LightPink3 Color instance
 *
 * @category EightBit instances
 */
export const lightPink3: Type = make({
  code: ASEightBitColorCode.Type.LightPink3,
});
/**
 * Eightbit Pink3 Color instance
 *
 * @category EightBit instances
 */
export const pink3: Type = make({ code: ASEightBitColorCode.Type.Pink3 });
/**
 * Eightbit Plum3 Color instance
 *
 * @category EightBit instances
 */
export const plum3: Type = make({ code: ASEightBitColorCode.Type.Plum3 });
/**
 * Eightbit Violet Color instance
 *
 * @category EightBit instances
 */
export const violet: Type = make({ code: ASEightBitColorCode.Type.Violet });
/**
 * Eightbit Gold3_2 Color instance
 *
 * @category EightBit instances
 */
export const gold3_2: Type = make({ code: ASEightBitColorCode.Type.Gold3_2 });
/**
 * Eightbit LightGoldenRod3 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod3: Type = make({
  code: ASEightBitColorCode.Type.LightGoldenRod3,
});
/**
 * Eightbit Tan Color instance
 *
 * @category EightBit instances
 */
export const tan: Type = make({ code: ASEightBitColorCode.Type.Tan });
/**
 * Eightbit MistyRose3 Color instance
 *
 * @category EightBit instances
 */
export const mistyRose3: Type = make({
  code: ASEightBitColorCode.Type.MistyRose3,
});
/**
 * Eightbit Thistle3 Color instance
 *
 * @category EightBit instances
 */
export const thistle3: Type = make({ code: ASEightBitColorCode.Type.Thistle3 });
/**
 * Eightbit Plum2 Color instance
 *
 * @category EightBit instances
 */
export const plum2: Type = make({ code: ASEightBitColorCode.Type.Plum2 });
/**
 * Eightbit Yellow3_2 Color instance
 *
 * @category EightBit instances
 */
export const yellow3_2: Type = make({
  code: ASEightBitColorCode.Type.Yellow3_2,
});
/**
 * Eightbit Khaki3 Color instance
 *
 * @category EightBit instances
 */
export const khaki3: Type = make({ code: ASEightBitColorCode.Type.Khaki3 });
/**
 * Eightbit LightGoldenRod2_1 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod2_1: Type = make({
  code: ASEightBitColorCode.Type.LightGoldenRod2_1,
});
/**
 * Eightbit LightYellow3 Color instance
 *
 * @category EightBit instances
 */
export const lightYellow3: Type = make({
  code: ASEightBitColorCode.Type.LightYellow3,
});
/**
 * Eightbit Grey84 Color instance
 *
 * @category EightBit instances
 */
export const grey84: Type = make({ code: ASEightBitColorCode.Type.Grey84 });
/**
 * Eightbit LightSteelBlue1 Color instance
 *
 * @category EightBit instances
 */
export const lightSteelBlue1: Type = make({
  code: ASEightBitColorCode.Type.LightSteelBlue1,
});
/**
 * Eightbit Yellow2 Color instance
 *
 * @category EightBit instances
 */
export const yellow2: Type = make({ code: ASEightBitColorCode.Type.Yellow2 });
/**
 * Eightbit DarkOliveGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen1_1: Type = make({
  code: ASEightBitColorCode.Type.DarkOliveGreen1_1,
});
/**
 * Eightbit DarkOliveGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen1_2: Type = make({
  code: ASEightBitColorCode.Type.DarkOliveGreen1_2,
});
/**
 * Eightbit DarkSeaGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen1_2: Type = make({
  code: ASEightBitColorCode.Type.DarkSeaGreen1_2,
});
/**
 * Eightbit HoneyDew2 Color instance
 *
 * @category EightBit instances
 */
export const honeyDew2: Type = make({
  code: ASEightBitColorCode.Type.HoneyDew2,
});
/**
 * Eightbit LightCyan1 Color instance
 *
 * @category EightBit instances
 */
export const lightCyan1: Type = make({
  code: ASEightBitColorCode.Type.LightCyan1,
});
/**
 * Eightbit Red1 Color instance
 *
 * @category EightBit instances
 */
export const red1: Type = make({ code: ASEightBitColorCode.Type.Red1 });
/**
 * Eightbit DeepPink2 Color instance
 *
 * @category EightBit instances
 */
export const deepPink2: Type = make({
  code: ASEightBitColorCode.Type.DeepPink2,
});
/**
 * Eightbit DeepPink1_1 Color instance
 *
 * @category EightBit instances
 */
export const deepPink1_1: Type = make({
  code: ASEightBitColorCode.Type.DeepPink1_1,
});
/**
 * Eightbit DeepPink1_2 Color instance
 *
 * @category EightBit instances
 */
export const deepPink1_2: Type = make({
  code: ASEightBitColorCode.Type.DeepPink1_2,
});
/**
 * Eightbit Magenta2_2 Color instance
 *
 * @category EightBit instances
 */
export const magenta2_2: Type = make({
  code: ASEightBitColorCode.Type.Magenta2_2,
});
/**
 * Eightbit Magenta1 Color instance
 *
 * @category EightBit instances
 */
export const magenta1: Type = make({ code: ASEightBitColorCode.Type.Magenta1 });
/**
 * Eightbit OrangeRed1 Color instance
 *
 * @category EightBit instances
 */
export const orangeRed1: Type = make({
  code: ASEightBitColorCode.Type.OrangeRed1,
});
/**
 * Eightbit IndianRed1_1 Color instance
 *
 * @category EightBit instances
 */
export const indianRed1_1: Type = make({
  code: ASEightBitColorCode.Type.IndianRed1_1,
});
/**
 * Eightbit IndianRed1_2 Color instance
 *
 * @category EightBit instances
 */
export const indianRed1_2: Type = make({
  code: ASEightBitColorCode.Type.IndianRed1_2,
});
/**
 * Eightbit HotPink_1 Color instance
 *
 * @category EightBit instances
 */
export const hotPink_1: Type = make({
  code: ASEightBitColorCode.Type.HotPink_1,
});
/**
 * Eightbit HotPink_2 Color instance
 *
 * @category EightBit instances
 */
export const hotPink_2: Type = make({
  code: ASEightBitColorCode.Type.HotPink_2,
});
/**
 * Eightbit MediumOrchid1_2 Color instance
 *
 * @category EightBit instances
 */
export const mediumOrchid1_2: Type = make({
  code: ASEightBitColorCode.Type.MediumOrchid1_2,
});
/**
 * Eightbit DarkOrange Color instance
 *
 * @category EightBit instances
 */
export const darkOrange: Type = make({
  code: ASEightBitColorCode.Type.DarkOrange,
});
/**
 * Eightbit Salmon1 Color instance
 *
 * @category EightBit instances
 */
export const salmon1: Type = make({ code: ASEightBitColorCode.Type.Salmon1 });
/**
 * Eightbit LightCoral Color instance
 *
 * @category EightBit instances
 */
export const lightCoral: Type = make({
  code: ASEightBitColorCode.Type.LightCoral,
});
/**
 * Eightbit PaleVioletRed1 Color instance
 *
 * @category EightBit instances
 */
export const paleVioletRed1: Type = make({
  code: ASEightBitColorCode.Type.PaleVioletRed1,
});
/**
 * Eightbit Orchid2 Color instance
 *
 * @category EightBit instances
 */
export const orchid2: Type = make({ code: ASEightBitColorCode.Type.Orchid2 });
/**
 * Eightbit Orchid1 Color instance
 *
 * @category EightBit instances
 */
export const orchid1: Type = make({ code: ASEightBitColorCode.Type.Orchid1 });
/**
 * Eightbit Orange1 Color instance
 *
 * @category EightBit instances
 */
export const orange1: Type = make({ code: ASEightBitColorCode.Type.Orange1 });
/**
 * Eightbit SandyBrown Color instance
 *
 * @category EightBit instances
 */
export const sandyBrown: Type = make({
  code: ASEightBitColorCode.Type.SandyBrown,
});
/**
 * Eightbit LightSalmon1 Color instance
 *
 * @category EightBit instances
 */
export const lightSalmon1: Type = make({
  code: ASEightBitColorCode.Type.LightSalmon1,
});
/**
 * Eightbit LightPink1 Color instance
 *
 * @category EightBit instances
 */
export const lightPink1: Type = make({
  code: ASEightBitColorCode.Type.LightPink1,
});
/**
 * Eightbit Pink1 Color instance
 *
 * @category EightBit instances
 */
export const pink1: Type = make({ code: ASEightBitColorCode.Type.Pink1 });
/**
 * Eightbit Plum1 Color instance
 *
 * @category EightBit instances
 */
export const plum1: Type = make({ code: ASEightBitColorCode.Type.Plum1 });
/**
 * Eightbit Gold1 Color instance
 *
 * @category EightBit instances
 */
export const gold1: Type = make({ code: ASEightBitColorCode.Type.Gold1 });
/**
 * Eightbit LightGoldenRod2_2 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod2_2: Type = make({
  code: ASEightBitColorCode.Type.LightGoldenRod2_2,
});
/**
 * Eightbit LightGoldenRod2_3 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod2_3: Type = make({
  code: ASEightBitColorCode.Type.LightGoldenRod2_3,
});
/**
 * Eightbit NavajoWhite1 Color instance
 *
 * @category EightBit instances
 */
export const navajoWhite1: Type = make({
  code: ASEightBitColorCode.Type.NavajoWhite1,
});
/**
 * Eightbit MistyRose1 Color instance
 *
 * @category EightBit instances
 */
export const mistyRose1: Type = make({
  code: ASEightBitColorCode.Type.MistyRose1,
});
/**
 * Eightbit Thistle1 Color instance
 *
 * @category EightBit instances
 */
export const thistle1: Type = make({ code: ASEightBitColorCode.Type.Thistle1 });
/**
 * Eightbit Yellow1 Color instance
 *
 * @category EightBit instances
 */
export const yellow1: Type = make({ code: ASEightBitColorCode.Type.Yellow1 });
/**
 * Eightbit LightGoldenRod1 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod1: Type = make({
  code: ASEightBitColorCode.Type.LightGoldenRod1,
});
/**
 * Eightbit Khaki1 Color instance
 *
 * @category EightBit instances
 */
export const khaki1: Type = make({ code: ASEightBitColorCode.Type.Khaki1 });
/**
 * Eightbit Wheat1 Color instance
 *
 * @category EightBit instances
 */
export const wheat1: Type = make({ code: ASEightBitColorCode.Type.Wheat1 });
/**
 * Eightbit Cornsilk1 Color instance
 *
 * @category EightBit instances
 */
export const cornsilk1: Type = make({
  code: ASEightBitColorCode.Type.Cornsilk1,
});
/**
 * Eightbit Grey100 Color instance
 *
 * @category EightBit instances
 */
export const grey100: Type = make({ code: ASEightBitColorCode.Type.Grey100 });
/**
 * Eightbit Grey3 Color instance
 *
 * @category EightBit instances
 */
export const grey3: Type = make({ code: ASEightBitColorCode.Type.Grey3 });
/**
 * Eightbit Grey7 Color instance
 *
 * @category EightBit instances
 */
export const grey7: Type = make({ code: ASEightBitColorCode.Type.Grey7 });
/**
 * Eightbit Grey11 Color instance
 *
 * @category EightBit instances
 */
export const grey11: Type = make({ code: ASEightBitColorCode.Type.Grey11 });
/**
 * Eightbit Grey15 Color instance
 *
 * @category EightBit instances
 */
export const grey15: Type = make({ code: ASEightBitColorCode.Type.Grey15 });
/**
 * Eightbit Grey19 Color instance
 *
 * @category EightBit instances
 */
export const grey19: Type = make({ code: ASEightBitColorCode.Type.Grey19 });
/**
 * Eightbit Grey23 Color instance
 *
 * @category EightBit instances
 */
export const grey23: Type = make({ code: ASEightBitColorCode.Type.Grey23 });
/**
 * Eightbit Grey27 Color instance
 *
 * @category EightBit instances
 */
export const grey27: Type = make({ code: ASEightBitColorCode.Type.Grey27 });
/**
 * Eightbit Grey30 Color instance
 *
 * @category EightBit instances
 */
export const grey30: Type = make({ code: ASEightBitColorCode.Type.Grey30 });
/**
 * Eightbit Grey35 Color instance
 *
 * @category EightBit instances
 */
export const grey35: Type = make({ code: ASEightBitColorCode.Type.Grey35 });
/**
 * Eightbit Grey39 Color instance
 *
 * @category EightBit instances
 */
export const grey39: Type = make({ code: ASEightBitColorCode.Type.Grey39 });
/**
 * Eightbit Grey42 Color instance
 *
 * @category EightBit instances
 */
export const grey42: Type = make({ code: ASEightBitColorCode.Type.Grey42 });
/**
 * Eightbit Grey46 Color instance
 *
 * @category EightBit instances
 */
export const grey46: Type = make({ code: ASEightBitColorCode.Type.Grey46 });
/**
 * Eightbit Grey50 Color instance
 *
 * @category EightBit instances
 */
export const grey50: Type = make({ code: ASEightBitColorCode.Type.Grey50 });
/**
 * Eightbit Grey54 Color instance
 *
 * @category EightBit instances
 */
export const grey54: Type = make({ code: ASEightBitColorCode.Type.Grey54 });
/**
 * Eightbit Grey58 Color instance
 *
 * @category EightBit instances
 */
export const grey58: Type = make({ code: ASEightBitColorCode.Type.Grey58 });
/**
 * Eightbit Grey62 Color instance
 *
 * @category EightBit instances
 */
export const grey62: Type = make({ code: ASEightBitColorCode.Type.Grey62 });
/**
 * Eightbit Grey66 Color instance
 *
 * @category EightBit instances
 */
export const grey66: Type = make({ code: ASEightBitColorCode.Type.Grey66 });
/**
 * Eightbit Grey70 Color instance
 *
 * @category EightBit instances
 */
export const grey70: Type = make({ code: ASEightBitColorCode.Type.Grey70 });
/**
 * Eightbit Grey74 Color instance
 *
 * @category EightBit instances
 */
export const grey74: Type = make({ code: ASEightBitColorCode.Type.Grey74 });
/**
 * Eightbit Grey78 Color instance
 *
 * @category EightBit instances
 */
export const grey78: Type = make({ code: ASEightBitColorCode.Type.Grey78 });
/**
 * Eightbit Grey82 Color instance
 *
 * @category EightBit instances
 */
export const grey82: Type = make({ code: ASEightBitColorCode.Type.Grey82 });
/**
 * Eightbit Grey85 Color instance
 *
 * @category EightBit instances
 */
export const grey85: Type = make({ code: ASEightBitColorCode.Type.Grey85 });
/**
 * Eightbit Grey89 Color instance
 *
 * @category EightBit instances
 */
export const grey89: Type = make({ code: ASEightBitColorCode.Type.Grey89 });
/**
 * Eightbit Grey93 Color instance
 *
 * @category EightBit instances
 */
export const grey93: Type = make({ code: ASEightBitColorCode.Type.Grey93 });
