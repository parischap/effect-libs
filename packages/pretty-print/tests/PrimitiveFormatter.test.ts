import * as TestUtils from '@parischap/configs/TestUtils';
import * as MBigInt from '@parischap/effect-lib/MBigInt'
import * as PPIndex from '@parischap/pretty-print/PPIndex'
import * as PPPrimitiveFormatter from '@parischap/pretty-print/PPPrimitiveFormatter'
import * as PPValue from '@parischap/pretty-print/PPValue'
import { describe, it } from 'vitest';

describe('PrimitiveFormatter', () => {
  const { utilInspectLike } = PPIndex;
  const utilInspectLikeFormatter = PPPrimitiveFormatter.utilInspectLikeMaker();
  const utilInspectLikeFormatterWithOtherDefaults = PPPrimitiveFormatter.utilInspectLikeMaker({
    maxStringLength: 3,
    numberFormatter: new Intl.NumberFormat(),
    id: 'UtilInspectLikeWithOtherDefaults',
  });

  describe('Tag and equality', () => {
    it('moduleTag', () => {
      TestUtils.assertSome(
        TestUtils.moduleTagFromTestFilePath(__filename),
        PPPrimitiveFormatter.moduleTag,
      );
    });

    describe('Equal.equals', () => {
      it('Matching', () => {
        TestUtils.assertEquals(utilInspectLikeFormatter, PPPrimitiveFormatter.utilInspectLikeMaker());
      });

      it('Non-matching', () => {
        TestUtils.assertNotEquals(
          utilInspectLikeFormatter,
          utilInspectLikeFormatterWithOtherDefaults,
        );
      });
    });

    it('.toString()', () => {
      TestUtils.strictEqual(utilInspectLikeFormatter.toString(), `UtilInspectLike`);
    });
  });

  describe('utilInspectLikeMaker', () => {
    const format = PPPrimitiveFormatter.format(utilInspectLikeFormatterWithOtherDefaults)(utilInspectLike);

    it('string under maxStringLength', () => {
      TestUtils.strictEqual(
        format(PPValue.fromTopValue('foo') as PPValue.Primitive),
        "'foo'",
      );
    });

    it('string over maxStringLength', () => {
      TestUtils.strictEqual(
        format(PPValue.fromTopValue('foobar') as PPValue.Primitive),
        "'foo...'",
      );
    });

    it('number', () => {
      TestUtils.strictEqual(
        format(PPValue.fromTopValue(255) as PPValue.Primitive),
        '255',
      );
    });

    it('bigint', () => {
      TestUtils.strictEqual(
        format(PPValue.fromTopValue(MBigInt.fromPrimitiveOrThrow(5)) as PPValue.Primitive),
        '5n',
      );
    });

    it('boolean', () => {
      TestUtils.strictEqual(
        format(PPValue.fromTopValue(true) as PPValue.Primitive),
        'true',
      );
    });

    it('symbol', () => {
      TestUtils.strictEqual(
        format(PPValue.fromTopValue(Symbol.for('foo')) as PPValue.Primitive),
        'Symbol(foo)',
      );
    });

    it('undefined', () => {
      TestUtils.strictEqual(
        format(PPValue.fromTopValue(undefined) as PPValue.Primitive),
        'undefined',
      );
    });

    it('null', () => {
      TestUtils.strictEqual(
        format(PPValue.fromTopValue(null) as PPValue.Primitive),
        'null',
      );
    });
  });
});
