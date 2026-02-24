import * as TestUtils from '@parischap/configs/TestUtils';
import * as MRegExp from '@parischap/effect-lib/MRegExp';
import { describe, it } from 'vitest';

describe('MRegExp', () => {
  describe('fromRegExpString', () => {
    it('Without flags', () => {
      TestUtils.deepStrictEqual(MRegExp.fromRegExpString()('foo'), /foo/);
    });

    it('With flags', () => {
      TestUtils.deepStrictEqual(MRegExp.fromRegExpString('gi')('foo'), /foo/gi);
    });
  });

  describe('lineBreak', () => {
    it('Windows line break', () => {
      TestUtils.assertTrue(MRegExp.lineBreak.test('foo\r\nbar'));
    });

    it('Unix line break', () => {
      TestUtils.assertTrue(MRegExp.lineBreak.test('foo\nbar'));
    });

    it('No line break', () => {
      TestUtils.assertFalse(MRegExp.lineBreak.test('foobar'));
    });
  });

  describe('semVer', () => {
    it('Valid SemVer', () => {
      TestUtils.assertTrue(MRegExp.semVer.test('1.2.3'));
    });

    it('Invalid SemVer', () => {
      TestUtils.assertFalse(MRegExp.semVer.test('1.2'));
    });
  });

  describe('email', () => {
    it('Valid email', () => {
      TestUtils.assertTrue(MRegExp.email.test('user@example.com'));
    });

    it('Invalid email', () => {
      TestUtils.assertFalse(MRegExp.email.test('not-an-email'));
    });
  });
});
