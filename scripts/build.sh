cd $(dirname $0)/..
root_dir=$(pwd)

wasm-pack build --target=web --scope=wasm-fmt

cd $root_dir

cp -R ./extra/. ./pkg/

./scripts/package.mjs ./pkg/package.json
