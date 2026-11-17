# typescript-node-app

A minimal, production-ready **Node.js + TypeScript** environment: native ESM, strict
TypeScript, working path aliases, extensionless imports, Biome formatting/linting,
automatic restarts during development, and a zero-dependency test suite built on the
Node.js test runner. No frameworks, no runtime dependencies.

## Prerequisites

- **Node.js >= 24** (validated on Node 26) — <https://nodejs.org>
- **pnpm >= 12** as the single package manager (pinned in `packageManager`; enable
  with `corepack enable` if needed)

## Installation

```sh
pnpm install
```

The project has **zero runtime dependencies**. Dev dependencies (all build/dev-time
only): `typescript`, `tsx`, `tsc-alias`, `@biomejs/biome`, `@types/node`.

## Development workflow

```sh
pnpm dev
```

Runs `src/index.ts` directly through **tsx**, which transpiles TypeScript on the fly
(esbuild), resolves the `@/*` path alias, and accepts extensionless imports. File
changes trigger an automatic restart; errors print to the terminal with source maps.
TypeScript is stripped, not bundled — no browser-style HMR is involved.

```sh
pnpm dev:debug   # same, plus --inspect on ws://127.0.0.1:9229
```

## Production build and execution

```sh
pnpm build   # clean dist/ -> tsc emit -> tsc-alias specifier rewrite
pnpm start   # node dist/index.js
```

`build` emits plain ESM JavaScript + source maps into `dist/` and always starts from
an empty `dist/` (deleted cross-platform via `scripts/clean.mjs`), so stale
artifacts from removed files never survive a build.

The output runs on Node.js directly. Verified: copying only `dist/` and
`package.json` to a fresh directory (no `node_modules`, no dev tooling) runs
correctly — nothing at runtime depends on development tooling.

## Testing

Tests run on the **built-in Node.js test runner** (`node:test`) with
`node:assert/strict` — no Jest, Vitest, or Mocha, no testing dependencies. tsx
supplies TypeScript + ESM + `@/*` alias support; the runner, assertions, mocking,
coverage, and watch mode are all native Node.js capabilities.

```sh
pnpm test            # all tests
pnpm test:unit       # tests/unit only
pnpm test:integration# tests/integration only
pnpm test:watch      # native watch mode (reruns on file changes)
pnpm test:coverage   # native coverage report + thresholds
pnpm test:check      # type-check tests and test config with tsc
```

Structure — `tests/unit` for fast isolated tests, `tests/integration` for tests
that exercise several modules together:

```text
tests/
├── unit/            # greeting, runtime, arithmetic
└── integration/     # app: async flow, console output, mocking
```

Conventions and capabilities:

- **Isolation**: each test file runs in its own child process (`--test-isolation`
  defaults to `process`); setup/teardown via `beforeEach`/`afterEach`; the
  integration test restores its `console.log` mock in `afterEach`, so tests stay
  independent and repeatable.
- **Mocking**: native `mock.method(...)` from `node:test` — no stub libraries.
- **Filtering**: `pnpm exec tsx --test --test-name-pattern "<regex>" tests` runs
  matching tests; passing a specific file runs just that file
  (`pnpm exec tsx --test tests/unit/greeting.test.ts`).
- **Coverage**: `--experimental-test-coverage` with test files excluded and
  thresholds enforced (`lines 95%`, `functions 95%`, `branches 85%`). Current
  state: 100% lines/functions, ~95% branches (the only uncovered branch is the
  defensive `?? "unknown"` fallback in `src/config/runtime.ts`).
- **Path aliases**: tests import `@/...` like the rest of the code; tsx resolves
  them and `tsconfig.json` includes `tests/` for type checking.
- Tests never require `dist/` — they import `src/` directly. Only
  production-output smoke tests would, and there are none.

## Available scripts

| Script                  | What it does                                                  |
| ----------------------- | ------------------------------------------------------------- |
| `pnpm dev`              | Dev execution with watch + automatic restart (tsx)            |
| `pnpm dev:debug`        | Dev execution with the Node.js inspector attached             |
| `pnpm build`            | Clean `dist/`, type-check + emit ESM JS, rewrite aliases      |
| `pnpm start`            | Run the production build (`node dist/index.js`)               |
| `pnpm clean`            | Remove `dist/`                                                |
| `pnpm format`           | Auto-format files (Biome formatter)                           |
| `pnpm format:check`     | Check formatting without modifying files                      |
| `pnpm lint`             | Auto-fix lint issues where possible (Biome linter)            |
| `pnpm lint:check`       | Check lint issues without modifying files                     |
| `pnpm type:check`       | Type-check with `tsc`, no emit                                |
| `pnpm test`             | Run all tests (node:test via tsx)                             |
| `pnpm test:watch`       | Run tests in native watch mode                                |
| `pnpm test:unit`        | Run `tests/unit`                                              |
| `pnpm test:integration` | Run `tests/integration`                                       |
| `pnpm test:coverage`    | Run tests with coverage summary + thresholds                  |
| `pnpm test:check`       | Type-check tests and test configuration                       |
| `pnpm biome`            | `biome check --write` — all checks + safe fixes applied       |
| `pnpm biome:check`      | `biome check` — all checks, read-only                         |
| `pnpm check`            | All non-mutating quality gates (`biome:check` + `type:check`) |

All scripts are cross-platform; `clean` uses a tiny Node script instead of `rm -rf`.

## Path alias conventions

One alias is configured in `tsconfig.json`:

```jsonc
"paths": { "@/*": ["./src/*"] }
```

- `@/modules/greeting` → `src/modules/greeting.ts`
- Use `@/...` for **all internal imports**; relative imports are reserved for
  rare, local, same-folder cases.

Why it is reliable in every context:

| Context            | Mechanism                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Dev execution      | tsx reads `tsconfig.json` `paths` and resolves aliases at runtime                             |
| Type checking      | tsc resolves `paths` natively (TS 7: paths are relative to the tsconfig, no `baseUrl` needed) |
| Production emit    | `tsc-alias` rewrites `@/x` specifiers in the emitted JS to relative `./x.js`                  |
| Production runtime | Plain relative ESM imports — Node.js resolves them natively, nothing fragile                  |

Alias specifiers are rewritten **at build time** (not resolved through runtime
hooks), so `dist/` contains only specifiers Node.js understands natively.

## ESM and import resolution decisions

- `"type": "module"` in `package.json`; the project is native ESM end to end.
- `module: "esnext"` + `moduleResolution: "bundler"`: source imports are
  **extensionless** (`.js`/`.ts` extensions are never written in source), while
  emit stays pure ESM.
- TypeScript's Node-native modes (`moduleResolution: "nodenext"`) require explicit
  extensions on relative imports, which would force `.js` suffixes in source. The
  `bundler` mode removes that constraint, and the `@/*` convention plus the
  `tsc-alias` build step guarantee that emitted files are still valid for
  Node.js's stricter runtime resolution.
- No CommonJS, no `.cjs`/`.mjs` files, no dual-package hazards.

## TypeScript configuration decisions

`tsconfig.json` (type checking / dev reference):

- **Strict family**: `strict`, `noUncheckedIndexedAccess` (indexed reads are
  possibly `undefined`), `exactOptionalPropertyTypes` (optional properties can be
  omitted, never set to `undefined`), `noImplicitOverride`,
  `forceConsistentCasingInFileNames`, `verbatimModuleSyntax` (type-only imports
  must use `import type`; the module syntax you write is the syntax you get),
  `noUnusedLocals`/`noUnusedParameters`, `noFallthroughCasesInSwitch`,
  `noImplicitReturns`, `noUncheckedSideEffectImports`.
- `types: ["node"]` — Node.js types only (TypeScript 7 defaults `types` to `[]`).
- `target: "esnext"` with `lib: ["esnext"]` — code runs on a modern Node.js
  runtime; nothing is downleveled, DOM globals are absent.
- `noEmit: true` — this config type-checks; emission is isolated in
  `tsconfig.build.json` so dev and production stay predictable.

`tsconfig.build.json` extends it and only changes emit settings: `noEmit: false`,
`outDir: "dist"`, `rootDir: "src"`, `sourceMap: true`.

## Tooling notes

- **TypeScript 7** (the native compiler) — same `tsc` CLI, ~10x faster.
- **Biome** is the exclusive formatter and linter (no ESLint, no Prettier).
  Config lives in `biome.json`: 100-char lines, 2-space indent, LF, single
  quotes, no semicolons (`asNeeded`), no trailing commas, organized/sorted
  imports, and errors for unused variables/imports. `dist/` and
  `node_modules/` are ignored.
- **pnpm 12** is pinned via `packageManager`; `pnpm-workspace.yaml` holds the
  build-script approval for `esbuild` (required by tsx).

## Project structure

```text
.
├── src/                  # TypeScript sources (entry: src/index.ts)
│   ├── app.ts
│   ├── config/
│   ├── modules/
│   └── utils/
├── tests/                # node:test suite (unit + integration)
│   ├── unit/
│   └── integration/
├── dist/                 # Generated ESM output (gitignored)
├── scripts/
│   └── clean.mjs         # Cross-platform clean helper
├── biome.json            # Biome formatter + linter config
├── package.json
├── pnpm-workspace.yaml   # pnpm settings (build-script approvals)
├── tsconfig.json         # Type-check / dev config (src + tests)
├── tsconfig.build.json   # Production emit config (src only)
└── README.md
```
