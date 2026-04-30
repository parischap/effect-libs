/** This module implements a type that represents the possible sign display options */

/**
 * Type of a CVNumberBase10FormatSignDisplay
 *
 * @category Models
 */
export enum Type {
  /**
   * Formatting: sign display for negative numbers only, including negative zero.
   *
   * Parsing: conversion will fail if a positive sign is used.
   */
  Auto = 0,

  /**
   * Formatting: sign display for all numbers.
   *
   * Parsing: conversion will fail if no sign is present
   */
  Always = 1,

  /**
   * Formatting: sign display for positive and negative numbers, but not zero
   *
   * Parsing: conversion will fail if a sign is not present for a value other than 0 or if a sign is
   * present for 0.
   */
  ExceptZero = 2,

  /**
   * Formatting: sign display for negative numbers only, excluding negative zero.
   *
   * Parsing: conversion will fail if a positive sign is used or if a negative sign is used for 0.
   */
  Negative = 3,

  /**
   * Formatting: no sign display.
   *
   * Parsing: conversion will fail if any sign is present. The number will be treated as positive.
   */
  Never = 4,
}
