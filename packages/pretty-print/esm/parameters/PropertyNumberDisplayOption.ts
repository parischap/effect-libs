/**
 * This module implements a type that represents the possible options regarding the display of the
 * number of properties of a non-primitive value.
 */

/**
 * Type of a PPPropertyNumberDisplayOption
 *
 * @category Models
 */
export enum Type {
  /** The number of properties is not shown */
  None = 0,
  /** Shows the number of properties retrieved from the property source */
  All = 1,
  /**
   * Shows the number of properties actually displayed, i.e. these remaining after filtering,
   * deduping and applying `maxPropertyNumber`
   */
  Actual = 2,
  /**
   * Shows both the number of properties retrieved from the property source and the number of
   * properties actually displayed (after filtering, deduping and applying `maxPropertyNumber`)
   */
  AllAndActual = 3,
  /**
   * Shows both the number of properties retrieved from the property source and the number of
   * properties actually displayed (after filtering, deduping and applying `maxPropertyNumber`) only
   * if these two numbers are different. Otherwise, does not show anything
   */
  AllAndActualIfDifferent = 4,
}
