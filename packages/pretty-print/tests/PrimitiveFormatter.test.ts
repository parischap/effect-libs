import * as TestUtils from '@parischap/configs/TestUtils';
import { MBigInt } from '@parischap/effect-lib';
import { PPOption, PPPrimitiveFormatter, PPValue } from '@parischap/pretty-print';
import { pipe } from 'effect';
import { describe, it } from 'vitest';

describe('PrimitiveFormatter', () => {
  const {utilInspectLike} = PPOption;
  const utilInspectLikeFormatter = PPPrimitiveFormatter.utilInspectLikeMaker();
  const utilInspectLikeFormatterWithOtherDefaults = PPPrimitiveFormatter.utilInspectLikeMaker({
    maxStringLength: 3,
    numberFormatter: new Intl.NumberFormat(),
    id: 'UtilInspectLikeWithOtherDefaults',
  });
  describe('Tag, prototype and guards', () => {
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

    it('.pipe()', () => {
      TestUtils.strictEqual(
        utilInspectLikeFormatter.pipe(PPPrimitiveFormatter.id),
        'UtilInspectLike',
      );
    });

    describe('has', () => {
      it('Matching', () => {
        TestUtils.assertTrue(PPPrimitiveFormatter.has(utilInspectLikeFormatter));
      });
      it('Non matching', () => {
        TestUtils.assertFalse(PPPrimitiveFormatter.has(new Date()));
      });
    });
  });

  describe('utilInspectLikeMaker', () => {
    it('string under maxStringlength', () => {
      TestUtils.strictEqual(
        pipe(
          utilInspectLikeFormatterWithOtherDefaults.call(
            utilInspectLike,
            PPValue.fromTopValue('foo'),
          ),
        ),
        "'foo'",
      );
    });

    it('string under maxStringlength', () => {
      TestUtils.strictEqual(
        pipe(
          utilInspectLikeFormatterWithOtherDefaults.call(
            utilInspectLike,
            PPValue.fromTopValue('foobar'),
          ),
        ),
        "'foo...'",
      );
    });

    it('number', () => {
      TestUtils.strictEqual(
        pipe(
          utilInspectLikeFormatterWithOtherDefaults.call(
            utilInspectLike,
            PPValue.fromTopValue(255),
          ),
        ),
        '255',
      );
    });

    it('bigint', () => {
      TestUtils.strictEqual(
        pipe(
          utilInspectLikeFormatterWithOtherDefaults.call(
            utilInspectLike,
            PPValue.fromTopValue(MBigInt.fromPrimitiveOrThrow(5)),
          ),
        ),
        '5n',
      );
    });

    it('boolean', () => {
      TestUtils.strictEqual(
        pipe(
          utilInspectLikeFormatterWithOtherDefaults.call(
            utilInspectLike,
            PPValue.fromTopValue(true),
          ),
        ),
        'true',
      );
    });

    it('symbol', () => {
      TestUtils.strictEqual(
        pipe(
          utilInspectLikeFormatterWithOtherDefaults.call(
            utilInspectLike,
            PPValue.fromTopValue(Symbol.for('foo')),
          ),
        ),
        'Symbol(foo)',
      );
    });

    it('undefined', () => {
      TestUtils.strictEqual(
        pipe(
          utilInspectLikeFormatterWithOtherDefaults.call(
            utilInspectLike,
            PPValue.fromTopValue(undefined),
          ),
        ),
        'undefined',
      );
    });

    it('null', () => {
      TestUtils.strictEqual(
        pipe(
          utilInspectLikeFormatterWithOtherDefaults.call(
            utilInspectLike,
            PPValue.fromTopValue(null),
          ),
        ),
        'null',
      );
    });
  });
});
