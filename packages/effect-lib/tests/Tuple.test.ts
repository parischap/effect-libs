import { assert, describe, it } from '@effect/vitest';
import { pipe } from 'effect';
import * as Array from 'effect/Array';
import * as Number from 'effect/Number';
import * as Tuple from 'effect/Tuple';

import * as MTuple from '@parischap/effect-lib/MTuple';

describe('MTuple', () => {
  describe('of', () => {
    it('With Array.map', () => {
      assert.deepStrictEqual(
        pipe(Array.make(1, 2), Array.map(MTuple.of)),
        Array.make(Tuple.make(1), Tuple.make(2)),
      );
    });
  });

  describe('replicate', () => {
    it('From number', () => {
      assert.deepStrictEqual(pipe(1, MTuple.replicate(2)), Tuple.make(1, 1));
    });
  });

  describe('replicate + evolve pattern', () => {
    it('From number', () => {
      assert.deepStrictEqual(
        pipe(1, MTuple.replicate(2), Tuple.evolve(Tuple.make(Number.sum(1), Number.multiply(2)))),
        Tuple.make(2, 2),
      );
    });
  });

  describe('prepend', () => {
    it('From number', () => {
      assert.deepStrictEqual(pipe(1, Tuple.make, MTuple.prependElement(2)), Tuple.make(2, 1));
    });
  });
});
