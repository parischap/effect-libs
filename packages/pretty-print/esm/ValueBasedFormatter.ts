/**
 * Alias for ASContextStyler.Type<PPValue.All> (see @parischap/ansi-style/ContextFormatter.ts and
 * Value.ts)
 */

import { ASContextStyler, ASPalette } from '@parischap/ansi-styles';
import * as PPValue from './Value.js';

/**
 * Type of a ValueBasedFormatter
 *
 * @category Models
 */
export type Type = ASContextStyler.Type<PPValue.All>;

/**
 * Constructor of a depth-indexed ValueBasedFormatter
 *
 * @category Constructors
 */
export const makeDepthIndexed = (palette: ASPalette.Type): Type =>
	ASContextStyler.PaletteBased.make({
		// Use named function so the name gets printed by the toString function
		indexFromContext: function valueDepth(value: PPValue.All) {
			return PPValue.depth(value);
		},
		palette
	});

/**
 * Constructor of a type-indexed ValueBasedFormatter
 *
 * @category Constructors
 */
export const makeTypeIndexed = (palette: ASPalette.Type): Type =>
	ASContextStyler.PaletteBased.make({
		// Use named function so the name gets printed by the toString function
		indexFromContext: function valueType(value: PPValue.All) {
			return value.contentType;
		},
		palette
	});

/**
 * Constructor of a key-type-indexed ValueBasedFormatter
 *
 * @category Constructors
 */
export const makeKeyTypeIndexed = (palette: ASPalette.Type): Type =>
	ASContextStyler.PaletteBased.make({
		// Use named function so the name gets printed by the toString function
		indexFromContext: function keyType(value: PPValue.All) {
			// `1` for symbolic key, `0` for string key
			return +value.hasSymbolicKey;
		},
		palette
	});
