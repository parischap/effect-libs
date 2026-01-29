import * as TestUtils from '@parischap/configs/TestUtils';
import { MRecord, MTypes } from '@parischap/effect-lib';
import { Option, pipe } from 'effect';
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
