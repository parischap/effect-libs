import * as Function from 'effect/Function';
import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPByPasser from '@parischap/pretty-print/PPByPasser';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPResolvedNonPrimitiveParameters from '@parischap/pretty-print/PPResolvedNonPrimitiveParameters';
import * as PPValue from '@parischap/pretty-print/PPValue';

import { describe, it } from 'vitest';

describe('PPByPasser', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(PPByPasser.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(
        PPByPasser.empty,
        PPByPasser.make({ id: 'Empty', action: Function.constant(Option.none()) }),
      );
    });

    it('Non-matching', () => {
      TestUtils.assertNotEquals(PPByPasser.empty, PPByPasser.toStringable);
    });
  });

  it('.toString()', () => {
    TestUtils.strictEqual(PPByPasser.empty.toString(), 'Empty');
  });

  it('.pipe()', () => {
    TestUtils.strictEqual(PPByPasser.empty.pipe(PPByPasser.id), 'Empty');
  });

  // The bypassers under test do not consume `applicableNonPrimitiveParameters`, so any resolved
  // instance works. Use the merge default.
  const resolved = PPResolvedNonPrimitiveParameters.utilInspectLikeRecord;

  describe('empty', () => {
    it('Always returns none', () => {
      TestUtils.assertNone(
        PPByPasser.action(PPByPasser.empty)({
          nonPrimitive: PPValue.fromTopValue({ a: 1 }),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
      );
    });
  });

  describe('toStringable', () => {
    it('Applied to a Date (has custom toString)', () => {
      TestUtils.assertSome(
        PPByPasser.action(PPByPasser.toStringable)({
          nonPrimitive: PPValue.fromTopValue(new Date(0)),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
      );
    });

    it('Applied to an object with a custom toString', () => {
      TestUtils.assertSome(
        PPByPasser.action(PPByPasser.toStringable)({
          nonPrimitive: PPValue.fromTopValue({
            toString: (): string => 'custom',
          }),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
      );
    });

    it('Applied to a plain object (no custom toString)', () => {
      TestUtils.assertNone(
        PPByPasser.action(PPByPasser.toStringable)({
          nonPrimitive: PPValue.fromTopValue({ a: 1 }),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
      );
    });

    it('Applied to an array (has non-Object.prototype toString)', () => {
      TestUtils.assertSome(
        PPByPasser.action(PPByPasser.toStringable)({
          nonPrimitive: PPValue.fromTopValue([1, 2]),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
      );
    });
  });

  describe('allWithName', () => {
    it('Applied to a named function with utilInspectLikeFunction', () => {
      const foo = function foo(): void {};
      TestUtils.assertEquals(
        PPByPasser.action(PPByPasser.allWithName)({
          nonPrimitive: PPValue.fromTopValue(foo),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
        Option.some('[Function: foo]'),
      );
    });

    it('Applied to an anonymous function with utilInspectLikeFunction', () => {
      TestUtils.assertEquals(
        PPByPasser.action(PPByPasser.allWithName)({
          nonPrimitive: PPValue.fromTopValue((): void => {}),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
        Option.some('[Function: (anonymous)]'),
      );
    });
  });

  describe('dateAndRegExp', () => {
    it('Applied to a Date', () => {
      TestUtils.assertEquals(
        PPByPasser.action(PPByPasser.dateAndRegExp)({
          nonPrimitive: PPValue.fromTopValue(new Date(0)),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
        Option.some('1970-01-01T00:00:00.000Z'),
      );
    });

    it('Applied to a RegExp', () => {
      TestUtils.assertEquals(
        PPByPasser.action(PPByPasser.dateAndRegExp)({
          nonPrimitive: PPValue.fromTopValue(/foo/g),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
        Option.some('/foo/g'),
      );
    });

    it('Applied to a plain object', () => {
      TestUtils.assertNone(
        PPByPasser.action(PPByPasser.dateAndRegExp)({
          nonPrimitive: PPValue.fromTopValue({ a: 1 }),
          parameters: PPParameters.utilInspectLike,
          applicableNonPrimitiveParameters: resolved,
        }),
      );
    });
  });
});

