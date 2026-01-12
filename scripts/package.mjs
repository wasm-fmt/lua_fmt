#!/usr/bin/env node
import process from "node:process";
import path from "node:path";
import fs from "node:fs";

const pkg_path = path.resolve(process.cwd(), process.argv[2]);
const pkg_text = fs.readFileSync(pkg_path, { encoding: "utf-8" });
const pkg_json = JSON.parse(pkg_text);

delete pkg_json.files;

pkg_json.main = pkg_json.module;
pkg_json.type = "module";
pkg_json.publishConfig = {
	access: "public",
};
pkg_json.exports = {
	".": {
		types: "./lua_fmt.d.ts",
		webpack: "./lua_fmt.js",
		deno: "./lua_fmt.js",
		// CJS supports
		"module-sync": "./lua_fmt_node.js",
		default: "./lua_fmt_esm.js",
	},
	"./esm": {
		types: "./lua_fmt.d.ts",
		default: "./lua_fmt_esm.js",
	},
	"./node": {
		types: "./lua_fmt.d.ts",
		default: "./lua_fmt_node.js",
	},
	"./bundler": {
		types: "./lua_fmt.d.ts",
		default: "./lua_fmt.js",
	},
	"./web": {
		types: "./lua_fmt_web.d.ts",
		default: "./lua_fmt_web.js",
	},
	"./vite": {
		types: "./lua_fmt_web.d.ts",
		default: "./lua_fmt_vite.js",
	},
	"./wasm": "./lua_fmt_bg.wasm",
	"./package.json": "./package.json",
	"./*": "./*",
};
pkg_json.sideEffects = ["./lua_fmt.js", "./lua_fmt_node.js", "./lua_fmt_esm.js"];

fs.writeFileSync(pkg_path, JSON.stringify(pkg_json, null, "\t"));

// JSR
const jsr_path = path.resolve(pkg_path, "..", "jsr.jsonc");
pkg_json.name = "@fmt/lua-fmt";
pkg_json.exports = {
	".": "./lua_fmt.js",
	"./esm": "./lua_fmt_esm.js",
	"./node": "./lua_fmt_node.js",
	"./bundler": "./lua_fmt.js",
	"./web": "./lua_fmt_web.js",
	// jsr does not support imports from wasm?init
	// "./vite": "./lua_fmt_vite.js",
};
pkg_json.exclude = ["!**", "*.tgz"];
fs.writeFileSync(jsr_path, JSON.stringify(pkg_json, null, "\t"));

const lua_fmt_path = path.resolve(path.dirname(pkg_path), "lua_fmt.js");
prependTextToFile('/* @ts-self-types="./lua_fmt.d.ts" */\n', lua_fmt_path);

const lua_fmt_d_ts_path = path.resolve(path.dirname(pkg_path), "lua_fmt.d.ts");
const doc_path = path.resolve(import.meta.dirname, "doc.d.ts");
const doc_text = fs.readFileSync(doc_path, { encoding: "utf-8" });
prependTextToFile(doc_text + "\n", lua_fmt_d_ts_path);

function prependTextToFile(text, filePath) {
	const originalContent = fs.readFileSync(filePath, { encoding: "utf-8" });
	const newContent = text + originalContent;
	fs.writeFileSync(filePath, newContent);
}
