/**
 * Alias for a map of PPMarks's (see ValueBasedStyler.ts). The keys of the map are the names of the
 * marks
 */

import type * as PPMark from '../../parameters/Mark.js';

import * as HashMap from 'effect/HashMap';

/**
 * Type of a PPStyles
 *
 * @category Models
 */
export interface Type extends HashMap.HashMap<string, PPMark.Type> {}
