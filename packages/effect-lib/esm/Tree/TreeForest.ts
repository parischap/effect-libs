/**
 * Type alias for the children of a non-leaf tree node.
 *
 * A `Type<A, B>` is `ReadonlyArray<MTree.Type<A, B>>`. See
 * {@link "./TreeNonLeaf.js" | `MTreeNonLeaf`} for the consumer of this alias and
 * {@link "./Tree.js" | `MTree`} for tree-wide operations.
 */
import type * as MTree from './Tree.js';
/**
 * Type alias used by {@link "./TreeNonLeaf.js" | `MTreeNonLeaf`} to declare the children of a
 * non-leaf node.
 *
 * @category Models
 */
export type Type<A, B> = ReadonlyArray<MTree.Type<A, B>>;
