/* eslint-disable functional/no-expression-statements */
import { MPortError } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('MPortError', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), MPortError.moduleTag);
	});
});
