export type RegistrationTerritoryOption = {
  code: string;
  name: string;
  flag: string;
};

export const BRITISH_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'GB', name: 'United Kingdom (Mainland)', flag: '🇬🇧' },
  { code: 'JE', name: 'Jersey', flag: '🇯🇪' },
  { code: 'GG', name: 'Guernsey', flag: '🇬🇬' },
  { code: 'IM', name: 'Isle of Man', flag: '🇮🇲' },
  { code: 'GI', name: 'Gibraltar', flag: '🇬🇮' },
  { code: 'BM', name: 'Bermuda', flag: '🇧🇲' },
  { code: 'FK', name: 'Falkland Islands', flag: '🇫🇰' },
  { code: 'MS', name: 'Montserrat', flag: '🇲🇸' },
  { code: 'TC', name: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: 'VG', name: 'British Virgin Islands', flag: '🇻🇬' },
  { code: 'AI', name: 'Anguilla', flag: '🇦🇮' },
  { code: 'SH', name: 'Saint Helena', flag: '🇸🇭' },
  { code: 'AC', name: 'Ascension Island', flag: '🇦🇨' },
  { code: 'TA', name: 'Tristan da Cunha', flag: '🇹🇦' },
  { code: 'GS', name: 'South Georgia', flag: '🇬🇸' },
  { code: 'PN', name: 'Pitcairn Islands', flag: '🇵🇳' },
  { code: 'IO', name: 'British Indian Ocean Territory', flag: '🇩🇬' },
  { code: 'SBA', name: 'Sovereign Base Areas', flag: '🇨🇾' },
];

export const FRENCH_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'FR', name: 'France (Mainland)', flag: '🇫🇷' },
  { code: 'GP', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: 'MQ', name: 'Martinique', flag: '🇲🇶' },
  { code: 'GF', name: 'French Guiana', flag: '🇬🇫' },
  { code: 'RE', name: 'Réunion', flag: '🇷🇪' },
  { code: 'YT', name: 'Mayotte', flag: '🇾🇹' },
  { code: 'PF', name: 'French Polynesia', flag: '🇵🇫' },
  { code: 'NC', name: 'New Caledonia', flag: '🇳🇨' },
  { code: 'WF', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: 'MF', name: 'Saint Martin', flag: '🇲🇫' },
  { code: 'BL', name: 'Saint Barthélemy', flag: '🇧🇱' },
  { code: 'PM', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: 'TF', name: 'French Southern Lands', flag: '🇹🇫' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'CA_QC', name: 'Quebec (Canada)', flag: '⚜️' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
];

export const ARABIC_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
];

export const ITALIAN_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'CH', name: 'Switzerland (IT)', flag: '🇨🇭' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
];

export const NORWEGIAN_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'NO', name: 'Norway (Mainland)', flag: '🇳🇴' },
  { code: 'SJ_SVA', name: 'Svalbard', flag: '❄️' },
  { code: 'SJ_JAN', name: 'Jan Mayen', flag: '🌋' },
];

export const SPANISH_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'ES', name: 'Spain (Mainland)', flag: '🇪🇸' },
  { code: 'ES_BAL', name: 'Balearic Islands', flag: '🏝️' },
  { code: 'ES_CAN', name: 'Canary Islands', flag: '🌋' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
];

export const PORTUGUESE_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'PT', name: 'Portugal (Mainland)', flag: '🇵🇹' },
  { code: 'PT_AZO', name: 'Azores', flag: '🐋' },
  { code: 'PT_MAD', name: 'Madeira', flag: '🍷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴' },
];

export const DUTCH_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'NL', name: 'Netherlands (Mainland)', flag: '🇳🇱' },
  { code: 'AW', name: 'Aruba', flag: '🇦🇼' },
  { code: 'CW', name: 'Curaçao', flag: '🇨🇼' },
  { code: 'SX', name: 'Sint Maarten', flag: '🇸🇽' },
  { code: 'BQ', name: 'Caribbean Netherlands', flag: '🇧🇶' },
];

export const DANISH_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'DK', name: 'Denmark (Mainland)', flag: '🇩🇰' },
  { code: 'FO', name: 'Faroe Islands', flag: '🇫🇴' },
  { code: 'GL', name: 'Greenland', flag: '🇬🇱' },
];

export const AUSTRALIAN_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'AU', name: 'Australia (Mainland)', flag: '🇦🇺' },
  { code: 'CX', name: 'Christmas Island', flag: '🇨🇽' },
  { code: 'CC', name: 'Cocos (Keeling) Islands', flag: '🇨🇨' },
  { code: 'NF', name: 'Norfolk Island', flag: '🇳🇫' },
];

export const US_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'US', name: 'USA (Mainland)', flag: '🇺🇸' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'VI', name: 'US Virgin Islands', flag: '🇻🇮' },
  { code: 'GU', name: 'Guam', flag: '🇬🇺' },
  { code: 'MP', name: 'Northern Mariana Islands', flag: '🇲🇵' },
  { code: 'AS', name: 'American Samoa', flag: '🇦🇸' },
];

export const CHILE_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'CL', name: 'Chile (Mainland)', flag: '🇨🇱' },
  { code: 'CL_EA', name: 'Easter Island', flag: '🗿' },
];

export const CANADIAN_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'CA', name: 'Canada (Mainland)', flag: '🇨🇦' },
  { code: 'CA_QC', name: 'Quebec', flag: '⚜️' },
];

export const GERMAN_REGIONS: RegistrationTerritoryOption[] = [
  { code: 'DE', name: 'Germany (Mainland)', flag: '🇩🇪' },
  { code: 'DE-BW', name: 'Baden-Württemberg', flag: '🥨' },
  { code: 'DE-BY', name: 'Bayern', flag: '🍺' },
  { code: 'DE-BE', name: 'Berlin', flag: '🐻' },
  { code: 'DE-BB', name: 'Brandenburg', flag: '🏰' },
  { code: 'DE-HB', name: 'Bremen', flag: '🚢' },
  { code: 'DE-HH', name: 'Hamburg', flag: '⚓' },
  { code: 'DE-HE', name: 'Hessen', flag: '🏙️' },
  { code: 'DE-MV', name: 'Mecklenburg-Vorpommern', flag: '🌊' },
  { code: 'DE-NI', name: 'Niedersachsen', flag: '🐎' },
  { code: 'DE-NW', name: 'Nordrhein-Westfalen', flag: '🏭' },
  { code: 'DE-RP', name: 'Rheinland-Pfalz', flag: '🍷' },
  { code: 'DE-SL', name: 'Saarland', flag: '⚒️' },
  { code: 'DE-SN', name: 'Sachsen', flag: '🏰' },
  { code: 'DE-ST', name: 'Sachsen-Anhalt', flag: '🗺️' },
  { code: 'DE-SH', name: 'Schleswig-Holstein', flag: '⛵' },
  { code: 'DE-TH', name: 'Thüringen', flag: '🌲' },
];

export const CENTRAL_EUROPE_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'PL', name: 'Poland (Mainland)', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czechia (Mainland)', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary (Mainland)', flag: '🇭🇺' },
  { code: 'SK', name: 'Slovakia (Mainland)', flag: '🇸🇰' },
  { code: 'AT', name: 'Austria (Mainland)', flag: '🇦🇹' },
  { code: 'SI', name: 'Slovenia (Mainland)', flag: '🇸🇮' },
];

export const SOUTHEAST_ASIA_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'ID', name: 'Indonesia (Mainland)', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines (Mainland)', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam (Mainland)', flag: '🇻🇳' },
  { code: 'TH', name: 'Thailand (Mainland)', flag: '🇹🇭' },
  { code: 'MY', name: 'Malaysia (Mainland)', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore (Mainland)', flag: '🇸🇬' },
  { code: 'KH', name: 'Cambodia (Mainland)', flag: '🇰🇭' },
  { code: 'LA', name: 'Laos (Mainland)', flag: '🇱🇦' },
  { code: 'MM', name: 'Myanmar (Mainland)', flag: '🇲🇲' },
  { code: 'BN', name: 'Brunei (Mainland)', flag: '🇧🇳' },
];

export const BALKAN_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'GR', name: 'Greece (Mainland)', flag: '🇬🇷' },
  { code: 'CY', name: 'Cyprus (Mainland)', flag: '🇨🇾' },
  { code: 'RO', name: 'Romania (Mainland)', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria (Mainland)', flag: '🇧🇬' },
  { code: 'RS', name: 'Serbia (Mainland)', flag: '🇷🇸' },
  { code: 'HR', name: 'Croatia (Mainland)', flag: '🇭🇷' },
  { code: 'BA', name: 'Bosnia and Herzegovina (Mainland)', flag: '🇧🇦' },
  { code: 'AL', name: 'Albania (Mainland)', flag: '🇦🇱' },
  { code: 'MK', name: 'North Macedonia (Mainland)', flag: '🇲🇰' },
  { code: 'ME', name: 'Montenegro (Mainland)', flag: '🇲🇪' },
];

export const MICROSTATES_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent', flag: '🇻🇨' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
];

export const ANGLOSPHERE_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'TT', name: 'Trinidad & Tobago', flag: '🇹🇹' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
];

export const HISPANOSPHERE_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
];

export const LUSOSPHERE_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴' },
];

export const CARIBBEAN_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: 'GP', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: 'MQ', name: 'Martinique', flag: '🇲🇶' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'CW', name: 'Curaçao', flag: '🇨🇼' },
  { code: 'VC', name: 'Saint Vincent', flag: '🇻🇨' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'KY', name: 'Cayman Islands', flag: '🇰🇾' },
  { code: 'VG', name: 'British Virgin Islands', flag: '🇻🇬' },
  { code: 'VI', name: 'US Virgin Islands', flag: '🇻🇮' },
  { code: 'AI', name: 'Anguilla', flag: '🇦🇮' },
  { code: 'MS', name: 'Montserrat', flag: '🇲🇸' },
  { code: 'AW', name: 'Aruba', flag: '🇦🇼' },
  { code: 'SX', name: 'Sint Maarten', flag: '🇸🇽' },
  { code: 'BL', name: 'Saint Barthélemy', flag: '🇧🇱' },
  { code: 'MF', name: 'Saint Martin', flag: '🇲🇫' },
  { code: 'BQ', name: 'Caribbean Netherlands', flag: '🇧🇶' },
  { code: 'TC', name: 'Turks and Caicos', flag: '🇹🇨' },
];

export const OCEANIA_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'NC', name: 'New Caledonia', flag: '🇳🇨' },
  { code: 'PF', name: 'French Polynesia', flag: '🇵🇫' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'GU', name: 'Guam', flag: '🇬🇺' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'MP', name: 'Northern Mariana Islands', flag: '🇲🇵' },
  { code: 'AS', name: 'American Samoa', flag: '🇦🇸' },
  { code: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'CK', name: 'Cook Islands', flag: '🇨🇰' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'WF', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: 'NU', name: 'Niue', flag: '🇳🇺' },
  { code: 'TK', name: 'Tokelau', flag: '🇹🇰' },
];

export const GREATER_CHINA_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
];

export const FRANCOPHONIE_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada (QC/NB)', flag: '🇨🇦' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
];

export const NEW_ZEALAND_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'NZ', name: 'New Zealand (Mainland)', flag: '🇳🇿' },
  { code: 'CK', name: 'Cook Islands', flag: '🇨🇰' },
  { code: 'NU', name: 'Niue', flag: '🇳🇺' },
  { code: 'TK', name: 'Tokelau', flag: '🇹🇰' },
];

export const BALTIC_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'EE', name: 'Estonia (Mainland)', flag: '🇪🇪' },
  { code: 'LV', name: 'Latvia (Mainland)', flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania (Mainland)', flag: '🇱🇹' },
];

export const EURASIAN_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'TR', name: 'Turkey (Mainland)', flag: '🇹🇷' },
  { code: 'UA', name: 'Ukraine (Mainland)', flag: '🇺🇦' },
  { code: 'BY', name: 'Belarus (Mainland)', flag: '🇧🇾' },
  { code: 'MD', name: 'Moldova (Mainland)', flag: '🇲🇩' },
  { code: 'GE', name: 'Georgia (Mainland)', flag: '🇬🇪' },
  { code: 'AM', name: 'Armenia (Mainland)', flag: '🇦🇲' },
  { code: 'AZ', name: 'Azerbaijan (Mainland)', flag: '🇦🇿' },
];

export const NORDIC_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'SE', name: 'Sweden (Mainland)', flag: '🇸🇪' },
  { code: 'FI', name: 'Finland (Mainland)', flag: '🇫🇮' },
  { code: 'IS', name: 'Iceland (Mainland)', flag: '🇮🇸' },
  { code: 'NO', name: 'Norway (Mainland)', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark (Mainland)', flag: '🇩🇰' },
];

export const CENTRAL_SOUTH_ASIA_TERRITORIES: RegistrationTerritoryOption[] = [
  { code: 'KZ', name: 'Kazakhstan (Mainland)', flag: '🇰🇿' },
  { code: 'UZ', name: 'Uzbekistan (Mainland)', flag: '🇺🇿' },
  { code: 'KG', name: 'Kyrgyzstan (Mainland)', flag: '🇰🇬' },
  { code: 'TJ', name: 'Tajikistan (Mainland)', flag: '🇹🇯' },
  { code: 'TM', name: 'Turkmenistan (Mainland)', flag: '🇹🇲' },
  { code: 'AF', name: 'Afghanistan (Mainland)', flag: '🇦🇫' },
  { code: 'PK', name: 'Pakistan (Mainland)', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh (Mainland)', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka (Mainland)', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal (Mainland)', flag: '🇳🇵' },
  { code: 'BT', name: 'Bhutan (Mainland)', flag: '🇧🇹' },
  { code: 'MV', name: 'Maldives (Mainland)', flag: '🇲🇻' },
];
