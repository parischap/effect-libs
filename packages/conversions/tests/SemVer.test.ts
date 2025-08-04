/* eslint-disable functional/no-expression-statements */
import { CVSemVer } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVSemVer', () => {
	it('unsafeFromString', () => {
		TEUtils.strictEqual(CVSemVer.unsafeFromString('foo'), 'foo');
	});

	describe('fromStringOption', () => {
		it('Not passing', () => {
			TEUtils.assertNone(CVSemVer.fromStringOption('foo'));
		});
		it('Passing', () => {
			TEUtils.assertSome(CVSemVer.fromStringOption('1.0.1'));
		});
	});

	describe('fromString', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(CVSemVer.fromString('foo'));
		});
		it('Passing', () => {
			TEUtils.assertRight(CVSemVer.fromString('1.0.1'));
		});
	});
});
