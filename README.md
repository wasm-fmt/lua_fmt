[![npm](https://img.shields.io/npm/v/@wasm-fmt/lua_fmt)](https://www.npmjs.com/package/@wasm-fmt/lua_fmt)

# Install

```bash
npm install @wasm-fmt/lua_fmt
```

# Usage

```javascript
import init, { format } from "@wasm-fmt/lua_fmt";

await init();

const input = `print "Hello World"`;

const formatted = format(input);
console.log(formatted);
```

For Vite users:

```JavaScript
import init, { format } from "@wasm-fmt/lua_fmt/vite";

// ...
```
