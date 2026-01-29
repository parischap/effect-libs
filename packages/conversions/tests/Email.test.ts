import * as TestUtils from '@parischap/configs/TestUtils';
import { CVEmail } from '@parischap/conversions';
import { Option } from 'effect';
import { describe, it } from 'vitest';

describe('CVEmail', () => {
  const notPassing = 'foo';
  const passing = 'foo@bar.baz' as CVEmail.Type;

  it('moduleTag', () => {
    TestUtils.assertEquals(
      Option.some(CVEmail.moduleTag),
      TestUtils.moduleTagFromTestFilePath(import.meta.filename),
    );
  });

  describe('unsafeFromString', () => {
    it('Not passing', () => {
      TestUtils.doesNotThrow(() => CVEmail.unsafeFromString(notPassing));
    });
    it('Passing', () => {
      TestUtils.strictEqual(CVEmail.unsafeFromString(passing), passing);
    });
  });

  describe('fromStringOption', () => {
    it('Not passing', () => {
      TestUtils.assertNone(CVEmail.fromStringOption(notPassing));
    });
    it('Passing', () => {
      TestUtils.assertSome(CVEmail.fromStringOption(passing), passing);
    });
  });

  describe('fromString', () => {
    it('Not passing', () => {
      TestUtils.assertLeft(CVEmail.fromString(notPassing));
    });
    it('Passing', () => {
      TestUtils.assertRight(CVEmail.fromString(passing), passing);
    });
  });

  describe('fromStringOrThrow', () => {
    it('Not passing', () => {
      TestUtils.throws(() => CVEmail.fromStringOrThrow(notPassing));
    });
    it('Passing', () => {
      TestUtils.strictEqual(CVEmail.fromStringOrThrow(passing), passing);
    });
  });
});
