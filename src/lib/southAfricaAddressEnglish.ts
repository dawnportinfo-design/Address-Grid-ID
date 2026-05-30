const SOUTH_AFRICA_ADDRESS_ALIASES: Record<string, string> = {
  'South Africa': 'South Africa',
  'Suid-Afrika': 'South Africa',
  Mzansi: 'South Africa',

  Gauteng: 'Gauteng',
  'Wes-Kaap': 'Western Cape',
  'Western Cape': 'Western Cape',
  'Oos-Kaap': 'Eastern Cape',
  'Eastern Cape': 'Eastern Cape',
  'Noord-Kaap': 'Northern Cape',
  'Northern Cape': 'Northern Cape',
  'KwaZulu-Natal': 'KwaZulu-Natal',
  Limpopo: 'Limpopo',
  Mpumalanga: 'Mpumalanga',
  'Free State': 'Free State',
  Vrystaat: 'Free State',
  'North West': 'North West',
  Noordwes: 'North West',

  Johannesburg: 'Johannesburg',
  Joburg: 'Johannesburg',
  Jozi: 'Johannesburg',
  eGoli: 'Johannesburg',
  Egoli: 'Johannesburg',
  'City of Johannesburg': 'Johannesburg',
  'Cape Town': 'Cape Town',
  Kaapstad: 'Cape Town',
  iKapa: 'Cape Town',
  Ikapa: 'Cape Town',
  Durban: 'Durban',
  eThekwini: 'Durban',
  Ethekwini: 'Durban',
  Pretoria: 'Pretoria',
  Tshwane: 'Pretoria',
  'Port Elizabeth': 'Port Elizabeth',
  Gqeberha: 'Port Elizabeth',
  Bloemfontein: 'Bloemfontein',
  Mangaung: 'Bloemfontein',
  Kimberley: 'Kimberley',
  Polokwane: 'Polokwane',
  Pietersburg: 'Polokwane',
  Mbombela: 'Mbombela',
  Nelspruit: 'Mbombela',
  Makhanda: 'Grahamstown',
  Grahamstown: 'Grahamstown',
  uMgungundlovu: 'Pietermaritzburg',
  Umgungundlovu: 'Pietermaritzburg',
  Pietermaritzburg: 'Pietermaritzburg',
  Soweto: 'Soweto',
  Sandton: 'Sandton',
  Stellenbosch: 'Stellenbosch',

  Hoofstraat: 'Main Street',
  'Hoof Straat': 'Main Street',
  'Kerk Straat': 'Church Street',
  Kerkstraat: 'Church Street',
  Voortrekkerweg: 'Voortrekker Road',
  'Voortrekker Weg': 'Voortrekker Road',
  Adderleystraat: 'Adderley Street',
  'Adderley Straat': 'Adderley Street',
  Langstraat: 'Long Street',
  'Lang Straat': 'Long Street',
  Janpath: 'Janpath',

  Straat: 'Street',
  straat: 'Street',
  Weg: 'Road',
  weg: 'Road',
  Pad: 'Road',
  pad: 'Road',
  Laan: 'Avenue',
  laan: 'Avenue',
  Rylaan: 'Drive',
  rylaan: 'Drive',
  Gebou: 'Building',
  gebou: 'Building',
  Voorstad: 'Suburb',
  voorstad: 'Suburb',
  Plek: 'Place',
  plek: 'Place',
};

const keys = Object.keys(SOUTH_AFRICA_ADDRESS_ALIASES).sort((a, b) => b.length - a.length);

function normalizeSpace(value: string) {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function normalizeSouthAfricanAddressPart(value: string) {
  const source = normalizeSpace(value);
  if (!source) return '';

  const direct = SOUTH_AFRICA_ADDRESS_ALIASES[source];
  if (direct) return direct;

  const parts: string[] = [];
  let index = 0;
  let changed = false;

  while (index < source.length) {
    const match = keys.find(key => source.startsWith(key, index));
    if (match) {
      parts.push(SOUTH_AFRICA_ADDRESS_ALIASES[match]);
      index += match.length;
      changed = true;
      continue;
    }

    const current = source[index];
    if (/[\s,，、/]/.test(current)) {
      index += 1;
      continue;
    }

    if (/[\dA-Za-zÀ-ž'-]/.test(current)) {
      let end = index + 1;
      while (end < source.length && /[\dA-Za-zÀ-ž'-]/.test(source[end])) end += 1;
      parts.push(source.slice(index, end));
      index = end;
      continue;
    }

    return '';
  }

  return changed ? parts.join(' ').replace(/\s+/g, ' ').trim() : '';
}

export function getSouthAfricanEnglishAddressAliases() {
  return { ...SOUTH_AFRICA_ADDRESS_ALIASES };
}
