/**
 * This module implements a type that represents the possible sources by which to obtain the
 * properties of non-primitive values
 */

/**
 * Type of a PPPropertySource
 *
 * @category Models
 */

export enum Type {
  /**
   * Properties are obtained by calling Reflect.ownKeys on the non-primitive value and its
   * prototypes (until maxPrototypeDepth is reached). This is usually a good choice for records
   */
  FromProperties = 0,

  /**
   * Properties are obtained by iterating over the non-primitive-value that must implement the
   * Iterable protocol. Each value returned by the iterator is used to create a property with an
   * auto-incremented numerical key (converted to a string). This is usually a good choice for
   * arrays and sets.
   */
  FromValueIterable = 1,

  /**
   * Properties are obtained by iterating over the non-primitive-value that must implement the
   * Iterable protocol. The iterator must return a key/value pair. Otherwise, the returned value is
   * ignored. This is usually a good choice for maps.
   */
  FromKeyValueIterable = 2,
}
