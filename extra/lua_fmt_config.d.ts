/** Layout configuration for code formatting, including indentation, line width, and line endings */
export interface LayoutConfig {
	/** The type of indents to use when indenting */
	indent_style?: "tab" | "space";
	/** The width of a single indentation level. If `indent_style` is set to `"space"`, then this is the number of spaces to use. If `indent_style` is set to `"tab"`, then this is used as a heuristic to guide when to wrap lines. */
	indent_width?: number;
	/** The approximate line length to use when printing the code. This is used as a guide to determine when to wrap lines, but note that this is not a hard upper bound. */
	line_width?: number;
	/** The type of line endings to use at the end of a line */
	line_ending?: "lf" | "crlf";
}

/** The configuration to use when formatting. Extends LayoutConfig with additional formatting options */
export interface Config extends LayoutConfig {
	/** The style of quotes to use within string literals. "AutoPreferDouble" uses double quotes where possible, but changes to single quotes if it produces less escapes. "AutoPreferSingle" uses single quotes where possible, but changes to double quotes if it produces less escapes. "ForceDouble" always uses double quotes in all strings. "ForceSingle" always uses single quotes in all strings. */
	quote_style?: "AutoPreferDouble" | "AutoPreferSingle" | "ForceDouble" | "ForceSingle";
	/** When to use call parentheses. "Always" uses call parentheses all the time. "NoSingleString" skips call parentheses when only a string argument is used. "NoSingleTable" skips call parentheses when only a table argument is used. "None" skips call parentheses when only a table or string argument is used. "Input" keeps call parentheses based on its presence in input code. */
	call_parentheses?: "Always" | "NoSingleString" | "NoSingleTable" | "None" | "Input";
	/** What mode to use if we want to collapse simple functions / guard statements. "Never" never collapses. "FunctionOnly" collapses simple functions onto a single line. "ConditionalOnly" collapses simple if guards onto a single line. "Always" collapses all simple statements onto a single line. */
	collapse_simple_statement?: "Never" | "FunctionOnly" | "ConditionalOnly" | "Always";
	/** Whether the sort requires codemod is enabled */
	sort_requires?: boolean;

	/** See {@link https://github.com/JohnnyMorganz/StyLua?tab=readme-ov-file#options} */
	[key: string]: unknown;
}
