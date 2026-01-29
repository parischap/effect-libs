import { ASContextStyler, ASText } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { PPStyleMap, PPValue } from '@parischap/pretty-print';
import { Function, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('StyleMap', () => {
  const { none } = PPStyleMap;
  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), PPStyleMap.moduleTag);
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(none, PPStyleMap.make(none));
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(none, PPStyleMap.darkMode);
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(none.toString(), `None`);
    });

    it('.pipe()', () => {
      TestUtils.strictEqual(none.pipe(PPStyleMap.id), 'None');
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(PPStyleMap.has(none));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(PPStyleMap.has(new Date()));
      });
    });
  });

  describe('get', () => {
    it('Existing partname', () => {
      TestUtils.assertTrue(
        pipe(PPStyleMap.darkMode, PPStyleMap.get('Message'), ASContextStyler.has),
      );
    });

    it('Missing partname', () => {
      TestUtils.strictEqual(
        pipe(
          none,
          PPStyleMap.get('Message'),
          Function.apply(PPValue.fromTopValue(null)),
          Function.apply('foo'),
          ASText.toAnsiString,
        ),
        'foo',
      );
    });
  });
});
