import { listSourceFiles, readRoot, ok, fail } from "./lib.js";

const CLASS_RE = /className=(?:"([^"]*)"|\{`([^`]*)`\})/g;

function collectClassNames(files) {
  const names = new Set();
  for (const file of files) {
    const content = readRoot(file);
    for (const match of content.matchAll(CLASS_RE)) {
      const raw = match[1] ?? match[2] ?? "";
      const tokens = raw
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => /^[A-Za-z][\w-]*$/.test(token));
      tokens.forEach((token) => names.add(token));
      for (const inner of raw.matchAll(/'([A-Za-z][\w-]*)'/g)) {
        names.add(inner[1]);
      }
    }
  }
  return names;
}

function collectDefinedClasses(css) {
  const defined = new Set();
  for (const match of css.matchAll(/\.([A-Za-z][\w-]*)/g)) {
    defined.add(match[1]);
  }
  return defined;
}

function collectUsedVariables(files) {
  const used = new Set();
  for (const file of files) {
    const content = readRoot(file);
    for (const match of content.matchAll(/var\((--[\w-]+)/g)) {
      used.add(match[1]);
    }
  }
  return used;
}

function collectDefinedVariables(cssFiles) {
  const defined = new Set();
  for (const file of cssFiles) {
    const content = readRoot(file);
    for (const match of content.matchAll(/(--[\w-]+)\s*:/g)) {
      defined.add(match[1]);
    }
  }
  return defined;
}

export function run() {
  const errors = [];
  const warnings = [];

  const jsxFiles = listSourceFiles("src", [".jsx"]);
  const jsFiles = listSourceFiles("src", [".js"]);
  const cssFiles = ["src/index.css", "src/App.css"];
  const css = cssFiles.map(readRoot).join("\n");

  const usedClasses = collectClassNames(jsxFiles);
  const definedClasses = collectDefinedClasses(css);

  for (const name of usedClasses) {
    if (!definedClasses.has(name)) {
      errors.push(`class ".${name}" used in JSX but not defined in CSS`);
    }
  }

  const usedVars = collectUsedVariables([...jsxFiles, ...jsFiles, ...cssFiles]);
  const definedVars = collectDefinedVariables(cssFiles);
  for (const variable of usedVars) {
    if (!definedVars.has(variable)) {
      errors.push(`CSS variable "${variable}" used but never defined`);
    }
  }

  return errors.length === 0
    ? ok("check-css")
    : fail("check-css", errors, warnings);
}
