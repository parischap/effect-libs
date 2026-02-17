import * as ASText from '@parischap/ansi-styles/ASText'
import * as TestUtils from '@parischap/configs/TestUtils';
import * as PPStringifiedValue from '@parischap/pretty-print/PPStringifiedValue'
import {pipe} from 'effect'
import * as Array from 'effect/Array'
import { describe, it } from 'vitest';

describe('StringifiedValue', () => {
  const test1: PPStringifiedValue.Type = Array.make(
    ASText.fromString('foo'),
    ASText.fromString('bar'),
  );

  describe('equivalence', () => {
    it('Matching', () => {
      TestUtils.assertTrue(
        PPStringifiedValue.equivalence(
          test1,
          Array.make(ASText.fromString('foo'), ASText.fromString('bar')),
        ),
      );
    });

    it('Non-matching', () => {
      TestUtils.assertFalse(PPStringifiedValue.equivalence(test1, PPStringifiedValue.empty));
    });
  });

  it('toSingleLine', () => {
    TestUtils.assertEquals(
      PPStringifiedValue.toSingleLine(test1),
      Array.of(ASText.fromString('foobar')),
    );
  });

  describe('isEmpty', () => {
    it('Matching', () => {
      TestUtils.assertTrue(pipe(PPStringifiedValue.isEmpty(PPStringifiedValue.empty)));
    });

    it('Non-matching', () => {
      TestUtils.assertFalse(PPStringifiedValue.isEmpty(test1));
    });
  });

  describe('length', () => {
    it('With empty StringifiedValue', () => {
      TestUtils.strictEqual(PPStringifiedValue.toLength(PPStringifiedValue.empty), 0);
    });

    it('With non-empty StringifiedValue', () => {
      TestUtils.strictEqual(PPStringifiedValue.toLength(test1), 6);
    });
  });

  it('toAnsiString', () => {
    TestUtils.strictEqual(PPStringifiedValue.toAnsiString()(test1), 'foo\nbar');
  });

  it('toUnstyledStrings', () => {
    TestUtils.deepStrictEqual(PPStringifiedValue.toUnstyledStrings(test1), ['foo', 'bar']);
  });
});
