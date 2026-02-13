/**
 * Alias for ASContextStyler.Type<PPValue.Any> (see @parischap/ansi-style/ContextStyler.ts and
 * Value.ts)
 *
 * You can define your own if the provided instances don't suit your needs
 */

import { ASContextStyler, ASPalette, ASPaletteContextStyler } from '@parischap/ansi-styles';
import * as PPValue from '../internal/stringification/Value.js';

/**
 * Type of a PPValueBasedStyler
 *
 * @category Models
 */
export type Type = ASContextStyler.Type<PPValue.Any>;

/**
 * Constructor of a depth-indexed PPValueBasedStyler
 *
 * @category Constructors
 */
export const makeDepthIndexed = (palette: ASPalette.Type): Type =>
  ASPaletteContextStyler.make({
    // Use named function so the name gets printed by the toString function
    indexFromContext: function valueDepth(value: PPValue.Any) {
      return PPValue.depth(value);
    },
    palette,
  });

/**
 * Constructor of a type-indexed PPValueBasedStyler
 *
 * @category Constructors
 */
export const makeTypeIndexed = (palette: ASPalette.Type): Type =>
  ASPaletteContextStyler.make({
    // Use named function so the name gets printed by the toString function
    indexFromContext: function valueType(value: PPValue.Any) {
      return value.contentType;
    },
    palette,
  });

/**
 * Constructor of a key-type-indexed PPValueBasedStyler
 *
 * @category Constructors
 */
export const makeKeyTypeIndexed = (palette: ASPalette.Type): Type =>
  ASPaletteContextStyler.make({
    // Use named function so the name gets printed by the toString function
    indexFromContext: function keyType(value: PPValue.Any) {
      // `1` for symbolic key, `0` for string key
      return +value.hasSymbolicKey;
    },
    palette,
  });
