export enum Color8 {
	Black = 30,
	Red = 31,
	Green = 32,
	Yellow = 33,
	Blue = 34,
	Magenta = 35,
	Cyan = 36,
	White = 37
}

export const normalBasic8Colors =
	(c: Color8) =>
	(s: string): string =>
		`\x1b[${c}m${s}\x1b[0m`;
export const normalHighContrast8Colors =
	(c: Color8) =>
	(s: string): string =>
		`\x1b[${c + 60}m${s}\x1b[0m`;

export const boldBasic8Colors =
	(c: Color8) =>
	(s: string): string =>
		`\x1b[${c};1m${s}\x1b[0m`;
export const boldHighContrast8Colors =
	(c: Color8) =>
	(s: string): string =>
		`\x1b[${c + 60};1m${s}\x1b[0m`;

export const underscoreBasic8Colors =
	(c: Color8) =>
	(s: string): string =>
		`\x1b[${c};4m${s}\x1b[0m`;
export const underscoreHighContrast8Colors =
	(c: Color8) =>
	(s: string): string =>
		`\x1b[${c + 60};4m${s}\x1b[0m`;

export const backgroundBasic8Colors =
	(c: Color8) =>
	(s: string): string =>
		`\x1b[${c};3m${s}\x1b[0m`;
export const backgroundHighContrast8Colors =
	(c: Color8) =>
	(s: string): string =>
		`\x1b[${c + 60};3m${s}\x1b[0m`;

export const black = normalBasic8Colors(Color8.Black);
export const red = normalBasic8Colors(Color8.Red);
export const green = normalBasic8Colors(Color8.Green);
export const yellow = normalBasic8Colors(Color8.Yellow);
export const blue = normalBasic8Colors(Color8.Blue);
export const magenta = normalBasic8Colors(Color8.Magenta);
export const cyan = normalBasic8Colors(Color8.Cyan);
export const white = normalBasic8Colors(Color8.White);

export const highContrastBlack = normalHighContrast8Colors(Color8.Black);
export const highContrastRed = normalHighContrast8Colors(Color8.Red);
export const highContrastGreen = normalHighContrast8Colors(Color8.Green);
export const highContrastYellow = normalHighContrast8Colors(Color8.Yellow);
export const highContrastBlue = normalHighContrast8Colors(Color8.Blue);
export const highContrastMagenta = normalHighContrast8Colors(Color8.Magenta);
export const highContrastCyan = normalHighContrast8Colors(Color8.Cyan);
export const highContrastWhite = normalHighContrast8Colors(Color8.White);

export const boldBlack = boldBasic8Colors(Color8.Black);
export const boldRed = boldBasic8Colors(Color8.Red);
export const boldGreen = boldBasic8Colors(Color8.Green);
export const boldYellow = boldBasic8Colors(Color8.Yellow);
export const boldBlue = boldBasic8Colors(Color8.Blue);
export const boldMagenta = boldBasic8Colors(Color8.Magenta);
export const boldCyan = boldBasic8Colors(Color8.Cyan);
export const boldWhite = boldBasic8Colors(Color8.White);

export const boldHighContrastBlack = boldHighContrast8Colors(Color8.Black);
export const boldHighContrastRed = boldHighContrast8Colors(Color8.Red);
export const boldHighContrastGreen = boldHighContrast8Colors(Color8.Green);
export const boldHighContrastYellow = boldHighContrast8Colors(Color8.Yellow);
export const boldHighContrastBlue = boldHighContrast8Colors(Color8.Blue);
export const boldHighContrastMagenta = boldHighContrast8Colors(Color8.Magenta);
export const boldHighContrastCyan = boldHighContrast8Colors(Color8.Cyan);
export const boldHighContrastWhite = boldHighContrast8Colors(Color8.White);

export const underscoreBlack = underscoreBasic8Colors(Color8.Black);
export const underscoreRed = underscoreBasic8Colors(Color8.Red);
export const underscoreGreen = underscoreBasic8Colors(Color8.Green);
export const underscoreYellow = underscoreBasic8Colors(Color8.Yellow);
export const underscoreBlue = underscoreBasic8Colors(Color8.Blue);
export const underscoreMagenta = underscoreBasic8Colors(Color8.Magenta);
export const underscoreCyan = underscoreBasic8Colors(Color8.Cyan);
export const underscoreWhite = underscoreBasic8Colors(Color8.White);

export const underscoreHighContrastBlack = underscoreHighContrast8Colors(Color8.Black);
export const underscoreHighContrastRed = underscoreHighContrast8Colors(Color8.Red);
export const underscoreHighContrastGreen = underscoreHighContrast8Colors(Color8.Green);
export const underscoreHighContrastYellow = underscoreHighContrast8Colors(Color8.Yellow);
export const underscoreHighContrastBlue = underscoreHighContrast8Colors(Color8.Blue);
export const underscoreHighContrastMagenta = underscoreHighContrast8Colors(Color8.Magenta);
export const underscoreHighContrastCyan = underscoreHighContrast8Colors(Color8.Cyan);
export const underscoreHighContrastWhite = underscoreHighContrast8Colors(Color8.White);

export const backgroundBlack = backgroundBasic8Colors(Color8.Black);
export const backgroundRed = backgroundBasic8Colors(Color8.Red);
export const backgroundGreen = backgroundBasic8Colors(Color8.Green);
export const backgroundYellow = backgroundBasic8Colors(Color8.Yellow);
export const backgroundBlue = backgroundBasic8Colors(Color8.Blue);
export const backgroundMagenta = backgroundBasic8Colors(Color8.Magenta);
export const backgroundCyan = backgroundBasic8Colors(Color8.Cyan);
export const backgroundWhite = backgroundBasic8Colors(Color8.White);

export const backgroundHighContrastBlack = backgroundHighContrast8Colors(Color8.Black);
export const backgroundHighContrastRed = backgroundHighContrast8Colors(Color8.Red);
export const backgroundHighContrastGreen = backgroundHighContrast8Colors(Color8.Green);
export const backgroundHighContrastYellow = backgroundHighContrast8Colors(Color8.Yellow);
export const backgroundHighContrastBlue = backgroundHighContrast8Colors(Color8.Blue);
export const backgroundHighContrastMagenta = backgroundHighContrast8Colors(Color8.Magenta);
export const backgroundHighContrastCyan = backgroundHighContrast8Colors(Color8.Cyan);
export const backgroundHighContrastWhite = backgroundHighContrast8Colors(Color8.White);

export const normalBasic256Colors =
	(c: number) =>
	(s: string): string =>
		`\x1b[38;5;${c}m${s}\x1b[0m`;

export const boldBasic256Colors =
	(c: number) =>
	(s: string): string =>
		`\x1b[38;5;${c};1m${s}\x1b[0m`;

export const underscoreBasic256Colors =
	(c: number) =>
	(s: string): string =>
		`\x1b[38;5;${c};4m${s}\x1b[0m`;

export const backgroundBasic256Colors =
	(c: number) =>
	(s: string): string =>
		`\x1b[38;5;${c};3m${s}\x1b[0m`;

export const blink = `\x1b[5m`;
