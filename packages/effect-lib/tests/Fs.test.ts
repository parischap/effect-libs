/* eslint-disable functional/no-expression-statements */
import { MFs, MUtils } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

describe('MFs', () => {
	it('moduleTag', () => {
		expect(MFs.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
	});
});
