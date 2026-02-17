import * as ASPalette from '@parischap/ansi-styles/ASPalette'
import * as ASStyle from '@parischap/ansi-styles/ASStyle'
import * as TestUtils from '@parischap/configs/TestUtils';
import * as Option from 'effect/Option'
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
