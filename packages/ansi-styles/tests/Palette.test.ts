import { ASPalette, ASStyle } from '@parischap/ansi-styles';
import * as TestUtils from '@parischap/configs/TestUtils';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('ASPalette', () => {
  const blackRed = ASPalette.make(ASStyle.black, ASStyle.red);

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(ASPalette.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    describe('.toString()', () => {
      it('Black and red', () => {
        TestUtils.strictEqual(blackRed.toString(), 'Black/RedPalette');
      });
    });
  });
});
