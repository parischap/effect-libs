import * as TestUtils from '@parischap/configs/TestUtils';
import * as MMatch from '@parischap/effect-lib/MMatch'
import * as MString from '@parischap/effect-lib/MString'
import * as MTree from '@parischap/effect-lib/MTree'
import * as MTreeNode from '@parischap/effect-lib/MTreeNode'
import * as MTuple from '@parischap/effect-lib/MTuple'
import * as MTypes from '@parischap/effect-lib/MTypes'
import {flow, pipe} from 'effect'
import * as Array from 'effect/Array'
import * as Either from 'effect/Either'
import * as Function from 'effect/Function'
import * as Option from 'effect/Option'
import * as Record from 'effect/Record'
import { describe, it } from 'vitest';

describe('MTree', () => {
  /**
   * Function used to unfold an unknown seed value with Tree.unfold. If the seed is a primitive
   * value, it is converted to a string and returned as a leaf node. Otherwise, the seed is
   * converted to a non-leaf node with value `Array` or `Record` depending on whether it is an array
   * or a record and new seeds taken from the string enumerable keys of the seed. If a cycle is
   * detected, the function returns a leaf node with 'Cyclical Array' or 'Cyclical Record. This
   * function creates a Tree.Type<string, string>
   */
  const unfoldObject = (seed: MTypes.Unknown, cycleSource: Option.Option<'Array' | 'Record'>) =>
    pipe(
      cycleSource,
      Option.map(flow(MString.prepend('Cyclical '), Either.left)),
      Option.getOrElse(
        pipe(
          seed,
          MMatch.make,
          MMatch.when(MTypes.isPrimitive, flow(MString.fromPrimitive, Either.left)),
          MMatch.orElse(
            flow(
              MTuple.makeBothBy({
                toFirst: flow(
                  MMatch.make,
                  MMatch.when(MTypes.isArray, Function.constant('Array' as const)),
                  MMatch.orElse(Function.constant('Record' as const)),
                ),
                toSecond: Record.values,
              }),
              Either.right,
            ),
          ),
          Function.constant,
        ),
      ),
    );

  const foldNonLeaf = (value: 'Array' | 'Record', children: ReadonlyArray<string>) => {
    const joined = Array.join(children, ', ');
    return value === 'Array' ? '[' + joined + ']' : '{ ' + joined + ' }';
  };

  const foldLeaf = Function.identity<string>;

  const nonCyclicalObject1 = {
    a: [{ a: { a: 's1', b: 's2' }, b: 's3' }, ['s4']],
    b: [{ a: { a: ['s5'] }, b: 's6' }, 's7'],
  };

  const nonCyclicalObject2 = {
    a: [{ a: { a: 's1', b: 's2' }, b: 's3' }, ['s4']],
    b: [{ a: { a: ['s5'] }, b: 's6' }, 's7'],
  };
  /*  @ts-expect-error  this is a test*/
  nonCyclicalObject2.b.push(nonCyclicalObject2.a[0]);

  const cyclicalObject = {
    a: [{ a: { a: 's1', b: 's2' }, b: 's3' }, ['s4']],
    b: [{ a: { a: ['s5'] }, b: 's6' }, 's7'],
  };

  /* oxlint-disable-next-line typescript-eslint/no-unsafe-call, typescript/no-unsafe-member-access */ /*  @ts-expect-error  this is a test */
  cyclicalObject.b[0].a.a.push(cyclicalObject.b);

  const testTree1 = pipe(nonCyclicalObject1, MTree.unfold(unfoldObject));
  const testTree2 = pipe(nonCyclicalObject2, MTree.unfold(unfoldObject));
  const testTree3 = pipe(cyclicalObject, MTree.unfold(unfoldObject));

  const foldedTestTree1 = '{ [{ { s1, s2 }, s3 }, [s4]], [{ { [s5] }, s6 }, s7] }';
  const mappedTestTree1 = '[{ [[s1@, s2@], s3@], { s4@ } }, { [[{ s5@ }], s6@], s7@ }]';

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(MTree.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  it('unfoldAndFold', () => {
    TestUtils.strictEqual(
      pipe(
        nonCyclicalObject1,
        MTree.unfoldAndFold({
          unfold: unfoldObject,
          foldNonLeaf,
          foldLeaf,
        }),
      ),
      foldedTestTree1,
    );
  });

  describe('fold', () => {
    it('Non-cyclical value 1', () => {
      TestUtils.strictEqual(
        pipe(testTree1, MTree.fold({ foldNonLeaf, foldLeaf })),
        foldedTestTree1,
      );
    });

    it('Non-cyclical value 2', () => {
      TestUtils.strictEqual(
        pipe(testTree2, MTree.fold({ foldNonLeaf, foldLeaf })),
        '{ [{ { s1, s2 }, s3 }, [s4]], [{ { [s5] }, s6 }, s7, { { s1, s2 }, s3 }] }',
      );
    });

    it('Cyclical value', () => {
      TestUtils.strictEqual(
        pipe(testTree3, MTree.fold({ foldNonLeaf, foldLeaf })),
        '{ [{ { s1, s2 }, s3 }, [s4]], [{ { [s5, Cyclical Array] }, s6 }, s7] }',
      );
    });
  });

  it('mapAccum', () => {
    TestUtils.strictEqual(
      pipe(
        testTree1,
        MTree.mapAccum({
          accum: 0,
          fNonLeaf: (accum, a) => [accum + (a === 'Array' ? 1 : 2), a],
          fLeaf: (accum, b) => b + ' ' + accum.toString(),
        }),
        MTree.fold({ foldNonLeaf, foldLeaf }),
      ),
      '{ [{ { s1 7, s2 7 }, s3 5 }, [s4 4]], [{ { [s5 8] }, s6 5 }, s7 3] }',
    );
  });

  it('map', () => {
    TestUtils.strictEqual(
      pipe(
        testTree1,
        MTree.map({
          fNonLeaf: (a) => (a === 'Array' ? 'Record' : 'Array'),
          fLeaf: MString.append('@'),
        }),
        MTree.fold({ foldNonLeaf, foldLeaf }),
      ),
      mappedTestTree1,
    );
  });

  it('reduce', () => {
    TestUtils.strictEqual(
      pipe(
        testTree1,
        MTree.reduce({
          z: 3,
          fNonLeaf: (z, a) => z + (a === 'Array' ? 1 : 2),
          fLeaf: (z, a) => z + a.length,
        }),
      ),
      31,
    );
  });

  it('reduceRight', () => {
    TestUtils.strictEqual(
      pipe(
        testTree1,
        MTree.reduceRight({
          z: 3,
          fNonLeaf: (z, a) => z + (a === 'Array' ? 1 : 2),
          fLeaf: (z, a) => z + a.length,
        }),
      ),
      31,
    );
  });

  it('extendDown', () => {
    TestUtils.strictEqual(
      pipe(
        testTree1,
        MTree.extendDown({
          fNonLeaf: (a) => (a.value === 'Array' ? 'Record' : 'Array'),
          fLeaf: flow(MTreeNode.value, MString.append('@')),
        }),
        MTree.fold({ foldNonLeaf, foldLeaf }),
      ),
      mappedTestTree1,
    );
  });

  it('extendUp', () => {
    TestUtils.strictEqual(
      pipe(
        testTree1,
        MTree.extendUp({
          fNonLeaf: (a) => (a.value === 'Array' ? 'Record' : 'Array'),
          fLeaf: flow(MTreeNode.value, MString.append('@')),
        }),
        MTree.fold({ foldNonLeaf, foldLeaf }),
      ),
      mappedTestTree1,
    );
  });
});
