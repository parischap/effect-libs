/**
 * This module defines an RGB color
 *
 * You can use the RGB.make function to build more RGB colors
 */

import { MDataBase, MDataEquivalenceBasedEquality, MString, MTypes } from '@parischap/effect-lib';
import { Array, Equivalence, Hash, Number, pipe, Predicate, Struct } from 'effect';
import * as ASSequence from '../Sequence.js';
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
  /** Id of this RGB color */
  readonly id: string;

  /** Red part of this color */
  readonly redCode: number;

  /** Green part of this color */
  readonly greenCode: number;

  /** Blue part of this color */
  readonly blueCode: number;

  /** Gets the foreground sequence of `this` */
  [ASColorBase.toForegroundSequenceSymbol](): ASSequence.NonEmptyType {
    return Array.make(38, 2, this.redCode, this.greenCode, this.blueCode);
  }

  /** Class constructor */
  private constructor({ id, redCode, greenCode, blueCode }: MTypes.Data<Type>) {
    super();
    this.id = id;
    this.redCode = redCode;
    this.greenCode = greenCode;
    this.blueCode = blueCode;
  }

  /** Static constructor */
  static make(params: MTypes.Data<Type>): Type {
    return new Type(params);
  }

  /** Returns the `id` of `this` */
  protected [MDataBase.idSymbol](): string | (() => string) {
    return function idSymbol(this: Type) {
      return this.id;
    };
  }

  /** Calculates the hash value of `this` */
  [Hash.symbol](): number {
    return 0;
  }

  /** Function that implements the equivalence of `this` and `that` */
  protected [MDataEquivalenceBasedEquality.isEquivalentToSymbol](this: this, that: this): boolean {
    return equivalence(this, that);
  }

  /** Predicate that returns true if `that` has the same type marker as `this` */
  protected [MDataEquivalenceBasedEquality.hasSameTypeMarkerAsSymbol](that: unknown): boolean {
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
  self.redCode === that.redCode
  && self.greenCode === that.greenCode
  && self.blueCode === that.blueCode;

/**
 * Gets the `id` property of `self`
 *
 * @category Destructors
 */
export const id: MTypes.OneArgFunction<Type, string> = Struct.get('id');

/**
 * Gets the `redCode` property of `self`
 *
 * @category Destructors
 */
export const redCode: MTypes.OneArgFunction<Type, number> = Struct.get('redCode');

/**
 * Gets the `greenCode` property of `self`
 *
 * @category Destructors
 */
export const greenCode: MTypes.OneArgFunction<Type, number> = Struct.get('greenCode');

/**
 * Gets the `blueCode` property of `self`
 *
 * @category Destructors
 */
export const blueCode: MTypes.OneArgFunction<Type, number> = Struct.get('blueCode');

/**
 * Constructor of predefined RGB colors
 *
 * @category Constructors
 */
export const makeShort = (id: string, redCode: number, greenCode: number, blueCode: number): Type =>
  Type.make({ id: 'Rgb' + id, redCode, greenCode, blueCode });

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
 * @category EightBit instances
 */
export const AliceBlue: Type = makeShort('AliceBlue', 240, 248, 255);
/**
 * RGB AntiqueWhite Color instance
 *
 * @category RGB instances
 */
export const AntiqueWhite: Type = makeShort('AntiqueWhite', 250, 235, 215);
/**
 * RGB Aqua Color instance
 *
 * @category RGB instances
 */
export const Aqua: Type = makeShort('Aqua', 0, 255, 255);
/**
 * RGB AquaMarine Color instance
 *
 * @category RGB instances
 */
export const AquaMarine: Type = makeShort('AquaMarine', 127, 255, 212);
/**
 * RGB Azure Color instance
 *
 * @category RGB instances
 */
export const Azure: Type = makeShort('Azure', 240, 255, 255);
/**
 * RGB Beige Color instance
 *
 * @category RGB instances
 */
export const Beige: Type = makeShort('Beige', 245, 245, 220);
/**
 * RGB Bisque Color instance
 *
 * @category RGB instances
 */
export const Bisque: Type = makeShort('Bisque', 255, 228, 196);
/**
 * RGB Black Color instance
 *
 * @category RGB instances
 */
export const Black: Type = makeShort('Black', 0, 0, 0);
/**
 * RGB BlanchedAlmond Color instance
 *
 * @category RGB instances
 */
export const BlanchedAlmond: Type = makeShort('BlanchedAlmond', 255, 235, 205);
/**
 * RGB Blue Color instance
 *
 * @category RGB instances
 */
export const Blue: Type = makeShort('Blue', 0, 0, 255);
/**
 * RGB BlueViolet Color instance
 *
 * @category RGB instances
 */
export const BlueViolet: Type = makeShort('BlueViolet', 138, 43, 226);
/**
 * RGB Brown Color instance
 *
 * @category RGB instances
 */
export const Brown: Type = makeShort('Brown', 165, 42, 42);
/**
 * RGB BurlyWood Color instance
 *
 * @category RGB instances
 */
export const BurlyWood: Type = makeShort('BurlyWood', 222, 184, 135);
/**
 * RGB CadetBlue Color instance
 *
 * @category RGB instances
 */
export const CadetBlue: Type = makeShort('CadetBlue', 95, 158, 160);
/**
 * RGB Chartreuse Color instance
 *
 * @category RGB instances
 */
export const Chartreuse: Type = makeShort('Chartreuse', 127, 255, 0);
/**
 * RGB Chocolate Color instance
 *
 * @category RGB instances
 */
export const Chocolate: Type = makeShort('Chocolate', 210, 105, 30);
/**
 * RGB Coral Color instance
 *
 * @category RGB instances
 */
export const Coral: Type = makeShort('Coral', 255, 127, 80);
/**
 * RGB CornFlowerBlue Color instance
 *
 * @category RGB instances
 */
export const CornFlowerBlue: Type = makeShort('CornFlowerBlue', 100, 149, 237);
/**
 * RGB CornSilk Color instance
 *
 * @category RGB instances
 */
export const CornSilk: Type = makeShort('CornSilk', 255, 248, 220);
/**
 * RGB Crimson Color instance
 *
 * @category RGB instances
 */
export const Crimson: Type = makeShort('Crimson', 220, 20, 60);
/**
 * RGB Cyan Color instance
 *
 * @category RGB instances
 */
export const Cyan: Type = makeShort('Cyan', 0, 255, 255);
/**
 * RGB DarkBlue Color instance
 *
 * @category RGB instances
 */
export const DarkBlue: Type = makeShort('DarkBlue', 0, 0, 139);
/**
 * RGB DarkCyan Color instance
 *
 * @category RGB instances
 */
export const DarkCyan: Type = makeShort('DarkCyan', 0, 139, 139);
/**
 * RGB DarkGoldenRod Color instance
 *
 * @category RGB instances
 */
export const DarkGoldenRod: Type = makeShort('DarkGoldenRod', 184, 134, 11);
/**
 * RGB DarkGray Color instance
 *
 * @category RGB instances
 */
export const DarkGray: Type = makeShort('DarkGray', 169, 169, 169);
/**
 * RGB DarkGreen Color instance
 *
 * @category RGB instances
 */
export const DarkGreen: Type = makeShort('DarkGreen', 0, 100, 0);
/**
 * RGB DarkKhaki Color instance
 *
 * @category RGB instances
 */
export const DarkKhaki: Type = makeShort('DarkKhaki', 189, 183, 107);
/**
 * RGB DarkMagenta Color instance
 *
 * @category RGB instances
 */
export const DarkMagenta: Type = makeShort('DarkMagenta', 139, 0, 139);
/**
 * RGB DarkOliveGreen Color instance
 *
 * @category RGB instances
 */
export const DarkOliveGreen: Type = makeShort('DarkOliveGreen', 85, 107, 47);
/**
 * RGB DarkOrange Color instance
 *
 * @category RGB instances
 */
export const DarkOrange: Type = makeShort('DarkOrange', 255, 140, 0);
/**
 * RGB DarkOrchid Color instance
 *
 * @category RGB instances
 */
export const DarkOrchid: Type = makeShort('DarkOrchid', 153, 50, 204);
/**
 * RGB DarkRed Color instance
 *
 * @category RGB instances
 */
export const DarkRed: Type = makeShort('DarkRed', 139, 0, 0);
/**
 * RGB DarkSalmon Color instance
 *
 * @category RGB instances
 */
export const DarkSalmon: Type = makeShort('DarkSalmon', 233, 150, 122);
/**
 * RGB DarkSeaGreen Color instance
 *
 * @category RGB instances
 */
export const DarkSeaGreen: Type = makeShort('DarkSeaGreen', 143, 188, 143);
/**
 * RGB DarkSlateBlue Color instance
 *
 * @category RGB instances
 */
export const DarkSlateBlue: Type = makeShort('DarkSlateBlue', 72, 61, 139);
/**
 * RGB DarkSlateGray Color instance
 *
 * @category RGB instances
 */
export const DarkSlateGray: Type = makeShort('DarkSlateGray', 47, 79, 79);
/**
 * RGB DarkTurquoise Color instance
 *
 * @category RGB instances
 */
export const DarkTurquoise: Type = makeShort('DarkTurquoise', 0, 206, 209);
/**
 * RGB DarkViolet Color instance
 *
 * @category RGB instances
 */
export const DarkViolet: Type = makeShort('DarkViolet', 148, 0, 211);
/**
 * RGB DeepPink Color instance
 *
 * @category RGB instances
 */
export const DeepPink: Type = makeShort('DeepPink', 255, 20, 147);
/**
 * RGB DeepSkyBlue Color instance
 *
 * @category RGB instances
 */
export const DeepSkyBlue: Type = makeShort('DeepSkyBlue', 0, 191, 255);
/**
 * RGB DimGray Color instance
 *
 * @category RGB instances
 */
export const DimGray: Type = makeShort('DimGray', 105, 105, 105);
/**
 * RGB DodgerBlue Color instance
 *
 * @category RGB instances
 */
export const DodgerBlue: Type = makeShort('DodgerBlue', 30, 144, 255);
/**
 * RGB Firebrick Color instance
 *
 * @category RGB instances
 */
export const Firebrick: Type = makeShort('Firebrick', 178, 34, 34);
/**
 * RGB FloralWhite Color instance
 *
 * @category RGB instances
 */
export const FloralWhite: Type = makeShort('FloralWhite', 255, 250, 240);
/**
 * RGB ForestGreen Color instance
 *
 * @category RGB instances
 */
export const ForestGreen: Type = makeShort('ForestGreen', 34, 139, 34);
/**
 * RGB Gainsboro Color instance
 *
 * @category RGB instances
 */
export const Gainsboro: Type = makeShort('Gainsboro', 220, 220, 220);
/**
 * RGB GhostWhite Color instance
 *
 * @category RGB instances
 */
export const GhostWhite: Type = makeShort('GhostWhite', 248, 248, 255);
/**
 * RGB Gold Color instance
 *
 * @category RGB instances
 */
export const Gold: Type = makeShort('Gold', 255, 215, 0);
/**
 * RGB GoldenRod Color instance
 *
 * @category RGB instances
 */
export const GoldenRod: Type = makeShort('GoldenRod', 218, 165, 32);
/**
 * RGB Gray Color instance
 *
 * @category RGB instances
 */
export const Gray: Type = makeShort('Gray', 128, 128, 128);
/**
 * RGB Green Color instance
 *
 * @category RGB instances
 */
export const Green: Type = makeShort('Green', 0, 128, 0);
/**
 * RGB GreenYellow Color instance
 *
 * @category RGB instances
 */
export const GreenYellow: Type = makeShort('GreenYellow', 173, 255, 47);
/**
 * RGB HoneyDew Color instance
 *
 * @category RGB instances
 */
export const HoneyDew: Type = makeShort('HoneyDew', 240, 255, 240);
/**
 * RGB HotPink Color instance
 *
 * @category RGB instances
 */
export const HotPink: Type = makeShort('HotPink', 255, 105, 180);
/**
 * RGB IndianRed Color instance
 *
 * @category RGB instances
 */
export const IndianRed: Type = makeShort('IndianRed', 205, 92, 92);
/**
 * RGB Indigo Color instance
 *
 * @category RGB instances
 */
export const Indigo: Type = makeShort('Indigo', 75, 0, 130);
/**
 * RGB Ivory Color instance
 *
 * @category RGB instances
 */
export const Ivory: Type = makeShort('Ivory', 255, 255, 240);
/**
 * RGB Khaki Color instance
 *
 * @category RGB instances
 */
export const Khaki: Type = makeShort('Khaki', 240, 230, 140);
/**
 * RGB Lavender Color instance
 *
 * @category RGB instances
 */
export const Lavender: Type = makeShort('Lavender', 230, 230, 250);
/**
 * RGB LavenderBlush Color instance
 *
 * @category RGB instances
 */
export const LavenderBlush: Type = makeShort('LavenderBlush', 255, 240, 245);
/**
 * RGB LawnGreen Color instance
 *
 * @category RGB instances
 */
export const LawnGreen: Type = makeShort('LawnGreen', 124, 252, 0);
/**
 * RGB LemonChiffon Color instance
 *
 * @category RGB instances
 */
export const LemonChiffon: Type = makeShort('LemonChiffon', 255, 250, 205);
/**
 * RGB LightBlue Color instance
 *
 * @category RGB instances
 */
export const LightBlue: Type = makeShort('LightBlue', 173, 216, 230);
/**
 * RGB LightCoral Color instance
 *
 * @category RGB instances
 */
export const LightCoral: Type = makeShort('LightCoral', 240, 128, 128);
/**
 * RGB LightCyan Color instance
 *
 * @category RGB instances
 */
export const LightCyan: Type = makeShort('LightCyan', 224, 255, 255);
/**
 * RGB LightGoldenRodYellow Color instance
 *
 * @category RGB instances
 */
export const LightGoldenRodYellow: Type = makeShort('LightGoldenRodYellow', 250, 250, 210);
/**
 * RGB LightGray Color instance
 *
 * @category RGB instances
 */
export const LightGray: Type = makeShort('LightGray', 211, 211, 211);
/**
 * RGB LightGreen Color instance
 *
 * @category RGB instances
 */
export const LightGreen: Type = makeShort('LightGreen', 144, 238, 144);
/**
 * RGB LightPink Color instance
 *
 * @category RGB instances
 */
export const LightPink: Type = makeShort('LightPink', 255, 182, 193);
/**
 * RGB LightSalmon Color instance
 *
 * @category RGB instances
 */
export const LightSalmon: Type = makeShort('LightSalmon', 255, 160, 122);
/**
 * RGB LightSeaGreen Color instance
 *
 * @category RGB instances
 */
export const LightSeaGreen: Type = makeShort('LightSeaGreen', 32, 178, 170);
/**
 * RGB LightSkyBlue Color instance
 *
 * @category RGB instances
 */
export const LightSkyBlue: Type = makeShort('LightSkyBlue', 135, 206, 250);
/**
 * RGB LightSlateGray Color instance
 *
 * @category RGB instances
 */
export const LightSlateGray: Type = makeShort('LightSlateGray', 119, 136, 153);
/**
 * RGB LightSteelBlue Color instance
 *
 * @category RGB instances
 */
export const LightSteelBlue: Type = makeShort('LightSteelBlue', 176, 196, 222);
/**
 * RGB LightYellow Color instance
 *
 * @category RGB instances
 */
export const LightYellow: Type = makeShort('LightYellow', 255, 255, 224);
/**
 * RGB Lime Color instance
 *
 * @category RGB instances
 */
export const Lime: Type = makeShort('Lime', 0, 255, 0);
/**
 * RGB LimeGreen Color instance
 *
 * @category RGB instances
 */
export const LimeGreen: Type = makeShort('LimeGreen', 50, 205, 50);
/**
 * RGB Linen Color instance
 *
 * @category RGB instances
 */
export const Linen: Type = makeShort('Linen', 250, 240, 230);
/**
 * RGB Magenta Color instance
 *
 * @category RGB instances
 */
export const Magenta: Type = makeShort('Magenta', 255, 0, 255);
/**
 * RGB Maroon Color instance
 *
 * @category RGB instances
 */
export const Maroon: Type = makeShort('Maroon', 128, 0, 0);
/**
 * RGB MediumAquaMarine Color instance
 *
 * @category RGB instances
 */
export const MediumAquaMarine: Type = makeShort('MediumAquaMarine', 102, 205, 170);
/**
 * RGB MediumBlue Color instance
 *
 * @category RGB instances
 */
export const MediumBlue: Type = makeShort('MediumBlue', 0, 0, 205);
/**
 * RGB MediumOrchid2 Color instance
 *
 * @category RGB instances
 */
export const MediumOrchid2: Type = makeShort('MediumOrchid2', 186, 85, 211);
/**
 * RGB MediumPurple Color instance
 *
 * @category RGB instances
 */
export const MediumPurple: Type = makeShort('MediumPurple', 147, 112, 219);
/**
 * RGB MediumSeaGreen Color instance
 *
 * @category RGB instances
 */
export const MediumSeaGreen: Type = makeShort('MediumSeaGreen', 60, 179, 113);
/**
 * RGB MediumSlateBlue Color instance
 *
 * @category RGB instances
 */
export const MediumSlateBlue: Type = makeShort('MediumSlateBlue', 123, 104, 238);
/**
 * RGB MediumSpringGreen Color instance
 *
 * @category RGB instances
 */
export const MediumSpringGreen: Type = makeShort('MediumSpringGreen', 0, 250, 154);
/**
 * RGB MediumTurquoise Color instance
 *
 * @category RGB instances
 */
export const MediumTurquoise: Type = makeShort('MediumTurquoise', 72, 209, 204);
/**
 * RGB MediumVioletRed Color instance
 *
 * @category RGB instances
 */
export const MediumVioletRed: Type = makeShort('MediumVioletRed', 199, 21, 133);
/**
 * RGB MidnightBlue Color instance
 *
 * @category RGB instances
 */
export const MidnightBlue: Type = makeShort('MidnightBlue', 25, 25, 112);
/**
 * RGB MintCream Color instance
 *
 * @category RGB instances
 */
export const MintCream: Type = makeShort('MintCream', 245, 255, 250);
/**
 * RGB MistyRose Color instance
 *
 * @category RGB instances
 */
export const MistyRose: Type = makeShort('MistyRose', 255, 228, 225);
/**
 * RGB Moccasin Color instance
 *
 * @category RGB instances
 */
export const Moccasin: Type = makeShort('Moccasin', 255, 228, 181);
/**
 * RGB NavajoWhite Color instance
 *
 * @category RGB instances
 */
export const NavajoWhite: Type = makeShort('NavajoWhite', 255, 222, 173);
/**
 * RGB Navy Color instance
 *
 * @category RGB instances
 */
export const Navy: Type = makeShort('Navy', 0, 0, 128);
/**
 * RGB OldLace Color instance
 *
 * @category RGB instances
 */
export const OldLace: Type = makeShort('OldLace', 253, 245, 230);
/**
 * RGB Olive Color instance
 *
 * @category RGB instances
 */
export const Olive: Type = makeShort('Olive', 128, 128, 0);
/**
 * RGB OliveDrab Color instance
 *
 * @category RGB instances
 */
export const OliveDrab: Type = makeShort('OliveDrab', 107, 142, 35);
/**
 * RGB Orange Color instance
 *
 * @category RGB instances
 */
export const Orange: Type = makeShort('Orange', 255, 165, 0);
/**
 * RGB OrangeRed Color instance
 *
 * @category RGB instances
 */
export const OrangeRed: Type = makeShort('OrangeRed', 255, 69, 0);
/**
 * RGB Orchid Color instance
 *
 * @category RGB instances
 */
export const Orchid: Type = makeShort('Orchid', 218, 112, 214);
/**
 * RGB PaleGoldenRod Color instance
 *
 * @category RGB instances
 */
export const PaleGoldenRod: Type = makeShort('PaleGoldenRod', 238, 232, 170);
/**
 * RGB PaleGreen Color instance
 *
 * @category RGB instances
 */
export const PaleGreen: Type = makeShort('PaleGreen', 152, 251, 152);
/**
 * RGB PaleTurquoise Color instance
 *
 * @category RGB instances
 */
export const PaleTurquoise: Type = makeShort('PaleTurquoise', 175, 238, 238);
/**
 * RGB PaleVioletRed Color instance
 *
 * @category RGB instances
 */
export const PaleVioletRed: Type = makeShort('PaleVioletRed', 219, 112, 147);
/**
 * RGB PapayaWhip Color instance
 *
 * @category RGB instances
 */
export const PapayaWhip: Type = makeShort('PapayaWhip', 255, 239, 213);
/**
 * RGB PeachPuff Color instance
 *
 * @category RGB instances
 */
export const PeachPuff: Type = makeShort('PeachPuff', 255, 218, 185);
/**
 * RGB Peru Color instance
 *
 * @category RGB instances
 */
export const Peru: Type = makeShort('Peru', 205, 133, 63);
/**
 * RGB Pink Color instance
 *
 * @category RGB instances
 */
export const Pink: Type = makeShort('Pink', 255, 192, 203);
/**
 * RGB Plum Color instance
 *
 * @category RGB instances
 */
export const Plum: Type = makeShort('Plum', 221, 160, 221);
/**
 * RGB PowderBlue Color instance
 *
 * @category RGB instances
 */
export const PowderBlue: Type = makeShort('PowderBlue', 176, 224, 230);
/**
 * RGB Purple Color instance
 *
 * @category RGB instances
 */
export const Purple: Type = makeShort('Purple', 128, 0, 128);
/**
 * RGB Red Color instance
 *
 * @category RGB instances
 */
export const Red: Type = makeShort('Red', 255, 0, 0);
/**
 * RGB RosyBrown Color instance
 *
 * @category RGB instances
 */
export const RosyBrown: Type = makeShort('RosyBrown', 188, 143, 143);
/**
 * RGB RoyalBlue Color instance
 *
 * @category RGB instances
 */
export const RoyalBlue: Type = makeShort('RoyalBlue', 65, 105, 225);
/**
 * RGB SaddleBrown Color instance
 *
 * @category RGB instances
 */
export const SaddleBrown: Type = makeShort('SaddleBrown', 139, 69, 19);
/**
 * RGB Salmon Color instance
 *
 * @category RGB instances
 */
export const Salmon: Type = makeShort('Salmon', 250, 128, 114);
/**
 * RGB SandyBrown Color instance
 *
 * @category RGB instances
 */
export const SandyBrown: Type = makeShort('SandyBrown', 244, 164, 96);
/**
 * RGB SeaGreen Color instance
 *
 * @category RGB instances
 */
export const SeaGreen: Type = makeShort('SeaGreen', 46, 139, 87);
/**
 * RGB SeaShell Color instance
 *
 * @category RGB instances
 */
export const SeaShell: Type = makeShort('SeaShell', 255, 245, 238);
/**
 * RGB Sienna Color instance
 *
 * @category RGB instances
 */
export const Sienna: Type = makeShort('Sienna', 160, 82, 45);
/**
 * RGB Silver Color instance
 *
 * @category RGB instances
 */
export const Silver: Type = makeShort('Silver', 192, 192, 192);
/**
 * RGB SkyBlue Color instance
 *
 * @category RGB instances
 */
export const SkyBlue: Type = makeShort('SkyBlue', 135, 206, 235);
/**
 * RGB SlateBlue Color instance
 *
 * @category RGB instances
 */
export const SlateBlue: Type = makeShort('SlateBlue', 106, 90, 205);
/**
 * RGB SlateGray Color instance
 *
 * @category RGB instances
 */
export const SlateGray: Type = makeShort('SlateGray', 112, 128, 144);
/**
 * RGB Snow Color instance
 *
 * @category RGB instances
 */
export const Snow: Type = makeShort('Snow', 255, 250, 250);
/**
 * RGB SpringGreen Color instance
 *
 * @category RGB instances
 */
export const SpringGreen: Type = makeShort('SpringGreen', 0, 255, 127);
/**
 * RGB SteelBlue Color instance
 *
 * @category RGB instances
 */
export const SteelBlue: Type = makeShort('SteelBlue', 70, 130, 180);
/**
 * RGB Tan Color instance
 *
 * @category RGB instances
 */
export const Tan: Type = makeShort('Tan', 210, 180, 140);
/**
 * RGB Teal Color instance
 *
 * @category RGB instances
 */
export const Teal: Type = makeShort('Teal', 0, 128, 128);
/**
 * RGB Thistle Color instance
 *
 * @category RGB instances
 */
export const Thistle: Type = makeShort('Thistle', 216, 191, 216);
/**
 * RGB Tomato Color instance
 *
 * @category RGB instances
 */
export const Tomato: Type = makeShort('Tomato', 255, 99, 71);
/**
 * RGB Turquoise Color instance
 *
 * @category RGB instances
 */
export const Turquoise: Type = makeShort('Turquoise', 64, 224, 208);
/**
 * RGB Violet Color instance
 *
 * @category RGB instances
 */
export const Violet: Type = makeShort('Violet', 238, 130, 238);
/**
 * RGB Wheat Color instance
 *
 * @category RGB instances
 */
export const Wheat: Type = makeShort('Wheat', 245, 222, 179);
/**
 * RGB White Color instance
 *
 * @category RGB instances
 */
export const White: Type = makeShort('White', 255, 255, 255);
/**
 * RGB WhiteSmoke Color instance
 *
 * @category RGB instances
 */
export const WhiteSmoke: Type = makeShort('WhiteSmoke', 245, 245, 245);
/**
 * RGB Yellow Color instance
 *
 * @category RGB instances
 */
export const Yellow: Type = makeShort('Yellow', 255, 255, 0);
/**
 * RGB YellowGreen Color instance
 *
 * @category RGB instances
 */
export const YellowGreen: Type = makeShort('YellowGreen', 154, 205, 50);
