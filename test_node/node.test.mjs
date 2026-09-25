#!/usr/bin/env node --test
import assert from "node:assert/strict";
import { glob, readFile } from "node:fs/promises";
import { basename } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { createConfig, format, formatRanges, releaseConfig } from "../pkg/lua_fmt_node.js";

const test_root = fileURLToPath(import.meta.resolve("../test_data"));

for await (const case_name of glob("**/*.lua", { cwd: test_root })) {
	if (basename(case_name).startsWith(".")) {
		test(case_name, { skip: true }, () => {});
		continue;
	}

	const input_path = `${test_root}/${case_name}`;
	const expect_path = input_path + ".snap";

	const [input, expected] = await Promise.all([readFile(input_path, "utf-8"), readFile(expect_path, "utf-8")]);

	test(case_name, () => {
		const actual = format(input);
		assert.equal(actual, expected);
	});
}

test("inline config", () => {
	assert.equal(format("local value = 'text'", { quote_style: "ForceDouble" }), 'local value = "text"\n');
});

test("registered config handle", () => {
	const config = createConfig({ quote_style: "ForceDouble" });
	try {
		assert.equal(format("local value = 'text'", config), 'local value = "text"\n');
	} finally {
		releaseConfig(config);
	}
});

test("null preserves the legacy optional config semantics", () => {
	assert.equal(format("local x=1", null), format("local x=1"));
});

test("invalid JSON config is rejected during registration", () => {
	assert.throws(() => createConfig("{"), /EOF while parsing an object/);
});

test("empty range request is unchanged", () => {
	const source = "local x=1";
	assert.equal(formatRanges(source, []), source);
});

test("formats one UTF-8 byte range", () => {
	const source = 'local value="名称"\nlocal y=2\n';
	const start = Buffer.byteLength('local value="名称"\n');
	const end = Buffer.byteLength(source);

	assert.equal(formatRanges(source, [{ start, end }]), 'local value="名称"\nlocal y = 2\n');
});

test("rejects multiple ranges unsupported by StyLua", () => {
	const source = "local x=1\nlocal y=2\n";
	assert.throws(
		() =>
			formatRanges(source, [
				{ start: 0, end: 9 },
				{ start: 10, end: 19 },
			]),
		/StyLua supports exactly one formatting range per request/,
	);
});
