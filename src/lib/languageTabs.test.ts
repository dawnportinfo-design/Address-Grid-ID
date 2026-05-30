import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  EXPANDING_CIRCLE_ENGLISH_COUNTRIES,
  INNER_CIRCLE_ENGLISH_COUNTRIES,
  OUTER_CIRCLE_ENGLISH_COUNTRIES,
  getEnglishAddressCircle,
  getExpandingCircleEnglishPreparation,
  getAgidAddressDisplayTabs,
  getAgidAddressTabLanguages,
} from './languageTabs';

test('uses only the primary native language and English for non-English countries', () => {
  assert.deepEqual(
    getAgidAddressTabLanguages({
      countryCode: 'fr',
      countryLanguages: ['fr', 'br', 'oc', 'co'],
      knownLanguageCodes: ['fr', 'br', 'oc', 'co', 'en'],
    }),
    ['fr', 'en']
  );
});

test('normalizes regional English into English plus domestic English for countries where English is the native language', () => {
  assert.deepEqual(
    getAgidAddressTabLanguages({
      countryCode: 'gb',
      countryLanguages: ['en-GB', 'en', 'cy', 'gd'],
      knownLanguageCodes: ['en-GB', 'en', 'cy', 'gd'],
    }),
    ['en', 'cy', 'gd', 'en_domestic']
  );
});

test('adds Spanish for the United States while keeping English address tabs', () => {
  const languages = getAgidAddressTabLanguages({
    countryCode: 'us',
    countryLanguages: ['en', 'es'],
    knownLanguageCodes: ['en', 'es'],
  });

  assert.deepEqual(languages, ['en', 'es', 'en_domestic']);
  assert.deepEqual(getAgidAddressDisplayTabs(languages), ['en', 'es', 'en_domestic', 'intl_en']);
});

test('adds French for Canada while normalizing Canadian English to English', () => {
  const languages = getAgidAddressTabLanguages({
    countryCode: 'ca',
    countryLanguages: ['en', 'en-CA', 'fr'],
    knownLanguageCodes: ['en', 'en-CA', 'fr'],
  });

  assert.deepEqual(languages, ['en', 'fr', 'en_domestic']);
  assert.deepEqual(getAgidAddressDisplayTabs(languages), ['en', 'fr', 'en_domestic', 'intl_en']);
});

test('uses domestic and international English tabs for English-only countries', () => {
  const languages = getAgidAddressTabLanguages({
    countryCode: 'au',
    countryLanguages: ['en-AU', 'en'],
    knownLanguageCodes: ['en-AU', 'en'],
  });

  assert.deepEqual(languages, ['en', 'en_domestic']);
  assert.deepEqual(getAgidAddressDisplayTabs(languages), ['en', 'en_domestic', 'intl_en']);
});

test('adds international shipping English display tab for English-speaking countries', () => {
  assert.deepEqual(
    getAgidAddressDisplayTabs(['en', 'en_domestic']),
    ['en', 'en_domestic', 'intl_en']
  );
});

test('uses intl_en instead of carrier for the international shipping English tab', () => {
  assert.deepEqual(
    getAgidAddressDisplayTabs(['en', 'en_domestic']),
    ['en', 'en_domestic', 'intl_en']
  );
  assert.deepEqual(
    getAgidAddressDisplayTabs(['en', 'en_domestic', 'carrier']),
    ['en', 'en_domestic', 'intl_en']
  );
});

test('treats representative Inner Circle countries as English-primary from country code alone', () => {
  assert.deepEqual(INNER_CIRCLE_ENGLISH_COUNTRIES, ['us', 'gb', 'ca', 'au', 'nz', 'ie']);

  const expectedByCountry: Record<string, string[]> = {
    us: ['en', 'es', 'en_domestic'],
    gb: ['en', 'en_domestic'],
    ca: ['en', 'fr', 'en_domestic'],
    au: ['en', 'en_domestic'],
    nz: ['en', 'en_domestic'],
    ie: ['en', 'en_domestic'],
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    assert.deepEqual(
      getAgidAddressTabLanguages({
        countryCode,
        countryLanguages: [],
        knownLanguageCodes: ['en', 'es', 'fr'],
      }),
      expected
    );
  }
});

test('adds domestic and international shipping English for Outer Circle address countries', () => {
  assert.deepEqual(OUTER_CIRCLE_ENGLISH_COUNTRIES, [
    'in', 'pk', 'bd', 'lk', 'np', 'bt', 'mv',
    'sg', 'my', 'ph', 'bn', 'mm',
    'hk',
    'ng', 'gh', 'sl', 'lr', 'gm', 'cm',
    'er', 'et', 'ke', 'mu', 'rw', 'sc', 'so', 'ss', 'tz', 'ug',
    'za', 'zw', 'zm', 'bw', 'na', 'mw', 'ls', 'sz',
    'jm', 'tt', 'bb', 'bs', 'bz', 'gy', 'ag', 'lc', 'gd', 'dm', 'vc', 'kn',
    'pg', 'fj', 'sb', 'vu', 'ws', 'to',
    'fm', 'pw', 'mh', 'ki', 'tv', 'nr',
    'nf', 'cx', 'cc', 'ck', 'tk', 'nu', 'pn', 'aq',
    'ae', 'qa', 'bh',
  ]);

  for (const countryCode of OUTER_CIRCLE_ENGLISH_COUNTRIES) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['en'],
    });

    assert.deepEqual(languages, ['en', 'en_domestic']);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), ['en', 'en_domestic', 'intl_en']);
  }
});

test('keeps native plus strengthened English tabs for Outer Circle multilingual countries', () => {
  const languages = getAgidAddressTabLanguages({
    countryCode: 'hk',
    countryLanguages: ['zh', 'en-HK'],
    knownLanguageCodes: ['zh', 'en-HK', 'en'],
  });

  assert.deepEqual(languages, ['zh', 'en', 'en_domestic']);
  assert.deepEqual(getAgidAddressDisplayTabs(languages), ['zh', 'en', 'en_domestic', 'intl_en']);
});

test('keeps native-language tabs for English-primary countries that also use local languages', () => {
  const expectedByCountry: Record<string, { countryLanguages: string[]; knownLanguageCodes: string[]; languages: string[]; displayTabs: string[] }> = {
    gb: {
      countryLanguages: ['en-GB', 'en', 'cy', 'gd'],
      knownLanguageCodes: ['en', 'cy', 'gd'],
      languages: ['en', 'cy', 'gd', 'en_domestic'],
      displayTabs: ['en', 'cy', 'gd', 'en_domestic', 'intl_en'],
    },
    sg: {
      countryLanguages: ['en-SG', 'en', 'zh-Hans', 'ms', 'ta'],
      knownLanguageCodes: ['en', 'zh-Hans', 'ms', 'ta'],
      languages: ['en', 'zh-Hans', 'ms', 'ta', 'en_domestic'],
      displayTabs: ['en', 'zh-Hans', 'ms', 'ta', 'en_domestic', 'intl_en'],
    },
    za: {
      countryLanguages: ['en-ZA', 'en', 'af', 'zu', 'xh'],
      knownLanguageCodes: ['en', 'af', 'zu', 'xh'],
      languages: ['en', 'af', 'zu', 'xh', 'en_domestic'],
      displayTabs: ['en', 'af', 'zu', 'xh', 'en_domestic', 'intl_en'],
    },
    ke: {
      countryLanguages: [],
      knownLanguageCodes: ['en', 'sw'],
      languages: ['en', 'sw', 'en_domestic'],
      displayTabs: ['en', 'sw', 'en_domestic', 'intl_en'],
    },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: expected.countryLanguages,
      knownLanguageCodes: expected.knownLanguageCodes,
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('keeps country-provided native tabs for South Asian English address markets', () => {
  const languages = getAgidAddressTabLanguages({
    countryCode: 'in',
    countryLanguages: ['hi', 'en-IN', 'en', 'bn', 'ta', 'ur'],
    knownLanguageCodes: ['hi', 'en', 'bn', 'ta', 'ur'],
  });

  assert.deepEqual(languages, ['en', 'hi', 'bn', 'ta', 'ur', 'en_domestic']);
  assert.deepEqual(getAgidAddressDisplayTabs(languages), ['en', 'hi', 'bn', 'ta', 'ur', 'en_domestic', 'intl_en']);
});

test('classifies Expanding Circle countries separately from Inner and Outer Circle address markets', () => {
  assert.ok(EXPANDING_CIRCLE_ENGLISH_COUNTRIES.includes('jp'));
  assert.ok(EXPANDING_CIRCLE_ENGLISH_COUNTRIES.includes('de'));
  assert.ok(EXPANDING_CIRCLE_ENGLISH_COUNTRIES.includes('br'));

  assert.equal(getEnglishAddressCircle('us'), 'inner');
  assert.equal(getEnglishAddressCircle('in'), 'outer');
  assert.equal(getEnglishAddressCircle('jp'), 'expanding');
  assert.equal(getEnglishAddressCircle('de'), 'expanding');
});

test('keeps Expanding Circle tabs to native plus English without domestic international shipping tabs', () => {
  const languages = getAgidAddressTabLanguages({
    countryCode: 'jp',
    countryLanguages: ['ja'],
    knownLanguageCodes: ['ja', 'en'],
  });

  assert.deepEqual(languages, ['ja', 'en']);
  assert.deepEqual(getAgidAddressDisplayTabs(languages), ['ja', 'en']);
});

test('adds English tabs for Myanmar, Thailand, Vietnam, Cambodia, Laos, and Malaysia from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    mm: { languages: ['my', 'en', 'en_domestic'], displayTabs: ['my', 'en', 'en_domestic', 'intl_en'] },
    th: { languages: ['th', 'en'], displayTabs: ['th', 'en'] },
    vn: { languages: ['vi', 'en'], displayTabs: ['vi', 'en'] },
    kh: { languages: ['km', 'en'], displayTabs: ['km', 'en'] },
    la: { languages: ['lo', 'en'], displayTabs: ['lo', 'en'] },
    my: { languages: ['ms', 'en', 'en_domestic'], displayTabs: ['ms', 'en', 'en_domestic', 'intl_en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['my', 'th', 'vi', 'km', 'lo', 'ms', 'en'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds English tabs for Singapore, Indonesia, Philippines, Brunei, and Timor-Leste from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    sg: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    id: { languages: ['id', 'en'], displayTabs: ['id', 'en'] },
    ph: { languages: ['tl', 'en', 'en_domestic'], displayTabs: ['tl', 'en', 'en_domestic', 'intl_en'] },
    bn: { languages: ['ms', 'en', 'en_domestic'], displayTabs: ['ms', 'en', 'en_domestic', 'intl_en'] },
    tl: { languages: ['tet', 'en'], displayTabs: ['tet', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['en', 'id', 'tl', 'ms', 'tet', 'pt-PT'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds strengthened English tabs for South Asia from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    in: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    pk: { languages: ['ur', 'en', 'en_domestic'], displayTabs: ['ur', 'en', 'en_domestic', 'intl_en'] },
    bd: { languages: ['bn', 'en', 'en_domestic'], displayTabs: ['bn', 'en', 'en_domestic', 'intl_en'] },
    np: { languages: ['ne', 'en', 'en_domestic'], displayTabs: ['ne', 'en', 'en_domestic', 'intl_en'] },
    lk: { languages: ['si', 'en', 'en_domestic'], displayTabs: ['si', 'en', 'en_domestic', 'intl_en'] },
    bt: { languages: ['dz', 'en', 'en_domestic'], displayTabs: ['dz', 'en', 'en_domestic', 'intl_en'] },
    mv: { languages: ['dv', 'en', 'en_domestic'], displayTabs: ['dv', 'en', 'en_domestic', 'intl_en'] },
    af: { languages: ['ps', 'en'], displayTabs: ['ps', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['en', 'ur', 'bn', 'ne', 'si', 'dz', 'dv', 'ps', 'fa-AF'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds native plus English tabs for West Asia from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    tr: { languages: ['tr', 'en'], displayTabs: ['tr', 'en'] },
    ir: { languages: ['fa', 'en'], displayTabs: ['fa', 'en'] },
    iq: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    sy: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    lb: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    jo: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    il: { languages: ['he', 'en'], displayTabs: ['he', 'en'] },
    ps: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    sa: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    ae: { languages: ['ar', 'en', 'en_domestic'], displayTabs: ['ar', 'en', 'en_domestic', 'intl_en'] },
    qa: { languages: ['ar', 'en', 'en_domestic'], displayTabs: ['ar', 'en', 'en_domestic', 'intl_en'] },
    bh: { languages: ['ar', 'en', 'en_domestic'], displayTabs: ['ar', 'en', 'en_domestic', 'intl_en'] },
    kw: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    om: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    ye: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['ar', 'en', 'fa', 'he', 'tr'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds native plus English tabs for Central Asia from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    kz: { languages: ['kk', 'en'], displayTabs: ['kk', 'en'] },
    uz: { languages: ['uz', 'en'], displayTabs: ['uz', 'en'] },
    tm: { languages: ['tk', 'en'], displayTabs: ['tk', 'en'] },
    kg: { languages: ['ky', 'en'], displayTabs: ['ky', 'en'] },
    tj: { languages: ['tg', 'en'], displayTabs: ['tg', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['kk', 'uz', 'tk', 'ky', 'tg', 'ru', 'en'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds Oceania English and local-language tabs from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    au: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    nz: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    fj: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    pg: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    ws: { languages: ['sm', 'en', 'en_domestic'], displayTabs: ['sm', 'en', 'en_domestic', 'intl_en'] },
    to: { languages: ['to', 'en', 'en_domestic'], displayTabs: ['to', 'en', 'en_domestic', 'intl_en'] },
    vu: { languages: ['bi', 'en', 'en_domestic'], displayTabs: ['bi', 'en', 'en_domestic', 'intl_en'] },
    sb: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    fm: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    pw: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    nf: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    cx: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    cc: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    ck: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    tk: { languages: ['tkl', 'en', 'en_domestic'], displayTabs: ['tkl', 'en', 'en_domestic', 'intl_en'] },
    nu: { languages: ['niu', 'en', 'en_domestic'], displayTabs: ['niu', 'en', 'en_domestic', 'intl_en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['en', 'sm', 'to', 'bi', 'tkl', 'niu'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds Western Europe native plus English tabs from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    fr: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    de: { languages: ['de', 'en'], displayTabs: ['de', 'en'] },
    nl: { languages: ['nl', 'en'], displayTabs: ['nl', 'en'] },
    be: { languages: ['nl', 'fr', 'de', 'en'], displayTabs: ['nl', 'fr', 'de', 'en'] },
    ch: { languages: ['de', 'fr', 'it', 'rm', 'en'], displayTabs: ['de', 'fr', 'it', 'rm', 'en'] },
    at: { languages: ['de', 'en'], displayTabs: ['de', 'en'] },
    li: { languages: ['de', 'en'], displayTabs: ['de', 'en'] },
    ie: { languages: ['en', 'ga', 'en_domestic'], displayTabs: ['en', 'ga', 'en_domestic', 'intl_en'] },
    gp: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    pf: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    nc: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    wf: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    cp: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['fr', 'de', 'nl', 'it', 'rm', 'en', 'ga'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds Nordic and Baltic native plus English tabs from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    se: { languages: ['sv', 'en'], displayTabs: ['sv', 'en'] },
    no: { languages: ['no', 'en'], displayTabs: ['no', 'en'] },
    dk: { languages: ['da', 'en'], displayTabs: ['da', 'en'] },
    fi: { languages: ['fi', 'sv', 'en'], displayTabs: ['fi', 'sv', 'en'] },
    lv: { languages: ['lv', 'en'], displayTabs: ['lv', 'en'] },
    ee: { languages: ['et', 'en'], displayTabs: ['et', 'en'] },
    lt: { languages: ['lt', 'en'], displayTabs: ['lt', 'en'] },
    is: { languages: ['is', 'en'], displayTabs: ['is', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['sv', 'no', 'da', 'fi', 'lv', 'et', 'lt', 'is', 'en'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds Southern Europe native plus English tabs from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    it: { languages: ['it', 'en'], displayTabs: ['it', 'en'] },
    es: { languages: ['es', 'ca', 'gl', 'eu', 'en'], displayTabs: ['es', 'ca', 'gl', 'eu', 'en'] },
    pt: { languages: ['pt', 'en'], displayTabs: ['pt', 'en'] },
    gr: { languages: ['el', 'en'], displayTabs: ['el', 'en'] },
    mt: { languages: ['mt', 'en'], displayTabs: ['mt', 'en'] },
    sm: { languages: ['it', 'en'], displayTabs: ['it', 'en'] },
    mc: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    va: { languages: ['it', 'en'], displayTabs: ['it', 'en'] },
    ad: { languages: ['ca', 'en'], displayTabs: ['ca', 'en'] },
    cy: { languages: ['el', 'tr', 'en'], displayTabs: ['el', 'tr', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['it', 'es', 'pt', 'el', 'mt', 'fr', 'ca', 'gl', 'eu', 'tr', 'en'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds Eastern Europe native plus English tabs from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    ro: { languages: ['ro', 'en'], displayTabs: ['ro', 'en'] },
    bg: { languages: ['bg', 'en'], displayTabs: ['bg', 'en'] },
    ua: { languages: ['uk', 'en'], displayTabs: ['uk', 'en'] },
    md: { languages: ['ro', 'en'], displayTabs: ['ro', 'en'] },
    by: { languages: ['be', 'en'], displayTabs: ['be', 'en'] },
    ru: { languages: ['ru', 'en'], displayTabs: ['ru', 'en'] },
    rs: { languages: ['sr', 'en'], displayTabs: ['sr', 'en'] },
    ba: { languages: ['bs', 'hr', 'sr', 'en'], displayTabs: ['bs', 'hr', 'sr', 'en'] },
    me: { languages: ['cnr', 'en'], displayTabs: ['cnr', 'en'] },
    xk: { languages: ['sq', 'en'], displayTabs: ['sq', 'en'] },
    al: { languages: ['sq', 'en'], displayTabs: ['sq', 'en'] },
    mk: { languages: ['mk', 'en'], displayTabs: ['mk', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['ro', 'bg', 'uk', 'be', 'ru', 'sr', 'bs', 'hr', 'cnr', 'sq', 'mk', 'en'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds overseas territory and autonomous-region language tabs for NL, DK, NO, ES, and PT', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    bq: { languages: ['nl', 'en'], displayTabs: ['nl', 'en'] },
    aw: { languages: ['nl', 'en'], displayTabs: ['nl', 'en'] },
    cw: { languages: ['nl', 'en'], displayTabs: ['nl', 'en'] },
    sx: { languages: ['nl', 'en'], displayTabs: ['nl', 'en'] },
    gl: { languages: ['kl', 'en'], displayTabs: ['kl', 'en'] },
    fo: { languages: ['fo', 'en'], displayTabs: ['fo', 'en'] },
    sj_sva: { languages: ['no', 'en'], displayTabs: ['no', 'en'] },
    sj_jan: { languages: ['no', 'en'], displayTabs: ['no', 'en'] },
    es_bal: { languages: ['es', 'en'], displayTabs: ['es', 'en'] },
    es_can: { languages: ['es', 'en'], displayTabs: ['es', 'en'] },
    pt_azo: { languages: ['pt', 'en'], displayTabs: ['pt', 'en'] },
    pt_mad: { languages: ['pt', 'en'], displayTabs: ['pt', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['nl', 'pap', 'en', 'kl', 'da', 'fo', 'no', 'es', 'ca', 'pt'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds Caucasus native plus English tabs from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    am: { languages: ['hy', 'en'], displayTabs: ['hy', 'en'] },
    az: { languages: ['az', 'en'], displayTabs: ['az', 'en'] },
    ge: { languages: ['ka', 'en'], displayTabs: ['ka', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['hy', 'az', 'ka', 'en'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds North Africa native plus English tabs from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    eg: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    dz: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    ma: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    tn: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    ly: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    sd: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    mr: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
    eh: { languages: ['ar', 'en'], displayTabs: ['ar', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['ar', 'fr', 'en'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds West Africa English or native plus English tabs from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    ng: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    gh: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    ci: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    sn: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    bf: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    ml: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    ne: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    tg: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    bj: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    lr: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    sl: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    gm: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    gn: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    gw: { languages: ['pt', 'en'], displayTabs: ['pt', 'en'] },
    cv: { languages: ['pt', 'en'], displayTabs: ['pt', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['en', 'fr', 'pt'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds East Africa domestic and international English tabs where English is strong for delivery', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    km: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    dj: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    er: { languages: ['ti', 'en', 'en_domestic'], displayTabs: ['ti', 'en', 'en_domestic', 'intl_en'] },
    et: { languages: ['am', 'en', 'en_domestic'], displayTabs: ['am', 'en', 'en_domestic', 'intl_en'] },
    ke: { languages: ['en', 'sw', 'en_domestic'], displayTabs: ['en', 'sw', 'en_domestic', 'intl_en'] },
    mg: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    mw: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    mu: { languages: ['en', 'fr', 'en_domestic'], displayTabs: ['en', 'fr', 'en_domestic', 'intl_en'] },
    mz: { languages: ['pt', 'en'], displayTabs: ['pt', 'en'] },
    rw: { languages: ['en', 'fr', 'sw', 'en_domestic'], displayTabs: ['en', 'fr', 'sw', 'en_domestic', 'intl_en'] },
    sc: { languages: ['en', 'fr', 'en_domestic'], displayTabs: ['en', 'fr', 'en_domestic', 'intl_en'] },
    so: { languages: ['so', 'en', 'en_domestic'], displayTabs: ['so', 'en', 'en_domestic', 'intl_en'] },
    ss: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    tz: { languages: ['sw', 'en', 'en_domestic'], displayTabs: ['sw', 'en', 'en_domestic', 'intl_en'] },
    ug: { languages: ['en', 'sw', 'en_domestic'], displayTabs: ['en', 'sw', 'en_domestic', 'intl_en'] },
    zm: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['en', 'fr', 'ar', 'ti', 'am', 'sw', 'pt', 'so'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('adds Southern Africa and Indian Ocean delivery-language tabs from country code defaults', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    za: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    na: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    bw: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    zw: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    mz: { languages: ['pt', 'en'], displayTabs: ['pt', 'en'] },
    mw: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    zm: { languages: ['en', 'en_domestic'], displayTabs: ['en', 'en_domestic', 'intl_en'] },
    ls: { languages: ['en', 'st', 'en_domestic'], displayTabs: ['en', 'st', 'en_domestic', 'intl_en'] },
    sz: { languages: ['en', 'ss', 'en_domestic'], displayTabs: ['en', 'ss', 'en_domestic', 'intl_en'] },
    ao: { languages: ['pt', 'en'], displayTabs: ['pt', 'en'] },
    mu: { languages: ['en', 'fr', 'en_domestic'], displayTabs: ['en', 'fr', 'en_domestic', 'intl_en'] },
    km: { languages: ['fr', 'en'], displayTabs: ['fr', 'en'] },
    sc: { languages: ['en', 'fr', 'en_domestic'], displayTabs: ['en', 'fr', 'en_domestic', 'intl_en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['en', 'pt', 'fr', 'ar', 'st', 'ss', 'crs'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('keeps all official language tabs for European multilingual address markets', () => {
  const expectedByCountry: Record<string, { languages: string[]; displayTabs: string[] }> = {
    ch: { languages: ['de', 'fr', 'it', 'rm', 'en'], displayTabs: ['de', 'fr', 'it', 'rm', 'en'] },
    be: { languages: ['nl', 'fr', 'de', 'en'], displayTabs: ['nl', 'fr', 'de', 'en'] },
    lu: { languages: ['lb', 'fr', 'de', 'en'], displayTabs: ['lb', 'fr', 'de', 'en'] },
    fi: { languages: ['fi', 'sv', 'en'], displayTabs: ['fi', 'sv', 'en'] },
    es: { languages: ['es', 'ca', 'gl', 'eu', 'en'], displayTabs: ['es', 'ca', 'gl', 'eu', 'en'] },
    cy: { languages: ['el', 'tr', 'en'], displayTabs: ['el', 'tr', 'en'] },
    ba: { languages: ['bs', 'hr', 'sr', 'en'], displayTabs: ['bs', 'hr', 'sr', 'en'] },
  };

  for (const [countryCode, expected] of Object.entries(expectedByCountry)) {
    const languages = getAgidAddressTabLanguages({
      countryCode,
      countryLanguages: [],
      knownLanguageCodes: ['en', 'de', 'fr', 'it', 'rm', 'nl', 'lb', 'fi', 'sv', 'es', 'ca', 'gl', 'eu', 'el', 'tr', 'bs', 'hr', 'sr'],
    });

    assert.deepEqual(languages, expected.languages);
    assert.deepEqual(getAgidAddressDisplayTabs(languages), expected.displayTabs);
  }
});

test('returns staged preparation for Expanding Circle native-to-English conversion', () => {
  assert.deepEqual(
    getExpandingCircleEnglishPreparation('jp').map(stage => stage.id),
    ['native-format', 'script-conversion', 'english-exonyms', 'open-source-validation']
  );
  assert.equal(getExpandingCircleEnglishPreparation('jp')[0].status, 'ready');
  assert.equal(getExpandingCircleEnglishPreparation('jp')[3].status, 'planned');
});

test('preserves an explicitly selected native preference when it matches the country primary language', () => {
  assert.deepEqual(
    getAgidAddressTabLanguages({
      countryCode: 'jp',
      preferredLanguage: 'ja',
      countryLanguages: ['ja'],
      knownLanguageCodes: ['ja', 'en'],
    }),
    ['ja', 'en']
  );
});
