[![Test](https://github.com/wasm-fmt/lua_fmt/actions/workflows/test.yml/badge.svg)](https://github.com/wasm-fmt/lua_fmt/actions/workflows/test.yml)

# Install

[![npm](https://img.shields.io/npm/v/@wasm-fmt/lua_fmt)](https://www.npmjs.com/package/@wasm-fmt/lua_fmt)

```bash
npm install @wasm-fmt/lua_fmt
```

[![jsr.io](https://jsr.io/badges/@fmt/lua-fmt)](https://jsr.io/@fmt/lua-fmt)

```bash
npx jsr add @fmt/lua-fmt
```

# Usage

```javascript
import init, { format } from "@wasm-fmt/lua_fmt";

await init();

const input = `print "Hello World"`;

const formatted = format(input, "main.lua");
console.log(formatted);
```

For Vite users:

```JavaScript
import init, { format } from "@wasm-fmt/lua_fmt/vite";

// ...
```

# Credits

Thanks to:

-   The [StyLua](https://github.com/JohnnyMorganz/StyLua) project created by [@JohnnyMorganz](https://github.com/JohnnyMorganz)
