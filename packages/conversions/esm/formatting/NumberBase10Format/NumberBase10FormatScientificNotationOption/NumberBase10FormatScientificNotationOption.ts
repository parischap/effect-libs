/** This module implements the possible scientific notation options */

/**
 * Type that represents a CVNumberBase10FormatScientificNotation
 *
 * @category Models
 */
export enum Type {
  /**
   * Formatting: scientific notation is not used.
   *
   * Parsing: conversion will fail if a scientific notation is present.
   */
  None = 0,

  /**
   * Formatting: scientific notation is not used.
   *
   * Parsing: scientific notation may be used but is not mandatory.
   */
  Standard = 1,

  /**
   * Formatting: scientific notation is used so that the absolute value of the mantissa m fulfills 1
   * ≤ |m| < 10. Number 0 will be displayed as `0e0`.
   *
   * Parsing: the conversion will fail if the mantissa is not null and its value m does not fulfill
   * 1 ≤ |m| < 10. Scientific notation may be used but is not mandatory. A string that does not
   * contain a scientific notation is deemed equivalent to a string with a null exponent.
   */
  Normalized = 2,

  /**
   * Formatting: scientific notation is used so that the mantissa m fulfills 1 ≤ |m| < 1000 and the
   * exponent is a multiple of 3. Number 0 will be displayed as `0e0`.
   *
   * Parsing: the conversion will fail if the mantissa is not null and its value m does not fulfill
   * 1 ≤ |m| < 1000 or if the exponent is not a multiple of 3. Scientific notation may be used but
   * is not mandatory. A string that does not contain a scientific notation is deemed equivalent to
   * a string with a null exponent.
   */
  Engineering = 3,
}
