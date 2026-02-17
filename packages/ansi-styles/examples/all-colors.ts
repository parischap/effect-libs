import * as ASRgbColor from '@parischap/ansi-styles/ASRgbColor'
import * as ASStyle from '@parischap/ansi-styles/ASStyle'

console.log(ASStyle.color(ASRgbColor.coral)('I am a coral string'));
console.log(
  ASStyle.color(ASRgbColor.make({ red: 176, green: 17, blue: 243 }))(
    'I am a string colored with an RGB-user-defined color',
  ),
);
