import { assert, describe, it } from '@effect/vitest';
import { pipe } from 'effect';
import * as Option from 'effect/Option';

import * as ASPalette from '@parischap/ansi-styles/ASPalette';
import * as ASStyle from '@parischap/ansi-styles/ASStyle';
import * as TestUtils from '@parischap/configs/TestUtils';

describe('ASPalette', () => {
  const blackRed = ASPalette.make(ASStyle.black, ASStyle.red);
  const greenBlue = ASPalette.make(ASStyle.green, ASStyle.blue);

  describe('Tag, prototype and guards', () => {
    it('moduleTag', () => {
      TestUtils.assertEquals(
        Option.some(ASPalette.moduleTag),
        TestUtils.moduleTagFromTestFilePath(import.meta.filename),
      );
    });

    describe('.toString()', () => {
      it('Black and red', () => {
        assert.strictEqual(blackRed.toString(), 'Black/RedPalette');
      });

      it('Green and blue', () => {
        assert.strictEqual(greenBlue.toString(), 'Green/BluePalette');
      });
    });
  });

  it('styles', () => {
    const s = ASPalette.styles(blackRed);
    assert.strictEqual(s.length, 2);
    assert.strictEqual(s[0].toString(), 'Black');
    assert.strictEqual(s[1].toString(), 'Red');
  });

  it('append', () => {
    const combined = pipe(blackRed, ASPalette.append(greenBlue));
    assert.strictEqual(combined.toString(), 'Black/Red/Green/BluePalette');
    assert.strictEqual(ASPalette.styles(combined).length, 4);
  });

  describe('Predefined palettes', () => {
    it('allStandardOriginalColors has 8 styles', () => {
      assert.strictEqual(ASPalette.styles(ASPalette.allStandardOriginalColors).length, 8);
    });

    it('allBrightOriginalColors has 8 styles', () => {
      assert.strictEqual(ASPalette.styles(ASPalette.allBrightOriginalColors).length, 8);
    });

    it('allOriginalColors has 16 styles', () => {
      assert.strictEqual(ASPalette.styles(ASPalette.allOriginalColors).length, 16);
    });
  });
});
