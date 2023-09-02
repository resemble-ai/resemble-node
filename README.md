# resemble.ai API

[resemble.ai](https://resemble.ai) is a state-of-the-art natural voice cloning and synthesis provider. Best of all, the platform is accessible by using our public API! Sign up [here](https://app.resemble.ai) to get an API token!

This repository hosts a NodeJS library for convenient usage of the [Resemble API](https://docs.resemble.ai).

## Quick Start

```sh
npm install @resemble/node
# or
yarn add @resemble/node
```

See documentation at [docs.resemble.ai](docs.resemble.ai).

## Features

- Typescript definitions
- Works with NodeJS, Deno, and the browser!
- Supports the V2 API

## Test!

```
npm run test
```

## Publishing

1. `git status`: Make sure your working directory has no pending changes.
2. Update the version key in `package.json`
3. `git commit`: Commit this version change.
4. Publish to npmjs.org:

```sh
npm run build
npm publish
```
