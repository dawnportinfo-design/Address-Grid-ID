import { existsSync,mkdirSync,readdirSync,readFileSync,rmSync,writeFileSync } from 'node:fs';
import { dirname,join } from 'node:path';

type HierarchyCountry = {
  code: string;
  addressFormatPath: string;
  addressFormat: unknown;
};

type HierarchyFile = {
  continent: string;
  subregions: Record<string, { countries: HierarchyCountry[] }>;
};

const root = process.cwd();
const addressFormatDir = join(root, 'src', 'data', 'address_formats');
const hierarchyDir = join(root, 'src', 'data', 'address_hierarchy');
const hierarchyFiles = ['africa.json', 'americas.json', 'antarctica.json', 'asia.json', 'europe.json', 'oceania.json', 'special.json'];

function safeSegment(segment: string) {
  return segment.replace(/[^A-Za-z0-9_-]/g, '_');
}

function removeRootJsonFiles() {
  for (const entry of readdirSync(addressFormatDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      rmSync(join(addressFormatDir, entry.name));
    }
  }
}

function main() {
  const written: string[] = [];

  for (const fileName of hierarchyFiles) {
    const hierarchy = JSON.parse(readFileSync(join(hierarchyDir, fileName), 'utf8')) as HierarchyFile;
    const continent = safeSegment(hierarchy.continent);

    for (const [subregionId, subregionBucket] of Object.entries(hierarchy.subregions)) {
      const subregion = safeSegment(subregionId);

      for (const country of subregionBucket.countries) {
        const targetRelative = join(continent, subregion, `${country.code}.json`);
        const targetPath = join(addressFormatDir, targetRelative);
        const currentPath = join(root, country.addressFormatPath);
        const rootPath = join(addressFormatDir, `${country.code}.json`);

        let content: string;
        if (existsSync(currentPath) && currentPath !== targetPath) {
          content = readFileSync(currentPath, 'utf8');
        } else if (existsSync(rootPath)) {
          content = readFileSync(rootPath, 'utf8');
        } else if (existsSync(targetPath)) {
          content = readFileSync(targetPath, 'utf8');
        } else {
          content = JSON.stringify(country.addressFormat, null, 2) + '\n';
        }

        mkdirSync(dirname(targetPath), { recursive: true });
        writeFileSync(targetPath, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
        written.push(targetRelative.replace(/\\/g, '/'));
      }
    }
  }

  removeRootJsonFiles();
  console.log(`Organized ${written.length} address format JSON files under continent/subregion directories.`);
  console.log(`Examples: ${written.slice(0, 5).join(', ')}`);
}

main();
