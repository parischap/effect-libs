import * as MRegExp from '@parischap/effect-lib/MRegExp';

import { assert, describe, it } from '@effect/vitest';

describe('MRegExp', () => {
  describe('fromRegExpString', () => {
    it('Without flags', () => {
      assert.deepStrictEqual(MRegExp.fromRegExpString()('foo'), /foo/);
    });

    it('With flags', () => {
      assert.deepStrictEqual(MRegExp.fromRegExpString('gi')('foo'), /foo/gi);
    });
  });

  describe('lineBreak', () => {
    it('Windows line break', () => {
      assert.isTrue(MRegExp.lineBreak.test('foo\r\nbar'));
    });

    it('Unix line break', () => {
      assert.isTrue(MRegExp.lineBreak.test('foo\nbar'));
    });

    it('No line break', () => {
      assert.isFalse(MRegExp.lineBreak.test('foobar'));
    });
  });

  describe('semVer', () => {
    it('Valid SemVer', () => {
      assert.isTrue(MRegExp.semVer.test('1.2.3'));
    });

    it('Invalid SemVer', () => {
      assert.isFalse(MRegExp.semVer.test('1.2'));
    });
  });

  describe('email', () => {
    it('Valid email', () => {
      assert.isTrue(MRegExp.email.test('user@example.com'));
    });

    it('Invalid email', () => {
      assert.isFalse(MRegExp.email.test('not-an-email'));
    });
  });
});
