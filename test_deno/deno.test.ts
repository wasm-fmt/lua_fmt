#!/usr/bin/env deno test --allow-read --parallel
import { assertEquals } from "jsr:@std/assert@1.0.16";
import { expandGlob } from "jsr:@std/fs@1.0.21";
import { fromFileUrl, relative } from "jsr:@std/path@1.1.4";

import { format } from "../pkg/lua_fmt_esm.js";

const test_root = fromFileUrl(import.meta.resolve("../test_data"));

for await (const { path: input_path, name } of expandGlob("**/*.lua", { root: test_root })) {
	const case_name = relative(test_root, input_path);

	if (name.startsWith(".")) {
		Deno.test.ignore(case_name, () => {});
		continue;
	}

	const expect_path = input_path + ".snap";

	const [input, expected] = await Promise.all([Deno.readTextFile(input_path), Deno.readTextFile(expect_path)]);

	Deno.test(case_name, () => {
		const actual = format(input);
		assertEquals(actual, expected);
	});
}
