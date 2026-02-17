import * as TestUtils from '@parischap/configs/TestUtils';
import * as MRecord from '@parischap/effect-lib/MRecord'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {pipe} from 'effect'
import * as Option from 'effect/Option'
import { describe, it } from 'vitest';

describe('MRecord', () => {
  describe('unsafeGet', () => {
    it('Not passing', () => {
      TestUtils.doesNotThrow(() => pipe({ a: 1, b: true }, MRecord.unsafeGet('z')));
    });
    it('Passing', () => {
      TestUtils.strictEqual(pipe({ a: 1, b: true }, MRecord.unsafeGet('a')), 1);
    });
  });

  describe('tryZeroParamFunction', () => {
    it('Object with default prototype', () => {
      TestUtils.assertNone(
        pipe(
          { a: 5 },
          MRecord.tryZeroParamFunction({
            functionName: 'toString',
            /* oxlint-disable-next-line @typescript-eslint/unbound-method */
            exception: Object.prototype.toString,
          }),
        ),
      );
    });

    it('getDay on Date object', () => {
      TestUtils.assertSome(
        pipe(
          new Date(0),
          MRecord.tryZeroParamFunction({
            functionName: 'getDay',
          }),
          Option.filter(MTypes.isNumber),
        ),
        4,
      );
    });
  });

  describe('tryZeroParamStringFunction', () => {
    it('getDay on Date object', () => {
      TestUtils.assertNone(
        pipe(
          new Date(0),
          MRecord.tryZeroParamStringFunction({
            functionName: 'getDay',
          }),
        ),
      );
    });

    it('toString on Date object', () => {
      TestUtils.assertSome(
        pipe(
          new Date(),
          MRecord.tryZeroParamStringFunction({
            functionName: 'toString',
            /* oxlint-disable-next-line @typescript-eslint/unbound-method */
            exception: Object.prototype.toString,
          }),
        ),
      );
    });
  });
});
