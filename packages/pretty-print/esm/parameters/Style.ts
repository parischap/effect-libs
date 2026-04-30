/**
 * This module implements a `PPStyle`, a context-dependent styler whose context is the value being
 * rendered. A `PPStyle` is an alias for `ASContextStyler.Type<PPValue.Any>` (see
 * `@parischap/ansi-styles/ASContextStyler`). It allows the style applied to a part of the output to
 * vary with the depth, runtime type, or key type of the value being rendered.
 *
 * Three palette-based constructors are provided: `makeDepthIndexed`, `makeTypeIndexed`, and
 * `makeKeyTypeIndexed`. Use any constructor of `ASContextStyler` to define more specialized styles.
 */

import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import type * as ASPalette from '@parischap/ansi-styles/ASPalette';

import * as PPValue from '../internal/stringification/Value.js';

/**
 * Type of a `PPStyle`
 *
 * @category Models
 */
export type Type = ASContextStyler.Type<PPValue.Any>;

/**
 * Constructor of a palette-based depth-indexed `PPStyle` that picks a color from `palette` using
 * the current nesting depth of the value being rendered. Useful for bracket coloring.
 *
 * @category Constructors
 */
export const makeDepthIndexed = (palette: ASPalette.Type): Type =>
  ASContextStyler.makePaletteBased({
    // Use named function so the name gets printed by the toString function
    indexFromContext: function valueDepth(value: PPValue.Any) {
      return PPValue.depth(value);
    },
    palette,
  });

/**
 * Constructor of a palette-based type-indexed `PPStyle` that picks a color from `palette` using
 * the runtime type of the value's content (string, number, bigint, boolean, symbol, null,
 * undefined). Useful for primitive-value coloring.
 *
 * @category Constructors
 */
export const makeTypeIndexed = (palette: ASPalette.Type): Type =>
  ASContextStyler.makePaletteBased({
    // Use named function so the name gets printed by the toString function
    indexFromContext: function valueType(value: PPValue.Any) {
      return value.contentType;
    },
    palette,
  });

/**
 * Constructor of a palette-based key-type-indexed `PPStyle` that picks index `0` from `palette`
 * for properties whose key is a string and index `1` for properties whose key is a symbol. Useful
 * for property-key coloring.
 *
 * @category Constructors
 */
export const makeKeyTypeIndexed = (palette: ASPalette.Type): Type =>
  ASContextStyler.makePaletteBased({
    // Use named function so the name gets printed by the toString function
    indexFromContext: function keyType(value: PPValue.Any) {
      // `1` for symbolic key, `0` for string key
      return +value.hasSymbolicKey;
    },
    palette,
  });
