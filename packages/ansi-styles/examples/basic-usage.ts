import { ASStyle } from "@parischap/ansi-styles";

console.log(
  ASStyle.red(
    "ansi-styles is an ",
    ASStyle.bold(
      "Effect library ",
      ASStyle.magenta(
        ASStyle.dim("for terminal output styling with "),
        ASStyle.yellow("ANSI "),
        "colors ",
      ),
    ),
    "and formats.",
  ),
);
