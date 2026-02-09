/**
 * Module that implements a type that represents a map between a `Token` and the
 * `CVTemplatePartPlaceholder` that implements it
 */

/**
 * Type of a CVDateTimeFormatTokenMap
 *
 * @category Models
 */
export interface Type extends HashMap.HashMap<
  Token,
  CVTemplatePartPlaceholder.Type<string, CVReal.Type>
> {}
