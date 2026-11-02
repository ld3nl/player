# Player design policy

These checks protect the Paul Lowe Talks catalog and player. They follow our
slate/gray surfaces, white player panel, purple actions and focus indicators,
system sans typography, and shared Headless UI controls. The visual direction
and layout decisions are recorded in [direction.md](./direction.md).

## Class composition

Use `className={cn(...)}` in application JSX, including static class strings.
Import `cn` directly from `cnfast`; no extra wrapper or `@/utils` helper is needed.

```tsx
import { cn } from "cnfast";

<div className={cn("text-sm text-slate-600", { "font-semibold": active })} />;
```

Pass complete utility strings. Use static maps or `cn` conditions instead of
constructing partial utilities such as `text-${size}`; Tailwind needs to see the
complete class. The AST audit also checks literal strings in maps and helpers.
The Biome rule checks the `cn(...)` syntax; the audit checks its import source.

## Palette, scale and player geometry

`policy.json` defines the spacing/type/radius/border/shadow scales and named
breakpoints. Palette shades must exist in the installed Tailwind theme and use
`slate`, `gray`, or `purple`, plus white, black and CSS color keywords. The old
project's primary/secondary aliases are not part of this app.

Use normal Tailwind utilities for layout. Exact player geometry and viewport
calculations have small, documented allowances in `allowedUtilities`:

- 22px time-label insets match the center of the 44px seek target.
- 11px skip labels fit inside the circular 15-second arrows.
- Viewport calculations keep the dialog and artwork usable on short screens.

These are intentional design decisions. Do not round them to nearby scale steps.
New arbitrary values must be reviewed in the policy rather than silently accepted.

`componentValues` records the reviewed CSS values for shared controls, fields,
and the seek track. It preserves the current exact colors and dimensions. Those
values are allowed only in `@layer components` in `app/styles/globals.css`.
The 44px hit targets, 72px play button and 19px track offset remain intact.
Other presentation belongs in JSX utilities; animation keyframes may use
Tailwind variables. `@apply` and `@utility` aliases are rejected.

Runtime inline geometry is allowed only for the reviewed properties/files in
`inlineGeometry`: seek-track positions and listing progress width. The catalog
filters use CSS sticky positioning and need no runtime offset. Fixed inline measurements still fail. Other inline presentation
must use utilities or approved variables. The checker inspects direct style
object literals; it does not resolve aliased objects or spreads.

## How the checks run

The three GritQL plugins are registered in the root `biome.json` using
[Biome's plugin configuration](https://biomejs.dev/linter/plugins/):

- `use-cn.grit` enforces JSX class composition in `app` and `components`.
- `classes.grit` gives fast feedback for raw padding, most margins, gaps,
  radii, and paint utilities. The AST audit covers the full policy, including
  dimensions, typography, and the reviewed arbitrary utility allowances.
- `css.grit` rejects `@apply` and `@utility` in application/component styles.

Plugin diagnostics are errors. Test/spec fixtures and tooling are excluded from
application plugins. The standalone audit scans JS/TS/JSX/TSX and CSS in `app`,
`components`, and `lib`, excluding test/spec files. It also checks approved CSS
values, literal inline styles, variable declarations and breakpoint measurements.
Neither checker is a replacement for browser accessibility or visual testing.

```sh
bun run lint          # Biome, including the plugins
bun run lint:design   # Complete design policy audit
bun run test:design   # Checker regressions and real Biome integration
bun run check         # All of the above, Knip, and app/tooling TypeScript
bun run tooling/design/check.ts --inventory
```

Bun types are isolated in `tooling/tsconfig.json` so they do not enter the Next.js
application's type environment. The imported checker paths and missing-font
recursion bug are fixed. Tests run the actual root Biome configuration against
both valid and invalid fixtures and clean up their temporary files.

`baseline.json` is empty. If a temporary migration exception is ever necessary,
it must identify the file, rule, exact value, count and reason. Stale entries
fail the audit; permanent design choices belong in `policy.json`.
