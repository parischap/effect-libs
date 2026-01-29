import * as TestUtils from '@parischap/configs/TestUtils';
import { CVSemVer } from '@parischap/conversions';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('CVSemVer', () => {
  const notPassing = 'foo';
  const passing = '1.0.1' as CVSemVer.Type;

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVSemVer.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('unsafeFromString', () => {
    it('Not passing', () => {
      TestUtils.doesNotThrow(() => CVSemVer.unsafeFromString(notPassing));
    });
    it('Passing', () => {
      TestUtils.strictEqual(CVSemVer.unsafeFromString(passing), passing);
    });
  });

  describe('fromStringOption', () => {
    it('Not passing', () => {
      TestUtils.assertNone(CVSemVer.fromStringOption(notPassing));
    });
    it('Passing', () => {
      TestUtils.assertSome(CVSemVer.fromStringOption(passing), passing);
    });
  });

  describe('fromString', () => {
    it('Not passing', () => {
      TestUtils.assertLeft(CVSemVer.fromString(notPassing));
    });
    it('Passing', () => {
      TestUtils.assertRight(CVSemVer.fromString(passing), passing);
    });
  });

  describe('fromStringOrThrow', () => {
    it('Not passing', () => {
      TestUtils.throws(() => CVSemVer.fromStringOrThrow(notPassing));
    });
    it('Passing', () => {
      TestUtils.strictEqual(CVSemVer.fromStringOrThrow(passing), passing);
    });
  });
});
