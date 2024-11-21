/**
 * Alias to ASWheelFormatter.Type<PPValue.All> (see Value.ts and WheelFormatter.ts in the
 * ansi-styles package)
 *
 * @since 0.3.0
 */

import { ASFormatter, ASFormatterArray, ASWheelFormatter } from '@parischap/ansi-styles';
import { Struct } from 'effect';
import type * as PPValue from './Value.js';

export type Type = ASWheelFormatter.Type<PPValue.All>;

/**
 * StringFormatter instance that does not apply any formatting
 *
 * @since 0.3.0
 * @category Instances
 */
export const none: Type = ASWheelFormatter.none;

/**
 * StringFormatter instance maker that applies a single format
 *
 * @since 0.3.0
 * @category Instance maker
 */
export const fromFormat: (formatter: ASFormatter.Type) => Type = ASWheelFormatter.fromFormatter;

/**
 * Namespace for StringFormatters that only apply a basic Original color as foreground color
 *
 * @since 0.0.1
 * @category Models
 */
export namespace Original {
	/**
	 * Original black color
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const black: Type = fromFormat(ASFormatter.Original.black);

	/**
	 * Original red color
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const red: Type = fromFormat(ASFormatter.Original.red);

	/**
	 * Original green color
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const green: Type = fromFormat(ASFormatter.Original.green);

	/**
	 * Original yellow color
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const yellow: Type = fromFormat(ASFormatter.Original.yellow);

	/**
	 * Original blue color
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const blue: Type = fromFormat(ASFormatter.Original.blue);

	/**
	 * Original magenta color
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const magenta: Type = fromFormat(ASFormatter.Original.magenta);

	/**
	 * Original cyan color
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const cyan: Type = fromFormat(ASFormatter.Original.cyan);

	/**
	 * Original white color
	 *
	 * @since 0.0.1
	 * @category Original instances
	 */
	export const white: Type = fromFormat(ASFormatter.Original.white);
}

/**
 * StringFormatter instance maker that applies a format from a wheel based on the depth of the Value
 * being formatted
 *
 * @since 0.3.0
 * @category Instance maker
 */
export const wheelOnDepth: ({
	name,
	formatters
}: {
	readonly name: string;
	readonly formatters: ASFormatterArray.Type;
}) => Type = ASWheelFormatter.fromFormatterArray(Struct.get('depth'));

/**
 * StringFormatter instance that applies a wheel composed of all basic original colors based on the
 * depth of the Value being formatted
 *
 * @since 0.3.0
 * @category Instances
 */
export const allBasicOrignalColorsWheelOnDepth: Type = wheelOnDepth({
	name: 'AllBasicOrignalColorsWheelOnDepth',
	formatters: ASFormatterArray.allBasicOrignalColors
});

/**
 * StringFormatter instance maker that applies a format from a wheel based on the protoDepth of the
 * Value being formatted
 *
 * @since 0.3.0
 * @category Instance maker
 */
export const wheelOnProtoDepth: ({
	name,
	formatters
}: {
	readonly name: string;
	readonly formatters: ASFormatterArray.Type;
}) => Type = ASWheelFormatter.fromFormatterArray(Struct.get('protoDepth'));

/**
 * StringFormatter instance that applies a wheel composed of all basic original colors based on the
 * protoDepth of the Value being formatted
 *
 * @since 0.3.0
 * @category Instances
 */
export const allBasicOrignalColorsWheelOnProtoDepth: Type = wheelOnDepth({
	name: 'AllBasicOrignalColorsWheelOnDepth',
	formatters: ASFormatterArray.allBasicOrignalColors
});
