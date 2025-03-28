/* eslint-disable functional/no-expression-statements */
import { ASPalette, ASStyle, ASText } from '@parischap/ansi-styles';
import { PPValue, PPValueBasedStyler } from '@parischap/pretty-print';
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
		TEUtils.assertTrue(
			ASText.equivalence(
				PPValueBasedStyler.makeDepthIndexed(palette)(context)('foo'),
				ASStyle.green('foo')
			)
		);
	});

	it('makeTypeIndexed', () => {
		TEUtils.assertTrue(
			ASText.equivalence(
				PPValueBasedStyler.makeTypeIndexed(palette)(context)('foo'),
				ASStyle.red('foo')
			)
		);
	});

	it('makeKeyTypeIndexed', () => {
		TEUtils.assertTrue(
			ASText.equivalence(
				PPValueBasedStyler.makeKeyTypeIndexed(palette)(context)('foo'),
				ASStyle.red('foo')
			)
		);
	});
});
