import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  buildPostalCountryBuildQueue,
  validatePostalCountryBuildQueue,
} from '../src/lib/postalCountryBuildQueue';

const OUTPUT_ROOT = join(process.cwd(), 'data', 'postal_country_packs');
const GENERATED_AT = process.env.AGID_POSTAL_COUNTRY_BUILD_QUEUE_GENERATED_AT || '2026-07-23T02:52:01.274Z';

async function main() {
  const queue = buildPostalCountryBuildQueue({ generatedAt: GENERATED_AT });
  const validation = validatePostalCountryBuildQueue(queue);
  if (!validation.valid) {
    throw new Error(`Postal country build queue is invalid: ${validation.errors.join(', ')}`);
  }

  await mkdir(OUTPUT_ROOT, { recursive: true });
  await writeFile(join(OUTPUT_ROOT, 'build-queue.json'), `${JSON.stringify(queue, null, 2)}\n`, 'utf8');
  console.log(`Postal country build queue exported: items=${queue.items.length}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
