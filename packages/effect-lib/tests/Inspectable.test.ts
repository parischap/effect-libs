/* eslint-disable functional/no-expression-statements */
import { MInspectable, MUtils } from '@parischap/effect-lib';
import { describe, expect, it } from 'vitest';

describe('MInspectable', () => {
	it('moduleTag', () => {
		expect(MInspectable.moduleTag).toBe(MUtils.moduleTagFromFileName(__filename));
	});
});
