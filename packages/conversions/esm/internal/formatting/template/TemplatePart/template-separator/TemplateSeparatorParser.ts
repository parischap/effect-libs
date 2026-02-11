/**
 * This module implements a `CVTemplateSeparatorParser`, which is a function that tries to read the
 * value of the separator from the start of `text`. If successful, it returns a right of the text
 * stripped of the separator. Otherwise, it returns a left of an MInputError. `pos` is only used in
 * case of failure to report the position of the error
 */

import { MInputError, MString } from '@parischap/effect-lib';
import { Either, pipe } from 'effect';
import * as CVTemplateSeparator from '../../../../../formatting/template/TemplatePart/template-separator/index.js';

/**
 * Type of a `CVTemplateSeparatorParser`
 *
 * @category Models
 */
export type Type = (pos: number, text: string) => Either.Either<string, MInputError.Type>;

/**
 * Builds a `CVTemplateSeparatorParser` from a `CVTemplateSeparator`
 *
 * @category Constructors
 */
export const fromSeparator = (separator: CVTemplateSeparator.Type): Type => {
  const { value } = separator;
  const { length } = value;
  return (pos, text) =>
    pipe(
      text,
      MInputError.assertStartsWith({
        startString: value,
        name: `remaining text for separator at position ${MString.fromNumber(10)(pos)}`,
      }),
      Either.map(MString.takeRightBut(length)),
    );
};
