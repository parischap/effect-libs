import { ASStyle } from '@parischap/ansi-styles';

console.log(
  ASStyle.none(
    ASStyle.green('I am '),
    ASStyle.brightGreen('in different shades '),
    ASStyle.bgBrightGreen('of green', ASStyle.bgDefaultColor('.')),
  ),
);
