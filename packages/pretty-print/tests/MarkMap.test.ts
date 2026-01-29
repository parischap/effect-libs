import * as TestUtils from '@parischap/configs/TestUtils';
import { PPMarkMap } from '@parischap/pretty-print';
import { describe, it } from 'vitest';

describe('MarkMap', () => {
  const {utilInspectLike} = PPMarkMap;

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(TestUtils.moduleTagFromTestFilePath(__filename), PPMarkMap.moduleTag);
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(utilInspectLike, PPMarkMap.make(utilInspectLike));
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(
          utilInspectLike,
          PPMarkMap.make({ ...utilInspectLike, id: 'Dummy' }),
        );
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(utilInspectLike.toString(), `UtilInspectLike`);
    });

    it('.pipe()', () => {
      TestUtils.strictEqual(utilInspectLike.pipe(PPMarkMap.id), 'UtilInspectLike');
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(PPMarkMap.has(utilInspectLike));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(PPMarkMap.has(new Date()));
      });
    });
  });
});
