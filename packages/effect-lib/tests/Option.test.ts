import * as TestUtils from '@parischap/configs/TestUtils';
import * as MOption from '@parischap/effect-lib/MOption';
import * as Option from 'effect/Option';
import { describe, it } from 'vitest';

describe('MOption', () => {
  describe('fromOptionOrNullable', () => {
    it('Option input', () => {
      TestUtils.assertSome(MOption.fromOptionOrNullable(Option.some(5)), 5);
    });

    it('None input', () => {
      TestUtils.assertNone(MOption.fromOptionOrNullable(Option.none<number>()));
    });

    it('Null input', () => {
      TestUtils.assertNone(MOption.fromOptionOrNullable(null));
    });

    it('Undefined input', () => {
      TestUtils.assertNone(MOption.fromOptionOrNullable(undefined));
    });

    it('Non-nullable non-option input', () => {
      TestUtils.assertSome(MOption.fromOptionOrNullable(5), 5);
    });
  });

  describe('fromNextIteratorValue', () => {
    it('Non-exhausted iterator', () => {
      const iter = [1, 2, 3][Symbol.iterator]();
      TestUtils.assertSome(MOption.fromNextIteratorValue(iter), 1);
    });

    it('Exhausted iterator', () => {
      const arr: ReadonlyArray<number> = [];
      const iter = arr[Symbol.iterator]();
      TestUtils.assertNone(MOption.fromNextIteratorValue(iter));
    });
  });
});
