/* eslint-disable functional/no-expression-statements */
import { ASPalette, ASStyle } from '@parischap/ansi-styles';
import { PPValue, PPValueBasedStyler } from '@parischap/pretty-print';
import { TEUtils } from '@parischap/test-utils';
import { describe, it } from 'vitest';

describe('ValueBasedStyler', () => {
	const palette = ASPalette.make(ASStyle.black, ASStyle.red, ASStyle.green, ASStyle.blue);

	const symbolicKey: unique symbol = Symbol.for('symbolicKey');
	const context = PPValue.fromNonPrimitiveValueAndKey({
		nonPrimitiveContent: { [symbolicKey]: 3, b: 'foo' },
		key: symbolicKey,
		depth: 2,
		protoDepth: 0
	});

	it('makeDepthIndexed', () => {
		TEUtils.assertEquals(
			PPValueBasedStyler.makeDepthIndexed(palette)(context)('foo'),
			ASStyle.green('foo')
		);
	});

	it('makeTypeIndexed', () => {
		TEUtils.assertEquals(
			PPValueBasedStyler.makeTypeIndexed(palette)(context)('foo'),
			ASStyle.red('foo')
		);
	});

	it('makeKeyTypeIndexed', () => {
		TEUtils.assertEquals(
			PPValueBasedStyler.makeKeyTypeIndexed(palette)(context)('foo'),
			ASStyle.red('foo')
		);
	});
});
