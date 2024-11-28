/* eslint-disable functional/no-expression-statements */
import { MPortError, MUtils } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

describe('MPortError', () => {
	it('moduleTag', () => {
		expect(MPortError.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
	});
});
