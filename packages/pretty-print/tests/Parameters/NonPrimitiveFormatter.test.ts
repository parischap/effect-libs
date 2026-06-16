import * as Array from 'effect/Array';
import * as Option from 'effect/Option';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPNonPrimitiveFormatter from '@parischap/pretty-print/PPNonPrimitiveFormatter';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPResolvedNonPrimitiveParameters from '@parischap/pretty-print/PPResolvedNonPrimitiveParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPValue from '@parischap/pretty-print/PPValue';

import { describe, it } from 'vitest';

describe('PPNonPrimitiveFormatter', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(PPNonPrimitiveFormatter.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(
        PPNonPrimitiveFormatter.utilInspectLikeRecord,
        PPNonPrimitiveFormatter.utilInspectLikeRecord,
      );
    });

    it('Non-matching', () => {
      TestUtils.assertNotEquals(
        PPNonPrimitiveFormatter.utilInspectLikeRecord,
        PPNonPrimitiveFormatter.utilInspectLikeArray,
      );
    });
  });

  it('.toString()', () => {
    TestUtils.strictEqual(
      PPNonPrimitiveFormatter.utilInspectLikeRecord.toString(),
      'SplitWhenTotalLengthExceeds80With/,/{/}/ /  /Marks',
    );
  });

  const nonPrimitive = PPValue.fromTopValue({ a: 1, b: 21 });
  const header = (): ASText.Type => ASText.fromString('');
  const stringifiedProperties = Array.make(
    PPStringifiedValue.fromText(ASText.fromString('a: 1')),
    PPStringifiedValue.fromText(ASText.fromString('b: 21')),
  );
  const parameters = PPParameters.utilInspectLike;
  const applicableNonPrimitiveParameters = PPResolvedNonPrimitiveParameters.utilInspectLikeRecord;

  describe('utilInspectLikeRecord', () => {
    it('With properties (single-line under limit)', () => {
      TestUtils.deepStrictEqual(
        PPNonPrimitiveFormatter.action(PPNonPrimitiveFormatter.utilInspectLikeRecord)({
          nonPrimitive,
          header,
          stringifiedProperties,
          parameters,
          applicableNonPrimitiveParameters,
        }),
        PPStringifiedValue.fromText(ASText.fromString('{ a: 1, b: 21 }')),
      );
    });

    it('With no properties', () => {
      TestUtils.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPNonPrimitiveFormatter.action(PPNonPrimitiveFormatter.utilInspectLikeRecord)({
            nonPrimitive,
            header,
            stringifiedProperties: Array.empty(),
            parameters,
            applicableNonPrimitiveParameters,
          }),
        ),
        ['{}'],
      );
    });
  });

  describe('usualTreeify', () => {
    it('With properties', () => {
      TestUtils.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPNonPrimitiveFormatter.action(PPNonPrimitiveFormatter.usualTreeify)({
            nonPrimitive,
            header,
            stringifiedProperties,
            parameters,
            applicableNonPrimitiveParameters,
          }),
        ),
        ['├─ a: 1', '└─ b: 21'],
      );
    });

    it('With no properties', () => {
      TestUtils.assertTrue(
        PPStringifiedValue.isEmpty(
          PPNonPrimitiveFormatter.action(PPNonPrimitiveFormatter.usualTreeify)({
            nonPrimitive,
            header,
            stringifiedProperties: Array.empty(),
            parameters,
            applicableNonPrimitiveParameters,
          }),
        ),
      );
    });
  });
});
