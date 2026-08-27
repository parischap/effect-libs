import * as assert from '@effect/vitest/assert';
import * as describe from '@effect/vitest/describe';
import * as it from '@effect/vitest/it';
import { pipe } from 'effect';
import * as Number from 'effect/Number';
import * as String from 'effect/String';

import * as MFunction from '@parischap/effect-lib/MFunction';

describe('MFunction', () => {
  describe('fIfTrue', () => {
    it('Matching', () => {
      assert.strictEqual(
        pipe(1 as number, MFunction.fIfTrue({ condition: true, f: Number.increment })),
        2,
      );
    });

    it('Non-matching', () => {
      assert.strictEqual(
        pipe(1 as number, MFunction.fIfTrue({ condition: false, f: Number.increment })),
        1,
      );
    });
  });

  it('flipDual', () => {
    assert.strictEqual(pipe(2, MFunction.flipDual(String.takeLeft)('foo')), 'fo');
  });

  it('parameterNumber', () => {
    assert.strictEqual(
      pipe((m: number, n: number) => m + n, MFunction.parameterNumber),
      2,
    );
  });

  it('name', () => {
    assert.strictEqual(pipe(Math.max, MFunction.name), 'max');
  });

  describe('once', () => {
    it('Returns the computed value on the first call', () => {
      let a = 0;
      const complexFoo = () => a++;
      const memoized = MFunction.once(complexFoo);
      assert.strictEqual(memoized(), 0);
    });

    it('Returns the cached value on subsequent calls', () => {
      let a = 0;
      const complexFoo = () => a++;
      const memoized = MFunction.once(complexFoo);
      memoized(); // prime the cache
      assert.strictEqual(memoized(), 0);
    });
  });

  it('applyAsThis', () => {
    assert.strictEqual(pipe(Array.prototype.pop, MFunction.applyAsThis([1, 2])), 2);
  });

  it('execute', () => {
    assert.strictEqual(
      pipe(() => 1, MFunction.execute),
      1,
    );
  });

  describe('clone', () => {
    it('Creates a distinct function reference', () => {
      const incCopy = MFunction.clone(Number.increment);
      assert.isFalse(incCopy === Number.increment);
    });

    it('Behaves identically to the original function', () => {
      const incCopy = MFunction.clone(Number.increment);
      assert.strictEqual(incCopy(1), 2);
    });
  });

  it('constEmptyString', () => {
    assert.strictEqual(MFunction.constEmptyString(), '');
  });
});
