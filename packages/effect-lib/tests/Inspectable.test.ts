/* eslint-disable functional/no-expression-statements */
import { MInspectable } from '@parischap/effect-lib';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('MInspectable', () => {
	it('moduleTag', () => {
		TEUtils.assertSome(TEUtils.moduleTagFromTestFilePath(__filename), MInspectable.moduleTag);
	});
});
