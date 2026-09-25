// Fails when en.json and ar.json do not define exactly the same keys, or when a template
// references (via an `<!-- i18n: key -->` comment) a key that en.json does not define.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'apps/portal/public/i18n';
const flatten = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' ? flatten(child, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
const keysOf = (lang) => new Set(flatten(JSON.parse(readFileSync(join(dir, `${lang}.json`), 'utf8'))));

const en = keysOf('en');
const ar = keysOf('ar');
const problems = [
  ...[...en].filter((key) => !ar.has(key)).map((key) => `missing in ar.json: ${key}`),
  ...[...ar].filter((key) => !en.has(key)).map((key) => `missing in en.json: ${key}`),
];

const templates = (root) =>
  readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : templates(path);
    return path.endsWith('.html') ? [path] : [];
  });

const KEY = /^[a-zA-Z_]+(\.[a-zA-Z_]+)+$/;
for (const file of [...templates('apps'), ...templates('libs')]) {
  for (const [, body] of readFileSync(file, 'utf8').matchAll(/<!-- i18n: (.*?) -->/g)) {
    const referenced = body
      .replace(/\(.*?\)/g, '')
      .split(/[,|/]/)
      .map((part) => part.trim())
      .filter((part) => KEY.test(part) && !part.endsWith('.'));
    for (const key of referenced) {
      const isPrefix = [...en].some((known) => known.startsWith(`${key}.`));
      if (!en.has(key) && !isPrefix) problems.push(`${file}: unknown key ${key}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`i18n OK: ${en.size} keys in en.json and ar.json`);
