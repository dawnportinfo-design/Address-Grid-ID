import assert from 'node:assert/strict';
import { readdirSync,readFileSync } from 'node:fs';
import { basename,join } from 'node:path';
import { test } from 'node:test';

import { LANGUAGES } from './addressUtils';
import {
getAgidAddressTabLanguages,
normalizeAgidLanguageCode,
} from './languageTabs';

const addressFormatDir = join(process.cwd(), 'src', 'data', 'address_formats');

type AddressRules = {
  languages: { code: string; name: string }[];
};

function collectAddressFormatPaths(dir = addressFormatDir): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectAddressFormatPaths(fullPath));
    if (entry.isFile() && entry.name.endsWith('.json')) files.push(fullPath);
  }
  return files.sort();
}

test('normalizes regional and script-specific language tags for address tabs', () => {
  assert.equal(normalizeAgidLanguageCode('en-CA'), 'en');
  assert.equal(normalizeAgidLanguageCode('pt-BR'), 'pt');
  assert.equal(normalizeAgidLanguageCode('zh-Hant-TW'), 'zh-Hant');
  assert.equal(normalizeAgidLanguageCode('zh-Hans-CN'), 'zh-Hans');
  assert.equal(normalizeAgidLanguageCode('fa-AF'), 'fa');
});

test('all country addressRules native languages can produce compatible tabs without throwing', () => {
  const knownLanguageCodes = LANGUAGES.map(language => language.code);
  const missing: string[] = [];

  for (const filePath of collectAddressFormatPaths()) {
    const countryCode = basename(filePath, '.json');
    const format = JSON.parse(readFileSync(filePath, 'utf8')) as { addressRules?: AddressRules };
    const languageCodes = format.addressRules?.languages.map(language => language.code) || [];

    assert.doesNotThrow(() => getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: languageCodes,
      knownLanguageCodes,
    }));

    const tabs = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: languageCodes,
      knownLanguageCodes,
    });
    assert.ok(tabs.length >= 1, `${countryCode} should expose at least one address tab`);
    assert.ok(tabs.every(tab => normalizeAgidLanguageCode(tab).length > 0), `${countryCode} should normalize every tab`);

    const primaryNative = languageCodes.find(code => normalizeAgidLanguageCode(code) !== 'en');
    if (primaryNative) {
      const normalizedPrimary = normalizeAgidLanguageCode(primaryNative);
      const normalizedTabs = new Set(tabs.map(normalizeAgidLanguageCode));
      const isEnglishPrimary = normalizeAgidLanguageCode(tabs[0]) === 'en';
      if (!isEnglishPrimary && !normalizedTabs.has(normalizedPrimary) && knownLanguageCodes.map(normalizeAgidLanguageCode).includes(normalizedPrimary)) {
        missing.push(`${countryCode}:${primaryNative}->${normalizedPrimary}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});
