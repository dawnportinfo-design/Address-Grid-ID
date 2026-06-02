export type AddressReferenceMatch = {
  source: string;
  confidence: number;
  [key: string]: unknown;
};

export type AddressAnalysisDetails = {
  sources?: string[];
  referenceMatches?: AddressReferenceMatch[];
  [key: string]: unknown;
};

export type AddressDetails = {
  country?: string;
  country_code?: string;
  city?: string;
  state?: string;
  address_analysis?: AddressAnalysisDetails;
  openaddresses_matches?: AddressReferenceMatch[];
  [key: string]: unknown;
};
