import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname,join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'AddressRegistration.tsx'), 'utf8');

test('Address Registration header does not render the app language shortcut tabs', () => {
  assert.doesNotMatch(source, /App Language Toggle/);
  assert.doesNotMatch(source, /setAppLanguage\(lang\)/);
  assert.doesNotMatch(source, /\(\['en', 'ja', 'de', 'zh-Hant', 'zh-Hans', 'es', 'pt', 'fr', 'ar'\] as const\)\.map/);
});

test('Address Registration opens as a full-screen surface instead of a centered modal', () => {
  assert.match(source, /className="fixed inset-0 z-\[101\] overflow-y-auto bg-white/);
  assert.doesNotMatch(source, /top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2/);
  assert.doesNotMatch(source, /bg-slate-900\/60 backdrop-blur-sm z-\[100\]/);
  assert.doesNotMatch(source, /max-h-\[90vh\]/);
});

test('Address Registration keeps app language, address language, and country selection as separate inputs', () => {
  assert.match(source, /appLanguage\?: string;/);
  assert.match(source, /addressLanguage\?: string;/);
  assert.doesNotMatch(source, /const \[appLanguage\]\s*=\s*useState/);
  assert.match(source, /normalizeRegistrationUiLanguage\(appLanguage\)/);
  assert.match(source, /normalizeRegistrationAddressLanguage\(addressLanguage\)/);
  assert.match(source, /selectRegistrationCountry\(formData,/);
  assert.doesNotMatch(source, /setActiveTab\(c\.code\)/);
  assert.doesNotMatch(source, /setActiveTab\(t\.code\)/);
});

test('Address Language tabs come from the selected country address format only', () => {
  assert.match(source, /buildRegistrationAddressLanguageTabs\(localFormat, formData\.country\)/);
  assert.match(source, /selectRegistrationAddressFormat\(localFormat, activeTab\)/);
  assert.doesNotMatch(source, /const quickLangs\s*=\s*useMemo/);
  assert.doesNotMatch(source, /setViewMode\('language-select'\)/);
  assert.doesNotMatch(source, /Other\.\.\./);
});

test('international English preview uses the shipping renderer while domestic English stays domestic', () => {
  assert.match(source, /activeTab === 'en'\s*\?\s*'intl_en'\s*:\s*activeTab/);
  assert.match(source, /activeTab === 'en'\s*\?\s*'International Shipping Label'\s*:\s*'Domestic Delivery Format'/);
});

test('postcode field uses country postal-code metadata instead of a hard-coded pattern', () => {
  assert.match(source, /getPostcodeInputConfig\(localFormat\)/);
  assert.match(source, /format=\{postcodeInputConfig\.pattern/);
  assert.match(source, /fixedValue=\{postcodeInputConfig\.fixedValue/);
  assert.doesNotMatch(source, /format="7-digit"/);
});

test('postcode input triggers open-source autofill when the country postcode is complete', () => {
  assert.match(source, /isPostcodeReadyForAutofill\(localFormat, formData\.postcode\)/);
  assert.match(source, /lookupPostcodeAutofill\(formData\.country, formData\.postcode\)/);
  assert.match(source, /mergePostcodeAutofill\(prev, patch\)/);
});

test('address language tab clicks translate form fields automatically', () => {
  assert.match(source, /handleAddressLanguageTabClick/);
  assert.match(source, /translateRegistrationFormFields\(/);
  assert.match(source, /onClick=\{\(\) => handleAddressLanguageTabClick\(tab\.code\)\}/);
});

test('postcode autofill and language tabs do not keep stale drafts', () => {
  assert.match(source, /buildPostcodeAutofillLanguageDrafts\(\{/);
  assert.match(source, /languageTabs: addressLanguageTabs\.map\(tab => tab\.code\)/);
  assert.match(source, /languageDraftsRef\.current = \{[\s\S]*\.\.\.drafts,[\s\S]*\[activeTab\]: next,[\s\S]*\};/);
  assert.match(source, /languageDraftsRef\.current = \{\};/);
  assert.match(source, /if \(tabCode === 'local' && savedDraft\)/);
  assert.doesNotMatch(source, /if \(savedDraft\) \{\s*setFormData\(savedDraft\)/);
});

test('Address Registration can prefill building names from reverse geocode details', () => {
  assert.match(source, /initialAddressDetails\?: any;/);
  assert.match(source, /initialAddressDetails\?\.address_analysis\?\.canonical/);
  assert.match(source, /organization: details\.building \|\| details\.building_en \|\| details\.organization \|\| details\.poi \|\| prev\.organization/);
});
