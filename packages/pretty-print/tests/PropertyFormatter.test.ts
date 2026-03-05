import { pipe } from 'effect';

import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as ASText from '@parischap/ansi-styles/ASText';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPIndex from '@parischap/pretty-print/PPIndex';
import * as PPMarkShowerConstructor from '@parischap/pretty-print/PPMarkShowerConstructor';
import * as PPNonPrimitiveFormatter from '@parischap/pretty-print/PPNonPrimitiveFormatter';
import * as PPNonPrimitiveParameters from '@parischap/pretty-print/PPNonPrimitiveParameters';
import * as PPPropertyFormatter from '@parischap/pretty-print/PPPropertyFormatter';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPValue from '@parischap/pretty-print/PPValue';
import * as PPValueBasedStylerConstructor from '@parischap/pretty-print/PPValueBasedStylerConstructor';

import * as Array from 'effect/Array';
import * as Function from 'effect/Function';
import { describe, it } from 'vitest';

describe('PropertyFormatter', () => {
  const utilInspectLike = PPIndex.darkModeUtilInspectLike;
  const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(utilInspectLike);
  const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
  const nonPrimitiveOption = PPNonPrimitiveParameters.maps('Foo');
  const constructors = {
    valueBasedStylerConstructor,
    markShowerConstructor,
  };
  const { valueOnly } = PPPropertyFormatter;

  const stringified = pipe('1', ASText.fromString, PPStringifiedValue.fromText);

  describe('Tag and equality', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(
        TestUtils.moduleTagFromTestFilePath(__filename),
        PPPropertyFormatter.moduleTag,
      );
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(
          valueOnly,
          PPPropertyFormatter.make({
            id: 'ValueOnly',
            action: () => () => () => PPStringifiedValue.empty,
          }),
        );
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(valueOnly, PPPropertyFormatter.keyAndValue);
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(valueOnly.toString(), `ValueOnly`);
    });
  });

  it('valueOnly', () => {
    const valueOnlyFormatter = PPPropertyFormatter.apply(PPPropertyFormatter.valueOnly)(
      nonPrimitiveOption,
    )(constructors);
    TestUtils.strictEqual(
      pipe(
        valueOnlyFormatter({
          value: PPValue.fromNonPrimitiveValueAndKey({
            nonPrimitive: { a: 1, b: 'foo' },
            key: 'a',
            depth: 1,
            protoDepth: 0,
          }),
          isLeaf: false,
        }),
        Function.apply(stringified),
        PPStringifiedValue.toAnsiString(),
      ),
      pipe('1', ASStyle.none, PPStringifiedValue.fromText, PPStringifiedValue.toAnsiString()),
    );
  });

  describe('keyAndValue', () => {
    const keyAndValueFormatter = PPPropertyFormatter.apply(PPPropertyFormatter.keyAndValue)(
      nonPrimitiveOption,
    )(constructors);
    const tabifiedKeyAndValueFormatter = PPPropertyFormatter.apply(PPPropertyFormatter.keyAndValue)(
      PPNonPrimitiveParameters.make({
        ...nonPrimitiveOption,
        nonPrimitiveFormatter: PPNonPrimitiveFormatter.tabify,
      }),
    )(constructors);

    it('With empty key', () => {
      TestUtils.strictEqual(
        pipe(
          keyAndValueFormatter({ value: PPValue.fromTopValue(1), isLeaf: false }),
          Function.apply(stringified),
          PPStringifiedValue.toAnsiString(),
        ),
        pipe('1', ASStyle.none, PPStringifiedValue.fromText, PPStringifiedValue.toAnsiString()),
      );
    });

    it('With one-line key at protoDepth=0', () => {
      TestUtils.strictEqual(
        pipe(
          keyAndValueFormatter({
            value: PPValue.fromNonPrimitiveValueAndKey({
              nonPrimitive: { a: 1, b: 'foo' },
              key: 'a',
              depth: 1,
              protoDepth: 0,
            }),
            isLeaf: false,
          }),
          Function.apply(stringified),
          PPStringifiedValue.toAnsiString(),
        ),
        pipe(
          ASStyle.none(ASStyle.red('a'), ASStyle.white(' => '), '1'),
          PPStringifiedValue.fromText,
          PPStringifiedValue.toAnsiString(),
        ),
      );
    });

    it('With one-line key at protoDepth=2', () => {
      TestUtils.strictEqual(
        pipe(
          keyAndValueFormatter({
            value: PPValue.fromNonPrimitiveValueAndKey({
              nonPrimitive: { a: 1, b: 'foo' },
              key: 'a',
              depth: 1,
              protoDepth: 2,
            }),
            isLeaf: false,
          }),
          Function.apply(stringified),
          PPStringifiedValue.toAnsiString(),
        ),
        pipe(
          ASStyle.none(ASStyle.red('a'), ASStyle.green('@@'), ASStyle.white(' => '), '1'),
          PPStringifiedValue.fromText,
          PPStringifiedValue.toAnsiString(),
        ),
      );
    });

    it('With multi-line key and multiline value', () => {
      TestUtils.strictEqual(
        pipe(
          tabifiedKeyAndValueFormatter({
            value: PPValue.fromIterable({
              content: { c: 3, d: 4 },
              stringKey: ['{', '  c : 3,', '  d : 4', '}'],
              depth: 1,
            }),
            isLeaf: false,
          }),
          Function.apply(
            Array.make(
              ASText.fromString('{'),
              ASText.fromString('  a : 1,'),
              ASText.fromString('  b : 2'),
              ASText.fromString('}'),
            ),
          ),
          PPStringifiedValue.toAnsiString(),
        ),
        pipe(
          Array.make(
            ASStyle.red('{'),
            ASStyle.red('  c : 3,'),
            ASStyle.red('  d : 4'),
            ASStyle.none(ASStyle.red('}'), ASStyle.white(' => '), '{'),
            ASStyle.none('  a : 1,'),
            ASStyle.none('  b : 2'),
            ASStyle.none('}'),
          ),
          PPStringifiedValue.toAnsiString(),
        ),
      );
    });
  });

  describe('treeify', () => {
    const treeifyFormatter = PPPropertyFormatter.apply(PPPropertyFormatter.treeify)(
      nonPrimitiveOption,
    )(constructors);

    describe('With empty key', () => {
      it('isLeaf=false', () => {
        TestUtils.deepStrictEqual(
          pipe(
            treeifyFormatter({ value: PPValue.fromTopValue(1), isLeaf: false }),
            Function.apply(stringified),
            PPStringifiedValue.toUnstyledStrings,
          ),
          ['1'],
        );
      });

      it('isLeaf=true', () => {
        TestUtils.deepStrictEqual(
          pipe(
            treeifyFormatter({ value: PPValue.fromTopValue(1), isLeaf: true }),
            Function.apply(stringified),
            PPStringifiedValue.toUnstyledStrings,
          ),
          ['1'],
        );
      });
    });

    describe('With one-line key at protoDepth=0', () => {
      it('isLeaf=false', () => {
        TestUtils.deepStrictEqual(
          pipe(
            treeifyFormatter({
              value: PPValue.fromNonPrimitiveValueAndKey({
                nonPrimitive: { a: 1, b: 'foo' },
                key: 'a',
                depth: 1,
                protoDepth: 0,
              }),
              isLeaf: false,
            }),
            Function.apply(stringified),
            PPStringifiedValue.toUnstyledStrings,
          ),
          ['a', '1'],
        );
      });

      it('isLeaf=true', () => {
        TestUtils.deepStrictEqual(
          pipe(
            treeifyFormatter({
              value: PPValue.fromNonPrimitiveValueAndKey({
                nonPrimitive: { a: 1, b: 'foo' },
                key: 'a',
                depth: 1,
                protoDepth: 0,
              }),
              isLeaf: true,
            }),
            Function.apply(stringified),
            PPStringifiedValue.toUnstyledStrings,
          ),
          ['a => 1'],
        );
      });
    });
  });
});
