import * as TestUtils from '@parischap/configs/TestUtils';
import * as MEither from '@parischap/effect-lib/MEither';

import * as Cause from 'effect/Cause';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import { describe, it } from 'vitest';

describe('MEither', () => {
  describe('optionFromOptional', () => {
    it('Right becomes Some-wrapped Right', () => {
      TestUtils.assertRight(MEither.optionFromOptional(Either.right(42)), Option.some(42));
    });

    it('NoSuchElementException becomes Right(none)', () => {
      TestUtils.assertRight(
        MEither.optionFromOptional(Either.left(new Cause.NoSuchElementException())),
        Option.none(),
      );
    });

    it('Other left remains Left', () => {
      TestUtils.assertLeft(MEither.optionFromOptional(Either.left(new Error('some error'))));
    });
  });

  describe('flatten', () => {
    it('Right of Right', () => {
      TestUtils.assertRight(MEither.flatten(Either.right(Either.right(42))), 42);
    });

    it('Right of Left', () => {
      TestUtils.assertLeft(MEither.flatten(Either.right(Either.left('inner error'))));
    });

    it('Left', () => {
      TestUtils.assertLeft(MEither.flatten(Either.left('outer error')));
    });
  });

  describe('getRightWhenNoLeft', () => {
    it('Extracts value from Right', () => {
      TestUtils.strictEqual(MEither.getRightWhenNoLeft(Either.right(42)), 42);
    });
  });

  describe('traversePair', () => {
    it('Right pair becomes pair of Rights', () => {
      const result = MEither.traversePair(Either.right([1, 2] as [number, number]));
      TestUtils.assertRight(result[0], 1);
      TestUtils.assertRight(result[1], 2);
    });

    it('Left becomes pair of Lefts', () => {
      const result = MEither.traversePair(
        Either.left('error') as Either.Either<[number, number], string>,
      );
      TestUtils.assertLeft(result[0]);
      TestUtils.assertLeft(result[1]);
    });
  });
});
