import * as Option from 'effect/Option';

import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPParameters from '@parischap/pretty-print/PPParameters';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';
import * as PPStringifier from '@parischap/pretty-print/PPStringifier';

import { describe, it } from 'vitest';

describe('PPStringifier', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(PPStringifier.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(
        PPStringifier.make(PPParameters.utilInspectLike),
        PPStringifier.make(PPParameters.utilInspectLike),
      );
    });

    it('Non-matching', () => {
      TestUtils.assertNotEquals(
        PPStringifier.make(PPParameters.utilInspectLike),
        PPStringifier.make(PPParameters.treeify),
      );
    });
  });

  it('.toString()', () => {
    TestUtils.strictEqual(
      PPStringifier.make(PPParameters.utilInspectLike).toString(),
      'UtilInspectLikeStringifier',
    );
  });

  describe('stringify (utilInspectLike)', () => {
    const { stringify } = PPStringifier.make(PPParameters.utilInspectLike);

    it('Stringifies a number', () => {
      TestUtils.deepStrictEqual(PPStringifiedValue.toUnstyledStrings(stringify(42)), ['42']);
    });

    it('Stringifies a string', () => {
      TestUtils.deepStrictEqual(PPStringifiedValue.toUnstyledStrings(stringify('hello')), [
        "'hello'",
      ]);
    });

    it('Stringifies null', () => {
      TestUtils.deepStrictEqual(PPStringifiedValue.toUnstyledStrings(stringify(null)), ['null']);
    });

    it('Stringifies undefined', () => {
      TestUtils.deepStrictEqual(PPStringifiedValue.toUnstyledStrings(stringify(undefined)), [
        'undefined',
      ]);
    });

    it('Stringifies a simple object', () => {
      TestUtils.deepStrictEqual(PPStringifiedValue.toUnstyledStrings(stringify({ a: 1 })), [
        '{ a: 1 }',
      ]);
    });

    it('Stringifies a simple array', () => {
      TestUtils.deepStrictEqual(PPStringifiedValue.toUnstyledStrings(stringify([1, 2, 3])), [
        '[ 1, 2, 3 ]',
      ]);
    });

    it('Replaces nested objects beyond maxDepth with a tag', () => {
      // utilInspectLike has maxDepth=2; the innermost object { c: 1 } is at depth 2 which is not
      // strictly less than maxDepth, so it gets replaced by a tag
      const deep = { a: { b: { c: 1 } } };
      const result = PPStringifiedValue.toUnstyledStrings(stringify(deep)).join('\n');
      TestUtils.assertTrue(result.includes('[Object]'));
    });

    it('Detects circular references', () => {
      const circular: Record<string, unknown> = {};
      circular['self'] = circular;
      const result = PPStringifiedValue.toUnstyledStrings(stringify(circular)).join('\n');
      TestUtils.assertTrue(result.includes('Circular'));
    });

    it('Stringifies a function by name', () => {
      function myFn(): void {}
      const result = PPStringifiedValue.toUnstyledStrings(stringify(myFn)).join('\n');
      TestUtils.assertTrue(result.includes('myFn'));
    });

    it('Stringifies a Map', () => {
      const result = PPStringifiedValue.toUnstyledStrings(stringify(new Map([['a', 1]]))).join(
        '\n',
      );
      TestUtils.assertTrue(result.includes('Map'));
    });
  });
});
