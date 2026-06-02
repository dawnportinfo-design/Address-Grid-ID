import { readdirSync,readFileSync,writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stringify } from 'yaml';

const addressFormatDir = join(process.cwd(), 'src', 'data', 'address_formats');

function collectJsonFiles(dir = addressFormatDir): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

function main() {
  const jsonFiles = collectJsonFiles();
  for (const jsonPath of jsonFiles) {
    const value = JSON.parse(readFileSync(jsonPath, 'utf8'));
    const yamlPath = jsonPath.replace(/\.json$/, '.yaml');
    writeFileSync(yamlPath, stringify(value, { lineWidth: 0 }), 'utf8');
  }
  console.log(`Generated ${jsonFiles.length} address format YAML files next to country JSON files.`);
}

main();
