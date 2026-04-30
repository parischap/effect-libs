import * as Option from 'effect/Option';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPPropertyFormatter from '@parischap/pretty-print/PPPropertyFormatter';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPValue from '@parischap/pretty-print/PPValue';

import { describe, it } from 'vitest';

describe('PPPropertyFormatter', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(PPPropertyFormatter.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(PPPropertyFormatter.valueOnly, PPPropertyFormatter.valueOnly);
    });

    it('Non-matching', () => {
      TestUtils.assertNotEquals(
        PPPropertyFormatter.valueOnly,
        PPPropertyFormatter.utilInspectLikeArrayAndRecord,
      );
    });
  });

  it('.toString()', () => {
    TestUtils.strictEqual(PPPropertyFormatter.valueOnly.toString(), 'ValueOnly');
  });

  it('.pipe()', () => {
    TestUtils.strictEqual(PPPropertyFormatter.valueOnly.pipe(PPPropertyFormatter.id), 'ValueOnly');
  });

  const stringifiedValue = PPStringifiedValue.fromText(ASText.fromString('1'));
  const parameters = PPParameters.utilInspectLike;

  describe('valueOnly', () => {
    it('Returns the value unchanged regardless of key', () => {
      TestUtils.deepStrictEqual(
        PPPropertyFormatter.action(PPPropertyFormatter.valueOnly)({
          property: PPValue.fromNonPrimitiveValueAndKey({
            nonPrimitive: { a: 1 },
            key: 'a',
            depth: 1,
            protoDepth: 0,
          }),
          stringifiedPropValue: stringifiedValue,
          isLeaf: false,
          hideKey: false,
          parameters,
        }),
        stringifiedValue,
      );
    });
  });

  describe('utilInspectLikeArrayAndRecord', () => {
    it('With empty key (top-level value)', () => {
      TestUtils.deepStrictEqual(
        PPPropertyFormatter.action(PPPropertyFormatter.utilInspectLikeArrayAndRecord)({
          property: PPValue.fromTopValue(1),
          stringifiedPropValue: stringifiedValue,
          isLeaf: false,
          hideKey: false,
          parameters,
        }),
        stringifiedValue,
      );
    });

    it('With string key at protoDepth 0', () => {
      TestUtils.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPPropertyFormatter.action(PPPropertyFormatter.utilInspectLikeArrayAndRecord)({
            property: PPValue.fromNonPrimitiveValueAndKey({
              nonPrimitive: { a: 1 },
              key: 'a',
              depth: 1,
              protoDepth: 0,
            }),
            stringifiedPropValue: stringifiedValue,
            isLeaf: false,
            hideKey: false,
            parameters,
          }),
        ),
        ['a: 1'],
      );
    });

    it('hideKey suppresses the key display', () => {
      TestUtils.deepStrictEqual(
        PPPropertyFormatter.action(PPPropertyFormatter.utilInspectLikeArrayAndRecord)({
          property: PPValue.fromNonPrimitiveValueAndKey({
            nonPrimitive: { a: 1 },
            key: 'a',
            depth: 1,
            protoDepth: 0,
          }),
          stringifiedPropValue: stringifiedValue,
          isLeaf: false,
          hideKey: true,
          parameters,
        }),
        stringifiedValue,
      );
    });
  });

  describe('usualTreeify', () => {
    const property = PPValue.fromNonPrimitiveValueAndKey({
      nonPrimitive: { a: 1 },
      key: 'a',
      depth: 1,
      protoDepth: 0,
    });

    it('Non-leaf: key on its own line, value on the next', () => {
      TestUtils.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPPropertyFormatter.action(PPPropertyFormatter.usualTreeify)({
            property,
            stringifiedPropValue: stringifiedValue,
            isLeaf: false,
            hideKey: false,
            parameters,
          }),
        ),
        ['a', '1'],
      );
    });

    it('Leaf: key and value on the same line, separated by ": "', () => {
      TestUtils.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPPropertyFormatter.action(PPPropertyFormatter.usualTreeify)({
            property,
            stringifiedPropValue: stringifiedValue,
            isLeaf: true,
            hideKey: false,
            parameters,
          }),
        ),
        ['a: 1'],
      );
    });
  });
});
