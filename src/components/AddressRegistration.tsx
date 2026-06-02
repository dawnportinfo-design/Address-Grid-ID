import {
Square as AgidIcon,
AlertCircle,
Building2,
CheckCircle2,
ChevronRight,
Globe,
Hash,
ListFilter,
Loader2,
Mail,
MapPin,
Mountain,
QrCode,
ShieldCheck as ShieldIcon,
Wand2,
X
} from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import React,{ useEffect,useMemo,useState } from 'react';
import { COUNTRIES } from '../constants/countries';
import { AddressFormat,getAddressFormat } from '../data/address_formats';
import {
buildPostcodeAutofillLanguageDrafts,
isPostcodeReadyForAutofill,
lookupPostcodeAutofill,
mergePostcodeAutofill,
translateRegistrationFormFields,
} from '../lib/addressRegistrationAutomation';
import {
buildRegistrationAddressLanguageTabs,
normalizeRegistrationAddressLanguage,
normalizeRegistrationUiLanguage,
selectRegistrationAddressFormat,
selectRegistrationCountry,
} from '../lib/addressRegistrationState';
import {
ANGLOSPHERE_TERRITORIES,
ARABIC_TERRITORIES,
AUSTRALIAN_TERRITORIES,
BALKAN_TERRITORIES,
BALTIC_TERRITORIES,
BRITISH_TERRITORIES,
CANADIAN_TERRITORIES,
CARIBBEAN_TERRITORIES,
CENTRAL_EUROPE_TERRITORIES,
CENTRAL_SOUTH_ASIA_TERRITORIES,
CHILE_TERRITORIES,
DANISH_TERRITORIES,
DUTCH_TERRITORIES,
EURASIAN_TERRITORIES,
FRANCOPHONIE_TERRITORIES,
FRENCH_TERRITORIES,
GERMAN_REGIONS,
GREATER_CHINA_TERRITORIES,
HISPANOSPHERE_TERRITORIES,
ITALIAN_TERRITORIES,
LUSOSPHERE_TERRITORIES,
MICROSTATES_TERRITORIES,
NEW_ZEALAND_TERRITORIES,
NORDIC_TERRITORIES,
NORWEGIAN_TERRITORIES,
OCEANIA_TERRITORIES,
PORTUGUESE_TERRITORIES,
SOUTHEAST_ASIA_TERRITORIES,
SPANISH_TERRITORIES,
US_TERRITORIES,
} from '../lib/addressRegistrationTerritories';
import { AddressRenderer,createCanonicalAddress } from '../lib/addressRendering';
import { normalizeAddressText } from '../lib/addressUtils';
import { calculateMountainClass,decodeAGID } from '../lib/agid';
import { generateAOID } from '../lib/aoid';
import { detectChineseScript,toSimplified,toTraditional } from '../lib/chineseAddressUtils';
import { wgs84tobd09,wgs84togcj02 } from '../lib/coordTransform';
import { getPostcodeInputConfig } from '../lib/postcodeControl';
import { buildRegisteredAddressRecord } from '../lib/registeredAddressQr';
import {
REGISTRATION_COUNTRY_TABS,
RegistrationCountryTabId,
getRegistrationCountryTabId,
groupRegistrationCountriesByTab,
} from '../lib/registrationCountryTabs';
import { cn } from '../lib/utils';
import { CountryFlag } from './CountryFlag';
import { PostcodeInput } from './PostcodeInput';

interface AddressRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: any) => void;
  initialAgid?: string;
  initialAddress?: string;
  initialAddressDetails?: any;
  currentCoords?: { lat: number; lon: number };
  forceAoidMode?: boolean;
  appLanguage?: string;
  addressLanguage?: string;
}


const UI_STRINGS: Record<string, Record<string, string>> = {
  ja: {
    quickLookup: 'クイック検索',
    addressRegistration: '住所登録',
    globalAddressInput: 'グローバル住所入力 (libaddressinput)',
    registerAddress: '住所を登録する',
    countryRegion: '国 / 地域',
    phone: '電話番号',
    agid: 'AGID',
    lookupSuccess: '住所が入力されました！',
    lookupError: '検索に失敗しました',
    recipient: '氏名',
    organization: '会社・団体名',
    street: '住所',
    city: '市区町村',
    state: '都道府県',
    suburb: '町名・番地',
    postcode: '郵便番号',
    phonePlaceholder: '電話番号（国番号を含む）',
    agidPlaceholder: 'AGID（例: JP12345678）',
    postcodeLookup: '郵便番号検索',
    postcodePlaceholder: '7桁の郵便番号',
    jpAdminDetails: '日本国内行政詳細',
    prefecture: '都道府県',
    cityWard: '市区',
    townVillage: '町村',
    chome: '丁目',
    historicalName: '旧地名・歴史的名称',
    province: '省・州',
    district: '地区・郡',
    ward: '区',
    town: '町',
    village: '村',
    commune: 'コミューン',
    parish: '教区',
    quarter: 'クォーター',
    neighborhood: '近隣地域',
    governorate: '県・ガバノレート',
    emirate: '首長国',
    municipality: '自治体',
    county: '郡',
    oblast: '州 (Oblast)',
    viloyat: '州 (Viloyat)',
    region: '地域',
    department: '県 (Department)',
    canton: 'カントン',
    island: '島',
    atoll: '環礁',
    soum: 'ソム',
    bag: 'バグ',
    block: 'ブロック',
    lot: 'ロット',
    section: 'セクション',
    lane: 'レーン',
    alley: 'アレイ',
    floor: '階',
    room: '部屋',
    registerAoid: 'AOIDを生成・登録する',
    aoidTip: 'AOIDは自分だけが管理できるプライベートな住所IDです。建物名や部屋番号、連絡先を含みます。',
    registerAsAoid: 'AOIDとしてプライベート登録する',
    phoneRequired: '電話番号は必須です',
    nameRequired: '氏名は必須です',
    tab_indian_langs: 'インド諸語',
    tab_sa_langs: '南アフリカ諸語',
    tab_de_langs: 'ゲルマン諸語',
    tab_regional_langs: '地域言語',
    tab_es_regional: 'スペイン諸州',
    tab_it_regional: 'イタリア諸州',
    tab_latam_es: 'スペイン語 (グローバル)',
    tab_lusosphere: 'ポルトガル語 (グローバル)',
    tab_arabic_global: 'アラビア語 (グローバル)',
    tab_mena_langs: '中東・北アフリカ (他諸語)',
    tab_anglosphere: '英語圏 (グローバル)',
    tab_greater_china: '大中華圏',
    tab_francophonie: 'フランス語圏',
    tab_zh_hans: '簡体字中国語',
    tab_zh_hant: '繁体字中国語'
  },
  de: {
    quickLookup: 'Schnellsuche',
    addressRegistration: 'Adressregistrierung',
    globalAddressInput: 'Globale Adresseingabe',
    registerAddress: 'Adresse registrieren',
    countryRegion: 'Land / Region',
    phone: 'Telefon',
    agid: 'AGID',
    lookupSuccess: 'Adressfelder ausgefüllt!',
    postcodePlaceholder: 'Postleitzahl',
    jpAdminDetails: 'Verwaltungsdetails',
    prefecture: 'Bundesland',
    cityWard: 'Stadt / Bezirk',
    townVillage: 'Gemeinde / Dorf',
    chome: 'Chome',
    historicalName: 'Historischer Name',
    province: 'Provinz',
    district: 'Regierungsbezirk',
    ward: 'Stadtteil / Bezirk',
    town: 'Stadt',
    village: 'Dorf',
    commune: 'Kommune',
    parish: 'Gemeinde (Pfarrei)',
    quarter: 'Quartier',
    neighborhood: 'Viertel',
    governorate: 'Gouvernement',
    emirate: 'Emirat',
    municipality: 'Gemeinde',
    county: 'Landkreis',
    oblast: 'Oblast',
    viloyat: 'Viloyat',
    region: 'Region',
    department: 'Abteilung / Bezirk',
    canton: 'Kanton',
    island: 'Insel',
    atoll: 'Atoll',
    soum: 'Soum',
    bag: 'Bag',
    block: 'Block',
    lot: 'Lot',
    section: 'Sektion',
    lane: 'Gasse',
    alley: 'Allee',
    floor: 'Etage',
    room: 'Zimmer',
    registerAoid: 'AOID generieren & registrieren',
    aoidTip: 'AOID ist eine private Adress-ID. Sie enthält Gebäudenamen, Zimmernummern und Kontaktinfo.',
    registerAsAoid: 'Privat als AOID registrieren',
    phoneRequired: 'Telefonnummer ist erforderlich',
    nameRequired: 'Name ist erforderlich',
    tab_indian_langs: 'Indische Sprachen',
    tab_sa_langs: 'Südafrikanische Sprachen',
    tab_de_langs: 'Germanische Sprachen',
    tab_regional_langs: 'Regionalsprachen',
    tab_es_regional: 'Regionen Spanien',
    tab_it_regional: 'Regionen Italien',
    tab_latam_es: 'Spanisch (Global)',
    tab_lusosphere: 'Portugiesisch (Global)',
    tab_arabic_global: 'Arabisch (Global)',
    tab_mena_langs: 'MENA-Sprachen',
    tab_anglosphere: 'Anglosphäre',
    tab_greater_china: 'Großchina',
    tab_francophonie: 'Frankophonie',
    tab_zh_hans: 'Vereinfachtes Chinesisch',
    tab_zh_hant: 'Traditionelles Chinesisch'
  },
  en: {
    quickLookup: 'Quick Lookup',
    addressRegistration: 'Address Registration',
    globalAddressInput: 'Global Address Input (libaddressinput)',
    registerAddress: 'Register Address',
    countryRegion: 'Country / Region',
    phone: 'Phone',
    agid: 'AGID',
    lookupSuccess: 'Address fields populated!',
    lookupError: 'Lookup failed',
    recipient: 'Recipient Name',
    organization: 'Organization',
    street: 'Street Address',
    city: 'City / Town',
    state: 'State / Province',
    suburb: 'Suburb / District',
    postcode: 'Postal Code',
    phonePlaceholder: 'Phone Number (with country code)',
    agidPlaceholder: 'AGID (e.g. JP12345678)',
    postcodeLookup: 'Postcode Lookup',
    postcodePlaceholder: '7-digit postcode',
    jpAdminDetails: 'Japanese Administrative Details',
    prefecture: 'Prefecture',
    cityWard: 'City / Ward',
    townVillage: 'Town / Village',
    chome: 'Chome',
    historicalName: 'Historical Name',
    province: 'Province',
    district: 'District',
    ward: 'Ward',
    town: 'Town',
    village: 'Village',
    commune: 'Commune',
    parish: 'Parish',
    quarter: 'Quarter',
    neighborhood: 'Neighborhood',
    governorate: 'Governorate',
    emirate: 'Emirate',
    municipality: 'Municipality',
    county: 'County',
    oblast: 'Oblast',
    viloyat: 'Viloyat',
    region: 'Region',
    department: 'Department',
    canton: 'Canton',
    island: 'Island',
    atoll: 'Atoll',
    soum: 'Soum',
    bag: 'Bag',
    block: 'Block',
    lot: 'Lot',
    section: 'Section',
    lane: 'Lane',
    alley: 'Alley',
    floor: 'Floor',
    room: 'Room',
    registerAoid: 'Generate & Register AOID',
    aoidTip: 'AOID is a private ID containing fixed details like building, room, and phone. Not searchable by others.',
    registerAsAoid: 'Register as Private AOID',
    phoneRequired: 'Phone is required for AOID',
    nameRequired: 'Name is required for AOID',
    tab_indian_langs: 'Indian Languages',
    tab_sa_langs: 'South African Languages',
    tab_de_langs: 'Germanic Languages',
    tab_regional_langs: 'Regional Languages',
    tab_es_regional: 'Spain Regions',
    tab_it_regional: 'Italy Regions',
    tab_latam_es: 'Spanish (Global)',
    tab_lusosphere: 'Portuguese (Global)',
    tab_arabic_global: 'Arabic (Global)',
    tab_mena_langs: 'MENA (Other Languages)',
    tab_anglosphere: 'Anglosphere (Global)',
    tab_greater_china: 'Greater China',
    tab_francophonie: 'Francophonie',
    tab_zh_hans: 'Simplified Chinese',
    tab_zh_hant: 'Traditional Chinese'
  },
  'zh-Hant': {
    quickLookup: '快速搜索',
    addressRegistration: '地址註冊',
    globalAddressInput: '全球地址輸入',
    registerAddress: '註冊地址',
    countryRegion: '國家 / 地區',
    phone: '電話',
    agid: 'AGID',
    lookupSuccess: '地址已填充！',
    lookupError: '搜索失敗',
    recipient: '收件人姓名',
    organization: '組織 / 公司',
    street: '街道地址',
    city: '城市 / 鎮',
    state: '省 / 州',
    suburb: '地區 / 郊區',
    postcode: '郵政編碼',
    phonePlaceholder: '電話號碼（含國家代碼）',
    agidPlaceholder: 'AGID（例如 JP12345678）',
    postcodeLookup: '郵編搜索',
    postcodePlaceholder: '郵政編碼',
    jpAdminDetails: '日本行政詳情',
    prefecture: '都道府縣',
    cityWard: '市 / 區',
    townVillage: '町 / 村',
    chome: '丁目',
    historicalName: '歷史名稱',
    province: '省',
    district: '區 / 縣',
    ward: '區',
    town: '鎮',
    village: '村',
    commune: '市鎮',
    parish: '教區',
    quarter: '地區',
    neighborhood: '鄰里',
    governorate: '省 / 縣',
    emirate: '酋長國',
    municipality: '自治市',
    county: '郡 / 縣',
    oblast: '州 (Oblast)',
    viloyat: '州 (Viloyat)',
    region: '區域',
    department: '省 (Department)',
    canton: '州 (Canton)',
    island: '島嶼',
    atoll: '環礁',
    soum: '蘇木',
    bag: '巴格',
    block: '街區',
    lot: '地號',
    section: '部分',
    lane: '巷',
    alley: '弄',
    floor: '樓層',
    room: '房間',
    registerAoid: '生成並註冊 AOID',
    aoidTip: 'AOID 是一個私人 ID，包含建築、房間和電話等固定詳情。其他人無法搜索。',
    registerAsAoid: '註冊為私人 AOID',
    phoneRequired: 'AOID 需要電話號碼',
    nameRequired: 'AOID 需要姓名',
    tab_indian_langs: '印度語言',
    tab_sa_langs: '南非語言',
    tab_de_langs: '日耳曼語言',
    tab_regional_langs: '地區語言',
    tab_es_regional: '西班牙地區',
    tab_it_regional: '意大利地區',
    tab_latam_es: '西班牙語 (全球)',
    tab_lusosphere: '葡萄牙語 (全球)',
    tab_arabic_global: '阿拉伯語 (全球)',
    tab_mena_langs: '中東北非語系',
    tab_anglosphere: '英語圈 (全球)',
    tab_greater_china: '大中華地區',
    tab_francophonie: '法語圈',
    tab_zh_hans: '簡體中文',
    tab_zh_hant: '繁體中文'
  },
  'zh-Hans': {
    quickLookup: '快速搜索',
    addressRegistration: '地址注册',
    globalAddressInput: '全球地址输入',
    registerAddress: '注册地址',
    countryRegion: '国家 / 地区',
    phone: '电话',
    agid: 'AGID',
    lookupSuccess: '地址已填充！',
    lookupError: '搜索失败',
    recipient: '收件人姓名',
    organization: '组织 / 公司',
    street: '街道地址',
    city: '城市 / 镇',
    state: '省 / 市',
    suburb: '地区 / 街道',
    postcode: '邮政编码',
    phonePlaceholder: '电话号码（含国家代码）',
    agidPlaceholder: 'AGID（例如 JP12345678）',
    postcodeLookup: '邮编搜索',
    postcodePlaceholder: '邮政编码',
    jpAdminDetails: '日本行政详情',
    prefecture: '都道府县',
    cityWard: '市 / 区',
    townVillage: '町 / 村',
    chome: '丁目',
    historicalName: '历史名称',
    province: '省',
    district: '地区 / 县',
    ward: '区',
    town: '镇',
    village: '村',
    commune: '市镇',
    parish: '教区',
    quarter: '地区',
    neighborhood: '邻里',
    governorate: '省 / 县',
    emirate: '酋长国',
    municipality: '自治市',
    county: '郡 / 县',
    oblast: '州 (Oblast)',
    viloyat: '州 (Viloyat)',
    region: '区域',
    department: '省 (Department)',
    canton: '州 (Canton)',
    island: '岛屿',
    atoll: '环礁',
    soum: '苏木',
    bag: '巴格',
    block: '街区',
    lot: '地号',
    section: '部分',
    lane: '巷',
    alley: '弄',
    floor: '楼层',
    room: '房间',
    registerAoid: '生成并注册 AOID',
    aoidTip: 'AOID 是一个私人 ID，包含建筑、房间和电话等固定详情。其他人无法搜索。',
    registerAsAoid: '注册为私人 AOID',
    phoneRequired: 'AOID 需要电话号码',
    nameRequired: 'AOID 需要姓名',
    tab_indian_langs: '印度语言',
    tab_sa_langs: '南非语言',
    tab_de_langs: '日耳曼语言',
    tab_regional_langs: '地区语言',
    tab_es_regional: '西班牙地区',
    tab_it_regional: '意大利地区',
    tab_latam_es: '西班牙语 (全球)',
    tab_lusosphere: '葡萄牙语 (全球)',
    tab_arabic_global: '阿拉伯语 (全球)',
    tab_mena_langs: '中东北非语系',
    tab_anglosphere: '英语圈 (全球)',
    tab_greater_china: '大中华地区',
    tab_francophonie: '法语圈',
    tab_zh_hans: '简体中文',
    tab_zh_hant: '繁体中文'
  },
  'es': {
    quickLookup: 'Búsqueda Rápida',
    addressRegistration: 'Registro de Dirección',
    globalAddressInput: 'Entrada de Dirección Global',
    registerAddress: 'Registrar Dirección',
    countryRegion: 'País / Región',
    phone: 'Teléfono',
    agid: 'AGID',
    lookupSuccess: '¡Campos de dirección completados!',
    lookupError: 'Error en la búsqueda',
    recipient: 'Nombre del Destinatario',
    organization: 'Organización / Empresa',
    street: 'Dirección (Calle)',
    city: 'Ciudad / Población',
    state: 'Estado / Provincia',
    suburb: 'Suburbio / Barrio',
    postcode: 'Código Postal',
    phonePlaceholder: 'Número de Teléfono (con código de país)',
    agidPlaceholder: 'AGID (ej. JP12345678)',
    postcodeLookup: 'Buscar por CP',
    postcodePlaceholder: 'Código postal',
    jpAdminDetails: 'Detalles Adm. Japoneses',
    prefecture: 'Prefectura',
    cityWard: 'Ciudad / Distrito',
    townVillage: 'Pueblo / Aldea',
    chome: 'Chome',
    historicalName: 'Nombre Histórico',
    province: 'Provincia',
    district: 'Distrito',
    ward: 'Distrito / Barrio',
    town: 'Pueblo',
    village: 'Aldea / Villa',
    commune: 'Comuna',
    parish: 'Parroquia',
    quarter: 'Barrio / Cuartel',
    neighborhood: 'Vecindario',
    governorate: 'Gobernación',
    emirate: 'Emirato',
    municipality: 'Municipio',
    county: 'Condado',
    oblast: 'Óblast',
    viloyat: 'Viloyat',
    region: 'Región',
    department: 'Departamento',
    canton: 'Cantón',
    island: 'Isla',
    atoll: 'Atolón',
    soum: 'Soum',
    bag: 'Bag',
    block: 'Bloque',
    lot: 'Lote',
    section: 'Sección',
    lane: 'Callejón / Senda',
    alley: 'Callejón',
    floor: 'Piso',
    room: 'Habitación',
    registerAoid: 'Generar y Registrar AOID',
    aoidTip: 'AOID es un ID privado con detalles fijos como edificio, habitación y teléfono. No es público.',
    registerAsAoid: 'Registrar como AOID Privado',
    phoneRequired: 'El teléfono es obligatorio para AOID',
    nameRequired: 'El nombre es obligatorio para AOID',
    tab_indian_langs: 'Lenguas Indias',
    tab_sa_langs: 'Lenguas Sudafricanas',
    tab_de_langs: 'Lenguas Germánicas',
    tab_regional_langs: 'Lenguas Regionales',
    tab_es_regional: 'Regiones de España',
    tab_it_regional: 'Regiones de Italia',
    tab_latam_es: 'Español (Global)',
    tab_lusosphere: 'Português (Global)',
    tab_arabic_global: 'Árabe (Global)',
    tab_mena_langs: 'Lenguas MENA',
    tab_anglosphere: 'Anglosfera',
    tab_greater_china: 'Gran China',
    tab_francophonie: 'Francofonía',
    tab_zh_hans: 'Chino Simplificado',
    tab_zh_hant: 'Chino Tradicional'
  },
  'pt': {
    quickLookup: 'Busca Rápida',
    addressRegistration: 'Registro de Endereço',
    globalAddressInput: 'Entrada de Endereço Global',
    registerAddress: 'Registrar Endereço',
    countryRegion: 'País / Região',
    phone: 'Telefone',
    agid: 'AGID',
    lookupSuccess: 'Campos de endereço preenchidos!',
    lookupError: 'Falha na busca',
    recipient: 'Nome do Destinatário',
    organization: 'Organização / Empresa',
    street: 'Endereço (Rua)',
    city: 'Cidade / Localidade',
    state: 'Estado / Província',
    suburb: 'Bairro / Distrito',
    postcode: 'Código Postal',
    phonePlaceholder: 'Número de Telefone (com código de país)',
    agidPlaceholder: 'AGID (ex. JP12345678)',
    postcodeLookup: 'Buscar CEP',
    postcodePlaceholder: 'Código postal',
    jpAdminDetails: 'Detalhes Adm. Japoneses',
    prefecture: 'Prefeitura',
    cityWard: 'Cidade / Distrito',
    townVillage: 'Vila / Aldeia',
    chome: 'Chome',
    historicalName: 'Nome Histórico',
    province: 'Província',
    district: 'Distrito',
    ward: 'Distrito / Bairro',
    town: 'Vila',
    village: 'Aldeia',
    commune: 'Comuna',
    parish: 'Freguesia',
    quarter: 'Bairro',
    neighborhood: 'Vizinhança',
    governorate: 'Província / Município',
    emirate: 'Emirado',
    municipality: 'Município',
    county: 'Condado',
    oblast: 'Oblast',
    viloyat: 'Viloyat',
    region: 'Região',
    department: 'Departamento',
    canton: 'Cantão',
    island: 'Ilha',
    atoll: 'Atol',
    soum: 'Soum',
    bag: 'Bag',
    block: 'Bloco',
    lot: 'Lote',
    section: 'Seção',
    lane: 'Travessa',
    alley: 'Beco',
    floor: 'Andar',
    room: 'Sala',
    registerAoid: 'Gerar e Registrar AOID',
    aoidTip: 'AOID é um ID privado com detalhes fixos como prédio, sala e telefone. Não é público.',
    registerAsAoid: 'Registrar como AOID Privado',
    phoneRequired: 'Telefone é obrigatório para AOID',
    nameRequired: 'Nome é obrigatório para AOID',
    tab_indian_langs: 'Línguas Indianas',
    tab_sa_langs: 'Línguas Sul-Africanas',
    tab_de_langs: 'Línguas Germânicas',
    tab_regional_langs: 'Línguas Regionais',
    tab_es_regional: 'Regiões da Espanha',
    tab_it_regional: 'Regiões da Itália',
    tab_latam_es: 'Espanhol (Global)',
    tab_lusosphere: 'Português (Global)',
    tab_arabic_global: 'Árabe (Global)',
    tab_mena_langs: 'Línguas MENA',
    tab_anglosphere: 'Anglosfera',
    tab_greater_china: 'Grande China',
    tab_francophonie: 'Francofonia',
    tab_zh_hans: 'Chinês Simplificado',
    tab_zh_hant: 'Chinês Tradicional'
  },
  'fr': {
    quickLookup: 'Recherche Rapide',
    addressRegistration: 'Enregistrement d\'Adresse',
    globalAddressInput: 'Saisie d\'Adresse Globale',
    registerAddress: 'Enregistrer l\'Adresse',
    countryRegion: 'Pays / Région',
    phone: 'Téléphone',
    agid: 'AGID',
    lookupSuccess: 'Champs d\'adresse remplis !',
    lookupError: 'Échec de la recherche',
    recipient: 'Nom du Destinataire',
    organization: 'Organisation / Entreprise',
    street: 'Adresse (Rue)',
    city: 'Ville / Localité',
    state: 'État / Province',
    suburb: 'Quartier / Banlieue',
    postcode: 'Code Postal',
    phonePlaceholder: 'Numéro de téléphone (avec code pays)',
    agidPlaceholder: 'AGID (ex. JP12345678)',
    postcodeLookup: 'Recherche Code Postal',
    postcodePlaceholder: 'Code postal',
    jpAdminDetails: 'Détails Adm. Japonais',
    prefecture: 'Préfecture',
    cityWard: 'Ville / Arrondissement',
    townVillage: 'Commune / Village',
    chome: 'Chome',
    historicalName: 'Nom Historique',
    province: 'Province',
    district: 'District',
    ward: 'Arrondissement',
    town: 'Ville',
    village: 'Village',
    commune: 'Commune',
    parish: 'Paroisse',
    quarter: 'Quartier',
    neighborhood: 'Voisinage',
    governorate: 'Gouvernorat',
    emirate: 'Émirat',
    municipality: 'Municipalité',
    county: 'Comté',
    oblast: 'Oblast',
    viloyat: 'Viloyat',
    region: 'Région',
    department: 'Département',
    canton: 'Canton',
    island: 'Île',
    atoll: 'Atoll',
    soum: 'Soum',
    bag: 'Bag',
    block: 'Bloc',
    lot: 'Lot',
    section: 'Section',
    lane: 'Allée',
    alley: 'Ruelle',
    floor: 'Étage',
    room: 'Appartement / Chambre',
    registerAoid: 'Générer & Enregistrer AOID',
    aoidTip: 'AOID est un identifiant privé contenant des détails comme le bâtiment et le téléphone. Non public.',
    registerAsAoid: 'Enregistrer comme AOID Privé',
    phoneRequired: 'Téléphone requis pour AOID',
    nameRequired: 'Nom requis pour AOID',
    tab_indian_langs: 'Langues Indiennes',
    tab_sa_langs: 'Langues Sud-Africaines',
    tab_de_langs: 'Langues Germaniques',
    tab_regional_langs: 'Langues Régionales',
    tab_es_regional: 'Régions d\'Espagne',
    tab_it_regional: 'Régions d\'Italie',
    tab_latam_es: 'Espagnol (Global)',
    tab_lusosphere: 'Portugais (Global)',
    tab_arabic_global: 'Arabe (Global)',
    tab_mena_langs: 'Langues MENA',
    tab_anglosphere: 'Anglosphère',
    tab_greater_china: 'Grand Chine',
    tab_francophonie: 'Francophonie',
    tab_zh_hans: 'Chinois Simplifié',
    tab_zh_hant: 'Chinois Traditionnel'
  },
  'ar': {
    quickLookup: 'بحث سريع',
    addressRegistration: 'تسجيل العنوان',
    globalAddressInput: 'إدخال العنوان العالمي',
    registerAddress: 'تسجيل العنوان',
    countryRegion: 'البلد / المنطقة',
    phone: 'الهاتف',
    agid: 'AGID',
    lookupSuccess: 'تم ملء حقول العنوان!',
    lookupError: 'فشل البحث',
    recipient: 'اسم المستلم',
    organization: 'المنظمة / الشركة',
    street: 'عنوان الشارع',
    city: 'المدينة',
    state: 'الولاية / المقاطعة',
    suburb: 'الضاحية / الحي',
    postcode: 'الرمز البريدي',
    phonePlaceholder: 'رقم الهاتف (مع رمز البلد)',
    agidPlaceholder: 'AGID (مثلاً JP12345678)',
    postcodeLookup: 'بحث بالرمز البريدي',
    postcodePlaceholder: 'الرمز البريدي',
    jpAdminDetails: 'التفاصيل الإدارية اليابانية',
    prefecture: 'محافظة',
    cityWard: 'مدينة / حي',
    townVillage: 'بلدة / قرية',
    chome: 'تشومي',
    historicalName: 'الاسم التاريخي',
    province: 'مقاطعة',
    district: 'مديرية / حي',
    ward: 'جناح',
    town: 'بلدة',
    village: 'قرية',
    commune: 'بلدية',
    parish: 'أبرشية',
    quarter: 'ربع',
    neighborhood: 'جوار',
    governorate: 'محافظة',
    emirate: 'إمارة',
    municipality: 'بلدية',
    county: 'مقاطعة',
    oblast: 'أوبلاست',
    viloyat: 'فيلايت',
    region: 'منطقة',
    department: 'قسم',
    canton: 'كانتون',
    island: 'جزيرة',
    atoll: 'شعب حلقي',
    soum: 'سوم',
    bag: 'باغ',
    block: 'كتلة',
    lot: 'قطعة أرض',
    section: 'قسم',
    lane: 'ممر',
    alley: 'زقاق',
    floor: 'طابق',
    room: 'غرفة',
    registerAoid: 'توليد وتسجيل AOID',
    aoidTip: 'AOID هو معرف خاص يحتوي على تفاصيل المبنى والهاتف. ليس علنياً.',
    registerAsAoid: 'تسجيل كـ AOID خاص',
    phoneRequired: 'الهاتف مطلوب لـ AOID',
    nameRequired: 'الاسم مطلوب لـ AOID',
    tab_indian_langs: 'اللغات الهندية',
    tab_sa_langs: 'لغات جنوب أفريقيا',
    tab_de_langs: 'اللغات الجرمانية',
    tab_regional_langs: 'اللغات الإقليمية',
    tab_es_regional: 'مناطق إسبانيا',
    tab_it_regional: 'مناطق إيطاليا',
    tab_latam_es: 'الإسبانية (عالمي)',
    tab_lusosphere: 'البرتغالية (عالمي)',
    tab_arabic_global: 'العربية (عالمي)',
    tab_mena_langs: 'لغات الشرق الأوسط',
    tab_anglosphere: 'الأنجلوسفير',
    tab_greater_china: 'الصين الكبرى',
    tab_francophonie: 'الفرنكوفونية',
    tab_zh_hans: 'الصينية المبسطة',
    tab_zh_hant: 'الصينية التقليدية'
  }
};



export const AddressRegistration: React.FC<AddressRegistrationProps> = ({ 
  isOpen, 
  onClose, 
  onRegister,
  initialAgid,
  initialAddressDetails,
  currentCoords,
  forceAoidMode,
  appLanguage = 'en',
  addressLanguage = 'local'
}) => {
  const [agidInput] = useState(initialAgid || '');
  const [, setError] = useState<string | null>(null);
  const [, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    country: 'JP',
    recipient: '',
    organization: '',
    street: '',
    city: '',
    state: '',
    postcode: '',
    suburb: '',
    phone: '',
  });

  const [isAoidMode, setIsAoidMode] = useState(forceAoidMode || false);
  const registrationUiLanguage = useMemo(() => normalizeRegistrationUiLanguage(appLanguage), [appLanguage]);
  const [activeTab, setActiveTab] = useState<string>(() => normalizeRegistrationAddressLanguage(addressLanguage));
  const [viewMode, setViewMode] = useState<'form' | 'country-select'>('form');
  const [selectedCountryTab, setSelectedCountryTab] = useState<RegistrationCountryTabId>('asia');
  const [localFormat, setLocalFormat] = useState<AddressFormat | null>(null);
  const [postcodeLookupStatus, setPostcodeLookupStatus] = useState<'idle' | 'loading' | 'filled' | 'empty' | 'error'>('idle');
  const [addressTranslationStatus, setAddressTranslationStatus] = useState<'idle' | 'translating' | 'translated' | 'error'>('idle');
  const [consensus] = useState<{ confidence: number, entropy: number } | null>(null);
  const [elevationData] = useState<{ elevation: number, source: string } | null>(null);
  const [agidData, setAgidData] = useState<any>(null);
  const languageDraftsRef = React.useRef<Record<string, typeof formData>>({});
  const lastPostcodeLookupRef = React.useRef('');
  const previousCountryRef = React.useRef(formData.country);
  const appliedInitialAddressDetailsRef = React.useRef('');

  useEffect(() => {
    if (initialAgid) {
      const decoded = decodeAGID(initialAgid);
      setAgidData(decoded);
    }
  }, [initialAgid]);

  useEffect(() => {
    if (!isOpen) {
      appliedInitialAddressDetailsRef.current = '';
      return;
    }

    const details = initialAddressDetails?.address_analysis?.canonical
      ? { ...initialAddressDetails, ...initialAddressDetails.address_analysis.canonical }
      : initialAddressDetails;
    if (!details) return;

    const key = [
      initialAgid,
      details.country_code,
      details.postcode,
      details.building,
      details.building_en,
      details.road || details.street,
      details.house_number || details.houseNumber,
    ].filter(Boolean).join('|');
    if (!key || key === appliedInitialAddressDetailsRef.current) return;
    appliedInitialAddressDetailsRef.current = key;

    setFormData(prev => ({
      ...prev,
      country: String(details.country_code || prev.country).toUpperCase(),
      organization: details.building || details.building_en || details.organization || details.poi || prev.organization,
      street: [
        details.house_number || details.houseNumber,
        details.road || details.street,
      ].filter(Boolean).join(' ') || prev.street,
      city: details.city || details.town || details.village || prev.city,
      state: details.state || details.province || details.region || prev.state,
      postcode: details.postcode || prev.postcode,
      suburb: details.suburb || details.neighbourhood || details.district || prev.suburb,
    }));
  }, [initialAddressDetails, initialAgid, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(normalizeRegistrationAddressLanguage(addressLanguage));
    }
  }, [addressLanguage, isOpen]);

  useEffect(() => {
    const loadFormat = async () => {
      const format = await getAddressFormat(formData.country);
      setLocalFormat(format);
    };
    loadFormat();
  }, [formData.country]);

  useEffect(() => {
    if (previousCountryRef.current === formData.country) return;
    previousCountryRef.current = formData.country;
    languageDraftsRef.current = { [activeTab]: formData };
    lastPostcodeLookupRef.current = '';
    setPostcodeLookupStatus('idle');
    setAddressTranslationStatus('idle');
  }, [activeTab, formData]);

  const addressLanguageTabs = useMemo(
    () => buildRegistrationAddressLanguageTabs(localFormat, formData.country),
    [localFormat, formData.country]
  );

  useEffect(() => {
    if (!addressLanguageTabs.length) return;
    if (!addressLanguageTabs.some(tab => tab.code === activeTab)) {
      setActiveTab(addressLanguageTabs[0].code);
    }
  }, [activeTab, addressLanguageTabs]);

  const t = (key: string) => {
    return UI_STRINGS[registrationUiLanguage]?.[key] || UI_STRINGS['en'][key] || key;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAoidMode && !formData.phone) {
      setError(t('phoneRequired'));
      return;
    }
    onRegister(buildRegisteredAddressRecord(formData, {
      mode: isAoidMode ? 'AOID' : 'ADDRESS',
      id: isAoidMode ? generateAOID() : undefined,
      agid: agidInput || initialAgid,
      coords: currentCoords,
    }));
    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  const renderedAddress = useMemo(() => {
    if (!formData.country) return "";
    const canonical = createCanonicalAddress(formData);
    const renderTab = activeTab === 'en' ? 'intl_en' : activeTab;
    
    // Greater China Specialized Injection
    if (formData.country === 'CN') {
      // Mainland China: Internally store as Simplified
      const simplifiedData = { ...canonical };
      const fields = ['state', 'city', 'district', 'subdistrict', 'road', 'building'] as const;
      fields.forEach(f => {
        if (simplifiedData[f]) simplifiedData[f] = toSimplified(simplifiedData[f]);
      });
      return AddressRenderer.render(renderTab, simplifiedData);
    }
    
    if (['TW', 'HK', 'MO'].includes(formData.country)) {
      // Traditional Regions: Internally store as Traditional
      const traditionalData = { ...canonical };
      const fields = ['state', 'city', 'district', 'subdistrict', 'road', 'building'] as const;
      fields.forEach(f => {
        if (traditionalData[f]) {
          traditionalData[f] = toTraditional(traditionalData[f], formData.country as any);
        }
      });
      return AddressRenderer.render(renderTab, traditionalData);
    }
    
    return AddressRenderer.render(renderTab, canonical);
  }, [formData, activeTab]);

  const currentCountry = React.useMemo(() => {
    return COUNTRIES.find(c => c.code === formData.country);
  }, [formData.country]);

  const countryGroups = useMemo(() => groupRegistrationCountriesByTab(COUNTRIES), []);
  const postcodeInputConfig = useMemo(() => getPostcodeInputConfig(localFormat), [localFormat]);

  useEffect(() => {
    if (!isOpen || !isPostcodeReadyForAutofill(localFormat, formData.postcode)) {
      if (!formData.postcode) setPostcodeLookupStatus('idle');
      return;
    }

    const lookupKey = `${formData.country}:${formData.postcode.trim().toUpperCase()}`;
    if (lookupKey === lastPostcodeLookupRef.current) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      lastPostcodeLookupRef.current = lookupKey;
      setPostcodeLookupStatus('loading');

      try {
        const patch = await lookupPostcodeAutofill(formData.country, formData.postcode);
        if (cancelled) return;

        if (patch) {
          const drafts = await buildPostcodeAutofillLanguageDrafts({
            formData,
            patch,
            countryCode: formData.country,
            languageTabs: addressLanguageTabs.map(tab => tab.code),
          });
          if (cancelled) return;

          setFormData(prev => {
            const merged = mergePostcodeAutofill(prev, patch);
            const next = drafts[activeTab] || drafts[normalizeRegistrationAddressLanguage(activeTab)] || merged;
            languageDraftsRef.current = {
              ...languageDraftsRef.current,
              ...drafts,
              [activeTab]: next,
            };
            return next;
          });
          setPostcodeLookupStatus('filled');
        } else {
          setPostcodeLookupStatus('empty');
        }
      } catch {
        if (!cancelled) setPostcodeLookupStatus('error');
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeTab, addressLanguageTabs, formData, isOpen, localFormat]);

  const handleAddressLanguageTabClick = React.useCallback(async (tabCode: string) => {
    if (tabCode === activeTab) return;

    languageDraftsRef.current[activeTab] = formData;
    const savedDraft = languageDraftsRef.current[tabCode];

    setActiveTab(tabCode);
    if (tabCode === 'local' && savedDraft) {
      setFormData(savedDraft);
      setAddressTranslationStatus('translated');
      return;
    }

    setAddressTranslationStatus('translating');
    try {
      const translated = await translateRegistrationFormFields({
        formData,
        targetLanguage: tabCode,
        countryCode: formData.country,
        sourceLanguage: activeTab,
      });
      languageDraftsRef.current[tabCode] = translated;
      setFormData(translated);
      setAddressTranslationStatus('translated');
    } catch {
      setAddressTranslationStatus('error');
    }
  }, [activeTab, formData]);

  const handlePostcodeChange = React.useCallback((value: string) => {
    lastPostcodeLookupRef.current = '';
    languageDraftsRef.current = {};
    setPostcodeLookupStatus('idle');
    setAddressTranslationStatus('idle');
    setFormData(prev => ({ ...prev, postcode: value }));
  }, []);

  useEffect(() => {
    if (viewMode === 'country-select' && currentCountry) {
      setSelectedCountryTab(getRegistrationCountryTabId(currentCountry));
    }
  }, [viewMode, currentCountry]);

  const isBritishTerritoryMode = BRITISH_TERRITORIES.some(t => t.code === formData.country);
  const isFrenchTerritoryMode = FRENCH_TERRITORIES.some(t => t.code === formData.country);
  const isNorwegianTerritoryMode = NORWEGIAN_TERRITORIES.some(t => t.code === formData.country);
  const isSpanishTerritoryMode = SPANISH_TERRITORIES.some(t => t.code === formData.country);
  const isPortugueseTerritoryMode = PORTUGUESE_TERRITORIES.some(t => t.code === formData.country);
  const isSEAterritoryMode = SOUTHEAST_ASIA_TERRITORIES.some(t => t.code === formData.country);
  const isCETerritoryMode = CENTRAL_EUROPE_TERRITORIES.some(t => t.code === formData.country);
  const isBalkanTerritoryMode = BALKAN_TERRITORIES.some(t => t.code === formData.country);
  const isBalticTerritoryMode = BALTIC_TERRITORIES.some(t => t.code === formData.country);
  const isEurasianTerritoryMode = EURASIAN_TERRITORIES.some(t => t.code === formData.country);
  const isNordicTerritoryMode = NORDIC_TERRITORIES.some(t => t.code === formData.country);
  const isCSAsianTerritoryMode = CENTRAL_SOUTH_ASIA_TERRITORIES.some(t => t.code === formData.country);
  const isDutchTerritoryMode = DUTCH_TERRITORIES.some(t => t.code === formData.country);
  const isDanishTerritoryMode = DANISH_TERRITORIES.some(t => t.code === formData.country);
  const isAustralianTerritoryMode = AUSTRALIAN_TERRITORIES.some(t => t.code === formData.country);
  const isNewZealandTerritoryMode = NEW_ZEALAND_TERRITORIES.some(t => t.code === formData.country);
  const isUSTerritoryMode = US_TERRITORIES.some(t => t.code === formData.country);
  const isArabicTerritoryMode = ARABIC_TERRITORIES.some(t => t.code === formData.country);
  const isItalianTerritoryMode = ITALIAN_TERRITORIES.some(t => t.code === formData.country);
  const isChileTerritoryMode = CHILE_TERRITORIES.some(t => t.code === formData.country);
  const isMicrostateMode = MICROSTATES_TERRITORIES.some(t => t.code === formData.country);
  const isAnglosphereMode = ANGLOSPHERE_TERRITORIES.some(t => t.code === formData.country);
  const isCanadianTerritoryMode = CANADIAN_TERRITORIES.some(t => t.code === formData.country);
  const isNZTerritoryMode = NEW_ZEALAND_TERRITORIES.some(t => t.code === formData.country);
  const isGermanRegionMode = GERMAN_REGIONS.some(t => t.code === formData.country);
  const isHispanosphereMode = HISPANOSPHERE_TERRITORIES.some(t => t.code === formData.country);
  const isLusosphereMode = LUSOSPHERE_TERRITORIES.some(t => t.code === formData.country);
  const isCaribbeanMode = CARIBBEAN_TERRITORIES.some(t => t.code === formData.country);
  const isOceaniaMode = OCEANIA_TERRITORIES.some(t => t.code === formData.country);
  const isGreaterChinaMode = GREATER_CHINA_TERRITORIES.some(t => t.code === formData.country);
  const isFrancophonieMode = FRANCOPHONIE_TERRITORIES.some(t => t.code === formData.country);

  // Address Smart Fix Logic
  const smartFixes = useMemo(() => {
    const fixes: { label: string, action: () => void, icon: any, type: 'warning' | 'info' }[] = [];

    // 1. Chinese Script Fix
    if (isGreaterChinaMode) {
      const allText = Object.values(formData).join('');
      const script = detectChineseScript(allText);
      const isMainland = formData.country === 'CN';
      
      if (isMainland && (script === 'traditional' || script === 'mixed')) {
        fixes.push({
          label: 'Convert to Simplified Chinese (Mainland Standard)',
          icon: Wand2,
          type: 'warning',
          action: () => {
            const newFields = { ...formData };
            Object.keys(newFields).forEach(k => {
              const key = k as keyof typeof formData;
              if (typeof newFields[key] === 'string' && key !== 'country' && key !== 'phone') {
                newFields[key] = toSimplified(newFields[key] as string) as any;
              }
            });
            setFormData(newFields);
          }
        });
      } else if (!isMainland && (script === 'simplified' || script === 'mixed')) {
        fixes.push({
          label: `Convert to Traditional Chinese (${formData.country} Standard)`,
          icon: Wand2,
          type: 'warning',
          action: () => {
            const newFields = { ...formData };
            Object.keys(newFields).forEach(k => {
              const key = k as keyof typeof formData;
              if (typeof newFields[key] === 'string' && key !== 'country' && key !== 'phone') {
                newFields[key] = toTraditional(newFields[key] as string, formData.country as any) as any;
              }
            });
            setFormData(newFields);
          }
        });
      }
    }

    // 2. Colombia Numbering Fix
    const houseNum = (formData as any).houseNumber || (formData as any).house_number;
    if (formData.country === 'CO' && houseNum && !houseNum.includes('#') && /^\d/.test(houseNum)) {
      fixes.push({
        label: 'Add "#" prefix to house number (Colombia standard)',
        icon: Hash,
        type: 'info',
        action: () => {
          const key = (formData as any).houseNumber ? 'houseNumber' : 'house_number';
          setFormData(prev => ({ ...prev, [key]: `# ${houseNum}` }));
        }
      });
    }

    // 3. Unicode Normalization Fix (Fullwidth characters)
    const hasFullwidth = /[Ａ-Ｚａ-ｚ０-９]/.test(Object.values(formData).join(''));
    if (hasFullwidth) {
      fixes.push({
        label: 'Normalize full-width alphanumeric characters',
        icon: ListFilter,
        type: 'info',
        action: () => {
          const newFields = { ...formData };
          Object.keys(newFields).forEach(k => {
            const key = k as keyof typeof formData;
            if (typeof newFields[key] === 'string') {
              newFields[key] = normalizeAddressText(newFields[key] as string) as any;
            }
          });
          setFormData(newFields);
        }
      });
    }

    return fixes;
  }, [formData, isGreaterChinaMode]);

  const isAnyRegionMode = useMemo(() => {
    return isBritishTerritoryMode || isFrenchTerritoryMode || isNorwegianTerritoryMode || 
           isSpanishTerritoryMode || isPortugueseTerritoryMode || isSEAterritoryMode || 
           isCETerritoryMode || isBalkanTerritoryMode || isBalticTerritoryMode || 
           isEurasianTerritoryMode || isNordicTerritoryMode || isCSAsianTerritoryMode || 
           isDutchTerritoryMode || isDanishTerritoryMode || isAustralianTerritoryMode || 
           isNewZealandTerritoryMode || isUSTerritoryMode || isArabicTerritoryMode || 
           isItalianTerritoryMode || isChileTerritoryMode || isMicrostateMode || 
           isAnglosphereMode || isCanadianTerritoryMode || isNZTerritoryMode || 
           isGermanRegionMode || isHispanosphereMode || isLusosphereMode || 
           isCaribbeanMode || isOceaniaMode || isGreaterChinaMode || isFrancophonieMode;
  }, [
    isBritishTerritoryMode, isFrenchTerritoryMode, isNorwegianTerritoryMode,
    isSpanishTerritoryMode, isPortugueseTerritoryMode, isSEAterritoryMode,
    isCETerritoryMode, isBalkanTerritoryMode, isBalticTerritoryMode,
    isEurasianTerritoryMode, isNordicTerritoryMode, isCSAsianTerritoryMode,
    isDutchTerritoryMode, isDanishTerritoryMode, isAustralianTerritoryMode,
    isNewZealandTerritoryMode, isUSTerritoryMode, isArabicTerritoryMode,
    isItalianTerritoryMode, isChileTerritoryMode, isMicrostateMode,
    isAnglosphereMode, isCanadianTerritoryMode, isNZTerritoryMode,
    isGermanRegionMode, isHispanosphereMode, isLusosphereMode,
    isCaribbeanMode, isOceaniaMode, isGreaterChinaMode, isFrancophonieMode
  ]);

  return (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed inset-0 z-[101] overflow-y-auto bg-white"
          >
            <div
              className="min-h-screen w-full px-4 py-6 sm:px-8 lg:px-12"
              style={{
                paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)',
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)'
              }}
            >
              <div className="mx-auto w-full max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 rounded-2xl">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                      {t('addressRegistration')}
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {viewMode === 'form' ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleRegister} 
                    className="space-y-8"
                  >
                {/* AOID Mode Toggle */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700 font-black text-[10px] uppercase tracking-widest">
                      <ShieldIcon className="w-3 h-3" />
                      {t('registerAoid')}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsAoidMode(!isAoidMode)}
                      className={cn(
                        "relative w-14 h-7 rounded-3xl transition-colors",
                        isAoidMode ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    >
                      <motion.div 
                        animate={{ x: isAoidMode ? 29 : 3 }}
                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-600/80 font-bold leading-relaxed">
                    {t('aoidTip')}
                  </p>
                </div>

                    <div className="space-y-6">
                      {/* Address Rendering Preview (Carrier Label Style) */}
                      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-inner overflow-hidden relative group">
                        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <QrCode className="w-12 h-12" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            renderedAddress ? "bg-emerald-500" : "bg-slate-500"
                          )} />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            {activeTab === 'en' ? 'International Shipping Label' : 'Domestic Delivery Format'}
                          </span>
                        </div>
                        <div className="relative">
                          <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed min-h-[4em] selection:bg-emerald-500/30">
                            {renderedAddress || 'Waiting for input...'}
                          </pre>
                        </div>
                        
                        {/* Regional Logic Tag */}
                        {['CN', 'TW', 'HK', 'MO'].includes(formData.country) && (
                          <div className="mt-4 flex items-center gap-2">
                             <div className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-tight">
                               Modular Chinese Engine Active
                             </div>
                             {formData.country === 'CN' && activeTab !== 'en' && (
                               <div className="text-[9px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-tight">
                                 Simplified Canonical
                               </div>
                             )}
                             {['TW', 'HK', 'MO'].includes(formData.country) && !activeTab.startsWith('en') && (
                               <div className="text-[9px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-tight">
                                 Traditional Canonical
                               </div>
                             )}
                          </div>
                        )}
                      </div>

                        {/* Smart Fix Notification */}
                        <AnimatePresence>
                          {smartFixes.length > 0 && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-4 space-y-2"
                            >
                              {smartFixes.map((fix, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={fix.action}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                    fix.type === 'warning' 
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                  )}
                                >
                                  <fix.icon className="w-4 h-4 shrink-0" />
                                  <span className="text-[11px] font-black tracking-tight">{fix.label}</span>
                                  <div className="ml-auto bg-white/10 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black">
                                    Apply Fix
                                  </div>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                      {/* Language Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Address Language
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          {addressLanguageTabs.map(tab => (
                            <button
                              key={tab.code}
                              type="button"
                              onClick={() => handleAddressLanguageTabClick(tab.code)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black transition-all border",
                                activeTab === tab.code 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                  : "bg-slate-100 text-slate-500 border-slate-100 hover:text-slate-700"
                              )}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                        {addressTranslationStatus === 'translating' && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Translating address fields
                          </div>
                        )}
                        {addressTranslationStatus === 'error' && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500">
                            <AlertCircle className="h-3 w-3" />
                            Translation fallback kept the current fields
                          </div>
                        )}
                      </div>

                      {/* Country Selector */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t('countryRegion')}
                          </label>
                          <button
                            type="button"
                            onClick={() => setViewMode('country-select')}
                            className="w-full bg-slate-50 px-4 py-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-white transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <CountryFlag
                                code={currentCountry?.code || formData.country}
                                name={currentCountry?.name || formData.country || 'Unknown region'}
                                fallback={currentCountry?.flag || '🌐'}
                              />
                              <span className="text-sm font-black text-slate-700">
                                {currentCountry?.name || formData.country}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Territory indicator */}
                              {isAnyRegionMode && (
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Regions</span>
                              )}
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Ordered Fields */}
                  <div className="space-y-6">
                    {localFormat ? (
                      (() => {
                        const currentFormat = selectRegistrationAddressFormat(localFormat, activeTab);
                        const fields = currentFormat?.fields || localFormat.fields || [];
                        
                        return fields.map(field => (
                          <div key={field.key} className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              {field.key === 'postcode' && <Mail className="w-3 h-3" />}
                              {field.key === 'organization' && <Building2 className="w-3 h-3" />}
                              {field.label}
                            </label>
                            {field.key === 'street' || field.key === 'organization' ? (
                              <textarea
                                rows={field.key === 'organization' ? 2 : 3}
                                value={(formData as any)[field.key] || ''}
                                onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                placeholder={field.placeholder}
                                className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                              />
                            ) : field.key === 'postcode' ? (
                              postcodeInputConfig.kind !== 'none' ? (
                                <>
                                  <PostcodeInput
                                    format={postcodeInputConfig.pattern}
                                    value={formData.postcode}
                                    onChange={handlePostcodeChange}
                                    className="flex-wrap"
                                    countryCode={formData.country}
                                    fixedValue={postcodeInputConfig.fixedValue}
                                    source={postcodeInputConfig.source}
                                  />
                                  {postcodeLookupStatus === 'loading' && (
                                    <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Looking up postal code
                                    </div>
                                  )}
                                  {postcodeLookupStatus === 'filled' && (
                                    <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Address fields filled from postal data
                                    </div>
                                  )}
                                  {postcodeLookupStatus === 'empty' && (
                                    <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-amber-600">
                                      <AlertCircle className="h-3 w-3" />
                                      No postal match found
                                    </div>
                                  )}
                                </>
                              ) : (
                                <input
                                  type={field.type || 'text'}
                                  value={(formData as any)[field.key] || ''}
                                  onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                  placeholder={field.placeholder}
                                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                />
                              )
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={(formData as any)[field.key] || ''}
                                onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                                placeholder={field.placeholder}
                                className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                              />
                            )}
                          </div>
                        ));
                      })()
                    ) : (
                      <div className="p-8 text-center text-slate-400">Loading format...</div>
                    )}
                  </div>

                  {/* AGID Metadata Section */}
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                      <AgidIcon className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        AGID Algorithm Metadata
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Mountain Class</div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Mountain className="w-3 h-3 text-slate-400" />
                          {elevationData?.elevation !== undefined ? `Class ${calculateMountainClass(elevationData.elevation)}` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Confidence</div>
                        <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {consensus ? `${(consensus.confidence * 100).toFixed(1)}%` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Entropy</div>
                        <div className="text-xs font-mono text-slate-600">
                          {consensus ? consensus.entropy.toFixed(3) : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Domain</div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {agidData?.domain || 'Standard'}
                        </div>
                      </div>
                    </div>

                    {/* China-specific Coordinate Transformations */}
                    {formData.country === 'CN' && currentCoords && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100/50">
                          <div className="text-[9px] text-amber-600 font-black uppercase mb-1">GCJ-02 (Amap/Tencent)</div>
                          <div className="text-[10px] font-mono font-bold text-amber-800">
                            {(() => {
                              const transformed = wgs84togcj02(currentCoords.lon, currentCoords.lat);
                              return `${transformed[1].toFixed(5)}, ${transformed[0].toFixed(5)}`;
                            })()}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100/50">
                          <div className="text-[9px] text-blue-600 font-black uppercase mb-1">BD-09 (Baidu Maps)</div>
                          <div className="text-[10px] font-mono font-bold text-blue-800">
                            {(() => {
                              const transformed = wgs84tobd09(currentCoords.lon, currentCoords.lat);
                              return `${transformed[1].toFixed(5)}, ${transformed[0].toFixed(5)}`;
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                    <div className="pt-6">
                      <button 
                        type="submit"
                        className={cn(
                          "w-full py-5 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95",
                          isAoidMode 
                            ? "bg-slate-900 text-white shadow-slate-200" 
                            : "bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700"
                        )}
                      >
                        {isAoidMode ? <ShieldIcon className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        {isAoidMode ? t('registerAsAoid') : t('registerAddress')}
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="country-select"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 min-h-[500px]"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <button 
                        onClick={() => setViewMode('form')}
                        className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                      </button>
                      <div>
                        <h3 className="text-xl font-black text-slate-800">Select Country / Region</h3>
                        <p className="text-xs font-bold text-slate-400">Choose the destination for this address</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Main Countries */}
                      <div className="space-y-4">
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                          {REGISTRATION_COUNTRY_TABS.map(tab => {
                            const count = countryGroups[tab.id].length;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSelectedCountryTab(tab.id)}
                                className={cn(
                                  "shrink-0 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all",
                                  selectedCountryTab === tab.id
                                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                    : "bg-white text-slate-500 border-slate-100 hover:border-emerald-200 hover:text-emerald-700"
                                )}
                              >
                                {tab.label}
                                <span className={cn(
                                  "ml-2 rounded-md px-1.5 py-0.5 text-[9px]",
                                  selectedCountryTab === tab.id ? "bg-white/15 text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                          {REGISTRATION_COUNTRY_TABS.find(tab => tab.id === selectedCountryTab)?.label} Countries / Territories
                        </label>
                        <div
                          className="grid gap-2"
                          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
                        >
                          {countryGroups[selectedCountryTab].map(c => (
                            <button
                              key={c.code}
                              onClick={() => {
                                setFormData(selectRegistrationCountry(formData, c, { storeRegionName: false }));
                                setViewMode('form');
                              }}
                              className={cn(
                                "flex items-center justify-between gap-3 p-3 rounded-lg border transition-all group",
                                formData.country === c.code
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg"
                                  : "bg-slate-50 border-slate-100 hover:bg-white hover:border-emerald-200"
                              )}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <CountryFlag
                                  code={c.code}
                                  name={c.name}
                                  fallback={c.flag}
                                  selected={formData.country === c.code}
                                />
                                <div className="min-w-0 text-left">
                                  <span className={cn(
                                    "block truncate text-xs font-black",
                                    formData.country === c.code ? "text-white" : "text-slate-700"
                                  )}>
                                    {c.name}
                                  </span>
                                  {c.nativeName && c.nativeName !== c.name && (
                                    <span className={cn(
                                      "block truncate text-[10px] font-bold",
                                      formData.country === c.code ? "text-emerald-50" : "text-slate-400"
                                    )}>
                                      {c.nativeName}
                                    </span>
                                  )}
                                  <span className={cn(
                                    "block truncate text-[9px] font-black uppercase tracking-wider",
                                    formData.country === c.code ? "text-emerald-100" : "text-slate-300"
                                  )}>
                                    {c.region}{c.type ? ` / ${c.type}` : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className={cn(
                                  "rounded-md px-2 py-1 text-[10px] font-black",
                                  formData.country === c.code ? "bg-white/15 text-white" : "bg-white text-slate-400"
                                )}>
                                  {c.code}
                                </span>
                                <CheckCircle2 className={cn(
                                  "w-4 h-4 transition-opacity",
                                  formData.country === c.code ? "opacity-100" : "opacity-0"
                                )} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );
};
