import * as ASStyle from '@parischap/ansi-styles/ASStyle'
import * as ASText from '@parischap/ansi-styles/ASText'
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPIndex from '@parischap/pretty-print/PPIndex'
import * as PPMarkShowerConstructor from '@parischap/pretty-print/PPMarkShowerConstructor'
import * as PPNonPrimitiveFormatter from '@parischap/pretty-print/PPNonPrimitiveFormatter'
import * as PPNonPrimitiveParameters from '@parischap/pretty-print/PPNonPrimitiveParameters'
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue'
import * as PPValue from '@parischap/pretty-print/PPValue'
import * as PPValueBasedStylerConstructor from '@parischap/pretty-print/PPValueBasedStylerConstructor'
import {pipe} from 'effect'
import * as Array from 'effect/Array'
import * as Function from 'effect/Function'
import { describe, it } from 'vitest';

describe('NonPrimitiveFormatter', () => {
  const { singleLine } = PPNonPrimitiveFormatter;
  const utilInspectLike = PPIndex.darkModeUtilInspectLike;
  const valueBasedStylerConstructor = PPValueBasedStylerConstructor.fromOption(utilInspectLike);
  const markShowerConstructor = PPMarkShowerConstructor.fromOption(utilInspectLike);
  const nonPrimitiveOption = PPNonPrimitiveParameters.maps('Foo');
  const constructors = {
    valueBasedStylerConstructor,
    markShowerConstructor,
  };
  const valueAndHeader = {
    value: PPValue.fromTopValue({ a: 1, b: 21 }) as PPValue.NonPrimitive,
    header: ASText.fromString('Foo(2) '),
  };
  const children = Array.make(
    pipe('a : 1', ASText.fromString, PPStringifiedValue.fromText),
    pipe('b : 21', ASText.fromString, PPStringifiedValue.fromText),
  );
  const singleLineResult = pipe(
    ASStyle.none(
      'Foo(2) ',
      ASStyle.red('{ '),
      'a : 1',
      ASStyle.white(', '),
      'b : 21',
      ASStyle.red(' }'),
    ),
    PPStringifiedValue.fromText,
    PPStringifiedValue.toAnsiString(),
  );

  const tabifyResult = pipe(
    Array.make(
      ASStyle.none('Foo(2) ', ASStyle.red('{')),
      ASStyle.none(ASStyle.green('  '), 'a : 1', ASStyle.white(',')),
      ASStyle.none(ASStyle.green('  '), 'b : 21'),
      ASStyle.red('}'),
    ),
    PPStringifiedValue.toAnsiString(),
  );

  const treeifyResult = pipe(
    Array.make(
      ASStyle.none(ASStyle.green('├─ '), 'a : 1'),
      ASStyle.none(ASStyle.green('└─ '), 'b : 21'),
    ),
    PPStringifiedValue.toAnsiString(),
  );

  describe('Tag and equality', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(
        TestUtils.moduleTagFromTestFilePath(__filename),
        PPNonPrimitiveFormatter.moduleTag,
      );
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(
          singleLine,
          PPNonPrimitiveFormatter.make({
            id: 'SingleLine',
            action: () => () => () => PPStringifiedValue.empty,
          }),
        );
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(singleLine, PPNonPrimitiveFormatter.tabify);
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(singleLine.toString(), `SingleLine`);
    });
  });

  describe('singleLine', () => {
    it('With strictly more than 0 children', () => {
      TestUtils.strictEqual(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(singleLine)(nonPrimitiveOption)(constructors),
          Function.apply(children),
          PPStringifiedValue.toAnsiString(),
        ),
        singleLineResult,
      );
    });

    it('With 0 children', () => {
      TestUtils.deepStrictEqual(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(singleLine)(nonPrimitiveOption)(constructors),
          Function.apply(Array.empty()),
          PPStringifiedValue.toUnstyledStrings,
        ),
        ['Foo(2) {}'],
      );
    });
  });

  describe('tabify', () => {
    it('With strictly more than 0 children', () => {
      TestUtils.strictEqual(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(PPNonPrimitiveFormatter.tabify)(nonPrimitiveOption)(constructors),
          Function.apply(children),
          PPStringifiedValue.toAnsiString(),
        ),
        tabifyResult,
      );
    });

    it('With 0 children', () => {
      TestUtils.deepStrictEqual(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(PPNonPrimitiveFormatter.tabify)(nonPrimitiveOption)(constructors),
          Function.apply(Array.empty()),
          PPStringifiedValue.toUnstyledStrings,
        ),
        ['Foo(2) {', '}'],
      );
    });
  });

  describe('treeify', () => {
    it('With strictly more than 0 children', () => {
      TestUtils.strictEqual(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(PPNonPrimitiveFormatter.treeify)(nonPrimitiveOption)(constructors),
          Function.apply(children),
          PPStringifiedValue.toAnsiString(),
        ),
        treeifyResult,
      );
    });
    it('With 0 children', () => {
      TestUtils.assertTrue(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(PPNonPrimitiveFormatter.treeify)(nonPrimitiveOption)(constructors),
          Function.apply(Array.empty()),
          PPStringifiedValue.isEmpty,
        ),
      );
    });
  });

  describe('splitOnConstituentNumberMaker', () => {
    it('Under limit', () => {
      TestUtils.strictEqual(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(
            PPNonPrimitiveFormatter.splitOnConstituentNumberMaker(2),
          )(nonPrimitiveOption)(constructors),
          Function.apply(children),
          PPStringifiedValue.toAnsiString(),
        ),
        singleLineResult,
      );
    });

    it('Above limit', () => {
      TestUtils.strictEqual(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(
            PPNonPrimitiveFormatter.splitOnConstituentNumberMaker(1),
          )(nonPrimitiveOption)(constructors),
          Function.apply(children),
          PPStringifiedValue.toAnsiString(),
        ),
        tabifyResult,
      );
    });
  });

  describe('splitOnTotalLengthMaker', () => {
    describe('With strictly more than 0 children', () => {
      it('Under limit', () => {
        TestUtils.strictEqual(
          pipe(
            valueAndHeader,
            PPNonPrimitiveFormatter.apply(
              PPNonPrimitiveFormatter.splitOnTotalLengthMaker(24),
            )(nonPrimitiveOption)(constructors),
            Function.apply(children),
            PPStringifiedValue.toAnsiString(),
          ),
          singleLineResult,
        );
      });

      it('Above limit', () => {
        TestUtils.strictEqual(
          pipe(
            valueAndHeader,
            PPNonPrimitiveFormatter.apply(
              PPNonPrimitiveFormatter.splitOnTotalLengthMaker(23),
            )(nonPrimitiveOption)(constructors),
            Function.apply(children),
            PPStringifiedValue.toAnsiString(),
          ),
          tabifyResult,
        );
      });
    });

    describe('With 0 children', () => {
      it('Under limit', () => {
        TestUtils.deepStrictEqual(
          pipe(
            valueAndHeader,
            PPNonPrimitiveFormatter.apply(
              PPNonPrimitiveFormatter.splitOnTotalLengthMaker(9),
            )(nonPrimitiveOption)(constructors),
            Function.apply(Array.empty()),
            PPStringifiedValue.toUnstyledStrings,
          ),
          ['Foo(2) {}'],
        );
      });

      it('Above limit', () => {
        TestUtils.deepStrictEqual(
          pipe(
            valueAndHeader,
            PPNonPrimitiveFormatter.apply(
              PPNonPrimitiveFormatter.splitOnTotalLengthMaker(8),
            )(nonPrimitiveOption)(constructors),
            Function.apply(Array.empty()),
            PPStringifiedValue.toUnstyledStrings,
          ),
          ['Foo(2) {', '}'],
        );
      });
    });
  });

  describe('splitOnLongestPropLengthMaker', () => {
    it('Under limit', () => {
      TestUtils.strictEqual(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(
            PPNonPrimitiveFormatter.splitOnLongestPropLengthMaker(6),
          )(nonPrimitiveOption)(constructors),
          Function.apply(children),
          PPStringifiedValue.toAnsiString(),
        ),
        singleLineResult,
      );
    });

    it('Above limit', () => {
      TestUtils.strictEqual(
        pipe(
          valueAndHeader,
          PPNonPrimitiveFormatter.apply(
            PPNonPrimitiveFormatter.splitOnLongestPropLengthMaker(5),
          )(nonPrimitiveOption)(constructors),
          Function.apply(children),
          PPStringifiedValue.toAnsiString(),
        ),
        tabifyResult,
      );
    });
  });
});
