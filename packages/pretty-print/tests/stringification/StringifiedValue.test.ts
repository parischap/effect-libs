import { assert, describe, it } from '@effect/vitest';
import * as Array from 'effect/Array';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';

describe('PPStringifiedValue', () => {
  const twoLines: PPStringifiedValue.Type = Array.make(
    ASText.fromString('foo'),
    ASText.fromString('bar'),
  );

  describe('equivalence', () => {
    it('Matching', () => {
      assert.isTrue(
        PPStringifiedValue.equivalence(
          twoLines,
          Array.make(ASText.fromString('foo'), ASText.fromString('bar')),
        ),
      );
    });

    it('Non-matching', () => {
      assert.isFalse(PPStringifiedValue.equivalence(twoLines, PPStringifiedValue.empty));
    });
  });

  describe('isEmpty', () => {
    it('True for empty', () => {
      assert.isTrue(PPStringifiedValue.isEmpty(PPStringifiedValue.empty));
    });

    it('False for non-empty', () => {
      assert.isFalse(PPStringifiedValue.isEmpty(twoLines));
    });
  });

  it('toSingleLine collapses all lines', () => {
    TestUtils.assertEquals(
      PPStringifiedValue.toSingleLine(twoLines),
      PPStringifiedValue.fromText(ASText.fromString('foobar')),
    );
  });

  describe('toLength', () => {
    it('Empty gives 0', () => {
      assert.strictEqual(PPStringifiedValue.toLength(PPStringifiedValue.empty), 0);
    });

    it('Sums lengths across lines', () => {
      assert.strictEqual(PPStringifiedValue.toLength(twoLines), 6);
    });
  });

  it('toAnsiString joins lines with a line break', () => {
    assert.strictEqual(PPStringifiedValue.toAnsiString()(twoLines), 'foo\nbar');
  });

  it('toUnstyledStrings returns an array of plain strings', () => {
    assert.deepStrictEqual(PPStringifiedValue.toUnstyledStrings(twoLines), ['foo', 'bar']);
  });

  describe('concat', () => {
    it('Appends lines from that to self', () => {
      assert.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPStringifiedValue.concat(PPStringifiedValue.fromText(ASText.fromString('baz')))(
            twoLines,
          ),
        ),
        ['foo', 'bar', 'baz'],
      );
    });
  });

  describe('prependToFirstLine', () => {
    it('Prepends text only to the first line', () => {
      assert.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPStringifiedValue.prependToFirstLine(ASText.fromString('> '))(twoLines),
        ),
        ['> foo', 'bar'],
      );
    });
  });

  describe('appendToLastLine', () => {
    it('Appends text only to the last line', () => {
      assert.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPStringifiedValue.appendToLastLine(ASText.fromString('!'))(twoLines),
        ),
        ['foo', 'bar!'],
      );
    });
  });

  describe('prependToAllLines', () => {
    it('Prepends text to every line', () => {
      assert.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPStringifiedValue.prependToAllLines(ASText.fromString('  '))(twoLines),
        ),
        ['  foo', '  bar'],
      );
    });
  });
});
