/**
 * Namespace of a MarkShower. A MarkShower is a ContextFormatter (see
 *
 * @parischap/ContextFromatter.ts> used as a reversed action. It always displays the same text but
 * in a style that depends on the Value context object.
 */
import { ASContextStyler, ASText } from '@parischap/ansi-styles';
import * as PPValue from './Value.js';
/**
 * Type of a MarkShower
 *
 * @category Models
 */
export interface Type extends ASContextStyler.ReversedAction.Initialized.Type<PPValue.All> {}

/**
 * MarkShower instance that always prints an empty Text
 *
 * @category Instances
 */
export const empty: Type = (_context) => ASText.empty;
