/** Module that implements a TreeForest<A,B>, i.e. an array of TreeAll<A,B> */

import * as MTreeAll from './All.js';

/**
 * Type of a Forest
 *
 * @category Models
 */
export type Type<A, B> = ReadonlyArray<MTreeAll.Type<A, B>>;
