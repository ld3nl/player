import { readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import postcss from "postcss";
import policy from "./policy.json";

export type Diagnostic = {
  file: string;
  line: number;
  column: number;
  rule: string;
  value: string;
  message: string;
};

type AstNode = {
  type: string;
  start?: number | null;
  loc?: { start: { line: number; column: number } } | null;
  [key: string]: unknown;
};

export type Theme = Map<string, string>;

const approved_variable = (variable: string, theme: Theme): boolean =>
  (variable.startsWith("--color-")
    ? check_color(theme, variable.slice("--color-".length))
    : tailwindTheme.has(variable)) ||
  (variable.startsWith("--font-") && theme.has(variable));

// Delimit only at top level: arbitrary variants and calc() contain colons/spaces.
export const split_top_level = (
  input: string,
  delimiter: "space" | ":" | "/",
) => {
  const parts: string[] = [];
  let part = "";
  let depth = 0;
  let escaped = false;
  let quote = "";
  for (const character of input) {
    if (escaped) {
      part += character;
      escaped = false;
      continue;
    }
    if (character === "\\") {
      part += character;
      escaped = true;
      continue;
    }
    if (quote) {
      part += character;
      if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    if (character === "[" || character === "(") depth++;
    if (character === "]" || character === ")") depth--;
    if (
      depth === 0 &&
      !quote &&
      (delimiter === "space" ? /\s/.test(character) : character === delimiter)
    ) {
      if (part) parts.push(part);
      part = "";
    } else {
      part += character;
    }
  }
  if (part) parts.push(part);
  return parts;
};

const check_known = (
  theme: Theme,
  namespace: string,
  value: string,
  defaults: string[],
) => {
  return (
    defaults.includes(value) ||
    (namespace === "font" && theme.has(`--font-${value}`))
  );
};

const check_color = (_theme: Theme, value: string) => {
  return (
    policy.colors.includes(value) ||
    (policy.paletteFamilies.some((family) => value.startsWith(`${family}-`)) &&
      tailwindTheme.has(`--color-${value}`))
  );
};

const find_utility_problem = (
  utility: string,
  theme: Theme,
): [string, string] | null => {
  if (Object.hasOwn(policy.allowedUtilities, utility)) return null;
  const base = utility.replace(/^!/, "").replace(/!$/, "").replace(/^-/, "");
  const [name] = split_top_level(base, "/");
  const value = name ?? "";
  const spacing = value.match(
    /^(p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|scroll-[pm][xytrblse]?)-(.+)$/,
  );
  if (spacing) {
    const allowed = [
      ...policy.spacing,
      "px",
      ...(spacing[1].startsWith("m") ? ["auto"] : []),
    ];
    if (!check_known(theme, "spacing", spacing[2], allowed))
      return [
        "spacing",
        "Use a standard Tailwind spacing class, choosing the closest scale step.",
      ];
  }
  const dimension = value.match(
    /^(w|h|size|min-w|max-w|min-h|max-h|basis|inset(?:-[xy])?|top|right|bottom|left|start|end|translate-[xy])-(.+)$/,
  );
  if (
    dimension &&
    ![
      ...policy.spacing,
      ...Object.keys(policy.containerBreakpoints),
      "px",
      "auto",
      "full",
      "screen",
      "svw",
      "lvw",
      "dvw",
      "svh",
      "lvh",
      "dvh",
      "min",
      "max",
      "fit",
      "none",
      "prose",
    ].includes(value.slice(dimension[1].length + 1)) &&
    !/^\d+\/\d+$/.test(base.slice(dimension[1].length + 1))
  )
    return [
      "size",
      "Use the closest standard Tailwind spacing/container size, fraction or viewport class; e.g. w-[1220px] → w-7xl (1280px).",
    ];
  const text = value.match(/^text-(.+)$/);
  if (
    text &&
    ![
      "left",
      "center",
      "right",
      "justify",
      "start",
      "end",
      "ellipsis",
      "clip",
      "wrap",
      "nowrap",
      "balance",
      "pretty",
    ].includes(text[1])
  ) {
    if (
      !check_known(theme, "text", text[1], policy.text) &&
      !check_color(theme, text[1])
    )
      return [
        "typography-or-color",
        "Use a standard Tailwind text size or palette colour (slate, gray and purple are approved).",
      ];
  }
  for (const [prefix, namespace, defaults] of [
    ["leading", "leading", policy.leading],
    ["tracking", "tracking", policy.tracking],
    ["shadow", "shadow", policy.shadow],
  ] as const) {
    if (
      value.startsWith(`${prefix}-`) &&
      !check_known(theme, namespace, value.slice(prefix.length + 1), [
        ...defaults,
      ])
    )
      return [prefix, `Use a standard Tailwind ${namespace} class.`];
  }
  const radius = value.match(
    /^rounded(?:-(?:[trblse]|[tb][lr]|[se][se]|[se][trbl]))?(?:-(.+))?$/,
  );
  if (radius?.[1] && !check_known(theme, "radius", radius[1], policy.radius))
    return ["radius", "Use a standard Tailwind rounded class."];
  const font = value.match(/^font-(.+)$/);
  if (
    font &&
    !check_known(theme, "font", font[1], ["sans", "serif", "mono"]) &&
    !check_known(theme, "font-weight", font[1], [
      "thin",
      "extralight",
      "light",
      "normal",
      "medium",
      "semibold",
      "bold",
      "extrabold",
      "black",
    ])
  )
    return ["font", "Choose an approved font family or weight token."];
  if (/^(?:border-[xytrblse]|divide-[xy])$/.test(value)) return null;
  if (
    /^(?:outline-offset|ring-offset)-\d+$/.test(value) &&
    policy.spacing.includes(value.split("-").at(-1) ?? "")
  )
    return null;
  if (["border-collapse", "border-separate"].includes(value)) return null;
  const border = value.match(
    /^(border(?:-[xytrblse])?|divide-[xy]|outline-offset|ring-offset|outline|ring)-(.*)$/,
  );
  if (
    border &&
    ![
      ...policy.borderWidth,
      "solid",
      "dashed",
      "dotted",
      "double",
      "hidden",
      "none",
      "auto",
      "inset",
    ].includes(border[2]) &&
    !check_color(theme, border[2])
  )
    return ["border", "Choose an approved border width or color token."];
  const paint = value.match(
    /^(bg|from|via|to|divide|decoration|fill|stroke|caret|accent)-(.+)$/,
  );
  if (paint) {
    const suffix = paint[2];
    if (
      /^(?:linear-|gradient-to-|radial|conic|clip-|origin-|repeat|no-repeat|cover|contain|fixed|local|scroll|none|auto|center|top|bottom|left|right|blend-)/.test(
        suffix,
      )
    )
      return null;
    if (
      paint[1] === "decoration" &&
      [
        "solid",
        "double",
        "dotted",
        "dashed",
        "wavy",
        "auto",
        "from-font",
        "0",
        "1",
        "2",
        "4",
        "8",
      ].includes(suffix)
    )
      return null;
    if (
      (paint[1] === "stroke" && ["0", "1", "2"].includes(suffix)) ||
      /^(?:\d+%|\[url\()/.test(suffix)
    )
      return null;
    if (!check_color(theme, suffix))
      return [
        "color",
        "Use a Tailwind palette colour; use slate/gray surfaces and purple actions.",
      ];
  }
  const arbitrary = value.match(/^\[([^:]+):/);
  if (
    arbitrary &&
    /^(?:width|height|min-width|max-width|min-height|max-height|inset|top|right|bottom|left|padding|margin|gap|font|line-height|letter-spacing|border|border-radius|color|background|box-shadow)/.test(
      arbitrary[1],
    )
  )
    return [
      "arbitrary-property",
      "Use a named design utility rather than bypassing the token policy.",
    ];
  return null;
};

export const check_classes = (input: string, theme: Theme) => {
  const problems: { rule: string; value: string; message: string }[] = [];
  for (const token of split_top_level(input, "space")) {
    const chain = split_top_level(token, ":");
    const utility = chain.pop();
    for (const variant of chain) {
      if (
        /^(?:min|max)-\[/.test(variant) ||
        /^@(?:min-|max-)?\[/.test(variant) ||
        (variant.startsWith("[") && /@(?:media|container)/.test(variant))
      )
        problems.push({
          rule: "breakpoint",
          value: token,
          message: "Use an approved named breakpoint or container variant.",
        });
    }
    if (utility) {
      const problem = find_utility_problem(utility, theme);
      if (problem)
        problems.push({ rule: problem[0], value: token, message: problem[1] });
      const slash = split_top_level(utility, "/");
      if (
        utility.startsWith("text-") &&
        slash[1] &&
        !check_color(theme, slash[0].slice(5)) &&
        !check_known(theme, "leading", slash[1], policy.leading)
      )
        problems.push({
          rule: "leading",
          value: token,
          message:
            "Use approved line-height steps or leading tokens after a text-size slash.",
        });
    }
  }
  return problems;
};

const check_node = (value: unknown): value is AstNode => {
  return (
    !!value &&
    typeof value === "object" &&
    "type" in value &&
    typeof value.type === "string"
  );
};

const visit_node = (node: AstNode, visit: (node: AstNode) => void) => {
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (["loc", "comments", "tokens", "errors"].includes(key)) continue;
    if (Array.isArray(value)) {
      for (const item of value) if (check_node(item)) visit_node(item, visit);
    } else if (check_node(value)) visit_node(value, visit);
  }
};

const classCandidate =
  /(?:^|\s|:)(?:!?-?(?:w|h|size|min-w|max-w|min-h|max-h|basis|inset|top|right|bottom|left|start|end|translate|p[xytrblse]?|m[xytrblse]?|gap|space|text|leading|tracking|rounded|border|divide|bg|from|via|to|ring|outline|shadow|font|fill|stroke|caret|accent|decoration)-|\[(?:padding|margin|font|gap|border|color|background|line-height):)/;

export const check_source = (
  file: string,
  source: string,
  theme: Theme,
): Diagnostic[] => {
  const ast = parse(source, {
    sourceType: "unambiguous",
    plugins: ["typescript", "jsx"],
  });
  const results: Diagnostic[] = [];
  const report = (
    node: AstNode,
    rule: string,
    value: string,
    message: string,
  ) => {
    results.push({
      file,
      line: node.loc?.start.line ?? 1,
      column: (node.loc?.start.column ?? 0) + 1,
      rule,
      value,
      message,
    });
  };
  let uses_cn = false;
  let imports_cn = false;
  visit_node(ast as unknown as AstNode, (node) => {
    if (
      node.type === "ImportDeclaration" &&
      check_node(node.source) &&
      node.source.value === "cnfast" &&
      Array.isArray(node.specifiers)
    ) {
      imports_cn = node.specifiers.some(
        (specifier) =>
          check_node(specifier) &&
          check_node(specifier.imported) &&
          specifier.imported.name === "cn" &&
          check_node(specifier.local) &&
          specifier.local.name === "cn",
      );
    }
    if (
      node.type === "JSXAttribute" &&
      check_node(node.name) &&
      node.name.name === "className" &&
      check_node(node.value)
    ) {
      visit_node(node.value, (child) => {
        if (
          child.type === "CallExpression" &&
          check_node(child.callee) &&
          child.callee.name === "cn"
        )
          uses_cn = true;
      });
    }

    // Covers JSX strings, cn() strings, returned classes, map keys and constants.
    if (
      node.type === "StringLiteral" &&
      typeof node.value === "string" &&
      classCandidate.test(node.value) &&
      !/^[\w-]+\s+\d+m?s\s/.test(node.value)
    ) {
      for (const problem of check_classes(node.value, theme))
        report(node, problem.rule, problem.value, problem.message);
    }
    if (node.type === "TemplateLiteral" && Array.isArray(node.quasis)) {
      const chunks = node.quasis.filter(check_node).map((quasi) => {
        const value = quasi.value;
        return value && typeof value === "object" && "raw" in value
          ? String(value.raw)
          : "";
      });
      if (
        Array.isArray(node.expressions) &&
        node.expressions.length &&
        chunks.some(
          (chunk) => classCandidate.test(chunk) && /(?:-|:|\[)$/.test(chunk),
        )
      ) {
        report(
          node,
          "dynamic-class",
          source.slice(node.start ?? 0, Number(node.end)),
          "Use complete class strings in a static map; interpolated utilities bypass token validation and Tailwind detection.",
        );
      } else
        for (const chunk of chunks)
          for (const problem of check_classes(chunk, theme))
            report(node, problem.rule, problem.value, problem.message);
    }
    if (
      node.type === "JSXAttribute" &&
      check_node(node.name) &&
      node.name.name === "style" &&
      check_node(node.value)
    ) {
      visit_node(node.value, (child) => {
        if (child.type !== "ObjectProperty" || !check_node(child.key)) return;
        const key = String(child.key.name ?? child.key.value ?? "");
        if (
          /^(?:width|height|minWidth|maxWidth|minHeight|maxHeight|top|right|bottom|left|inset|padding|margin|gap|rowGap|columnGap|fontSize|fontFamily|fontWeight|lineHeight|letterSpacing|border|color|backgroundColor|boxShadow)/.test(
            key,
          )
        ) {
          const expression = check_node(child.value) ? child.value : undefined;
          const geometry = policy.inlineGeometry as Record<string, string[]>;
          // Runtime positions belong to playback/layout state, not the static scale.
          if (
            geometry[file]?.includes(key) &&
            expression &&
            ![
              "StringLiteral",
              "NumericLiteral",
              "BooleanLiteral",
              "NullLiteral",
            ].includes(expression.type)
          )
            return;
          const value = expression?.value;
          if (
            value !== 0 &&
            !(
              typeof value === "string" &&
              (/^(?:inherit|currentColor|transparent)$/.test(value) ||
                (/^var\((--[\w-]+)\)$/.test(value) &&
                  approved_variable(value.slice(4, -1), theme)))
            )
          )
            report(
              child,
              "inline-design",
              key,
              "Use standard Tailwind utilities for this inline style.",
            );
        }
      });
    }
  });
  if (uses_cn && !imports_cn)
    report(
      ast as unknown as AstNode,
      "class-helper",
      "cn",
      'Import { cn } from "cnfast" for class composition.',
    );
  return results;
};

const designProperty =
  /^(?:width|height|min-width|max-width|min-height|max-height|inset|top|right|bottom|left|fill|stroke|padding(?:-.+)?|margin(?:-.+)?|(?:row-|column-)?gap|font(?:-(?:size|family|weight))?|text-underline-offset|text-decoration-thickness|line-height|letter-spacing|border(?:-.+)?|outline(?:-.+)?|color|background(?:-color)?|box-shadow)$/;

export const read_theme = (css: string): Theme => {
  const theme: Theme = new Map();
  postcss.parse(css).walkDecls((declaration) => {
    if (declaration.prop.startsWith("--"))
      theme.set(declaration.prop, declaration.value);
  });
  return theme;
};

// Read the installed version, so palette names track the project's Tailwind release.
const tailwindTheme = read_theme(
  readFileSync(
    new URL("../../node_modules/tailwindcss/theme.css", import.meta.url),
    "utf8",
  ),
);

export const check_css = (
  file: string,
  css: string,
  theme: Theme,
): Diagnostic[] => {
  const root = postcss.parse(css, { from: file });
  const results: Diagnostic[] = [];
  root.walkDecls((declaration) => {
    if (
      declaration.prop.startsWith("--") &&
      /(?:#[\da-fA-F]{3,8}|(?:oklch|rgb|hsl)a?\(|[\d.]+(?:px|rem|em)\b)/.test(
        declaration.value,
      ) &&
      !approved_variable(declaration.prop, theme)
    ) {
      results.push({
        file,
        line: declaration.source?.start?.line ?? 1,
        column: declaration.source?.start?.column ?? 1,
        rule: "custom-token",
        value: `${declaration.prop}: ${declaration.value}`,
        message:
          "Do not hide custom sizes/colours in variables. Use standard Tailwind utilities; use the slate/gray/purple palette.",
      });
    }
    if (
      declaration.prop.startsWith("--") &&
      tailwindTheme.has(declaration.prop) &&
      !declaration.prop.startsWith("--font-") &&
      declaration.value !== tailwindTheme.get(declaration.prop)
    ) {
      results.push({
        file,
        line: declaration.source?.start?.line ?? 1,
        column: declaration.source?.start?.column ?? 1,
        rule: "theme-override",
        value: declaration.prop,
        message:
          "Keep Tailwind's default size and palette values; font families may be customised.",
      });
    }
    if (!designProperty.test(declaration.prop)) return;
    let ancestor: postcss.Node | undefined = declaration.parent;
    let shared_component = false;
    let keyframe = false;
    while (ancestor) {
      if (ancestor.type === "atrule" && "name" in ancestor) {
        if (/keyframes$/.test(String(ancestor.name))) keyframe = true;
        if (
          ancestor.name === "layer" &&
          "params" in ancestor &&
          ancestor.params === "components"
        )
          shared_component = true;
      }
      ancestor = ancestor.parent;
    }
    const value = declaration.value;
    const values = policy.componentValues as Record<string, string[]>;
    const shared_file = file === "app/styles/globals.css";
    if (
      shared_component &&
      shared_file &&
      values[declaration.prop]?.includes(value)
    )
      return;
    if (!keyframe && !(shared_component && shared_file)) {
      results.push({
        file,
        line: declaration.source?.start?.line ?? 1,
        column: declaration.source?.start?.column ?? 1,
        rule: "utility-first",
        value: `${declaration.prop}: ${value}`,
        message:
          "Use Tailwind utilities, or put reviewed reusable controls in the components layer of app/styles/globals.css.",
      });
    }
    const spacing = value.match(/^--spacing\(([\d.]+)\)$/);
    if (spacing && policy.spacing.includes(spacing[1])) return;
    const variables = [...value.matchAll(/var\((--[\w-]+)/g)].map(
      (match) => match[1],
    );
    const remaining = value.replace(/var\(--[\w-]+\)/g, "");
    if (
      (variables.length > 0 &&
        variables.every((variable) => approved_variable(variable, theme)) &&
        !/[\d#]/.test(remaining)) ||
      /^(?:0|auto|max-content|min-content|fit-content|none|inherit|initial|unset|revert|currentColor|transparent|solid|dashed|dotted|collapse|separate)$/.test(
        value,
      )
    )
      return;
    results.push({
      file,
      line: declaration.source?.start?.line ?? 1,
      column: declaration.source?.start?.column ?? 1,
      rule: "css-design",
      value: `${declaration.prop}: ${value}`,
      message:
        "Use approved component values from tooling/design/policy.json or Tailwind variables; review new design values explicitly.",
    });
  });
  root.walkAtRules((rule) => {
    if (rule.name === "apply" || rule.name === "utility") {
      results.push({
        file,
        line: rule.source?.start?.line ?? 1,
        column: rule.source?.start?.column ?? 1,
        rule: "utility-first",
        value: `@${rule.name} ${rule.params}`,
        message:
          "Put standard Tailwind classes in JSX or HTML rendering code instead of @apply or custom @utility aliases.",
      });
    }
    if (rule.name === "apply") {
      for (const problem of check_classes(rule.params, theme))
        results.push({
          file,
          line: rule.source?.start?.line ?? 1,
          column: rule.source?.start?.column ?? 1,
          ...problem,
        });
    }
    if (!["media", "container"].includes(rule.name)) return;
    const allowed =
      rule.name === "media"
        ? Object.entries(policy.breakpoints).map(([, value]) => value)
        : Object.entries(policy.containerBreakpoints).map(([, value]) => value);
    const queries = rule.params.matchAll(/([\d.]+(?:px|rem|em))/g);
    for (const query of queries)
      if (!allowed.includes(query[1]))
        results.push({
          file,
          line: rule.source?.start?.line ?? 1,
          column: rule.source?.start?.column ?? 1,
          rule: "css-breakpoint",
          value: rule.params,
          message:
            "Use the named theme breakpoint values and consistent units in CSS queries.",
        });
  });
  return results;
};

export const get_diagnostic_key = (diagnostic: Diagnostic) => {
  return `${diagnostic.file}|${diagnostic.rule}|${diagnostic.value}`;
};

const find_files = async (directory: string): Promise<string[]> => {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules"].includes(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await find_files(path)));
    else if (
      /\.(?:[cm]?[jt]sx?|css)$/.test(entry.name) &&
      !/\.(?:test|spec)\./.test(entry.name)
    )
      files.push(path);
  }
  return files;
};

export const audit_design = async (root: string) => {
  const theme = read_theme(
    await readFile(resolve(root, "app/styles/globals.css"), "utf8"),
  );
  const diagnostics: Diagnostic[] = [];
  for (const directory of ["app", "components", "lib"]) {
    for (const path of await find_files(resolve(root, directory))) {
      const file = relative(root, path).replaceAll("\\", "/");
      const source = await readFile(path, "utf8");
      diagnostics.push(
        ...(path.endsWith(".css")
          ? check_css(file, source, theme)
          : check_source(file, source, theme)),
      );
    }
  }
  return diagnostics;
};

if (import.meta.main) {
  try {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
    const diagnostics = await audit_design(root);
    if (process.argv.includes("--inventory")) {
      console.log(JSON.stringify(diagnostics, null, 2));
    } else {
      const baseline: {
        exceptions: { key: string; count: number; reason: string }[];
      } = JSON.parse(
        await readFile(resolve(root, "tooling/design/baseline.json"), "utf8"),
      );
      const remaining = new Map(
        baseline.exceptions.map((entry) => [entry.key, entry.count]),
      );
      const unexpected = diagnostics.filter((diagnostic) => {
        const key = get_diagnostic_key(diagnostic);
        const count = remaining.get(key) ?? 0;
        if (count > 0) {
          remaining.set(key, count - 1);
          return false;
        }
        return true;
      });
      for (const diagnostic of unexpected)
        console.error(
          `${diagnostic.file}:${diagnostic.line}:${diagnostic.column} [design/${diagnostic.rule}] ${diagnostic.value}\n  ${diagnostic.message}`,
        );
      const stale = [...remaining].filter(([, count]) => count > 0);
      for (const [key, count] of stale)
        console.error(`Remove stale design exception (${count}): ${key}`);
      console.log(
        `Design check: ${diagnostics.length - unexpected.length} bounded legacy exceptions, ${unexpected.length} new violations, ${stale.length} stale exceptions.`,
      );
      if (unexpected.length || stale.length) process.exitCode = 1;
    }
  } catch (error) {
    console.error(
      "Design check failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  }
}
