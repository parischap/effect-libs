/* eslint-disable functional/no-expression-statements */
import { CVSemVer } from '@parischap/formatting';
import { TEUtils } from '@parischap/test-utils';
import { Either, pipe } from 'effect';
import { describe, it } from 'vitest';

describe('CVSemVer', () => {
	it('unsafeFromString', () => {
		TEUtils.strictEqual(CVSemVer.unsafeFromString('foo'), 'foo');
	});

	describe('fromString', () => {
		it('Not passing', () => {
			TEUtils.assertTrue(pipe('foo', CVSemVer.fromString, Either.isLeft));
		});
		it('Passing', () => {
			TEUtils.assertTrue(pipe('1.0.1', CVSemVer.fromString, Either.isRight));
		});
	});
});
