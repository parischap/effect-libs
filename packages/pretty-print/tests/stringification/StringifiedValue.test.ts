import * as Array from 'effect/Array';

import * as ASText from '@parischap/ansi-styles/ASText';
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue';

import { describe, it } from 'vitest';

describe('PPStringifiedValue', () => {
  const twoLines: PPStringifiedValue.Type = Array.make(
    ASText.fromString('foo'),
    ASText.fromString('bar'),
  );

  describe('equivalence', () => {
    it('Matching', () => {
      TestUtils.assertTrue(
        PPStringifiedValue.equivalence(
          twoLines,
          Array.make(ASText.fromString('foo'), ASText.fromString('bar')),
        ),
      );
    });

    it('Non-matching', () => {
      TestUtils.assertFalse(PPStringifiedValue.equivalence(twoLines, PPStringifiedValue.empty));
    });
  });

  describe('isEmpty', () => {
    it('True for empty', () => {
      TestUtils.assertTrue(PPStringifiedValue.isEmpty(PPStringifiedValue.empty));
    });

    it('False for non-empty', () => {
      TestUtils.assertFalse(PPStringifiedValue.isEmpty(twoLines));
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
      TestUtils.strictEqual(PPStringifiedValue.toLength(PPStringifiedValue.empty), 0);
    });

    it('Sums lengths across lines', () => {
      TestUtils.strictEqual(PPStringifiedValue.toLength(twoLines), 6);
    });
  });

  it('toAnsiString joins lines with a line break', () => {
    TestUtils.strictEqual(PPStringifiedValue.toAnsiString()(twoLines), 'foo\nbar');
  });

  it('toUnstyledStrings returns an array of plain strings', () => {
    TestUtils.deepStrictEqual(PPStringifiedValue.toUnstyledStrings(twoLines), ['foo', 'bar']);
  });

  describe('concat', () => {
    it('Appends lines from that to self', () => {
      TestUtils.deepStrictEqual(
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
      TestUtils.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPStringifiedValue.prependToFirstLine(ASText.fromString('> '))(twoLines),
        ),
        ['> foo', 'bar'],
      );
    });
  });

  describe('appendToLastLine', () => {
    it('Appends text only to the last line', () => {
      TestUtils.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPStringifiedValue.appendToLastLine(ASText.fromString('!'))(twoLines),
        ),
        ['foo', 'bar!'],
      );
    });
  });

  describe('prependToAllLines', () => {
    it('Prepends text to every line', () => {
      TestUtils.deepStrictEqual(
        PPStringifiedValue.toUnstyledStrings(
          PPStringifiedValue.prependToAllLines(ASText.fromString('  '))(twoLines),
        ),
        ['  foo', '  bar'],
      );
    });
  });
});
