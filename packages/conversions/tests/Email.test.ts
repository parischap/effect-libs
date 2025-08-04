/* eslint-disable functional/no-expression-statements */
import { CVEmail } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVEmail', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVEmail.moduleTag);
	});

	it('unsafeFromString', () => {
		TEUtils.strictEqual(CVEmail.unsafeFromString('foo'), 'foo');
	});

	describe('fromStringOption', () => {
		it('Not passing', () => {
			TEUtils.assertNone(CVEmail.fromStringOption('foo'));
		});
		it('Passing', () => {
			TEUtils.assertSome(CVEmail.fromStringOption('foo@bar.baz'));
		});
	});

	describe('fromString', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(CVEmail.fromString('foo'));
		});
		it('Passing', () => {
			TEUtils.assertRight(CVEmail.fromString('foo@bar.baz'));
		});
	});
});
