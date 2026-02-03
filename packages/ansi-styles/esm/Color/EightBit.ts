/** This module defines EightBit colors */

import { MDataEquivalenceBasedEquality, MMatch, MTypes } from '@parischap/effect-lib';
import { Array, Equivalence, flow, Function, Hash, Predicate, Struct } from 'effect';
import * as ASColorBase from './Base.js';

/**
 * Module tag
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/ansi-styles/Color/EightBit/';
const _TypeId: unique symbol = Symbol.for(moduleTag) as _TypeId;
type _TypeId = typeof _TypeId;

/**
 * Possible eight-bit color codes
 *
 * @category Models
 */
export enum Code {
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
  DarkGoldenRod = 136,
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
  LightGoldenRod3 = 179,
  Tan = 180,
  MistyRose3 = 181,
  Thistle3 = 182,
  Plum2 = 183,
  Yellow3_2 = 184,
  Khaki3 = 185,
  LightGoldenRod2_1 = 186,
  LightYellow3 = 187,
  Grey84 = 188,
  LightSteelBlue1 = 189,
  Yellow2 = 190,
  DarkOliveGreen1_1 = 191,
  DarkOliveGreen1_2 = 192,
  DarkSeaGreen1_2 = 193,
  HoneyDew2 = 194,
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
  LightGoldenRod2_2 = 221,
  LightGoldenRod2_3 = 222,
  NavajoWhite1 = 223,
  MistyRose1 = 224,
  Thistle1 = 225,
  Yellow1 = 226,
  LightGoldenRod1 = 227,
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
  Grey93 = 255,
}

/**
 * Namespace for eight-bit color codes
 *
 * @category Models
 */
export namespace Code {
  /**
   * Builds the id of a color from its code
   *
   * @category Destructors
   */
  export const toString: MTypes.OneArgFunction<Code, string> = flow(
    MMatch.make,
    flow(
      flow(
        flow(
          MMatch.whenIs(Code.Black, Function.constant('Black')),
          MMatch.whenIs(Code.Maroon, Function.constant('Maroon')),
          MMatch.whenIs(Code.Green, Function.constant('Green')),
          MMatch.whenIs(Code.Olive, Function.constant('Olive')),
          MMatch.whenIs(Code.Navy, Function.constant('Navy')),
          MMatch.whenIs(Code.Purple_1, Function.constant('Purple_1')),
          MMatch.whenIs(Code.Teal, Function.constant('Teal')),
          MMatch.whenIs(Code.Silver, Function.constant('Silver')),
          MMatch.whenIs(Code.Grey, Function.constant('Grey')),
        ),
        flow(
          MMatch.whenIs(Code.Red, Function.constant('Red')),
          MMatch.whenIs(Code.Lime, Function.constant('Lime')),
          MMatch.whenIs(Code.Yellow, Function.constant('Yellow')),
          MMatch.whenIs(Code.Blue, Function.constant('Blue')),
          MMatch.whenIs(Code.Fuchsia, Function.constant('Fuchsia')),
          MMatch.whenIs(Code.Aqua, Function.constant('Aqua')),
          MMatch.whenIs(Code.White, Function.constant('White')),
          MMatch.whenIs(Code.Grey0, Function.constant('Grey0')),
          MMatch.whenIs(Code.NavyBlue, Function.constant('NavyBlue')),
        ),
        flow(
          MMatch.whenIs(Code.DarkBlue, Function.constant('DarkBlue')),
          MMatch.whenIs(Code.Blue3_1, Function.constant('Blue3_1')),
          MMatch.whenIs(Code.Blue3_2, Function.constant('Blue3_2')),
          MMatch.whenIs(Code.Blue1, Function.constant('Blue1')),
          MMatch.whenIs(Code.DarkGreen, Function.constant('DarkGreen')),
          MMatch.whenIs(Code.DeepSkyBlue4_1, Function.constant('DeepSkyBlue4_1')),
          MMatch.whenIs(Code.DeepSkyBlue4_2, Function.constant('DeepSkyBlue4_2')),
          MMatch.whenIs(Code.DeepSkyBlue4_3, Function.constant('DeepSkyBlue4_3')),
          MMatch.whenIs(Code.DodgerBlue3, Function.constant('DodgerBlue3')),
        ),
        flow(
          MMatch.whenIs(Code.DodgerBlue2, Function.constant('DodgerBlue2')),
          MMatch.whenIs(Code.Green4, Function.constant('Green4')),
          MMatch.whenIs(Code.SpringGreen4, Function.constant('SpringGreen4')),
          MMatch.whenIs(Code.Turquoise4, Function.constant('Turquoise4')),
          MMatch.whenIs(Code.DeepSkyBlue3_1, Function.constant('DeepSkyBlue3_1')),
          MMatch.whenIs(Code.DeepSkyBlue3_2, Function.constant('DeepSkyBlue3_2')),
          MMatch.whenIs(Code.DodgerBlue1, Function.constant('DodgerBlue1')),
          MMatch.whenIs(Code.Green3_1, Function.constant('Green3_1')),
          MMatch.whenIs(Code.SpringGreen3_1, Function.constant('SpringGreen3_1')),
        ),
        flow(
          MMatch.whenIs(Code.DarkCyan, Function.constant('DarkCyan')),
          MMatch.whenIs(Code.LightSeaGreen, Function.constant('LightSeaGreen')),
          MMatch.whenIs(Code.DeepSkyBlue2, Function.constant('DeepSkyBlue2')),
          MMatch.whenIs(Code.DeepSkyBlue1, Function.constant('DeepSkyBlue1')),
          MMatch.whenIs(Code.Green3_2, Function.constant('Green3_2')),
          MMatch.whenIs(Code.SpringGreen3_2, Function.constant('SpringGreen3_2')),
          MMatch.whenIs(Code.SpringGreen2_1, Function.constant('SpringGreen2_1')),
          MMatch.whenIs(Code.Cyan3, Function.constant('Cyan3')),
          MMatch.whenIs(Code.DarkTurquoise, Function.constant('DarkTurquoise')),
        ),
        flow(
          MMatch.whenIs(Code.Turquoise2, Function.constant('Turquoise2')),
          MMatch.whenIs(Code.Green1, Function.constant('Green1')),
          MMatch.whenIs(Code.SpringGreen2_2, Function.constant('SpringGreen2_2')),
          MMatch.whenIs(Code.SpringGreen1, Function.constant('SpringGreen1')),
          MMatch.whenIs(Code.MediumSpringGreen, Function.constant('MediumSpringGreen')),
          MMatch.whenIs(Code.Cyan2, Function.constant('Cyan2')),
          MMatch.whenIs(Code.Cyan1, Function.constant('Cyan1')),
          MMatch.whenIs(Code.DarkRed_1, Function.constant('DarkRed_1')),
          MMatch.whenIs(Code.DeepPink4_1, Function.constant('DeepPink4_1')),
        ),
        flow(
          MMatch.whenIs(Code.Purple4_1, Function.constant('Purple4_1')),
          MMatch.whenIs(Code.Purple4_2, Function.constant('Purple4_2')),
          MMatch.whenIs(Code.Purple3, Function.constant('Purple3')),
          MMatch.whenIs(Code.BlueViolet, Function.constant('BlueViolet')),
          MMatch.whenIs(Code.Orange4_1, Function.constant('Orange4_1')),
          MMatch.whenIs(Code.Grey37, Function.constant('Grey37')),
          MMatch.whenIs(Code.MediumPurple4, Function.constant('MediumPurple4')),
          MMatch.whenIs(Code.SlateBlue3_1, Function.constant('SlateBlue3_1')),
          MMatch.whenIs(Code.SlateBlue3_2, Function.constant('SlateBlue3_2')),
        ),
        flow(
          MMatch.whenIs(Code.RoyalBlue1, Function.constant('RoyalBlue1')),
          MMatch.whenIs(Code.Chartreuse4, Function.constant('Chartreuse4')),
          MMatch.whenIs(Code.DarkSeaGreen4_1, Function.constant('DarkSeaGreen4_1')),
          MMatch.whenIs(Code.PaleTurquoise4, Function.constant('PaleTurquoise4')),
          MMatch.whenIs(Code.SteelBlue, Function.constant('SteelBlue')),
          MMatch.whenIs(Code.SteelBlue3, Function.constant('SteelBlue3')),
          MMatch.whenIs(Code.CornflowerBlue, Function.constant('CornflowerBlue')),
          MMatch.whenIs(Code.Chartreuse3_1, Function.constant('Chartreuse3_1')),
          MMatch.whenIs(Code.DarkSeaGreen4_2, Function.constant('DarkSeaGreen4_2')),
        ),
        flow(
          MMatch.whenIs(Code.CadetBlue_1, Function.constant('CadetBlue_1')),
          MMatch.whenIs(Code.CadetBlue_2, Function.constant('CadetBlue_2')),
          MMatch.whenIs(Code.SkyBlue3, Function.constant('SkyBlue3')),
          MMatch.whenIs(Code.SteelBlue1_1, Function.constant('SteelBlue1_1')),
          MMatch.whenIs(Code.Chartreuse3_2, Function.constant('Chartreuse3_2')),
          MMatch.whenIs(Code.PaleGreen3_1, Function.constant('PaleGreen3_1')),
          MMatch.whenIs(Code.SeaGreen3, Function.constant('SeaGreen3')),
          MMatch.whenIs(Code.Aquamarine3, Function.constant('Aquamarine3')),
          MMatch.whenIs(Code.MediumTurquoise, Function.constant('MediumTurquoise')),
        ),
      ),
      flow(
        flow(
          MMatch.whenIs(Code.SteelBlue1_2, Function.constant('SteelBlue1_2')),
          MMatch.whenIs(Code.Chartreuse2_1, Function.constant('Chartreuse2_1')),
          MMatch.whenIs(Code.SeaGreen2, Function.constant('SeaGreen2')),
          MMatch.whenIs(Code.SeaGreen1_1, Function.constant('SeaGreen1_1')),
          MMatch.whenIs(Code.SeaGreen1_2, Function.constant('SeaGreen1_2')),
          MMatch.whenIs(Code.Aquamarine1_1, Function.constant('Aquamarine1_1')),
          MMatch.whenIs(Code.DarkSlateGray2, Function.constant('DarkSlateGray2')),
          MMatch.whenIs(Code.DarkRed_2, Function.constant('DarkRed_2')),
          MMatch.whenIs(Code.DeepPink4_2, Function.constant('DeepPink4_2')),
        ),
        flow(
          MMatch.whenIs(Code.DarkMagenta_1, Function.constant('DarkMagenta_1')),
          MMatch.whenIs(Code.DarkMagenta_2, Function.constant('DarkMagenta_2')),
          MMatch.whenIs(Code.DarkViolet_1, Function.constant('DarkViolet_1')),
          MMatch.whenIs(Code.Purple_2, Function.constant('Purple_2')),
          MMatch.whenIs(Code.Orange4_2, Function.constant('Orange4_2')),
          MMatch.whenIs(Code.LightPink4, Function.constant('LightPink4')),
          MMatch.whenIs(Code.Plum4, Function.constant('Plum4')),
          MMatch.whenIs(Code.MediumPurple3_1, Function.constant('MediumPurple3_1')),
          MMatch.whenIs(Code.MediumPurple3_2, Function.constant('MediumPurple3_2')),
        ),
        flow(
          MMatch.whenIs(Code.SlateBlue1, Function.constant('SlateBlue1')),
          MMatch.whenIs(Code.Yellow4_1, Function.constant('Yellow4_1')),
          MMatch.whenIs(Code.Wheat4, Function.constant('Wheat4')),
          MMatch.whenIs(Code.Grey53, Function.constant('Grey53')),
          MMatch.whenIs(Code.LightSlateGrey, Function.constant('LightSlateGrey')),
          MMatch.whenIs(Code.MediumPurple, Function.constant('MediumPurple')),
          MMatch.whenIs(Code.LightSlateBlue, Function.constant('LightSlateBlue')),
          MMatch.whenIs(Code.Yellow4_2, Function.constant('Yellow4_2')),
          MMatch.whenIs(Code.DarkOliveGreen3_1, Function.constant('DarkOliveGreen3_1')),
        ),
        flow(
          MMatch.whenIs(Code.DarkSeaGreen, Function.constant('DarkSeaGreen')),
          MMatch.whenIs(Code.LightSkyBlue3_1, Function.constant('LightSkyBlue3_1')),
          MMatch.whenIs(Code.LightSkyBlue3_2, Function.constant('LightSkyBlue3_2')),
          MMatch.whenIs(Code.SkyBlue2, Function.constant('SkyBlue2')),
          MMatch.whenIs(Code.Chartreuse2_2, Function.constant('Chartreuse2_2')),
          MMatch.whenIs(Code.DarkOliveGreen3_2, Function.constant('DarkOliveGreen3_2')),
          MMatch.whenIs(Code.PaleGreen3_2, Function.constant('PaleGreen3_2')),
          MMatch.whenIs(Code.DarkSeaGreen3_1, Function.constant('DarkSeaGreen3_1')),
          MMatch.whenIs(Code.DarkSlateGray3, Function.constant('DarkSlateGray3')),
        ),
        flow(
          MMatch.whenIs(Code.SkyBlue1, Function.constant('SkyBlue1')),
          MMatch.whenIs(Code.Chartreuse1, Function.constant('Chartreuse1')),
          MMatch.whenIs(Code.LightGreen_1, Function.constant('LightGreen_1')),
          MMatch.whenIs(Code.LightGreen_2, Function.constant('LightGreen_2')),
          MMatch.whenIs(Code.PaleGreen1_1, Function.constant('PaleGreen1_1')),
          MMatch.whenIs(Code.Aquamarine1_2, Function.constant('Aquamarine1_2')),
          MMatch.whenIs(Code.DarkSlateGray1, Function.constant('DarkSlateGray1')),
          MMatch.whenIs(Code.Red3_1, Function.constant('Red3_1')),
          MMatch.whenIs(Code.DeepPink4_3, Function.constant('DeepPink4_3')),
        ),
        flow(
          MMatch.whenIs(Code.MediumVioletRed, Function.constant('MediumVioletRed')),
          MMatch.whenIs(Code.Magenta3_1, Function.constant('Magenta3_1')),
          MMatch.whenIs(Code.DarkViolet_2, Function.constant('DarkViolet_2')),
          MMatch.whenIs(Code.Purple_3, Function.constant('Purple_3')),
          MMatch.whenIs(Code.DarkOrange3_1, Function.constant('DarkOrange3_1')),
          MMatch.whenIs(Code.IndianRed_1, Function.constant('IndianRed_1')),
          MMatch.whenIs(Code.HotPink3_1, Function.constant('HotPink3_1')),
          MMatch.whenIs(Code.MediumOrchid3, Function.constant('MediumOrchid3')),
          MMatch.whenIs(Code.MediumOrchid, Function.constant('MediumOrchid')),
        ),
        flow(
          MMatch.whenIs(Code.MediumPurple2_1, Function.constant('MediumPurple2_1')),
          MMatch.whenIs(Code.DarkGoldenRod, Function.constant('DarkGoldenRod')),
          MMatch.whenIs(Code.LightSalmon3_1, Function.constant('LightSalmon3_1')),
          MMatch.whenIs(Code.RosyBrown, Function.constant('RosyBrown')),
          MMatch.whenIs(Code.Grey63, Function.constant('Grey63')),
          MMatch.whenIs(Code.MediumPurple2_2, Function.constant('MediumPurple2_2')),
          MMatch.whenIs(Code.MediumPurple1, Function.constant('MediumPurple1')),
          MMatch.whenIs(Code.Gold3_1, Function.constant('Gold3_1')),
          MMatch.whenIs(Code.DarkKhaki, Function.constant('DarkKhaki')),
        ),
        flow(
          MMatch.whenIs(Code.NavajoWhite3, Function.constant('NavajoWhite3')),
          MMatch.whenIs(Code.Grey69, Function.constant('Grey69')),
          MMatch.whenIs(Code.LightSteelBlue3, Function.constant('LightSteelBlue3')),
          MMatch.whenIs(Code.LightSteelBlue, Function.constant('LightSteelBlue')),
          MMatch.whenIs(Code.Yellow3_1, Function.constant('Yellow3_1')),
          MMatch.whenIs(Code.DarkOliveGreen3_3, Function.constant('DarkOliveGreen3_3')),
          MMatch.whenIs(Code.DarkSeaGreen3_2, Function.constant('DarkSeaGreen3_2')),
          MMatch.whenIs(Code.DarkSeaGreen2_1, Function.constant('DarkSeaGreen2_1')),
          MMatch.whenIs(Code.LightCyan3, Function.constant('LightCyan3')),
        ),
        flow(
          MMatch.whenIs(Code.LightSkyBlue1, Function.constant('LightSkyBlue1')),
          MMatch.whenIs(Code.GreenYellow, Function.constant('GreenYellow')),
          MMatch.whenIs(Code.DarkOliveGreen2, Function.constant('DarkOliveGreen2')),
          MMatch.whenIs(Code.PaleGreen1_2, Function.constant('PaleGreen1_2')),
          MMatch.whenIs(Code.DarkSeaGreen2_2, Function.constant('DarkSeaGreen2_2')),
          MMatch.whenIs(Code.DarkSeaGreen1_1, Function.constant('DarkSeaGreen1_1')),
          MMatch.whenIs(Code.PaleTurquoise1, Function.constant('PaleTurquoise1')),
          MMatch.whenIs(Code.Red3_2, Function.constant('Red3_2')),
          MMatch.whenIs(Code.DeepPink3_1, Function.constant('DeepPink3_1')),
        ),
      ),
      flow(
        flow(
          MMatch.whenIs(Code.DeepPink3_2, Function.constant('DeepPink3_2')),
          MMatch.whenIs(Code.Magenta3_2, Function.constant('Magenta3_2')),
          MMatch.whenIs(Code.Magenta3_3, Function.constant('Magenta3_3')),
          MMatch.whenIs(Code.Magenta2_1, Function.constant('Magenta2_1')),
          MMatch.whenIs(Code.DarkOrange3_2, Function.constant('DarkOrange3_2')),
          MMatch.whenIs(Code.IndianRed_2, Function.constant('IndianRed_2')),
          MMatch.whenIs(Code.HotPink3_2, Function.constant('HotPink3_2')),
          MMatch.whenIs(Code.HotPink2, Function.constant('HotPink2')),
          MMatch.whenIs(Code.Orchid, Function.constant('Orchid')),
        ),
        flow(
          MMatch.whenIs(Code.MediumOrchid1_1, Function.constant('MediumOrchid1_1')),
          MMatch.whenIs(Code.Orange3, Function.constant('Orange3')),
          MMatch.whenIs(Code.LightSalmon3_2, Function.constant('LightSalmon3_2')),
          MMatch.whenIs(Code.LightPink3, Function.constant('LightPink3')),
          MMatch.whenIs(Code.Pink3, Function.constant('Pink3')),
          MMatch.whenIs(Code.Plum3, Function.constant('Plum3')),
          MMatch.whenIs(Code.Violet, Function.constant('Violet')),
          MMatch.whenIs(Code.Gold3_2, Function.constant('Gold3_2')),
          MMatch.whenIs(Code.LightGoldenRod3, Function.constant('LightGoldenRod3')),
        ),
        flow(
          MMatch.whenIs(Code.Tan, Function.constant('Tan')),
          MMatch.whenIs(Code.MistyRose3, Function.constant('MistyRose3')),
          MMatch.whenIs(Code.Thistle3, Function.constant('Thistle3')),
          MMatch.whenIs(Code.Plum2, Function.constant('Plum2')),
          MMatch.whenIs(Code.Yellow3_2, Function.constant('Yellow3_2')),
          MMatch.whenIs(Code.Khaki3, Function.constant('Khaki3')),
          MMatch.whenIs(Code.LightGoldenRod2_1, Function.constant('LightGoldenRod2_1')),
          MMatch.whenIs(Code.LightYellow3, Function.constant('LightYellow3')),
          MMatch.whenIs(Code.Grey84, Function.constant('Grey84')),
        ),
        flow(
          MMatch.whenIs(Code.LightSteelBlue1, Function.constant('LightSteelBlue1')),
          MMatch.whenIs(Code.Yellow2, Function.constant('Yellow2')),
          MMatch.whenIs(Code.DarkOliveGreen1_1, Function.constant('DarkOliveGreen1_1')),
          MMatch.whenIs(Code.DarkOliveGreen1_2, Function.constant('DarkOliveGreen1_2')),
          MMatch.whenIs(Code.DarkSeaGreen1_2, Function.constant('DarkSeaGreen1_2')),
          MMatch.whenIs(Code.HoneyDew2, Function.constant('HoneyDew2')),
          MMatch.whenIs(Code.LightCyan1, Function.constant('LightCyan1')),
          MMatch.whenIs(Code.Red1, Function.constant('Red1')),
          MMatch.whenIs(Code.DeepPink2, Function.constant('DeepPink2')),
        ),
        flow(
          MMatch.whenIs(Code.DeepPink1_1, Function.constant('DeepPink1_1')),
          MMatch.whenIs(Code.DeepPink1_2, Function.constant('DeepPink1_2')),
          MMatch.whenIs(Code.Magenta2_2, Function.constant('Magenta2_2')),
          MMatch.whenIs(Code.Magenta1, Function.constant('Magenta1')),
          MMatch.whenIs(Code.OrangeRed1, Function.constant('OrangeRed1')),
          MMatch.whenIs(Code.IndianRed1_1, Function.constant('IndianRed1_1')),
          MMatch.whenIs(Code.IndianRed1_2, Function.constant('IndianRed1_2')),
          MMatch.whenIs(Code.HotPink_1, Function.constant('HotPink_1')),
          MMatch.whenIs(Code.HotPink_2, Function.constant('HotPink_2')),
        ),
        flow(
          MMatch.whenIs(Code.MediumOrchid1_2, Function.constant('MediumOrchid1_2')),
          MMatch.whenIs(Code.DarkOrange, Function.constant('DarkOrange')),
          MMatch.whenIs(Code.Salmon1, Function.constant('Salmon1')),
          MMatch.whenIs(Code.LightCoral, Function.constant('LightCoral')),
          MMatch.whenIs(Code.PaleVioletRed1, Function.constant('PaleVioletRed1')),
          MMatch.whenIs(Code.Orchid2, Function.constant('Orchid2')),
          MMatch.whenIs(Code.Orchid1, Function.constant('Orchid1')),
          MMatch.whenIs(Code.Orange1, Function.constant('Orange1')),
          MMatch.whenIs(Code.SandyBrown, Function.constant('SandyBrown')),
        ),
        flow(
          MMatch.whenIs(Code.LightSalmon1, Function.constant('LightSalmon1')),
          MMatch.whenIs(Code.LightPink1, Function.constant('LightPink1')),
          MMatch.whenIs(Code.Pink1, Function.constant('Pink1')),
          MMatch.whenIs(Code.Plum1, Function.constant('Plum1')),
          MMatch.whenIs(Code.Gold1, Function.constant('Gold1')),
          MMatch.whenIs(Code.LightGoldenRod2_2, Function.constant('LightGoldenRod2_2')),
          MMatch.whenIs(Code.LightGoldenRod2_3, Function.constant('LightGoldenRod2_3')),
          MMatch.whenIs(Code.NavajoWhite1, Function.constant('NavajoWhite1')),
          MMatch.whenIs(Code.MistyRose1, Function.constant('MistyRose1')),
        ),
        flow(
          MMatch.whenIs(Code.Thistle1, Function.constant('Thistle1')),
          MMatch.whenIs(Code.Yellow1, Function.constant('Yellow1')),
          MMatch.whenIs(Code.LightGoldenRod1, Function.constant('LightGoldenRod1')),
          MMatch.whenIs(Code.Khaki1, Function.constant('Khaki1')),
          MMatch.whenIs(Code.Wheat1, Function.constant('Wheat1')),
          MMatch.whenIs(Code.Cornsilk1, Function.constant('Cornsilk1')),
          MMatch.whenIs(Code.Grey100, Function.constant('Grey100')),
          MMatch.whenIs(Code.Grey3, Function.constant('Grey3')),
          MMatch.whenIs(Code.Grey7, Function.constant('Grey7')),
        ),
        flow(
          MMatch.whenIs(Code.Grey11, Function.constant('Grey11')),
          MMatch.whenIs(Code.Grey15, Function.constant('Grey15')),
          MMatch.whenIs(Code.Grey19, Function.constant('Grey19')),
          MMatch.whenIs(Code.Grey23, Function.constant('Grey23')),
          MMatch.whenIs(Code.Grey27, Function.constant('Grey27')),
          MMatch.whenIs(Code.Grey30, Function.constant('Grey30')),
          MMatch.whenIs(Code.Grey35, Function.constant('Grey35')),
          MMatch.whenIs(Code.Grey39, Function.constant('Grey39')),
          MMatch.whenIs(Code.Grey42, Function.constant('Grey42')),
        ),
      ),
      flow(
        flow(
          MMatch.whenIs(Code.Grey46, Function.constant('Grey46')),
          MMatch.whenIs(Code.Grey50, Function.constant('Grey50')),
          MMatch.whenIs(Code.Grey54, Function.constant('Grey54')),
          MMatch.whenIs(Code.Grey58, Function.constant('Grey58')),
          MMatch.whenIs(Code.Grey62, Function.constant('Grey62')),
          MMatch.whenIs(Code.Grey66, Function.constant('Grey66')),
          MMatch.whenIs(Code.Grey70, Function.constant('Grey70')),
          MMatch.whenIs(Code.Grey74, Function.constant('Grey74')),
          MMatch.whenIs(Code.Grey78, Function.constant('Grey78')),
        ),
        flow(
          MMatch.whenIs(Code.Grey82, Function.constant('Grey82')),
          MMatch.whenIs(Code.Grey85, Function.constant('Grey85')),
          MMatch.whenIs(Code.Grey89, Function.constant('Grey89')),
          MMatch.whenIs(Code.Grey93, Function.constant('Grey93')),
        ),
      ),
    ),
    MMatch.exhaustive,
  );
}

/**
 * EightBit color Type
 *
 * @category Models
 */
export class Type extends ASColorBase.Type {
  /** Code of this color */
  readonly code: Code;

  /** Class constructor */
  private constructor({ code }: { readonly code: Code }) {
    super({
      foregroundId: `EightBit${Code.toString(code)}`,
      foregroundSequence: Array.make(38, 5, code),
    });
    this.code = code;
  }

  /** Static constructor */
  static make(params: { readonly code: Code }): Type {
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
export const make = (params: { readonly code: Code }): Type => Type.make(params);

/**
 * Gets the `code` property of `self`
 *
 * @category Destructors
 */
export const code: MTypes.OneArgFunction<Type, Code> = Struct.get('code');

/**
 * Eightbit Black Color instance
 *
 * @category EightBit instances
 */
export const black: Type = make({ code: Code.Black });
/**
 * Eightbit Maroon Color instance
 *
 * @category EightBit instances
 */
export const maroon: Type = make({ code: Code.Maroon });
/**
 * Eightbit Green Color instance
 *
 * @category EightBit instances
 */
export const green: Type = make({ code: Code.Green });
/**
 * Eightbit Olive Color instance
 *
 * @category EightBit instances
 */
export const olive: Type = make({ code: Code.Olive });
/**
 * Eightbit Navy Color instance
 *
 * @category EightBit instances
 */
export const navy: Type = make({ code: Code.Navy });
/**
 * Eightbit Purple_1 Color instance
 *
 * @category EightBit instances
 */
export const purple_1: Type = make({ code: Code.Purple_1 });
/**
 * Eightbit Teal Color instance
 *
 * @category EightBit instances
 */
export const teal: Type = make({ code: Code.Teal });
/**
 * Eightbit Silver Color instance
 *
 * @category EightBit instances
 */
export const silver: Type = make({ code: Code.Silver });
/**
 * Eightbit Grey Color instance
 *
 * @category EightBit instances
 */
export const grey: Type = make({ code: Code.Grey });
/**
 * Eightbit Red Color instance
 *
 * @category EightBit instances
 */
export const red: Type = make({ code: Code.Red });
/**
 * Eightbit Lime Color instance
 *
 * @category EightBit instances
 */
export const lime: Type = make({ code: Code.Lime });
/**
 * Eightbit Yellow Color instance
 *
 * @category EightBit instances
 */
export const yellow: Type = make({ code: Code.Yellow });
/**
 * Eightbit Blue Color instance
 *
 * @category EightBit instances
 */
export const blue: Type = make({ code: Code.Blue });
/**
 * Eightbit Fuchsia Color instance
 *
 * @category EightBit instances
 */
export const fuchsia: Type = make({ code: Code.Fuchsia });
/**
 * Eightbit Aqua Color instance
 *
 * @category EightBit instances
 */
export const aqua: Type = make({ code: Code.Aqua });
/**
 * Eightbit White Color instance
 *
 * @category EightBit instances
 */
export const white: Type = make({ code: Code.White });
/**
 * Eightbit Grey0 Color instance
 *
 * @category EightBit instances
 */
export const grey0: Type = make({ code: Code.Grey0 });
/**
 * Eightbit NavyBlue Color instance
 *
 * @category EightBit instances
 */
export const navyBlue: Type = make({ code: Code.NavyBlue });
/**
 * Eightbit DarkBlue Color instance
 *
 * @category EightBit instances
 */
export const darkBlue: Type = make({ code: Code.DarkBlue });
/**
 * Eightbit Blue3_1 Color instance
 *
 * @category EightBit instances
 */
export const blue3_1: Type = make({ code: Code.Blue3_1 });
/**
 * Eightbit Blue3_2 Color instance
 *
 * @category EightBit instances
 */
export const blue3_2: Type = make({ code: Code.Blue3_2 });
/**
 * Eightbit Blue1 Color instance
 *
 * @category EightBit instances
 */
export const blue1: Type = make({ code: Code.Blue1 });
/**
 * Eightbit DarkGreen Color instance
 *
 * @category EightBit instances
 */
export const darkGreen: Type = make({
  code: Code.DarkGreen,
});
/**
 * Eightbit DeepSkyBlue4_1 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue4_1: Type = make({
  code: Code.DeepSkyBlue4_1,
});
/**
 * Eightbit DeepSkyBlue4_2 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue4_2: Type = make({
  code: Code.DeepSkyBlue4_2,
});
/**
 * Eightbit DeepSkyBlue4_3 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue4_3: Type = make({
  code: Code.DeepSkyBlue4_3,
});
/**
 * Eightbit DodgerBlue3 Color instance
 *
 * @category EightBit instances
 */
export const dodgerBlue3: Type = make({
  code: Code.DodgerBlue3,
});
/**
 * Eightbit DodgerBlue2 Color instance
 *
 * @category EightBit instances
 */
export const dodgerBlue2: Type = make({
  code: Code.DodgerBlue2,
});
/**
 * Eightbit Green4 Color instance
 *
 * @category EightBit instances
 */
export const green4: Type = make({ code: Code.Green4 });
/**
 * Eightbit SpringGreen4 Color instance
 *
 * @category EightBit instances
 */
export const springGreen4: Type = make({
  code: Code.SpringGreen4,
});
/**
 * Eightbit Turquoise4 Color instance
 *
 * @category EightBit instances
 */
export const turquoise4: Type = make({
  code: Code.Turquoise4,
});
/**
 * Eightbit DeepSkyBlue3_1 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue3_1: Type = make({
  code: Code.DeepSkyBlue3_1,
});
/**
 * Eightbit DeepSkyBlue3_2 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue3_2: Type = make({
  code: Code.DeepSkyBlue3_2,
});
/**
 * Eightbit DodgerBlue1 Color instance
 *
 * @category EightBit instances
 */
export const dodgerBlue1: Type = make({
  code: Code.DodgerBlue1,
});
/**
 * Eightbit Green3_1 Color instance
 *
 * @category EightBit instances
 */
export const green3_1: Type = make({ code: Code.Green3_1 });
/**
 * Eightbit SpringGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const springGreen3_1: Type = make({
  code: Code.SpringGreen3_1,
});
/**
 * Eightbit DarkCyan Color instance
 *
 * @category EightBit instances
 */
export const darkCyan: Type = make({ code: Code.DarkCyan });
/**
 * Eightbit LightSeaGreen Color instance
 *
 * @category EightBit instances
 */
export const lightSeaGreen: Type = make({
  code: Code.LightSeaGreen,
});
/**
 * Eightbit DeepSkyBlue2 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue2: Type = make({
  code: Code.DeepSkyBlue2,
});
/**
 * Eightbit DeepSkyBlue1 Color instance
 *
 * @category EightBit instances
 */
export const deepSkyBlue1: Type = make({
  code: Code.DeepSkyBlue1,
});
/**
 * Eightbit Green3_2 Color instance
 *
 * @category EightBit instances
 */
export const green3_2: Type = make({ code: Code.Green3_2 });
/**
 * Eightbit SpringGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const springGreen3_2: Type = make({
  code: Code.SpringGreen3_2,
});
/**
 * Eightbit SpringGreen2_1 Color instance
 *
 * @category EightBit instances
 */
export const springGreen2_1: Type = make({
  code: Code.SpringGreen2_1,
});
/**
 * Eightbit Cyan3 Color instance
 *
 * @category EightBit instances
 */
export const cyan3: Type = make({ code: Code.Cyan3 });
/**
 * Eightbit DarkTurquoise Color instance
 *
 * @category EightBit instances
 */
export const darkTurquoise: Type = make({
  code: Code.DarkTurquoise,
});
/**
 * Eightbit Turquoise2 Color instance
 *
 * @category EightBit instances
 */
export const turquoise2: Type = make({
  code: Code.Turquoise2,
});
/**
 * Eightbit Green1 Color instance
 *
 * @category EightBit instances
 */
export const green1: Type = make({ code: Code.Green1 });
/**
 * Eightbit SpringGreen2_2 Color instance
 *
 * @category EightBit instances
 */
export const springGreen2_2: Type = make({
  code: Code.SpringGreen2_2,
});
/**
 * Eightbit SpringGreen1 Color instance
 *
 * @category EightBit instances
 */
export const springGreen1: Type = make({
  code: Code.SpringGreen1,
});
/**
 * Eightbit MediumSpringGreen Color instance
 *
 * @category EightBit instances
 */
export const mediumSpringGreen: Type = make({
  code: Code.MediumSpringGreen,
});
/**
 * Eightbit Cyan2 Color instance
 *
 * @category EightBit instances
 */
export const cyan2: Type = make({ code: Code.Cyan2 });
/**
 * Eightbit Cyan1 Color instance
 *
 * @category EightBit instances
 */
export const cyan1: Type = make({ code: Code.Cyan1 });
/**
 * Eightbit DarkRed_1 Color instance
 *
 * @category EightBit instances
 */
export const darkRed_1: Type = make({
  code: Code.DarkRed_1,
});
/**
 * Eightbit DeepPink4_1 Color instance
 *
 * @category EightBit instances
 */
export const deepPink4_1: Type = make({
  code: Code.DeepPink4_1,
});
/**
 * Eightbit Purple4_1 Color instance
 *
 * @category EightBit instances
 */
export const purple4_1: Type = make({
  code: Code.Purple4_1,
});
/**
 * Eightbit Purple4_2 Color instance
 *
 * @category EightBit instances
 */
export const purple4_2: Type = make({
  code: Code.Purple4_2,
});
/**
 * Eightbit Purple3 Color instance
 *
 * @category EightBit instances
 */
export const purple3: Type = make({ code: Code.Purple3 });
/**
 * Eightbit BlueViolet Color instance
 *
 * @category EightBit instances
 */
export const blueViolet: Type = make({
  code: Code.BlueViolet,
});
/**
 * Eightbit Orange4_1 Color instance
 *
 * @category EightBit instances
 */
export const orange4_1: Type = make({
  code: Code.Orange4_1,
});
/**
 * Eightbit Grey37 Color instance
 *
 * @category EightBit instances
 */
export const grey37: Type = make({ code: Code.Grey37 });
/**
 * Eightbit MediumPurple4 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple4: Type = make({
  code: Code.MediumPurple4,
});
/**
 * Eightbit SlateBlue3_1 Color instance
 *
 * @category EightBit instances
 */
export const slateBlue3_1: Type = make({
  code: Code.SlateBlue3_1,
});
/**
 * Eightbit SlateBlue3_2 Color instance
 *
 * @category EightBit instances
 */
export const slateBlue3_2: Type = make({
  code: Code.SlateBlue3_2,
});
/**
 * Eightbit RoyalBlue1 Color instance
 *
 * @category EightBit instances
 */
export const royalBlue1: Type = make({
  code: Code.RoyalBlue1,
});
/**
 * Eightbit Chartreuse4 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse4: Type = make({
  code: Code.Chartreuse4,
});
/**
 * Eightbit DarkSeaGreen4_1 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen4_1: Type = make({
  code: Code.DarkSeaGreen4_1,
});
/**
 * Eightbit PaleTurquoise4 Color instance
 *
 * @category EightBit instances
 */
export const paleTurquoise4: Type = make({
  code: Code.PaleTurquoise4,
});
/**
 * Eightbit SteelBlue Color instance
 *
 * @category EightBit instances
 */
export const steelBlue: Type = make({
  code: Code.SteelBlue,
});
/**
 * Eightbit SteelBlue3 Color instance
 *
 * @category EightBit instances
 */
export const steelBlue3: Type = make({
  code: Code.SteelBlue3,
});
/**
 * Eightbit CornflowerBlue Color instance
 *
 * @category EightBit instances
 */
export const cornflowerBlue: Type = make({
  code: Code.CornflowerBlue,
});
/**
 * Eightbit Chartreuse3_1 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse3_1: Type = make({
  code: Code.Chartreuse3_1,
});
/**
 * Eightbit DarkSeaGreen4_2 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen4_2: Type = make({
  code: Code.DarkSeaGreen4_2,
});
/**
 * Eightbit CadetBlue_1 Color instance
 *
 * @category EightBit instances
 */
export const cadetBlue_1: Type = make({
  code: Code.CadetBlue_1,
});
/**
 * Eightbit CadetBlue_2 Color instance
 *
 * @category EightBit instances
 */
export const cadetBlue_2: Type = make({
  code: Code.CadetBlue_2,
});
/**
 * Eightbit SkyBlue3 Color instance
 *
 * @category EightBit instances
 */
export const skyBlue3: Type = make({ code: Code.SkyBlue3 });
/**
 * Eightbit SteelBlue1_1 Color instance
 *
 * @category EightBit instances
 */
export const steelBlue1_1: Type = make({
  code: Code.SteelBlue1_1,
});
/**
 * Eightbit Chartreuse3_2 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse3_2: Type = make({
  code: Code.Chartreuse3_2,
});
/**
 * Eightbit PaleGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const paleGreen3_1: Type = make({
  code: Code.PaleGreen3_1,
});
/**
 * Eightbit SeaGreen3 Color instance
 *
 * @category EightBit instances
 */
export const seaGreen3: Type = make({
  code: Code.SeaGreen3,
});
/**
 * Eightbit Aquamarine3 Color instance
 *
 * @category EightBit instances
 */
export const aquamarine3: Type = make({
  code: Code.Aquamarine3,
});
/**
 * Eightbit MediumTurquoise Color instance
 *
 * @category EightBit instances
 */
export const mediumTurquoise: Type = make({
  code: Code.MediumTurquoise,
});
/**
 * Eightbit SteelBlue1_2 Color instance
 *
 * @category EightBit instances
 */
export const steelBlue1_2: Type = make({
  code: Code.SteelBlue1_2,
});
/**
 * Eightbit Chartreuse2_1 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse2_1: Type = make({
  code: Code.Chartreuse2_1,
});
/**
 * Eightbit SeaGreen2 Color instance
 *
 * @category EightBit instances
 */
export const seaGreen2: Type = make({
  code: Code.SeaGreen2,
});
/**
 * Eightbit SeaGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const seaGreen1_1: Type = make({
  code: Code.SeaGreen1_1,
});
/**
 * Eightbit SeaGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const seaGreen1_2: Type = make({
  code: Code.SeaGreen1_2,
});
/**
 * Eightbit Aquamarine1_1 Color instance
 *
 * @category EightBit instances
 */
export const aquamarine1_1: Type = make({
  code: Code.Aquamarine1_1,
});
/**
 * Eightbit DarkSlateGray2 Color instance
 *
 * @category EightBit instances
 */
export const darkSlateGray2: Type = make({
  code: Code.DarkSlateGray2,
});
/**
 * Eightbit DarkRed_2 Color instance
 *
 * @category EightBit instances
 */
export const darkRed_2: Type = make({
  code: Code.DarkRed_2,
});
/**
 * Eightbit DeepPink4_2 Color instance
 *
 * @category EightBit instances
 */
export const deepPink4_2: Type = make({
  code: Code.DeepPink4_2,
});
/**
 * Eightbit DarkMagenta_1 Color instance
 *
 * @category EightBit instances
 */
export const darkMagenta_1: Type = make({
  code: Code.DarkMagenta_1,
});
/**
 * Eightbit DarkMagenta_2 Color instance
 *
 * @category EightBit instances
 */
export const darkMagenta_2: Type = make({
  code: Code.DarkMagenta_2,
});
/**
 * Eightbit DarkViolet_1 Color instance
 *
 * @category EightBit instances
 */
export const darkViolet_1: Type = make({
  code: Code.DarkViolet_1,
});
/**
 * Eightbit Purple_2 Color instance
 *
 * @category EightBit instances
 */
export const purple_2: Type = make({ code: Code.Purple_2 });
/**
 * Eightbit Orange4_2 Color instance
 *
 * @category EightBit instances
 */
export const orange4_2: Type = make({
  code: Code.Orange4_2,
});
/**
 * Eightbit LightPink4 Color instance
 *
 * @category EightBit instances
 */
export const lightPink4: Type = make({
  code: Code.LightPink4,
});
/**
 * Eightbit Plum4 Color instance
 *
 * @category EightBit instances
 */
export const plum4: Type = make({ code: Code.Plum4 });
/**
 * Eightbit MediumPurple3_1 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple3_1: Type = make({
  code: Code.MediumPurple3_1,
});
/**
 * Eightbit MediumPurple3_2 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple3_2: Type = make({
  code: Code.MediumPurple3_2,
});
/**
 * Eightbit SlateBlue1 Color instance
 *
 * @category EightBit instances
 */
export const slateBlue1: Type = make({
  code: Code.SlateBlue1,
});
/**
 * Eightbit Yellow4_1 Color instance
 *
 * @category EightBit instances
 */
export const yellow4_1: Type = make({
  code: Code.Yellow4_1,
});
/**
 * Eightbit Wheat4 Color instance
 *
 * @category EightBit instances
 */
export const wheat4: Type = make({ code: Code.Wheat4 });
/**
 * Eightbit Grey53 Color instance
 *
 * @category EightBit instances
 */
export const grey53: Type = make({ code: Code.Grey53 });
/**
 * Eightbit LightSlateGrey Color instance
 *
 * @category EightBit instances
 */
export const lightSlateGrey: Type = make({
  code: Code.LightSlateGrey,
});
/**
 * Eightbit MediumPurple Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple: Type = make({
  code: Code.MediumPurple,
});
/**
 * Eightbit LightSlateBlue Color instance
 *
 * @category EightBit instances
 */
export const lightSlateBlue: Type = make({
  code: Code.LightSlateBlue,
});
/**
 * Eightbit Yellow4_2 Color instance
 *
 * @category EightBit instances
 */
export const yellow4_2: Type = make({
  code: Code.Yellow4_2,
});
/**
 * Eightbit DarkOliveGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen3_1: Type = make({
  code: Code.DarkOliveGreen3_1,
});
/**
 * Eightbit DarkSeaGreen Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen: Type = make({
  code: Code.DarkSeaGreen,
});
/**
 * Eightbit LightSkyBlue3_1 Color instance
 *
 * @category EightBit instances
 */
export const lightSkyBlue3_1: Type = make({
  code: Code.LightSkyBlue3_1,
});
/**
 * Eightbit LightSkyBlue3_2 Color instance
 *
 * @category EightBit instances
 */
export const lightSkyBlue3_2: Type = make({
  code: Code.LightSkyBlue3_2,
});
/**
 * Eightbit SkyBlue2 Color instance
 *
 * @category EightBit instances
 */
export const skyBlue2: Type = make({ code: Code.SkyBlue2 });
/**
 * Eightbit Chartreuse2_2 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse2_2: Type = make({
  code: Code.Chartreuse2_2,
});
/**
 * Eightbit DarkOliveGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen3_2: Type = make({
  code: Code.DarkOliveGreen3_2,
});
/**
 * Eightbit PaleGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const paleGreen3_2: Type = make({
  code: Code.PaleGreen3_2,
});
/**
 * Eightbit DarkSeaGreen3_1 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen3_1: Type = make({
  code: Code.DarkSeaGreen3_1,
});
/**
 * Eightbit DarkSlateGray3 Color instance
 *
 * @category EightBit instances
 */
export const darkSlateGray3: Type = make({
  code: Code.DarkSlateGray3,
});
/**
 * Eightbit SkyBlue1 Color instance
 *
 * @category EightBit instances
 */
export const skyBlue1: Type = make({ code: Code.SkyBlue1 });
/**
 * Eightbit Chartreuse1 Color instance
 *
 * @category EightBit instances
 */
export const chartreuse1: Type = make({
  code: Code.Chartreuse1,
});
/**
 * Eightbit LightGreen_1 Color instance
 *
 * @category EightBit instances
 */
export const lightGreen_1: Type = make({
  code: Code.LightGreen_1,
});
/**
 * Eightbit LightGreen_2 Color instance
 *
 * @category EightBit instances
 */
export const lightGreen_2: Type = make({
  code: Code.LightGreen_2,
});
/**
 * Eightbit PaleGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const paleGreen1_1: Type = make({
  code: Code.PaleGreen1_1,
});
/**
 * Eightbit Aquamarine1_2 Color instance
 *
 * @category EightBit instances
 */
export const aquamarine1_2: Type = make({
  code: Code.Aquamarine1_2,
});
/**
 * Eightbit DarkSlateGray1 Color instance
 *
 * @category EightBit instances
 */
export const darkSlateGray1: Type = make({
  code: Code.DarkSlateGray1,
});
/**
 * Eightbit Red3_1 Color instance
 *
 * @category EightBit instances
 */
export const red3_1: Type = make({ code: Code.Red3_1 });
/**
 * Eightbit DeepPink4_3 Color instance
 *
 * @category EightBit instances
 */
export const deepPink4_3: Type = make({
  code: Code.DeepPink4_3,
});
/**
 * Eightbit MediumVioletRed Color instance
 *
 * @category EightBit instances
 */
export const mediumVioletRed: Type = make({
  code: Code.MediumVioletRed,
});
/**
 * Eightbit Magenta3_1 Color instance
 *
 * @category EightBit instances
 */
export const magenta3_1: Type = make({
  code: Code.Magenta3_1,
});
/**
 * Eightbit DarkViolet_2 Color instance
 *
 * @category EightBit instances
 */
export const darkViolet_2: Type = make({
  code: Code.DarkViolet_2,
});
/**
 * Eightbit Purple_3 Color instance
 *
 * @category EightBit instances
 */
export const purple_3: Type = make({ code: Code.Purple_3 });
/**
 * Eightbit DarkOrange3_1 Color instance
 *
 * @category EightBit instances
 */
export const darkOrange3_1: Type = make({
  code: Code.DarkOrange3_1,
});
/**
 * Eightbit IndianRed_1 Color instance
 *
 * @category EightBit instances
 */
export const indianRed_1: Type = make({
  code: Code.IndianRed_1,
});
/**
 * Eightbit HotPink3_1 Color instance
 *
 * @category EightBit instances
 */
export const hotPink3_1: Type = make({
  code: Code.HotPink3_1,
});
/**
 * Eightbit MediumOrchid3 Color instance
 *
 * @category EightBit instances
 */
export const mediumOrchid3: Type = make({
  code: Code.MediumOrchid3,
});
/**
 * Eightbit MediumOrchid Color instance
 *
 * @category EightBit instances
 */
export const mediumOrchid: Type = make({
  code: Code.MediumOrchid,
});
/**
 * Eightbit MediumPurple2_1 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple2_1: Type = make({
  code: Code.MediumPurple2_1,
});
/**
 * Eightbit DarkGoldenRod Color instance
 *
 * @category EightBit instances
 */
export const darkGoldenRod: Type = make({
  code: Code.DarkGoldenRod,
});
/**
 * Eightbit LightSalmon3_1 Color instance
 *
 * @category EightBit instances
 */
export const lightSalmon3_1: Type = make({
  code: Code.LightSalmon3_1,
});
/**
 * Eightbit RosyBrown Color instance
 *
 * @category EightBit instances
 */
export const rosyBrown: Type = make({
  code: Code.RosyBrown,
});
/**
 * Eightbit Grey63 Color instance
 *
 * @category EightBit instances
 */
export const grey63: Type = make({ code: Code.Grey63 });
/**
 * Eightbit MediumPurple2_2 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple2_2: Type = make({
  code: Code.MediumPurple2_2,
});
/**
 * Eightbit MediumPurple1 Color instance
 *
 * @category EightBit instances
 */
export const mediumPurple1: Type = make({
  code: Code.MediumPurple1,
});
/**
 * Eightbit Gold3_1 Color instance
 *
 * @category EightBit instances
 */
export const gold3_1: Type = make({ code: Code.Gold3_1 });
/**
 * Eightbit DarkKhaki Color instance
 *
 * @category EightBit instances
 */
export const darkKhaki: Type = make({
  code: Code.DarkKhaki,
});
/**
 * Eightbit NavajoWhite3 Color instance
 *
 * @category EightBit instances
 */
export const navajoWhite3: Type = make({
  code: Code.NavajoWhite3,
});
/**
 * Eightbit Grey69 Color instance
 *
 * @category EightBit instances
 */
export const grey69: Type = make({ code: Code.Grey69 });
/**
 * Eightbit LightSteelBlue3 Color instance
 *
 * @category EightBit instances
 */
export const lightSteelBlue3: Type = make({
  code: Code.LightSteelBlue3,
});
/**
 * Eightbit LightSteelBlue Color instance
 *
 * @category EightBit instances
 */
export const lightSteelBlue: Type = make({
  code: Code.LightSteelBlue,
});
/**
 * Eightbit Yellow3_1 Color instance
 *
 * @category EightBit instances
 */
export const yellow3_1: Type = make({
  code: Code.Yellow3_1,
});
/**
 * Eightbit DarkOliveGreen3_3 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen3_3: Type = make({
  code: Code.DarkOliveGreen3_3,
});
/**
 * Eightbit DarkSeaGreen3_2 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen3_2: Type = make({
  code: Code.DarkSeaGreen3_2,
});
/**
 * Eightbit DarkSeaGreen2_1 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen2_1: Type = make({
  code: Code.DarkSeaGreen2_1,
});
/**
 * Eightbit LightCyan3 Color instance
 *
 * @category EightBit instances
 */
export const lightCyan3: Type = make({
  code: Code.LightCyan3,
});
/**
 * Eightbit LightSkyBlue1 Color instance
 *
 * @category EightBit instances
 */
export const lightSkyBlue1: Type = make({
  code: Code.LightSkyBlue1,
});
/**
 * Eightbit GreenYellow Color instance
 *
 * @category EightBit instances
 */
export const greenYellow: Type = make({
  code: Code.GreenYellow,
});
/**
 * Eightbit DarkOliveGreen2 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen2: Type = make({
  code: Code.DarkOliveGreen2,
});
/**
 * Eightbit PaleGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const paleGreen1_2: Type = make({
  code: Code.PaleGreen1_2,
});
/**
 * Eightbit DarkSeaGreen2_2 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen2_2: Type = make({
  code: Code.DarkSeaGreen2_2,
});
/**
 * Eightbit DarkSeaGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen1_1: Type = make({
  code: Code.DarkSeaGreen1_1,
});
/**
 * Eightbit PaleTurquoise1 Color instance
 *
 * @category EightBit instances
 */
export const paleTurquoise1: Type = make({
  code: Code.PaleTurquoise1,
});
/**
 * Eightbit Red3_2 Color instance
 *
 * @category EightBit instances
 */
export const red3_2: Type = make({ code: Code.Red3_2 });
/**
 * Eightbit DeepPink3_1 Color instance
 *
 * @category EightBit instances
 */
export const deepPink3_1: Type = make({
  code: Code.DeepPink3_1,
});
/**
 * Eightbit DeepPink3_2 Color instance
 *
 * @category EightBit instances
 */
export const deepPink3_2: Type = make({
  code: Code.DeepPink3_2,
});
/**
 * Eightbit Magenta3_2 Color instance
 *
 * @category EightBit instances
 */
export const magenta3_2: Type = make({
  code: Code.Magenta3_2,
});
/**
 * Eightbit Magenta3_3 Color instance
 *
 * @category EightBit instances
 */
export const magenta3_3: Type = make({
  code: Code.Magenta3_3,
});
/**
 * Eightbit Magenta2_1 Color instance
 *
 * @category EightBit instances
 */
export const magenta2_1: Type = make({
  code: Code.Magenta2_1,
});
/**
 * Eightbit DarkOrange3_2 Color instance
 *
 * @category EightBit instances
 */
export const darkOrange3_2: Type = make({
  code: Code.DarkOrange3_2,
});
/**
 * Eightbit IndianRed_2 Color instance
 *
 * @category EightBit instances
 */
export const indianRed_2: Type = make({
  code: Code.IndianRed_2,
});
/**
 * Eightbit HotPink3_2 Color instance
 *
 * @category EightBit instances
 */
export const hotPink3_2: Type = make({
  code: Code.HotPink3_2,
});
/**
 * Eightbit HotPink2 Color instance
 *
 * @category EightBit instances
 */
export const hotPink2: Type = make({ code: Code.HotPink2 });
/**
 * Eightbit Orchid Color instance
 *
 * @category EightBit instances
 */
export const orchid: Type = make({ code: Code.Orchid });
/**
 * Eightbit MediumOrchid1_1 Color instance
 *
 * @category EightBit instances
 */
export const mediumOrchid1_1: Type = make({
  code: Code.MediumOrchid1_1,
});
/**
 * Eightbit Orange3 Color instance
 *
 * @category EightBit instances
 */
export const orange3: Type = make({ code: Code.Orange3 });
/**
 * Eightbit LightSalmon3_2 Color instance
 *
 * @category EightBit instances
 */
export const lightSalmon3_2: Type = make({
  code: Code.LightSalmon3_2,
});
/**
 * Eightbit LightPink3 Color instance
 *
 * @category EightBit instances
 */
export const lightPink3: Type = make({
  code: Code.LightPink3,
});
/**
 * Eightbit Pink3 Color instance
 *
 * @category EightBit instances
 */
export const pink3: Type = make({ code: Code.Pink3 });
/**
 * Eightbit Plum3 Color instance
 *
 * @category EightBit instances
 */
export const plum3: Type = make({ code: Code.Plum3 });
/**
 * Eightbit Violet Color instance
 *
 * @category EightBit instances
 */
export const violet: Type = make({ code: Code.Violet });
/**
 * Eightbit Gold3_2 Color instance
 *
 * @category EightBit instances
 */
export const gold3_2: Type = make({ code: Code.Gold3_2 });
/**
 * Eightbit LightGoldenRod3 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod3: Type = make({
  code: Code.LightGoldenRod3,
});
/**
 * Eightbit Tan Color instance
 *
 * @category EightBit instances
 */
export const tan: Type = make({ code: Code.Tan });
/**
 * Eightbit MistyRose3 Color instance
 *
 * @category EightBit instances
 */
export const mistyRose3: Type = make({
  code: Code.MistyRose3,
});
/**
 * Eightbit Thistle3 Color instance
 *
 * @category EightBit instances
 */
export const thistle3: Type = make({ code: Code.Thistle3 });
/**
 * Eightbit Plum2 Color instance
 *
 * @category EightBit instances
 */
export const plum2: Type = make({ code: Code.Plum2 });
/**
 * Eightbit Yellow3_2 Color instance
 *
 * @category EightBit instances
 */
export const yellow3_2: Type = make({
  code: Code.Yellow3_2,
});
/**
 * Eightbit Khaki3 Color instance
 *
 * @category EightBit instances
 */
export const khaki3: Type = make({ code: Code.Khaki3 });
/**
 * Eightbit LightGoldenRod2_1 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod2_1: Type = make({
  code: Code.LightGoldenRod2_1,
});
/**
 * Eightbit LightYellow3 Color instance
 *
 * @category EightBit instances
 */
export const lightYellow3: Type = make({
  code: Code.LightYellow3,
});
/**
 * Eightbit Grey84 Color instance
 *
 * @category EightBit instances
 */
export const grey84: Type = make({ code: Code.Grey84 });
/**
 * Eightbit LightSteelBlue1 Color instance
 *
 * @category EightBit instances
 */
export const lightSteelBlue1: Type = make({
  code: Code.LightSteelBlue1,
});
/**
 * Eightbit Yellow2 Color instance
 *
 * @category EightBit instances
 */
export const yellow2: Type = make({ code: Code.Yellow2 });
/**
 * Eightbit DarkOliveGreen1_1 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen1_1: Type = make({
  code: Code.DarkOliveGreen1_1,
});
/**
 * Eightbit DarkOliveGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const darkOliveGreen1_2: Type = make({
  code: Code.DarkOliveGreen1_2,
});
/**
 * Eightbit DarkSeaGreen1_2 Color instance
 *
 * @category EightBit instances
 */
export const darkSeaGreen1_2: Type = make({
  code: Code.DarkSeaGreen1_2,
});
/**
 * Eightbit HoneyDew2 Color instance
 *
 * @category EightBit instances
 */
export const honeyDew2: Type = make({
  code: Code.HoneyDew2,
});
/**
 * Eightbit LightCyan1 Color instance
 *
 * @category EightBit instances
 */
export const lightCyan1: Type = make({
  code: Code.LightCyan1,
});
/**
 * Eightbit Red1 Color instance
 *
 * @category EightBit instances
 */
export const red1: Type = make({ code: Code.Red1 });
/**
 * Eightbit DeepPink2 Color instance
 *
 * @category EightBit instances
 */
export const deepPink2: Type = make({
  code: Code.DeepPink2,
});
/**
 * Eightbit DeepPink1_1 Color instance
 *
 * @category EightBit instances
 */
export const deepPink1_1: Type = make({
  code: Code.DeepPink1_1,
});
/**
 * Eightbit DeepPink1_2 Color instance
 *
 * @category EightBit instances
 */
export const deepPink1_2: Type = make({
  code: Code.DeepPink1_2,
});
/**
 * Eightbit Magenta2_2 Color instance
 *
 * @category EightBit instances
 */
export const magenta2_2: Type = make({
  code: Code.Magenta2_2,
});
/**
 * Eightbit Magenta1 Color instance
 *
 * @category EightBit instances
 */
export const magenta1: Type = make({ code: Code.Magenta1 });
/**
 * Eightbit OrangeRed1 Color instance
 *
 * @category EightBit instances
 */
export const orangeRed1: Type = make({
  code: Code.OrangeRed1,
});
/**
 * Eightbit IndianRed1_1 Color instance
 *
 * @category EightBit instances
 */
export const indianRed1_1: Type = make({
  code: Code.IndianRed1_1,
});
/**
 * Eightbit IndianRed1_2 Color instance
 *
 * @category EightBit instances
 */
export const indianRed1_2: Type = make({
  code: Code.IndianRed1_2,
});
/**
 * Eightbit HotPink_1 Color instance
 *
 * @category EightBit instances
 */
export const hotPink_1: Type = make({
  code: Code.HotPink_1,
});
/**
 * Eightbit HotPink_2 Color instance
 *
 * @category EightBit instances
 */
export const hotPink_2: Type = make({
  code: Code.HotPink_2,
});
/**
 * Eightbit MediumOrchid1_2 Color instance
 *
 * @category EightBit instances
 */
export const mediumOrchid1_2: Type = make({
  code: Code.MediumOrchid1_2,
});
/**
 * Eightbit DarkOrange Color instance
 *
 * @category EightBit instances
 */
export const darkOrange: Type = make({
  code: Code.DarkOrange,
});
/**
 * Eightbit Salmon1 Color instance
 *
 * @category EightBit instances
 */
export const salmon1: Type = make({ code: Code.Salmon1 });
/**
 * Eightbit LightCoral Color instance
 *
 * @category EightBit instances
 */
export const lightCoral: Type = make({
  code: Code.LightCoral,
});
/**
 * Eightbit PaleVioletRed1 Color instance
 *
 * @category EightBit instances
 */
export const paleVioletRed1: Type = make({
  code: Code.PaleVioletRed1,
});
/**
 * Eightbit Orchid2 Color instance
 *
 * @category EightBit instances
 */
export const orchid2: Type = make({ code: Code.Orchid2 });
/**
 * Eightbit Orchid1 Color instance
 *
 * @category EightBit instances
 */
export const orchid1: Type = make({ code: Code.Orchid1 });
/**
 * Eightbit Orange1 Color instance
 *
 * @category EightBit instances
 */
export const orange1: Type = make({ code: Code.Orange1 });
/**
 * Eightbit SandyBrown Color instance
 *
 * @category EightBit instances
 */
export const sandyBrown: Type = make({
  code: Code.SandyBrown,
});
/**
 * Eightbit LightSalmon1 Color instance
 *
 * @category EightBit instances
 */
export const lightSalmon1: Type = make({
  code: Code.LightSalmon1,
});
/**
 * Eightbit LightPink1 Color instance
 *
 * @category EightBit instances
 */
export const lightPink1: Type = make({
  code: Code.LightPink1,
});
/**
 * Eightbit Pink1 Color instance
 *
 * @category EightBit instances
 */
export const pink1: Type = make({ code: Code.Pink1 });
/**
 * Eightbit Plum1 Color instance
 *
 * @category EightBit instances
 */
export const plum1: Type = make({ code: Code.Plum1 });
/**
 * Eightbit Gold1 Color instance
 *
 * @category EightBit instances
 */
export const gold1: Type = make({ code: Code.Gold1 });
/**
 * Eightbit LightGoldenRod2_2 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod2_2: Type = make({
  code: Code.LightGoldenRod2_2,
});
/**
 * Eightbit LightGoldenRod2_3 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod2_3: Type = make({
  code: Code.LightGoldenRod2_3,
});
/**
 * Eightbit NavajoWhite1 Color instance
 *
 * @category EightBit instances
 */
export const navajoWhite1: Type = make({
  code: Code.NavajoWhite1,
});
/**
 * Eightbit MistyRose1 Color instance
 *
 * @category EightBit instances
 */
export const mistyRose1: Type = make({
  code: Code.MistyRose1,
});
/**
 * Eightbit Thistle1 Color instance
 *
 * @category EightBit instances
 */
export const thistle1: Type = make({ code: Code.Thistle1 });
/**
 * Eightbit Yellow1 Color instance
 *
 * @category EightBit instances
 */
export const yellow1: Type = make({ code: Code.Yellow1 });
/**
 * Eightbit LightGoldenRod1 Color instance
 *
 * @category EightBit instances
 */
export const lightGoldenRod1: Type = make({
  code: Code.LightGoldenRod1,
});
/**
 * Eightbit Khaki1 Color instance
 *
 * @category EightBit instances
 */
export const khaki1: Type = make({ code: Code.Khaki1 });
/**
 * Eightbit Wheat1 Color instance
 *
 * @category EightBit instances
 */
export const wheat1: Type = make({ code: Code.Wheat1 });
/**
 * Eightbit Cornsilk1 Color instance
 *
 * @category EightBit instances
 */
export const cornsilk1: Type = make({
  code: Code.Cornsilk1,
});
/**
 * Eightbit Grey100 Color instance
 *
 * @category EightBit instances
 */
export const grey100: Type = make({ code: Code.Grey100 });
/**
 * Eightbit Grey3 Color instance
 *
 * @category EightBit instances
 */
export const grey3: Type = make({ code: Code.Grey3 });
/**
 * Eightbit Grey7 Color instance
 *
 * @category EightBit instances
 */
export const grey7: Type = make({ code: Code.Grey7 });
/**
 * Eightbit Grey11 Color instance
 *
 * @category EightBit instances
 */
export const grey11: Type = make({ code: Code.Grey11 });
/**
 * Eightbit Grey15 Color instance
 *
 * @category EightBit instances
 */
export const grey15: Type = make({ code: Code.Grey15 });
/**
 * Eightbit Grey19 Color instance
 *
 * @category EightBit instances
 */
export const grey19: Type = make({ code: Code.Grey19 });
/**
 * Eightbit Grey23 Color instance
 *
 * @category EightBit instances
 */
export const grey23: Type = make({ code: Code.Grey23 });
/**
 * Eightbit Grey27 Color instance
 *
 * @category EightBit instances
 */
export const grey27: Type = make({ code: Code.Grey27 });
/**
 * Eightbit Grey30 Color instance
 *
 * @category EightBit instances
 */
export const grey30: Type = make({ code: Code.Grey30 });
/**
 * Eightbit Grey35 Color instance
 *
 * @category EightBit instances
 */
export const grey35: Type = make({ code: Code.Grey35 });
/**
 * Eightbit Grey39 Color instance
 *
 * @category EightBit instances
 */
export const grey39: Type = make({ code: Code.Grey39 });
/**
 * Eightbit Grey42 Color instance
 *
 * @category EightBit instances
 */
export const grey42: Type = make({ code: Code.Grey42 });
/**
 * Eightbit Grey46 Color instance
 *
 * @category EightBit instances
 */
export const grey46: Type = make({ code: Code.Grey46 });
/**
 * Eightbit Grey50 Color instance
 *
 * @category EightBit instances
 */
export const grey50: Type = make({ code: Code.Grey50 });
/**
 * Eightbit Grey54 Color instance
 *
 * @category EightBit instances
 */
export const grey54: Type = make({ code: Code.Grey54 });
/**
 * Eightbit Grey58 Color instance
 *
 * @category EightBit instances
 */
export const grey58: Type = make({ code: Code.Grey58 });
/**
 * Eightbit Grey62 Color instance
 *
 * @category EightBit instances
 */
export const grey62: Type = make({ code: Code.Grey62 });
/**
 * Eightbit Grey66 Color instance
 *
 * @category EightBit instances
 */
export const grey66: Type = make({ code: Code.Grey66 });
/**
 * Eightbit Grey70 Color instance
 *
 * @category EightBit instances
 */
export const grey70: Type = make({ code: Code.Grey70 });
/**
 * Eightbit Grey74 Color instance
 *
 * @category EightBit instances
 */
export const grey74: Type = make({ code: Code.Grey74 });
/**
 * Eightbit Grey78 Color instance
 *
 * @category EightBit instances
 */
export const grey78: Type = make({ code: Code.Grey78 });
/**
 * Eightbit Grey82 Color instance
 *
 * @category EightBit instances
 */
export const grey82: Type = make({ code: Code.Grey82 });
/**
 * Eightbit Grey85 Color instance
 *
 * @category EightBit instances
 */
export const grey85: Type = make({ code: Code.Grey85 });
/**
 * Eightbit Grey89 Color instance
 *
 * @category EightBit instances
 */
export const grey89: Type = make({ code: Code.Grey89 });
/**
 * Eightbit Grey93 Color instance
 *
 * @category EightBit instances
 */
export const grey93: Type = make({ code: Code.Grey93 });
