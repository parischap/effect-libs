/* eslint-disable functional/no-expression-statements */
import { CVEmail } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVEmail', () => {
	const notPassing = 'foo';
	const passing = 'foo@bar.baz' as CVEmail.Type;

	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVEmail.moduleTag);
	});

	describe('unsafeFromString', () => {
		it('Not passing', () => {
			TEUtils.doesNotThrow(() => CVEmail.unsafeFromString(notPassing));
		});
		it('Passing', () => {
			TEUtils.strictEqual(CVEmail.unsafeFromString(passing), passing);
		});
	});

	describe('fromStringOption', () => {
		it('Not passing', () => {
			TEUtils.assertNone(CVEmail.fromStringOption(notPassing));
		});
		it('Passing', () => {
			TEUtils.assertSome(CVEmail.fromStringOption(passing), passing);
		});
	});

	describe('fromString', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(CVEmail.fromString(notPassing));
		});
		it('Passing', () => {
			TEUtils.assertRight(CVEmail.fromString(passing), passing);
		});
	});

	describe('fromStringOrThrow', () => {
		it('Not passing', () => {
			TEUtils.throws(() => CVEmail.fromStringOrThrow(notPassing));
		});
		it('Passing', () => {
			TEUtils.strictEqual(CVEmail.fromStringOrThrow(passing), passing);
		});
	});
});
