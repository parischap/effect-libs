import { ASColorRgb, ASStyle } from '@parischap/ansi-styles';

console.log(ASStyle.color(ASColorRgb.coral)('I am a coral string'));
console.log(
  ASStyle.color(ASColorRgb.make({ red: 176, green: 17, blue: 243 }))(
    'I am a string colored with an RGB-user-defined color',
  ),
);
