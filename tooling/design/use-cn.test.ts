// biome-ignore-all lint/suspicious/noTemplateCurlyInString: Source fixtures.
import { expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "bun";

test("Biome requires cn at JSX className boundaries", () => {
  const directory = mkdtempSync(resolve(tmpdir(), "use-cn-"));
  try {
    writeFileSync(
      resolve(directory, "biome.json"),
      JSON.stringify({
        plugins: [resolve("tooling/design/use-cn.grit")],
        formatter: { enabled: false },
        assist: { enabled: false },
        linter: { rules: { recommended: false } },
      }),
    );
    const run = (attribute: string) => {
      const path = resolve(directory, "fixture.tsx");
      writeFileSync(path, `const element = <div ${attribute} />;`);
      return spawnSync([
        resolve("node_modules/.bin/biome"),
        "lint",
        `--config-path=${directory}`,
        path,
      ]);
    };
    for (const attribute of [
      'className="p-4"',
      "className={classes}",
      "className={`p-4 ${extra}`}",
      'className={active ? "p-4" : "p-2"}',
      'className={clsx("p-4")}',
    ]) {
      const result = run(attribute);
      expect(result.exitCode).toBe(1);
      expect(result.stderr.toString()).toContain("Use className={cn(...)}");
    }
    for (const attribute of [
      'className={cn("p-4")}',
      'className={cn("p-4", { "font-bold": active })}',
      "className={cn(classes)}",
      'aria-label="Example"',
    ]) {
      expect(run(attribute).exitCode).toBe(0);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
