/**
 * This module defines an RGB color
 *
 * You can use the RGB.make function to build more RGB colors
 */

import { MDataEquivalenceBasedEquality, MString } from '@parischap/effect-lib';
import { Array, Equivalence, Hash, Number, pipe, Predicate } from 'effect';
import * as ASColorBase from './Base.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Color/Rgb/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * RGB color Type
 *
 * @category Models
 */
export class Type extends ASColorBase.Type {
  /** Red part of this color */
  readonly red: number;

  /** Green part of this color */
  readonly green: number;

  /** Blue part of this color */
  readonly blue: number;

  /** Class constructor */
  private constructor({
    foregroundId,
    red,
    green,
    blue,
  }: {
    readonly foregroundId: string;
    readonly red: number;
    readonly green: number;
    readonly blue: number;
  }) {
    super({
      foregroundId,
      foregroundSequence: Array.make(38, 2, red, green, blue),
    });
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  /** Static constructor */
  static make(params: {
    readonly foregroundId: string;
    readonly red: number;
    readonly green: number;
    readonly blue: number;
  }): Type {
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
export const equivalence: Equivalence.Equivalence<Type> = (self, that) =>
  self.red === that.red && self.green === that.green && self.blue === that.blue;

/** Constructor of predefined RGB colors */
const makeShort = (foregroundId: string, red: number, green: number, blue: number): Type =>
  Type.make({ foregroundId: `Rgb${foregroundId}`, red, green, blue });

/**
 * Constructor
 *
 * @category Construtors
 */
export const make = ({
  red,
  green,
  blue,
}: {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
}): Type =>
  makeShort(
    `${MString.fromNumber(10)(red)}/${MString.fromNumber(10)(green)}/${MString.fromNumber(10)(blue)}`,
    pipe(red, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 })),
    pipe(green, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 })),
    pipe(blue, Number.round(0), Number.clamp({ minimum: 0, maximum: 255 })),
  );

/**
 * RGB AliceBlue Color instance
 *
 * @category RGB instances
 */
export const aliceBlue: Type = makeShort('AliceBlue', 240, 248, 255);
/**
 * RGB AntiqueWhite Color instance
 *
 * @category RGB instances
 */
export const antiqueWhite: Type = makeShort('AntiqueWhite', 250, 235, 215);
/**
 * RGB Aqua Color instance
 *
 * @category RGB instances
 */
export const aqua: Type = makeShort('Aqua', 0, 255, 255);
/**
 * RGB AquaMarine Color instance
 *
 * @category RGB instances
 */
export const aquaMarine: Type = makeShort('AquaMarine', 127, 255, 212);
/**
 * RGB Azure Color instance
 *
 * @category RGB instances
 */
export const azure: Type = makeShort('Azure', 240, 255, 255);
/**
 * RGB Beige Color instance
 *
 * @category RGB instances
 */
export const beige: Type = makeShort('Beige', 245, 245, 220);
/**
 * RGB Bisque Color instance
 *
 * @category RGB instances
 */
export const bisque: Type = makeShort('Bisque', 255, 228, 196);
/**
 * RGB Black Color instance
 *
 * @category RGB instances
 */
export const black: Type = makeShort('Black', 0, 0, 0);
/**
 * RGB BlanchedAlmond Color instance
 *
 * @category RGB instances
 */
export const blanchedAlmond: Type = makeShort('BlanchedAlmond', 255, 235, 205);
/**
 * RGB Blue Color instance
 *
 * @category RGB instances
 */
export const blue: Type = makeShort('Blue', 0, 0, 255);
/**
 * RGB BlueViolet Color instance
 *
 * @category RGB instances
 */
export const blueViolet: Type = makeShort('BlueViolet', 138, 43, 226);
/**
 * RGB Brown Color instance
 *
 * @category RGB instances
 */
export const brown: Type = makeShort('Brown', 165, 42, 42);
/**
 * RGB BurlyWood Color instance
 *
 * @category RGB instances
 */
export const burlyWood: Type = makeShort('BurlyWood', 222, 184, 135);
/**
 * RGB CadetBlue Color instance
 *
 * @category RGB instances
 */
export const cadetBlue: Type = makeShort('CadetBlue', 95, 158, 160);
/**
 * RGB Chartreuse Color instance
 *
 * @category RGB instances
 */
export const chartreuse: Type = makeShort('Chartreuse', 127, 255, 0);
/**
 * RGB Chocolate Color instance
 *
 * @category RGB instances
 */
export const chocolate: Type = makeShort('Chocolate', 210, 105, 30);
/**
 * RGB Coral Color instance
 *
 * @category RGB instances
 */
export const coral: Type = makeShort('Coral', 255, 127, 80);
/**
 * RGB CornFlowerBlue Color instance
 *
 * @category RGB instances
 */
export const cornFlowerBlue: Type = makeShort('CornFlowerBlue', 100, 149, 237);
/**
 * RGB CornSilk Color instance
 *
 * @category RGB instances
 */
export const cornSilk: Type = makeShort('CornSilk', 255, 248, 220);
/**
 * RGB Crimson Color instance
 *
 * @category RGB instances
 */
export const crimson: Type = makeShort('Crimson', 220, 20, 60);
/**
 * RGB Cyan Color instance
 *
 * @category RGB instances
 */
export const cyan: Type = makeShort('Cyan', 0, 255, 255);
/**
 * RGB DarkBlue Color instance
 *
 * @category RGB instances
 */
export const darkBlue: Type = makeShort('DarkBlue', 0, 0, 139);
/**
 * RGB DarkCyan Color instance
 *
 * @category RGB instances
 */
export const darkCyan: Type = makeShort('DarkCyan', 0, 139, 139);
/**
 * RGB DarkGoldenRod Color instance
 *
 * @category RGB instances
 */
export const darkGoldenRod: Type = makeShort('DarkGoldenRod', 184, 134, 11);
/**
 * RGB DarkGray Color instance
 *
 * @category RGB instances
 */
export const darkGray: Type = makeShort('DarkGray', 169, 169, 169);
/**
 * RGB DarkGreen Color instance
 *
 * @category RGB instances
 */
export const darkGreen: Type = makeShort('DarkGreen', 0, 100, 0);
/**
 * RGB DarkKhaki Color instance
 *
 * @category RGB instances
 */
export const darkKhaki: Type = makeShort('DarkKhaki', 189, 183, 107);
/**
 * RGB DarkMagenta Color instance
 *
 * @category RGB instances
 */
export const darkMagenta: Type = makeShort('DarkMagenta', 139, 0, 139);
/**
 * RGB DarkOliveGreen Color instance
 *
 * @category RGB instances
 */
export const darkOliveGreen: Type = makeShort('DarkOliveGreen', 85, 107, 47);
/**
 * RGB DarkOrange Color instance
 *
 * @category RGB instances
 */
export const darkOrange: Type = makeShort('DarkOrange', 255, 140, 0);
/**
 * RGB DarkOrchid Color instance
 *
 * @category RGB instances
 */
export const darkOrchid: Type = makeShort('DarkOrchid', 153, 50, 204);
/**
 * RGB DarkRed Color instance
 *
 * @category RGB instances
 */
export const darkRed: Type = makeShort('DarkRed', 139, 0, 0);
/**
 * RGB DarkSalmon Color instance
 *
 * @category RGB instances
 */
export const darkSalmon: Type = makeShort('DarkSalmon', 233, 150, 122);
/**
 * RGB DarkSeaGreen Color instance
 *
 * @category RGB instances
 */
export const darkSeaGreen: Type = makeShort('DarkSeaGreen', 143, 188, 143);
/**
 * RGB DarkSlateBlue Color instance
 *
 * @category RGB instances
 */
export const darkSlateBlue: Type = makeShort('DarkSlateBlue', 72, 61, 139);
/**
 * RGB DarkSlateGray Color instance
 *
 * @category RGB instances
 */
export const darkSlateGray: Type = makeShort('DarkSlateGray', 47, 79, 79);
/**
 * RGB DarkTurquoise Color instance
 *
 * @category RGB instances
 */
export const darkTurquoise: Type = makeShort('DarkTurquoise', 0, 206, 209);
/**
 * RGB DarkViolet Color instance
 *
 * @category RGB instances
 */
export const darkViolet: Type = makeShort('DarkViolet', 148, 0, 211);
/**
 * RGB DeepPink Color instance
 *
 * @category RGB instances
 */
export const deepPink: Type = makeShort('DeepPink', 255, 20, 147);
/**
 * RGB DeepSkyBlue Color instance
 *
 * @category RGB instances
 */
export const deepSkyBlue: Type = makeShort('DeepSkyBlue', 0, 191, 255);
/**
 * RGB DimGray Color instance
 *
 * @category RGB instances
 */
export const dimGray: Type = makeShort('DimGray', 105, 105, 105);
/**
 * RGB DodgerBlue Color instance
 *
 * @category RGB instances
 */
export const dodgerBlue: Type = makeShort('DodgerBlue', 30, 144, 255);
/**
 * RGB Firebrick Color instance
 *
 * @category RGB instances
 */
export const firebrick: Type = makeShort('Firebrick', 178, 34, 34);
/**
 * RGB FloralWhite Color instance
 *
 * @category RGB instances
 */
export const floralWhite: Type = makeShort('FloralWhite', 255, 250, 240);
/**
 * RGB ForestGreen Color instance
 *
 * @category RGB instances
 */
export const forestGreen: Type = makeShort('ForestGreen', 34, 139, 34);
/**
 * RGB Gainsboro Color instance
 *
 * @category RGB instances
 */
export const gainsboro: Type = makeShort('Gainsboro', 220, 220, 220);
/**
 * RGB GhostWhite Color instance
 *
 * @category RGB instances
 */
export const ghostWhite: Type = makeShort('GhostWhite', 248, 248, 255);
/**
 * RGB Gold Color instance
 *
 * @category RGB instances
 */
export const gold: Type = makeShort('Gold', 255, 215, 0);
/**
 * RGB GoldenRod Color instance
 *
 * @category RGB instances
 */
export const goldenRod: Type = makeShort('GoldenRod', 218, 165, 32);
/**
 * RGB Gray Color instance
 *
 * @category RGB instances
 */
export const gray: Type = makeShort('Gray', 128, 128, 128);
/**
 * RGB Green Color instance
 *
 * @category RGB instances
 */
export const green: Type = makeShort('Green', 0, 128, 0);
/**
 * RGB GreenYellow Color instance
 *
 * @category RGB instances
 */
export const greenYellow: Type = makeShort('GreenYellow', 173, 255, 47);
/**
 * RGB HoneyDew Color instance
 *
 * @category RGB instances
 */
export const honeyDew: Type = makeShort('HoneyDew', 240, 255, 240);
/**
 * RGB HotPink Color instance
 *
 * @category RGB instances
 */
export const hotPink: Type = makeShort('HotPink', 255, 105, 180);
/**
 * RGB IndianRed Color instance
 *
 * @category RGB instances
 */
export const indianRed: Type = makeShort('IndianRed', 205, 92, 92);
/**
 * RGB Indigo Color instance
 *
 * @category RGB instances
 */
export const indigo: Type = makeShort('Indigo', 75, 0, 130);
/**
 * RGB Ivory Color instance
 *
 * @category RGB instances
 */
export const ivory: Type = makeShort('Ivory', 255, 255, 240);
/**
 * RGB Khaki Color instance
 *
 * @category RGB instances
 */
export const khaki: Type = makeShort('Khaki', 240, 230, 140);
/**
 * RGB Lavender Color instance
 *
 * @category RGB instances
 */
export const lavender: Type = makeShort('Lavender', 230, 230, 250);
/**
 * RGB LavenderBlush Color instance
 *
 * @category RGB instances
 */
export const lavenderBlush: Type = makeShort('LavenderBlush', 255, 240, 245);
/**
 * RGB LawnGreen Color instance
 *
 * @category RGB instances
 */
export const lawnGreen: Type = makeShort('LawnGreen', 124, 252, 0);
/**
 * RGB LemonChiffon Color instance
 *
 * @category RGB instances
 */
export const lemonChiffon: Type = makeShort('LemonChiffon', 255, 250, 205);
/**
 * RGB LightBlue Color instance
 *
 * @category RGB instances
 */
export const lightBlue: Type = makeShort('LightBlue', 173, 216, 230);
/**
 * RGB LightCoral Color instance
 *
 * @category RGB instances
 */
export const lightCoral: Type = makeShort('LightCoral', 240, 128, 128);
/**
 * RGB LightCyan Color instance
 *
 * @category RGB instances
 */
export const lightCyan: Type = makeShort('LightCyan', 224, 255, 255);
/**
 * RGB LightGoldenRodYellow Color instance
 *
 * @category RGB instances
 */
export const lightGoldenRodYellow: Type = makeShort('LightGoldenRodYellow', 250, 250, 210);
/**
 * RGB LightGray Color instance
 *
 * @category RGB instances
 */
export const lightGray: Type = makeShort('LightGray', 211, 211, 211);
/**
 * RGB LightGreen Color instance
 *
 * @category RGB instances
 */
export const lightGreen: Type = makeShort('LightGreen', 144, 238, 144);
/**
 * RGB LightPink Color instance
 *
 * @category RGB instances
 */
export const lightPink: Type = makeShort('LightPink', 255, 182, 193);
/**
 * RGB LightSalmon Color instance
 *
 * @category RGB instances
 */
export const lightSalmon: Type = makeShort('LightSalmon', 255, 160, 122);
/**
 * RGB LightSeaGreen Color instance
 *
 * @category RGB instances
 */
export const lightSeaGreen: Type = makeShort('LightSeaGreen', 32, 178, 170);
/**
 * RGB LightSkyBlue Color instance
 *
 * @category RGB instances
 */
export const lightSkyBlue: Type = makeShort('LightSkyBlue', 135, 206, 250);
/**
 * RGB LightSlateGray Color instance
 *
 * @category RGB instances
 */
export const lightSlateGray: Type = makeShort('LightSlateGray', 119, 136, 153);
/**
 * RGB LightSteelBlue Color instance
 *
 * @category RGB instances
 */
export const lightSteelBlue: Type = makeShort('LightSteelBlue', 176, 196, 222);
/**
 * RGB LightYellow Color instance
 *
 * @category RGB instances
 */
export const lightYellow: Type = makeShort('LightYellow', 255, 255, 224);
/**
 * RGB Lime Color instance
 *
 * @category RGB instances
 */
export const lime: Type = makeShort('Lime', 0, 255, 0);
/**
 * RGB LimeGreen Color instance
 *
 * @category RGB instances
 */
export const limeGreen: Type = makeShort('LimeGreen', 50, 205, 50);
/**
 * RGB Linen Color instance
 *
 * @category RGB instances
 */
export const linen: Type = makeShort('Linen', 250, 240, 230);
/**
 * RGB Magenta Color instance
 *
 * @category RGB instances
 */
export const magenta: Type = makeShort('Magenta', 255, 0, 255);
/**
 * RGB Maroon Color instance
 *
 * @category RGB instances
 */
export const maroon: Type = makeShort('Maroon', 128, 0, 0);
/**
 * RGB MediumAquaMarine Color instance
 *
 * @category RGB instances
 */
export const mediumAquaMarine: Type = makeShort('MediumAquaMarine', 102, 205, 170);
/**
 * RGB MediumBlue Color instance
 *
 * @category RGB instances
 */
export const mediumBlue: Type = makeShort('MediumBlue', 0, 0, 205);
/**
 * RGB MediumOrchid2 Color instance
 *
 * @category RGB instances
 */
export const mediumOrchid2: Type = makeShort('MediumOrchid2', 186, 85, 211);
/**
 * RGB MediumPurple Color instance
 *
 * @category RGB instances
 */
export const mediumPurple: Type = makeShort('MediumPurple', 147, 112, 219);
/**
 * RGB MediumSeaGreen Color instance
 *
 * @category RGB instances
 */
export const mediumSeaGreen: Type = makeShort('MediumSeaGreen', 60, 179, 113);
/**
 * RGB MediumSlateBlue Color instance
 *
 * @category RGB instances
 */
export const mediumSlateBlue: Type = makeShort('MediumSlateBlue', 123, 104, 238);
/**
 * RGB MediumSpringGreen Color instance
 *
 * @category RGB instances
 */
export const mediumSpringGreen: Type = makeShort('MediumSpringGreen', 0, 250, 154);
/**
 * RGB MediumTurquoise Color instance
 *
 * @category RGB instances
 */
export const mediumTurquoise: Type = makeShort('MediumTurquoise', 72, 209, 204);
/**
 * RGB MediumVioletRed Color instance
 *
 * @category RGB instances
 */
export const mediumVioletRed: Type = makeShort('MediumVioletRed', 199, 21, 133);
/**
 * RGB MidnightBlue Color instance
 *
 * @category RGB instances
 */
export const midnightBlue: Type = makeShort('MidnightBlue', 25, 25, 112);
/**
 * RGB MintCream Color instance
 *
 * @category RGB instances
 */
export const mintCream: Type = makeShort('MintCream', 245, 255, 250);
/**
 * RGB MistyRose Color instance
 *
 * @category RGB instances
 */
export const mistyRose: Type = makeShort('MistyRose', 255, 228, 225);
/**
 * RGB Moccasin Color instance
 *
 * @category RGB instances
 */
export const moccasin: Type = makeShort('Moccasin', 255, 228, 181);
/**
 * RGB NavajoWhite Color instance
 *
 * @category RGB instances
 */
export const navajoWhite: Type = makeShort('NavajoWhite', 255, 222, 173);
/**
 * RGB Navy Color instance
 *
 * @category RGB instances
 */
export const navy: Type = makeShort('Navy', 0, 0, 128);
/**
 * RGB OldLace Color instance
 *
 * @category RGB instances
 */
export const oldLace: Type = makeShort('OldLace', 253, 245, 230);
/**
 * RGB Olive Color instance
 *
 * @category RGB instances
 */
export const olive: Type = makeShort('Olive', 128, 128, 0);
/**
 * RGB OliveDrab Color instance
 *
 * @category RGB instances
 */
export const oliveDrab: Type = makeShort('OliveDrab', 107, 142, 35);
/**
 * RGB Orange Color instance
 *
 * @category RGB instances
 */
export const orange: Type = makeShort('Orange', 255, 165, 0);
/**
 * RGB OrangeRed Color instance
 *
 * @category RGB instances
 */
export const orangeRed: Type = makeShort('OrangeRed', 255, 69, 0);
/**
 * RGB Orchid Color instance
 *
 * @category RGB instances
 */
export const orchid: Type = makeShort('Orchid', 218, 112, 214);
/**
 * RGB PaleGoldenRod Color instance
 *
 * @category RGB instances
 */
export const paleGoldenRod: Type = makeShort('PaleGoldenRod', 238, 232, 170);
/**
 * RGB PaleGreen Color instance
 *
 * @category RGB instances
 */
export const paleGreen: Type = makeShort('PaleGreen', 152, 251, 152);
/**
 * RGB PaleTurquoise Color instance
 *
 * @category RGB instances
 */
export const paleTurquoise: Type = makeShort('PaleTurquoise', 175, 238, 238);
/**
 * RGB PaleVioletRed Color instance
 *
 * @category RGB instances
 */
export const paleVioletRed: Type = makeShort('PaleVioletRed', 219, 112, 147);
/**
 * RGB PapayaWhip Color instance
 *
 * @category RGB instances
 */
export const papayaWhip: Type = makeShort('PapayaWhip', 255, 239, 213);
/**
 * RGB PeachPuff Color instance
 *
 * @category RGB instances
 */
export const peachPuff: Type = makeShort('PeachPuff', 255, 218, 185);
/**
 * RGB Peru Color instance
 *
 * @category RGB instances
 */
export const peru: Type = makeShort('Peru', 205, 133, 63);
/**
 * RGB Pink Color instance
 *
 * @category RGB instances
 */
export const pink: Type = makeShort('Pink', 255, 192, 203);
/**
 * RGB Plum Color instance
 *
 * @category RGB instances
 */
export const plum: Type = makeShort('Plum', 221, 160, 221);
/**
 * RGB PowderBlue Color instance
 *
 * @category RGB instances
 */
export const powderBlue: Type = makeShort('PowderBlue', 176, 224, 230);
/**
 * RGB Purple Color instance
 *
 * @category RGB instances
 */
export const purple: Type = makeShort('Purple', 128, 0, 128);
/**
 * RGB Red Color instance
 *
 * @category RGB instances
 */
export const red: Type = makeShort('Red', 255, 0, 0);
/**
 * RGB RosyBrown Color instance
 *
 * @category RGB instances
 */
export const rosyBrown: Type = makeShort('RosyBrown', 188, 143, 143);
/**
 * RGB RoyalBlue Color instance
 *
 * @category RGB instances
 */
export const royalBlue: Type = makeShort('RoyalBlue', 65, 105, 225);
/**
 * RGB SaddleBrown Color instance
 *
 * @category RGB instances
 */
export const saddleBrown: Type = makeShort('SaddleBrown', 139, 69, 19);
/**
 * RGB Salmon Color instance
 *
 * @category RGB instances
 */
export const salmon: Type = makeShort('Salmon', 250, 128, 114);
/**
 * RGB SandyBrown Color instance
 *
 * @category RGB instances
 */
export const sandyBrown: Type = makeShort('SandyBrown', 244, 164, 96);
/**
 * RGB SeaGreen Color instance
 *
 * @category RGB instances
 */
export const seaGreen: Type = makeShort('SeaGreen', 46, 139, 87);
/**
 * RGB SeaShell Color instance
 *
 * @category RGB instances
 */
export const seaShell: Type = makeShort('SeaShell', 255, 245, 238);
/**
 * RGB Sienna Color instance
 *
 * @category RGB instances
 */
export const sienna: Type = makeShort('Sienna', 160, 82, 45);
/**
 * RGB Silver Color instance
 *
 * @category RGB instances
 */
export const silver: Type = makeShort('Silver', 192, 192, 192);
/**
 * RGB SkyBlue Color instance
 *
 * @category RGB instances
 */
export const skyBlue: Type = makeShort('SkyBlue', 135, 206, 235);
/**
 * RGB SlateBlue Color instance
 *
 * @category RGB instances
 */
export const slateBlue: Type = makeShort('SlateBlue', 106, 90, 205);
/**
 * RGB SlateGray Color instance
 *
 * @category RGB instances
 */
export const slateGray: Type = makeShort('SlateGray', 112, 128, 144);
/**
 * RGB Snow Color instance
 *
 * @category RGB instances
 */
export const snow: Type = makeShort('Snow', 255, 250, 250);
/**
 * RGB SpringGreen Color instance
 *
 * @category RGB instances
 */
export const springGreen: Type = makeShort('SpringGreen', 0, 255, 127);
/**
 * RGB SteelBlue Color instance
 *
 * @category RGB instances
 */
export const steelBlue: Type = makeShort('SteelBlue', 70, 130, 180);
/**
 * RGB Tan Color instance
 *
 * @category RGB instances
 */
export const tan: Type = makeShort('Tan', 210, 180, 140);
/**
 * RGB Teal Color instance
 *
 * @category RGB instances
 */
export const teal: Type = makeShort('Teal', 0, 128, 128);
/**
 * RGB Thistle Color instance
 *
 * @category RGB instances
 */
export const thistle: Type = makeShort('Thistle', 216, 191, 216);
/**
 * RGB Tomato Color instance
 *
 * @category RGB instances
 */
export const tomato: Type = makeShort('Tomato', 255, 99, 71);
/**
 * RGB Turquoise Color instance
 *
 * @category RGB instances
 */
export const turquoise: Type = makeShort('Turquoise', 64, 224, 208);
/**
 * RGB Violet Color instance
 *
 * @category RGB instances
 */
export const violet: Type = makeShort('Violet', 238, 130, 238);
/**
 * RGB Wheat Color instance
 *
 * @category RGB instances
 */
export const wheat: Type = makeShort('Wheat', 245, 222, 179);
/**
 * RGB White Color instance
 *
 * @category RGB instances
 */
export const white: Type = makeShort('White', 255, 255, 255);
/**
 * RGB WhiteSmoke Color instance
 *
 * @category RGB instances
 */
export const whiteSmoke: Type = makeShort('WhiteSmoke', 245, 245, 245);
/**
 * RGB Yellow Color instance
 *
 * @category RGB instances
 */
export const yellow: Type = makeShort('Yellow', 255, 255, 0);
/**
 * RGB YellowGreen Color instance
 *
 * @category RGB instances
 */
export const yellowGreen: Type = makeShort('YellowGreen', 154, 205, 50);
