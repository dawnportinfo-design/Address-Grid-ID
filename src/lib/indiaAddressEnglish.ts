const INDIA_ADDRESS_ALIASES: Record<string, string> = {
  India: 'India',
  Bharat: 'India',
  Hindustan: 'India',
  Banaras: 'Varanasi',
  Benares: 'Varanasi',
  Calicut: 'Kozhikode',
  Cochin: 'Kochi',
  Trivandrum: 'Thiruvananthapuram',
  Bombay: 'Mumbai',
  Madras: 'Chennai',
  Bangalore: 'Bengaluru',
  Baroda: 'Vadodara',
  Allahabad: 'Prayagraj',

  भारत: 'India',
  इंडिया: 'India',
  महाराष्ट्र: 'Maharashtra',
  मुंबई: 'Mumbai',
  बम्बई: 'Mumbai',
  दिल्ली: 'Delhi',
  'नई दिल्ली': 'New Delhi',
  कर्नाटक: 'Karnataka',
  बेंगलुरु: 'Bengaluru',
  बैंगलोर: 'Bengaluru',
  तेलंगाना: 'Telangana',
  हैदराबाद: 'Hyderabad',
  तमिलनाडु: 'Tamil Nadu',
  चेन्नई: 'Chennai',
  मद्रास: 'Chennai',
  गुजरात: 'Gujarat',
  अहमदाबाद: 'Ahmedabad',
  पंजाब: 'Punjab',
  अमृतसर: 'Amritsar',
  केरल: 'Kerala',
  कोच्चि: 'Kochi',
  त्रिवेंद्रम: 'Thiruvananthapuram',
  'उत्तर प्रदेश': 'Uttar Pradesh',
  लखनऊ: 'Lucknow',
  वाराणसी: 'Varanasi',
  बनारस: 'Varanasi',
  जयपुर: 'Jaipur',
  अंधेरी: 'Andheri',
  पश्चिम: 'West',
  पूर्व: 'East',
  मार्ग: 'Road',
  सड़क: 'Road',
  रोड: 'Road',
  गली: 'Lane',
  नगर: 'Nagar',
  'एम जी रोड': 'MG Road',

  পশ্চিমবঙ্গ: 'West Bengal',
  কলকাতা: 'Kolkata',
  ক্যালকাটা: 'Kolkata',
  পার্ক: 'Park',
  স্ট্রিট: 'Street',
  'পার্ক স্ট্রিট': 'Park Street',
  রাস্তা: 'Road',

  தமிழ்நாடு: 'Tamil Nadu',
  சென்னை: 'Chennai',
  மெட்ராஸ்: 'Chennai',
  அண்ணா: 'Anna',
  சாலை: 'Salai',
  'அண்ணா சாலை': 'Anna Salai',

  తెలంగాణ: 'Telangana',
  హైదరాబాద్: 'Hyderabad',
  బంజారా: 'Banjara',
  హిల్స్: 'Hills',
  'బంజారా హిల్స్': 'Banjara Hills',
  రోడ్డు: 'Road',

  ಕರ್ನಾಟಕ: 'Karnataka',
  ಬೆಂಗಳೂರು: 'Bengaluru',
  ಮೈಸೂರು: 'Mysuru',
  ರಸ್ತೆ: 'Road',
  'ಎಂ ಜಿ ರಸ್ತೆ': 'MG Road',

  കേരളം: 'Kerala',
  കൊച്ചി: 'Kochi',
  തിരുവനന്തപുരം: 'Thiruvananthapuram',
  കോഴിക്കോട്: 'Kozhikode',
  റോഡ്: 'Road',
  'എം ജി റോഡ്': 'MG Road',

  ગુજરાત: 'Gujarat',
  અમદાવાદ: 'Ahmedabad',
  વડોદરા: 'Vadodara',
  આશ્રમ: 'Ashram',
  રોડ: 'Road',
  'આશ્રમ રોડ': 'Ashram Road',

  ਪੰਜਾਬ: 'Punjab',
  ਅੰਮ੍ਰਿਤਸਰ: 'Amritsar',
  ਚੰਡੀਗੜ੍ਹ: 'Chandigarh',
  ਰੋਡ: 'Road',
  'ਜੀ ਟੀ ਰੋਡ': 'GT Road',

  ଓଡ଼ିଶା: 'Odisha',
  ଓଡିଶା: 'Odisha',
  ଭୁବନେଶ୍ୱର: 'Bhubaneswar',
  ଭୁବନେଶ୍ବର: 'Bhubaneswar',
  ଜନପଥ: 'Janpath',
  ରୋଡ଼: 'Road',

  بھارت: 'India',
  ہندوستان: 'India',
  دہلی: 'Delhi',
  'نئی دہلی': 'New Delhi',
  'اتر پردیش': 'Uttar Pradesh',
  لکھنؤ: 'Lucknow',
  لکھنو: 'Lucknow',
  'حضرت گنج': 'Hazratganj',
  حیدرآباد: 'Hyderabad',
  ممبئی: 'Mumbai',
  کولکاتا: 'Kolkata',
};

const INDIA_SCRIPT_RE = /[\u0900-\u097f\u0980-\u09ff\u0a00-\u0a7f\u0a80-\u0aff\u0b00-\u0b7f\u0b80-\u0bff\u0c00-\u0c7f\u0c80-\u0cff\u0d00-\u0d7f\u0600-\u06ff]/;

const keys = Object.keys(INDIA_ADDRESS_ALIASES).sort((a, b) => b.length - a.length);

function normalizeSpace(value: string) {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

export function normalizeIndianAddressPart(value: string) {
  const source = normalizeSpace(value);
  if (!source) return '';

  const direct = INDIA_ADDRESS_ALIASES[source];
  if (direct) return direct;

  if (!INDIA_SCRIPT_RE.test(source)) {
    return INDIA_ADDRESS_ALIASES[source] || '';
  }

  const parts: string[] = [];
  let index = 0;

  while (index < source.length) {
    const match = keys.find(key => source.startsWith(key, index));
    if (match) {
      parts.push(INDIA_ADDRESS_ALIASES[match]);
      index += match.length;
      continue;
    }

    const current = source[index];
    if (/[\s,，、/|-]/.test(current)) {
      index += 1;
      continue;
    }

    if (/[\dA-Za-z]/.test(current)) {
      let end = index + 1;
      while (end < source.length && /[\dA-Za-z]/.test(source[end])) end += 1;
      parts.push(source.slice(index, end));
      index = end;
      continue;
    }

    return '';
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

export function getIndianEnglishAddressAliases() {
  return { ...INDIA_ADDRESS_ALIASES };
}
