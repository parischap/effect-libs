import { ASColor, ASStyle } from "@parischap/ansi-styles";

console.log(ASStyle.color(ASColor.rgbCoral)("I am a coral string"));
console.log(
  ASStyle.color(ASColor.Rgb.make({ red: 176, green: 17, blue: 243 }))(
    "I am a string colored with an RGB-user-defined color",
  ),
);
