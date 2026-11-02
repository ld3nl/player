// biome-ignore-all lint/suspicious/noTemplateCurlyInString: Fixtures contain literal source code.
import { expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "bun";
import {
  audit_design,
  check_classes,
  check_css,
  check_source,
  read_theme,
  split_top_level,
} from "./check";

const theme = read_theme("--font-reader: Georgia; --color-lake: #163f49;");
const with_cn = (source: string) => `import { cn } from "cnfast"; ${source}`;

test("variants retain nested selector colons and calculations", () => {
  expect(
    split_top_level("[&:nth-child(2)]:md:gap-[calc(1rem_+_2px)]", ":"),
  ).toEqual(["[&:nth-child(2)]", "md", "gap-[calc(1rem_+_2px)]"]);
  expect(
    check_classes("md:gap-4 lg:text-xl/6 rounded-md border-slate-200", theme),
  ).toEqual([]);
});

test("slate/gray surfaces and purple actions use the installed Tailwind palette", () => {
  expect(
    check_classes(
      "bg-gray-700 text-slate-300 border-purple-700 bg-white/80",
      theme,
    ),
  ).toEqual([]);
  [
    "bg-emerald-700",
    "text-primary",
    "bg-lake",
    "bg-(--color-lake)",
    "border-[#123456]",
    "text-purple-999",
  ].forEach((utility) => {
    expect(check_classes(utility, theme).length).toBeGreaterThan(0);
  });
});

test("scale violations are found behind responsive and selector variants", () => {
  [
    "p-[13px]",
    "gap-13",
    "text-[17px]",
    "leading-[1.17]",
    "tracking-[.03em]",
    "rounded-[7px]",
    "border-[3px]",
    "font-[550]",
  ].forEach((utility) => {
    expect(
      check_classes(`md:hover:[&>a]:${utility}`, theme).length,
    ).toBeGreaterThan(0);
  });
  expect(check_classes("max-[750px]:p-4", theme)[0]?.rule).toBe("breakpoint");
  expect(check_classes("text-sm/[1.17]", theme)[0]?.rule).toBe("leading");
});

test("reviewed seeking and viewport geometry stays exact", () => {
  expect(
    check_classes(
      "mx-[22px] text-[11px] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] max-w-[min(16rem,32dvh)] sm:max-w-[min(18rem,36dvh)]",
      theme,
    ),
  ).toEqual([]);
  expect(
    check_classes("mx-[23px] text-[10px] max-w-[min(17rem,32dvh)]", theme),
  ).toHaveLength(3);
});

test("static maps, cn arguments and interpolated utilities are audited", () => {
  expect(
    check_source(
      "test.tsx",
      with_cn(
        'const styles = { x: "md:p-[13px]" }; const el = <div className={cn("lg:gap-13", styles.x)} />;',
      ),
      theme,
    ),
  ).toHaveLength(2);
  expect(
    check_source("test.tsx", "const cls = `text-${size}`;", theme)[0]?.rule,
  ).toBe("dynamic-class");
  expect(
    check_source(
      "test.tsx",
      "const cls = `px-4 ${focusRing}`; const id = `page-${id}`;",
      theme,
    ),
  ).toEqual([]);
});

test("cn must be imported from the actual project helper", () => {
  expect(
    check_source(
      "test.tsx",
      'const el = <div className={cn("p-4")} />;',
      theme,
    )[0]?.rule,
  ).toBe("class-helper");
  expect(
    check_source(
      "test.tsx",
      with_cn('const el = <div className={cn("p-4")} />;'),
      theme,
    ),
  ).toEqual([]);
});

test("inline layout is restricted to reviewed runtime positions", () => {
  const source = "const el = <div style={{ top: hidden ? -height : 0 }} />;";
  // The redesigned filters use CSS sticky positioning; runtime top is no longer needed.
  expect(
    check_source("components/Header/Header.tsx", source, theme)[0]?.rule,
  ).toBe("inline-design");
  expect(check_source("components/Other.tsx", source, theme)[0]?.rule).toBe(
    "inline-design",
  );
  expect(
    check_source(
      "components/Header/Header.tsx",
      "const el = <div style={{ top: 13 }} />;",
      theme,
    )[0]?.rule,
  ).toBe("inline-design");
  expect(
    check_source(
      "components/MainPlayer/PlayerControls.tsx",
      "const el = <div style={{ left: Number(style.left) + 22, right: Number(style.right) + 22 }} />;",
      theme,
    ),
  ).toEqual([]);
  expect(
    check_source(
      "components/AudioListing/AudioListing.tsx",
      "const el = <div style={{ width: `${progress}%` }} />;",
      theme,
    ),
  ).toEqual([]);
});

test("custom fonts terminate safely, while unknown fonts and colors fail", () => {
  expect(
    check_source(
      "test.tsx",
      'const el = <div style={{ fontFamily: "var(--font-reader)" }} />;',
      theme,
    ),
  ).toEqual([]);
  expect(
    check_source(
      "test.tsx",
      'const el = <div style={{ fontFamily: "var(--font-missing)" }} />;',
      theme,
    ),
  ).toHaveLength(1);
  ["--color-lake", "--color-red-500"].forEach((variable) => {
    expect(
      check_source(
        "test.tsx",
        `const el = <div style={{ color: "var(${variable})" }} />;`,
        theme,
      ),
    ).toHaveLength(1);
  });
});

test("shared component CSS passes with its existing exact values", () => {
  expect(
    check_css(
      "app/styles/globals.css",
      readFileSync("app/styles/globals.css", "utf8"),
      theme,
    ),
  ).toEqual([]);
  expect(
    check_css(
      "app/styles/globals.css",
      "@layer components { .ui-control { min-width: 43px; color: #123456; } }",
      theme,
    ).map((item) => item.rule),
  ).toEqual(["css-design", "css-design"]);
  expect(
    check_css("components/Other.css", ".x { color: #475569; }", theme).map(
      (item) => item.rule,
    ),
  ).toEqual(["utility-first", "css-design"]);
});

test("CSS overrides, aliases and nonstandard breakpoints cannot bypass policy", () => {
  expect(
    check_css(
      "test.css",
      "@theme { --color-lake: #163f49; --color-purple-700: #123456; }",
      theme,
    ).map((item) => item.rule),
  ).toEqual(["custom-token", "theme-override"]);
  expect(
    check_css("test.css", ".x { @apply p-[13px]; }", theme).map(
      (item) => item.rule,
    ),
  ).toEqual(["utility-first", "spacing"]);
  expect(
    check_css(
      "test.css",
      "@media (750px <= width < 900px) { .x { display: flex; } }",
      theme,
    ),
  ).toHaveLength(2);
  expect(
    check_css(
      "test.css",
      "@media (width >= 48rem) { .x { display: flex; } }",
      theme,
    ),
  ).toEqual([]);
  expect(
    check_css(
      "test.css",
      "@keyframes shrink { to { width: --spacing(8); color: var(--color-purple-700); } }",
      theme,
    ),
  ).toEqual([]);
});

// Exercise the real root config, including excludes, instead of a lookalike config.
test("repository Biome applies each plugin only to UI source and styles", () => {
  const run_probe = (parent: string, extension: string, source: string) => {
    const directory = mkdtempSync(resolve(parent, "biome-probe-"));
    const fixture = resolve(directory, `fixture.${extension}`);
    writeFileSync(fixture, source);
    try {
      const result = spawnSync([
        resolve("node_modules/.bin/biome"),
        "lint",
        fixture,
        "--max-diagnostics=none",
      ]);
      return {
        code: result.exitCode,
        output: result.stdout.toString() + result.stderr.toString(),
      };
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  };
  ["app", "components"].forEach((parent) => {
    const bad = run_probe(
      parent,
      "tsx",
      'const el = <div className="p-[13px]" />;',
    );
    expect(bad.code).toBe(1);
    expect(bad.output).toContain("Use approved player spacing");
    expect(bad.output).toContain("Use className={cn(...)}");
    expect(bad.output).not.toContain("Failed to compile");
    expect(run_probe(parent, "css", ".x { @apply p-4; }").output).toContain(
      "instead of @apply/@utility",
    );
  });
  ["lib", "tooling/design"].forEach((parent) => {
    expect(
      run_probe(parent, "tsx", 'const el = <div className="p-[13px]" />;')
        .output,
    ).not.toContain("Use approved player spacing");
  });
  expect(
    run_probe(
      "components",
      "test.tsx",
      'const el = <div className="p-[13px]" />;',
    ).output,
  ).not.toContain("Use className={cn(...)}");
}, 15_000);

test("audit uses this repository's real stylesheet and source roots", async () => {
  expect(await audit_design(resolve("."))).toEqual([]);
});

test("audit reports a new nested UI violation", async () => {
  const directory = mkdtempSync(resolve("components", "audit-probe-"));
  mkdirSync(resolve(directory, "nested"));
  writeFileSync(
    resolve(directory, "nested/fixture.tsx"),
    with_cn('const el = <div className={cn("p-[13px]")} />;'),
  );
  try {
    const results = await audit_design(resolve("."));
    expect(results).toHaveLength(1);
    expect(results[0]?.rule).toBe("spacing");
    expect(results[0]?.file).toContain("nested/fixture.tsx");
    const result = spawnSync([
      process.execPath,
      resolve("tooling/design/check.ts"),
    ]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr.toString()).toContain("[design/spacing] p-[13px]");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
