import * as Cause from 'effect/Cause';
import * as Option from 'effect/Option';
import * as Result from 'effect/Result';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MResult from '@parischap/effect-lib/MResult';

import { describe, it } from 'vitest';

describe('MResult', () => {
  describe('optionFromOptional', () => {
    it('Success becomes Some-wrapped Success', () => {
      TestUtils.assertSuccess(MResult.optionFromOptional(Result.succeed(42)), Option.some(42));
    });

    it('NoSuchElementError becomes Success(none)', () => {
      TestUtils.assertSuccess(
        MResult.optionFromOptional(Result.fail(new Cause.NoSuchElementError())),
        Option.none(),
      );
    });

    it('Other failure remains Failure', () => {
      TestUtils.assertFailure(MResult.optionFromOptional(Result.fail(new Error('some error'))));
    });
  });

  describe('flatten', () => {
    it('Success of Success', () => {
      TestUtils.assertSuccess(MResult.flatten(Result.succeed(Result.succeed(42))), 42);
    });

    it('Success of Failure', () => {
      TestUtils.assertFailure(MResult.flatten(Result.succeed(Result.fail('inner error'))));
    });

    it('Failure', () => {
      TestUtils.assertFailure(MResult.flatten(Result.fail('outer error')));
    });
  });
});
