import { assert, describe, it } from '@effect/vitest';
import { flow, pipe } from 'effect';
import * as Number from 'effect/Number';
import * as Struct from 'effect/Struct';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as MStruct from '@parischap/effect-lib/MStruct';

/** Append */
TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MStruct.Append<{ readonly a: boolean }, { readonly b: number }>,
    { readonly a: boolean; readonly b: number }
  >(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MStruct.Append<{ readonly a: boolean; readonly b: boolean }, { readonly b: number }>,
    { readonly a: boolean; readonly b: number }
  >(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MStruct.Append<{ readonly a: boolean; readonly b: boolean }, { readonly b?: number }>,
    { readonly a: boolean; readonly b: number | boolean }
  >(),
);

TestUtils.assertTrueType(
  TestUtils.areEqualTypes<
    MStruct.Append<{ readonly a: boolean; readonly b: number }, { readonly b?: number }>,
    { readonly a: boolean; readonly b: number }
  >(),
);

describe('MRecord', () => {
  describe('prepend', () => {
    it('No overlap', () => {
      assert.deepStrictEqual(MStruct.prepend({ c: 2 })({ a: 0, b: 1 }), { a: 0, b: 1, c: 2 });
    });

    it('With overlap', () => {
      assert.deepStrictEqual(MStruct.prepend({ b: 2, d: 4 })({ a: 0, b: 1 }), {
        a: 0,
        b: 1,
        d: 4,
      });
    });
  });

  describe('append', () => {
    it('No overlap', () => {
      assert.deepStrictEqual(MStruct.append({ c: 2 })({ a: 0, b: 1 }), { a: 0, b: 1, c: 2 });
    });

    it('With overlap', () => {
      assert.deepStrictEqual(MStruct.append({ b: 2 })({ a: 0, b: 1 }), { a: 0, b: 2 });
    });
  });

  describe('set', () => {
    it('No overlap', () => {
      // @ts-expect-error Cannot set `c` as it is not in target record
      assert.deepStrictEqual(pipe({ a: 0, b: 1 }, MStruct.set({ c: 2 })), { a: 0, b: 1, c: 2 });
    });

    it('With overlap', () => {
      assert.deepStrictEqual(pipe({ a: 0, b: 1 }, MStruct.set({ b: 2 })), { a: 0, b: 2 });
    });
  });

  describe('make', () => {
    it('From number', () => {
      assert.deepStrictEqual(MStruct.make('a')(3), { a: 3 });
    });
  });

  describe('enrichWith', () => {
    it('No overlap', () => {
      assert.deepStrictEqual(
        pipe({ a: 0, b: 1 }, MStruct.enrichWith({ c: flow(Struct.get('a'), Number.sum(1)) })),
        { a: 0, b: 1, c: 1 },
      );
    });

    it('With overlap', () => {
      assert.deepStrictEqual(
        pipe(
          { a: 0, b: 1 },
          MStruct.enrichWith({
            c: flow(Struct.get('a'), Number.sum(1)),
            b: flow(Struct.get('b'), Number.sum(1)),
          }),
        ),
        { a: 0, b: 2, c: 1 },
      );
    });
  });

  describe('mutableEnrichWith', () => {
    it('No overlap', () => {
      const value = { a: 0, b: 1 };
      pipe(value, MStruct.mutableEnrichWith({ c: flow(Struct.get('a'), Number.sum(1)) }));
      assert.deepStrictEqual(value as never, { a: 0, b: 1, c: 1 });
    });

    it('With overlap', () => {
      const value = { a: 0, b: 1 };
      pipe(
        value,
        MStruct.mutableEnrichWith({
          c: flow(Struct.get('a'), Number.sum(1)),
          b: flow(Struct.get('b'), Number.sum(1)),
        }),
      );
      assert.deepStrictEqual(value as never, { a: 0, b: 2, c: 1 });
    });
  });

  describe('evolve', () => {
    it('With overlap', () => {
      assert.deepStrictEqual(
        MStruct.evolve(
          { a: 0, b: 1 },
          {
            b: Number.sum(1),
          },
        ),
        { a: 0, b: 2 },
      );
    });
  });
});
