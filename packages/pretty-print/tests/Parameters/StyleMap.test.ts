import { assert, describe, it } from '@effect/vitest';
import * as HashMap from 'effect/HashMap';
import * as Option from 'effect/Option';

import * as ASContextStyler from '@parischap/ansi-styles/ASContextStyler';
import * as ASText from '@parischap/ansi-styles/ASText';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPStyleMap from '@parischap/pretty-print/PPStyleMap';
import * as PPValue from '@parischap/pretty-print/PPValue';

describe('PPStyleMap', () => {
  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(PPStyleMap.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('Equal.equals', () => {
    it('Matching', () => {
      TestUtils.assertEquals(
        PPStyleMap.none,
        PPStyleMap.make({ id: 'None', styles: HashMap.empty() }),
      );
    });

    it('Non-matching', () => {
      TestUtils.assertNotEquals(PPStyleMap.none, PPStyleMap.darkMode);
    });
  });

  it('.toString()', () => {
    assert.strictEqual(PPStyleMap.none.toString(), 'None');
  });

  it('.pipe()', () => {
    assert.strictEqual(PPStyleMap.none.pipe(PPStyleMap.id), 'None');
  });

  describe('get', () => {
    it('Returns a non-trivial styler for an existing part name in darkMode', () => {
      const styler = PPStyleMap.get('ByPassed')(PPStyleMap.darkMode);
      const context = PPValue.fromTopValue({ a: 1 });
      const styled = ASContextStyler.style(styler)(context)('hello');
      const unstyled = ASText.toUnstyledString(styled);
      assert.strictEqual(unstyled, 'hello');
    });

    it('Returns the identity styler for a missing part name in none', () => {
      const context = PPValue.fromTopValue({ a: 1 });
      const styled = ASContextStyler.style(PPStyleMap.get('ByPassed')(PPStyleMap.none))(context)(
        'hello',
      );
      assert.strictEqual(ASText.toAnsiString(styled), 'hello');
    });
  });
});
