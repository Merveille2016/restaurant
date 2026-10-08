import { run as checkMenuData } from "./check-menu-data.js";
import { run as checkImages } from "./check-images.js";
import { run as checkHtml } from "./check-html.js";
import { run as checkI18n } from "./check-i18n.js";
import { run as checkText } from "./check-text.js";
import { run as checkCss } from "./check-css.js";

const CHECKS = [checkMenuData, checkImages, checkHtml, checkI18n, checkText, checkCss];

let failed = 0;

for (const check of CHECKS) {
  const result = check();
  const status = result.ok ? "PASS" : "FAIL";
  console.log(`[${status}] ${result.name}`);

  for (const error of result.errors) {
    console.log(`  error: ${error}`);
  }
  for (const warning of result.warnings) {
    console.log(`  warning: ${warning}`);
  }
  if (!result.ok) failed += 1;
}

console.log("");
if (failed > 0) {
  console.log(`${failed} check(s) failed.`);
  process.exit(1);
}
console.log("All checks passed.");
