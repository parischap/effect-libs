/** Module that implements a TreeForest<A,B>, i.e. an array of TreeAll<A,B> */
import * as MTree from './index.js';
/**
 * Type of a Forest
 *
 * @category Models
 */
export type Type<A, B> = ReadonlyArray<MTree.Type<A, B>>;
