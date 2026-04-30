/**
 * This module implements a union type that represents the possible names of the parts of the string
 * representation of a value. Each part name identifies a specific visual element (e.g. property
 * key, separator, bracket) so that a `PPStyleMap` can assign a distinct style to each one.
 */

/**
 * Type of a `PPPartName`
 *
 * @category Models
 */
export type Type =
  | 'ByPassed'
  | 'PrimitiveValue'
  | 'PropertyKey'
  | 'PrototypeMarks'
  | 'KeyValueSeparator'
  | 'InBetweenPropertySeparator'
  | 'NonPrimitiveValueMarks'
  | 'Tab'
  | 'Tag';
