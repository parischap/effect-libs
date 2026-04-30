/**
 * Module that defines `TreeForest<A, B>`, a type alias for `ReadonlyArray<Tree.Type<A, B>>`,
 * representing the children of a non-leaf tree node
 */
import type * as MTree from './Tree.js';
/**
 * Type of a Forest
 *
 * @category Models
 */
export type Type<A, B> = ReadonlyArray<MTree.Type<A, B>>;
