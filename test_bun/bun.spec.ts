#!/usr/bin/env bun test
import { Glob } from "bun";
import { expect, test } from "bun:test";

import init, { format, formatRanges } from "../pkg/lua_fmt_web.js";

await init();

const test_root = Bun.fileURLToPath(import.meta.resolve("../test_data"));

for await (const case_name of new Glob("**/*.lua").scan({ cwd: test_root })) {
	const input_path = `${test_root}/${case_name}`;
	const [input, expected] = await Promise.all([Bun.file(input_path).text(), Bun.file(input_path + ".snap").text()]);

	test(case_name, () => {
		const actual = format(input);
		expect(actual).toBe(expected);
	});
}

test("formats one UTF-8 byte range", () => {
	const source = 'local value="名称"\nlocal y=2\n';
	const encoder = new TextEncoder();
	const start = encoder.encode('local value="名称"\n').length;
	const end = encoder.encode(source).length;

	expect(formatRanges(source, [{ start, end }])).toBe('local value="名称"\nlocal y = 2\n');
});
