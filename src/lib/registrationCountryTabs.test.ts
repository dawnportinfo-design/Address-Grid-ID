import assert from 'node:assert/strict';
import { test } from 'node:test';

import { COUNTRIES } from '../constants/countries';
import {
REGISTRATION_COUNTRY_TABS,
getRegistrationCountryTabId,
groupRegistrationCountriesByTab,
} from './registrationCountryTabs';

test('groups address registration countries into continent tabs', () => {
  const grouped = groupRegistrationCountriesByTab(COUNTRIES);
  const tabIds = REGISTRATION_COUNTRY_TABS.map(tab => tab.id);

  assert.deepEqual(tabIds, ['asia', 'europe', 'africa', 'americas', 'oceania', 'polar']);
  assert.equal(getRegistrationCountryTabId({ region: 'East Asia' }), 'asia');
  assert.equal(getRegistrationCountryTabId({ region: 'Caucasus' }), 'europe');
  assert.equal(getRegistrationCountryTabId({ region: 'Europe' }), 'europe');
  assert.equal(getRegistrationCountryTabId({ region: 'South America' }), 'americas');
  assert.equal(getRegistrationCountryTabId({ region: 'Antarctica' }), 'polar');

  for (const tab of REGISTRATION_COUNTRY_TABS) {
    assert.ok(grouped[tab.id].length > 0, `${tab.id} should have selectable countries`);
  }

  const groupedCount = Object.values(grouped).reduce((sum, countries) => sum + countries.length, 0);
  assert.equal(groupedCount, COUNTRIES.length);
});
