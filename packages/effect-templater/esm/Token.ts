const moduleTag = '@parischap/effect-templater/Token/';

/**
 * TypeId value for a Token
 *
 * @since 0.0.1
 * @category Symbol
 */
export const TypeId: unique symbol = Symbol.for(moduleTag) as TypeId;

/**
 * TypeId type for a Token
 *
 * @since 0.0.1
 * @category Symbol
 */
export type TypeId = typeof TypeId;
