import { mkdir,readdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
convertLibaddressinputMetadata,
resolveAddressFormatMetadataPath,
} from '../src/lib/openSourceAddressMetadata';

const ADDRESS_DATA_BASE = 'https://chromium-i18n.appspot.com/ssl-address/data';
const DEFAULT_COUNTRIES = ['JP', 'US', 'CA', 'FR', 'DE', 'BR'];
const OUTPUT_DIR = path.resolve('src/data/address_formats');

async function listJsonPaths(dir: string, baseDir = dir): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listJsonPaths(fullPath, baseDir);
    if (entry.isFile() && entry.name.endsWith('.json')) {
      return [path.relative(baseDir, fullPath).replace(/\\/g, '/')];
    }
    return [];
  }));
  return nested.flat();
}

async function fetchMetadata(key: string) {
  const response = await fetch(`${ADDRESS_DATA_BASE}/${encodeURIComponent(key).replace(/%2F/g, '/')}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${key}: ${response.status}`);
  }
  return response.json();
}

async function syncCountry(countryCode: string) {
  const code = countryCode.toUpperCase();
  const metadata = await fetchMetadata(code);
  let englishMetadata = metadata;

  try {
    englishMetadata = await fetchMetadata(`${code}--en`);
  } catch {
    englishMetadata = metadata;
  }

  const format = convertLibaddressinputMetadata({
    countryCode: code,
    metadata,
    englishMetadata,
  });

  await mkdir(OUTPUT_DIR, { recursive: true });
  const knownPaths = await listJsonPaths(OUTPUT_DIR).catch(() => []);
  const relativeOutputPath = resolveAddressFormatMetadataPath(code, knownPaths);
  const outputPath = path.join(OUTPUT_DIR, relativeOutputPath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(format, null, 2)}\n`,
    'utf8'
  );

  return code;
}

async function main() {
  const countries = process.argv.slice(2).map(code => code.toUpperCase());
  const targets = countries.length ? countries : DEFAULT_COUNTRIES;

  for (const countryCode of targets) {
    const code = await syncCountry(countryCode);
    console.log(`Synced libaddressinput metadata for ${code}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
