/* eslint-disable functional/no-expression-statements */
import { CVSemVer } from '@parischap/conversions';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('CVSemVer', () => {
	const notPassing = 'foo';
	const passing = '1.0.1' as CVSemVer.Type;

	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), CVSemVer.moduleTag);
	});

	describe('unsafeFromString', () => {
		it('Not passing', () => {
			TEUtils.doesNotThrow(() => CVSemVer.unsafeFromString(notPassing));
		});
		it('Passing', () => {
			TEUtils.strictEqual(CVSemVer.unsafeFromString(passing), passing);
		});
	});

	describe('fromStringOption', () => {
		it('Not passing', () => {
			TEUtils.assertNone(CVSemVer.fromStringOption(notPassing));
		});
		it('Passing', () => {
			TEUtils.assertSome(CVSemVer.fromStringOption(passing), passing);
		});
	});

	describe('fromString', () => {
		it('Not passing', () => {
			TEUtils.assertLeft(CVSemVer.fromString(notPassing));
		});
		it('Passing', () => {
			TEUtils.assertRight(CVSemVer.fromString(passing), passing);
		});
	});

	describe('fromStringOrThrow', () => {
		it('Not passing', () => {
			TEUtils.throws(() => CVSemVer.fromStringOrThrow(notPassing));
		});
		it('Passing', () => {
			TEUtils.strictEqual(CVSemVer.fromStringOrThrow(passing), passing);
		});
	});
});
