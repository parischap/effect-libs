import { Data } from 'effect';

/**
 * Module tag.
 *
 * @category Module markers
 */
export const moduleTag = '@parischap/my-app/internal/errors/Pop/';

/**
 * Type of an error that cannot be handled by the program (it will stop the program and pop to the
 * system)
 *
 * @category Models
 */
export class Type extends Data.TaggedError(moduleTag)<{
  readonly originalError: unknown;
  readonly message: string;
}> {}
