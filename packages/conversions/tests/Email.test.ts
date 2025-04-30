/* eslint-disable functional/no-expression-statements */
import { CVEmail } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVEmail', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVEmail.moduleTag);
	});

	it('unsafeFromString', () => {
		TEUtils.strictEqual(CVEmail.unsafeFromString('foo'), 'foo');
	});

	describe('fromString', () => {
		it('Not passing', () => {
			TEUtils.assertTrue(pipe('foo', CVEmail.fromString, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe('foo@bar.baz', CVEmail.fromString, Either.isRight));
		});
	});
});
