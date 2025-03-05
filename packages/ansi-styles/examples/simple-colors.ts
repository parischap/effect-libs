/* eslint-disable functional/no-expression-statements */
import { ASStyle } from '@parischap/ansi-styles';

console.log(
	ASStyle.none(
		ASStyle.green('I am '),
		ASStyle.Bright.green('in different shades '),
		ASStyle.Bg.Bright.green('of green', ASStyle.Bg.defaultColor('.'))
	)
);
