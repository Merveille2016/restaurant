import { listSourceFiles, readRoot, ok, fail } from "./lib.js";

const FORBIDDEN = [
  { pattern: /\uFFFD/, label: "replacement character U+FFFD" },
  { pattern: /[\u4e00-\u9fff]/, label: "CJK character" },
  { pattern: /[\u0400-\u04ff]/, label: "Cyrillic character" },
  { pattern: /aand/i, label: 'typo "aand"' },
  { pattern: /guiness/i, label: 'typo "guiness" (should be "guinness")' },
  { pattern: /malax\u00e8e/i, label: 'typo "Malaxèe"' },
  { pattern: /bush\s?meat/i, label: '"bushmeat" (removed for legal/reputation reasons)"' },
  { pattern: /my-restaurant/, label: '"my-restaurant" template name' },
];

export function run() {
  const errors = [];
  const files = ["index.html", ...listSourceFiles("src", [".js", ".jsx"])];

  for (const file of files) {
    const content = readRoot(file);
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      for (const rule of FORBIDDEN) {
        if (rule.pattern.test(line)) {
          errors.push(`${file}:${index + 1} ${rule.label}`);
        }
      }
    });
  }

  return errors.length === 0
    ? ok("check-text")
    : fail("check-text", errors);
}
