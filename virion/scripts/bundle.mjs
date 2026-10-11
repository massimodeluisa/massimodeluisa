import { readFileSync } from "node:fs";

export function bundle(files) {
  return files
    .map((file) => readFileSync(file, "utf8"))
    .join("\n")
    .replace(/^import .*$/gm, "")
    .replace(/^export \{[\s\S]*?\};?\s*$/gm, "")
    .replace(/\bexport (async )?(function|const|class|let)/g, "$1$2");
}
