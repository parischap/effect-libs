/**
 * Alias for ASContextFormatter.Type<PPValue.All> (see @parischap/ansi-style/ContextFormatter.ts and
 * Value.ts)
 */

import { ASContextFormatter, ASPalette } from '@parischap/ansi-styles';
import * as PPValue from './Value.js';

/**
 * Type of a ValueBasedFormatter
 *
 * @category Models
 */
export type Type = ASContextFormatter.Type<PPValue.All>;

/**
 * Constructor of a depth-indexed ValueBasedFormatter
 *
 * @category Constructors
 */
export const makeDepthIndexed = (palette: ASPalette.Type): Type =>
	ASContextFormatter.PaletteBased.make({
		// Use named function so the name gets printed by the toString function
		indexFromContext: function valueDepth(value: PPValue.All) {
			return PPValue.depth(value);
		},
		palette
	});
